SELECT id, project_name FROM public.projects 
WHERE $1 = owner_id OR $1 = ANY(writer_id) OR $1 = ANY(reader_id)