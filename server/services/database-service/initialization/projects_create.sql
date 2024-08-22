
CREATE TABLE public.projects (
    id SERIAL PRIMARY KEY,
    project_name character varying(24) NOT NULL,
    owner_id integer,
    writer_id integer[] DEFAULT array[]::integer[],
    reader_id integer[] DEFAULT array[]::integer[],
    creation_date timestamptz DEFAULT NOW()
);

ALTER TABLE public.projects OWNER TO postgres;

GRANT ALL ON TABLE public.projects TO "node-backend";
GRANT USAGE ON SEQUENCE public.projects_id_seq TO "node-backend";