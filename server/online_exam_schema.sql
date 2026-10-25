-- Online Examination System - PostgreSQL schema (3NF Clean Architecture)
-- Target: PostgreSQL 14+
-- All application tables, views, functions and triggers are in schema public.
-- Run against an empty database. Application workflows should use transactions.

BEGIN;
SET search_path TO public;

-- ============================================================
-- 0. CLEANUP (DROP EXISTING VIEWS, TABLES, AND FUNCTIONS)
-- ============================================================

-- Drop views first to prevent dependency issues
DROP VIEW IF EXISTS public.v_user_topic_performance CASCADE;
DROP VIEW IF EXISTS public.v_user_statistics CASCADE;
DROP VIEW IF EXISTS public.v_room_results CASCADE;
DROP VIEW IF EXISTS public.v_room_list CASCADE;
DROP VIEW IF EXISTS public.v_attempt_results CASCADE;

-- Drop attempt and answer tables (current 3NF and legacy snapshots)
DROP TABLE IF EXISTS public.attempt_answers CASCADE;
DROP TABLE IF EXISTS public.attempt_question_options CASCADE;
DROP TABLE IF EXISTS public.attempt_questions CASCADE;
DROP TABLE IF EXISTS public.exam_attempts CASCADE;

-- Drop room and membership tables (current and legacy configs)
DROP TABLE IF EXISTS public.room_members CASCADE;
DROP TABLE IF EXISTS public.room_topics CASCADE;
DROP TABLE IF EXISTS public.room_difficulty_configs CASCADE;
DROP TABLE IF EXISTS public.exam_rooms CASCADE;

-- Drop question bank tables (current and legacy lookup tables)
DROP TABLE IF EXISTS public.question_options CASCADE;
DROP TABLE IF EXISTS public.questions CASCADE;
DROP TABLE IF EXISTS public.difficulty_levels CASCADE;
DROP TABLE IF EXISTS public.topics CASCADE;

-- Drop user, session, and audit tables
DROP TABLE IF EXISTS public.sessions CASCADE;
DROP TABLE IF EXISTS public.audit_logs CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- Drop triggers and utility functions
DROP FUNCTION IF EXISTS public.set_updated_at() CASCADE;

-- ============================================================
-- 1. USERS AND SESSIONS
-- ============================================================

CREATE TABLE public.users (
    id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    username        VARCHAR(50)  NOT NULL,
    email           VARCHAR(254),
    password_hash   TEXT         NOT NULL,
    display_name    VARCHAR(100) NOT NULL,
    system_role     VARCHAR(10)  NOT NULL DEFAULT 'USER',
    status          VARCHAR(16)  NOT NULL DEFAULT 'ACTIVE',
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT ck_users_username_nonblank CHECK (length(btrim(username)) > 0),
    CONSTRAINT ck_users_display_name_nonblank CHECK (length(btrim(display_name)) > 0),
    CONSTRAINT ck_users_password_hash_nonblank CHECK (length(password_hash) > 0),
    CONSTRAINT ck_users_system_role CHECK (system_role IN ('USER', 'ADMIN')),
    CONSTRAINT ck_users_status CHECK (status IN ('ACTIVE', 'SUSPENDED'))
);

-- Case-insensitive uniqueness without requiring the citext extension.
CREATE UNIQUE INDEX uq_users_username_lower ON public.users (lower(username));
CREATE UNIQUE INDEX uq_users_email_lower ON public.users (lower(email)) WHERE email IS NOT NULL;

CREATE TABLE public.sessions (
    id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id         BIGINT      NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    token_hash      BYTEA       NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at      TIMESTAMPTZ NOT NULL,
    revoked_at      TIMESTAMPTZ,
    last_seen_at    TIMESTAMPTZ,

    CONSTRAINT uq_sessions_token_hash UNIQUE (token_hash),
    CONSTRAINT ck_sessions_token_hash_length CHECK (octet_length(token_hash) = 32),
    CONSTRAINT ck_sessions_expiry CHECK (expires_at > created_at),
    CONSTRAINT ck_sessions_revoked_at CHECK (revoked_at IS NULL OR revoked_at >= created_at)
);
CREATE INDEX ix_sessions_user_expiry ON public.sessions (user_id, expires_at);
CREATE INDEX ix_sessions_active_expiry ON public.sessions (expires_at) WHERE revoked_at IS NULL;

-- ============================================================
-- 2. QUESTION BANK: QUESTIONS AND OPTIONS
-- ============================================================

