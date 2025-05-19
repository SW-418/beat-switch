/*
  Warnings:

  - A unique constraint covering the columns `[hash]` on the table `Song` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `hash` to the `Song` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Song" ADD COLUMN     "hash" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Song_hash_key" ON "Song"("hash");
