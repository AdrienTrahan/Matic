SELECT CAST(COUNT(*) AS INT) FROM public.tokens WHERE token = $1 AND user_id = $2 AND refresh_token = $3 AND refresh_expiry > (SELECT current_timestamp AT TIME ZONE 'UTC' AS current_timestamptz)