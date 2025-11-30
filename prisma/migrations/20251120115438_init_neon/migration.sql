-- CreateTable
CREATE TABLE "WeeklyPromotion" (
    "id" SERIAL NOT NULL,
    "weekday" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "link" TEXT NOT NULL,
    "button" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "icon" TEXT,
    "buttonColor" TEXT NOT NULL DEFAULT 'green',
    "rich" JSONB,
    "richHtml" TEXT,
    "translations" JSONB,

    CONSTRAINT "WeeklyPromotion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SpecialPromotion" (
    "id" SERIAL NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "day" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "link" TEXT NOT NULL,
    "button" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "icon" TEXT,
    "buttonColor" TEXT NOT NULL DEFAULT 'green',
    "rich" JSONB,
    "richHtml" TEXT,
    "translations" JSONB,

    CONSTRAINT "SpecialPromotion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeeklyPlan" (
    "id" SERIAL NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "weekday" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "link" TEXT NOT NULL,
    "button" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "icon" TEXT,
    "rich" JSONB,
    "richHtml" TEXT,
    "buttonColor" TEXT NOT NULL DEFAULT 'green',
    "translations" JSONB,

    CONSTRAINT "WeeklyPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminUser" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "isSuper" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WeeklyPromotion_weekday_key" ON "WeeklyPromotion"("weekday");

-- CreateIndex
CREATE UNIQUE INDEX "WeeklyPlan_year_month_weekday_key" ON "WeeklyPlan"("year", "month", "weekday");

-- CreateIndex
CREATE UNIQUE INDEX "AdminUser_email_key" ON "AdminUser"("email");
