-- ============================================================
-- Dodaje kolone latitude/longitude u User i popunjava
-- nasumičnim koordinatama unutar Srbije (približne granice).
-- Pokreni u pgAdminu ili: psql -U app -d uvoznici -f add-user-location-serbia.sql
-- ============================================================
-- Srbija (pribl.): lat 42.2–46.2, lng 18.8–23.0
-- ============================================================

-- 1) Dodaj kolone ako ne postoje
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'User' AND column_name = 'latitude') THEN
    ALTER TABLE "User" ADD COLUMN "latitude" DOUBLE PRECISION;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'User' AND column_name = 'longitude') THEN
    ALTER TABLE "User" ADD COLUMN "longitude" DOUBLE PRECISION;
  END IF;
END $$;

-- 2) Postavi nasumične koordinate u Srbiji za sve korisnike
--    (svaki red dobija drugačiju vrednost zbog random())
UPDATE "User"
SET
  "latitude"  = 42.2 + (46.2 - 42.2) * random(),
  "longitude"  = 18.8 + (23.0 - 18.8) * random()
WHERE "id" IS NOT NULL;
