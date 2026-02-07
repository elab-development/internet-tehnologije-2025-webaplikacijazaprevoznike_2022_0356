-- ============================================================
-- 3) SAMO Collaboration
-- Supplieri 2,4,5,9,11 – Svi importeri 6,7,10,12 (da svi vide proizvode). Očekivano: INSERT 0 20
-- ============================================================

INSERT INTO "Collaboration" ("status", "supplierId", "importerId", "createdAt", "updatedAt")
VALUES
  ('APPROVED', 2, 6, NOW(), NOW()),
  ('APPROVED', 2, 7, NOW(), NOW()),
  ('APPROVED', 2, 10, NOW(), NOW()),
  ('APPROVED', 2, 12, NOW(), NOW()),
  ('APPROVED', 4, 6, NOW(), NOW()),
  ('APPROVED', 4, 7, NOW(), NOW()),
  ('APPROVED', 4, 10, NOW(), NOW()),
  ('APPROVED', 4, 12, NOW(), NOW()),
  ('APPROVED', 5, 6, NOW(), NOW()),
  ('APPROVED', 5, 7, NOW(), NOW()),
  ('APPROVED', 5, 10, NOW(), NOW()),
  ('APPROVED', 5, 12, NOW(), NOW()),
  ('APPROVED', 9, 6, NOW(), NOW()),
  ('APPROVED', 9, 7, NOW(), NOW()),
  ('APPROVED', 9, 10, NOW(), NOW()),
  ('APPROVED', 9, 12, NOW(), NOW()),
  ('APPROVED', 11, 6, NOW(), NOW()),
  ('APPROVED', 11, 7, NOW(), NOW()),
  ('APPROVED', 11, 10, NOW(), NOW()),
  ('APPROVED', 11, 12, NOW(), NOW());
