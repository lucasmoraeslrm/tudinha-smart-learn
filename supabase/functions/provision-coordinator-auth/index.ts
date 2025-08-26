import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, password } = await req.json();

    // Initialize Supabase client with service role key for admin operations
    const supabaseServiceRole = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Initialize regular client for user operations
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    console.log('Checking coordinator credentials for email:', email);

    // Check if coordinator exists in coordenadores table
    const { data: coordenadores, error: coordError } = await supabase
      .from('coordenadores')
      .select('*')
      .eq('email', email)
      .eq('ativo', true);

    if (coordError) {
      console.error('Error checking coordinator:', coordError);
      throw coordError;
    }

    if (!coordenadores || coordenadores.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Coordinator not found' }), 
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const coordinator = coordenadores[0];

    // Verify password (assuming it's stored as plaintext for now - in production should be hashed)
    if (password !== coordinator.password_hash) {
      return new Response(
        JSON.stringify({ error: 'Invalid password' }), 
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Coordinator verified, creating auth user...');

    // Create user in Supabase Auth using service role
    const { data: authData, error: authError } = await supabaseServiceRole.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
      user_metadata: {
        full_name: coordinator.nome,
        role: 'coordinator',
        coordinator_id: coordinator.id,
        escola_id: coordinator.escola_id
      }
    });

    if (authError) {
      console.error('Error creating auth user:', authError);
      
      // If user already exists but was created with different role, update it
      if (authError.message?.includes('already registered')) {
        const { data: existingUser, error: getUserError } = await supabaseServiceRole.auth.admin.getUserByEmail(email);
        
        if (!getUserError && existingUser?.user) {
          // Update existing user
          const { error: updateError } = await supabaseServiceRole.auth.admin.updateUserById(
            existingUser.user.id,
            {
              user_metadata: {
                full_name: coordinator.nome,
                role: 'coordinator',
                coordinator_id: coordinator.id,
                escola_id: coordinator.escola_id
              }
            }
          );
          
          if (updateError) {
            console.error('Error updating existing user:', updateError);
            throw updateError;
          }

          // Update profile if it exists
          const { error: profileError } = await supabase
            .from('profiles')
            .upsert({
              user_id: existingUser.user.id,
              full_name: coordinator.nome,
              role: 'coordinator',
              escola_id: coordinator.escola_id
            });

          if (profileError) {
            console.error('Error updating profile:', profileError);
          }

          console.log('Successfully updated existing user');
          return new Response(
            JSON.stringify({ 
              success: true, 
              message: 'User updated and ready for login',
              user_id: existingUser.user.id 
            }), 
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }
      }
      
      throw authError;
    }

    if (!authData?.user) {
      throw new Error('Failed to create user');
    }

    console.log('Auth user created, creating profile...');

    // Create profile
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        user_id: authData.user.id,
        full_name: coordinator.nome,
        role: 'coordinator',
        escola_id: coordinator.escola_id
      });

    if (profileError) {
      console.error('Error creating profile:', profileError);
      // Don't throw here, user creation succeeded
    }

    console.log('Coordinator provisioned successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Coordinator provisioned successfully',
        user_id: authData.user.id 
      }), 
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in provision-coordinator-auth function:', error);
    return new Response(
      JSON.stringify({ error: error.message }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});