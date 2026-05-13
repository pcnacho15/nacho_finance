-- Clean up orphan rows (data created before userId was wired up).
-- Any row with a NULL userId or referencing a category with a NULL userId
-- is considered test data and removed so userId can be made NOT NULL.
DELETE FROM "Budget" WHERE "userId" IS NULL OR "categoryId" IN (SELECT "id" FROM "Category" WHERE "userId" IS NULL);
DELETE FROM "Income" WHERE "userId" IS NULL OR "categoryId" IN (SELECT "id" FROM "Category" WHERE "userId" IS NULL);
DELETE FROM "Expense" WHERE "userId" IS NULL OR "categoryId" IN (SELECT "id" FROM "Category" WHERE "userId" IS NULL);
DELETE FROM "Debt" WHERE "userId" IS NULL;
DELETE FROM "SavingsGoal" WHERE "userId" IS NULL;
DELETE FROM "Category" WHERE "userId" IS NULL;

-- AlterTable
ALTER TABLE "Budget" ALTER COLUMN "userId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Category" ALTER COLUMN "userId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Debt" ALTER COLUMN "userId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Expense" ALTER COLUMN "userId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Income" ALTER COLUMN "userId" SET NOT NULL;

-- AlterTable
ALTER TABLE "SavingsGoal" ALTER COLUMN "userId" SET NOT NULL;
