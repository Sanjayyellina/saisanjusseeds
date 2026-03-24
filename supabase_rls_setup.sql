-- =====================================================================================
-- ROW LEVEL SECURITY (RLS) SETUP FOR SAISANJUSSEEDS
-- Run this script in the Supabase SQL Editor to secure the database.
-- =====================================================================================

-- 1. Enable RLS on all tables
ALTER TABLE bins ENABLE ROW LEVEL SECURITY;
ALTER TABLE intakes ENABLE ROW LEVEL SECURITY;
ALTER TABLE dispatches ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance ENABLE ROW LEVEL SECURITY;
ALTER TABLE labor ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- 2. Create Policies for the 'bins' table
-- Allow authenticated users to perform all operations
CREATE POLICY "bins_select_policy" ON bins FOR SELECT TO authenticated USING (true);
CREATE POLICY "bins_insert_policy" ON bins FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "bins_update_policy" ON bins FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "bins_delete_policy" ON bins FOR DELETE TO authenticated USING (true);

-- 3. Create Policies for the 'intakes' table
CREATE POLICY "intakes_select_policy" ON intakes FOR SELECT TO authenticated USING (true);
CREATE POLICY "intakes_insert_policy" ON intakes FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "intakes_update_policy" ON intakes FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "intakes_delete_policy" ON intakes FOR DELETE TO authenticated USING (true);

-- 4. Create Policies for the 'dispatches' table
CREATE POLICY "dispatches_select_policy" ON dispatches FOR SELECT TO authenticated USING (true);
CREATE POLICY "dispatches_insert_policy" ON dispatches FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "dispatches_update_policy" ON dispatches FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "dispatches_delete_policy" ON dispatches FOR DELETE TO authenticated USING (true);

-- 5. Create Policies for the 'maintenance' table
CREATE POLICY "maintenance_select_policy" ON maintenance FOR SELECT TO authenticated USING (true);
CREATE POLICY "maintenance_insert_policy" ON maintenance FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "maintenance_update_policy" ON maintenance FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "maintenance_delete_policy" ON maintenance FOR DELETE TO authenticated USING (true);

-- 6. Create Policies for the 'labor' table
CREATE POLICY "labor_select_policy" ON labor FOR SELECT TO authenticated USING (true);
CREATE POLICY "labor_insert_policy" ON labor FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "labor_update_policy" ON labor FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "labor_delete_policy" ON labor FOR DELETE TO authenticated USING (true);

-- 7. Create Policies for the 'activity_logs' table
CREATE POLICY "activity_logs_select_policy" ON activity_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "activity_logs_insert_policy" ON activity_logs FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "activity_logs_update_policy" ON activity_logs FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "activity_logs_delete_policy" ON activity_logs FOR DELETE TO authenticated USING (true);

-- Note: Ensure that public (anon) roles DO NOT have access to these tables.
-- The above explicitly grants access only to the "authenticated" role.
