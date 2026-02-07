-- Provera: da li postoje User (supplier) i Category (Electronics)?
-- Ako supplier_id ili cat_id budu NULL, prvo pokreni INSERT za User i Category iz fix-product-and-seed.sql
SELECT
  (SELECT id FROM "User" WHERE email = 'supplier@example.com' LIMIT 1) AS supplier_id,
  (SELECT id FROM "Category" WHERE name = 'Electronics' LIMIT 1) AS cat_id;
