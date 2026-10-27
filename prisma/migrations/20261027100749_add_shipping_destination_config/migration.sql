-- CreateTable
CREATE TABLE `ShippingDestinationConfig` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `country` VARCHAR(100) NOT NULL,
    `city` VARCHAR(100) NULL,
    `groupTargetWeightGrams` INTEGER NOT NULL DEFAULT 5000,
    `minimumBillableGrams` INTEGER NOT NULL DEFAULT 500,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `ShippingDestinationConfig_country_isActive_idx`(`country`, `isActive`),
    UNIQUE INDEX `ShippingDestinationConfig_country_city_key`(`country`, `city`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
