-- AlterTable
ALTER TABLE `shopproduct` ADD COLUMN `estimatedWeightGrams` INTEGER NOT NULL DEFAULT 500;

-- AlterTable
ALTER TABLE `user` ADD COLUMN `groupShippingNameConsent` BOOLEAN NOT NULL DEFAULT false;
