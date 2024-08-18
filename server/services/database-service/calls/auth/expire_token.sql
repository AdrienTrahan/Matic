DELETE FROM public.tokens
WHERE refresh_expiry < current_timestamp AT TIME ZONE 'UTC';