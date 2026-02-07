-- ============================================================
-- 5) SAMO ContainerItem
-- Pokreni POSLE 02-product.sql i 04-container.sql.
-- Kontejneri se biraju po importerId i redosledu (ne po nazivu). Očekivano: 8× INSERT 0 1
-- ============================================================

-- Importer 6, prvi kontejner: 2× proizvod supplier 2, 1× proizvod supplier 4
INSERT INTO "ContainerItem" ("quantity", "containerId", "productId", "createdAt", "updatedAt")
SELECT 2, c.id, p.id, NOW(), NOW()
FROM (SELECT id FROM "Container" WHERE "importerId" = 6 ORDER BY id LIMIT 1 OFFSET 0) c,
     (SELECT id FROM "Product" WHERE "supplierId" = 2 ORDER BY id LIMIT 1) p;

INSERT INTO "ContainerItem" ("quantity", "containerId", "productId", "createdAt", "updatedAt")
SELECT 1, c.id, p.id, NOW(), NOW()
FROM (SELECT id FROM "Container" WHERE "importerId" = 6 ORDER BY id LIMIT 1 OFFSET 0) c,
     (SELECT id FROM "Product" WHERE "supplierId" = 4 ORDER BY id LIMIT 1) p;

-- Importer 6, drugi kontejner: 3× supplier 5, 1× supplier 9
INSERT INTO "ContainerItem" ("quantity", "containerId", "productId", "createdAt", "updatedAt")
SELECT 3, c.id, p.id, NOW(), NOW()
FROM (SELECT id FROM "Container" WHERE "importerId" = 6 ORDER BY id LIMIT 1 OFFSET 1) c,
     (SELECT id FROM "Product" WHERE "supplierId" = 5 ORDER BY id LIMIT 1) p;

INSERT INTO "ContainerItem" ("quantity", "containerId", "productId", "createdAt", "updatedAt")
SELECT 1, c.id, p.id, NOW(), NOW()
FROM (SELECT id FROM "Container" WHERE "importerId" = 6 ORDER BY id LIMIT 1 OFFSET 1) c,
     (SELECT id FROM "Product" WHERE "supplierId" = 9 ORDER BY id LIMIT 1) p;

-- Importer 10, prvi kontejner: 2× supplier 2 (drugi proizvod), 5× supplier 11
INSERT INTO "ContainerItem" ("quantity", "containerId", "productId", "createdAt", "updatedAt")
SELECT 2, c.id, p.id, NOW(), NOW()
FROM (SELECT id FROM "Container" WHERE "importerId" = 10 ORDER BY id LIMIT 1 OFFSET 0) c,
     (SELECT id FROM "Product" WHERE "supplierId" = 2 ORDER BY id LIMIT 1 OFFSET 1) p;

INSERT INTO "ContainerItem" ("quantity", "containerId", "productId", "createdAt", "updatedAt")
SELECT 5, c.id, p.id, NOW(), NOW()
FROM (SELECT id FROM "Container" WHERE "importerId" = 10 ORDER BY id LIMIT 1 OFFSET 0) c,
     (SELECT id FROM "Product" WHERE "supplierId" = 11 ORDER BY id LIMIT 1) p;

-- Importer 12, prvi (i jedini) kontejner: 4× supplier 11 (drugi proizvod)
INSERT INTO "ContainerItem" ("quantity", "containerId", "productId", "createdAt", "updatedAt")
SELECT 4, c.id, p.id, NOW(), NOW()
FROM (SELECT id FROM "Container" WHERE "importerId" = 12 ORDER BY id LIMIT 1) c,
     (SELECT id FROM "Product" WHERE "supplierId" = 11 ORDER BY id LIMIT 1 OFFSET 1) p;

-- Importer 7 (Cargo): 2× proizvod supplier 4
INSERT INTO "ContainerItem" ("quantity", "containerId", "productId", "createdAt", "updatedAt")
SELECT 2, c.id, p.id, NOW(), NOW()
FROM (SELECT id FROM "Container" WHERE "importerId" = 7 ORDER BY id LIMIT 1) c,
     (SELECT id FROM "Product" WHERE "supplierId" = 4 ORDER BY id LIMIT 1) p;
