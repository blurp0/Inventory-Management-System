# ✅ Phase 3 Verification Guide — StockFlow IMS

> **Purpose:** Step-by-step instructions to verify every Phase 3 feature works correctly end-to-end.  
> **Covers:** Multi-Warehouse Product Binding · Role Management UI · Full RBAC Enforcement  
> **Last Updated:** 2026-06-30  
> **Prerequisites:** Phase 3 migration SQL must be applied and the dev server must be running.

---

## 📋 Table of Contents

1. [Pre-Flight Checklist](#1-pre-flight-checklist)
2. [Database Migration Verification](#2-database-migration-verification)
3. [Multi-Warehouse Product Binding](#3-multi-warehouse-product-binding)
4. [Role Management UI](#4-role-management-ui)
5. [Full RBAC Enforcement](#5-full-rbac-enforcement)
6. [Cross-Feature Integration Tests](#6-cross-feature-integration-tests)
7. [Final Sign-Off Checklist](#7-final-sign-off-checklist)

---

## 1. Pre-Flight Checklist

Before running any tests, confirm these are ready:

- [ ] Dev server is running: `npm run dev` → `http://localhost:5173`
- [ ] Supabase project is reachable (check `.env.local` has `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`)
- [ ] Phase 3 SQL migration has been applied (see Section 2)
- [ ] You have at least **three test accounts** in Supabase Auth:
  - One assigned role `admin`
  - One assigned role `manager`
  - One assigned role `viewer` (or no row in `user_roles` — defaults to viewer)
- [ ] Browser DevTools Console is open to catch any runtime errors

---

## 2. Database Migration Verification

### 2.1 Run the Migration

Open the **Supabase Dashboard → SQL Editor** and run the contents of `phase_3_migrations.sql`:

```sql
-- 1. Create the warehouses table
CREATE TABLE IF NOT EXISTS warehouses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  location TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Add warehouse_id FK to products
ALTER TABLE products
ADD COLUMN IF NOT EXISTS warehouse_id UUID REFERENCES warehouses(id) ON DELETE SET NULL;
```

### 2.2 Confirm the Schema

Run these queries in the Supabase SQL Editor and verify the results:

```sql
-- Should return a row describing the warehouses table
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' AND table_name = 'warehouses';

-- Should include a 'warehouse_id' column of type 'uuid'
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'products' AND column_name = 'warehouse_id';
```

**Expected:**
- First query returns exactly one row: `warehouses`
- Second query returns: `warehouse_id | uuid`

### 2.3 Confirm RLS on Warehouses

```sql
-- Check if RLS is enabled on warehouses
SELECT relname, relrowsecurity
FROM pg_class
WHERE relname = 'warehouses';
```

> ⚠️ If RLS is not enabled and your project has RLS on all other tables, enable it and add a permissive read policy for authenticated users so the warehouse dropdown populates correctly:
>
> ```sql
> ALTER TABLE warehouses ENABLE ROW LEVEL SECURITY;
>
> CREATE POLICY "Authenticated users can read warehouses"
>   ON warehouses FOR SELECT
>   TO authenticated USING (true);
>
> CREATE POLICY "Admins can manage warehouses"
>   ON warehouses FOR ALL
>   TO authenticated
>   USING (
>     EXISTS (
>       SELECT 1 FROM user_roles
>       WHERE user_id = auth.uid() AND role = 'admin'
>     )
>   );
> ```

---

## 3. Multi-Warehouse Product Binding

### 3.1 Create a Warehouse First

1. Sign in as **admin**
2. Navigate to **Settings → Warehouses** tab
3. Fill in the "Add New Warehouse" form:
   - Name: `Main Warehouse`
   - Location: `Building A, Floor 1`
   - Description: `Primary storage facility`
4. Click **Add Warehouse**

**Expected:**
- ✅ Success toast: `Warehouse "Main Warehouse" added!`
- ✅ New warehouse row appears in the "Existing Warehouses" list immediately
- ✅ Warehouse count increments to `1`

5. Add a second warehouse:
   - Name: `Cold Storage`
   - Location: `Building B, Floor 0`
   - Description: `Temperature-controlled goods`
6. Click **Add Warehouse**

**Expected:**
- ✅ Both warehouses now show in the list

### 3.2 Verify Warehouse Persists in Supabase

Go to **Supabase Dashboard → Table Editor → warehouses**

**Expected:**
- Two rows present with correct `name`, `location`, `description`, and a valid UUID `id`

### 3.3 Assign a Warehouse When Creating a Product

1. Navigate to **Products**
2. Click **+ New Product** (or press `N`)
3. Fill in required fields (name, category, price)
4. Scroll to the **Warehouse** dropdown — it should be populated with:
   - `No Warehouse Assigned` (default)
   - `Main Warehouse — Building A, Floor 1`
   - `Cold Storage — Building B, Floor 0`
5. Select `Main Warehouse — Building A, Floor 1`
6. Click **Add Product**

**Expected:**
- ✅ Product saves successfully
- ✅ No console errors

### 3.4 Verify `warehouse_id` is Persisted

In **Supabase → Table Editor → products**, find the newly created product row.

**Expected:**
- `warehouse_id` column contains the UUID of `Main Warehouse` (not `null`)

### 3.5 Verify Warehouse Populates on Edit

1. Click the **Edit** action on the product just created
2. The **Warehouse** dropdown should pre-select `Main Warehouse — Building A, Floor 1`

**Expected:**
- ✅ Dropdown shows the correct warehouse, not the blank default
- ✅ Changing it to `Cold Storage` and saving updates `warehouse_id` in the DB

### 3.6 Verify "No Warehouse Assigned" Saves `null`

1. Edit the same product
2. Change the Warehouse dropdown back to `No Warehouse Assigned`
3. Save

**Expected:**
- ✅ Product saves successfully
- ✅ `warehouse_id` column in Supabase is now `null`

### 3.7 Delete a Warehouse — Cascade Behavior

1. Go to **Settings → Warehouses**
2. Delete `Main Warehouse` using the trash button

**Expected:**
- ✅ Toast: `Warehouse "Main Warehouse" deleted.`
- ✅ Any products previously assigned to `Main Warehouse` now show `warehouse_id = null` in the DB (enforced by `ON DELETE SET NULL`)
- ✅ No products are deleted

Verify in Supabase SQL:
```sql
SELECT id, name, warehouse_id FROM products WHERE warehouse_id IS NULL;
```

---

## 4. Role Management UI

### 4.1 Verify Tab Visibility by Role

| Account Role | "Warehouses" Tab Visible | "Role Management" Tab Visible |
|:---:|:---:|:---:|
| admin | ✅ Yes | ✅ Yes |
| manager | ❌ No | ❌ No |
| viewer | ❌ No | ❌ No |

**How to test:**
1. Sign in as **admin** → go to Settings → confirm both tabs appear in the sidebar nav
2. Sign out → sign in as **manager** → go to Settings → confirm neither tab appears
3. Sign out → sign in as **viewer** → go to Settings → confirm neither tab appears

### 4.2 Load Users in Role Management Tab

1. Sign in as **admin**
2. Go to **Settings → Role Management**

**Expected:**
- ✅ A "Loading users..." message appears briefly
- ✅ Table renders with all rows from the `user_roles` table
- ✅ Each row shows: truncated User ID, current role badge, and a role `<select>` dropdown
- ✅ The admin's own row shows `(you)` next to the User ID and displays "Cannot change your own role" instead of a dropdown

### 4.3 Change a User's Role

1. In the Role Management table, find a **viewer** user
2. Change their role dropdown from `viewer` to `manager`

**Expected:**
- ✅ Dropdown is briefly disabled while saving
- ✅ Success toast: `Role updated successfully.`
- ✅ The role badge in that row immediately updates from `viewer` to `manager`

### 4.4 Verify Role Change Persists in Supabase

In **Supabase → Table Editor → user_roles**, find the updated user row.

**Expected:**
- `role` column shows `manager`

### 4.5 Verify Role Takes Effect on Next Login

1. Sign out from the admin account
2. Sign in as the user whose role you just changed to `manager`
3. Navigate to **Products**

**Expected:**
- ✅ "Stock In" and "Stock Out" buttons are visible (manager has `canAdjustStock`)
- ✅ "Edit Product" button is visible (manager has `canEditProducts`)
- ✅ "Delete" button is **not** visible (manager does NOT have `canDeleteProducts`)

### 4.6 Verify Access Matrix Reference Table

1. Sign in as **admin**
2. Go to **Settings → Role Management**
3. Scroll down to the "Access Matrix Reference" section

**Expected:**
- ✅ Table renders with 8 capability rows
- ✅ All ✅ / ❌ symbols match the RBAC spec in `SYSTEM_ARCHITECTURE.md`

| Capability | Admin | Manager | Viewer |
|:---|:---:|:---:|:---:|
| View Dashboard & Reports | ✅ | ✅ | ✅ |
| View Product Catalog & Ledger | ✅ | ✅ | ✅ |
| Perform Stock Adjustments | ✅ | ✅ | ❌ |
| Add / Edit Product Details | ✅ | ✅ | ❌ |
| Delete Products | ✅ | ❌ | ❌ |
| Configure System Settings | ✅ | ❌ | ❌ |
| Manage User Roles | ✅ | ❌ | ❌ |
| Execute Bulk CSV Imports | ✅ | ❌ | ❌ |

---

## 5. Full RBAC Enforcement

### 5.1 Admin Role — Full Access

Sign in as **admin** and verify every capability is available:

| Check | Location | Expected |
|:---|:---|:---|
| See Stock In / Stock Out buttons | Products table | ✅ Visible |
| See Edit button | Products table | ✅ Visible |
| See Delete button | Products table | ✅ Visible |
| See Import CSV button | Products page header | ✅ Visible |
| See Settings → Warehouses tab | Settings page | ✅ Visible |
| See Settings → Role Management tab | Settings page | ✅ Visible |

### 5.2 Manager Role — Operator Access

Sign in as **manager** and verify:

| Check | Location | Expected |
|:---|:---|:---|
| See Stock In / Stock Out buttons | Products table | ✅ Visible |
| See Edit button | Products table | ✅ Visible |
| Delete button | Products table | ❌ Hidden |
| Import CSV button | Products page header | ❌ Hidden |
| Settings → Warehouses tab | Settings page | ❌ Hidden |
| Settings → Role Management tab | Settings page | ❌ Hidden |
| Can navigate to `/settings` | Browser URL bar | ✅ Allowed (profile/preferences/security still accessible) |

### 5.3 Viewer Role — Read-Only Access

Sign in as **viewer** and verify:

| Check | Location | Expected |
|:---|:---|:---|
| Stock In / Stock Out buttons | Products table | ❌ Hidden |
| Edit button | Products table | ❌ Hidden |
| Delete button | Products table | ❌ Hidden |
| Import CSV button | Products page header | ❌ Hidden |
| Actions column header | Products table | ❌ Hidden entirely (no actions = no column) |
| Settings → Warehouses tab | Settings page | ❌ Hidden |
| Settings → Role Management tab | Settings page | ❌ Hidden |
| Dashboard, Reports, Transactions | Sidebar nav | ✅ Fully accessible (read-only) |

### 5.4 ProtectedRoute `requireAdmin` Guard

Test that direct URL manipulation is blocked:

1. Sign in as **manager**
2. In the browser address bar, manually navigate to any admin-only route (if you add one later with `<Route element={<ProtectedRoute requireAdmin />}>`)

**Expected:**
- ✅ Immediately redirected to `/dashboard`
- ✅ No flash of the admin page content

### 5.5 ProtectedRoute `requireRole="manager"` Guard

1. Sign in as **viewer**
2. Attempt to access a route guarded with `requireRole="manager"` (if wired into `App.jsx`)

**Expected:**
- ✅ Immediately redirected to `/dashboard`

### 5.6 Unauthenticated Access Guard

1. Sign out completely
2. Try to navigate directly to `http://localhost:5173/products`

**Expected:**
- ✅ Immediately redirected to `/login`
- ✅ After successful login, app routes are accessible normally

---

## 6. Cross-Feature Integration Tests

These tests verify the three Phase 3 features work correctly together.

### 6.1 Warehouse Assignment Respects RBAC

1. Sign in as **viewer**
2. Navigate to Products
3. Attempt to open "Add Product" via pressing `N`

**Expected:**
- ✅ `N` shortcut does nothing OR the button is hidden, since viewers cannot add products
- ✅ No warehouse dropdown is accessible to viewers

### 6.2 Role Change Immediately Affects Warehouse Visibility

1. Sign in as **admin**
2. In **Settings → Role Management**, change a manager user back down to `viewer`
3. Sign out
4. Sign in as that demoted user
5. Go to **Settings**

**Expected:**
- ✅ Warehouses tab is no longer visible
- ✅ Role Management tab is no longer visible
- ✅ The user's role badge in the Settings nav sidebar shows `viewer`

### 6.3 Realtime Product Cache Includes `warehouseId`

1. Sign in as **admin** in Browser Tab 1
2. Open a second browser tab (or incognito) and sign in as **manager**
3. In Tab 1 (admin), create a new product and assign it to `Cold Storage`
4. Switch to Tab 2 (manager)

**Expected:**
- ✅ The new product appears in the manager's Products table via Realtime subscription
- ✅ When manager opens the product for editing, the Warehouse dropdown shows `Cold Storage` pre-selected

### 6.4 Warehouse Deletion Does Not Break Product Load

1. Sign in as **admin**
2. Assign a product to `Cold Storage`
3. Delete `Cold Storage` from Settings → Warehouses
4. Navigate to Products

**Expected:**
- ✅ Products page loads without errors
- ✅ The previously assigned product still appears in the table
- ✅ `warehouse_id` is `null` on that product (set by DB cascade)
- ✅ No console errors about missing warehouse references

---

## 7. Final Sign-Off Checklist

Run through this checklist once all individual sections pass. Check each box only when fully verified.

### 🗄️ Database
- [ ] `warehouses` table exists with correct schema
- [ ] `products.warehouse_id` FK column exists (`uuid`, nullable, `ON DELETE SET NULL`)
- [ ] RLS policies on `warehouses` allow authenticated reads and admin writes

### 📦 Multi-Warehouse Product Binding
- [ ] Warehouse dropdown appears in Add Product form
- [ ] Warehouse dropdown appears in Edit Product form with correct pre-selected value
- [ ] Selecting a warehouse saves `warehouse_id` to Supabase correctly
- [ ] Selecting "No Warehouse Assigned" saves `null` to Supabase
- [ ] Deleting a warehouse sets affected products' `warehouse_id` to `null` (no cascade delete)

### 👥 Role Management UI
- [ ] "Role Management" tab only visible to admin accounts
- [ ] User roles table loads all rows from `user_roles`
- [ ] Admin's own row is read-only (cannot self-demote)
- [ ] Changing another user's role saves to Supabase via `upsert`
- [ ] Role badge in the row updates immediately after save
- [ ] Access Matrix Reference table renders correctly with correct ✅/❌ values

### 🔐 RBAC Enforcement
- [ ] `admin` sees all action buttons (Stock In, Stock Out, Edit, Delete, Import)
- [ ] `manager` sees Stock In, Stock Out, Edit — but NOT Delete or Import
- [ ] `viewer` sees no action buttons; Actions column is fully hidden
- [ ] `admin` and `manager` see Warehouses tab in Settings
- [ ] Only `admin` sees Role Management tab in Settings
- [ ] Unauthenticated requests redirect to `/login`
- [ ] `canManageWarehouses` and `canBulkImport` are correctly exposed from `AuthContext`
- [ ] `ProtectedRoute` supports both `requireAdmin` and `requireRole="manager"` props

### 🔗 Integration
- [ ] Realtime product updates include `warehouseId` in the cache
- [ ] Role changes take effect on next login without requiring a rebuild
- [ ] No console errors across admin, manager, and viewer sessions

---

## 🐛 Troubleshooting Common Issues

| Symptom | Likely Cause | Fix |
|:---|:---|:---|
| Warehouse dropdown is empty | `warehouses` table doesn't exist or RLS is blocking reads | Run migration SQL; check RLS policies |
| `warehouse_id` stays `null` after saving | Migration not applied — column doesn't exist | Run `ALTER TABLE products ADD COLUMN IF NOT EXISTS warehouse_id...` |
| Role Management tab not showing for admin | User's row in `user_roles` has role `viewer` instead of `admin` | Update via Supabase SQL: `UPDATE user_roles SET role = 'admin' WHERE user_id = '<your-uuid>';` |
| Role Management table shows 0 users | `user_roles` table is empty | Insert a row manually: `INSERT INTO user_roles (user_id, role) VALUES ('<uuid>', 'admin');` |
| Viewer can still see action buttons | Stale session — role hasn't refreshed | Sign out and sign back in |
| Delete a warehouse but products disappear | Missing `ON DELETE SET NULL` on FK | Re-run the migration SQL which uses `ON DELETE SET NULL` |
| Build fails after Phase 3 changes | Import error in ProductForm or SettingsPage | Run `npm run build` and check the error — likely a missing import |

---

## 🔍 Quick Supabase SQL Reference

Useful queries to run during verification in the Supabase SQL Editor:

```sql
-- List all warehouses
SELECT * FROM warehouses ORDER BY name;

-- Check which products have a warehouse assigned
SELECT id, name, warehouse_id FROM products WHERE warehouse_id IS NOT NULL;

-- List all user roles
SELECT * FROM user_roles ORDER BY role;

-- Manually set a user as admin (replace with actual UUID)
UPDATE user_roles
SET role = 'admin'
WHERE user_id = '<your-user-uuid>';

-- Insert a role row if it doesn't exist
INSERT INTO user_roles (user_id, role)
VALUES ('<user-uuid>', 'manager')
ON CONFLICT (user_id) DO UPDATE SET role = 'manager';

-- Confirm warehouse_id FK is properly set up
SELECT
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table,
  ccu.column_name AS foreign_column,
  rc.delete_rule
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.referential_constraints AS rc
  ON tc.constraint_name = rc.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON rc.unique_constraint_name = ccu.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name = 'products'
  AND kcu.column_name = 'warehouse_id';
```

---

*StockFlow IMS — Phase 3 Verification Guide | Version 1.0 | 2026-06-30*
