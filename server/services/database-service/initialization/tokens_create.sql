
CREATE TABLE public.tokens (
    id SERIAL PRIMARY KEY,
    token character(129) NOT NULL UNIQUE,
    user_id integer NOT NULL,
    expiry timestamptz NOT NULL,
    refresh_token character(64) NOT NULL UNIQUE,
    refresh_expiry timestamptz NOT NULL
);

ALTER TABLE public.tokens OWNER TO postgres;

GRANT ALL ON TABLE public.tokens TO "node-backend";
GRANT USAGE ON SEQUENCE public.tokens_id_seq TO "node-backend";
