-- Initial schema: reviews, submissions, corrections, terrace_events

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  terrace_id text not null,
  rating int not null check (rating between 1 and 5),
  text text,
  token text not null,
  created_at timestamptz default now()
);

-- One review per browser token per terrace
create unique index reviews_terrace_token_idx on public.reviews(terrace_id, token);

alter table public.reviews enable row level security;
create policy "public read" on public.reviews for select using (true);


create table public.submissions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  status text,
  name text not null,
  address text not null,
  neighborhood text,
  terrace_type text,
  cuisine_type text,
  capacity int,
  covered boolean,
  dog_friendly boolean,
  heated boolean,
  website text,
  phone text,
  seasonal_open text,
  seasonal_close text,
  description text,
  submitter_name text,
  submitter_email text,
  submitter_role text,
  instagram text,
  opening_periods jsonb,
  photos text[] not null default '{}'
);

alter table public.submissions enable row level security;


create table public.corrections (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  status text,
  terrace_id text not null,
  terrace_name text not null,
  name text,
  address text,
  neighborhood text,
  terrace_type text,
  cuisine_type text,
  capacity int,
  covered boolean,
  dog_friendly boolean,
  heated boolean,
  website text,
  phone text,
  seasonal_open text,
  seasonal_close text,
  description text,
  submitter_name text,
  submitter_email text,
  submitter_role text,
  instagram text,
  opening_periods jsonb,
  changes jsonb,
  photos text[] not null default '{}'
);

alter table public.corrections enable row level security;


create table public.terrace_events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  terrace_id text not null,
  event_type text not null,
  session_id text,
  device_type text
);

alter table public.terrace_events enable row level security;
