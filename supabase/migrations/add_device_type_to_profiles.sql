-- Migration: Add device_type to profiles table
-- Description: Adds device_type column to store user's preferred device (android or iphone)
-- Date: 2026-01-31

-- Add device_type column to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS device_type TEXT CHECK (device_type IN ('android', 'iphone'));

-- Set default value to 'iphone' for existing users
UPDATE profiles 
SET device_type = 'iphone' 
WHERE device_type IS NULL;

-- Add comment to column
COMMENT ON COLUMN profiles.device_type IS 'User preferred device type for video content (android or iphone)';
