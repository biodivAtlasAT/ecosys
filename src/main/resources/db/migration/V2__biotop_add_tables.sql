CREATE TABLE IF NOT EXISTS public.projects
(
    id serial NOT NULL,
    name character varying(128) NOT NULL,
	description character varying(1024),
	enabled boolean DEFAULT false,
	citation character varying(512),
	license character varying(128),
	contact character varying(1024),
	geoserver_url character varying(512),
	col_types_code character varying(64),
	col_species_code character varying(64),
	types_filename character varying(512),
	types_col_code_name character varying(64),
	types_col_name_name character varying(64),
	types_color_scheme character varying(512) DEFAULT 'default',
	species_filename character varying(512),
	species_col_code_name character varying(64),
	species_col_name_name character varying(64),
    created timestamp without time zone NOT NULL,
    updated timestamp without time zone DEFAULT null,
    deleted timestamp with time zone DEFAULT null,
	PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.types
(
    id serial NOT NULL,
	project_id integer NOT NULL,
	parent_id integer NOT NULL,
	code character varying(64),
	name character varying(512),
	info_json character varying(2048),
	color character varying(64),
	PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.Species
(
    id serial NOT NULL,
	project_id integer NOT NULL,
	code character varying(64),
	name character varying(512),
	info_json character varying(2048),
	PRIMARY KEY (id)
);


ALTER TABLE IF EXISTS public.types
    ADD CONSTRAINT projects_id_fkey1 FOREIGN KEY (project_id)
    REFERENCES public.projects (id) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION
    NOT VALID;


ALTER TABLE IF EXISTS public.species
    ADD CONSTRAINT projects_id_fkey2 FOREIGN KEY (project_id)
    REFERENCES public.projects (id) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION
    NOT VALID;

create index projects_index1
    on species (project_id);

create index projects_index2
    on types (project_id);

