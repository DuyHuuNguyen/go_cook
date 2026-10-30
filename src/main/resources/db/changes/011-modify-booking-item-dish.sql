--liquibase formatted sql

--changeset hoang:011-modify-booking-item-dish
ALTER TABLE booking_item_dishes
ADD COLUMN IF NOT EXISTS booking_id BIGINT NOT NULL REFERENCES bookings(id);


ALTER TABLE bookings
ALTER COLUMN customer_note TYPE VARCHAR(500);

ALTER TABLE booking_item_dishes
DROP COLUMN IF EXISTS unit_price