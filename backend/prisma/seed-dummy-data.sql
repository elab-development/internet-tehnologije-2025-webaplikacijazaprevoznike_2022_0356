-- Dummy data za uvoznike aplikaciju. Pokreni na bazi (npr. psql ili pgAdmin).
-- Lozinka za sve test korisnike ispod: password (bcrypt hash u nastavku).

-- 1) Korisnici (ako već imaš admin iz seed.js, ostali će se dodati)
-- bcrypt hash za lozinku "password"
INSERT INTO "User" ("email", "passwordHash", "name", "role", "active", "createdAt", "updatedAt")
VALUES
  ('admin@example.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin', 'ADMIN', true, NOW(), NOW()),
  ('supplier1@example.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Supplier One', 'SUPPLIER', true, NOW(), NOW()),
  ('supplier2@example.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Supplier Two', 'SUPPLIER', true, NOW(), NOW()),
  ('importer1@example.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Importer One', 'IMPORTER', true, NOW(), NOW()),
  ('importer2@example.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Importer Two', 'IMPORTER', true, NOW(), NOW())
ON CONFLICT ("email") DO NOTHING;

-- 2) Kategorije
INSERT INTO "Category" ("name", "createdAt", "updatedAt")
VALUES
  ('Electronics', NOW(), NOW()),
  ('Clothing', NOW(), NOW()),
  ('Food', NOW(), NOW())
ON CONFLICT ("name") DO NOTHING;

-- 3) Proizvodi (supplier1 i supplier2; koriste kategorije po imenu)
INSERT INTO "Product" ("code", "name", "price", "weight", "length", "width", "height", "description", "imageUrl", "categoryId", "supplierId", "createdAt", "updatedAt")
SELECT 'PRD-S1-001', 'Laptop 15"', 299.99, 2.5, 35.0, 24.0, 2.0, 'Office laptop, 8GB RAM', NULL, c.id, u.id, NOW(), NOW()
FROM "Category" c, "User" u WHERE c.name = 'Electronics' AND u.email = 'supplier1@example.com'
ON CONFLICT ("supplierId", "code") DO NOTHING;

INSERT INTO "Product" ("code", "name", "price", "weight", "length", "width", "height", "description", "imageUrl", "categoryId", "supplierId", "createdAt", "updatedAt")
SELECT 'PRD-S1-002', 'Wireless Mouse', 29.99, 0.15, 12.0, 6.0, 4.0, 'Ergonomic wireless mouse', NULL, c.id, u.id, NOW(), NOW()
FROM "Category" c, "User" u WHERE c.name = 'Electronics' AND u.email = 'supplier1@example.com'
ON CONFLICT ("supplierId", "code") DO NOTHING;

INSERT INTO "Product" ("code", "name", "price", "weight", "length", "width", "height", "description", "imageUrl", "categoryId", "supplierId", "createdAt", "updatedAt")
SELECT 'PRD-S1-003', 'USB-C Hub', 49.99, 0.2, 10.0, 6.0, 1.5, '7-in-1 USB-C hub', NULL, c.id, u.id, NOW(), NOW()
FROM "Category" c, "User" u WHERE c.name = 'Electronics' AND u.email = 'supplier1@example.com'
ON CONFLICT ("supplierId", "code") DO NOTHING;

INSERT INTO "Product" ("code", "name", "price", "weight", "length", "width", "height", "description", "imageUrl", "categoryId", "supplierId", "createdAt", "updatedAt")
SELECT 'PRD-S2-001', 'Cotton T-Shirt', 19.99, 0.25, 30.0, 25.0, 2.0, 'Unisex cotton t-shirt', NULL, c.id, u.id, NOW(), NOW()
FROM "Category" c, "User" u WHERE c.name = 'Clothing' AND u.email = 'supplier2@example.com'
ON CONFLICT ("supplierId", "code") DO NOTHING;

INSERT INTO "Product" ("code", "name", "price", "weight", "length", "width", "height", "description", "imageUrl", "categoryId", "supplierId", "createdAt", "updatedAt")
SELECT 'PRD-S2-002', 'Winter Jacket', 89.99, 1.2, 60.0, 55.0, 5.0, 'Warm winter jacket', NULL, c.id, u.id, NOW(), NOW()
FROM "Category" c, "User" u WHERE c.name = 'Clothing' AND u.email = 'supplier2@example.com'
ON CONFLICT ("supplierId", "code") DO NOTHING;

