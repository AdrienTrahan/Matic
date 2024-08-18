DO $$ 
DECLARE
    rec record;
BEGIN
    -- Drop all tables
    FOR rec IN (SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE 'DROP TABLE IF EXISTS ' || rec.tablename || ' CASCADE';
    END LOOP;

    -- Drop all sequences
    FOR rec IN (SELECT relname FROM pg_catalog.pg_class WHERE relkind = 'S' AND relnamespace = 'public'::regnamespace) LOOP
        EXECUTE 'DROP SEQUENCE IF EXISTS ' || rec.relname || ' CASCADE';
    END LOOP;

    -- Drop all views
    FOR rec IN (SELECT viewname FROM pg_catalog.pg_views WHERE schemaname = 'public') LOOP
        EXECUTE 'DROP VIEW IF EXISTS ' || rec.viewname || ' CASCADE';
    END LOOP;

    -- Drop all functions
    FOR rec IN (SELECT proname FROM pg_catalog.pg_proc WHERE pronamespace = 'public'::regnamespace) LOOP
        EXECUTE 'DROP FUNCTION IF EXISTS ' || rec.proname || ' CASCADE';
    END LOOP;

    -- Drop all types
    FOR rec IN (SELECT typname FROM pg_catalog.pg_type WHERE typnamespace = 'public'::regnamespace) LOOP
        EXECUTE 'DROP TYPE IF EXISTS ' || rec.typname || ' CASCADE';
    END LOOP;

    -- Drop all indexes
    FOR rec IN (SELECT indexname FROM pg_catalog.pg_indexes WHERE schemaname = 'public') LOOP
        EXECUTE 'DROP INDEX IF EXISTS ' || rec.indexname || ' CASCADE';
    END LOOP;
END $$;
