-- Adminer 5.3.0 MySQL 8.0.41-google dump

SET NAMES utf8;
SET time_zone = '+00:00';
SET foreign_key_checks = 0;
SET sql_mode = 'NO_AUTO_VALUE_ON_ZERO';

SET NAMES utf8mb4;

DROP TABLE IF EXISTS `menu_items`;
CREATE TABLE `menu_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `restaurant_id` int DEFAULT NULL,
  `item_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `price` decimal(10,2) DEFAULT NULL,
  `image_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `restaurant_id` (`restaurant_id`),
  CONSTRAINT `menu_items_ibfk_1` FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `menu_items` (`id`, `restaurant_id`, `item_name`, `description`, `price`, `image_url`) VALUES
(1,	1,	'頂級雪花牛火鍋',	'油花分布均勻，入口即化。',	380.00,	'https://img.com/menu1.jpg'),
(2,	1,	'海鮮拼盤',	'包含蝦、花枝、干貝。',	420.00,	'https://img.com/menu2.jpg'),
(3,	2,	'熟成肋眼牛排',	'口感紮實，風味濃厚。',	680.00,	'https://img.com/menu3.jpg'),
(4,	3,	'炙燒鮭魚壽司',	'鮮嫩多汁，壽司必點。',	120.00,	'https://img.com/menu4.jpg'),
(5,	3,	'玉子燒',	'甜味剛好，滑嫩可口。',	60.00,	'https://img.com/menu5.jpg'),
(6,	4,	'煙燻鮭魚班尼迪克蛋',	'搭配自製荷蘭醬',	260.00,	'https://img.com/menu6.jpg'),
(7,	5,	'重慶麻辣鍋',	'香麻帶辣，夠味十足。',	520.00,	'https://img.com/menu7.jpg'),
(8,	5,	'老油條',	'麻辣鍋必備配角',	50.00,	'https://img.com/menu8.jpg'),
(9,	2,	'爐烤雞腿排',	'外酥內嫩',	320.00,	'https://img.com/menu9.jpg'),
(10,	4,	'招牌法式吐司',	'淋上楓糖，超療癒。',	200.00,	'https://img.com/menu10.jpg');

DROP TABLE IF EXISTS `merchant_accounts`;
CREATE TABLE `merchant_accounts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `restaurant_id` int DEFAULT NULL,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone_number` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `restaurant_id` (`restaurant_id`),
  CONSTRAINT `merchant_accounts_ibfk_1` FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `merchant_accounts` (`id`, `restaurant_id`, `email`, `password_hash`, `phone_number`, `created_at`, `updated_at`) VALUES
(1,	1,	'merchant1@shop.com',	'hashpass1',	'0911111111',	'2025-06-12 13:58:34',	'2025-06-12 13:58:34'),
(2,	2,	'merchant2@shop.com',	'hashpass2',	'0922222222',	'2025-06-12 13:58:34',	'2025-06-12 13:58:34'),
(3,	3,	'merchant3@shop.com',	'hashpass3',	'0933333333',	'2025-06-12 13:58:34',	'2025-06-12 13:58:34'),
(4,	4,	'merchant4@shop.com',	'hashpass4',	'0944444444',	'2025-06-12 13:58:34',	'2025-06-12 13:58:34'),
(5,	5,	'merchant5@shop.com',	'hashpass5',	'0955555555',	'2025-06-12 13:58:34',	'2025-06-12 13:58:34');

DROP TABLE IF EXISTS `merchant_profiles`;
CREATE TABLE `merchant_profiles` (
  `merchant_id` int NOT NULL,
  `avatar_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `social_links` json DEFAULT NULL,
  PRIMARY KEY (`merchant_id`),
  CONSTRAINT `merchant_profiles_ibfk_1` FOREIGN KEY (`merchant_id`) REFERENCES `merchant_accounts` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `merchant_profiles` (`merchant_id`, `avatar_url`, `description`, `social_links`) VALUES
