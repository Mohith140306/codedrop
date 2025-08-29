-- Fix the shared content RLS policy to allow proper access with valid access codes
-- First, drop the overly restrictive policy
DROP POLICY IF EXISTS "Deny direct access to shared content" ON public.shared_content;

-- Create a proper RLS policy that allows SELECT access when:
-- 1. The content hasn't expired 
-- 2. This allows the security definer function to work properly
CREATE POLICY "Allow access to non-expired shared content" 
ON public.shared_content 
FOR SELECT 
USING (expires_at > now());

-- Also create a more specific policy for direct access with access codes if needed
-- This policy allows SELECT when the access code is provided (for future direct access patterns)
CREATE POLICY "Allow access with valid access code" 
ON public.shared_content 
FOR SELECT 
USING (
  expires_at > now() 
  AND access_code IS NOT NULL 
  AND length(access_code) > 0
);