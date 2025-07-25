/*
  Warnings:

  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `isEmailVerified` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
DROP COLUMN "isEmailVerified",
ADD COLUMN     "age" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "gender" TEXT NOT NULL DEFAULT 'prefer-not-to-say',
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "password" DROP NOT NULL,
ALTER COLUMN "profilePicture" DROP NOT NULL,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "User_id_seq";

-- CreateIndex
CREATE INDEX "User_createdAt_idx" ON "User"("createdAt");
