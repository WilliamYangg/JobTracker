-- Run this in your Supabase SQL Editor to set up the database

-- Applications table
create table if not exists applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  company_name text not null,
  job_title text default '',
  type text check (type in ('intern', 'grad')) default 'grad',
  status text check (status in (
    'not yet applied',
    'applied',
    'done OA',
    'behavioural int',
    'technical int',
    'final round',
    'waiting on offer'
  )) default 'not yet applied',
  logo_url text,
  notes text default '',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table applications enable row level security;

drop policy if exists "Users can manage own applications" on applications;
create policy "Users can manage own applications"
  on applications for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Create storage bucket for logos (create manually in Dashboard > Storage if this fails)
insert into storage.buckets (id, name, public) values ('logos', 'logos', true)
  on conflict (id) do nothing;

-- Storage policies for logos
drop policy if exists "Users can upload own logos" on storage.objects;
create policy "Users can upload own logos"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'logos');

drop policy if exists "Users can update own logos" on storage.objects;
create policy "Users can update own logos"
  on storage.objects for update to authenticated
  using (bucket_id = 'logos');

drop policy if exists "Logos are publicly readable" on storage.objects;
create policy "Logos are publicly readable"
  on storage.objects for select
  using (bucket_id = 'logos');

-- Trigger to update updated_at
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger applications_updated_at
  before update on applications
  for each row execute function update_updated_at();
