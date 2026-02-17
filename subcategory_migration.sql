-- Migration to add sub_category to products
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS sub_category TEXT;

-- For existing items, you might want to set a default or update them
-- UPDATE products SET sub_category = 'Lehengas' WHERE category = 'women' AND sub_category IS NULL;
