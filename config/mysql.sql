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