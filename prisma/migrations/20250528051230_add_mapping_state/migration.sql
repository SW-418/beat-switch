-- CreateEnum
CREATE TYPE "SongMappingState" AS ENUM ('READY_TO_MAP', 'MAPPED', 'MANUAL_MAPPING_REQUIRED', 'SKIPPED');

-- AlterTable
ALTER TABLE "SongMapping" ADD COLUMN     "state" "SongMappingState" NOT NULL DEFAULT 'READY_TO_MAP';
