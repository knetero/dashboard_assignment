/*
  Warnings:

  - You are about to drop the `ContactView` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ContactView" DROP CONSTRAINT "ContactView_contactId_fkey";

-- DropTable
DROP TABLE "ContactView";

-- CreateTable
CREATE TABLE "contact_views" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "contactId" TEXT NOT NULL,
    "viewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contact_views_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyContactView" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DailyContactView_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "contact_views_userId_viewedAt_idx" ON "contact_views"("userId", "viewedAt");

-- CreateIndex
CREATE UNIQUE INDEX "contact_views_userId_contactId_key" ON "contact_views"("userId", "contactId");

-- CreateIndex
CREATE INDEX "DailyContactView_userId_date_idx" ON "DailyContactView"("userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "DailyContactView_userId_date_key" ON "DailyContactView"("userId", "date");

-- AddForeignKey
ALTER TABLE "contact_views" ADD CONSTRAINT "contact_views_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;
