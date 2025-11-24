/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Agency` table. All the data in the column will be lost.
  - You are about to drop the column `industry` on the `Agency` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Agency` table. All the data in the column will be lost.
  - You are about to drop the column `agencyId` on the `Contact` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Contact` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Contact` table. All the data in the column will be lost.
  - You are about to drop the column `position` on the `Contact` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Contact` table. All the data in the column will be lost.
  - Added the required column `updated_at` to the `Agency` table without a default value. This is not possible if the table is not empty.
  - Added the required column `agency_id` to the `Contact` table without a default value. This is not possible if the table is not empty.
  - Added the required column `first_name` to the `Contact` table without a default value. This is not possible if the table is not empty.
  - Added the required column `last_name` to the `Contact` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `Contact` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Agency" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "state" TEXT,
    "state_code" TEXT,
    "type" TEXT,
    "population" TEXT,
    "website" TEXT,
    "county" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);
INSERT INTO "new_Agency" ("id", "name", "website") SELECT "id", "name", "website" FROM "Agency";
DROP TABLE "Agency";
ALTER TABLE "new_Agency" RENAME TO "Agency";
CREATE TABLE "new_Contact" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "title" TEXT,
    "email_type" TEXT,
    "department" TEXT,
    "agency_id" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "Contact_agency_id_fkey" FOREIGN KEY ("agency_id") REFERENCES "Agency" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Contact" ("email", "id", "phone") SELECT "email", "id", "phone" FROM "Contact";
DROP TABLE "Contact";
ALTER TABLE "new_Contact" RENAME TO "Contact";
CREATE INDEX "Contact_agency_id_idx" ON "Contact"("agency_id");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
