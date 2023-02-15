CREATE TABLE IF NOT EXISTS public.BT_projects
(
    id serial NOT NULL,
    name character varying(128) NOT NULL,
	enabled boolean DEFAULT false,
	epoch character varying(128),
    area character varying(128),
    resource character varying(32),
    class_id integer NOT NULL DEFAULT -1,
    class_info character varying(128),
    geoserver_workspace character varying(128),
    geoserver_layer character varying(128),
	col_types_code character varying(64),
    col_types_description character varying(128),
	col_species_code character varying(64),
	species_filename character varying(512),
	species_col_code_name character varying(64),
	species_col_name_name character varying(64),
    hierarchy_id integer NOT NULL DEFAULT -1,
    hierarchy_name  character varying(64),  -- when specified as "Sonstige"
    created timestamp without time zone NOT NULL,
    updated timestamp without time zone DEFAULT null,
    deleted timestamp with time zone DEFAULT null,
	PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.BT_classes
(
    id serial NOT NULL,
    description character varying(512),
    filename character varying(512),
    created timestamp without time zone NOT NULL,
    updated timestamp without time zone DEFAULT null,
    deleted timestamp with time zone DEFAULT null,
    PRIMARY KEY (id)
    );

CREATE TABLE IF NOT EXISTS public.BT_hierarchy
(
    id serial NOT NULL,
    parent_id integer NOT NULL DEFAULT -1,
    level_number integer NOT NULL DEFAULT 0,
    project_id integer NOT NULL DEFAULT -1,   --  project id or -1 when standard category
    class_id integer NOT NULL DEFAULT -1,   -- class id
    key_code character varying(64),        -- code of standard list
    mapped_key_code character varying(64), -- original code from geoserver call
    sort_code character varying(128),
    description character varying(512),
    category character varying(128),
    color character varying(32),
    hasData boolean DEFAULT false,
    PRIMARY KEY (id)
    );


CREATE TABLE IF NOT EXISTS public.BT_SpeciesGroups
(
    id serial NOT NULL,
	project_id integer NOT NULL,
	group_code character varying(64),
	description character varying(512),
    filename character varying(512),
	PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.BT_SpeciesJoinGroups
(
    id serial NOT NULL,
    project_id integer NOT NULL,
    group_code character varying(64),
    taxon_id integer NOT null,
    PRIMARY KEY (id)
    );

CREATE TABLE IF NOT EXISTS public.BT_Species
(
    id serial NOT NULL,
    project_id integer NOT NULL,
    taxon_id character varying(64),
    description character varying(512),
    PRIMARY KEY (id)
    );

ALTER TABLE IF EXISTS public.BT_species
    ADD CONSTRAINT projects_id_fkey2 FOREIGN KEY (project_id)
    REFERENCES public.BT_projects (id) MATCH SIMPLE
    ON UPDATE NO ACTION
       ON DELETE NO ACTION
    NOT VALID;

create index IF NOT EXISTS projects_index1
    on public.BT_species (project_id);
