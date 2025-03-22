-- CreateTable
CREATE TABLE "VerrifyEmailToken" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "token" TEXT NOT NULL,

    CONSTRAINT "VerrifyEmailToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VerrifyEmailToken_userId_key" ON "VerrifyEmailToken"("userId");

-- AddForeignKey
ALTER TABLE "VerrifyEmailToken" ADD CONSTRAINT "VerrifyEmailToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