CREATE TABLE public.questions (
    id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    topic           VARCHAR(100) NOT NULL,
    difficulty      VARCHAR(20)  NOT NULL,
    question_type   VARCHAR(30)  NOT NULL DEFAULT 'SINGLE_CHOICE',
    content         TEXT         NOT NULL,
    status          VARCHAR(16)  NOT NULL DEFAULT 'ACTIVE',
    created_by      BIGINT       REFERENCES public.users(id) ON DELETE SET NULL,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT ck_questions_topic_nonblank CHECK (length(btrim(topic)) > 0),
    CONSTRAINT ck_questions_difficulty CHECK (difficulty IN ('EASY', 'MEDIUM', 'HARD')),
    CONSTRAINT ck_questions_type CHECK (question_type IN ('SINGLE_CHOICE')),
    CONSTRAINT ck_questions_content_nonblank CHECK (length(btrim(content)) > 0),
    CONSTRAINT ck_questions_status CHECK (status IN ('ACTIVE', 'ARCHIVED'))
);
CREATE INDEX ix_questions_status_topic_diff ON public.questions (status, topic, difficulty, id);
CREATE INDEX ix_questions_topic_difficulty ON public.questions (topic, difficulty, status);
CREATE INDEX ix_questions_created_by ON public.questions (created_by);

CREATE TABLE public.question_options (
    id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    question_id     BIGINT       NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    content         TEXT         NOT NULL,
    position        SMALLINT     NOT NULL,
    is_correct      BOOLEAN      NOT NULL DEFAULT FALSE,

    CONSTRAINT ck_question_options_content_nonblank CHECK (length(btrim(content)) > 0),
    CONSTRAINT ck_question_options_position CHECK (position > 0),
    CONSTRAINT uq_question_options_position UNIQUE (question_id, position),
    CONSTRAINT uq_question_options_question_id UNIQUE (question_id, id)
);
-- Allows at most one correct option per single-choice question.
CREATE UNIQUE INDEX uq_question_options_one_correct
    ON public.question_options (question_id) WHERE is_correct = TRUE;
CREATE INDEX ix_question_options_question ON public.question_options (question_id, position);

-- ============================================================
-- 3. EXAM ROOMS AND ROOM MEMBERS
-- ============================================================

CREATE TABLE public.exam_rooms (
    id                  BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    room_code           VARCHAR(12)  NOT NULL,
    owner_id            BIGINT       NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
    name                VARCHAR(120) NOT NULL,
    description         TEXT,
    topic               VARCHAR(100),
    easy_count          INTEGER      NOT NULL DEFAULT 0,
    medium_count        INTEGER      NOT NULL DEFAULT 0,
    hard_count          INTEGER      NOT NULL DEFAULT 0,
    visibility          VARCHAR(10)  NOT NULL DEFAULT 'PUBLIC',
    status              VARCHAR(16)  NOT NULL DEFAULT 'WAITING',
    duration_seconds    INTEGER      NOT NULL,
    max_participants    INTEGER,
    started_at          TIMESTAMPTZ,
    ends_at             TIMESTAMPTZ,
    ended_at            TIMESTAMPTZ,
    created_at          TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT ck_exam_rooms_code_nonblank CHECK (length(btrim(room_code)) > 0),
    CONSTRAINT ck_exam_rooms_name_nonblank CHECK (length(btrim(name)) > 0),
    CONSTRAINT ck_exam_rooms_topic_nonblank CHECK (topic IS NULL OR length(btrim(topic)) > 0),
    CONSTRAINT ck_exam_rooms_question_counts CHECK (
        easy_count >= 0 AND medium_count >= 0 AND hard_count >= 0
        AND (easy_count + medium_count + hard_count) > 0
    ),
    CONSTRAINT ck_exam_rooms_visibility CHECK (visibility IN ('PUBLIC', 'PRIVATE')),
    CONSTRAINT ck_exam_rooms_status CHECK (status IN ('WAITING', 'RUNNING', 'ENDED', 'CANCELLED')),
    CONSTRAINT ck_exam_rooms_duration CHECK (duration_seconds > 0),
    CONSTRAINT ck_exam_rooms_max_participants CHECK (max_participants IS NULL OR max_participants > 0),
    CONSTRAINT ck_exam_rooms_time_order CHECK (ends_at IS NULL OR (started_at IS NOT NULL AND ends_at > started_at)),
    CONSTRAINT ck_exam_rooms_state_times CHECK (
        (status = 'WAITING' AND started_at IS NULL AND ends_at IS NULL AND ended_at IS NULL)
        OR
        (status = 'RUNNING' AND started_at IS NOT NULL AND ends_at IS NOT NULL AND ended_at IS NULL)
        OR
        (status = 'ENDED' AND started_at IS NOT NULL AND ends_at IS NOT NULL AND ended_at IS NOT NULL)
        OR
        (status = 'CANCELLED' AND ended_at IS NOT NULL)
    )
);
CREATE UNIQUE INDEX uq_exam_rooms_code_upper ON public.exam_rooms (upper(room_code));
CREATE INDEX ix_exam_rooms_status_created ON public.exam_rooms (status, created_at DESC);
CREATE INDEX ix_exam_rooms_owner_created ON public.exam_rooms (owner_id, created_at DESC);

