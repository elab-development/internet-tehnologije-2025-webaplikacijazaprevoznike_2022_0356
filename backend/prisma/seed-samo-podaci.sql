-- ============================================================
-- SAMO TEST PODACI – prilagođeno tvojim korisnicima
-- Supplieri: 2 (Tester1), 4 (Supplier One), 5 (Supplier Two), 9 (Supplier), 11 (Tule)
-- Importeri: 6 (Importer One), 7 (Importer Two), 10 (Importer), 12 (T)
-- Pokreni: Ctrl+A, F5 u pgAdminu.
-- ============================================================
-- 0) Očisti sve osim Usera (redosled zbog stranih ključeva)
DELETE FROM "ContainerItem";
DELETE FROM "Container";
DELETE FROM "Product";
DELETE FROM "Collaboration";
DELETE FROM "Category";
-- ============================================================

-- 1) Kategorije
INSERT INTO "Category" ("name", "createdAt", "updatedAt")
VALUES ('Electronics', NOW(), NOW()), ('Clothing', NOW(), NOW()), ('Food', NOW(), NOW());

-- 2) Proizvodi (supplieri 2, 4, 5, 9)
DO $$
DECLARE
  cid_e int;
  cid_c int;
  cid_f int;
BEGIN
  SELECT id INTO cid_e FROM "Category" WHERE name = 'Electronics' LIMIT 1;
  SELECT id INTO cid_c FROM "Category" WHERE name = 'Clothing' LIMIT 1;
  SELECT id INTO cid_f FROM "Category" WHERE name = 'Food' LIMIT 1;
  IF cid_e IS NULL OR cid_c IS NULL OR cid_f IS NULL THEN
    RAISE EXCEPTION 'Nema kategorija – prvo pokreni korak 1.';
  END IF;

  -- Supplier 2 – Tester1 (Electronics)
  INSERT INTO "Product" ("code", "name", "price", "weight", "length", "width", "height", "description", "imageUrl", "categoryId", "supplierId", "createdAt", "updatedAt")
  VALUES
    ('PRD-2-01', 'Laptop 15"', 299.99, 2.5, 35.0, 24.0, 2.0, 'Office laptop, 8GB RAM', NULL, cid_e, 2, NOW(), NOW()),
    ('PRD-2-02', 'Wireless Mouse', 29.99, 0.15, 12.0, 6.0, 4.0, 'Ergonomic wireless mouse', NULL, cid_e, 2, NOW(), NOW()),
    ('PRD-2-03', 'USB-C Hub', 49.99, 0.2, 10.0, 6.0, 1.5, '7-in-1 USB-C hub', NULL, cid_e, 2, NOW(), NOW())
  ;

  -- Supplier 4 – Supplier One (Clothing)
  INSERT INTO "Product" ("code", "name", "price", "weight", "length", "width", "height", "description", "imageUrl", "categoryId", "supplierId", "createdAt", "updatedAt")
  VALUES
    ('PRD-4-01', 'Cotton T-Shirt', 19.99, 0.25, 30.0, 25.0, 2.0, 'Unisex cotton t-shirt', NULL, cid_c, 4, NOW(), NOW()),
    ('PRD-4-02', 'Winter Jacket', 89.99, 1.2, 60.0, 55.0, 5.0, 'Warm winter jacket', NULL, cid_c, 4, NOW(), NOW()),
    ('PRD-4-03', 'Denim Jeans', 49.99, 0.6, 40.0, 35.0, 3.0, 'Classic denim', NULL, cid_c, 4, NOW(), NOW())
  ;

  -- Supplier 5 – Supplier Two (Food + Electronics)
  INSERT INTO "Product" ("code", "name", "price", "weight", "length", "width", "height", "description", "imageUrl", "categoryId", "supplierId", "createdAt", "updatedAt")
  VALUES
    ('PRD-5-01', 'Olive Oil 1L', 12.99, 1.0, 8.0, 8.0, 25.0, 'Extra virgin olive oil', NULL, cid_f, 5, NOW(), NOW()),
    ('PRD-5-02', 'Honey 500g', 8.99, 0.55, 8.0, 8.0, 15.0, 'Organic honey', NULL, cid_f, 5, NOW(), NOW()),
    ('PRD-5-03', 'Keyboard', 59.99, 0.8, 45.0, 15.0, 3.0, 'Mechanical keyboard', NULL, cid_e, 5, NOW(), NOW())
  ;

  -- Supplier 9 – Supplier (Electronics)
  INSERT INTO "Product" ("code", "name", "price", "weight", "length", "width", "height", "description", "imageUrl", "categoryId", "supplierId", "createdAt", "updatedAt")
  VALUES
    ('PRD-9-01', 'Monitor 24"', 179.99, 4.0, 55.0, 20.0, 40.0, 'Full HD monitor', NULL, cid_e, 9, NOW(), NOW()),
    ('PRD-9-02', 'Webcam', 45.99, 0.2, 12.0, 4.0, 4.0, '1080p webcam', NULL, cid_e, 9, NOW(), NOW())
  ;

  -- Supplier 11 – Tule (Food)
  INSERT INTO "Product" ("code", "name", "price", "weight", "length", "width", "height", "description", "imageUrl", "categoryId", "supplierId", "createdAt", "updatedAt")
  VALUES
    ('PRD-11-01', 'Coffee 1kg', 14.99, 1.0, 15.0, 10.0, 20.0, 'Ground coffee', NULL, cid_f, 11, NOW(), NOW()),
    ('PRD-11-02', 'Tea Box', 6.99, 0.2, 12.0, 8.0, 10.0, 'Assorted tea', NULL, cid_f, 11, NOW(), NOW())
  ;
