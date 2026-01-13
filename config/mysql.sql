-- 2025-10-16
CREATE TABLE music (
    id VARCHAR(255) PRIMARY KEY DEFAULT (UUID()),
    name TEXT,
    album TEXT,
    band TEXT,

    format TEXT,
    streamer_id VARCHAR(255),
    create_time DATETIME NOT NULL,
    update_time DATETIME NOT NULL
);

-- 2025-10-20
CREATE TABLE `music_history` (
    `id` VARCHAR(255) PRIMARY KEY DEFAULT ( UUID () ),
    `music_id` TEXT NOT NULL,
    `create_time` DATETIME NOT NULL,
    `update_time` DATETIME NOT NULL
);

-- 2025-10-25
CREATE TABLE `streamer` (
    `id` VARCHAR(255) PRIMARY KEY DEFAULT (UUID()),
    `storage_path` TEXT NOT NULL,
    `original_name` TEXT NOT NULL,
    `format` VARCHAR(50),
    `create_time` DATETIME NOT NULL,
    `update_time` DATETIME NOT NULL,
);

