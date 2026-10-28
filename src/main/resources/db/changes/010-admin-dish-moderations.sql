--liquibase formatted sql

--changeset gocook:010-admin-dish-moderations
CREATE TABLE admin_dish_moderations (
    id BIGSERIAL PRIMARY KEY,
    dish_id BIGINT NOT NULL REFERENCES dishes(id),
    reason VARCHAR(1000) NOT NULL,
    hidden_by BIGINT NOT NULL REFERENCES users(id),
    hidden_at BIGINT NOT NULL,
    restored_by BIGINT REFERENCES users(id),
    restored_at BIGINT
);

CREATE UNIQUE INDEX uk_admin_dish_moderations_active
ON admin_dish_moderations(dish_id)
WHERE restored_at IS NULL;
