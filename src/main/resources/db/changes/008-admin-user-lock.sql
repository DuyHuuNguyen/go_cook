--liquibase formatted sql

--changeset gocook:008-admin-user-lock
ALTER TABLE users ADD COLUMN lock_reason VARCHAR(1000),
  ADD COLUMN locked_at BIGINT,
  ADD COLUMN locked_by BIGINT REFERENCES users(id);
