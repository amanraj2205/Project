/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `Student` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[username]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Added the required column `username` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Student" ADD COLUMN     "codeforcesUsername" TEXT,
ADD COLUMN     "githubUsername" TEXT,
ADD COLUMN     "leetcodeUsername" TEXT,
ADD COLUMN     "portfolioViews" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "slug" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "username" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Student_slug_key" ON "Student"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
