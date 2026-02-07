-- ============================================================
-- 1) SAMO Category
-- Pokreni prvi. Očekivano: INSERT 0 3
-- ============================================================

INSERT INTO "Category" ("name", "createdAt", "updatedAt")
VALUES
  ('Electronics', NOW(), NOW()),
  ('Clothing', NOW(), NOW()),
  ('Food', NOW(), NOW());
