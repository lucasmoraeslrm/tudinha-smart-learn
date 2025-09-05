import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.53.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Student-chat function called:', req.method);
    const body = await req.json();
    console.log('Request body:', body);
    
    const { action, token, ...payload } = body;
    console.log('Action:', action, 'Token:', token);
    
    // Validate student token
    console.log('Validating student token...');
    
    // First, let's see what's in student_auth table
    const { data: allStudentAuth, error: debugError } = await supabase
      .from('student_auth')
      .select('codigo, student_id')
      .limit(5);
    
    console.log('Debug - All student_auth entries:', allStudentAuth, 'Error:', debugError);
    
    const { data: studentData, error: authError } = await supabase
      .from('student_auth')
      .select(`
        student_id,
        students!inner(
          id, name, codigo, escola_id,
          escolas!inner(id, nome, codigo)
        )
      `)
      .eq('codigo', token)
      .maybeSingle();

    console.log('Student auth query result:', { studentData, authError });

    if (authError) {
      console.log('Database error during student validation:', authError);
      return new Response(JSON.stringify({ error: 'Database error', details: authError.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!studentData) {
      console.log('No student found with codigo:', token);
      return new Response(JSON.stringify({ error: 'Student not found', codigo: token }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const student = studentData.students;
    const userId = `student_${student.codigo}`;

    switch (action) {
      case 'list_chats':
        return await listChats(userId);
      
      case 'create_chat':
        return await createChat(userId, payload.title || 'Novo chat');
      
      case 'load_messages':
        return await loadMessages(payload.chatId, userId);
      
      case 'send_message':
        return await sendMessage(payload, student, userId);
      
      case 'rename_chat':
        return await renameChat(payload.chatId, payload.title, userId);
      
      case 'delete_chat':
        return await deleteChat(payload.chatId, userId);
      
      default:
        return new Response(JSON.stringify({ error: 'Invalid action' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
  } catch (error) {
    console.error('Error in student-chat function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function listChats(userId: string) {
  const { data, error } = await supabase
    .from('chats')
    .select('*')
    .eq('user_id', userId)
    .is('deleted_at', null)
    .order('last_message_at', { ascending: false });

  if (error) throw error;

  return new Response(JSON.stringify({ chats: data || [] }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function createChat(userId: string, title: string) {
  const { data, error } = await supabase
    .from('chats')
    .insert([{ user_id: userId, title }])
    .select()
    .single();

  if (error) throw error;

  return new Response(JSON.stringify({ chat: data }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function loadMessages(chatId: string, userId: string) {
  // Verify chat ownership
  const { data: chat, error: chatError } = await supabase
    .from('chats')
    .select('user_id')
    .eq('id', chatId)
    .single();

  if (chatError || chat?.user_id !== userId) {
    throw new Error('Chat not found or access denied');
  }

  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('chat_id', chatId)
    .order('created_at', { ascending: true });

  if (error) throw error;

  return new Response(JSON.stringify({ messages: data || [] }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function sendMessage(payload: any, student: any, userId: string) {
  const { chatId, text, attachmentUrl, attachmentType, attachmentName } = payload;

  // Verify chat ownership
  const { data: chat, error: chatError } = await supabase
    .from('chats')
    .select('user_id')
    .eq('id', chatId)
    .single();

  if (chatError || chat?.user_id !== userId) {
    throw new Error('Chat not found or access denied');
  }

  // Save user message
  const { data: userMessage, error: messageError } = await supabase
    .from('messages')
    .insert([{
      chat_id: chatId,
      user_id: userId,
      session_id: `student_${student.codigo}`,
      message: text,
      sender: 'user',
      attachment_url: attachmentUrl,
      attachment_type: attachmentType,
      attachment_name: attachmentName,
    }])
    .select()
    .single();

  if (messageError) throw messageError;

  // Get webhook URL for the school
  const { data: webhookData, error: webhookError } = await supabase
    .from('webhooks')
    .select('url_teste, modo_producao, url_producao')
    .eq('escola_id', student.escola_id)
    .eq('tipo', 'chat')
    .eq('ativo', true)
    .single();

  if (!webhookError && webhookData) {
    const webhookUrl = webhookData.modo_producao ? webhookData.url_producao : webhookData.url_teste;
    
    // Prepare webhook payload in the user's specified format
    const webhookPayload: any = {
      user_id: userId,
      chat_id: chatId,
      nome: student.name,
      message: text || '',
    };

    // Add image URL if present (create signed URL for webhook)
    if (attachmentUrl) {
      try {
        const { data: signedUrlData } = await supabase.storage
          .from('chat-uploads')
          .createSignedUrl(attachmentUrl.split('/').pop(), 604800); // 7 days TTL

        if (signedUrlData?.signedUrl) {
          webhookPayload.imageUrl = signedUrlData.signedUrl;
        }
      } catch (signError) {
        console.error('Error creating signed URL:', signError);
        // Continue without signed URL
      }
    }

    // Send to webhook
    try {
      const webhookResponse = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(webhookPayload),
      });

      const responseText = await webhookResponse.text();
      console.log('Webhook response:', responseText);

      // Save bot response
      if (responseText && responseText.trim()) {
        await supabase
          .from('messages')
          .insert([{
            chat_id: chatId,
            user_id: userId,
            session_id: `student_${student.codigo}`,
            message: responseText,
            sender: 'tudinha',
          }]);
      }
    } catch (webhookError) {
      console.error('Webhook error:', webhookError);
      // Save fallback message
      await supabase
        .from('messages')
        .insert([{
          chat_id: chatId,
          user_id: userId,
          session_id: `student_${student.codigo}`,
          message: 'Desculpe, ocorreu um erro temporário. Tente novamente.',
          sender: 'tudinha',
        }]);
    }
  }

  return new Response(JSON.stringify({ message: userMessage }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function renameChat(chatId: string, title: string, userId: string) {
  const { error } = await supabase
    .from('chats')
    .update({ title })
    .eq('id', chatId)
    .eq('user_id', userId);

  if (error) throw error;

  return new Response(JSON.stringify({ success: true }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function deleteChat(chatId: string, userId: string) {
  const { error } = await supabase
    .from('chats')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', chatId)
    .eq('user_id', userId);

  if (error) throw error;

  return new Response(JSON.stringify({ success: true }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}