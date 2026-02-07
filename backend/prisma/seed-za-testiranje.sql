-- ============================================================
-- Seed za testiranje – POKRENI CEO FAJL OD POČETKA DO KRAJA (Ctrl+A, F5)
-- Lozinka za sve: password
-- ============================================================
-- 0) Očisti SVE podatke (redosled zbog stranih ključeva), pa seed ubacuje sve iznova
DELETE FROM "ContainerItem";
DELETE FROM "Container";
DELETE FROM "Product";
DELETE FROM "Collaboration";
DELETE FROM "Category";
DELETE FROM "User";
-- ============================================================

-- 1) Kolone u Product (ako nedostaju)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'Product' AND column_name = 'code') THEN
    ALTER TABLE "Product" ADD COLUMN "code" TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'Product' AND column_name = 'description') THEN
    ALTER TABLE "Product" ADD COLUMN "description" TEXT NOT NULL DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'Product' AND column_name = 'imageUrl') THEN
    ALTER TABLE "Product" ADD COLUMN "imageUrl" TEXT;
  END IF;
END $$;

UPDATE "Product" SET "code" = CONCAT('PRD-', "id") WHERE "code" IS NULL;
ALTER TABLE "Product" ALTER COLUMN "code" SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS "Product_supplierId_code_key" ON "Product"("supplierId", "code");

-- 2) Korisnici (MORA prvo da se ubaci)
INSERT INTO "User" ("email", "passwordHash", "name", "role", "active", "createdAt", "updatedAt")
VALUES
  ('admin@example.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin', 'ADMIN', true, NOW(), NOW()),
  ('supplier@example.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Supplier One', 'SUPPLIER', true, NOW(), NOW()),
  ('supplier2@example.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Supplier Two', 'SUPPLIER', true, NOW(), NOW()),
  ('importer@example.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Importer One', 'IMPORTER', true, NOW(), NOW())
ON CONFLICT ("email") DO NOTHING;

-- 3) Kategorije (MORA posle korisnika, pre proizvoda)
INSERT INTO "Category" ("name", "createdAt", "updatedAt")
VALUES ('Electronics', NOW(), NOW()), ('Clothing', NOW(), NOW()), ('Food', NOW(), NOW())
ON CONFLICT ("name") DO NOTHING;

-- 4) Proizvodi – jedan blok sa promenljivim IDjevima (garantovano ubacuje)
DO $$
DECLARE
  sid1  int;
  sid2  int;
  cid_e int;
  cid_c int;
  cid_f int;
BEGIN
  SELECT id INTO sid1 FROM "User" WHERE email = 'supplier@example.com' LIMIT 1;
  SELECT id INTO sid2 FROM "User" WHERE email = 'supplier2@example.com' LIMIT 1;
  SELECT id INTO cid_e FROM "Category" WHERE name = 'Electronics' LIMIT 1;
  SELECT id INTO cid_c FROM "Category" WHERE name = 'Clothing' LIMIT 1;
  SELECT id INTO cid_f FROM "Category" WHERE name = 'Food' LIMIT 1;
  IF sid1 IS NULL THEN RAISE EXCEPTION 'Nema User supplier@example.com – prvo pokreni korak 2 (Korisnici)'; END IF;
  IF sid2 IS NULL THEN RAISE EXCEPTION 'Nema User supplier2@example.com – prvo pokreni korak 2 (Korisnici)'; END IF;
  IF cid_e IS NULL OR cid_c IS NULL OR cid_f IS NULL THEN RAISE EXCEPTION 'Nema Category Electronics/Clothing/Food – prvo pokreni korak 3 (Kategorije)'; END IF;

  INSERT INTO "Product" ("code", "name", "price", "weight", "length", "width", "height", "description", "imageUrl", "categoryId", "supplierId", "createdAt", "updatedAt")
  VALUES ('PRD-S1-01', 'Laptop 15"', 299.99, 2.5, 35.0, 24.0, 2.0, 'Office laptop, 8GB RAM', NULL, cid_e, sid1, NOW(), NOW())
  ON CONFLICT ("supplierId", "code") DO NOTHING;
  INSERT INTO "Product" ("code", "name", "price", "weight", "length", "width", "height", "description", "imageUrl", "categoryId", "supplierId", "createdAt", "updatedAt")
  VALUES ('PRD-S1-02', 'Wireless Mouse', 29.99, 0.15, 12.0, 6.0, 4.0, 'Ergonomic wireless mouse', NULL, cid_e, sid1, NOW(), NOW())
  ON CONFLICT ("supplierId", "code") DO NOTHING;
  INSERT INTO "Product" ("code", "name", "price", "weight", "length", "width", "height", "description", "imageUrl", "categoryId", "supplierId", "createdAt", "updatedAt")
  VALUES ('PRD-S1-03', 'USB-C Hub', 49.99, 0.2, 10.0, 6.0, 1.5, '7-in-1 USB-C hub', NULL, cid_e, sid1, NOW(), NOW())
  ON CONFLICT ("supplierId", "code") DO NOTHING;
  INSERT INTO "Product" ("code", "name", "price", "weight", "length", "width", "height", "description", "imageUrl", "categoryId", "supplierId", "createdAt", "updatedAt")
  VALUES ('PRD-S2-01', 'Cotton T-Shirt', 19.99, 0.25, 30.0, 25.0, 2.0, 'Unisex cotton t-shirt', NULL, cid_c, sid2, NOW(), NOW())
  ON CONFLICT ("supplierId", "code") DO NOTHING;
  INSERT INTO "Product" ("code", "name", "price", "weight", "length", "width", "height", "description", "imageUrl", "categoryId", "supplierId", "createdAt", "updatedAt")
  VALUES ('PRD-S2-02', 'Winter Jacket', 89.99, 1.2, 60.0, 55.0, 5.0, 'Warm winter jacket', NULL, cid_c, sid2, NOW(), NOW())
  ON CONFLICT ("supplierId", "code") DO NOTHING;
  INSERT INTO "Product" ("code", "name", "price", "weight", "length", "width", "height", "description", "imageUrl", "categoryId", "supplierId", "createdAt", "updatedAt")
  VALUES ('PRD-S2-03', 'Olive Oil 1L', 12.99, 1.0, 8.0, 8.0, 25.0, 'Extra virgin olive oil', NULL, cid_f, sid2, NOW(), NOW())
  ON CONFLICT ("supplierId", "code") DO NOTHING;
  RAISE NOTICE 'Proizvodi ubaceni (6 redova ako nisu postojali).';
