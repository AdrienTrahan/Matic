INSERT INTO public.projects(project_name, owner_id)
VALUES ($1, $2)
RETURNING id;