-- DropForeignKey
ALTER TABLE "SongMapping" DROP CONSTRAINT "SongMapping_syncedPlaylistId_fkey";

-- AlterTable
ALTER TABLE "SongMapping" ALTER COLUMN "syncedPlaylistId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "SongMapping" ADD CONSTRAINT "SongMapping_syncedPlaylistId_fkey" FOREIGN KEY ("syncedPlaylistId") REFERENCES "Playlist"("id") ON DELETE SET NULL ON UPDATE CASCADE;
