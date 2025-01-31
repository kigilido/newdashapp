create table verification_codes (
  id uuid default uuid_generate_v4() primary key,
  phone_number text not null,
  code text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  expires_at timestamp with time zone not null
);

-- Add index for faster lookups
create index idx_verification_codes_phone_number on verification_codes(phone_number);

-- Add RLS policies
alter table verification_codes enable row level security;

-- Allow insert for everyone (needed for sign up)
create policy "Anyone can insert verification codes"
  on verification_codes for insert
  to authenticated, anon
  with check (true);

-- Only allow users to see their own verification codes
create policy "Users can only see their own verification codes"
  on verification_codes for select
  to authenticated, anon
  using (phone_number = current_user);