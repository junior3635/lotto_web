-- phpMyAdmin SQL Dump
-- version 5.2.3deb1
-- https://www.phpmyadmin.net/
--
-- Servidor: localhost:3306
-- Tiempo de generación: 05-08-2026 a las 20:49:40
-- Versión del servidor: 8.4.10-0ubuntu0.26.04.1
-- Versión de PHP: 8.2.32

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `lotto_db`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `api_request_logs`
--

CREATE TABLE `api_request_logs` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `countryId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `endpoint` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `message` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `rowCount` int DEFAULT NULL,
  `creditUsed` int NOT NULL DEFAULT '0',
  `systemTime` datetime(3) DEFAULT NULL,
  `requestedAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `countries`
--

CREATE TABLE `countries` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `flagEmoji` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `currency` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT '1',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `countries`
--

INSERT INTO `countries` (`id`, `code`, `name`, `slug`, `flagEmoji`, `currency`, `isActive`, `createdAt`, `updatedAt`) VALUES
('cms528gjn0001azd3065mfvh9', 'ES', 'España', 'es', '🇪🇸', 'EUR', 0, '2026-07-28 19:40:00.324', '2026-07-28 19:40:00.324'),
('cms528gjr0002azd39c3weonn', 'MX', 'México', 'mx', '🇲🇽', 'MXN', 0, '2026-07-28 19:40:00.328', '2026-07-28 19:40:00.328'),
('cmsg6tnjm0004zqifp4yeza8t', 'US', 'New York', 'us', '🏳️', 'USD', 1, '2026-08-05 14:33:55.570', '2026-08-05 14:33:55.570');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `draws`
--

CREATE TABLE `draws` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `lotteryId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `externalDrawId` int DEFAULT NULL,
  `drawNumber` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `drawDate` date NOT NULL,
  `drawTime` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `details` text COLLATE utf8mb4_unicode_ci,
  `note` text COLLATE utf8mb4_unicode_ci,
  `hasWinner` tinyint(1) NOT NULL DEFAULT '0',
  `status` enum('SCHEDULED','COMPLETED','CANCELLED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'SCHEDULED',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `draws`
--

INSERT INTO `draws` (`id`, `lotteryId`, `externalDrawId`, `drawNumber`, `drawDate`, `drawTime`, `details`, `note`, `hasWinner`, `status`, `createdAt`, `updatedAt`) VALUES
('cmsg6vvzj00012buhunubb05h', 'cmsg6tnqu0050zqifdrxi2ynq', 320058, '320058', '2026-08-03', '22:59:00', 'For states except California.', 'POWER PLAY: 2', 0, 'COMPLETED', '2026-08-05 14:35:39.824', '2026-08-05 14:35:39.824'),
('cmsg6y8mp0001cyormo0ma33k', 'cmsg6xubw000v8243aofllq4u', 320058, '320058', '2026-08-03', '22:59:00', 'For states except California.', 'POWER PLAY: 2', 0, 'COMPLETED', '2026-08-05 14:37:29.522', '2026-08-05 14:37:29.522');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `draw_numbers`
--

CREATE TABLE `draw_numbers` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `drawId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ballTypeId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `category` enum('MAIN','ADDITIONAL','MULTIPLIER') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'MAIN',
  `position` int NOT NULL,
  `value` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `draw_numbers`
--

INSERT INTO `draw_numbers` (`id`, `drawId`, `ballTypeId`, `category`, `position`, `value`) VALUES
('cmsg6vvzj00082buh5q2ahuaz', 'cmsg6vvzj00012buhunubb05h', NULL, 'MAIN', 1, '08'),
('cmsg6vvzj00092buhgbvj8nr2', 'cmsg6vvzj00012buhunubb05h', NULL, 'MAIN', 2, '30'),
('cmsg6vvzj000a2buhwcxkf6b5', 'cmsg6vvzj00012buhunubb05h', NULL, 'MAIN', 3, '41'),
('cmsg6vvzj000b2buhzs02n496', 'cmsg6vvzj00012buhunubb05h', NULL, 'MAIN', 4, '48'),
('cmsg6vvzj000c2buhr62b7qsx', 'cmsg6vvzj00012buhunubb05h', NULL, 'MAIN', 5, '54'),
('cmsg6vvzj000d2buhjd7jas0l', 'cmsg6vvzj00012buhunubb05h', 'cmsg6tnqz0054zqifse5vfq2i', 'ADDITIONAL', 1, '04'),
('cmsg6y8mp0008cyorkrink6e7', 'cmsg6y8mp0001cyormo0ma33k', NULL, 'MAIN', 1, '08'),
('cmsg6y8mp0009cyorapg33rgu', 'cmsg6y8mp0001cyormo0ma33k', NULL, 'MAIN', 2, '30'),
('cmsg6y8mp000acyorhrugjksi', 'cmsg6y8mp0001cyormo0ma33k', NULL, 'MAIN', 3, '41'),
('cmsg6y8mp000bcyorj7lcc0tu', 'cmsg6y8mp0001cyormo0ma33k', NULL, 'MAIN', 4, '48'),
('cmsg6y8mp000ccyorj966iz02', 'cmsg6y8mp0001cyormo0ma33k', NULL, 'MAIN', 5, '54'),
('cmsg6y8mp000dcyorwo1nk4l4', 'cmsg6y8mp0001cyormo0ma33k', 'cmsg6xuc1000z82438bivz72o', 'ADDITIONAL', 1, '04');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `jackpot_history`
--

CREATE TABLE `jackpot_history` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `drawId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `jackpotRaw` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `jackpotAmount` decimal(15,2) DEFAULT NULL,
  `cashPayoutRaw` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cashPayoutAmount` decimal(15,2) DEFAULT NULL,
  `nextDrawDate` datetime(3) DEFAULT NULL,
  `nextJackpotRaw` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `nextJackpotAmount` decimal(15,2) DEFAULT NULL,
  `nextCashRaw` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `nextCashAmount` decimal(15,2) DEFAULT NULL,
  `totalPrizePool` decimal(15,2) DEFAULT NULL,
  `overallWinners` int DEFAULT NULL,
  `recordedAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `jackpot_history`
--

INSERT INTO `jackpot_history` (`id`, `drawId`, `jackpotRaw`, `jackpotAmount`, `cashPayoutRaw`, `cashPayoutAmount`, `nextDrawDate`, `nextJackpotRaw`, `nextJackpotAmount`, `nextCashRaw`, `nextCashAmount`, `totalPrizePool`, `overallWinners`, `recordedAt`) VALUES
('cmsg6vvzu001a2buh35ovr28b', 'cmsg6vvzj00012buhunubb05h', '$748 MILLION', 748000000.00, NULL, NULL, '2026-08-04 02:59:00.000', '$748 MILLION', 748000000.00, NULL, NULL, NULL, NULL, '2026-08-05 14:35:39.834'),
('cmsg6y8n2001acyorgim8tlic', 'cmsg6y8mp0001cyormo0ma33k', '$748 MILLION', 748000000.00, NULL, NULL, '2026-08-04 02:59:00.000', '$748 MILLION', 748000000.00, NULL, NULL, NULL, NULL, '2026-08-05 14:37:29.534');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `lotteries`
--

CREATE TABLE `lotteries` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `externalId` int DEFAULT NULL,
  `stateId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `mainDrawName` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `logoUrl` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT '1',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  `isMultiState` tinyint(1) NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `lotteries`
--