-- Authorized roster / waiting list for room participants (Whitelist mechanism for private rooms).
CREATE TABLE public.room_members (
    room_id     BIGINT      NOT NULL REFERENCES public.exam_rooms(id) ON DELETE RESTRICT,
    user_id     BIGINT      NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
    joined_at   TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT pk_room_members PRIMARY KEY (room_id, user_id)
);
CREATE INDEX ix_room_members_user_joined ON public.room_members (user_id, joined_at DESC);

-- ============================================================
-- 4. EXAM / PRACTICE ATTEMPTS AND 3NF ANSWERS
-- ============================================================

CREATE TABLE public.exam_attempts (
    id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id         BIGINT      NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
    room_id         BIGINT      REFERENCES public.exam_rooms(id) ON DELETE RESTRICT,
    mode            VARCHAR(10) NOT NULL,
    status          VARCHAR(20) NOT NULL DEFAULT 'IN_PROGRESS',
    started_at      TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deadline_at     TIMESTAMPTZ NOT NULL,
    submitted_at    TIMESTAMPTZ,
    graded_at       TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT ck_exam_attempts_mode CHECK (mode IN ('EXAM', 'PRACTICE')),
    CONSTRAINT ck_exam_attempts_mode_room CHECK (
        (mode = 'EXAM' AND room_id IS NOT NULL)
        OR
        (mode = 'PRACTICE' AND room_id IS NULL)
    ),
    CONSTRAINT ck_exam_attempts_status CHECK (status IN ('IN_PROGRESS', 'SUBMITTED', 'AUTO_SUBMITTED', 'TERMINATED')),
    CONSTRAINT ck_exam_attempts_deadline CHECK (deadline_at > started_at),
    CONSTRAINT ck_exam_attempts_completion CHECK (
        (status = 'IN_PROGRESS' AND submitted_at IS NULL AND graded_at IS NULL)
        OR
        (status IN ('SUBMITTED', 'AUTO_SUBMITTED', 'TERMINATED')
            AND submitted_at IS NOT NULL AND graded_at IS NOT NULL)
    ),
    CONSTRAINT ck_exam_attempts_completion_time CHECK (
        submitted_at IS NULL OR submitted_at >= started_at
    )
);
-- One official attempt per user per room; practice attempts remain unlimited.
CREATE UNIQUE INDEX uq_exam_attempt_room_user
    ON public.exam_attempts (room_id, user_id) WHERE room_id IS NOT NULL;
CREATE INDEX ix_exam_attempts_user_started ON public.exam_attempts (user_id, started_at DESC);
CREATE INDEX ix_exam_attempts_room_status ON public.exam_attempts (room_id, status);
CREATE INDEX ix_exam_attempts_deadline ON public.exam_attempts (deadline_at) WHERE status = 'IN_PROGRESS';

-- 3NF Compliant: Represents questions assigned to an attempt and the participant's chosen option.
-- Pre-populated upon attempt creation with selected_option_id = NULL to fix question order.
CREATE TABLE public.attempt_answers (
    attempt_id          BIGINT      NOT NULL REFERENCES public.exam_attempts(id) ON DELETE CASCADE,
    question_id         BIGINT      NOT NULL REFERENCES public.questions(id) ON DELETE RESTRICT,
    position            INTEGER     NOT NULL,
    selected_option_id  BIGINT,
    answered_at         TIMESTAMPTZ,

    CONSTRAINT pk_attempt_answers PRIMARY KEY (attempt_id, question_id),
    CONSTRAINT uq_attempt_answers_position UNIQUE (attempt_id, position),
    CONSTRAINT ck_attempt_answers_position CHECK (position > 0),
    -- Guarantees the selected option belongs to the exact question assigned.
    CONSTRAINT fk_attempt_answers_option_same_question
        FOREIGN KEY (question_id, selected_option_id)
        REFERENCES public.question_options (question_id, id)
        ON DELETE RESTRICT
);
CREATE INDEX ix_attempt_answers_attempt ON public.attempt_answers (attempt_id);
CREATE INDEX ix_attempt_answers_question ON public.attempt_answers (question_id);
CREATE INDEX ix_attempt_answers_selected_option ON public.attempt_answers (selected_option_id);

