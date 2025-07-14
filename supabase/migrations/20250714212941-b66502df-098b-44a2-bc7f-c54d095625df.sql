-- Create messages table for chat history
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  session_id TEXT NOT NULL,
  message TEXT NOT NULL,
  sender TEXT NOT NULL CHECK (sender IN ('user', 'tudinha')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Create policies for messages
CREATE POLICY "Users can view their own messages" 
ON public.messages 
FOR SELECT 
USING (true); -- Allow reading all messages for now

CREATE POLICY "Users can create messages" 
ON public.messages 
FOR INSERT 
WITH CHECK (true); -- Allow creating messages for now

-- Create index for better performance
CREATE INDEX idx_messages_user_session ON public.messages(user_id, session_id);
CREATE INDEX idx_messages_created_at ON public.messages(created_at);