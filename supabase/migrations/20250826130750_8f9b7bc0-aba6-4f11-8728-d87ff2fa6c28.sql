-- Create storage bucket for shared files
INSERT INTO storage.buckets (id, name, public) VALUES ('shared-files', 'shared-files', false);

-- Create table for shared content
CREATE TABLE public.shared_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  access_code TEXT NOT NULL UNIQUE,
  content_type TEXT NOT NULL CHECK (content_type IN ('file', 'code')),
  content_text TEXT, -- For code content
  file_path TEXT,    -- For file storage path
  filename TEXT,
  language TEXT,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.shared_content ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (anyone can read with valid access code)
CREATE POLICY "Anyone can read shared content with access code" 
ON public.shared_content 
FOR SELECT 
USING (expires_at > now());

-- Create policy for inserting (anyone can share content)
CREATE POLICY "Anyone can create shared content" 
ON public.shared_content 
FOR INSERT 
WITH CHECK (expires_at > now());

-- Create function to clean up expired content
CREATE OR REPLACE FUNCTION public.cleanup_expired_content()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Delete expired content records
  DELETE FROM public.shared_content 
  WHERE expires_at <= now();
END;
$$;

-- Create storage policies for shared files
CREATE POLICY "Anyone can read shared files" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'shared-files');

CREATE POLICY "Anyone can upload shared files" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'shared-files');

-- Create index for faster access code lookups
CREATE INDEX idx_shared_content_access_code ON public.shared_content(access_code);
CREATE INDEX idx_shared_content_expires_at ON public.shared_content(expires_at);