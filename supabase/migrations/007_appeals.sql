-- Appeals table: stores re-evaluation results
CREATE TABLE appeals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  toast_id uuid NOT NULL REFERENCES toasts(id) UNIQUE,
  stripe_session_id text,
  verdicts jsonb NOT NULL,
  official_tqi numeric(5,2) NOT NULL,
  official_tier text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_appeals_toast_id ON appeals(toast_id);

-- Track member free appeals (1 per month)
CREATE TABLE member_appeals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id text NOT NULL,
  toast_id uuid NOT NULL REFERENCES toasts(id),
  month_start date NOT NULL,
  was_free boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_member_appeals_customer_month ON member_appeals(customer_id, month_start);
