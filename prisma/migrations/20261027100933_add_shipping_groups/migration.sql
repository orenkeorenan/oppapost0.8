-- CreateTable
CREATE TABLE `ShippingGroup` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `destinationCountry` VARCHAR(100) NOT NULL,
    `destinationCity` VARCHAR(100) NULL,
    `targetWeightGrams` INTEGER NOT NULL,
    `minimumBillableGrams` INTEGER NOT NULL,
    `status` ENUM('OPEN', 'READY', 'PROCESSING', 'SHIPPED', 'CANCELLED') NOT NULL DEFAULT 'OPEN',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `ShippingGroup_destinationCountry_destinationCity_status_idx`(`destinationCountry`, `destinationCity`, `status`),
    INDEX `ShippingGroup_status_createdAt_idx`(`status`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ShippingGroupPackage` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `shippingGroupId` INTEGER NOT NULL,
    `packageId` INTEGER NOT NULL,
    `addedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `ShippingGroupPackage_packageId_key`(`packageId`),
    INDEX `ShippingGroupPackage_shippingGroupId_idx`(`shippingGroupId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ShippingGroupPackage` ADD CONSTRAINT `ShippingGroupPackage_shippingGroupId_fkey` FOREIGN KEY (`shippingGroupId`) REFERENCES `ShippingGroup`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ShippingGroupPackage` ADD CONSTRAINT `ShippingGroupPackage_packageId_fkey` FOREIGN KEY (`packageId`) REFERENCES `Package`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