-- ============================================================
-- 5. AUDIT LOGS
-- ============================================================

CREATE TABLE public.audit_logs (
    id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    actor_user_id   BIGINT REFERENCES public.users(id) ON DELETE SET NULL,
    action          VARCHAR(80) NOT NULL,
    entity_type     VARCHAR(50),
    entity_id       BIGINT,
    request_id      VARCHAR(100),
    ip_address      INET,
    metadata        JSONB       NOT NULL DEFAULT '{}'::JSONB,
    occurred_at     TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT ck_audit_logs_action_nonblank CHECK (length(btrim(action)) > 0),
    CONSTRAINT ck_audit_logs_metadata_object CHECK (jsonb_typeof(metadata) = 'object')
);
CREATE INDEX ix_audit_logs_occurred_at ON public.audit_logs (occurred_at DESC);
CREATE INDEX ix_audit_logs_actor_time ON public.audit_logs (actor_user_id, occurred_at DESC);
CREATE INDEX ix_audit_logs_entity ON public.audit_logs (entity_type, entity_id);

-- ============================================================
-- 6. UPDATED_AT TRIGGER
-- ============================================================

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
    NEW.updated_at := CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_users_updated_at
BEFORE UPDATE ON public.users
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_questions_updated_at
BEFORE UPDATE ON public.questions
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_exam_rooms_updated_at
BEFORE UPDATE ON public.exam_rooms
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- 7. VIEWS FOR RESULTS, ROOM LISTS, AND USER STATISTICS
-- ============================================================

-- Dynamic computation of attempt scores, correct/wrong counts and 10-point scale.
CREATE OR REPLACE VIEW public.v_attempt_results AS
WITH per_attempt AS (
    SELECT
        ea.id AS attempt_id,
        COUNT(aa.question_id)::INTEGER AS total_questions,
        COUNT(aa.question_id) FILTER (
            WHERE qo.is_correct IS TRUE
        )::INTEGER AS correct_count,
        COUNT(aa.question_id) FILTER (
            WHERE aa.selected_option_id IS NOT NULL AND qo.is_correct IS FALSE
        )::INTEGER AS wrong_count,
        COUNT(aa.question_id) FILTER (
            WHERE aa.selected_option_id IS NULL
        )::INTEGER AS unanswered_count
    FROM public.exam_attempts ea
    LEFT JOIN public.attempt_answers aa ON aa.attempt_id = ea.id
    LEFT JOIN public.question_options qo ON qo.id = aa.selected_option_id
    GROUP BY ea.id
)
SELECT
    ea.id AS attempt_id,
    ea.user_id,
    ea.room_id,
    ea.mode,
    ea.status,
    ea.started_at,
    ea.deadline_at,
    ea.submitted_at,
    ea.graded_at,
    pa.total_questions,
    pa.correct_count,
    pa.wrong_count,
    pa.unanswered_count,
    ROUND(100.0 * pa.correct_count / NULLIF(pa.total_questions, 0), 2) AS correct_percent,
    ROUND(10.0 * pa.correct_count / NULLIF(pa.total_questions, 0), 2) AS score_10
FROM public.exam_attempts ea
JOIN per_attempt pa ON pa.attempt_id = ea.id
WHERE ea.status <> 'IN_PROGRESS';

CREATE OR REPLACE VIEW public.v_room_list AS
WITH member_totals AS (
    SELECT room_id, COUNT(*)::INTEGER AS participant_count
    FROM public.room_members
    GROUP BY room_id
)
SELECT
    r.id AS room_id,
    r.room_code,
    r.name AS room_name,
    r.description,
    r.topic,
    r.visibility,
    r.status,
    r.owner_id,
    owner.display_name AS owner_display_name,
    (r.easy_count + r.medium_count + r.hard_count)::INTEGER AS question_count,
    r.easy_count,
    r.medium_count,
    r.hard_count,
    r.duration_seconds,
    r.max_participants,
    r.started_at,
    r.ends_at,
    r.ended_at,
    r.created_at,
    COALESCE(mt.participant_count, 0) AS participant_count
FROM public.exam_rooms r
JOIN public.users owner ON owner.id = r.owner_id
LEFT JOIN member_totals mt ON mt.room_id = r.id;

