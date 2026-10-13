/*
  Warnings:

  - Added the required column `city` to the `Address` table without a default value. This is not possible if the table is not empty.
  - Added the required column `country` to the `Address` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Address`
ADD COLUMN `city` VARCHAR(191) NOT NULL DEFAULT '',
ADD COLUMN `stateProvince` VARCHAR(191) NULL,
ADD COLUMN `country` VARCHAR(191) NOT NULL DEFAULT '';
