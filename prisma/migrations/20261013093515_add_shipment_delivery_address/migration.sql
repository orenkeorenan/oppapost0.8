-- AlterTable
ALTER TABLE `address` ALTER COLUMN `city` DROP DEFAULT,
    ALTER COLUMN `country` DROP DEFAULT;

-- AlterTable
ALTER TABLE `shipment` ADD COLUMN `deliveryAddress` VARCHAR(500) NULL,
    ADD COLUMN `deliveryCity` VARCHAR(191) NULL,
    ADD COLUMN `deliveryCountry` VARCHAR(191) NULL,
    ADD COLUMN `deliveryPhone` VARCHAR(191) NULL,
    ADD COLUMN `deliveryPostalCode` VARCHAR(191) NULL,
    ADD COLUMN `deliveryState` VARCHAR(191) NULL,
    ADD COLUMN `recipientName` VARCHAR(191) NULL;