END $$;

-- 5) Saradnje
INSERT INTO "Collaboration" ("status", "supplierId", "importerId", "createdAt", "updatedAt")
SELECT 'APPROVED', s.id, i.id, NOW(), NOW()
FROM "User" s, "User" i
WHERE s.email = 'supplier@example.com' AND i.email = 'importer@example.com'
ON CONFLICT ("supplierId", "importerId") DO NOTHING;

INSERT INTO "Collaboration" ("status", "supplierId", "importerId", "createdAt", "updatedAt")
SELECT 'APPROVED', s.id, i.id, NOW(), NOW()
FROM "User" s, "User" i
WHERE s.email = 'supplier2@example.com' AND i.email = 'importer@example.com'
ON CONFLICT ("supplierId", "importerId") DO NOTHING;

-- 6) Kontejneri
INSERT INTO "Container" ("name", "maxWeight", "maxVolume", "maxPrice", "importerId", "createdAt", "updatedAt")
SELECT 'Shipment A', 100.0, 5.0, 5000.00, u.id, NOW(), NOW()
FROM "User" u WHERE u.email = 'importer@example.com';

INSERT INTO "Container" ("name", "maxWeight", "maxVolume", "maxPrice", "importerId", "createdAt", "updatedAt")
SELECT 'Shipment B', 200.0, 10.0, 10000.00, u.id, NOW(), NOW()
FROM "User" u WHERE u.email = 'importer@example.com';

-- 7) Stavke u kontejneru
INSERT INTO "ContainerItem" ("quantity", "containerId", "productId", "createdAt", "updatedAt")
SELECT 2, c.id, p.id, NOW(), NOW()
FROM (SELECT id FROM "Container" WHERE name = 'Shipment A' AND "importerId" = (SELECT id FROM "User" WHERE email = 'importer@example.com') LIMIT 1) c,
     (SELECT id FROM "Product" WHERE "supplierId" = (SELECT id FROM "User" WHERE email = 'supplier@example.com') ORDER BY id LIMIT 1) p;

INSERT INTO "ContainerItem" ("quantity", "containerId", "productId", "createdAt", "updatedAt")
SELECT 1, c.id, p.id, NOW(), NOW()
FROM (SELECT id FROM "Container" WHERE name = 'Shipment A' AND "importerId" = (SELECT id FROM "User" WHERE email = 'importer@example.com') LIMIT 1) c,
     (SELECT id FROM "Product" WHERE "supplierId" = (SELECT id FROM "User" WHERE email = 'supplier@example.com') ORDER BY id OFFSET 1 LIMIT 1) p;
