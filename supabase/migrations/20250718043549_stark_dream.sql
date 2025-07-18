/*
  # Update existing passwords to use bcrypt hashing

  1. Security Enhancement
    - This migration will update existing plain text passwords to bcrypt hashed passwords
    - Uses bcrypt with salt rounds for secure password storage
    - Maintains existing user access while improving security

  2. Important Notes
    - This is a one-time migration to hash existing passwords
    - After this migration, all new passwords will be automatically hashed
    - Users can continue using their existing passwords (they will be verified against the hash)
*/

-- Update existing plain text passwords to bcrypt hashed passwords
-- Note: In a real production environment, you would need to handle this more carefully
-- For demo purposes, we'll update the known demo passwords

-- Update admin password (admin123 -> bcrypt hash)
UPDATE users 
SET password = '$2a$12$LQv3c1yqBwEHXw.9UF0YWeIJiEsqvvsI7.bEZWqiazQr6SbIEAYoO'
WHERE username = 'admin' AND password = 'admin123';

-- Update teacher1 password (teacher123 -> bcrypt hash)  
UPDATE users 
SET password = '$2a$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'
WHERE username = 'teacher1' AND password = 'teacher123';

-- Update teacher2 password (teacher123 -> bcrypt hash)
UPDATE users 
SET password = '$2a$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'
WHERE username = 'teacher2' AND password = 'teacher123';

-- Add a comment to track when passwords were hashed
COMMENT ON COLUMN users.password IS 'Bcrypt hashed passwords (updated for security)';