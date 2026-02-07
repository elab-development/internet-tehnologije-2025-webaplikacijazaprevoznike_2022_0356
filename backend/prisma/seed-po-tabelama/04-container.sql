-- ============================================================
-- 4) SAMO Container
-- Importeri 6, 7, 10, 12. Očekivano: INSERT 0 6
-- ============================================================

INSERT INTO "Container" ("name", "maxWeight", "maxVolume", "maxPrice", "importerId", "createdAt", "updatedAt")
VALUES
  ('Importer One – Shipment A', 100.0, 5.0, 5000.00, 6, NOW(), NOW()),
  ('Importer One – Shipment B', 200.0, 10.0, 10000.00, 6, NOW(), NOW()),
  ('Importer Two – Cargo', 150.0, 8.0, 7500.00, 7, NOW(), NOW()),
  ('Importer – Container 1', 80.0, 4.0, 4000.00, 10, NOW(), NOW()),
  ('Importer – Container 2', 120.0, 6.0, 6000.00, 10, NOW(), NOW()),
  ('T – Small Shipment', 50.0, 2.0, 2500.00, 12, NOW(), NOW());
