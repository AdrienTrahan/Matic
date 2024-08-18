DELETE FROM public.tokens
WHERE token = $1 AND user_id = $2;