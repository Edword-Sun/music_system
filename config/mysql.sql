-- 2025-10-16
CREATE TABLE IF NOT EXISTS music (
    id VARCHAR(255) PRIMARY KEY DEFAULT (UUID()),
    singer_name TEXT,
    name TEXT,
    album TEXT,
    band TEXT,
    streamer_id VARCHAR(255),
    create_time DATETIME NOT NULL,
    update_time DATETIME NOT NULL
);

-- 2025-10-20
CREATE TABLE IF NOT EXISTS `music_history` (
    `id` VARCHAR(255) PRIMARY KEY DEFAULT ( UUID () ),
    `music_id` TEXT NOT NULL,
    `user_id` VARCHAR(255),
    `create_time` DATETIME NOT NULL,
    `update_time` DATETIME NOT NULL
);

-- 2025-10-25
CREATE TABLE IF NOT EXISTS `streamer` (
    `id` VARCHAR(255) PRIMARY KEY DEFAULT (UUID()),
    `storage_path` TEXT NOT NULL,
    `original_name` TEXT NOT NULL,
    `format` VARCHAR(50),
    `create_time` DATETIME NOT NULL,
    `update_time` DATETIME NOT NULL
);

-- 2026-01-22
CREATE TABLE IF NOT EXISTS `group` (
    `id` VARCHAR(255) PRIMARY KEY DEFAULT (UUID()),
    `name` TEXT,
    `content` JSON,
    `user_id` VARCHAR(255),
    `create_time` DATETIME NOT NULL,
    `update_time` DATETIME NOT NULL
);

-- 2026-02-05
CREATE TABLE IF NOT EXISTS `user` (
    `id` VARCHAR(255) PRIMARY KEY DEFAULT (UUID()),
    `username` VARCHAR(100) UNIQUE NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `nickname` VARCHAR(100),
    `avatar` TEXT,
    `role` VARCHAR(20) DEFAULT 'user',
    `create_time` DATETIME NOT NULL,
    `update_time` DATETIME NOT NULL
);

-- ============================================================
-- 迁移脚本 (Migration / Alter Table)
-- ============================================================

-- 2026-02-05: 用户系统升级
-- 如果您已经有旧版本的数据库，请运行以下语句：

-- 1. 创建用户表
CREATE TABLE IF NOT EXISTS `user` (
    `id` VARCHAR(255) PRIMARY KEY DEFAULT (UUID()),
    `username` VARCHAR(100) UNIQUE NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `nickname` VARCHAR(100),
    `avatar` TEXT,
    `role` VARCHAR(20) DEFAULT 'user',
    `create_time` DATETIME NOT NULL,
    `update_time` DATETIME NOT NULL
);

-- 2. 为播放历史表添加用户关联字段
ALTER TABLE `music_history` ADD COLUMN IF NOT EXISTS `user_id` VARCHAR(255) AFTER `music_id`;

-- 3. 为音乐合集表添加用户关联字段
ALTER TABLE `group` ADD COLUMN IF NOT EXISTS `user_id` VARCHAR(255) AFTER `content`;
