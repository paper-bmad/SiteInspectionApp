-- Compliance queries and reports for BuildwellAI
create table if not exists compliance_queries (
  id uuid default uuid_generate_v4() primary key,
  project_id uuid references projects(id) on delete set null,
  user_id uuid references auth.users(id) on delete cascade,
  building_use text not null,
  construction_type text not null,
  number_of_storeys integer not null,
  floor_area_m2 integer not null,
  occupancy_estimate integer not null,
  has_basement boolean not null default false,
  has_atrium boolean not null default false,
  domains text[] not null,
  additional_context text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists compliance_reports (
  id uuid default uuid_generate_v4() primary key,
  query_id uuid references compliance_queries(id) on delete cascade,
  project_id uuid references projects(id) on delete set null,
  user_id uuid references auth.users(id) on delete cascade,
  overall_status text not null check (overall_status in ('compliant', 'non_compliant', 'requires_review')),
  domains jsonb not null default '[]',
  recommendations text[] not null default '{}',
  regulation_documents text[] not null default '{}',
  generated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS policies: users can only see their own queries and reports
alter table compliance_queries enable row level security;
alter table compliance_reports enable row level security;

create policy "Users can insert own queries"
  on compliance_queries for insert
  with check (auth.uid() = user_id);

create policy "Users can view own queries"
  on compliance_queries for select
  using (auth.uid() = user_id);

create policy "Users can insert own reports"
  on compliance_reports for insert
  with check (auth.uid() = user_id);

create policy "Users can view own reports"
  on compliance_reports for select
  using (auth.uid() = user_id);
