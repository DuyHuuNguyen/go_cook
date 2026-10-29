--liquibase formatted sql

--changeset hoang:009-booking-item-dish-booking
ALTER TABLE booking_item_dishes
  ADD COLUMN IF NOT EXISTS booking_id BIGINT NOT NULL REFERENCES bookings(id);


ALTER TABLE bookings
ALTER COLUMN customer_note TYPE VARCHAR(500);