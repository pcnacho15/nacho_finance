-- AlterTable: Wallet — add on-chain (TRON) fields
ALTER TABLE "Wallet" ADD COLUMN     "source" TEXT NOT NULL DEFAULT 'manual',
ADD COLUMN     "address" TEXT,
ADD COLUMN     "lastSyncedAt" TIMESTAMP(3);

-- AlterTable: WalletTransaction — add on-chain provenance
ALTER TABLE "WalletTransaction" ADD COLUMN     "source" TEXT NOT NULL DEFAULT 'manual',
ADD COLUMN     "txHash" TEXT,
ADD COLUMN     "fromAddress" TEXT,
ADD COLUMN     "toAddress" TEXT,
ADD COLUMN     "blockTimestamp" TIMESTAMP(3);

-- CreateIndex: NULLs are distinct in Postgres, so existing manual rows (address/txHash NULL) don't collide.
CREATE UNIQUE INDEX "Wallet_userId_address_key" ON "Wallet"("userId", "address");

-- CreateIndex
CREATE UNIQUE INDEX "WalletTransaction_walletId_txHash_key" ON "WalletTransaction"("walletId", "txHash");
