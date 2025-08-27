-- Drop the current permissive SELECT policy
DROP POLICY "Anyone can read shared content with access code" ON public.shared_content;

-- Create a more restrictive SELECT policy that denies all direct access
CREATE POLICY "Deny direct access to shared content" 
ON public.shared_content 
FOR SELECT 
USING (false);

-- Create a secure function to access content by access code
CREATE OR REPLACE FUNCTION public.get_shared_content_by_access_code(p_access_code text)
RETURNS TABLE (
  id uuid,
  expires_at timestamp with time zone,
  created_at timestamp with time zone,
  content_text text,
  file_path text,
  filename text,
  language text,
  access_code text,
  content_type text
) 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Only return content if access code matches and content hasn't expired
  RETURN QUERY
  SELECT 
    sc.id,
    sc.expires_at,
    sc.created_at,
    sc.content_text,
    sc.file_path,
    sc.filename,
    sc.language,
    sc.access_code,
    sc.content_type
  FROM public.shared_content sc
  WHERE sc.access_code = upper(p_access_code)
    AND sc.expires_at > now();
END;
$$;