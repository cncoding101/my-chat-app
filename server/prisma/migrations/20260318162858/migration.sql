/*
  Warnings:

  - You are about to drop the column `fullText` on the `Document` table. All the data in the column will be lost.
  - You are about to drop the column `wordCount` on the `Document` table. All the data in the column will be lost.
  - Made the column `summary` on table `Document` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Document" DROP COLUMN "fullText",
DROP COLUMN "wordCount",
ALTER COLUMN "summary" SET NOT NULL;
