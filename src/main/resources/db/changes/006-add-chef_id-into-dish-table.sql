--liquibase formatted sql

--changeset jame:006-add-chef_id-into-dish-table.sql
alter table dishes add column chef_id bigint;