INSERT INTO `lotteries` (`id`, `externalId`, `stateId`, `name`, `slug`, `mainDrawName`, `logoUrl`, `isActive`, `createdAt`, `updatedAt`, `isMultiState`) VALUES
('cmsg6tnk50008zqify7wrujsz', 300, 'cmsg6tnjz0006zqifneamo690', 'Numbers Midday', 'numbers-midday', NULL, NULL, 1, '2026-08-05 14:33:55.589', '2026-08-05 14:35:39.853', 0),
('cmsg6tnl4000tzqifcei03r2l', 301, 'cmsg6tnjz0006zqifneamo690', 'Numbers Evening', 'numbers-evening', NULL, NULL, 1, '2026-08-05 14:33:55.624', '2026-08-05 14:35:39.867', 0),
('cmsg6tnly001ezqifztsfl8y5', 302, 'cmsg6tnjz0006zqifneamo690', 'Win 4 Midday', 'win-4-midday', NULL, NULL, 1, '2026-08-05 14:33:55.654', '2026-08-05 14:35:39.881', 0),
('cmsg6tnmr001zzqif9mfcgnxn', 303, 'cmsg6tnjz0006zqifneamo690', 'Win 4 Evening', 'win-4-evening', NULL, NULL, 1, '2026-08-05 14:33:55.683', '2026-08-05 14:35:39.895', 0),
('cmsg6tnni002kzqifpz9pjah9', 304, 'cmsg6tnjz0006zqifneamo690', 'Take 5 Midday', 'take-5-midday', NULL, NULL, 1, '2026-08-05 14:33:55.710', '2026-08-05 14:35:39.907', 0),
('cmsg6tnob0035zqifrvetln9z', 305, 'cmsg6tnjz0006zqifneamo690', 'Take 5 Evening', 'take-5-evening', NULL, NULL, 1, '2026-08-05 14:33:55.739', '2026-08-05 14:35:39.920', 0),
('cmsg6tnp3003qzqifihskfury', 306, 'cmsg6tnjz0006zqifneamo690', 'Pick 10', 'pick-10', NULL, NULL, 1, '2026-08-05 14:33:55.767', '2026-08-05 14:35:39.933', 0),
('cmsg6tnpt004bzqifgzpx970r', 307, 'cmsg6tnjz0006zqifneamo690', 'New York LOTTO', 'new-york-lotto', NULL, NULL, 1, '2026-08-05 14:33:55.794', '2026-08-05 14:35:39.945', 0),
('cmsg6tnqu0050zqifdrxi2ynq', 308, 'cmsg6tnjz0006zqifneamo690', 'Powerball', 'powerball', 'Main draw', NULL, 1, '2026-08-05 14:33:55.830', '2026-08-05 14:35:39.958', 0),
('cmsg6tnrs005rzqif0vyv6ygg', 309, 'cmsg6tnjz0006zqifneamo690', 'Mega Millions', 'mega-millions', NULL, NULL, 1, '2026-08-05 14:33:55.864', '2026-08-05 14:35:39.972', 0),
('cmsg6tnst006izqiftrw28d7r', 310, 'cmsg6tnjz0006zqifneamo690', 'Cash4Life (Retired)', 'cash4life-retired', NULL, NULL, 1, '2026-08-05 14:33:55.901', '2026-08-05 14:35:39.986', 0),
('cmsg6xuao000482431xtlr097', 24, 'cmsg6xuaj00028243f4bdp7vn', 'Mega Millions', 'mega-millions', NULL, NULL, 1, '2026-08-05 14:37:10.945', '2026-08-05 14:56:27.381', 0),
('cmsg6xubw000v8243aofllq4u', 23, 'cmsg6xuaj00028243f4bdp7vn', 'Powerball', 'powerball', 'Main draw', NULL, 1, '2026-08-05 14:37:10.988', '2026-08-05 14:56:27.398', 0),
('cmsg6xucs001m824300vfahab', 21, 'cmsg6xuaj00028243f4bdp7vn', 'Triple Twist', 'triple-twist', NULL, NULL, 1, '2026-08-05 14:37:11.021', '2026-08-05 14:56:27.413', 0),
('cmsg6xudn0027824326ga2yyi', 22, 'cmsg6xuaj00028243f4bdp7vn', 'The Pick', 'the-pick', NULL, NULL, 1, '2026-08-05 14:37:11.052', '2026-08-05 14:56:27.424', 0),
('cmsg6xuee002s8243f9x3dml7', 20, 'cmsg6xuaj00028243f4bdp7vn', 'Fantasy 5', 'fantasy-5', NULL, NULL, 1, '2026-08-05 14:37:11.079', '2026-08-05 14:56:27.437', 0),
('cmsg6xuf5003d82430vri83mv', 19, 'cmsg6xuaj00028243f4bdp7vn', 'Pick 3', 'pick-3', NULL, NULL, 1, '2026-08-05 14:37:11.106', '2026-08-05 14:56:27.448', 0);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `lottery_ball_types`
--

CREATE TABLE `lottery_ball_types` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `lotteryId` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `abbreviation` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `category` enum('MAIN','ADDITIONAL','MULTIPLIER') COLLATE utf8mb4_unicode_ci NOT NULL,
  `minBall` int DEFAULT NULL,
  `maxBall` int DEFAULT NULL,
  `allowZero` tinyint(1) NOT NULL DEFAULT '0',
  `isString` tinyint(1) NOT NULL DEFAULT '0',
  `isMultiplier` tinyint(1) NOT NULL DEFAULT '0',
  `playerPicked` tinyint(1) NOT NULL DEFAULT '0',
  `allowedValues` json DEFAULT NULL,
  `sortOrder` int NOT NULL DEFAULT '0',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `lottery_ball_types`
--

