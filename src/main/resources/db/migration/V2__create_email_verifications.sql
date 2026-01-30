create table email_verifications (
    id bigserial primary key,

    user_id bigint not null,
    token varchar(255) not null unique,

    expires_at timestamptz not null,
    verified_at timestamptz,

    created_at timestamptz not null default now(),

    constraint fk_email_verifications_user
        foreign key (user_id)
        references users(id)
        on delete cascade
);
