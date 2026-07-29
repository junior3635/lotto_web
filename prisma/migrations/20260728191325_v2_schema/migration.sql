-- CreateTable
CREATE TABLE `countries` (
    `id` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `flagEmoji` VARCHAR(191) NOT NULL,
    `currency` VARCHAR(191) NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `countries_code_key`(`code`),
    UNIQUE INDEX `countries_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `states` (
    `id` VARCHAR(191) NOT NULL,
    `countryId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `taxRate` DECIMAL(5, 2) NOT NULL,
    `minimumLegalAge` INTEGER NOT NULL DEFAULT 18,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `states_countryId_idx`(`countryId`),
    UNIQUE INDEX `states_countryId_code_key`(`countryId`, `code`),
    UNIQUE INDEX `states_countryId_slug_key`(`countryId`, `slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `lotteries` (
    `id` VARCHAR(191) NOT NULL,
    `externalId` INTEGER NULL,
    `stateId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `mainDrawName` VARCHAR(191) NULL,
    `logoUrl` VARCHAR(191) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `lotteries_stateId_idx`(`stateId`),
    INDEX `lotteries_externalId_idx`(`externalId`),
    UNIQUE INDEX `lotteries_stateId_slug_key`(`stateId`, `slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `lottery_configurations` (
    `id` VARCHAR(191) NOT NULL,
    `lotteryId` VARCHAR(191) NOT NULL,
    `drawTimezone` VARCHAR(191) NULL,
    `drawTime` VARCHAR(191) NULL,
    `stopSaleTime` VARCHAR(191) NULL,
    `claimDeadline` INTEGER NULL,
    `allowZero` BOOLEAN NOT NULL DEFAULT false,
    `minBall` INTEGER NOT NULL,
    `maxBall` INTEGER NOT NULL,
    `drawnNumbers` INTEGER NOT NULL,
    `selectableBalls` INTEGER NOT NULL,
    `minimumSelectableBalls` INTEGER NOT NULL,
    `uniqueMainNumbers` INTEGER NOT NULL DEFAULT 1,
    `uniqueExtraNumbers` INTEGER NULL,
    `allowDuplicates` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `lottery_configurations_lotteryId_key`(`lotteryId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `lottery_ball_types` (
    `id` VARCHAR(191) NOT NULL,
    `lotteryId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `abbreviation` VARCHAR(191) NULL,
    `category` ENUM('MAIN', 'ADDITIONAL', 'MULTIPLIER') NOT NULL,
    `minBall` INTEGER NULL,
    `maxBall` INTEGER NULL,
    `allowZero` BOOLEAN NOT NULL DEFAULT false,
    `isString` BOOLEAN NOT NULL DEFAULT false,
    `isMultiplier` BOOLEAN NOT NULL DEFAULT false,
    `playerPicked` BOOLEAN NOT NULL DEFAULT false,
    `allowedValues` JSON NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `lottery_ball_types_lotteryId_idx`(`lotteryId`),
    UNIQUE INDEX `lottery_ball_types_lotteryId_name_key`(`lotteryId`, `name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `lottery_draw_schedules` (
    `id` VARCHAR(191) NOT NULL,
    `lotteryId` VARCHAR(191) NOT NULL,
    `dayOfWeek` ENUM('SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY') NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `lottery_draw_schedules_lotteryId_idx`(`lotteryId`),
    UNIQUE INDEX `lottery_draw_schedules_lotteryId_dayOfWeek_key`(`lotteryId`, `dayOfWeek`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `draws` (
    `id` VARCHAR(191) NOT NULL,
    `lotteryId` VARCHAR(191) NOT NULL,
    `externalDrawId` INTEGER NULL,
    `drawNumber` VARCHAR(191) NULL,
    `drawDate` DATE NOT NULL,
    `drawTime` VARCHAR(191) NULL,
    `details` TEXT NULL,
    `note` TEXT NULL,
    `hasWinner` BOOLEAN NOT NULL DEFAULT false,
    `status` ENUM('SCHEDULED', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'SCHEDULED',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `draws_lotteryId_drawDate_idx`(`lotteryId`, `drawDate`),
    INDEX `draws_drawDate_idx`(`drawDate`),
    UNIQUE INDEX `draws_lotteryId_externalDrawId_key`(`lotteryId`, `externalDrawId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `draw_numbers` (
    `id` VARCHAR(191) NOT NULL,
    `drawId` VARCHAR(191) NOT NULL,
    `ballTypeId` VARCHAR(191) NULL,
    `category` ENUM('MAIN', 'ADDITIONAL', 'MULTIPLIER') NOT NULL DEFAULT 'MAIN',
    `position` INTEGER NOT NULL,
    `value` VARCHAR(191) NOT NULL,

    INDEX `draw_numbers_drawId_idx`(`drawId`),
    INDEX `draw_numbers_ballTypeId_idx`(`ballTypeId`),
    UNIQUE INDEX `draw_numbers_drawId_category_position_key`(`drawId`, `category`, `position`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `prize_breakdowns` (
    `id` VARCHAR(191) NOT NULL,
    `drawId` VARCHAR(191) NOT NULL,
    `matchPattern` VARCHAR(191) NOT NULL,
    `prizeAmountRaw` VARCHAR(191) NULL,
    `prizeAmount` DECIMAL(15, 2) NULL,
    `winnersCount` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `prize_breakdowns_drawId_idx`(`drawId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `jackpot_history` (
    `id` VARCHAR(191) NOT NULL,
    `drawId` VARCHAR(191) NOT NULL,
    `jackpotRaw` VARCHAR(191) NULL,
    `jackpotAmount` DECIMAL(15, 2) NULL,
    `cashPayoutRaw` VARCHAR(191) NULL,
    `cashPayoutAmount` DECIMAL(15, 2) NULL,
    `nextDrawDate` DATETIME(3) NULL,
    `nextJackpotRaw` VARCHAR(191) NULL,
    `nextJackpotAmount` DECIMAL(15, 2) NULL,
    `nextCashRaw` VARCHAR(191) NULL,
    `nextCashAmount` DECIMAL(15, 2) NULL,
    `totalPrizePool` DECIMAL(15, 2) NULL,
    `overallWinners` INTEGER NULL,
    `recordedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `jackpot_history_drawId_recordedAt_idx`(`drawId`, `recordedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `api_request_logs` (
    `id` VARCHAR(191) NOT NULL,
    `countryId` VARCHAR(191) NULL,
    `endpoint` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL,
    `message` VARCHAR(191) NULL,
    `rowCount` INTEGER NULL,
    `creditUsed` INTEGER NOT NULL DEFAULT 0,
    `systemTime` DATETIME(3) NULL,
    `requestedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `api_request_logs_countryId_requestedAt_idx`(`countryId`, `requestedAt`),
    INDEX `api_request_logs_endpoint_idx`(`endpoint`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `states` ADD CONSTRAINT `states_countryId_fkey` FOREIGN KEY (`countryId`) REFERENCES `countries`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lotteries` ADD CONSTRAINT `lotteries_stateId_fkey` FOREIGN KEY (`stateId`) REFERENCES `states`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lottery_configurations` ADD CONSTRAINT `lottery_configurations_lotteryId_fkey` FOREIGN KEY (`lotteryId`) REFERENCES `lotteries`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lottery_ball_types` ADD CONSTRAINT `lottery_ball_types_lotteryId_fkey` FOREIGN KEY (`lotteryId`) REFERENCES `lotteries`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lottery_draw_schedules` ADD CONSTRAINT `lottery_draw_schedules_lotteryId_fkey` FOREIGN KEY (`lotteryId`) REFERENCES `lotteries`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `draws` ADD CONSTRAINT `draws_lotteryId_fkey` FOREIGN KEY (`lotteryId`) REFERENCES `lotteries`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `draw_numbers` ADD CONSTRAINT `draw_numbers_drawId_fkey` FOREIGN KEY (`drawId`) REFERENCES `draws`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `draw_numbers` ADD CONSTRAINT `draw_numbers_ballTypeId_fkey` FOREIGN KEY (`ballTypeId`) REFERENCES `lottery_ball_types`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `prize_breakdowns` ADD CONSTRAINT `prize_breakdowns_drawId_fkey` FOREIGN KEY (`drawId`) REFERENCES `draws`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `jackpot_history` ADD CONSTRAINT `jackpot_history_drawId_fkey` FOREIGN KEY (`drawId`) REFERENCES `draws`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `api_request_logs` ADD CONSTRAINT `api_request_logs_countryId_fkey` FOREIGN KEY (`countryId`) REFERENCES `countries`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
