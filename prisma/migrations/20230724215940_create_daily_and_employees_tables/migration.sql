-- CreateTable
CREATE TABLE "Employee" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "name" TEXT NOT NULL,
    "position" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "Daily" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "current_day" TEXT NOT NULL,
    "current_position" INTEGER NOT NULL DEFAULT 0
);
