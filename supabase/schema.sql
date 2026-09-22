create extension if not exists pgcrypto;
create table if not exists customers (id uuid primary key default gen_random_uuid(), owner_id uuid not null references auth.users(id), name text not null, company text, phone text, email text, address text, created_at timestamptz default now());
create table if not exists documents (id uuid primary key default gen_random_uuid(), owner_id uuid not null references auth.users(id), customer_id uuid references customers(id) on delete set null, kind text not null check (kind in ('estimate','invoice')), document_number text not null, description text, quantity numeric default 1, unit_price numeric default 0, tax_percent numeric default 0, total numeric default 0, status text default 'draft', notes text, created_at timestamptz default now());
alter table customers enable row level security;
alter table documents enable row level security;
create policy "owners manage customers" on customers for all using (auth.uid()=owner_id) with check (auth.uid()=owner_id);
create policy "owners manage documents" on documents for all using (auth.uid()=owner_id) with check (auth.uid()=owner_id);