INSERT INTO "Product" ("code", "name", "price", "weight", "length", "width", "height", "description", "imageUrl", "categoryId", "supplierId", "createdAt", "updatedAt")
SELECT 'PRD-S2-003', 'Organic Olive Oil 1L', 12.99, 1.0, 8.0, 8.0, 25.0, 'Extra virgin olive oil', NULL, c.id, u.id, NOW(), NOW()
FROM "Category" c, "User" u WHERE c.name = 'Food' AND u.email = 'supplier2@example.com'
ON CONFLICT ("supplierId", "code") DO NOTHING;

INSERT INTO "Product" ("code", "name", "price", "weight", "length", "width", "height", "description", "imageUrl", "categoryId", "supplierId", "createdAt", "updatedAt")
SELECT 'PRD-S1-004', 'Monitor 24"', 199.99, 4.5, 55.0, 18.0, 40.0, 'Full HD monitor', NULL, c.id, u.id, NOW(), NOW()
FROM "Category" c, "User" u WHERE c.name = 'Electronics' AND u.email = 'supplier1@example.com'
ON CONFLICT ("supplierId", "code") DO NOTHING;

-- 4) Saradnje (APPROVED da importer vidi proizvode)
INSERT INTO "Collaboration" ("status", "supplierId", "importerId", "createdAt", "updatedAt")
SELECT 'APPROVED', s.id, i.id, NOW(), NOW()
FROM "User" s, "User" i
WHERE s.email = 'supplier1@example.com' AND i.email = 'importer1@example.com'
ON CONFLICT ("supplierId", "importerId") DO NOTHING;

INSERT INTO "Collaboration" ("status", "supplierId", "importerId", "createdAt", "updatedAt")
SELECT 'APPROVED', s.id, i.id, NOW(), NOW()
FROM "User" s, "User" i
WHERE s.email = 'supplier2@example.com' AND i.email = 'importer1@example.com'
ON CONFLICT ("supplierId", "importerId") DO NOTHING;

INSERT INTO "Collaboration" ("status", "supplierId", "importerId", "createdAt", "updatedAt")
SELECT 'PENDING', s.id, i.id, NOW(), NOW()
FROM "User" s, "User" i
WHERE s.email = 'supplier1@example.com' AND i.email = 'importer2@example.com'
ON CONFLICT ("supplierId", "importerId") DO NOTHING;

-- 5) Kontejneri (za importer1 i importer2)
INSERT INTO "Container" ("name", "maxWeight", "maxVolume", "maxPrice", "importerId", "createdAt", "updatedAt")
SELECT 'Container A', 100.0, 5.0, 5000.00, u.id, NOW(), NOW()
FROM "User" u WHERE u.email = 'importer1@example.com';

INSERT INTO "Container" ("name", "maxWeight", "maxVolume", "maxPrice", "importerId", "createdAt", "updatedAt")
SELECT 'Container B', 200.0, 10.0, 10000.00, u.id, NOW(), NOW()
FROM "User" u WHERE u.email = 'importer1@example.com';

INSERT INTO "Container" ("name", "maxWeight", "maxVolume", "maxPrice", "importerId", "createdAt", "updatedAt")
SELECT 'Small shipment', 50.0, 2.0, 2000.00, u.id, NOW(), NOW()
FROM "User" u WHERE u.email = 'importer2@example.com';

-- 6) Stavke u kontejnerima (Container A: 2x prvi proizvod supplier1, 1x drugi proizvod)
INSERT INTO "ContainerItem" ("quantity", "containerId", "productId", "createdAt", "updatedAt")
SELECT 2, c.id, (SELECT id FROM "Product" WHERE "supplierId" = (SELECT id FROM "User" WHERE email = 'supplier1@example.com') ORDER BY id LIMIT 1), NOW(), NOW()
FROM (SELECT id FROM "Container" c JOIN "User" u ON u.id = c."importerId" WHERE u.email = 'importer1@example.com' AND c.name = 'Container A' LIMIT 1) c;

INSERT INTO "ContainerItem" ("quantity", "containerId", "productId", "createdAt", "updatedAt")
SELECT 1, c.id, (SELECT id FROM "Product" WHERE "supplierId" = (SELECT id FROM "User" WHERE email = 'supplier1@example.com') ORDER BY id OFFSET 1 LIMIT 1), NOW(), NOW()
FROM (SELECT id FROM "Container" c JOIN "User" u ON u.id = c."importerId" WHERE u.email = 'importer1@example.com' AND c.name = 'Container A' LIMIT 1) c;
