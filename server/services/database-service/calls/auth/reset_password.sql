WITH updated_password AS (
    UPDATE public.users SET pwd=$2, recovery_code=null, recovery_sent=null, recovery_expiry=null
    WHERE email=$1 AND recovery_code=$3 AND recovery_expiry > (SELECT current_timestamp AT TIME ZONE 'UTC' AS current_timestamptz) AND (recovery_expiry IS NOT NULL) AND (recovery_code IS NOT NULL)
    RETURNING *
)
SELECT COUNT(*), id, company_id FROM updated_password GROUP BY id, company_id;