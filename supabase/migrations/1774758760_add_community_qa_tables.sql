-- Create student_posts table
CREATE TABLE IF NOT EXISTS student_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  topic TEXT,
  category TEXT DEFAULT 'doubt',
  upvotes_count INT DEFAULT 0,
  responses_count INT DEFAULT 0,
  status TEXT DEFAULT 'open',
  is_pinned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by_name TEXT
);

-- Create upvotes table
CREATE TABLE IF NOT EXISTS post_upvotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES student_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- Create post_responses table
CREATE TABLE IF NOT EXISTS post_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES student_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_official BOOLEAN DEFAULT FALSE,
  helpful_count INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  responder_name TEXT,
  responder_role TEXT
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_student_posts_user_id ON student_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_student_posts_course_id ON student_posts(course_id);
CREATE INDEX IF NOT EXISTS idx_student_posts_status ON student_posts(status);
CREATE INDEX IF NOT EXISTS idx_student_posts_created_at ON student_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_post_responses_post_id ON post_responses(post_id);
CREATE INDEX IF NOT EXISTS idx_post_upvotes_post_id ON post_upvotes(post_id);
CREATE INDEX IF NOT EXISTS idx_post_upvotes_user_id ON post_upvotes(user_id);

-- Create RPC function to increment upvotes
CREATE OR REPLACE FUNCTION increment_upvotes(post_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE student_posts SET upvotes_count = upvotes_count + 1 WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create RPC function to decrement upvotes
CREATE OR REPLACE FUNCTION decrement_upvotes(post_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE student_posts SET upvotes_count = GREATEST(upvotes_count - 1, 0) WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add role column to profiles if it doesn't exist
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'student';
