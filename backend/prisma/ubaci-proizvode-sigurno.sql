-- Uvek pokreni PRVO korisnike i kategorije (redom 1, 2), pa tek onda proizvode (3).
-- Inače SELECT u INSERT-u za Product ne nađe ništa i dobijaš INSERT 0 0.

-- 1) Korisnici (lozinka: password)
INSERT INTO "User" ("email", "passwordHash", "name", "role", "active", "createdAt", "updatedAt")
VALUES
  ('admin@example.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin', 'ADMIN', true, NOW(), NOW()),
  ('supplier@example.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Supplier', 'SUPPLIER', true, NOW(), NOW()),
  ('importer@example.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Importer', 'IMPORTER', true, NOW(), NOW())
ON CONFLICT ("email") DO NOTHING;

-- 2) Kategorije
INSERT INTO "Category" ("name", "createdAt", "updatedAt")
VALUES ('Electronics', NOW(), NOW()), ('Clothing', NOW(), NOW()), ('Food', NOW(), NOW())
ON CONFLICT ("name") DO NOTHING;

-- 3) Proizvodi (koriste supplier@example.com i Electronics/Clothing – moraju postojati iz koraka 1 i 2)
INSERT INTO "Product" ("code", "name", "price", "weight", "length", "width", "height", "description", "imageUrl", "categoryId", "supplierId", "createdAt", "updatedAt")
SELECT 'PRD-001', 'Laptop 15"', 299.99, 2.5, 35.0, 24.0, 2.0, 'Office laptop', NULL, c.id, u.id, NOW(), NOW()
FROM "Category" c, "User" u
WHERE c.name = 'Electronics' AND u.email = 'supplier@example.com'
ON CONFLICT ("supplierId", "code") DO NOTHING;

INSERT INTO "Product" ("code", "name", "price", "weight", "length", "width", "height", "description", "imageUrl", "categoryId", "supplierId", "createdAt", "updatedAt")
SELECT 'PRD-002', 'Wireless Mouse', 29.99, 0.15, 12.0, 6.0, 4.0, 'Ergonomic mouse', NULL, c.id, u.id, NOW(), NOW()
FROM "Category" c, "User" u
WHERE c.name = 'Electronics' AND u.email = 'supplier@example.com'
ON CONFLICT ("supplierId", "code") DO NOTHING;

INSERT INTO "Product" ("code", "name", "price", "weight", "length", "width", "height", "description", "imageUrl", "categoryId", "supplierId", "createdAt", "updatedAt")
SELECT 'PRD-003', 'Cotton T-Shirt', 19.99, 0.25, 30.0, 25.0, 2.0, 'Unisex t-shirt', NULL, c.id, u.id, NOW(), NOW()
FROM "Category" c, "User" u
WHERE c.name = 'Clothing' AND u.email = 'supplier@example.com'
ON CONFLICT ("supplierId", "code") DO NOTHING;
