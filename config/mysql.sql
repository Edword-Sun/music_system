-- 2025-10-15
CREATE TABLE `user` (
    `id` VARCHAR(255) PRIMARY KEY DEFAULT (UUID()),
    `name` VARCHAR(255),
    `account` VARCHAR(255),
    `password` VARCHAR(255),
    `email` VARCHAR(255),
    `created_time` DATETIME NOT NULL,
    `updated_time` DATETIME NOT NULL
);