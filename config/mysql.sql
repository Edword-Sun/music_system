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
    name TEXT,
    album TEXT,
    band TEXT,
    singer_name TEXT,
    description TEXT,
    duration_ms INT,
    mime_type TEXT,
    bitrate_kbps INT,
    file_size BIGINT,
    hash_sha256 TEXT,
    status TEXT,
    is_delete BOOLEAN NOT NULL DEFAULT FALSE,
    visit_count INT DEFAULT 0,
    streamer_id VARCHAR(255),
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

-- 2025-10-20
CREATE TABLE `music_history` (
    `id` VARCHAR(255) PRIMARY KEY DEFAULT ( UUID () ),
    `music_id` TEXT NOT NULL,
    `user_id` TEXT NOT NULL,
    `description` TEXT NOT NULL,
    `create_time` DATETIME NOT NULL,
    `update_time` DATETIME NOT NULL
);
ALTER TABLE `user` ADD COLUMN `is_delete` BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE `comment` ADD COLUMN `is_delete` BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE `user_action_properties` ADD COLUMN `is_delete` BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE `music_history` ADD COLUMN `is_delete` BOOLEAN NOT NULL DEFAULT FALSE;

-- 2025-10-25
CREATE TABLE `streamer` (
    `id` VARCHAR(255) PRIMARY KEY DEFAULT (UUID()),
    `storage_path` TEXT NOT NULL,
    `original_name` TEXT NOT NULL,
    `format` VARCHAR(50),
    `create_time` DATETIME NOT NULL,
    `update_time` DATETIME NOT NULL,
    `is_deleted` BOOLEAN NOT NULL DEFAULT FALSE
);