INSERT INTO `lottery_ball_types` (`id`, `lotteryId`, `name`, `abbreviation`, `category`, `minBall`, `maxBall`, `allowZero`, `isString`, `isMultiplier`, `playerPicked`, `allowedValues`, `sortOrder`, `createdAt`, `updatedAt`) VALUES
('cmsg6tnpz004fzqif84n31pwv', 'cmsg6tnpt004bzqifgzpx970r', 'bonus_number', 'bonus_number', 'ADDITIONAL', 1, 59, 0, 0, 0, 0, 'null', 0, '2026-08-05 14:33:55.800', '2026-08-05 14:33:55.800'),
('cmsg6tnq3004hzqifmo0y4wvi', 'cmsg6tnpt004bzqifgzpx970r', 'Bonus Number', 'BN', 'ADDITIONAL', NULL, NULL, 0, 0, 0, 0, NULL, 0, '2026-08-05 14:33:55.804', '2026-08-05 14:33:55.804'),
('cmsg6tnqz0054zqifse5vfq2i', 'cmsg6tnqu0050zqifdrxi2ynq', 'powerball', 'powerball', 'ADDITIONAL', 1, 26, 0, 0, 0, 1, 'null', 0, '2026-08-05 14:33:55.836', '2026-08-05 14:33:55.836'),
('cmsg6tnr20056zqifmue6zbdv', 'cmsg6tnqu0050zqifdrxi2ynq', 'powerplay', 'powerplay', 'MULTIPLIER', 2, 10, 0, 0, 1, 0, '\"[2,3,4,5,10]\"', 0, '2026-08-05 14:33:55.838', '2026-08-05 14:33:55.838'),
('cmsg6tnrx005vzqifiory2wt1', 'cmsg6tnrs005rzqif0vyv6ygg', 'mega_ball', 'mega_ball', 'ADDITIONAL', 1, 25, 0, 0, 0, 1, 'null', 0, '2026-08-05 14:33:55.870', '2026-08-05 14:33:55.870'),
('cmsg6tns0005xzqifcccv2jsy', 'cmsg6tnrs005rzqif0vyv6ygg', 'megaplier', 'megaplier', 'MULTIPLIER', 2, 5, 0, 0, 1, 0, '\"[2,3,4,5]\"', 0, '2026-08-05 14:33:55.872', '2026-08-05 14:33:55.872'),
('cmsg6tns3005zzqiff0z4i29v', 'cmsg6tnrs005rzqif0vyv6ygg', 'Mega Ball', 'MB', 'ADDITIONAL', NULL, NULL, 0, 0, 0, 0, NULL, 0, '2026-08-05 14:33:55.875', '2026-08-05 14:33:55.875'),
('cmsg6tnsz006mzqif4xlitqz9', 'cmsg6tnst006izqiftrw28d7r', 'cash_ball', 'cash_ball', 'ADDITIONAL', 1, 4, 0, 0, 0, 1, 'null', 0, '2026-08-05 14:33:55.907', '2026-08-05 14:33:55.907'),
('cmsg6tnt1006ozqifits1dyml', 'cmsg6tnst006izqiftrw28d7r', 'Cash Ball', 'CB', 'ADDITIONAL', NULL, NULL, 0, 0, 0, 0, NULL, 0, '2026-08-05 14:33:55.910', '2026-08-05 14:33:55.910'),
('cmsg6xuaw000882439x7h98kr', 'cmsg6xuao000482431xtlr097', 'mega_ball', 'mega_ball', 'ADDITIONAL', 1, 25, 0, 0, 0, 1, 'null', 0, '2026-08-05 14:37:10.952', '2026-08-05 14:37:10.952'),
('cmsg6xub0000a8243kqylczw5', 'cmsg6xuao000482431xtlr097', 'megaplier', 'megaplier', 'MULTIPLIER', 2, 5, 0, 0, 1, 0, '\"[2,3,4,5]\"', 0, '2026-08-05 14:37:10.956', '2026-08-05 14:37:10.956'),
('cmsg6xub2000c82431lpy6tf4', 'cmsg6xuao000482431xtlr097', 'Mega Ball', 'MB', 'ADDITIONAL', NULL, NULL, 0, 0, 0, 0, NULL, 0, '2026-08-05 14:37:10.959', '2026-08-05 14:37:10.959'),
('cmsg6xuc1000z82438bivz72o', 'cmsg6xubw000v8243aofllq4u', 'powerball', 'powerball', 'ADDITIONAL', 1, 26, 0, 0, 0, 1, 'null', 0, '2026-08-05 14:37:10.993', '2026-08-05 14:37:10.993'),
('cmsg6xuc400118243bfg6d8a0', 'cmsg6xubw000v8243aofllq4u', 'powerplay', 'powerplay', 'MULTIPLIER', 2, 10, 0, 0, 1, 0, '\"[2,3,4,5,10]\"', 0, '2026-08-05 14:37:10.997', '2026-08-05 14:37:10.997'),
('cmsg7lg3u0003w7svknuu7vor', 'cmsg6xubw000v8243aofllq4u', 'Powerball', 'PB', 'ADDITIONAL', NULL, NULL, 0, 0, 0, 0, NULL, 2, '2026-08-05 14:55:32.298', '2026-08-05 14:55:32.298'),
('cmsg7lg3w0005w7sv4bpin7k8', 'cmsg6xubw000v8243aofllq4u', 'Power Play', 'PP', 'ADDITIONAL', NULL, NULL, 0, 0, 1, 0, NULL, 3, '2026-08-05 14:55:32.301', '2026-08-05 14:55:32.301'),
('cmsg7lg49000nw7svotlbr9g1', 'cmsg6xuao000482431xtlr097', 'Megaplier', 'M', 'ADDITIONAL', NULL, NULL, 0, 0, 1, 0, NULL, 4, '2026-08-05 14:55:32.313', '2026-08-05 14:55:32.313');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `lottery_configurations`
--

