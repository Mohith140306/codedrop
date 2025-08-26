-- Fix security linter warning: Function Search Path Mutable
-- Update the cleanup function to have a secure search path
CREATE OR REPLACE FUNCTION public.cleanup_expired_content()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  -- Delete expired content records
  DELETE FROM public.shared_content 
  WHERE expires_at <= now();
END;
$$;