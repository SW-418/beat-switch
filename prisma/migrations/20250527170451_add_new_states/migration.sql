/*
  Warnings:

  - The values [MAPPING_REQUIRED] on the enum `PlaylistSyncState` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "PlaylistSyncState_new" AS ENUM ('SYNCING', 'SYNCED', 'SYNC_FAILED', 'MAPPING', 'MAPPED');
ALTER TABLE "Playlist" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Playlist" ALTER COLUMN "status" TYPE "PlaylistSyncState_new" USING ("status"::text::"PlaylistSyncState_new");
ALTER TYPE "PlaylistSyncState" RENAME TO "PlaylistSyncState_old";
ALTER TYPE "PlaylistSyncState_new" RENAME TO "PlaylistSyncState";
DROP TYPE "PlaylistSyncState_old";
ALTER TABLE "Playlist" ALTER COLUMN "status" SET DEFAULT 'SYNCING';
COMMIT;
