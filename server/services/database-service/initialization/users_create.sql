
CREATE TABLE public.users (
    id SERIAL PRIMARY KEY,
    firstname character varying(24) NOT NULL,
    lastname character varying(24) NOT NULL,
    email character varying(320) NOT NULL UNIQUE,
    pwd character(60) NOT NULL,
    email_verified boolean DEFAULT false,
    company_id integer[] DEFAULT array[]::integer[],
    recovery_code character(64) DEFAULT NULL,
    recovery_expiry timestamptz DEFAULT NULL,
    recovery_sent timestamptz DEFAULT NULL
);

ALTER TABLE public.users OWNER TO postgres;

GRANT ALL ON TABLE public.users TO "node-backend";
GRANT USAGE ON SEQUENCE public.users_id_seq TO "node-backend";