CREATE OR REPLACE VIEW public.v_room_results AS
SELECT
    vr.attempt_id,
    vr.room_id,
    vr.user_id,
    u.username,
    u.display_name,
    vr.status AS attempt_status,
    vr.started_at,
    vr.submitted_at,
    vr.graded_at,
    vr.total_questions,
    vr.correct_count,
    vr.wrong_count,
    vr.unanswered_count,
    vr.correct_percent,
    vr.score_10
FROM public.v_attempt_results vr
JOIN public.users u ON u.id = vr.user_id
JOIN public.exam_rooms r ON r.id = vr.room_id
WHERE vr.room_id IS NOT NULL
  AND r.status = 'ENDED';

CREATE OR REPLACE VIEW public.v_user_statistics AS
SELECT
    vr.user_id,
    COUNT(*)::INTEGER AS completed_attempts,
    COUNT(*) FILTER (WHERE vr.mode = 'EXAM')::INTEGER AS completed_exam_attempts,
    COUNT(*) FILTER (WHERE vr.mode = 'PRACTICE')::INTEGER AS completed_practice_attempts,
    SUM(vr.total_questions)::BIGINT AS total_questions,
    SUM(vr.correct_count)::BIGINT AS total_correct,
    SUM(vr.wrong_count)::BIGINT AS total_wrong,
    SUM(vr.unanswered_count)::BIGINT AS total_unanswered,
    ROUND(100.0 * SUM(vr.correct_count) / NULLIF(SUM(vr.total_questions), 0), 2) AS overall_correct_percent,
    ROUND(10.0 * SUM(vr.correct_count) / NULLIF(SUM(vr.total_questions), 0), 2) AS overall_score_10
FROM public.v_attempt_results vr
GROUP BY vr.user_id;

-- View phục vụ trực quan hóa biểu đồ phân tích năng lực theo từng chủ đề
CREATE OR REPLACE VIEW public.v_user_topic_performance AS
WITH per_user_topic AS (
    SELECT
        ea.user_id,
        q.topic,
        COUNT(aa.question_id)::INTEGER AS total_questions,
        COUNT(aa.question_id) FILTER (
            WHERE qo.is_correct IS TRUE
        )::INTEGER AS correct_count,
        COUNT(aa.question_id) FILTER (
            WHERE aa.selected_option_id IS NOT NULL AND qo.is_correct IS FALSE
        )::INTEGER AS wrong_count,
        COUNT(aa.question_id) FILTER (
            WHERE aa.selected_option_id IS NULL
        )::INTEGER AS unanswered_count
    FROM public.exam_attempts ea
    JOIN public.attempt_answers aa ON aa.attempt_id = ea.id
    JOIN public.questions q ON q.id = aa.question_id
    LEFT JOIN public.question_options qo ON qo.id = aa.selected_option_id
    WHERE ea.status <> 'IN_PROGRESS'
    GROUP BY ea.user_id, q.topic
)
SELECT
    put.user_id,
    put.topic,
    put.total_questions,
    put.correct_count,
    put.wrong_count,
    put.unanswered_count,
    ROUND(100.0 * put.correct_count / NULLIF(put.total_questions, 0), 2) AS correct_percent,
    ROUND(10.0 * put.correct_count / NULLIF(put.total_questions, 0), 2) AS score_10
FROM per_user_topic put;

COMMIT;

-- ============================================================
-- APPLICATION-LEVEL RULES THAT MUST BE ENFORCED IN TRANSACTIONS
-- ============================================================
-- 1. For every ACTIVE question: at least 2 options and exactly 1 correct option.
-- 2. When creating an exam room, easy_count, medium_count, hard_count determine question requirements.
-- 3. Room question count sum = (easy_count + medium_count + hard_count) > 0.
-- 4. If room.topic is provided, only questions in that topic qualify; if NULL, all active topics qualify.
-- 5. On attempt creation: select questions according to config, insert into attempt_answers with
--    selected_option_id = NULL and sequential positions (1..N).
-- 6. When a participant answers/changes an option: UPDATE attempt_answers SET selected_option_id = ?,
--    answered_at = CURRENT_TIMESTAMP WHERE attempt_id = ? AND question_id = ?.
-- 7. On submit/deadline: verify status is IN_PROGRESS and within deadline, atomically set
--    status = 'SUBMITTED' (or 'AUTO_SUBMITTED'), submitted_at and graded_at.
-- 8. A client must never receive is_correct before exam completion.
-- 9. Store only a 32-byte hash (SHA-256) of the opaque session token in sessions.token_hash.
-- 10. Audit logs must never log secrets or passwords in metadata.