(1,	'https://img.com/avatar1.jpg',	'我們是火鍋界的霸主。',	'{\"facebook\": \"fb.com/hotpot\"}'),
(2,	'https://img.com/avatar2.jpg',	'牛排肉質講究，品質保證。',	'{\"instagram\": \"insta.com/steak\"}'),
(3,	'https://img.com/avatar3.jpg',	'壽司職人精心製作。',	'{\"line\": \"@sushi\"}'),
(4,	'https://img.com/avatar4.jpg',	'最有格調的早午餐店。',	'{\"facebook\": \"fb.com/brunch\"}'),
(5,	'https://img.com/avatar5.jpg',	'四川正宗麻辣鍋。',	'{\"website\": \"spicyking.com\"}');

DROP TABLE IF EXISTS `restaurant_photos`;
CREATE TABLE `restaurant_photos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `restaurant_id` int DEFAULT NULL,
  `image_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `restaurant_id` (`restaurant_id`),
  CONSTRAINT `restaurant_photos_ibfk_1` FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `restaurant_photos` (`id`, `restaurant_id`, `image_url`) VALUES
(1,	1,	'https://img.com/r1-1.jpg'),
(2,	1,	'https://img.com/r1-2.jpg'),
(3,	2,	'https://img.com/r2-1.jpg'),
(4,	3,	'https://img.com/r3-1.jpg'),
(5,	4,	'https://img.com/r4-1.jpg'),
(6,	5,	'https://img.com/r5-1.jpg'),
(7,	2,	'https://img.com/r2-2.jpg'),
(8,	3,	'https://img.com/r3-2.jpg'),
(9,	4,	'https://img.com/r4-2.jpg'),
(10,	5,	'https://img.com/r5-2.jpg');

DROP TABLE IF EXISTS `restaurant_reviews`;
CREATE TABLE `restaurant_reviews` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `restaurant_id` int DEFAULT NULL,
  `content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `image_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `rating` tinyint DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `reply_content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `reply_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `restaurant_id` (`restaurant_id`),
  CONSTRAINT `restaurant_reviews_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `restaurant_reviews_ibfk_2` FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `restaurant_reviews` (`id`, `user_id`, `restaurant_id`, `content`, `image_url`, `rating`, `created_at`, `updated_at`, `reply_content`, `reply_at`) VALUES
(1,	1,	1,	'湯頭很讚，肉質新鮮。',	NULL,	5,	'2025-06-10 12:19:06',	'2025-06-10 12:19:06',	'謝謝您的喜愛，歡迎再來！',	'2025-06-10 12:19:06'),
(2,	2,	1,	'服務親切，氣氛不錯。',	NULL,	4,	'2025-06-10 12:19:06',	'2025-06-10 12:19:06',	NULL,	NULL),
(3,	3,	2,	'牛排熟度剛好，滿意。',	NULL,	5,	'2025-06-10 12:19:06',	'2025-06-10 12:19:06',	'感謝您的肯定！',	'2025-06-10 12:19:06'),
(4,	4,	2,	'價位偏高但口感不錯。',	NULL,	3,	'2025-06-10 12:19:06',	'2025-06-10 12:19:06',	NULL,	NULL),
(5,	5,	3,	'壽司有創意，值得再訪。',	NULL,	4,	'2025-06-10 12:19:06',	'2025-06-10 12:19:06',	NULL,	NULL),
(6,	6,	3,	'CP值高，很喜歡。',	NULL,	5,	'2025-06-10 12:19:06',	'2025-06-10 12:19:06',	'期待您再次光臨！',	'2025-06-10 12:19:06'),
(7,	7,	4,	'早午餐選擇多樣，但稍擠。',	NULL,	4,	'2025-06-10 12:19:06',	'2025-06-10 12:19:06',	NULL,	NULL),
(8,	8,	5,	'麻辣夠味，不是蓋的！',	NULL,	5,	'2025-06-10 12:19:06',	'2025-06-10 12:19:06',	'謝謝辣友支持！',	'2025-06-10 12:19:06'),
(9,	9,	5,	'口味不錯但等太久。',	NULL,	3,	'2025-06-10 12:19:06',	'2025-06-10 12:19:06',	NULL,	NULL),
(10,	10,	1,	'火鍋料種類豐富，會回訪。',	NULL,	4,	'2025-06-10 12:19:06',	'2025-06-10 12:19:06',	NULL,	NULL);

DROP TABLE IF EXISTS `restaurant_tags`;
CREATE TABLE `restaurant_tags` (
  `restaurant_id` int NOT NULL,
  `tag_id` int NOT NULL,
  PRIMARY KEY (`restaurant_id`,`tag_id`),
  KEY `tag_id` (`tag_id`),
  CONSTRAINT `restaurant_tags_ibfk_1` FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants` (`id`) ON DELETE CASCADE,
  CONSTRAINT `restaurant_tags_ibfk_2` FOREIGN KEY (`tag_id`) REFERENCES `tags` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `restaurant_tags` (`restaurant_id`, `tag_id`) VALUES
