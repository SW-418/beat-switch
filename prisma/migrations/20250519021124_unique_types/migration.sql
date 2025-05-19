/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `AccountType` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "AccountType_name_key" ON "AccountType"("name");
