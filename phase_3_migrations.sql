-- 1. Create the warehouses table
CREATE TABLE IF NOT EXISTS warehouses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  location TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Add warehouse_id foreign key reference to the products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS warehouse_id UUID REFERENCES warehouses(id) ON DELETE SET NULL;

-- 3. Ensure 'viewer', 'manager', 'admin' roles can be supported.
-- Typically, role is just a text field in user_roles.
