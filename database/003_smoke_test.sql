-- Run immediately after installing into the empty database.
-- Temporary fixture rows live in ONE transaction and are rolled back.
-- No admin user, password, session, or real project is created.
-- Auto-increment counters may advance on rollback; this is harmless.
USE `esithcom_website`;
SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;
SET SESSION sql_mode = 'STRICT_TRANS_TABLES,NO_ENGINE_SUBSTITUTION';
START TRANSACTION;

INSERT INTO `projects` (`created_at`, `updated_at`)
VALUES (UTC_TIMESTAMP(), UTC_TIMESTAMP());
SET @esi_test_project = LAST_INSERT_ID();

INSERT INTO `project_versions`
  (`project_id`, `version_no`, `slug`, `client`, `industry_slug`, `created_at`)
VALUES (@esi_test_project, 1, 'esi-schema-smoke-test', 'Schema validation only',
        'manufacturing', UTC_TIMESTAMP());
SET @esi_test_published = LAST_INSERT_ID();

INSERT INTO `project_translations` (`version_id`, `locale`, `title`, `location`, `description`)
VALUES (@esi_test_published, 'en', 'Published snapshot', 'Rayong', 'Temporary schema check'),
       (@esi_test_published, 'th', 'ฉบับเผยแพร่ ทดสอบภาษาไทย 🛠', 'ระยอง', 'ข้อมูลทดสอบที่จะ rollback');

INSERT INTO `project_categories` (`version_id`, `category_slug`, `position`)
VALUES (@esi_test_published, 'cctv', 0), (@esi_test_published, 'network', 1);

INSERT INTO `project_items` (`version_id`, `kind`, `locale`, `position`, `text`)
VALUES (@esi_test_published, 'scope', 'en', 0, 'First scope item'),
       (@esi_test_published, 'scope', 'en', 1, 'Second scope item'),
       (@esi_test_published, 'scope', 'th', 0, 'ขอบเขตงานภาษาไทย'),
       (@esi_test_published, 'partner', 'th', 0, 'ผู้เกี่ยวข้องเดิม');

INSERT INTO `media_files` (`path`, `mime_type`, `sha256`, `byte_size`, `width`, `height`, `created_at`)
VALUES ('/images/uploads/esi-schema-smoke-test.webp', 'image/webp', REPEAT('a', 64),
        100, 10, 10, UTC_TIMESTAMP());
SET @esi_test_media = LAST_INSERT_ID();

INSERT INTO `project_media` (`version_id`, `slot`, `media_id`)
VALUES (@esi_test_published, 'cover', @esi_test_media),
       (@esi_test_published, 'gallery-01', @esi_test_media);

INSERT INTO `project_versions`
  (`project_id`, `version_no`, `slug`, `client`, `industry_slug`, `created_at`)
VALUES (@esi_test_project, 2, 'esi-schema-draft-slug', 'Updated draft client',
        'manufacturing', UTC_TIMESTAMP());
SET @esi_test_draft = LAST_INSERT_ID();

INSERT INTO `project_translations` (`version_id`, `locale`, `title`, `location`, `description`)
VALUES (@esi_test_draft, 'en', 'Draft snapshot', 'Rayong', 'Not visible publicly');

UPDATE `projects`
SET `published_version_id` = @esi_test_published, `published_slug` = 'esi-schema-smoke-test',
    `draft_version_id` = @esi_test_draft, `lock_version` = 1
WHERE `id` = @esi_test_project;

INSERT INTO `admin_events` (`project_id`, `version_id`, `action`, `result`, `details`, `created_at`)
VALUES (@esi_test_project, @esi_test_draft, 'save_draft', 'success',
        'Temporary schema check; transaction will roll back', UTC_TIMESTAMP());

SELECT (p.published_version_id <> p.draft_version_id) AS separate_snapshots,
       (pub.slug = p.published_slug AND pub.slug <> draft.slug) AS published_slug_preserved,
       (pub.project_id = p.id AND draft.project_id = p.id) AS version_ownership_valid,
       (th.title = 'ฉบับเผยแพร่ ทดสอบภาษาไทย 🛠') AS thai_unicode_roundtrip,
       (SELECT COUNT(*) FROM `project_media` WHERE version_id = @esi_test_published) AS media_links
FROM `projects` p
JOIN `project_versions` pub ON pub.id = p.published_version_id
JOIN `project_versions` draft ON draft.id = p.draft_version_id
JOIN `project_translations` th ON th.version_id = pub.id AND th.locale = 'th'
WHERE p.id = @esi_test_project;

ROLLBACK;

SELECT (SELECT COUNT(*) FROM `projects` WHERE id = @esi_test_project) AS remaining_test_projects,
       (SELECT COUNT(*) FROM `project_versions` WHERE project_id = @esi_test_project) AS remaining_test_versions,
       (SELECT COUNT(*) FROM `media_files` WHERE id = @esi_test_media) AS remaining_test_media,
       (SELECT COUNT(*) FROM `admin_users`) AS admin_accounts,
       (SELECT COUNT(*) FROM `admin_sessions`) AS active_or_test_sessions;
