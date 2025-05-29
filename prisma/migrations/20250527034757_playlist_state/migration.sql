-- CreateEnum
CREATE TYPE "PlaylistSyncState" AS ENUM ('SYNCING', 'SYNCED', 'SYNC_FAILED', 'MAPPING_REQUIRED');

-- AlterTable
ALTER TABLE "Playlist" ADD COLUMN     "status" "PlaylistSyncState" NOT NULL DEFAULT 'SYNCING';
