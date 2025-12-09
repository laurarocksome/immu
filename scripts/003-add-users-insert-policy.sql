-- Add INSERT and UPDATE policies to users table so users can insert/update their own records
CREATE POLICY "Users can insert own data"
ON users
FOR INSERT
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own data"
ON users
FOR UPDATE
USING (auth.uid() = id);

-- Add DELETE policy for user account deletion
CREATE POLICY "Users can delete own data"
ON users
FOR DELETE
USING (auth.uid() = id);
