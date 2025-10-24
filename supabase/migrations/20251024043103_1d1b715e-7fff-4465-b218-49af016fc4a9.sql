-- Fix 1: Restrict profiles table access to protect PII
-- Drop the overly permissive public policy
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON profiles;

-- Users can view their own complete profile
CREATE POLICY "Users can view own profile" ON profiles
FOR SELECT
USING (auth.uid() = id);

-- Users can view profiles of conversation participants
CREATE POLICY "Users can view conversation participant profiles" ON profiles
FOR SELECT
USING (
  id IN (
    SELECT cp.user_id
    FROM conversation_participants cp
    WHERE cp.conversation_id IN (
      SELECT conversation_id
      FROM conversation_participants
      WHERE user_id = auth.uid()
    )
  )
);

-- Users can view profiles of their contacts
CREATE POLICY "Users can view contact profiles" ON profiles
FOR SELECT
USING (
  id IN (
    SELECT contact_user_id
    FROM contacts
    WHERE user_id = auth.uid()
  )
);

-- Fix 2: Restrict secrets table to admins only
-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Allow authenticated users to read secrets" ON secrets;

-- Only admins can read secrets
CREATE POLICY "Only admins can read secrets" ON secrets
FOR SELECT
USING (is_admin(auth.uid()));

-- Fix 3: Add user ownership to license_plate_results
-- Add user_id column to track ownership
ALTER TABLE license_plate_results 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Drop overly permissive policies
DROP POLICY IF EXISTS "Allow public read access" ON license_plate_results;
DROP POLICY IF EXISTS "Allow authenticated insert" ON license_plate_results;

-- Users can only view their own results
CREATE POLICY "Users can view own results" ON license_plate_results
FOR SELECT
USING (auth.uid() = user_id);

-- Users can only insert their own results
CREATE POLICY "Users can insert own results" ON license_plate_results
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own results
CREATE POLICY "Users can update own results" ON license_plate_results
FOR UPDATE
USING (auth.uid() = user_id);