/*
  Warnings:

  - Added the required column `browser` to the `Session` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ip` to the `Session` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Session" ADD COLUMN     "browser" TEXT NOT NULL,
ADD COLUMN     "ip" TEXT NOT NULL;