CREATE TABLE `lottery_configurations` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `lotteryId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `drawTimezone` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `drawTime` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `stopSaleTime` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `claimDeadline` int DEFAULT NULL,
  `allowZero` tinyint(1) NOT NULL DEFAULT '0',
  `minBall` int NOT NULL,
  `maxBall` int NOT NULL,
  `drawnNumbers` int NOT NULL,
  `selectableBalls` int NOT NULL,
  `minimumSelectableBalls` int NOT NULL,
  `uniqueMainNumbers` int NOT NULL DEFAULT '1',
  `uniqueExtraNumbers` int DEFAULT NULL,
  `allowDuplicates` tinyint(1) NOT NULL DEFAULT '0',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `lottery_configurations`
--

INSERT INTO `lottery_configurations` (`id`, `lotteryId`, `drawTimezone`, `drawTime`, `stopSaleTime`, `claimDeadline`, `allowZero`, `minBall`, `maxBall`, `drawnNumbers`, `selectableBalls`, `minimumSelectableBalls`, `uniqueMainNumbers`, `uniqueExtraNumbers`, `allowDuplicates`, `createdAt`, `updatedAt`) VALUES
('cmsg6tnk9000azqif08pwra2o', 'cmsg6tnk50008zqify7wrujsz', 'America/New_York', '14:30', '14:15', 365, 1, 0, 9, 3, 3, 3, 0, 0, 1, '2026-08-05 14:33:55.594', '2026-08-05 14:33:55.594'),
('cmsg6tnl8000vzqiffh6yum9g', 'cmsg6tnl4000tzqifcei03r2l', 'America/New_York', '22:30', '22:20', 365, 1, 0, 9, 3, 3, 3, 0, 0, 1, '2026-08-05 14:33:55.628', '2026-08-05 14:33:55.628'),
('cmsg6tnm1001gzqifxsttgdst', 'cmsg6tnly001ezqifztsfl8y5', 'America/New_York', '14:30', '14:15', 365, 1, 0, 9, 4, 4, 4, 0, 0, 1, '2026-08-05 14:33:55.657', '2026-08-05 14:33:55.657'),
('cmsg6tnmu0021zqif95uhu30b', 'cmsg6tnmr001zzqif9mfcgnxn', 'America/New_York', '22:30', '22:20', 365, 1, 0, 9, 4, 4, 4, 0, 0, 1, '2026-08-05 14:33:55.686', '2026-08-05 14:33:55.686'),
('cmsg6tnnk002mzqifrr0bkmyo', 'cmsg6tnni002kzqifpz9pjah9', 'America/New_York', '14:30', '14:15', 365, 0, 1, 39, 5, 5, 5, 1, 0, 0, '2026-08-05 14:33:55.713', '2026-08-05 14:33:55.713'),
('cmsg6tnoe0037zqifybad91q8', 'cmsg6tnob0035zqifrvetln9z', 'America/New_York', '22:30', '22:20', 365, 0, 1, 39, 5, 5, 5, 1, 0, 0, '2026-08-05 14:33:55.742', '2026-08-05 14:33:55.742'),
('cmsg6tnp6003szqifbjouuc8x', 'cmsg6tnp3003qzqifihskfury', 'America/New_York', '20:30', '20:00', 365, 0, 1, 80, 20, 10, 10, 1, 0, 0, '2026-08-05 14:33:55.770', '2026-08-05 14:33:55.770'),
('cmsg6tnpw004dzqiftfspfr9q', 'cmsg6tnpt004bzqifgzpx970r', 'America/New_York', '20:15', '20:00', 365, 0, 1, 59, 6, 6, 6, 1, 1, 0, '2026-08-05 14:33:55.796', '2026-08-05 14:33:55.796'),
('cmsg6tnqx0052zqifxuuru0t1', 'cmsg6tnqu0050zqifdrxi2ynq', 'America/New_York', '22:59', '22:00', 365, 0, 1, 69, 5, 5, 5, 1, 0, 0, '2026-08-05 14:33:55.833', '2026-08-05 14:33:55.833'),
('cmsg6tnrv005tzqif4pklttx7', 'cmsg6tnrs005rzqif0vyv6ygg', 'America/Detroit', '23:00', '22:45', 365, 0, 1, 70, 5, 5, 5, 1, 0, 0, '2026-08-05 14:33:55.867', '2026-08-05 14:33:55.867'),
('cmsg6tnsw006kzqifg41pp8r7', 'cmsg6tnst006izqiftrw28d7r', 'America/New_York', '21:00', '20:45', 365, 0, 1, 60, 5, 5, 5, 1, 0, 0, '2026-08-05 14:33:55.904', '2026-08-05 14:33:55.904'),
('cmsg6xuas00068243vh6gar2i', 'cmsg6xuao000482431xtlr097', 'America/Detroit', '23:00', '22:45', 365, 0, 1, 70, 5, 5, 5, 1, 0, 0, '2026-08-05 14:37:10.949', '2026-08-05 14:37:10.949'),
('cmsg6xuby000x8243is05jmi4', 'cmsg6xubw000v8243aofllq4u', 'America/New_York', '22:59', '22:00', 365, 0, 1, 69, 5, 5, 5, 1, 0, 0, '2026-08-05 14:37:10.991', '2026-08-05 14:37:10.991'),
('cmsg6xucw001o82439n529b6g', 'cmsg6xucs001m824300vfahab', 'America/Phoenix', '19:00', '18:59', 180, 0, 1, 42, 6, 6, 6, 1, 0, 0, '2026-08-05 14:37:11.025', '2026-08-05 14:37:11.025'),
('cmsg6xudr00298243o8caivo0', 'cmsg6xudn0027824326ga2yyi', 'America/Phoenix', '19:04', '18:59', 180, 0, 1, 44, 6, 6, 6, 1, 0, 0, '2026-08-05 14:37:11.055', '2026-08-05 14:37:11.055'),
('cmsg6xueh002u8243n4nti7fy', 'cmsg6xuee002s8243f9x3dml7', 'America/Phoenix', '19:00', '18:59', 180, 0, 1, 41, 5, 5, 5, 1, 0, 0, '2026-08-05 14:37:11.081', '2026-08-05 14:37:11.081'),
('cmsg6xuf8003f8243131cqkl4', 'cmsg6xuf5003d82430vri83mv', 'America/Phoenix', '19:00', '18:59', 180, 1, 0, 9, 3, 3, 3, 0, 0, 1, '2026-08-05 14:37:11.109', '2026-08-05 14:37:11.109');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `lottery_draw_schedules`
--

CREATE TABLE `lottery_draw_schedules` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `lotteryId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `dayOfWeek` enum('SUNDAY','MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY') COLLATE utf8mb4_unicode_ci NOT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT '1',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `lottery_draw_schedules`
--

