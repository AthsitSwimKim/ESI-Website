-- Read-only verification within the assigned database only.
-- Avoid mixing information_schema queries into batches: phpMyAdmin may infer
-- information_schema as the active database for later unqualified statements.
USE `esithcom_website`;

SELECT DATABASE() AS selected_database, VERSION() AS server_version;

SHOW TABLE STATUS FROM `esithcom_website`;
SHOW CREATE TABLE `admin_users`;
SHOW CREATE TABLE `admin_sessions`;
SHOW CREATE TABLE `projects`;
SHOW CREATE TABLE `project_versions`;
SHOW CREATE TABLE `project_translations`;
SHOW CREATE TABLE `project_categories`;
SHOW CREATE TABLE `project_items`;
SHOW CREATE TABLE `media_files`;
SHOW CREATE TABLE `project_media`;
SHOW CREATE TABLE `admin_events`;

SELECT 'admin_users' AS table_name, COUNT(*) AS row_count FROM `admin_users`
UNION ALL SELECT 'admin_sessions', COUNT(*) FROM `admin_sessions`
UNION ALL SELECT 'projects', COUNT(*) FROM `projects`
UNION ALL SELECT 'project_versions', COUNT(*) FROM `project_versions`
UNION ALL SELECT 'project_translations', COUNT(*) FROM `project_translations`
UNION ALL SELECT 'project_categories', COUNT(*) FROM `project_categories`
UNION ALL SELECT 'project_items', COUNT(*) FROM `project_items`
UNION ALL SELECT 'media_files', COUNT(*) FROM `media_files`
UNION ALL SELECT 'project_media', COUNT(*) FROM `project_media`
UNION ALL SELECT 'admin_events', COUNT(*) FROM `admin_events`;
