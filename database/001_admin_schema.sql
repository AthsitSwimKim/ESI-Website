-- ESI project administration, schema version 1.
-- Target: the EMPTY esithcom_website database on MySQL 5.5.44 or newer.
-- Run once. DDL implicitly commits on MySQL 5.5; it cannot be rolled back.
-- No other database, existing table, account, grant, or website content is changed.
-- No default login, password, session, or sample content is created.

USE `esithcom_website`;
SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;
SET SESSION sql_mode = 'STRICT_TRANS_TABLES,NO_ENGINE_SUBSTITUTION';

CREATE TABLE `admin_users` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(64) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL,
  `display_name` VARCHAR(160) NOT NULL,
  `password_hash` VARCHAR(255) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `role` ENUM('admin', 'editor') NOT NULL DEFAULT 'admin',
  `is_active` TINYINT UNSIGNED NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL,
  `updated_at` DATETIME NOT NULL,
  `last_login_at` DATETIME NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_admin_users_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `admin_sessions` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` INT UNSIGNED NOT NULL,
  `token_hash` CHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `csrf_token_hash` CHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `created_at` DATETIME NOT NULL,
  `last_seen_at` DATETIME NOT NULL,
  `expires_at` DATETIME NOT NULL,
  `revoked_at` DATETIME NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_admin_sessions_token` (`token_hash`),
  KEY `ix_admin_sessions_user_expiry` (`user_id`, `expires_at`),
  KEY `ix_admin_sessions_expiry` (`expires_at`),
  CONSTRAINT `fk_admin_sessions_user` FOREIGN KEY (`user_id`)
    REFERENCES `admin_users` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `projects` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `draft_version_id` BIGINT UNSIGNED NULL DEFAULT NULL,
  `published_version_id` BIGINT UNSIGNED NULL DEFAULT NULL,
  `published_slug` VARCHAR(191) CHARACTER SET ascii COLLATE ascii_bin NULL DEFAULT NULL,
  `lock_version` INT UNSIGNED NOT NULL DEFAULT 0,
  `sort_order` INT UNSIGNED NOT NULL DEFAULT 0,
  `created_by` INT UNSIGNED NULL DEFAULT NULL,
  `created_at` DATETIME NOT NULL,
  `updated_at` DATETIME NOT NULL,
  `deleted_at` DATETIME NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_projects_published_slug` (`published_slug`),
  KEY `ix_projects_draft_owner` (`draft_version_id`, `id`),
  KEY `ix_projects_published_owner` (`published_version_id`, `id`),
  KEY `ix_projects_sort` (`deleted_at`, `sort_order`, `id`),
  KEY `ix_projects_creator` (`created_by`),
  CONSTRAINT `fk_projects_creator` FOREIGN KEY (`created_by`)
    REFERENCES `admin_users` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `project_versions` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `project_id` INT UNSIGNED NOT NULL,
  `version_no` INT UNSIGNED NOT NULL,
  `slug` VARCHAR(191) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `client` VARCHAR(255) NOT NULL,
  `industry_slug` ENUM('oil-gas', 'petrochemical', 'power-energy', 'manufacturing', 'industrial-infrastructure') NOT NULL,
  `year` SMALLINT UNSIGNED NULL DEFAULT NULL,
  `featured` TINYINT UNSIGNED NOT NULL DEFAULT 0,
  `image_kind` ENUM('photo', 'illustration') NOT NULL DEFAULT 'photo',
  `source_url` TEXT NULL,
  `created_by` INT UNSIGNED NULL DEFAULT NULL,
  `created_at` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_project_versions_number` (`project_id`, `version_no`),
  UNIQUE KEY `uq_project_versions_owner` (`id`, `project_id`),
  KEY `ix_project_versions_slug` (`slug`),
  KEY `ix_project_versions_creator` (`created_by`),
  CONSTRAINT `fk_project_versions_project` FOREIGN KEY (`project_id`)
    REFERENCES `projects` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_project_versions_creator` FOREIGN KEY (`created_by`)
    REFERENCES `admin_users` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- The composite keys prevent pointing at a version belonging to ANOTHER project.
-- Physical deletion first requires clearing both version pointers.
ALTER TABLE `projects`
  ADD CONSTRAINT `fk_projects_draft_version` FOREIGN KEY (`draft_version_id`, `id`)
    REFERENCES `project_versions` (`id`, `project_id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  ADD CONSTRAINT `fk_projects_published_version` FOREIGN KEY (`published_version_id`, `id`)
    REFERENCES `project_versions` (`id`, `project_id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

CREATE TABLE `project_translations` (
  `version_id` BIGINT UNSIGNED NOT NULL,
  `locale` ENUM('en', 'th') NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `location` VARCHAR(255) NOT NULL,
  `description` TEXT NOT NULL,
  PRIMARY KEY (`version_id`, `locale`),
  CONSTRAINT `fk_project_translations_version` FOREIGN KEY (`version_id`)
    REFERENCES `project_versions` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `project_categories` (
  `version_id` BIGINT UNSIGNED NOT NULL,
  `category_slug` ENUM('network', 'cctv', 'access-control', 'communication', 'cybersecurity', 'maintenance') NOT NULL,
  `position` SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  PRIMARY KEY (`version_id`, `category_slug`),
  UNIQUE KEY `uq_project_categories_position` (`version_id`, `position`),
  CONSTRAINT `fk_project_categories_version` FOREIGN KEY (`version_id`)
    REFERENCES `project_versions` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Lists are independent per language; EN and TH lengths do not have to match.
-- Keep legacy partner/source data even though those inputs were removed from UI.
CREATE TABLE `project_items` (
  `version_id` BIGINT UNSIGNED NOT NULL,
  `kind` ENUM('scope', 'partner') NOT NULL,
  `locale` ENUM('en', 'th') NOT NULL,
  `position` SMALLINT UNSIGNED NOT NULL,
  `text` TEXT NOT NULL,
  PRIMARY KEY (`version_id`, `kind`, `locale`, `position`),
  CONSTRAINT `fk_project_items_version` FOREIGN KEY (`version_id`)
    REFERENCES `project_versions` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `media_files` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `path` VARCHAR(512) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `mime_type` ENUM('image/jpeg', 'image/png', 'image/webp') NOT NULL,
  `sha256` CHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `byte_size` INT UNSIGNED NOT NULL,
  `width` INT UNSIGNED NOT NULL,
  `height` INT UNSIGNED NOT NULL,
  `credit` TEXT NULL,
  `source_url` TEXT NULL,
  `uploaded_by` INT UNSIGNED NULL DEFAULT NULL,
  `created_at` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_media_files_path` (`path`),
  KEY `ix_media_files_sha256` (`sha256`),
  KEY `ix_media_files_uploader` (`uploaded_by`),
  CONSTRAINT `fk_media_files_uploader` FOREIGN KEY (`uploaded_by`)
    REFERENCES `admin_users` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- String slot 'cover' = cover; 'gallery-01'..'gallery-10' = gallery in display order.
-- ENUM makes multiple covers or more than ten gallery slots impossible in STRICT mode.
CREATE TABLE `project_media` (
  `version_id` BIGINT UNSIGNED NOT NULL,
  `slot` ENUM('cover', 'gallery-01', 'gallery-02', 'gallery-03', 'gallery-04', 'gallery-05', 'gallery-06', 'gallery-07', 'gallery-08', 'gallery-09', 'gallery-10') NOT NULL,
  `media_id` BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY (`version_id`, `slot`),
  KEY `ix_project_media_file` (`media_id`),
  CONSTRAINT `fk_project_media_version` FOREIGN KEY (`version_id`)
    REFERENCES `project_versions` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `fk_project_media_file` FOREIGN KEY (`media_id`)
    REFERENCES `media_files` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `admin_events` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `actor_id` INT UNSIGNED NULL DEFAULT NULL,
  `project_id` INT UNSIGNED NULL DEFAULT NULL,
  `version_id` BIGINT UNSIGNED NULL DEFAULT NULL,
  `action` ENUM('login', 'logout', 'save_draft', 'publish', 'unpublish', 'delete', 'restore', 'upload') NOT NULL,
  `result` ENUM('success', 'failure') NOT NULL,
  `details` TEXT NULL,
  `created_at` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  KEY `ix_admin_events_actor_time` (`actor_id`, `created_at`),
  KEY `ix_admin_events_project_time` (`project_id`, `created_at`),
  KEY `ix_admin_events_version` (`version_id`),
  KEY `ix_admin_events_time` (`created_at`),
  CONSTRAINT `fk_admin_events_actor` FOREIGN KEY (`actor_id`)
    REFERENCES `admin_users` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_admin_events_project` FOREIGN KEY (`project_id`)
    REFERENCES `projects` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_admin_events_version` FOREIGN KEY (`version_id`)
    REFERENCES `project_versions` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
