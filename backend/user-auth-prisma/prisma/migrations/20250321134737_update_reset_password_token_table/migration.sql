/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `ResetPasswordToken` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "ResetPasswordToken_userId_key" ON "ResetPasswordToken"("userId");
