-- Migration: Set default role to 'student' for new users
-- Description: Ensures all new users are created with 'student' role by default
-- Date: 2026-01-31

-- Update existing users without role to 'student'
UPDATE profiles 
SET role = 'student' 
WHERE role IS NULL OR role = '';

-- Add default value for role column
ALTER TABLE profiles 
ALTER COLUMN role SET DEFAULT 'student';

-- Add comment
COMMENT ON COLUMN profiles.role IS 'User role: admin or student (default: student)';

-- Create function to auto-set role on new user creation
CREATE OR REPLACE FUNCTION set_default_student_role()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role IS NULL OR NEW.role = '' THEN
    NEW.role := 'student';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to run before insert
DROP TRIGGER IF EXISTS ensure_student_role ON profiles;
CREATE TRIGGER ensure_student_role
  BEFORE INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION set_default_student_role();

-- Add constraint to only allow 'admin' or 'student' roles
ALTER TABLE profiles 
DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE profiles 
ADD CONSTRAINT profiles_role_check 
CHECK (role IN ('admin', 'student'));
