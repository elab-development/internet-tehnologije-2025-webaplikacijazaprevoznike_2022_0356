-- Add product fields required by API: code, description, imageUrl
-- Backfill code for existing rows as PRD-<id>, then enforce NOT NULL and uniqueness per supplier.

-- Add columns (code first as nullable so we can backfill safely)
ALTER TABLE "Product" ADD COLUMN "code" TEXT;
ALTER TABLE "Product" ADD COLUMN "description" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Product" ADD COLUMN "imageUrl" TEXT;

-- Backfill code for existing products (unique globally, therefore unique per supplier too)
UPDATE "Product"
SET "code" = CONCAT('PRD-', "id")
WHERE "code" IS NULL;

-- Enforce NOT NULL for code
ALTER TABLE "Product" ALTER COLUMN "code" SET NOT NULL;

-- Unique per supplier
CREATE UNIQUE INDEX "Product_supplierId_code_key" ON "Product"("supplierId", "code");