END $$;

-- 3) Saradnje (svaki supplier 2,4,5,9,11 sa importerima 6 i 10)
INSERT INTO "Collaboration" ("status", "supplierId", "importerId", "createdAt", "updatedAt")
VALUES
  ('APPROVED', 2, 6, NOW(), NOW()),
  ('APPROVED', 2, 10, NOW(), NOW()),
  ('APPROVED', 4, 6, NOW(), NOW()),
  ('APPROVED', 4, 10, NOW(), NOW()),
  ('APPROVED', 5, 6, NOW(), NOW()),
  ('APPROVED', 5, 10, NOW(), NOW()),
  ('APPROVED', 9, 6, NOW(), NOW()),
  ('APPROVED', 9, 10, NOW(), NOW()),
  ('APPROVED', 11, 6, NOW(), NOW()),
  ('APPROVED', 11, 10, NOW(), NOW());

-- 4) Kontejneri (importeri 6, 7, 10, 12)
INSERT INTO "Container" ("name", "maxWeight", "maxVolume", "maxPrice", "importerId", "createdAt", "updatedAt")
VALUES
  ('Importer One – Shipment A', 100.0, 5.0, 5000.00, 6, NOW(), NOW()),
  ('Importer One – Shipment B', 200.0, 10.0, 10000.00, 6, NOW(), NOW()),
  ('Importer Two – Cargo', 150.0, 8.0, 7500.00, 7, NOW(), NOW()),
  ('Importer – Container 1', 80.0, 4.0, 4000.00, 10, NOW(), NOW()),
  ('Importer – Container 2', 120.0, 6.0, 6000.00, 10, NOW(), NOW()),
  ('T – Small Shipment', 50.0, 2.0, 2500.00, 12, NOW(), NOW());

-- 5) Stavke u kontejnerima
-- Importer 6, Shipment A: proizvodi od suppliera 2 i 4
INSERT INTO "ContainerItem" ("quantity", "containerId", "productId", "createdAt", "updatedAt")
SELECT 2, c.id, p.id, NOW(), NOW()
FROM (SELECT id FROM "Container" WHERE "importerId" = 6 AND name LIKE 'Importer One – Shipment A%' LIMIT 1) c,
     (SELECT id FROM "Product" WHERE "supplierId" = 2 ORDER BY id LIMIT 1) p;

INSERT INTO "ContainerItem" ("quantity", "containerId", "productId", "createdAt", "updatedAt")
SELECT 1, c.id, p.id, NOW(), NOW()
FROM (SELECT id FROM "Container" WHERE "importerId" = 6 AND name LIKE 'Importer One – Shipment A%' LIMIT 1) c,
     (SELECT id FROM "Product" WHERE "supplierId" = 4 ORDER BY id LIMIT 1) p;

-- Importer 6, Shipment B: proizvodi od 5 i 9
INSERT INTO "ContainerItem" ("quantity", "containerId", "productId", "createdAt", "updatedAt")
SELECT 3, c.id, p.id, NOW(), NOW()
FROM (SELECT id FROM "Container" WHERE "importerId" = 6 AND name LIKE 'Importer One – Shipment B%' LIMIT 1) c,
     (SELECT id FROM "Product" WHERE "supplierId" = 5 ORDER BY id LIMIT 1) p;

INSERT INTO "ContainerItem" ("quantity", "containerId", "productId", "createdAt", "updatedAt")
SELECT 1, c.id, p.id, NOW(), NOW()
FROM (SELECT id FROM "Container" WHERE "importerId" = 6 AND name LIKE 'Importer One – Shipment B%' LIMIT 1) c,
     (SELECT id FROM "Product" WHERE "supplierId" = 9 ORDER BY id LIMIT 1) p;

-- Importer 10, Container 1: proizvodi od 2 i 11
INSERT INTO "ContainerItem" ("quantity", "containerId", "productId", "createdAt", "updatedAt")
SELECT 2, c.id, p.id, NOW(), NOW()
FROM (SELECT id FROM "Container" WHERE "importerId" = 10 AND name = 'Importer – Container 1' LIMIT 1) c,
     (SELECT id FROM "Product" WHERE "supplierId" = 2 ORDER BY id OFFSET 1 LIMIT 1) p;

INSERT INTO "ContainerItem" ("quantity", "containerId", "productId", "createdAt", "updatedAt")
SELECT 5, c.id, p.id, NOW(), NOW()
FROM (SELECT id FROM "Container" WHERE "importerId" = 10 AND name = 'Importer – Container 1' LIMIT 1) c,
     (SELECT id FROM "Product" WHERE "supplierId" = 11 ORDER BY id LIMIT 1) p;

-- Importer 12, Small Shipment: proizvod od 11
INSERT INTO "ContainerItem" ("quantity", "containerId", "productId", "createdAt", "updatedAt")
SELECT 4, c.id, p.id, NOW(), NOW()
FROM (SELECT id FROM "Container" WHERE "importerId" = 12 LIMIT 1) c,
     (SELECT id FROM "Product" WHERE "supplierId" = 11 ORDER BY id OFFSET 1 LIMIT 1) p;
