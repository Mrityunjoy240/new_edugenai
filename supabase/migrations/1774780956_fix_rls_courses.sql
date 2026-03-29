-- Check existing policies
SELECT * FROM pg_policies WHERE tablename = 'courses';

-- Drop the restrictive policy if it exists
DROP POLICY IF EXISTS "Users can create courses" ON courses;

-- Create a proper policy for notebook creation
CREATE POLICY "Users can create own courses" ON courses
  FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Ensure users can read their own courses
CREATE POLICY IF NOT EXISTS "Users can read own courses" ON courses
  FOR SELECT USING (auth.uid() = created_by OR is_published = true);

-- Allow users to update their own courses
CREATE POLICY IF NOT EXISTS "Users can update own courses" ON courses
  FOR UPDATE USING (auth.uid() = created_by);

-- Allow users to delete their own courses
CREATE POLICY IF NOT EXISTS "Users can delete own courses" ON courses
  FOR DELETE USING (auth.uid() = created_by);
