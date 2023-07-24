-- CreateTable
CREATE TABLE "Employee" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "position" INTEGER NOT NULL,

    CONSTRAINT "Employee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Daily" (
    "id" TEXT NOT NULL,
    "current_day" TEXT NOT NULL,
    "current_position" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Daily_pkey" PRIMARY KEY ("id")
);