INSERT INTO `lottery_draw_schedules` (`id`, `lotteryId`, `dayOfWeek`, `isActive`, `createdAt`) VALUES
('cmsg6tnke000czqif9a37kcqk', 'cmsg6tnk50008zqify7wrujsz', 'SUNDAY', 1, '2026-08-05 14:33:55.598'),
('cmsg6tnkj000ezqifr4d6jlyh', 'cmsg6tnk50008zqify7wrujsz', 'MONDAY', 1, '2026-08-05 14:33:55.603'),
('cmsg6tnkm000gzqifys1lh8pt', 'cmsg6tnk50008zqify7wrujsz', 'TUESDAY', 1, '2026-08-05 14:33:55.606'),
('cmsg6tnko000izqifobgw4jxp', 'cmsg6tnk50008zqify7wrujsz', 'WEDNESDAY', 1, '2026-08-05 14:33:55.609'),
('cmsg6tnkr000kzqif3suhop11', 'cmsg6tnk50008zqify7wrujsz', 'THURSDAY', 1, '2026-08-05 14:33:55.611'),
('cmsg6tnku000mzqifcwd6mxc0', 'cmsg6tnk50008zqify7wrujsz', 'FRIDAY', 1, '2026-08-05 14:33:55.614'),
('cmsg6tnkw000ozqif8dew0fgh', 'cmsg6tnk50008zqify7wrujsz', 'SATURDAY', 1, '2026-08-05 14:33:55.617'),
('cmsg6tnla000xzqif9b11cg65', 'cmsg6tnl4000tzqifcei03r2l', 'SUNDAY', 1, '2026-08-05 14:33:55.631'),
('cmsg6tnld000zzqifsb9bi5zi', 'cmsg6tnl4000tzqifcei03r2l', 'MONDAY', 1, '2026-08-05 14:33:55.633'),
('cmsg6tnlf0011zqife3isuz7e', 'cmsg6tnl4000tzqifcei03r2l', 'TUESDAY', 1, '2026-08-05 14:33:55.636'),
('cmsg6tnli0013zqif3xhw8hed', 'cmsg6tnl4000tzqifcei03r2l', 'WEDNESDAY', 1, '2026-08-05 14:33:55.638'),
('cmsg6tnlk0015zqifk001eko2', 'cmsg6tnl4000tzqifcei03r2l', 'THURSDAY', 1, '2026-08-05 14:33:55.641'),
('cmsg6tnln0017zqif40bblai1', 'cmsg6tnl4000tzqifcei03r2l', 'FRIDAY', 1, '2026-08-05 14:33:55.643'),
('cmsg6tnlq0019zqif8nujjftl', 'cmsg6tnl4000tzqifcei03r2l', 'SATURDAY', 1, '2026-08-05 14:33:55.647'),
('cmsg6tnm3001izqif4qjf9cjg', 'cmsg6tnly001ezqifztsfl8y5', 'SUNDAY', 1, '2026-08-05 14:33:55.660'),
('cmsg6tnm6001kzqif84okaozg', 'cmsg6tnly001ezqifztsfl8y5', 'MONDAY', 1, '2026-08-05 14:33:55.662'),
('cmsg6tnm8001mzqif7twuqdrx', 'cmsg6tnly001ezqifztsfl8y5', 'TUESDAY', 1, '2026-08-05 14:33:55.665'),
('cmsg6tnmb001ozqifyzf1se35', 'cmsg6tnly001ezqifztsfl8y5', 'WEDNESDAY', 1, '2026-08-05 14:33:55.667'),
('cmsg6tnme001qzqifb6zybqrv', 'cmsg6tnly001ezqifztsfl8y5', 'THURSDAY', 1, '2026-08-05 14:33:55.670'),
('cmsg6tnmh001szqifecxc3s49', 'cmsg6tnly001ezqifztsfl8y5', 'FRIDAY', 1, '2026-08-05 14:33:55.673'),
('cmsg6tnmk001uzqiff1c7e3tj', 'cmsg6tnly001ezqifztsfl8y5', 'SATURDAY', 1, '2026-08-05 14:33:55.676'),
('cmsg6tnmw0023zqifl4enobfs', 'cmsg6tnmr001zzqif9mfcgnxn', 'SUNDAY', 1, '2026-08-05 14:33:55.689'),
('cmsg6tnmz0025zqiff9i70hl7', 'cmsg6tnmr001zzqif9mfcgnxn', 'MONDAY', 1, '2026-08-05 14:33:55.692'),
('cmsg6tnn20027zqif9vgcze5k', 'cmsg6tnmr001zzqif9mfcgnxn', 'TUESDAY', 1, '2026-08-05 14:33:55.694'),
('cmsg6tnn40029zqify6i4s0qp', 'cmsg6tnmr001zzqif9mfcgnxn', 'WEDNESDAY', 1, '2026-08-05 14:33:55.697'),
('cmsg6tnn6002bzqifys0mjnv8', 'cmsg6tnmr001zzqif9mfcgnxn', 'THURSDAY', 1, '2026-08-05 14:33:55.699'),
('cmsg6tnn9002dzqifx83xylmp', 'cmsg6tnmr001zzqif9mfcgnxn', 'FRIDAY', 1, '2026-08-05 14:33:55.701'),
('cmsg6tnnc002fzqifrhtkthlo', 'cmsg6tnmr001zzqif9mfcgnxn', 'SATURDAY', 1, '2026-08-05 14:33:55.704'),
('cmsg6tnnn002ozqif3e21qduk', 'cmsg6tnni002kzqifpz9pjah9', 'SUNDAY', 1, '2026-08-05 14:33:55.715'),
('cmsg6tnnp002qzqifq21v9iv7', 'cmsg6tnni002kzqifpz9pjah9', 'MONDAY', 1, '2026-08-05 14:33:55.718'),
('cmsg6tnns002szqifs392onya', 'cmsg6tnni002kzqifpz9pjah9', 'TUESDAY', 1, '2026-08-05 14:33:55.720'),
('cmsg6tnnu002uzqiflhdsp9lv', 'cmsg6tnni002kzqifpz9pjah9', 'WEDNESDAY', 1, '2026-08-05 14:33:55.723'),
('cmsg6tnnx002wzqifzxxw6vvw', 'cmsg6tnni002kzqifpz9pjah9', 'THURSDAY', 1, '2026-08-05 14:33:55.725'),
('cmsg6tno1002yzqifsexineq7', 'cmsg6tnni002kzqifpz9pjah9', 'FRIDAY', 1, '2026-08-05 14:33:55.729'),
('cmsg6tno40030zqifn2dy3e22', 'cmsg6tnni002kzqifpz9pjah9', 'SATURDAY', 1, '2026-08-05 14:33:55.732'),
('cmsg6tnog0039zqif6j0f0jqh', 'cmsg6tnob0035zqifrvetln9z', 'SUNDAY', 1, '2026-08-05 14:33:55.745'),
('cmsg6tnoj003bzqifwizqvktr', 'cmsg6tnob0035zqifrvetln9z', 'MONDAY', 1, '2026-08-05 14:33:55.747'),
('cmsg6tnol003dzqif316la54e', 'cmsg6tnob0035zqifrvetln9z', 'TUESDAY', 1, '2026-08-05 14:33:55.749'),
('cmsg6tnoo003fzqif6ck3ddov', 'cmsg6tnob0035zqifrvetln9z', 'WEDNESDAY', 1, '2026-08-05 14:33:55.753'),
('cmsg6tnoq003hzqifal1fkhec', 'cmsg6tnob0035zqifrvetln9z', 'THURSDAY', 1, '2026-08-05 14:33:55.755'),
('cmsg6tnot003jzqifbexp44i0', 'cmsg6tnob0035zqifrvetln9z', 'FRIDAY', 1, '2026-08-05 14:33:55.758'),
('cmsg6tnov003lzqifz35b91a0', 'cmsg6tnob0035zqifrvetln9z', 'SATURDAY', 1, '2026-08-05 14:33:55.760'),
('cmsg6tnp9003uzqifwjqz28eb', 'cmsg6tnp3003qzqifihskfury', 'SUNDAY', 1, '2026-08-05 14:33:55.773'),
('cmsg6tnpb003wzqifb6cxcu1e', 'cmsg6tnp3003qzqifihskfury', 'MONDAY', 1, '2026-08-05 14:33:55.775'),
('cmsg6tnpd003yzqifzfwj1obz', 'cmsg6tnp3003qzqifihskfury', 'TUESDAY', 1, '2026-08-05 14:33:55.778'),
('cmsg6tnpg0040zqif8awng35q', 'cmsg6tnp3003qzqifihskfury', 'WEDNESDAY', 1, '2026-08-05 14:33:55.780'),
('cmsg6tnpi0042zqifyy463i1x', 'cmsg6tnp3003qzqifihskfury', 'THURSDAY', 1, '2026-08-05 14:33:55.783'),
('cmsg6tnpl0044zqif0v4ft37t', 'cmsg6tnp3003qzqifihskfury', 'FRIDAY', 1, '2026-08-05 14:33:55.785'),
('cmsg6tnpn0046zqifj13htot9', 'cmsg6tnp3003qzqifihskfury', 'SATURDAY', 1, '2026-08-05 14:33:55.788'),
('cmsg6tnq6004jzqif4f328gch', 'cmsg6tnpt004bzqifgzpx970r', 'SUNDAY', 0, '2026-08-05 14:33:55.807'),
('cmsg6tnqa004lzqif5ybrpyp9', 'cmsg6tnpt004bzqifgzpx970r', 'MONDAY', 0, '2026-08-05 14:33:55.810'),
('cmsg6tnqd004nzqif7anb1jx3', 'cmsg6tnpt004bzqifgzpx970r', 'TUESDAY', 0, '2026-08-05 14:33:55.814'),
('cmsg6tnqg004pzqifwds029pq', 'cmsg6tnpt004bzqifgzpx970r', 'WEDNESDAY', 1, '2026-08-05 14:33:55.816'),
('cmsg6tnqi004rzqifql4v0jnv', 'cmsg6tnpt004bzqifgzpx970r', 'THURSDAY', 0, '2026-08-05 14:33:55.819'),
('cmsg6tnql004tzqifbml0ijyw', 'cmsg6tnpt004bzqifgzpx970r', 'FRIDAY', 0, '2026-08-05 14:33:55.821'),
('cmsg6tnqn004vzqif26ih9t0o', 'cmsg6tnpt004bzqifgzpx970r', 'SATURDAY', 1, '2026-08-05 14:33:55.824'),
('cmsg6tnr5005azqifruoh0bc3', 'cmsg6tnqu0050zqifdrxi2ynq', 'SUNDAY', 0, '2026-08-05 14:33:55.842'),
('cmsg6tnr9005czqifofq9dalf', 'cmsg6tnqu0050zqifdrxi2ynq', 'MONDAY', 1, '2026-08-05 14:33:55.845'),
('cmsg6tnrb005ezqifj53i0cvh', 'cmsg6tnqu0050zqifdrxi2ynq', 'TUESDAY', 0, '2026-08-05 14:33:55.848'),
('cmsg6tnre005gzqiflbqt0r5z', 'cmsg6tnqu0050zqifdrxi2ynq', 'WEDNESDAY', 1, '2026-08-05 14:33:55.850'),
('cmsg6tnrh005izqif7jmehwxk', 'cmsg6tnqu0050zqifdrxi2ynq', 'THURSDAY', 0, '2026-08-05 14:33:55.853'),
('cmsg6tnrj005kzqif9if3piss', 'cmsg6tnqu0050zqifdrxi2ynq', 'FRIDAY', 0, '2026-08-05 14:33:55.856'),
('cmsg6tnrm005mzqifnrg8lvrh', 'cmsg6tnqu0050zqifdrxi2ynq', 'SATURDAY', 1, '2026-08-05 14:33:55.858'),
('cmsg6tns50061zqifoybgc63m', 'cmsg6tnrs005rzqif0vyv6ygg', 'SUNDAY', 0, '2026-08-05 14:33:55.878'),
('cmsg6tns80063zqif7xugluqb', 'cmsg6tnrs005rzqif0vyv6ygg', 'MONDAY', 0, '2026-08-05 14:33:55.880'),
('cmsg6tnsa0065zqifciexjnkg', 'cmsg6tnrs005rzqif0vyv6ygg', 'TUESDAY', 1, '2026-08-05 14:33:55.883'),
('cmsg6tnsd0067zqif0be3rlmb', 'cmsg6tnrs005rzqif0vyv6ygg', 'WEDNESDAY', 0, '2026-08-05 14:33:55.885'),
('cmsg6tnsg0069zqifb3z68kkd', 'cmsg6tnrs005rzqif0vyv6ygg', 'THURSDAY', 0, '2026-08-05 14:33:55.888'),
('cmsg6tnsk006bzqif3tagyb78', 'cmsg6tnrs005rzqif0vyv6ygg', 'FRIDAY', 1, '2026-08-05 14:33:55.892'),
('cmsg6tnsm006dzqifq50adgak', 'cmsg6tnrs005rzqif0vyv6ygg', 'SATURDAY', 0, '2026-08-05 14:33:55.895'),
('cmsg6tnt4006qzqif76odpcjv', 'cmsg6tnst006izqiftrw28d7r', 'SUNDAY', 1, '2026-08-05 14:33:55.912'),
('cmsg6tnt6006szqif19kuextz', 'cmsg6tnst006izqiftrw28d7r', 'MONDAY', 1, '2026-08-05 14:33:55.915'),
('cmsg6tnt9006uzqifyaenb3wz', 'cmsg6tnst006izqiftrw28d7r', 'TUESDAY', 1, '2026-08-05 14:33:55.917'),
('cmsg6tntb006wzqifxa3six52', 'cmsg6tnst006izqiftrw28d7r', 'WEDNESDAY', 1, '2026-08-05 14:33:55.920'),
('cmsg6tnte006yzqifk7s130x1', 'cmsg6tnst006izqiftrw28d7r', 'THURSDAY', 1, '2026-08-05 14:33:55.922'),
('cmsg6tntg0070zqif0of1xpq4', 'cmsg6tnst006izqiftrw28d7r', 'FRIDAY', 1, '2026-08-05 14:33:55.925'),
('cmsg6tntj0072zqifkzoee4nc', 'cmsg6tnst006izqiftrw28d7r', 'SATURDAY', 1, '2026-08-05 14:33:55.927'),
('cmsg6xub8000e8243472ms3bq', 'cmsg6xuao000482431xtlr097', 'SUNDAY', 0, '2026-08-05 14:37:10.964'),
('cmsg6xubc000g8243vtkfff24', 'cmsg6xuao000482431xtlr097', 'MONDAY', 0, '2026-08-05 14:37:10.968'),
('cmsg6xube000i8243gh9wo78g', 'cmsg6xuao000482431xtlr097', 'TUESDAY', 1, '2026-08-05 14:37:10.971'),
('cmsg6xubh000k8243eia3iwtm', 'cmsg6xuao000482431xtlr097', 'WEDNESDAY', 0, '2026-08-05 14:37:10.973'),
('cmsg6xubk000m8243qsccu8c8', 'cmsg6xuao000482431xtlr097', 'THURSDAY', 0, '2026-08-05 14:37:10.976'),
('cmsg6xubm000o8243mfelrsrh', 'cmsg6xuao000482431xtlr097', 'FRIDAY', 1, '2026-08-05 14:37:10.978'),
('cmsg6xubo000q8243l55476pt', 'cmsg6xuao000482431xtlr097', 'SATURDAY', 0, '2026-08-05 14:37:10.981'),
('cmsg6xuc700158243k64wv4js', 'cmsg6xubw000v8243aofllq4u', 'SUNDAY', 0, '2026-08-05 14:37:11.000'),
('cmsg6xuca0017824344gigwe4', 'cmsg6xubw000v8243aofllq4u', 'MONDAY', 1, '2026-08-05 14:37:11.002'),
('cmsg6xucc00198243phjyz78p', 'cmsg6xubw000v8243aofllq4u', 'TUESDAY', 0, '2026-08-05 14:37:11.005'),
('cmsg6xucf001b82434axuli8h', 'cmsg6xubw000v8243aofllq4u', 'WEDNESDAY', 1, '2026-08-05 14:37:11.007'),
('cmsg6xuch001d8243my0ydsqu', 'cmsg6xubw000v8243aofllq4u', 'THURSDAY', 0, '2026-08-05 14:37:11.010'),
('cmsg6xuck001f82436178k2kc', 'cmsg6xubw000v8243aofllq4u', 'FRIDAY', 0, '2026-08-05 14:37:11.012'),
('cmsg6xucm001h8243987rotqt', 'cmsg6xubw000v8243aofllq4u', 'SATURDAY', 1, '2026-08-05 14:37:11.014'),
('cmsg6xucz001q8243cgc53ep9', 'cmsg6xucs001m824300vfahab', 'SUNDAY', 1, '2026-08-05 14:37:11.028'),
('cmsg6xud1001s8243pk35kj30', 'cmsg6xucs001m824300vfahab', 'MONDAY', 1, '2026-08-05 14:37:11.030'),
('cmsg6xud4001u8243bemydzcx', 'cmsg6xucs001m824300vfahab', 'TUESDAY', 1, '2026-08-05 14:37:11.032'),
('cmsg6xud6001w8243dgjln93y', 'cmsg6xucs001m824300vfahab', 'WEDNESDAY', 1, '2026-08-05 14:37:11.035'),
('cmsg6xud9001y82433f9wbiws', 'cmsg6xucs001m824300vfahab', 'THURSDAY', 1, '2026-08-05 14:37:11.037'),
('cmsg6xudc00208243905wqtxh', 'cmsg6xucs001m824300vfahab', 'FRIDAY', 1, '2026-08-05 14:37:11.040'),
('cmsg6xudg00228243x4ja2vt8', 'cmsg6xucs001m824300vfahab', 'SATURDAY', 1, '2026-08-05 14:37:11.044'),
('cmsg6xudu002b8243ts77okqa', 'cmsg6xudn0027824326ga2yyi', 'SUNDAY', 0, '2026-08-05 14:37:11.058'),
('cmsg6xudw002d8243mubqyxv7', 'cmsg6xudn0027824326ga2yyi', 'MONDAY', 1, '2026-08-05 14:37:11.061'),
('cmsg6xudy002f8243qfmeabww', 'cmsg6xudn0027824326ga2yyi', 'TUESDAY', 0, '2026-08-05 14:37:11.063'),
('cmsg6xue1002h8243o8a067fc', 'cmsg6xudn0027824326ga2yyi', 'WEDNESDAY', 1, '2026-08-05 14:37:11.065'),
('cmsg6xue3002j82431jzilo3n', 'cmsg6xudn0027824326ga2yyi', 'THURSDAY', 0, '2026-08-05 14:37:11.068'),
('cmsg6xue6002l8243nswucc97', 'cmsg6xudn0027824326ga2yyi', 'FRIDAY', 0, '2026-08-05 14:37:11.070'),
('cmsg6xue8002n82437lu0ewsr', 'cmsg6xudn0027824326ga2yyi', 'SATURDAY', 1, '2026-08-05 14:37:11.073'),
('cmsg6xuek002w82439de91jpb', 'cmsg6xuee002s8243f9x3dml7', 'SUNDAY', 1, '2026-08-05 14:37:11.084'),
('cmsg6xuem002y82430x0is74o', 'cmsg6xuee002s8243f9x3dml7', 'MONDAY', 1, '2026-08-05 14:37:11.087'),
('cmsg6xueo00308243yrrbbgs7', 'cmsg6xuee002s8243f9x3dml7', 'TUESDAY', 1, '2026-08-05 14:37:11.089'),
('cmsg6xuer00328243chbi7snf', 'cmsg6xuee002s8243f9x3dml7', 'WEDNESDAY', 1, '2026-08-05 14:37:11.092'),
('cmsg6xueu00348243ypw5wd0l', 'cmsg6xuee002s8243f9x3dml7', 'THURSDAY', 1, '2026-08-05 14:37:11.094'),
('cmsg6xuew00368243dt0bgoss', 'cmsg6xuee002s8243f9x3dml7', 'FRIDAY', 1, '2026-08-05 14:37:11.097'),
('cmsg6xuey00388243yxidw3x9', 'cmsg6xuee002s8243f9x3dml7', 'SATURDAY', 1, '2026-08-05 14:37:11.099'),
('cmsg6xufb003h8243gff70abu', 'cmsg6xuf5003d82430vri83mv', 'SUNDAY', 1, '2026-08-05 14:37:11.111'),
('cmsg6xufd003j8243mgxc2aqy', 'cmsg6xuf5003d82430vri83mv', 'MONDAY', 1, '2026-08-05 14:37:11.113'),
('cmsg6xufg003l8243ozibvlq5', 'cmsg6xuf5003d82430vri83mv', 'TUESDAY', 1, '2026-08-05 14:37:11.116'),
('cmsg6xufi003n8243w4dmu6a8', 'cmsg6xuf5003d82430vri83mv', 'WEDNESDAY', 1, '2026-08-05 14:37:11.119'),
('cmsg6xufl003p8243t2u34400', 'cmsg6xuf5003d82430vri83mv', 'THURSDAY', 1, '2026-08-05 14:37:11.122'),
('cmsg6xufp003r82431ny91i26', 'cmsg6xuf5003d82430vri83mv', 'FRIDAY', 1, '2026-08-05 14:37:11.125'),
('cmsg6xufr003t8243xe2uj9lp', 'cmsg6xuf5003d82430vri83mv', 'SATURDAY', 1, '2026-08-05 14:37:11.128');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `prize_breakdowns`
--

