-- Insert your user as an admin
-- Replace 'your-email@example.com' with your actual email
INSERT INTO admin_users (user_id)
SELECT id FROM auth.users WHERE email = 'your-email@example.com'
ON CONFLICT (user_id) DO NOTHING;
