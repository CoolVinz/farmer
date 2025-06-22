-- CreateEnum
CREATE TYPE "section_spacing_type" AS ENUM ('4x4', '10x10');

-- AlterTable
ALTER TABLE "plots" ADD COLUMN     "owner" VARCHAR(255),
ADD COLUMN     "section_spacing" "section_spacing_type" DEFAULT '4x4';

-- AlterTable
ALTER TABLE "sections" ADD COLUMN     "image_path" VARCHAR(500),
ADD COLUMN     "x_coordinate" DECIMAL,
ADD COLUMN     "y_coordinate" DECIMAL;

-- AlterTable
ALTER TABLE "trees" ADD COLUMN     "image_path" VARCHAR(500);
