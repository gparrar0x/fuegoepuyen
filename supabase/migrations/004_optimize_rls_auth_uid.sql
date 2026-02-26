-- =============================================================================
-- MIGRATION 004: Optimize RLS policies — wrap auth.uid() with (select ...)
-- =============================================================================
-- Performance: auth.uid() evaluated per-row costs ~171 ms on large tables.
-- (select auth.uid()) is evaluated once per statement → <0.1 ms.
-- Official Supabase benchmark shows ~100× speedup.
-- Ref: https://supabase.com/docs/guides/database/postgres/row-level-security#use-security-definer-functions
-- =============================================================================

-- -----------------------------------------------------------------------
-- TABLE: fire_reports (migration 001)
-- Policy: "Authenticated can create reports"   — uses auth.uid() IS NOT NULL
-- Policy: "Admins can update reports"          — uses auth.uid() in subquery
-- -----------------------------------------------------------------------

-- auth.uid() IS NOT NULL: wrapping avoids per-row evaluation
ALTER POLICY "Authenticated can create reports"
  ON fire_reports
  WITH CHECK ((select auth.uid()) IS NOT NULL OR reported_by IS NULL);

ALTER POLICY "Admins can update reports"
  ON fire_reports
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = (select auth.uid()) AND role IN ('admin', 'verifier'))
  );

-- -----------------------------------------------------------------------
-- TABLE: resources (migration 001)
-- Policy: "Admins can manage resources"
-- -----------------------------------------------------------------------

ALTER POLICY "Admins can manage resources"
  ON resources
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = (select auth.uid()) AND role = 'admin')
  );

-- -----------------------------------------------------------------------
-- TABLE: verifications (migration 001)
-- Policy: "Authenticated can verify"
-- Policy: "Users can update own verification"
-- -----------------------------------------------------------------------

ALTER POLICY "Authenticated can verify"
  ON verifications
  WITH CHECK ((select auth.uid()) = user_id);

ALTER POLICY "Users can update own verification"
  ON verifications
  USING ((select auth.uid()) = user_id);

-- -----------------------------------------------------------------------
-- TABLE: profiles (migration 001)
-- Policy: "Users can update own profile"
-- -----------------------------------------------------------------------

ALTER POLICY "Users can update own profile"
  ON profiles
  USING ((select auth.uid()) = id);
