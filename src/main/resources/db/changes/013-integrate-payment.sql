--liquibase formatted sql

--changeset hoang:create-payments-table
AlTER TABLE bookings
DROP COLUMN IF EXISTS payment_id;



ALTER TABLE payments
    ADD COLUMN booking_id BIGINT NOT NULL;

ALTER TABLE payments
    ADD CONSTRAINT fk_payments_booking
        FOREIGN KEY (booking_id)
            REFERENCES bookings(id);


ALTER TABLE payments
RENAME COLUMN transaction_code TO transaction_ref;


ALTER TABLE payments
ADD COLUMN vnp_transaction_no VARCHAR(100),
ADD COLUMN bank_code VARCHAR(50),
ADD COLUMN expired_at TIMESTAMPTZ;


ALTER TABLE payments
ALTER COLUMN payment_method SET NOT NULL,
ALTER COLUMN transaction_ref SET NOT NULL,
ALTER COLUMN amount SET NOT NULL,
ALTER COLUMN status SET NOT NULL;


ALTER TABLE payments
ALTER COLUMN payment_method SET DEFAULT 'VNPAY',
ALTER COLUMN status SET DEFAULT 'PENDING',
ALTER COLUMN amount SET DEFAULT 0;


ALTER TABLE payments
    ADD CONSTRAINT uk_payments_transaction_ref
        UNIQUE (transaction_ref);


ALTER TABLE payments
    ADD CONSTRAINT chk_payments_amount
        CHECK (amount > 0);


