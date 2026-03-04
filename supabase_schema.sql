-- Enable PostGIS for location features
create extension if not exists postgis;

-- 1. ENUMS (Type Safety)
create type user_role as enum ('customer', 'provider');
create type request_status as enum ('searching', 'accepted', 'arrived', 'in_progress', 'completed', 'cancelled');

-- 2. Profiles Table (Extends auth.users)
create table public.profiles (
  id uuid references auth.users not null primary key,
  full_name text,
  role user_role default 'customer',
  phone text,
  avatar_url text,
  email text,
  updated_at timestamp with time zone default now(),
  
  -- Provider specific fields
  is_online boolean default false,
  service_type text, 
  bio text,
  rating decimal(3, 2) default 5.00,
  review_count int default 0,
  last_location geography(Point)
);

-- 3. Services Catalog
create table public.services (
    id text primary key,
    name text not null,
    icon text,
    base_price decimal(10, 2),
    description text
);

insert into public.services (id, name, base_price) values 
('plumber', 'Plumbing', 350.00),
('electrician', 'Electrical', 400.00),
('doctor', 'Doctor Consultation', 800.00),
('ambulance', 'Ambulance', 1500.00),
('cleaner', 'Cleaning', 250.00)
on conflict (id) do nothing;

-- 4. Requests Table
create table public.requests (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  service_id text references public.services(id) not null,
  customer_id uuid references public.profiles(id) not null,
  provider_id uuid references public.profiles(id),
  status request_status default 'searching',
  lat double precision,
  lng double precision,
  address text,
  notes text,
  total_amount decimal(10, 2),
  payment_method text
);

-- 5. Reviews Table
create table public.reviews (
    id uuid default gen_random_uuid() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    request_id uuid references public.requests(id) not null,
    customer_id uuid references public.profiles(id) not null,
    provider_id uuid references public.profiles(id) not null,
    rating int check (rating >= 1 and rating <= 5),
    comment text
);

-- 6. Chat Messages
create table public.messages (
    id uuid default gen_random_uuid() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    request_id uuid references public.requests(id) not null,
    sender_id uuid references public.profiles(id) not null,
    content text not null,
    is_read boolean default false
);

-- 7. INDEXES (Performance)
create index requests_geo_idx on public.requests using GIST (ll_to_earth(lat, lng));
create index profiles_geo_idx on public.profiles using GIST (last_location);
create index requests_status_idx on public.requests (status);
create index requests_customer_idx on public.requests (customer_id);
create index requests_provider_idx on public.requests (provider_id);
create index messages_request_idx on public.messages (request_id);

-- 8. TRIGGERS (Automation)

-- Auto-update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language 'plpgsql';

create trigger update_profiles_updated_at before update on public.profiles
for each row execute procedure update_updated_at_column();

create trigger update_requests_updated_at before update on public.requests
for each row execute procedure update_updated_at_column();

-- Auto-update Provider Rating
create or replace function update_provider_rating()
returns trigger as $$
begin
    update public.profiles
    set 
        rating = (select avg(rating) from public.reviews where provider_id = new.provider_id),
        review_count = (select count(*) from public.reviews where provider_id = new.provider_id)
    where id = new.provider_id;
    return new;
end;
$$ language 'plpgsql';

create trigger on_review_created after insert on public.reviews
for each row execute procedure update_provider_rating();

-- 9. SECURITY (RLS)
alter table public.profiles enable row level security;
alter table public.requests enable row level security;
alter table public.services enable row level security;
alter table public.reviews enable row level security;
alter table public.messages enable row level security;

-- (Policies remain similar but referencing Enums where applicable)
create policy "Public profiles are viewable by everyone" on profiles for select using ( true );
create policy "Users can insert their own profile" on profiles for insert with check ( auth.uid() = id );
create policy "Users can update own profile" on profiles for update using ( auth.uid() = id );

create policy "Services are viewable by everyone" on services for select using ( true );

create policy "Customers can view their own requests" on requests for select using ( auth.uid() = customer_id );
create policy "Providers can view open requests" on requests for select using ( status = 'searching' or auth.uid() = provider_id );
create policy "Customers can create requests" on requests for insert with check ( auth.uid() = customer_id );
create policy "Participants can update requests" on requests for update using ( auth.uid() = customer_id or auth.uid() = provider_id );

create policy "Reviews are viewable by everyone" on reviews for select using ( true );
create policy "Participants can create reviews" on reviews for insert with check ( auth.uid() = customer_id );

create policy "Participants can view messages" on messages for select using ( auth.uid() in (select customer_id from requests where id = request_id) or auth.uid() in (select provider_id from requests where id = request_id) );
create policy "Participants can send messages" on messages for insert with check ( auth.uid() = sender_id );

-- 10. Auth Value Mapper
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, role)
  values (new.id, new.raw_user_meta_data->>'full_name', (new.raw_user_meta_data->>'role')::user_role);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();
