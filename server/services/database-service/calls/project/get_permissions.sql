SELECT
    CASE 
        WHEN owner_id = $1 THEN 3
        WHEN $1 = ANY(writer_id) THEN 2
        WHEN $1 = ANY(reader_id) THEN 1
        ELSE 0
    END AS result
FROM
    public.projects
WHERE id = $2