(1,	1),
(2,	2),
(1,	3),
(2,	4),
(4,	5),
(5,	6),
(3,	7),
(3,	8),
(4,	9),
(5,	10);

DROP TABLE IF EXISTS `restaurants`;
CREATE TABLE `restaurants` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone_number` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cuisine_type` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `business_hours` json DEFAULT NULL,
  `is_open` tinyint(1) DEFAULT '1',
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `cover_image_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `payment_methods` json DEFAULT NULL,
  `average_rating` decimal(3,2) DEFAULT '0.00',
  `review_count` int DEFAULT '0',
  `latitude` decimal(10,7) DEFAULT NULL,
  `longitude` decimal(10,7) DEFAULT NULL,
  `place_id` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_place_id` (`place_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `restaurants` (`id`, `name`, `email`, `phone_number`, `address`, `cuisine_type`, `business_hours`, `is_open`, `description`, `cover_image_url`, `payment_methods`, `average_rating`, `review_count`, `latitude`, `longitude`, `place_id`) VALUES
(1,	'火鍋大王',	'hotpot@example.com',	'0287654321',	'台北市信義區',	'火鍋',	'{\"mon\": \"11:00-22:00\", \"tue\": \"11:00-22:00\"}',	1,	'人氣火鍋店',	'https://img.com/hotpot.jpg',	'[\"現金\", \"信用卡\"]',	4.50,	12,	NULL,	NULL,	NULL),
(2,	'牛排之王',	'steak@example.com',	'0281122334',	'新北市永和區',	'西式',	'{\"mon\": \"12:00-21:00\", \"tue\": \"12:00-21:00\"}',	1,	'頂級牛排餐廳',	'https://img.com/steak.jpg',	'[\"現金\"]',	4.20,	8,	NULL,	NULL,	NULL),
(3,	'壽司郎',	'sushi@example.com',	'0289988776',	'台中市北屯區',	'日式',	'{\"mon\": \"10:00-20:00\"}',	1,	'平價壽司專賣店',	'https://img.com/sushi.jpg',	'[\"信用卡\"]',	4.00,	15,	NULL,	NULL,	NULL),
(4,	'早午餐工坊',	'brunch@example.com',	'0277008899',	'高雄市苓雅區',	'早午餐',	'{\"mon\": \"08:00-14:00\"}',	0,	'文青風格早午餐店',	'https://img.com/brunch.jpg',	'[\"行動支付\"]',	4.70,	5,	NULL,	NULL,	NULL),
(5,	'麻辣天下',	'spicy@example.com',	'0266887766',	'台南市東區',	'川菜',	'{\"mon\": \"11:30-22:00\"}',	1,	'重慶麻辣風味',	'https://img.com/spicy.jpg',	'[\"現金\", \"信用卡\", \"行動支付\"]',	4.10,	9,	NULL,	NULL,	NULL);

DROP TABLE IF EXISTS `review_photos`;
CREATE TABLE `review_photos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `review_id` int DEFAULT NULL,
  `image_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `review_id` (`review_id`),
  CONSTRAINT `review_photos_ibfk_1` FOREIGN KEY (`review_id`) REFERENCES `reviews` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `review_photos` (`id`, `review_id`, `image_url`) VALUES
(1,	1,	'https://img.com/rev1-1.jpg'),
(2,	2,	'https://img.com/rev2-1.jpg'),
(3,	3,	'https://img.com/rev3-1.jpg'),
(4,	4,	'https://img.com/rev4-1.jpg'),
(5,	5,	'https://img.com/rev5-1.jpg'),
(6,	6,	'https://img.com/rev6-1.jpg'),
(7,	7,	'https://img.com/rev7-1.jpg'),
(8,	8,	'https://img.com/rev8-1.jpg'),
(9,	9,	'https://img.com/rev9-1.jpg'),
(10,	10,	'https://img.com/rev10-1.jpg');

DROP TABLE IF EXISTS `review_ratings`;
CREATE TABLE `review_ratings` (
  `review_id` int NOT NULL,
  `environment_score` tinyint DEFAULT NULL,
  `service_score` tinyint DEFAULT NULL,
  `taste_score` tinyint DEFAULT NULL,
  `price_score` tinyint DEFAULT NULL,
  `overall_score` float DEFAULT NULL,
  PRIMARY KEY (`review_id`),
  CONSTRAINT `review_ratings_ibfk_1` FOREIGN KEY (`review_id`) REFERENCES `reviews` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `review_ratings` (`review_id`, `environment_score`, `service_score`, `taste_score`, `price_score`, `overall_score`) VALUES
(1,	5,	5,	5,	4,	5),
(2,	4,	4,	4,	4,	4),
(3,	5,	5,	5,	5,	5),
(4,	3,	4,	4,	3,	3),
(5,	4,	4,	5,	4,	4),
(6,	5,	5,	5,	5,	5),
(7,	3,	4,	4,	3,	4),
(8,	5,	5,	5,	4,	5),
(9,	3,	3,	4,	3,	3),
(10,	4,	4,	4,	4,	4);

DROP TABLE IF EXISTS `review_stats`;
CREATE TABLE `review_stats` (
  `review_id` int NOT NULL,
  `total_views` int DEFAULT '0',
  `total_favorites` int DEFAULT '0',
  PRIMARY KEY (`review_id`),
  CONSTRAINT `review_stats_ibfk_1` FOREIGN KEY (`review_id`) REFERENCES `reviews` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `review_stats` (`review_id`, `total_views`, `total_favorites`) VALUES
(1,	125,	15),
(2,	88,	9),
(3,	200,	18),
(4,	64,	6),
(5,	95,	12),
(6,	140,	10),
(7,	45,	4),
(8,	160,	17),
(9,	30,	2),
(10,	105,	11);

DROP TABLE IF EXISTS `review_tags`;
CREATE TABLE `review_tags` (
  `review_id` int NOT NULL,
  `tag_id` int NOT NULL,
  PRIMARY KEY (`review_id`,`tag_id`),
  KEY `tag_id` (`tag_id`),
  CONSTRAINT `review_tags_ibfk_1` FOREIGN KEY (`review_id`) REFERENCES `reviews` (`id`) ON DELETE CASCADE,
  CONSTRAINT `review_tags_ibfk_2` FOREIGN KEY (`tag_id`) REFERENCES `tags` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `review_tags` (`review_id`, `tag_id`) VALUES
(1,	1),
(3,	2),
(1,	3),
(4,	4),
(2,	5),
(8,	6),
(5,	7),
(6,	8),
(7,	9),
(9,	10);

DROP TABLE IF EXISTS `review_view_logs`;
CREATE TABLE `review_view_logs` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `review_id` int DEFAULT NULL,
  `user_id` int DEFAULT NULL,
  `ip_address` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `viewed_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `review_id` (`review_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `review_view_logs_ibfk_1` FOREIGN KEY (`review_id`) REFERENCES `reviews` (`id`),
  CONSTRAINT `review_view_logs_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `review_view_logs` (`id`, `review_id`, `user_id`, `ip_address`, `viewed_at`) VALUES
(1,	1,	1,	'192.168.1.1',	'2025-06-10 12:19:06'),
(2,	2,	2,	'192.168.1.2',	'2025-06-10 12:19:06'),
(3,	3,	3,	'192.168.1.3',	'2025-06-10 12:19:06'),
(4,	4,	4,	'192.168.1.4',	'2025-06-10 12:19:06'),
(5,	5,	5,	'192.168.1.5',	'2025-06-10 12:19:06'),
(6,	6,	6,	'192.168.1.6',	'2025-06-10 12:19:06'),
(7,	7,	7,	'192.168.1.7',	'2025-06-10 12:19:06'),
(8,	8,	8,	'192.168.1.8',	'2025-06-10 12:19:06'),
(9,	9,	9,	'192.168.1.9',	'2025-06-10 12:19:06'),
(10,	10,	10,	'192.168.1.10',	'2025-06-10 12:19:06');

DROP TABLE IF EXISTS `reviews`;
CREATE TABLE `reviews` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `restaurant_id` int DEFAULT NULL,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `content_json` json DEFAULT NULL,
  `status` enum('draft','published') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'draft',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `content` text COLLATE utf8mb4_unicode_ci,
  `helpful_count` int NOT NULL DEFAULT '0',
  `image_urls` json DEFAULT NULL,
  `rating` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `restaurant_id` (`restaurant_id`),
  CONSTRAINT `reviews_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `reviews_ibfk_2` FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `reviews` (`id`, `user_id`, `restaurant_id`, `title`, `content_json`, `status`, `created_at`, `updated_at`, `content`, `helpful_count`, `image_urls`, `rating`) VALUES
(1,	1,	1,	'超愛這家火鍋店！',	'{\"paragraphs\": [\"湯底濃郁，肉質鮮美\", \"環境乾淨舒適，值得再訪\"]}',	'published',	'2025-06-10 12:19:06',	'2025-06-10 12:19:06',	NULL,	0,	NULL,	0),
(2,	2,	2,	'牛排真的很讚',	'{\"paragraphs\": [\"點了肋眼牛排\", \"熟度掌握剛剛好\", \"還有配菜豐富\"]}',	'published',	'2025-06-10 12:19:06',	'2025-06-10 12:19:06',	NULL,	0,	NULL,	0),
(3,	3,	3,	'平價壽司中的戰鬥機',	'{\"paragraphs\": [\"壽司新鮮\", \"CP值高\"]}',	'published',	'2025-06-10 12:19:06',	'2025-06-10 12:19:06',	NULL,	0,	NULL,	0),
(4,	4,	1,	'小失望的一次火鍋體驗',	'{\"paragraphs\": [\"湯頭偏鹹\", \"可能是我個人口味問題\"]}',	'draft',	'2025-06-10 12:19:06',	'2025-06-10 12:19:06',	NULL,	0,	NULL,	0),
(5,	5,	4,	'早午餐控的天堂',	'{\"paragraphs\": [\"菜色多樣化\", \"份量足\", \"店內裝潢有質感\"]}',	'published',	'2025-06-10 12:19:06',	'2025-06-10 12:19:06',	NULL,	0,	NULL,	0),
(6,	6,	5,	'辣得很爽快！',	'{\"paragraphs\": [\"重口味愛好者推薦\", \"服務親切\"]}',	'published',	'2025-06-10 12:19:06',	'2025-06-10 12:19:06',	NULL,	0,	NULL,	0),
(7,	7,	3,	'適合朋友聚餐的壽司店',	'{\"paragraphs\": [\"空間夠大\", \"適合多人聚會\"]}',	'published',	'2025-06-10 12:19:06',	'2025-06-10 12:19:06',	NULL,	0,	NULL,	0),
(8,	8,	2,	'牛排口感略柴',	'{\"paragraphs\": [\"也許是運氣不好\", \"下次想再給一次機會\"]}',	'draft',	'2025-06-10 12:19:06',	'2025-06-10 12:19:06',	NULL,	0,	NULL,	0),
(9,	9,	5,	'辣鍋中找回靈魂',	'{\"paragraphs\": [\"湯頭層次豐富\", \"辣度剛剛好\"]}',	'published',	'2025-06-10 12:19:06',	'2025-06-10 12:19:06',	NULL,	0,	NULL,	0),
(10,	10,	4,	'早午餐新選擇',	'{\"paragraphs\": [\"鬆餅外酥內軟\", \"飲品選項多\"]}',	'published',	'2025-06-10 12:19:06',	'2025-06-10 12:19:06',	NULL,	0,	NULL,	0);

DROP TABLE IF EXISTS `tags`;
CREATE TABLE `tags` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `tags` (`id`, `name`) VALUES
(8,	'壽司'),
(10,	'宵夜'),
(1,	'平價'),
(4,	'情侶約會'),
(9,	'早餐'),
(5,	'氣氛佳'),
(7,	'海鮮'),
(6,	'辣味'),
(3,	'適合聚餐'),
(2,	'高級');

DROP TABLE IF EXISTS `user_favorites`;
CREATE TABLE `user_favorites` (
  `user_id` int NOT NULL,
  `target_id` int NOT NULL,
  `target_type` enum('restaurant','review') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `favorited_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`,`target_type`,`target_id`),
  CONSTRAINT `user_favorites_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `user_favorites` (`user_id`, `target_id`, `target_type`, `favorited_at`) VALUES
(1,	1,	'restaurant',	'2025-06-10 12:19:06'),
(1,	2,	'review',	'2025-06-10 12:19:06'),
(2,	3,	'restaurant',	'2025-06-10 12:19:06'),
(3,	1,	'restaurant',	'2025-06-10 12:19:06'),
(4,	2,	'review',	'2025-06-10 12:19:06'),
(5,	4,	'restaurant',	'2025-06-10 12:19:06'),
(6,	3,	'review',	'2025-06-10 12:19:06'),
(7,	5,	'restaurant',	'2025-06-10 12:19:06'),
(8,	4,	'review',	'2025-06-10 12:19:06'),
(9,	2,	'restaurant',	'2025-06-10 12:19:06');

DROP TABLE IF EXISTS `user_profiles`;
CREATE TABLE `user_profiles` (
  `user_id` int NOT NULL,
  `address` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notification_settings` json DEFAULT NULL,
  `privacy_settings` json DEFAULT NULL,
  `avatar_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bio` text COLLATE utf8mb4_unicode_ci,
  `social_links` json DEFAULT NULL,
  `id` bigint NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `location` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`user_id`),
  CONSTRAINT `user_profiles_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `user_profiles` (`user_id`, `address`, `notification_settings`, `privacy_settings`, `avatar_url`, `bio`, `social_links`, `id`, `created_at`, `location`, `updated_at`) VALUES
(1,	'台北市大安區',	'{\"email\": true}',	'{\"profile_visible\": true}',	NULL,	NULL,	NULL,	0,	NULL,	NULL,	NULL),
(2,	'新北市板橋區',	'{\"email\": false}',	'{\"profile_visible\": false}',	NULL,	NULL,	NULL,	0,	NULL,	NULL,	NULL),
(3,	'台中市西區',	'{\"email\": true}',	'{\"profile_visible\": true}',	NULL,	NULL,	NULL,	0,	NULL,	NULL,	NULL),
(4,	'台南市中西區',	'{\"email\": false}',	'{\"profile_visible\": false}',	NULL,	NULL,	NULL,	0,	NULL,	NULL,	NULL),
(5,	'高雄市三民區',	'{\"email\": true}',	'{\"profile_visible\": true}',	NULL,	NULL,	NULL,	0,	NULL,	NULL,	NULL),
(6,	'桃園市桃園區',	'{\"email\": true}',	'{\"profile_visible\": false}',	NULL,	NULL,	NULL,	0,	NULL,	NULL,	NULL),
(7,	'新竹市東區',	'{\"email\": false}',	'{\"profile_visible\": true}',	NULL,	NULL,	NULL,	0,	NULL,	NULL,	NULL),
(8,	'基隆市仁愛區',	'{\"email\": true}',	'{\"profile_visible\": false}',	NULL,	NULL,	NULL,	0,	NULL,	NULL,	NULL),
(9,	'彰化市',	'{\"email\": false}',	'{\"profile_visible\": true}',	NULL,	NULL,	NULL,	0,	NULL,	NULL,	NULL),
(10,	'宜蘭市',	'{\"email\": true}',	'{\"profile_visible\": true}',	NULL,	NULL,	NULL,	0,	NULL,	NULL,	NULL);

DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone_number` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `image_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `avatar_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `username` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `users` (`id`, `email`, `password_hash`, `name`, `phone_number`, `image_url`, `created_at`, `updated_at`, `avatar_url`, `password`, `username`) VALUES
(1,	'alice@example.com',	'hashedpwd1',	'Alice',	'0912345678',	'',	'2025-06-10 12:15:19',	'2025-06-10 12:15:19',	NULL,	'',	''),
(2,	'bob@example.com',	'hashedpwd2',	'Bob',	'0922333444',	'',	'2025-06-10 12:15:19',	'2025-06-10 12:15:19',	NULL,	'',	''),
(3,	'charlie@example.com',	'hashedpwd3',	'Charlie',	'0933555666',	'',	'2025-06-10 12:15:19',	'2025-06-10 12:15:19',	NULL,	'',	''),
(4,	'david@example.com',	'hashedpwd4',	'David',	'0944666777',	'',	'2025-06-10 12:15:19',	'2025-06-10 12:15:19',	NULL,	'',	''),
(5,	'eva@example.com',	'hashedpwd5',	'Eva',	'0955777888',	'',	'2025-06-10 12:15:19',	'2025-06-10 12:15:19',	NULL,	'',	''),
(6,	'frank@example.com',	'hashedpwd6',	'Frank',	'0966888999',	'',	'2025-06-10 12:15:19',	'2025-06-10 12:15:19',	NULL,	'',	''),
(7,	'grace@example.com',	'hashedpwd7',	'Grace',	'0977999000',	'',	'2025-06-10 12:15:19',	'2025-06-10 12:15:19',	NULL,	'',	''),
(8,	'henry@example.com',	'hashedpwd8',	'Henry',	'0988000111',	'',	'2025-06-10 12:15:19',	'2025-06-10 12:15:19',	NULL,	'',	''),
(9,	'irene@example.com',	'hashedpwd9',	'Irene',	'0999111222',	'',	'2025-06-10 12:15:19',	'2025-06-10 12:15:19',	NULL,	'',	''),
(10,	'jack@example.com',	'hashedpwd10',	'Jack',	'0911222333',	'',	'2025-06-10 12:15:19',	'2025-06-10 12:15:19',	NULL,	'',	''),
(11,	'success@test.com',	'success123',	'Success User',	'0912345678',	'',	'2025-06-12 10:44:34',	'2025-06-12 10:44:34',	'',	'',	''),
(12,	'test2@example.com',	'testpass456',	'測試用戶2',	'0987654321',	'',	'2025-06-12 10:44:53',	'2025-06-12 10:44:53',	'',	'',	''),
(13,	'sskk123@example.com',	'6678999aaaaa',	'黃茂勝',	'0977729058',	'',	'2025-06-12 10:46:36',	'2025-06-12 10:46:36',	'',	'',	''),
(14,	'phototest1@example.com',	'testpass123',	'照片測試1',	'0912345678',	'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',	'2025-06-12 10:52:44',	'2025-06-12 10:52:44',	'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',	'',	''),
(15,	'phototest2@example.com',	'testpass123',	'照片測試2',	'0912345679',	'',	'2025-06-12 10:54:17',	'2025-06-12 10:54:17',	'',	'',	''),
(16,	'ivanhuang@example.com',	'hashedpwd1',	'黃茂勝',	'0977729058',	'',	'2025-06-12 10:58:02',	'2025-06-12 10:58:02',	'',	'',	''),
(17,	'96aaaaaaaaa@example.com',	'hashedpwd1',	'黃茂勝',	'0977729058',	'',	'2025-06-12 11:04:03',	'2025-06-12 11:04:03',	'',	'',	'');

-- 2025-06-13 06:49:07 UTC
