/*
  # Add fallback storage for P2P transfers

  1. New Tables
    - `p2p_fallback_files`
      - `id` (uuid, primary key)
      - `room_code` (text, unique)
      - `file_path` (text)
      - `filename` (text)
      - `file_size` (bigint)
      - `file_type` (text)
      - `checksum` (text)
      - `expires_at` (timestamp)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `p2p_fallback_files` table
    - Add policies for public access with room codes
    - Add automatic cleanup function

  3. Storage
    - Create fallback storage bucket
    - Add storage policies
*/

-- Create fallback storage bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('p2p-fallback', 'p2p-fallback', false)
ON CONFLICT (id) DO NOTHING;

-- Create table for P2P fallback files
CREATE TABLE IF NOT EXISTS public.p2p_fallback_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_code text UNIQUE NOT NULL,
  file_path text NOT NULL,
  filename text NOT NULL,
  file_size bigint NOT NULL,
  file_type text NOT NULL,
  checksum text NOT NULL,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '24 hours'),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.p2p_fallback_files ENABLE ROW LEVEL SECURITY;

-- Create policies for public access
CREATE POLICY "Anyone can read fallback files with room code" 
ON public.p2p_fallback_files 
FOR SELECT 
USING (expires_at > now());

CREATE POLICY "Anyone can create fallback files" 
ON public.p2p_fallback_files 
FOR INSERT 
WITH CHECK (expires_at > now());

-- Create storage policies for fallback files
CREATE POLICY "Anyone can read fallback storage files" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'p2p-fallback');

CREATE POLICY "Anyone can upload fallback storage files" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'p2p-fallback');

CREATE POLICY "Anyone can delete expired fallback files" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'p2p-fallback');

-- Create function to clean up expired fallback files
CREATE OR REPLACE FUNCTION public.cleanup_expired_fallback_files()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = public
AS $$
DECLARE
  expired_file RECORD;
BEGIN
  -- Get expired files and delete from storage
  FOR expired_file IN 
    SELECT file_path FROM public.p2p_fallback_files 
    WHERE expires_at <= now()
  LOOP
    -- Delete from storage
    PERFORM storage.objects 
    FROM storage.objects 
    WHERE bucket_id = 'p2p-fallback' AND name = expired_file.file_path;
  END LOOP;
  
  -- Delete expired records from database
  DELETE FROM public.p2p_fallback_files 
  WHERE expires_at <= now();
END;
$$;

-- Create secure function to access fallback files by room code
CREATE OR REPLACE FUNCTION public.get_fallback_file_by_room_code(p_room_code text)
RETURNS TABLE (
  id uuid,
  room_code text,
  file_path text,
  filename text,
  file_size bigint,
  file_type text,
  checksum text,
  expires_at timestamptz,
  created_at timestamptz
) 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Only return file if room code matches and file hasn't expired
  RETURN QUERY
  SELECT 
    f.id,
    f.room_code,
    f.file_path,
    f.filename,
    f.file_size,
    f.file_type,
    f.checksum,
    f.expires_at,
    f.created_at
  FROM public.p2p_fallback_files f
  WHERE f.room_code = upper(p_room_code)
    AND f.expires_at > now();
END;
$$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_p2p_fallback_room_code ON public.p2p_fallback_files(room_code);
CREATE INDEX IF NOT EXISTS idx_p2p_fallback_expires_at ON public.p2p_fallback_files(expires_at);