-- Allow anyone to create resources (for unauthenticated dashboard)
-- Similar to fire_reports policy which allows anonymous reports

CREATE POLICY "Anyone can create resources" ON resources
  FOR INSERT WITH CHECK (true);

-- Also allow anyone to update resources they created (owner_id is null for anonymous)
CREATE POLICY "Anyone can update unowned resources" ON resources
  FOR UPDATE USING (owner_id IS NULL);
