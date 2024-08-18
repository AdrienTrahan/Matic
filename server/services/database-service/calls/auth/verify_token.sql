SELECT * FROM public.tokens 
WHERE token = $1 AND expiry > (SELECT current_timestamp AT TIME ZONE 'UTC' AS current_timestamptz)
LIMIT 1