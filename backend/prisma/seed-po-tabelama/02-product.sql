-- ============================================================
-- 2) SAMO Product
-- Pokreni POSLE 01-category.sql. Koristi categoryId 1=Electronics, 2=Clothing, 3=Food
-- i supplierId 2, 4, 5, 9, 11. Očekivano: INSERT 0 14 (ili više redova)
-- ============================================================

INSERT INTO "Product" ("code", "name", "price", "weight", "length", "width", "height", "description", "imageUrl", "categoryId", "supplierId", "createdAt", "updatedAt")
VALUES
  ('PRD-2-01', 'Laptop 15"', 299.99, 2.5, 35.0, 24.0, 2.0, 'Office laptop, 8GB RAM', NULL, 1, 2, NOW(), NOW()),
  ('PRD-2-02', 'Wireless Mouse', 29.99, 0.15, 12.0, 6.0, 4.0, 'Ergonomic wireless mouse', NULL, 1, 2, NOW(), NOW()),
  ('PRD-2-03', 'USB-C Hub', 49.99, 0.2, 10.0, 6.0, 1.5, '7-in-1 USB-C hub', NULL, 1, 2, NOW(), NOW()),
  ('PRD-4-01', 'Cotton T-Shirt', 19.99, 0.25, 30.0, 25.0, 2.0, 'Unisex cotton t-shirt', NULL, 2, 4, NOW(), NOW()),
  ('PRD-4-02', 'Winter Jacket', 89.99, 1.2, 60.0, 55.0, 5.0, 'Warm winter jacket', NULL, 2, 4, NOW(), NOW()),
  ('PRD-4-03', 'Denim Jeans', 49.99, 0.6, 40.0, 35.0, 3.0, 'Classic denim', NULL, 2, 4, NOW(), NOW()),
  ('PRD-5-01', 'Olive Oil 1L', 12.99, 1.0, 8.0, 8.0, 25.0, 'Extra virgin olive oil', NULL, 3, 5, NOW(), NOW()),
  ('PRD-5-02', 'Honey 500g', 8.99, 0.55, 8.0, 8.0, 15.0, 'Organic honey', NULL, 3, 5, NOW(), NOW()),
  ('PRD-5-03', 'Keyboard', 59.99, 0.8, 45.0, 15.0, 3.0, 'Mechanical keyboard', NULL, 1, 5, NOW(), NOW()),
  ('PRD-9-01', 'Monitor 24"', 179.99, 4.0, 55.0, 20.0, 40.0, 'Full HD monitor', NULL, 1, 9, NOW(), NOW()),
  ('PRD-9-02', 'Webcam', 45.99, 0.2, 12.0, 4.0, 4.0, '1080p webcam', NULL, 1, 9, NOW(), NOW()),
  ('PRD-11-01', 'Coffee 1kg', 14.99, 1.0, 15.0, 10.0, 20.0, 'Ground coffee', NULL, 3, 11, NOW(), NOW()),
  ('PRD-11-02', 'Tea Box', 6.99, 0.2, 12.0, 8.0, 10.0, 'Assorted tea', NULL, 3, 11, NOW(), NOW());
