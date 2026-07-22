-- AlterTable: Wallet — chain discriminator for multi-chain on-chain wallets.
-- Existing on-chain wallets are TRON, so default 'tron' backfills them correctly.
ALTER TABLE "Wallet" ADD COLUMN     "chain" TEXT NOT NULL DEFAULT 'tron';
