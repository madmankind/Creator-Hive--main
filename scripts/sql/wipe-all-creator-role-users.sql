-- DEV / STAGING ONLY — deletes every user with role CREATOR and dependent rows.
-- Run in Supabase SQL editor (or psql) against your project. Adjust schema if needed.
--
-- WARNING: Irreversible. Do NOT run on production unless you intend to remove all creators.
--
-- If your search_path uses schema `creatorhive`, prefix tables below, e.g. creatorhive.users

BEGIN;

DELETE FROM verification_tokens
WHERE identifier IN (SELECT email FROM users WHERE role = 'CREATOR');

DELETE FROM users WHERE role = 'CREATOR';

COMMIT;
