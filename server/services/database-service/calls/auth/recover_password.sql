WITH updated_users AS (
    UPDATE public.users
    SET recovery_code = $2, recovery_expiry=(SELECT current_timestamp AT TIME ZONE 'UTC' + interval '20 minutes' AS timestamptz), recovery_sent=(SELECT current_timestamp AT TIME ZONE 'UTC' AS current_timestamptz)
    WHERE email=$1 AND ((recovery_sent is null) OR (recovery_sent < (SELECT current_timestamp AT TIME ZONE 'UTC' - interval '1 minute' AS timestamptz)))
    RETURNING *
)
SELECT CAST(count(*) AS INTEGER) FROM updated_users;