CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
BEGIN
    CREATE TYPE user_plan AS ENUM ('FREE', 'PRO');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    CREATE TYPE submission_status AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'ERROR');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    CREATE TYPE submission_source_type AS ENUM ('TEXT', 'PDF', 'DOCX');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    CREATE TYPE processing_mode AS ENUM ('QUICK', 'FULL');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    CREATE TYPE result_label AS ENUM ('ai', 'human');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(320) NOT NULL,
    password VARCHAR(255) NOT NULL,
    plan user_plan NOT NULL DEFAULT 'FREE',
    daily_submission_count INTEGER NOT NULL DEFAULT 0 CHECK (daily_submission_count >= 0),
    last_submission_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_users_email_lower ON users ((LOWER(email)));

CREATE TABLE IF NOT EXISTS submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    source_type submission_source_type NOT NULL,
    source_filename VARCHAR(255),
    original_text TEXT NOT NULL,
    processing_mode processing_mode NOT NULL,
    status submission_status NOT NULL DEFAULT 'PENDING',
    word_count INTEGER NOT NULL DEFAULT 0 CHECK (word_count >= 0),
    error_message TEXT,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS submission_results (
    submission_id UUID PRIMARY KEY REFERENCES submissions(id) ON DELETE CASCADE,
    global_label result_label NOT NULL,
    global_confidence NUMERIC(5,4) NOT NULL CHECK (global_confidence >= 0 AND global_confidence <= 1),
    layer1_score NUMERIC(5,4) CHECK (layer1_score >= 0 AND layer1_score <= 1),
    layer2_score NUMERIC(5,4) CHECK (layer2_score >= 0 AND layer2_score <= 1),
    layer3_score NUMERIC(5,4) CHECK (layer3_score >= 0 AND layer3_score <= 1),
    model_attribution JSONB NOT NULL DEFAULT '{}'::jsonb,
    stylistic_features JSONB NOT NULL DEFAULT '{}'::jsonb,
    statistical_features JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_reliable BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS submission_chunks (
    id BIGSERIAL PRIMARY KEY,
    submission_id UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
    chunk_index INTEGER NOT NULL CHECK (chunk_index >= 0),
    chunk_text TEXT NOT NULL,
    word_count INTEGER NOT NULL DEFAULT 0 CHECK (word_count >= 0),
    label result_label NOT NULL,
    confidence NUMERIC(5,4) NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
    layer1_score NUMERIC(5,4) CHECK (layer1_score >= 0 AND layer1_score <= 1),
    layer2_score NUMERIC(5,4) CHECK (layer2_score >= 0 AND layer2_score <= 1),
    layer3_score NUMERIC(5,4) CHECK (layer3_score >= 0 AND layer3_score <= 1),
    stylistic_features JSONB NOT NULL DEFAULT '{}'::jsonb,
    statistical_features JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (submission_id, chunk_index)
);

CREATE INDEX IF NOT EXISTS idx_submissions_user_submitted_at
    ON submissions (user_id, submitted_at DESC);

CREATE INDEX IF NOT EXISTS idx_submissions_status_updated_at
    ON submissions (status, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_submissions_submitted_at
    ON submissions (submitted_at DESC);

CREATE INDEX IF NOT EXISTS idx_submissions_stuck_processing
    ON submissions (status, started_at)
    WHERE status = 'PROCESSING';

CREATE INDEX IF NOT EXISTS idx_submission_results_global_label
    ON submission_results (global_label);

CREATE INDEX IF NOT EXISTS idx_submission_chunks_submission
    ON submission_chunks (submission_id);

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_users_set_updated_at ON users;
CREATE TRIGGER trg_users_set_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_submissions_set_updated_at ON submissions;
CREATE TRIGGER trg_submissions_set_updated_at
BEFORE UPDATE ON submissions
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_submission_results_set_updated_at ON submission_results;
CREATE TRIGGER trg_submission_results_set_updated_at
BEFORE UPDATE ON submission_results
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();
