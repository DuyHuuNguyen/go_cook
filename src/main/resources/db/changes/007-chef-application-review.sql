--liquibase formatted sql

--changeset gocook:007-chef-application-review
ALTER TABLE chef_profiles ADD COLUMN review_status VARCHAR(20),
  ADD COLUMN review_reason VARCHAR(1000),
  ADD COLUMN submitted_at BIGINT,
  ADD COLUMN status_changed_at BIGINT,
  ADD COLUMN status_changed_by BIGINT REFERENCES users(id);

-- Preserve existing, active Chef grants. Unknown historical actors remain null.
UPDATE chef_profiles cp SET review_status = CASE WHEN EXISTS (
  SELECT 1 FROM user_roles ur JOIN roles r ON r.id = ur.role_id
  WHERE ur.user_id = cp.user_id AND ur.is_active = true
    AND r.is_active = true AND r.role_name = 'ROLE_CHEF'
) THEN 'APPROVED' ELSE 'PENDING' END, submitted_at = cp.created_at;

ALTER TABLE chef_profiles ALTER COLUMN review_status SET DEFAULT 'PENDING',
  ALTER COLUMN review_status SET NOT NULL,
  ADD CONSTRAINT chef_review_status_check CHECK (review_status IN ('PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED'));
CREATE UNIQUE INDEX IF NOT EXISTS chef_profiles_review_user_unique ON chef_profiles(user_id);
