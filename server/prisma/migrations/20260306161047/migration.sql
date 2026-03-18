/*
  Warnings:

  - Added the required column `filePath` to the `Document` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fileSize` to the `Document` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fullText` to the `Document` table without a default value. This is not possible if the table is not empty.
  - Added the required column `summary` to the `Document` table without a default value. This is not possible if the table is not empty.
  - Added the required column `wordCount` to the `Document` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "filePath" TEXT NOT NULL,
ADD COLUMN     "fileSize" INTEGER NOT NULL,
ADD COLUMN     "fullText" TEXT NOT NULL,
ADD COLUMN     "summary" TEXT NOT NULL,
ADD COLUMN     "wordCount" INTEGER NOT NULL;
