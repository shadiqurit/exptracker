-- MySQL dump 10.13  Distrib 8.0.46, for Win64 (x86_64)
--
-- Host: localhost    Database: expense_tracker
-- ------------------------------------------------------
-- Server version	8.0.46

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Current Database: `expense_tracker`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `expense_tracker` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `expense_tracker`;

--
-- Table structure for table `accounts`
--

DROP TABLE IF EXISTS `accounts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `accounts` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('CASH','BANK','MOBILE_BANKING','DEBIT_CARD','CREDIT_CARD','SAVINGS','DIGITAL_WALLET','OTHER') COLLATE utf8mb4_unicode_ci NOT NULL,
  `account_number` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bank_name` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `currency` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'BDT',
  `opening_balance` decimal(15,2) NOT NULL DEFAULT '0.00',
  `status` enum('ACTIVE','ARCHIVED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ACTIVE',
  `description` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `accounts_user_id_status_idx` (`user_id`,`status`),
  CONSTRAINT `accounts_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `accounts`
--

LOCK TABLES `accounts` WRITE;
/*!40000 ALTER TABLE `accounts` DISABLE KEYS */;
INSERT INTO `accounts` VALUES ('2fe4edfb-606f-4820-b803-9a8c1646654f','fc99956d-bac7-4d91-8066-14d551d2e07d','IBBL Sal','BANK','','','BDT',0.00,'ACTIVE','','2026-10-26 17:29:56.059','2026-10-26 17:29:56.059'),('37c6a73c-321c-477d-bcd1-941fc065332a','b8cd9741-e9b2-4c8b-8ee9-59692c5bdc32','User B Cash','CASH',NULL,NULL,'BDT',15000.00,'ACTIVE','Private cash for User B','2026-10-26 17:38:03.486','2026-10-26 17:38:03.486'),('3d6b7ab3-fd3c-44ea-819c-fabc711cf334','cb5d3092-182b-4227-8d11-48cc41bccf8d','bKash Wallet','MOBILE_BANKING','•••••••5229','bKash Limited','BDT',5000.00,'ACTIVE','Daily mobile wallet','2026-10-26 17:38:03.433','2026-10-26 17:38:03.433'),('4fb84955-1a2b-4ac9-9e02-16161161e8a1','cb5d3092-182b-4227-8d11-48cc41bccf8d','Cash In Hand','CASH',NULL,NULL,'BDT',10000.00,'ACTIVE','Physical cash wallet','2026-10-26 17:38:03.425','2026-10-26 17:38:03.425'),('6ec842d7-5491-43ac-98df-1989aaf4011c','b8cd9741-e9b2-4c8b-8ee9-59692c5bdc32','User B BRAC Bank Savings','SAVINGS',NULL,NULL,'BDT',60000.00,'ACTIVE','Savings account for User B','2026-10-26 17:38:03.489','2026-10-26 17:38:03.489'),('7f2ebcd8-23e1-4034-878d-13a27b8d022e','cb5d3092-182b-4227-8d11-48cc41bccf8d','City Bank Savings','BANK','••••••••4756','City Bank Ltd.','BDT',25000.00,'ACTIVE','Primary salary account','2026-10-26 17:38:03.429','2026-10-26 17:38:03.429'),('f0ab5528-e52d-411f-aa77-74f0a1d83657','fc99956d-bac7-4d91-8066-14d551d2e07d','Cash','CASH','','','BDT',0.00,'ACTIVE','','2026-10-26 17:29:29.523','2026-10-26 17:29:29.523');
/*!40000 ALTER TABLE `accounts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `audit_logs`
--

DROP TABLE IF EXISTS `audit_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `audit_logs` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `entity_type` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `entity_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `action` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `old_data` longtext COLLATE utf8mb4_unicode_ci,
  `new_data` longtext COLLATE utf8mb4_unicode_ci,
  `ip_address` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `audit_logs_user_id_created_at_idx` (`user_id`,`created_at`),
  CONSTRAINT `audit_logs_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `audit_logs`
--

LOCK TABLES `audit_logs` WRITE;
/*!40000 ALTER TABLE `audit_logs` DISABLE KEYS */;
/*!40000 ALTER TABLE `audit_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `budgets`
--

DROP TABLE IF EXISTS `budgets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `budgets` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `category_id` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `amount` decimal(15,2) NOT NULL,
  `month` int NOT NULL,
  `year` int NOT NULL,
  `alert_threshold_80` tinyint(1) NOT NULL DEFAULT '0',
  `alert_threshold_100` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `budgets_user_id_category_id_month_year_key` (`user_id`,`category_id`,`month`,`year`),
  KEY `budgets_user_id_year_month_idx` (`user_id`,`year`,`month`),
  KEY `budgets_category_id_fkey` (`category_id`),
  CONSTRAINT `budgets_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `budgets_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `budgets`
--

LOCK TABLES `budgets` WRITE;
/*!40000 ALTER TABLE `budgets` DISABLE KEYS */;
INSERT INTO `budgets` VALUES ('aef7982e-4ce3-4fdd-b6b7-8d1eda417f97','cb5d3092-182b-4227-8d11-48cc41bccf8d',NULL,40000.00,10,2026,1,1,'2026-10-26 17:38:03.471','2026-10-26 17:38:03.471'),('ec7a92a4-b785-41c4-a104-cf28444beab3','cb5d3092-182b-4227-8d11-48cc41bccf8d','aa8584e6-2ac0-4d24-8c1e-47e18e08cd4c',15000.00,10,2026,1,0,'2026-10-26 17:38:03.475','2026-10-26 17:38:03.475');
/*!40000 ALTER TABLE `budgets` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('INCOME','EXPENSE') COLLATE utf8mb4_unicode_ci NOT NULL,
  `icon` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `color` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_system` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `categories_user_id_name_type_key` (`user_id`,`name`,`type`),
  KEY `categories_user_id_type_idx` (`user_id`,`type`),
  CONSTRAINT `categories_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES ('031eb2ec-caa3-4a87-b1a8-d8095dcdf1f8',NULL,'Freelancing','INCOME','pi pi-desktop','#3B82F6',1,'2026-10-26 16:51:40.527','2026-10-26 16:51:40.527'),('074def76-e82e-4b64-98a2-9a58490bac66',NULL,'Refunds','INCOME','pi pi-replay','#06B6D4',1,'2026-10-26 17:38:03.252','2026-10-26 17:38:03.252'),('0b759b09-28a9-464d-8106-adc7f3fc32eb',NULL,'Family Expenses','EXPENSE','pi pi-users','#14B8A6',1,'2026-10-26 16:51:40.617','2026-10-26 16:51:40.617'),('0d0391a0-ebce-40a2-bf94-2bf67c5aa094',NULL,'Water','EXPENSE','pi pi-tint','#06B6D4',1,'2026-10-26 16:51:40.579','2026-10-26 16:51:40.579'),('18df3d61-f285-4b7f-b2b0-679bf7cb5ae4',NULL,'Transportation','EXPENSE','pi pi-car','#6366F1',1,'2026-10-26 16:51:40.588','2026-10-26 16:51:40.588'),('254b3b20-f21d-4422-aef6-97d6f4f9b88e',NULL,'Business Income','INCOME','pi pi-briefcase','#6366F1',1,'2026-10-26 16:51:40.531','2026-10-26 16:51:40.531'),('2d8cbf7d-9d18-4067-84bd-d820e8481e12',NULL,'Salary','INCOME','pi pi-wallet','#10B981',1,'2026-10-26 16:51:40.520','2026-10-26 16:51:40.520'),('4d265dbb-ece6-4bbe-957a-b5a88dc7db36',NULL,'House Rent','EXPENSE','pi pi-building','#F97316',1,'2026-10-26 16:51:40.570','2026-10-26 16:51:40.570'),('4f3dbd23-7238-49e1-89b4-bfe0454e24db',NULL,'Bonus','INCOME','pi pi-star','#F59E0B',1,'2026-10-26 16:51:40.536','2026-10-26 16:51:40.536'),('50f76796-3288-415c-b7c9-0639ba24c337',NULL,'Internet','EXPENSE','pi pi-wifi','#3B82F6',1,'2026-10-26 16:51:40.584','2026-10-26 16:51:40.584'),('5391c4ef-a83b-4c95-9b5c-0930e2c00e62',NULL,'Miscellaneous','EXPENSE','pi pi-tag','#64748B',1,'2026-10-26 16:51:40.636','2026-10-26 16:51:40.636'),('5d4936b1-2a8c-4a30-989c-d6d5277fa6b8',NULL,'Mobile Recharge','EXPENSE','pi pi-mobile','#10B981',1,'2026-10-26 16:51:40.612','2026-10-26 16:51:40.612'),('789b040d-8bff-4e79-aeda-1bdb4c140d9c',NULL,'Other Income','INCOME','pi pi-dollar','#64748B',1,'2026-10-26 17:38:03.256','2026-10-26 17:38:03.256'),('8aab2d3b-15f8-44d6-81a1-e15440854e30',NULL,'Shopping','EXPENSE','pi pi-cart-plus','#EC4899',1,'2026-10-26 16:51:40.593','2026-10-26 16:51:40.593'),('9280df0f-58bd-4449-a61f-53209505e450',NULL,'Investment Income','INCOME','pi pi-chart-line','#8B5CF6',1,'2026-10-26 17:38:03.239','2026-10-26 17:38:03.239'),('961bc899-bd4b-47a3-abae-22a61fbdb5e3',NULL,'Freelancing','INCOME','pi pi-desktop','#3B82F6',1,'2026-10-26 17:38:03.225','2026-10-26 17:38:03.225'),('9cde27a2-e048-4dc1-ac6f-0028662ba00b',NULL,'Rental Income','INCOME','pi pi-home','#EC4899',1,'2026-10-26 16:51:40.545','2026-10-26 16:51:40.545'),('9ef54042-0984-4f6e-9d88-2a3a50c20739',NULL,'Healthcare','EXPENSE','pi pi-heart','#DC2626',1,'2026-10-26 16:51:40.598','2026-10-26 16:51:40.598'),('a3f936a8-c651-46a1-8c5b-a9968686a13d',NULL,'Salary','INCOME','pi pi-wallet','#10B981',1,'2026-10-26 17:38:03.220','2026-10-26 17:38:03.220'),('aa8584e6-2ac0-4d24-8c1e-47e18e08cd4c',NULL,'Food & Groceries','EXPENSE','pi pi-shopping-bag','#EF4444',1,'2026-10-26 16:51:40.564','2026-10-26 16:51:40.564'),('ab2f00cd-04a3-487d-8ed4-ed545a91eace',NULL,'Bonus','INCOME','pi pi-star','#F59E0B',1,'2026-10-26 17:38:03.234','2026-10-26 17:38:03.234'),('b5cfac25-db80-45a5-b435-7209c2f76b26',NULL,'Education','EXPENSE','pi pi-book','#8B5CF6',1,'2026-10-26 16:51:40.602','2026-10-26 16:51:40.602'),('b8d8efec-7546-45a4-a4ab-1f3221674fa0',NULL,'Subscriptions','EXPENSE','pi pi-sync','#4F46E5',1,'2026-10-26 16:51:40.631','2026-10-26 16:51:40.631'),('b92637a9-db11-4600-86aa-5d29e55940f9',NULL,'Rental Income','INCOME','pi pi-home','#EC4899',1,'2026-10-26 17:38:03.243','2026-10-26 17:38:03.243'),('cbb92bf1-975e-4845-91fc-32cfcf272810',NULL,'Gifts','INCOME','pi pi-gift','#14B8A6',1,'2026-10-26 17:38:03.248','2026-10-26 17:38:03.248'),('d42d5696-4b7c-48fb-9bbb-ab8947cb8999',NULL,'Loan Payment','EXPENSE','pi pi-credit-card','#78716C',1,'2026-10-26 16:51:40.626','2026-10-26 16:51:40.626'),('d52ad4fc-c01a-4e94-8a16-975b733f4177',NULL,'Refunds','INCOME','pi pi-replay','#06B6D4',1,'2026-10-26 16:51:40.554','2026-10-26 16:51:40.554'),('d9a2204f-af0a-41ac-9be2-08293b1f740c',NULL,'Electricity','EXPENSE','pi pi-bolt','#F59E0B',1,'2026-10-26 16:51:40.574','2026-10-26 16:51:40.574'),('dbf34ec3-9d44-4abc-949f-1260d6daf9f0',NULL,'Investment Income','INCOME','pi pi-chart-line','#8B5CF6',1,'2026-10-26 16:51:40.541','2026-10-26 16:51:40.541'),('e338f701-f554-4336-bc12-5d120bcfa91b',NULL,'Other Income','INCOME','pi pi-dollar','#64748B',1,'2026-10-26 16:51:40.558','2026-10-26 16:51:40.558'),('e678fc98-7aab-4c0e-8f54-123bae7a5b05',NULL,'Entertainment','EXPENSE','pi pi-play','#A855F7',1,'2026-10-26 16:51:40.607','2026-10-26 16:51:40.607'),('ec253d1b-a848-484a-b2b8-8832f4b2177f',NULL,'Business Income','INCOME','pi pi-briefcase','#6366F1',1,'2026-10-26 17:38:03.229','2026-10-26 17:38:03.229'),('ef31ecd2-07e3-463c-bbc9-f6d6e45e9d59',NULL,'Gifts','INCOME','pi pi-gift','#14B8A6',1,'2026-10-26 16:51:40.549','2026-10-26 16:51:40.549'),('fbfb3add-1df0-4bd0-a01c-557386d6f2cf',NULL,'Travel','EXPENSE','pi pi-compass','#0EA5E9',1,'2026-10-26 16:51:40.621','2026-10-26 16:51:40.621');
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ledger_entries`
--

DROP TABLE IF EXISTS `ledger_entries`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ledger_entries` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `account_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `transaction_id` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `transfer_id` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `entry_type` enum('OPENING_BALANCE','INCOME','EXPENSE','TRANSFER_IN','TRANSFER_OUT','TRANSFER_REVERSAL') COLLATE utf8mb4_unicode_ci NOT NULL,
  `direction` enum('DEBIT','CREDIT') COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `entry_date` datetime(3) NOT NULL,
  `description` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `ledger_entries_account_id_entry_date_idx` (`account_id`,`entry_date`),
  KEY `ledger_entries_user_id_entry_date_idx` (`user_id`,`entry_date`),
  KEY `ledger_entries_transaction_id_fkey` (`transaction_id`),
  KEY `ledger_entries_transfer_id_fkey` (`transfer_id`),
  CONSTRAINT `ledger_entries_account_id_fkey` FOREIGN KEY (`account_id`) REFERENCES `accounts` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `ledger_entries_transaction_id_fkey` FOREIGN KEY (`transaction_id`) REFERENCES `transactions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `ledger_entries_transfer_id_fkey` FOREIGN KEY (`transfer_id`) REFERENCES `transfers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `ledger_entries_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ledger_entries`
--

LOCK TABLES `ledger_entries` WRITE;
/*!40000 ALTER TABLE `ledger_entries` DISABLE KEYS */;
INSERT INTO `ledger_entries` VALUES ('020362bd-f9fb-45c7-84cb-c1444001200d','3d6b7ab3-fd3c-44ea-819c-fabc711cf334','cb5d3092-182b-4227-8d11-48cc41bccf8d',NULL,'7be06442-cc7d-4c3a-90b6-92a2e2551743','TRANSFER_REVERSAL','CREDIT',500.00,'2026-10-26 17:38:15.841','Transfer Reversal: Reversing test transfer','2026-10-26 17:38:15.843'),('3704e638-8698-45be-9980-940c48910c08','4fb84955-1a2b-4ac9-9e02-16161161e8a1','cb5d3092-182b-4227-8d11-48cc41bccf8d',NULL,NULL,'OPENING_BALANCE','CREDIT',10000.00,'2026-10-01 00:00:00.000','Account Opening Balance','2026-10-26 17:38:03.438'),('6ab9c711-7e2c-4fef-8b63-903d31d9571e','3d6b7ab3-fd3c-44ea-819c-fabc711cf334','cb5d3092-182b-4227-8d11-48cc41bccf8d',NULL,'dc426c33-d168-4b6c-93ef-734cc66f026b','TRANSFER_IN','CREDIT',3000.00,'2026-10-12 11:00:00.000','Fund transfer from City Bank Savings','2026-10-26 17:38:03.467'),('7d8f8ad6-3b33-435f-9ead-78336ca524f9','4fb84955-1a2b-4ac9-9e02-16161161e8a1','cb5d3092-182b-4227-8d11-48cc41bccf8d',NULL,'7be06442-cc7d-4c3a-90b6-92a2e2551743','TRANSFER_REVERSAL','DEBIT',500.00,'2026-10-26 17:38:15.841','Transfer Reversal: Reversing test transfer','2026-10-26 17:38:15.844'),('7e71e74c-d238-4d67-b012-899a30503aba','7f2ebcd8-23e1-4034-878d-13a27b8d022e','cb5d3092-182b-4227-8d11-48cc41bccf8d',NULL,NULL,'OPENING_BALANCE','CREDIT',25000.00,'2026-10-01 00:00:00.000','Account Opening Balance','2026-10-26 17:38:03.438'),('9b3b56a3-2771-48d6-8ccc-0d2b7ed33904','37c6a73c-321c-477d-bcd1-941fc065332a','b8cd9741-e9b2-4c8b-8ee9-59692c5bdc32',NULL,NULL,'OPENING_BALANCE','CREDIT',15000.00,'2026-10-01 00:00:00.000','Opening balance','2026-10-26 17:38:03.493'),('b1518fde-08d9-44db-b300-496672f2749b','7f2ebcd8-23e1-4034-878d-13a27b8d022e','cb5d3092-182b-4227-8d11-48cc41bccf8d','aeabecd0-e173-40c5-8905-21c744828f64',NULL,'INCOME','CREDIT',50000.00,'2026-10-05 10:00:00.000','October Monthly Salary Deposit','2026-10-26 17:38:03.449'),('b9ac5f97-23c9-4a8b-9bf7-f8a7eaf2808c','4fb84955-1a2b-4ac9-9e02-16161161e8a1','cb5d3092-182b-4227-8d11-48cc41bccf8d',NULL,'7be06442-cc7d-4c3a-90b6-92a2e2551743','TRANSFER_IN','CREDIT',500.00,'2026-10-26 17:38:15.813','Transfer from bKash Wallet','2026-10-26 17:38:15.825'),('bdaa4f21-d9ed-41b0-93e2-07e996d8a229','3d6b7ab3-fd3c-44ea-819c-fabc711cf334','cb5d3092-182b-4227-8d11-48cc41bccf8d',NULL,NULL,'OPENING_BALANCE','CREDIT',5000.00,'2026-10-01 00:00:00.000','Account Opening Balance','2026-10-26 17:38:03.438'),('bf80a1be-2a46-47ab-86ea-ef96023e5d8c','7f2ebcd8-23e1-4034-878d-13a27b8d022e','cb5d3092-182b-4227-8d11-48cc41bccf8d',NULL,'dc426c33-d168-4b6c-93ef-734cc66f026b','TRANSFER_OUT','DEBIT',3000.00,'2026-10-12 11:00:00.000','Fund transfer to bKash Wallet','2026-10-26 17:38:03.467'),('d39e97aa-42ec-4b62-887f-62924f848b84','6ec842d7-5491-43ac-98df-1989aaf4011c','b8cd9741-e9b2-4c8b-8ee9-59692c5bdc32',NULL,NULL,'OPENING_BALANCE','CREDIT',60000.00,'2026-10-01 00:00:00.000','Opening balance','2026-10-26 17:38:03.493'),('d67316f5-1acd-47a8-9e5b-a7e403b85ed0','3d6b7ab3-fd3c-44ea-819c-fabc711cf334','cb5d3092-182b-4227-8d11-48cc41bccf8d',NULL,'7be06442-cc7d-4c3a-90b6-92a2e2551743','TRANSFER_OUT','DEBIT',500.00,'2026-10-26 17:38:15.813','Transfer to Cash In Hand','2026-10-26 17:38:15.824'),('e4379603-71cc-4db2-88d1-0c9e4e88d80a','4fb84955-1a2b-4ac9-9e02-16161161e8a1','cb5d3092-182b-4227-8d11-48cc41bccf8d','c0ece349-cc2f-4c9e-ab05-41e5a524d382',NULL,'EXPENSE','DEBIT',2000.00,'2026-10-08 15:30:00.000','Weekly grocery shopping at Shwapno','2026-10-26 17:38:03.458');
/*!40000 ALTER TABLE `ledger_entries` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `recurring_transactions`
--

DROP TABLE IF EXISTS `recurring_transactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `recurring_transactions` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `account_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `category_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('INCOME','EXPENSE') COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `frequency` enum('DAILY','WEEKLY','MONTHLY','YEARLY') COLLATE utf8mb4_unicode_ci NOT NULL,
  `start_date` datetime(3) NOT NULL,
  `next_execution_date` datetime(3) NOT NULL,
  `last_execution_date` datetime(3) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `description` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `recurring_transactions_user_id_is_active_idx` (`user_id`,`is_active`),
  KEY `recurring_transactions_account_id_fkey` (`account_id`),
  KEY `recurring_transactions_category_id_fkey` (`category_id`),
  CONSTRAINT `recurring_transactions_account_id_fkey` FOREIGN KEY (`account_id`) REFERENCES `accounts` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `recurring_transactions_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `recurring_transactions_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `recurring_transactions`
--

LOCK TABLES `recurring_transactions` WRITE;
/*!40000 ALTER TABLE `recurring_transactions` DISABLE KEYS */;
/*!40000 ALTER TABLE `recurring_transactions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `refresh_tokens`
--

DROP TABLE IF EXISTS `refresh_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `refresh_tokens` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token_hash` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_agent` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ip_address` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_revoked` tinyint(1) NOT NULL DEFAULT '0',
  `expires_at` datetime(3) NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `refresh_tokens_token_hash_key` (`token_hash`),
  KEY `refresh_tokens_user_id_idx` (`user_id`),
  CONSTRAINT `refresh_tokens_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `refresh_tokens`
--

LOCK TABLES `refresh_tokens` WRITE;
/*!40000 ALTER TABLE `refresh_tokens` DISABLE KEYS */;
INSERT INTO `refresh_tokens` VALUES ('02bc490d-c2ca-4197-83aa-eb78652c607d','a09196a5-ace1-466c-8170-f954f4e69cc1','08bf656c1e0545bd19d46ac2807e20b194c7707bc78d3d518c5bd344d5d5b13b',NULL,'127.0.0.1',0,'2026-11-02 17:38:15.731','2026-10-26 17:38:15.732','2026-10-26 17:38:15.732'),('1c9e72db-0913-4792-8857-5f0a4fbe8365','fc99956d-bac7-4d91-8066-14d551d2e07d','720e7442089595424ec4e6c52e24404274352b55ca7581a251a6ba42d1c97210',NULL,'127.0.0.1',0,'2026-11-02 17:12:20.414','2026-10-26 17:12:20.416','2026-10-26 17:12:20.416'),('29cdb88a-d204-4ac5-a51f-04b8b2895a4e','cb5d3092-182b-4227-8d11-48cc41bccf8d','923bc77ffb4d35c88ef5767dc312fe02ed0a5bb93b540f0232dd15ebdcb9201b',NULL,'127.0.0.1',0,'2026-11-02 17:12:20.290','2026-10-26 17:12:20.293','2026-10-26 17:12:20.293'),('5c587590-8351-4f52-9124-06a4c21f2c91','cb5d3092-182b-4227-8d11-48cc41bccf8d','37b93d9bb255d04f7d04d3b1ae343eec44bc32f714ad200abd999270a631e79b','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.9711','::1',0,'2026-11-02 17:24:01.615','2026-10-26 17:24:01.616','2026-10-26 17:24:01.616'),('81f8c028-8a3c-447e-a923-d237b4fa4f93','cb5d3092-182b-4227-8d11-48cc41bccf8d','1578addbb718a7c0d40488c3e9425890179743a37d817512e06b79f7686ebde8',NULL,'127.0.0.1',0,'2026-11-02 17:10:29.474','2026-10-26 17:10:29.476','2026-10-26 17:10:29.476'),('85838062-9c3c-41c8-bf85-91c23e79ce80','fc99956d-bac7-4d91-8066-14d551d2e07d','763cea22cbc38dec98894855fc931dc470255c883778948c8638557f155a43aa','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36','::1',1,'2026-11-02 17:27:16.514','2026-10-26 17:27:16.515','2026-10-26 17:31:23.084'),('86f1d4db-d792-40a1-83ca-0f1d888f8dd6','fc99956d-bac7-4d91-8066-14d551d2e07d','f3b0175f9ec1794d2df37c3a55439c3b8c2028ed54ff4599efb96f39ccbec359',NULL,'127.0.0.1',0,'2026-11-02 17:10:43.951','2026-10-26 17:10:43.953','2026-10-26 17:10:43.953'),('8959d508-b58e-46b2-acc6-587af1386a8e','fc99956d-bac7-4d91-8066-14d551d2e07d','1c356295e638735d5736498c46a39ab656c3d6bd99db6fe699a2dddeb7c0ffdd','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36','::1',0,'2026-11-02 17:25:15.346','2026-10-26 17:25:15.347','2026-10-26 17:25:15.347'),('9c7571ec-b98d-4354-a161-c2ea0f9528ad','fc99956d-bac7-4d91-8066-14d551d2e07d','15ac86a63f21f500825e686cf2a3008e4ac5f3f69737f62ca4b65d535e60649e','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36','::1',1,'2026-11-02 17:27:01.044','2026-10-26 17:27:01.046','2026-10-26 17:27:10.351'),('a0d84640-f817-4ed2-a1c1-e9fd7f01b518','b8cd9741-e9b2-4c8b-8ee9-59692c5bdc32','16c3ab443d065a49610fe511562275295eaf8245f6a217b750006d6ec7ec797f',NULL,'127.0.0.1',0,'2026-11-02 17:10:29.542','2026-10-26 17:10:29.544','2026-10-26 17:10:29.544'),('a158f16e-fe61-48e3-9013-4524ee6dfe13','cb5d3092-182b-4227-8d11-48cc41bccf8d','a35b46fd25385536abbe08811749908d5703a41c9164cf26cb493b7c0b560d2e',NULL,'127.0.0.1',0,'2026-11-02 17:33:36.337','2026-10-26 17:33:36.339','2026-10-26 17:33:36.339'),('a48e05e9-8738-4786-8a05-8f76f5b9ce64','cb5d3092-182b-4227-8d11-48cc41bccf8d','eb9335c46e0f222866393c83c510b20a35e984fee7750ccc8e12b2e4e442069b',NULL,'127.0.0.1',0,'2026-11-02 17:38:15.620','2026-10-26 17:38:15.622','2026-10-26 17:38:15.622'),('a50d56ca-025c-4aa0-896c-404411b8c344','b8cd9741-e9b2-4c8b-8ee9-59692c5bdc32','a1c8255e92a0b892e87ec807c5564126c001c543e3bd0a2f16d698a4ebd281f3',NULL,'127.0.0.1',0,'2026-11-02 17:10:43.893','2026-10-26 17:10:43.895','2026-10-26 17:10:43.895'),('a92163bb-ef89-4428-b71f-7ffddfe97e01','fc99956d-bac7-4d91-8066-14d551d2e07d','c22e06b0bb5507b22664782cd536131f01e2327aae17e6cfde4a1e3411118d72',NULL,'127.0.0.1',0,'2026-11-02 17:10:29.604','2026-10-26 17:10:29.605','2026-10-26 17:10:29.605'),('b6c04d71-bcbb-4d5f-bef9-b8dcc4ac362a','b8cd9741-e9b2-4c8b-8ee9-59692c5bdc32','b8d38e66e0d2b83a25d80f4126692e2bd4d333570dd347bbc33d914087c1243b',NULL,'127.0.0.1',0,'2026-11-02 17:33:36.402','2026-10-26 17:33:36.403','2026-10-26 17:33:36.403'),('c576a252-8d89-48c0-8054-072fe9f538e6','cb5d3092-182b-4227-8d11-48cc41bccf8d','53273f0d4a9c3eabcb268412862f7de71b37436aeda87aac47b14fd9685eb638','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36','::1',1,'2026-11-02 17:31:58.023','2026-10-26 17:31:58.024','2026-10-26 17:32:41.078'),('cf2a43ef-bcd7-46d0-a3ef-a902a0245148','b8cd9741-e9b2-4c8b-8ee9-59692c5bdc32','66820ea72047d9c8f7160caa37d64f9a0e07e8bfd32d5796d64b7b62f75bf325','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36','::1',1,'2026-11-02 17:31:24.871','2026-10-26 17:31:24.872','2026-10-26 17:31:55.668'),('d03218d4-8084-4af9-8555-baa3560665c1','b8cd9741-e9b2-4c8b-8ee9-59692c5bdc32','cc64f920120a694b75d7ba744a2ba6db6d4b6b18a0375f9542f88d0922061819',NULL,'127.0.0.1',0,'2026-11-02 17:12:20.357','2026-10-26 17:12:20.359','2026-10-26 17:12:20.359'),('d1badb1f-c9c5-4084-8a11-33b812652062','b8cd9741-e9b2-4c8b-8ee9-59692c5bdc32','14bc0f86f42398e8f9f0e60379bcf476bdf42fd5117d70065017d7aefd90dafb',NULL,'127.0.0.1',0,'2026-11-02 16:59:42.778','2026-10-26 16:59:42.779','2026-10-26 16:59:42.779'),('d41fbb68-027f-4485-9e64-1b821abb7d3b','fc99956d-bac7-4d91-8066-14d551d2e07d','444d4a4e6e89e764bdcb7c091faf211b4ab17a3b3744a111e96053d7d02c1d81','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36','::1',0,'2026-11-02 17:33:55.944','2026-10-26 17:33:55.947','2026-10-26 17:33:55.947'),('e25823ae-4a1b-4a98-b397-093a99fff3fa','fc99956d-bac7-4d91-8066-14d551d2e07d','e659f9d88e8a8b19a5ced85a9041c99a414a50bf37314406100f0084c235ce2c',NULL,'127.0.0.1',0,'2026-11-02 17:33:36.459','2026-10-26 17:33:36.460','2026-10-26 17:33:36.460'),('e717807f-0937-4e79-b720-f091f9da0d43','b8cd9741-e9b2-4c8b-8ee9-59692c5bdc32','1a4f38054299b3450ed1d0c4c5611725ba9041dc0ec1516c6471aa54f70b175a',NULL,'127.0.0.1',0,'2026-11-02 17:38:15.679','2026-10-26 17:38:15.681','2026-10-26 17:38:15.681'),('f8e0edf1-54b3-46cf-8388-8ea90ba72a8a','cb5d3092-182b-4227-8d11-48cc41bccf8d','40f172bdbb685214b6d1413ce594c7614c54b37cb2a7d2e9b80e7cccdd309c7b',NULL,'127.0.0.1',0,'2026-11-02 16:59:42.704','2026-10-26 16:59:42.706','2026-10-26 16:59:42.706'),('f9a2f169-8e45-4254-ab1f-9614f612a2d3','cb5d3092-182b-4227-8d11-48cc41bccf8d','85782630d0bf4e3e653d05fa64c7945f0fcb779e052aaab41eea774dfa9b5141',NULL,'127.0.0.1',0,'2026-11-02 17:10:43.828','2026-10-26 17:10:43.831','2026-10-26 17:10:43.831');
/*!40000 ALTER TABLE `refresh_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` enum('SUPER_ADMIN','USER') COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `roles_name_key` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES ('690434ae-b82d-4695-b70e-dc9f4372b80f','USER','Standard application user with full personal finance management capabilities','2026-10-26 16:51:40.512','2026-10-26 17:38:03.213'),('db4542d3-ba7a-40e6-a61b-7fb193b60e1b','SUPER_ADMIN','Super Administrator with system configuration and user management privileges','2026-10-26 16:51:40.503','2026-10-26 17:38:03.206');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `subcategories`
--

DROP TABLE IF EXISTS `subcategories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `subcategories` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `category_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `subcategories_category_id_name_key` (`category_id`,`name`),
  CONSTRAINT `subcategories_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `subcategories`
--

LOCK TABLES `subcategories` WRITE;
/*!40000 ALTER TABLE `subcategories` DISABLE KEYS */;
/*!40000 ALTER TABLE `subcategories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `transactions`
--

DROP TABLE IF EXISTS `transactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `transactions` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `account_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `category_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `subcategory_id` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `type` enum('INCOME','EXPENSE') COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `transaction_date` datetime(3) NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `merchant` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reference_number` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `receipt_url` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_recurring` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `transactions_user_id_transaction_date_idx` (`user_id`,`transaction_date`),
  KEY `transactions_account_id_transaction_date_idx` (`account_id`,`transaction_date`),
  KEY `transactions_category_id_idx` (`category_id`),
  KEY `transactions_subcategory_id_fkey` (`subcategory_id`),
  CONSTRAINT `transactions_account_id_fkey` FOREIGN KEY (`account_id`) REFERENCES `accounts` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `transactions_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `transactions_subcategory_id_fkey` FOREIGN KEY (`subcategory_id`) REFERENCES `subcategories` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `transactions_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `transactions`
--

LOCK TABLES `transactions` WRITE;
/*!40000 ALTER TABLE `transactions` DISABLE KEYS */;
INSERT INTO `transactions` VALUES ('aeabecd0-e173-40c5-8905-21c744828f64','cb5d3092-182b-4227-8d11-48cc41bccf8d','7f2ebcd8-23e1-4034-878d-13a27b8d022e','2d8cbf7d-9d18-4067-84bd-d820e8481e12',NULL,'INCOME',50000.00,'2026-10-05 10:00:00.000','October Monthly Salary Deposit',NULL,'SAL-202610-01',NULL,0,'2026-10-26 17:38:03.444','2026-10-26 17:38:03.444'),('c0ece349-cc2f-4c9e-ab05-41e5a524d382','cb5d3092-182b-4227-8d11-48cc41bccf8d','4fb84955-1a2b-4ac9-9e02-16161161e8a1','aa8584e6-2ac0-4d24-8c1e-47e18e08cd4c',NULL,'EXPENSE',2000.00,'2026-10-08 15:30:00.000','Weekly grocery shopping at Shwapno','Shwapno Superstore',NULL,NULL,0,'2026-10-26 17:38:03.453','2026-10-26 17:38:03.453');
/*!40000 ALTER TABLE `transactions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `transfers`
--

DROP TABLE IF EXISTS `transfers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `transfers` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `source_account_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `destination_account_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `transfer_date` datetime(3) NOT NULL,
  `reference_number` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `idempotency_key` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('COMPLETED','REVERSED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'COMPLETED',
  `reversal_reason` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `transfers_idempotency_key_key` (`idempotency_key`),
  KEY `transfers_user_id_transfer_date_idx` (`user_id`,`transfer_date`),
  KEY `transfers_source_account_id_idx` (`source_account_id`),
  KEY `transfers_destination_account_id_idx` (`destination_account_id`),
  CONSTRAINT `transfers_destination_account_id_fkey` FOREIGN KEY (`destination_account_id`) REFERENCES `accounts` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `transfers_source_account_id_fkey` FOREIGN KEY (`source_account_id`) REFERENCES `accounts` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `transfers_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `transfers`
--

LOCK TABLES `transfers` WRITE;
/*!40000 ALTER TABLE `transfers` DISABLE KEYS */;
INSERT INTO `transfers` VALUES ('7be06442-cc7d-4c3a-90b6-92a2e2551743','cb5d3092-182b-4227-8d11-48cc41bccf8d','3d6b7ab3-fd3c-44ea-819c-fabc711cf334','4fb84955-1a2b-4ac9-9e02-16161161e8a1',500.00,'2026-10-26 17:38:15.813',NULL,NULL,'test-idemp-1793036295813','REVERSED','Reversing test transfer','2026-10-26 17:38:15.822','2026-10-26 17:38:15.841'),('dc426c33-d168-4b6c-93ef-734cc66f026b','cb5d3092-182b-4227-8d11-48cc41bccf8d','7f2ebcd8-23e1-4034-878d-13a27b8d022e','3d6b7ab3-fd3c-44ea-819c-fabc711cf334',3000.00,'2026-10-12 11:00:00.000','TRF-BKASH-001','Fund reload to bKash',NULL,'COMPLETED',NULL,'2026-10-26 17:38:03.462','2026-10-26 17:38:03.462');
/*!40000 ALTER TABLE `transfers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_roles`
--

DROP TABLE IF EXISTS `user_roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_roles` (
  `user_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role_id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`user_id`,`role_id`),
  KEY `user_roles_role_id_fkey` (`role_id`),
  CONSTRAINT `user_roles_role_id_fkey` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `user_roles_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_roles`
--

LOCK TABLES `user_roles` WRITE;
/*!40000 ALTER TABLE `user_roles` DISABLE KEYS */;
INSERT INTO `user_roles` VALUES ('a09196a5-ace1-466c-8170-f954f4e69cc1','db4542d3-ba7a-40e6-a61b-7fb193b60e1b','2026-10-26 17:38:03.310'),('b8cd9741-e9b2-4c8b-8ee9-59692c5bdc32','690434ae-b82d-4695-b70e-dc9f4372b80f','2026-10-26 16:51:40.788'),('cb5d3092-182b-4227-8d11-48cc41bccf8d','690434ae-b82d-4695-b70e-dc9f4372b80f','2026-10-26 16:51:40.737'),('fc99956d-bac7-4d91-8066-14d551d2e07d','db4542d3-ba7a-40e6-a61b-7fb193b60e1b','2026-10-26 16:51:40.685');
/*!40000 ALTER TABLE `user_roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `first_name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `avatar_url` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `default_currency` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'BDT',
  `timezone` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Asia/Dhaka',
  `status` enum('ACTIVE','INACTIVE') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ACTIVE',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_key` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES ('a09196a5-ace1-466c-8170-f954f4e69cc1','sadiq@shadiqur.bd','$argon2id$v=19$m=65536,t=3,p=4$dzce0YrCnFI47F4VwS1EPA$/W3O6+BRGmwsc8Dmum6xR/PE3S/TWe1kgKborF8qmdo','Sadiq','Administrator',NULL,NULL,'BDT','Asia/Dhaka','ACTIVE','2026-10-26 17:38:03.310','2026-10-26 17:38:03.310'),('b8cd9741-e9b2-4c8b-8ee9-59692c5bdc32','userb@example.com','$argon2id$v=19$m=65536,t=3,p=4$OaQK8JT4KbiN7RUnRTryxA$eX0+kzYlIICFkBRIXzF7MF0zUljEyUDTXHmYDSBb2g8','User','B',NULL,NULL,'BDT','Asia/Dhaka','ACTIVE','2026-10-26 16:51:40.788','2026-10-26 16:51:40.788'),('cb5d3092-182b-4227-8d11-48cc41bccf8d','usera@example.com','$argon2id$v=19$m=65536,t=3,p=4$nO9Hu7w8MOho3OIKWjjtRw$uolZ9izVknuEPzk5nQ3IUnd249BiJELE4AOsuggRP2M','User','A',NULL,NULL,'BDT','Asia/Dhaka','ACTIVE','2026-10-26 16:51:40.737','2026-10-26 16:51:40.737'),('fc99956d-bac7-4d91-8066-14d551d2e07d','admin@expensetracker.local','$argon2id$v=19$m=65536,t=3,p=4$+PNlN2zzXHhtszwzbYXnjg$I0j6pHoH5JQErlr0Wlcpsuw5Z76Hz1uHJ5tMLDr1Oo8','Sadiqur','Rahman','',NULL,'BDT','Asia/Dhaka','ACTIVE','2026-10-26 16:51:40.685','2026-10-26 17:28:56.625');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-10-26 23:48:03
