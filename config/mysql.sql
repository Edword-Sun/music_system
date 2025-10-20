-- 2025-10-15
CREATE TABLE `user` (
    `id` VARCHAR(255) PRIMARY KEY DEFAULT (UUID()),
    `name` VARCHAR(255),
    `account` VARCHAR(255),
    `password` VARCHAR(255),
    `email` VARCHAR(255),
    `create_time` DATETIME NOT NULL,
    `update_time` DATETIME NOT NULL
);
ALTER TABLE `user` ADD COLUMN `auth` INT NOT NULL DEFAULT 3;

-- 2025-10-16
CREATE TABLE music (
    id VARCHAR(255) PRIMARY KEY DEFAULT (UUID()),
    title TEXT,
    description TEXT,
    content TEXT,
    play_time TEXT,
    singer_name TEXT,
    create_time DATETIME NOT NULL,
    update_time DATETIME NOT NULL
);

-- 2025-10-20
CREATE TABLE `comment` (
  `id` VARCHAR(255) PRIMARY KEY DEFAULT (UUID()),
  `user_id` TEXT NOT NULL,
  `music_id` TEXT NOT NULL,
  `comment_id` TEXT NOT NULL,
  `content` TEXT NOT NULL,
  `create_time` DATETIME NOT NULL,
  `update_time` DATETIME NOT NULL
);

CREATE TABLE `user_action_properties` (
  `id` VARCHAR(255) PRIMARY KEY DEFAULT (UUID()),
  `user_id` TEXT NOT NULL,
  `music_id` TEXT NOT NULL,
  `thumb` BOOLEAN NOT NULL,
  `un_thumb` BOOLEAN NOT NULL,
  `collected` BOOLEAN NOT NULL,
  `share` BOOLEAN NOT NULL,
  `create_time` DATETIME NOT NULL,
  `update_time` DATETIME NOT NULL
);