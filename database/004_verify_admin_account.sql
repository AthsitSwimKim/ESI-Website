-- Read-only account metadata. Never SELECT the password_hash or raw credentials.
USE `esithcom_website`;

SELECT `id`, `username`, `display_name`, `role`, `is_active`, `created_at`, `last_login_at`,
       (LEFT(`password_hash`, 7) = '$2y$12$' AND LENGTH(`password_hash`) = 60)
         AS bcrypt_cost_12_format
FROM `admin_users`
WHERE `username` = 'esi_admin';

SELECT COUNT(*) AS matching_accounts,
       SUM(`role` = 'admin' AND `is_active` = 1) AS active_admins
FROM `admin_users`
WHERE `username` = 'esi_admin';
