create table users (
                       id bigserial primary key,
                       email varchar(255) not null unique,
                       password_hash varchar(255) not null,
                       name varchar(100) not null,
                       role varchar(20) not null default 'USER',
                       is_active boolean not null default true,
                       created_at timestamptz not null default now(),
                       updated_at timestamptz not null default now()
);
