--liquibase formatted sql

--changeset gocook:009-admin-menu-moderations
CREATE TABLE admin_menu_moderations (
    id BIGSERIAL PRIMARY KEY,
    menu_id BIGINT NOT NULL REFERENCES menus(id),
    reason VARCHAR(1000) NOT NULL,
    hidden_by BIGINT NOT NULL REFERENCES users(id),
    hidden_at BIGINT NOT NULL,
    restored_by BIGINT REFERENCES users(id),
    restored_at BIGINT
);

CREATE UNIQUE INDEX uk_admin_menu_moderations_active
ON admin_menu_moderations(menu_id)
WHERE restored_at IS NULL;
