CREATE TABLE certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  toast_id uuid NOT NULL REFERENCES toasts(id) UNIQUE,
  stripe_session_id text NOT NULL UNIQUE,
  storage_path text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_certificates_toast_id ON certificates(toast_id);
