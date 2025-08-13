-- Grant permissions for user_profiles table
GRANT ALL PRIVILEGES ON user_profiles TO authenticated;
GRANT SELECT ON user_profiles TO anon;

-- Create RLS policies for user_profiles
CREATE POLICY "Users can view their own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Check current permissions
SELECT grantee, table_name, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
AND table_name = 'user_profiles'
AND grantee IN ('anon', 'authenticated') 
ORDER BY table_name, grantee;