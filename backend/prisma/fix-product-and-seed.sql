-- 1) Dodaj kolone u Product ako ne postoje (da INSERT sa code/description/imageUrl radi)
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

-- 2) Korisnici (lozinka: password)
INSERT INTO "User" ("email", "passwordHash", "name", "role", "active", "createdAt", "updatedAt")
VALUES
  ('admin@example.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin', 'ADMIN', true, NOW(), NOW()),
  ('supplier@example.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Supplier', 'SUPPLIER', true, NOW(), NOW()),
  ('importer@example.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Importer', 'IMPORTER', true, NOW(), NOW())
ON CONFLICT ("email") DO NOTHING;

-- 3) Kategorije
INSERT INTO "Category" ("name", "createdAt", "updatedAt")
VALUES ('Electronics', NOW(), NOW()), ('Clothing', NOW(), NOW()), ('Food', NOW(), NOW())
ON CONFLICT ("name") DO NOTHING;

-- 4) Proizvodi
INSERT INTO "Product" ("code", "name", "price", "weight", "length", "width", "height", "description", "imageUrl", "categoryId", "supplierId", "createdAt", "updatedAt")
SELECT 'PRD-001', 'Laptop 15"', 299.99, 2.5, 35.0, 24.0, 2.0, 'Office laptop', NULL, c.id, u.id, NOW(), NOW()
FROM "Category" c, "User" u WHERE c.name = 'Electronics' AND u.email = 'supplier@example.com'
ON CONFLICT ("supplierId", "code") DO NOTHING;

INSERT INTO "Product" ("code", "name", "price", "weight", "length", "width", "height", "description", "imageUrl", "categoryId", "supplierId", "createdAt", "updatedAt")
SELECT 'PRD-002', 'Wireless Mouse', 29.99, 0.15, 12.0, 6.0, 4.0, 'Ergonomic mouse', NULL, c.id, u.id, NOW(), NOW()
FROM "Category" c, "User" u WHERE c.name = 'Electronics' AND u.email = 'supplier@example.com'
ON CONFLICT ("supplierId", "code") DO NOTHING;

INSERT INTO "Product" ("code", "name", "price", "weight", "length", "width", "height", "description", "imageUrl", "categoryId", "supplierId", "createdAt", "updatedAt")
SELECT 'PRD-003', 'Cotton T-Shirt', 19.99, 0.25, 30.0, 25.0, 2.0, 'Unisex t-shirt', NULL, c.id, u.id, NOW(), NOW()
FROM "Category" c, "User" u WHERE c.name = 'Clothing' AND u.email = 'supplier@example.com'
ON CONFLICT ("supplierId", "code") DO NOTHING;

-- 5) Saradnja (importer vidi proizvode suppliera)
INSERT INTO "Collaboration" ("status", "supplierId", "importerId", "createdAt", "updatedAt")
SELECT 'APPROVED', s.id, i.id, NOW(), NOW()
FROM "User" s, "User" i
WHERE s.email = 'supplier@example.com' AND i.email = 'importer@example.com'
ON CONFLICT ("supplierId", "importerId") DO NOTHING;

-- 6) Kontejner
INSERT INTO "Container" ("name", "maxWeight", "maxVolume", "maxPrice", "importerId", "createdAt", "updatedAt")
SELECT 'My Container', 100.0, 5.0, 5000.00, u.id, NOW(), NOW()
FROM "User" u WHERE u.email = 'importer@example.com';

-- 7) Stavka u kontejneru
INSERT INTO "ContainerItem" ("quantity", "containerId", "productId", "createdAt", "updatedAt")
SELECT 1, c.id, p.id, NOW(), NOW()
FROM (SELECT id FROM "Container" WHERE name = 'My Container' LIMIT 1) c,
     (SELECT id FROM "Product" LIMIT 1) p;