CREATE TABLE `prize_breakdowns` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `drawId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `matchPattern` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `prizeAmountRaw` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `prizeAmount` decimal(15,2) DEFAULT NULL,
  `winnersCount` int DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `prize_breakdowns`
--

INSERT INTO `prize_breakdowns` (`id`, `drawId`, `matchPattern`, `prizeAmountRaw`, `prizeAmount`, `winnersCount`, `createdAt`) VALUES
('cmsg6vvzj000e2buhz5gm99kz', 'cmsg6vvzj00012buhunubb05h', '5 + 1', '$748 Million', 748000000.00, 0, '2026-08-05 14:35:39.824'),
('cmsg6vvzj000f2buhmi6j7ifs', 'cmsg6vvzj00012buhunubb05h', '5 + 0', '$1 Million', 1000000.00, 0, '2026-08-05 14:35:39.824'),
('cmsg6vvzj000g2buhrpgekxjr', 'cmsg6vvzj00012buhunubb05h', '4 + 1', '$50,000', 50000.00, 0, '2026-08-05 14:35:39.824'),
('cmsg6vvzj000h2buheb2o7juu', 'cmsg6vvzj00012buhunubb05h', '4 + 0', '$100', 100.00, 0, '2026-08-05 14:35:39.824'),
('cmsg6vvzj000i2buhslc1n640', 'cmsg6vvzj00012buhunubb05h', '3 + 1', '$100', 100.00, 0, '2026-08-05 14:35:39.824'),
('cmsg6vvzj000j2buh7ffhgv2h', 'cmsg6vvzj00012buhunubb05h', '3 + 0', '$7', 7.00, 0, '2026-08-05 14:35:39.824'),
('cmsg6vvzj000k2buh2ufboih7', 'cmsg6vvzj00012buhunubb05h', '2 + 1', '$7', 7.00, 0, '2026-08-05 14:35:39.824'),
('cmsg6vvzj000l2buhopilwopc', 'cmsg6vvzj00012buhunubb05h', '1 + 1', '$4', 4.00, 0, '2026-08-05 14:35:39.824'),
('cmsg6vvzj000m2buhou4sxq8e', 'cmsg6vvzj00012buhunubb05h', '0 + 1', '$4', 4.00, 0, '2026-08-05 14:35:39.824'),
('cmsg6y8mp000ecyorrpjiy9ey', 'cmsg6y8mp0001cyormo0ma33k', '5 + 1', '$748 Million', 748000000.00, 0, '2026-08-05 14:37:29.522'),
('cmsg6y8mp000fcyordpazbl1w', 'cmsg6y8mp0001cyormo0ma33k', '5 + 0', '$1 Million', 1000000.00, 0, '2026-08-05 14:37:29.522'),
('cmsg6y8mp000gcyorjsj91gfx', 'cmsg6y8mp0001cyormo0ma33k', '4 + 1', '$50,000', 50000.00, 0, '2026-08-05 14:37:29.522'),
('cmsg6y8mp000hcyoru5vdg4wy', 'cmsg6y8mp0001cyormo0ma33k', '4 + 0', '$100', 100.00, 0, '2026-08-05 14:37:29.522'),
('cmsg6y8mp000icyor9e9zzw0z', 'cmsg6y8mp0001cyormo0ma33k', '3 + 1', '$100', 100.00, 0, '2026-08-05 14:37:29.522'),
('cmsg6y8mp000jcyor6v8krvv5', 'cmsg6y8mp0001cyormo0ma33k', '3 + 0', '$7', 7.00, 0, '2026-08-05 14:37:29.522'),
('cmsg6y8mp000kcyorm06884x6', 'cmsg6y8mp0001cyormo0ma33k', '2 + 1', '$7', 7.00, 0, '2026-08-05 14:37:29.522'),
('cmsg6y8mp000lcyorzuodvoc6', 'cmsg6y8mp0001cyormo0ma33k', '1 + 1', '$4', 4.00, 0, '2026-08-05 14:37:29.522'),
('cmsg6y8mq000mcyorgpb8hzg0', 'cmsg6y8mp0001cyormo0ma33k', '0 + 1', '$4', 4.00, 0, '2026-08-05 14:37:29.522');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `states`
--

CREATE TABLE `states` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `countryId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `taxRate` decimal(5,2) NOT NULL,
  `minimumLegalAge` int NOT NULL DEFAULT '18',
  `isActive` tinyint(1) NOT NULL DEFAULT '1',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `states`
