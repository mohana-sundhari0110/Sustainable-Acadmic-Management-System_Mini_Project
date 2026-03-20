-- CreateTable
CREATE TABLE "Activity" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Course" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'General',
    "status" TEXT NOT NULL DEFAULT 'Active',
    "objectives" TEXT,
    "content" TEXT
);
INSERT INTO "new_Course" ("content", "description", "id", "objectives", "title") SELECT "content", "description", "id", "objectives", "title" FROM "Course";
DROP TABLE "Course";
ALTER TABLE "new_Course" RENAME TO "Course";
CREATE TABLE "new_InnovationIdea" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "studentId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "problem" TEXT NOT NULL,
    "solution" TEXT NOT NULL,
    "impact" TEXT NOT NULL,
    "budget" REAL NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'General',
    "supportingDoc" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Pending',
    "adminFeedback" TEXT,
    "reviewedBy" INTEGER,
    "reviewedAt" DATETIME,
    "fundingAmount" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "InnovationIdea_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_InnovationIdea" ("adminFeedback", "budget", "createdAt", "fundingAmount", "id", "impact", "problem", "solution", "status", "studentId", "supportingDoc", "title") SELECT "adminFeedback", "budget", "createdAt", "fundingAmount", "id", "impact", "problem", "solution", "status", "studentId", "supportingDoc", "title" FROM "InnovationIdea";
DROP TABLE "InnovationIdea";
ALTER TABLE "new_InnovationIdea" RENAME TO "InnovationIdea";
CREATE TABLE "new_User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "greenPoints" INTEGER NOT NULL DEFAULT 0,
    "registerNumber" TEXT,
    "department" TEXT,
    "year" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_User" ("email", "greenPoints", "id", "name", "password", "role") SELECT "email", "greenPoints", "id", "name", "password", "role" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_registerNumber_key" ON "User"("registerNumber");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
