INSERT INTO public.users(firstname, lastname, email, pwd)
VALUES ($1, $2, $3, $4)
RETURNING id;