--

INSERT INTO `states` (`id`, `countryId`, `name`, `code`, `slug`, `taxRate`, `minimumLegalAge`, `isActive`, `createdAt`, `updatedAt`) VALUES
('cmsg6tnjz0006zqifneamo690', 'cmsg6tnjm0004zqifp4yeza8t', 'New York', 'NY', 'new-york', 8.82, 18, 1, '2026-08-05 14:33:55.583', '2026-08-05 14:35:39.983'),
('cmsg6xuaj00028243f4bdp7vn', 'cmsg6tnjm0004zqifp4yeza8t', 'Arizona', 'AZ', 'arizona', 4.80, 21, 1, '2026-08-05 14:37:10.940', '2026-08-05 14:56:27.445');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `_prisma_migrations`
--

CREATE TABLE `_prisma_migrations` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `checksum` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `finished_at` datetime(3) DEFAULT NULL,
  `migration_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `logs` text COLLATE utf8mb4_unicode_ci,
  `rolled_back_at` datetime(3) DEFAULT NULL,
  `started_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `applied_steps_count` int UNSIGNED NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `_prisma_migrations`
--

INSERT INTO `_prisma_migrations` (`id`, `checksum`, `finished_at`, `migration_name`, `logs`, `rolled_back_at`, `started_at`, `applied_steps_count`) VALUES
('5e44b207-39af-4961-92ba-88f8c7737712', '659e8333dbcf9e69772fab9278d147b1784265af75d5ff7ea54e99462e980365', '2026-07-31 16:46:41.489', '20260731_isMultiState_lottery', NULL, NULL, '2026-07-31 16:46:41.446', 1),
('dd9f98f3-0c0f-4fb2-afe1-605ae5f098f4', 'a6b5a03cd4221b6b0454d0bc327fb2ae4d3965675e395a6f01056c524f3cfcf9', '2026-07-28 19:13:26.434', '20260728191325_v2_schema', NULL, NULL, '2026-07-28 19:13:25.852', 1);

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `api_request_logs`
--
ALTER TABLE `api_request_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `api_request_logs_countryId_requestedAt_idx` (`countryId`,`requestedAt`),
  ADD KEY `api_request_logs_endpoint_idx` (`endpoint`);

--
-- Indices de la tabla `countries`
--
ALTER TABLE `countries`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `countries_code_key` (`code`),
  ADD UNIQUE KEY `countries_slug_key` (`slug`);

--
-- Indices de la tabla `draws`
--
ALTER TABLE `draws`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `draws_lotteryId_externalDrawId_key` (`lotteryId`,`externalDrawId`),
  ADD KEY `draws_lotteryId_drawDate_idx` (`lotteryId`,`drawDate`),
  ADD KEY `draws_drawDate_idx` (`drawDate`);

--
-- Indices de la tabla `draw_numbers`
--
ALTER TABLE `draw_numbers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `draw_numbers_drawId_category_position_key` (`drawId`,`category`,`position`),
  ADD KEY `draw_numbers_drawId_idx` (`drawId`),
  ADD KEY `draw_numbers_ballTypeId_idx` (`ballTypeId`);

