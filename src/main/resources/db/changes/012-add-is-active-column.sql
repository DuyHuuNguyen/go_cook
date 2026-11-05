--liquibase formatted sql

--changeset thaniel:012-chat-is-active.sql
ALTER TABLE chat_conversations
    ADD COLUMN is_active boolean NOT NULL DEFAULT true;

ALTER TABLE chat_message_attachments
    ADD COLUMN is_active boolean NOT NULL DEFAULT true;

ALTER TABLE chat_messages
    ADD COLUMN is_active boolean NOT NULL DEFAULT true;