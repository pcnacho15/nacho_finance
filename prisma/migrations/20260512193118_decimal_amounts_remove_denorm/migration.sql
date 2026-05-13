/*
  Warnings:

  - You are about to drop the column `categoryColor` on the `Budget` table. All the data in the column will be lost.
  - You are about to drop the column `categoryName` on the `Budget` table. All the data in the column will be lost.
  - You are about to alter the column `amount` on the `Budget` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(20,8)`.
  - You are about to alter the column `spent` on the `Budget` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(20,8)`.
  - You are about to alter the column `originalAmount` on the `Debt` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(20,8)`.
  - You are about to alter the column `currentAmount` on the `Debt` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(20,8)`.
  - You are about to alter the column `paidAmount` on the `Debt` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(20,8)`.
  - You are about to alter the column `interestRate` on the `Debt` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(8,4)`.
  - You are about to alter the column `monthlyPayment` on the `Debt` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(20,8)`.
  - You are about to alter the column `amount` on the `DebtPayment` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(20,8)`.
  - You are about to drop the column `categoryColor` on the `Expense` table. All the data in the column will be lost.
  - You are about to drop the column `categoryName` on the `Expense` table. All the data in the column will be lost.
  - You are about to alter the column `amount` on the `Expense` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(20,8)`.
  - You are about to drop the column `categoryColor` on the `Income` table. All the data in the column will be lost.
  - You are about to drop the column `categoryName` on the `Income` table. All the data in the column will be lost.
  - You are about to alter the column `amount` on the `Income` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(20,8)`.
  - You are about to alter the column `amount` on the `SavingsContribution` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(20,8)`.
  - You are about to alter the column `targetAmount` on the `SavingsGoal` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(20,8)`.
  - You are about to alter the column `currentAmount` on the `SavingsGoal` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(20,8)`.

*/
-- AlterTable
ALTER TABLE "Budget" DROP COLUMN "categoryColor",
DROP COLUMN "categoryName",
ALTER COLUMN "amount" SET DATA TYPE DECIMAL(20,8),
ALTER COLUMN "spent" SET DATA TYPE DECIMAL(20,8);

-- AlterTable
ALTER TABLE "Debt" ALTER COLUMN "originalAmount" SET DATA TYPE DECIMAL(20,8),
ALTER COLUMN "currentAmount" SET DATA TYPE DECIMAL(20,8),
ALTER COLUMN "paidAmount" SET DATA TYPE DECIMAL(20,8),
ALTER COLUMN "interestRate" SET DATA TYPE DECIMAL(8,4),
ALTER COLUMN "monthlyPayment" SET DATA TYPE DECIMAL(20,8);

-- AlterTable
ALTER TABLE "DebtPayment" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(20,8);

-- AlterTable
ALTER TABLE "Expense" DROP COLUMN "categoryColor",
DROP COLUMN "categoryName",
ALTER COLUMN "amount" SET DATA TYPE DECIMAL(20,8);

-- AlterTable
ALTER TABLE "Income" DROP COLUMN "categoryColor",
DROP COLUMN "categoryName",
ALTER COLUMN "amount" SET DATA TYPE DECIMAL(20,8);

-- AlterTable
ALTER TABLE "SavingsContribution" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(20,8);

-- AlterTable
ALTER TABLE "SavingsGoal" ALTER COLUMN "targetAmount" SET DATA TYPE DECIMAL(20,8),
ALTER COLUMN "currentAmount" SET DATA TYPE DECIMAL(20,8);

-- CreateIndex
CREATE INDEX "Budget_categoryId_idx" ON "Budget"("categoryId");

-- CreateIndex
CREATE INDEX "DebtPayment_debtId_idx" ON "DebtPayment"("debtId");

-- CreateIndex
CREATE INDEX "Expense_categoryId_idx" ON "Expense"("categoryId");

-- CreateIndex
CREATE INDEX "Expense_date_idx" ON "Expense"("date");

-- CreateIndex
CREATE INDEX "Income_categoryId_idx" ON "Income"("categoryId");

-- CreateIndex
CREATE INDEX "Income_date_idx" ON "Income"("date");

-- CreateIndex
CREATE INDEX "SavingsContribution_goalId_idx" ON "SavingsContribution"("goalId");