--
-- Indices de la tabla `jackpot_history`
--
ALTER TABLE `jackpot_history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `jackpot_history_drawId_recordedAt_idx` (`drawId`,`recordedAt`);

--
-- Indices de la tabla `lotteries`
--
ALTER TABLE `lotteries`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `lotteries_stateId_slug_key` (`stateId`,`slug`),
  ADD KEY `lotteries_stateId_idx` (`stateId`),
  ADD KEY `lotteries_externalId_idx` (`externalId`);

--
-- Indices de la tabla `lottery_ball_types`
--
ALTER TABLE `lottery_ball_types`
  ADD PRIMARY KEY (`id`),
  ADD KEY `lottery_ball_types_lotteryId_idx` (`lotteryId`);

--
-- Indices de la tabla `lottery_configurations`
--
ALTER TABLE `lottery_configurations`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `lottery_configurations_lotteryId_key` (`lotteryId`);

--
-- Indices de la tabla `lottery_draw_schedules`
--
ALTER TABLE `lottery_draw_schedules`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `lottery_draw_schedules_lotteryId_dayOfWeek_key` (`lotteryId`,`dayOfWeek`),
  ADD KEY `lottery_draw_schedules_lotteryId_idx` (`lotteryId`);

--
-- Indices de la tabla `prize_breakdowns`
--
ALTER TABLE `prize_breakdowns`
  ADD PRIMARY KEY (`id`),
  ADD KEY `prize_breakdowns_drawId_idx` (`drawId`);

--
-- Indices de la tabla `states`
--
ALTER TABLE `states`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `states_countryId_code_key` (`countryId`,`code`),
  ADD UNIQUE KEY `states_countryId_slug_key` (`countryId`,`slug`),
  ADD KEY `states_countryId_idx` (`countryId`);

--
-- Indices de la tabla `_prisma_migrations`
--
ALTER TABLE `_prisma_migrations`
  ADD PRIMARY KEY (`id`);

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `api_request_logs`
--
ALTER TABLE `api_request_logs`
  ADD CONSTRAINT `api_request_logs_countryId_fkey` FOREIGN KEY (`countryId`) REFERENCES `countries` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Filtros para la tabla `draws`
--
ALTER TABLE `draws`
  ADD CONSTRAINT `draws_lotteryId_fkey` FOREIGN KEY (`lotteryId`) REFERENCES `lotteries` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `draw_numbers`
--
ALTER TABLE `draw_numbers`
  ADD CONSTRAINT `draw_numbers_ballTypeId_fkey` FOREIGN KEY (`ballTypeId`) REFERENCES `lottery_ball_types` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `draw_numbers_drawId_fkey` FOREIGN KEY (`drawId`) REFERENCES `draws` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `jackpot_history`
--
ALTER TABLE `jackpot_history`
  ADD CONSTRAINT `jackpot_history_drawId_fkey` FOREIGN KEY (`drawId`) REFERENCES `draws` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `lotteries`
--
ALTER TABLE `lotteries`
  ADD CONSTRAINT `lotteries_stateId_fkey` FOREIGN KEY (`stateId`) REFERENCES `states` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `lottery_ball_types`
--
ALTER TABLE `lottery_ball_types`
  ADD CONSTRAINT `lottery_ball_types_lotteryId_fkey` FOREIGN KEY (`lotteryId`) REFERENCES `lotteries` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `lottery_configurations`
--
ALTER TABLE `lottery_configurations`
  ADD CONSTRAINT `lottery_configurations_lotteryId_fkey` FOREIGN KEY (`lotteryId`) REFERENCES `lotteries` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `lottery_draw_schedules`
--
ALTER TABLE `lottery_draw_schedules`
  ADD CONSTRAINT `lottery_draw_schedules_lotteryId_fkey` FOREIGN KEY (`lotteryId`) REFERENCES `lotteries` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `prize_breakdowns`
--
ALTER TABLE `prize_breakdowns`
  ADD CONSTRAINT `prize_breakdowns_drawId_fkey` FOREIGN KEY (`drawId`) REFERENCES `draws` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `states`
--
ALTER TABLE `states`
  ADD CONSTRAINT `states_countryId_fkey` FOREIGN KEY (`countryId`) REFERENCES `countries` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
