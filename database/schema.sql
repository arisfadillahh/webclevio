BEGIN;

CREATE TABLE IF NOT EXISTS site_content (
  id text PRIMARY KEY,
  payload jsonb NOT NULL,
  revision bigint NOT NULL DEFAULT 1,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT site_content_singleton CHECK (id = 'main'),
  CONSTRAINT site_content_payload_object CHECK (jsonb_typeof(payload) = 'object')
);

CREATE TABLE IF NOT EXISTS articles (
  id text PRIMARY KEY,
  slug varchar(120) NOT NULL UNIQUE,
  title varchar(100) NOT NULL,
  excerpt varchar(220) NOT NULL,
  body text NOT NULL,
  image_url text NOT NULL,
  date_label varchar(40) NOT NULL,
  published_at timestamptz,
  author varchar(80) NOT NULL,
  category varchar(60) NOT NULL,
  reading_time varchar(32) NOT NULL,
  status varchar(16) NOT NULL DEFAULT 'draft',
  gallery_images jsonb NOT NULL DEFAULT '[]'::jsonb,
  gallery_mode varchar(16) NOT NULL DEFAULT 'carousel',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT articles_status_check CHECK (status IN ('draft', 'published')),
  CONSTRAINT articles_slug_format CHECK (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  CONSTRAINT articles_gallery_images_array CHECK (jsonb_typeof(gallery_images) = 'array'),
  CONSTRAINT articles_gallery_mode_check CHECK (gallery_mode IN ('carousel', 'grid'))
);

ALTER TABLE articles ADD COLUMN IF NOT EXISTS gallery_images jsonb NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS gallery_mode varchar(16) NOT NULL DEFAULT 'carousel';

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'articles_gallery_images_array') THEN
    ALTER TABLE articles ADD CONSTRAINT articles_gallery_images_array CHECK (jsonb_typeof(gallery_images) = 'array');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'articles_gallery_mode_check') THEN
    ALTER TABLE articles ADD CONSTRAINT articles_gallery_mode_check CHECK (gallery_mode IN ('carousel', 'grid'));
  END IF;
END;
$$;

CREATE TABLE IF NOT EXISTS media_assets (
  id uuid PRIMARY KEY,
  original_name varchar(255) NOT NULL,
  mime_type varchar(100) NOT NULL,
  byte_size integer NOT NULL,
  content bytea NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT media_assets_byte_size_check CHECK (byte_size > 0 AND byte_size <= 8388608)
);

CREATE TABLE IF NOT EXISTS events (
  id text PRIMARY KEY,
  title varchar(100) NOT NULL,
  description varchar(260) NOT NULL,
  date_label varchar(48) NOT NULL,
  time_label varchar(48) NOT NULL,
  starts_at timestamptz,
  ends_at timestamptz,
  location varchar(120) NOT NULL,
  audience varchar(100) NOT NULL,
  image_url text NOT NULL,
  landing_page_url text NOT NULL,
  status varchar(16) NOT NULL DEFAULT 'draft',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT events_status_check CHECK (status IN ('draft', 'published')),
  CONSTRAINT events_landing_page_url_check CHECK (landing_page_url ~ '^https?://')
);

CREATE TABLE IF NOT EXISTS admin_login_attempts (
  key_hash varchar(64) PRIMARY KEY,
  failure_count integer NOT NULL DEFAULT 0,
  window_started_at timestamptz NOT NULL DEFAULT now(),
  blocked_until timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT admin_login_attempts_failure_count_check CHECK (failure_count >= 0)
);

CREATE INDEX IF NOT EXISTS articles_published_idx
  ON articles (published_at DESC, created_at DESC)
  WHERE status = 'published';

CREATE INDEX IF NOT EXISTS articles_status_updated_idx
  ON articles (status, updated_at DESC);

CREATE INDEX IF NOT EXISTS events_published_order_idx
  ON events (sort_order, starts_at DESC, created_at DESC)
  WHERE status = 'published';

CREATE INDEX IF NOT EXISTS events_status_updated_idx
  ON events (status, updated_at DESC);

CREATE INDEX IF NOT EXISTS admin_login_attempts_updated_idx
  ON admin_login_attempts (updated_at);

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS articles_set_updated_at ON articles;
CREATE TRIGGER articles_set_updated_at
BEFORE UPDATE ON articles
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS events_set_updated_at ON events;
CREATE TRIGGER events_set_updated_at
BEFORE UPDATE ON events
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMIT;
