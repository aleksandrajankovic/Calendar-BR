-- CreateEnum
CREATE TYPE "PromoCategory" AS ENUM ('SPORT', 'CASINO', 'MISSIONS', 'ALL');

-- AlterTable
ALTER TABLE "SpecialPromotion" ADD COLUMN     "category" "PromoCategory" NOT NULL DEFAULT 'ALL';

-- AlterTable
ALTER TABLE "WeeklyPlan" ADD COLUMN     "category" "PromoCategory" NOT NULL DEFAULT 'ALL';

-- AlterTable
ALTER TABLE "WeeklyPromotion" ADD COLUMN     "category" "PromoCategory" NOT NULL DEFAULT 'ALL';
