-- TCO Experiment Database Schema
-- PostgreSQL 16
-- Run once on fresh database; TimescaleDB upgrade path documented in technical debt

-- Evaluation vectors — one row per artifact evaluation
CREATE TABLE IF NOT EXISTS evaluation_vectors (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    artifact_id     UUID NOT NULL,
    agent_id        VARCHAR(50) NOT NULL,
    stage           VARCHAR(20) NOT NULL CHECK (stage IN ('design','build','test','deploy')),
    cycle_k         INTEGER NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- 11-dimension quality vector — all values in [0,1]
    v1_functional_correctness   FLOAT CHECK (v1_functional_correctness  BETWEEN 0 AND 1),
    v2_architectural_alignment  FLOAT CHECK (v2_architectural_alignment BETWEEN 0 AND 1),
    v3_scalability_projection   FLOAT CHECK (v3_scalability_projection  BETWEEN 0 AND 1),
    v4_security_risk            FLOAT CHECK (v4_security_risk           BETWEEN 0 AND 1),
    v5_observability_coverage   FLOAT CHECK (v5_observability_coverage  BETWEEN 0 AND 1),
    v6_testability              FLOAT CHECK (v6_testability             BETWEEN 0 AND 1),
    v7_maintainability          FLOAT CHECK (v7_maintainability         BETWEEN 0 AND 1),
    v8_technical_debt           FLOAT CHECK (v8_technical_debt          BETWEEN 0 AND 1),
    v9_performance              FLOAT CHECK (v9_performance             BETWEEN 0 AND 1),
    v10_confidence              FLOAT CHECK (v10_confidence             BETWEEN 0 AND 1),
    v11_anomaly_score           FLOAT CHECK (v11_anomaly_score          BETWEEN 0 AND 1),

    -- Experiment metadata
    scenario_id     VARCHAR(20),
    fault_injected  BOOLEAN DEFAULT FALSE,
    participant_id  VARCHAR(50),
    session_id      UUID
);

CREATE INDEX idx_ev_agent_cycle ON evaluation_vectors (agent_id, cycle_k, stage);
CREATE INDEX idx_ev_session ON evaluation_vectors (session_id, cycle_k);

-- Policy injections — one row per P_new submitted (both groups)
CREATE TABLE IF NOT EXISTS policy_injections (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    participant_id  VARCHAR(50) NOT NULL,
    session_id      UUID NOT NULL,
    group_type      VARCHAR(20) NOT NULL CHECK (group_type IN ('control','experimental')),
    task_id         VARCHAR(5) NOT NULL,
    cycle_k_pre     INTEGER NOT NULL,
    cycle_k_post    INTEGER,
    policy_text     TEXT,       -- NL policy (experimental group)
    raw_edit        TEXT,       -- Code/config correction (control group)

    -- PIQ scores (populated in Week 6 calibration + Week 7-8 evaluation)
    piq_rubric_clarity      INTEGER CHECK (piq_rubric_clarity      BETWEEN 1 AND 5),
    piq_rubric_specificity  INTEGER CHECK (piq_rubric_specificity  BETWEEN 1 AND 5),
    piq_rubric_impact       INTEGER CHECK (piq_rubric_impact       BETWEEN 1 AND 5),
    piq_llm_judge           FLOAT,
    vector_delta_post       JSONB,   -- {dim: delta_value} measured over 3-cycle window

    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Interaction log — millisecond-resolution event log per participant/task
CREATE TABLE IF NOT EXISTS interaction_log (
    id              BIGSERIAL PRIMARY KEY,
    participant_id  VARCHAR(50) NOT NULL,
    session_id      UUID NOT NULL,
    group_type      VARCHAR(20) NOT NULL,
    task_id         VARCHAR(5) NOT NULL,
    event_type      VARCHAR(30) NOT NULL,   -- click | scroll | keypress | context_switch | view_change | file_open | task_start | task_end
    element_id      VARCHAR(100),
    timestamp_ms    BIGINT NOT NULL,        -- ms since task start
    payload         JSONB
);

CREATE INDEX idx_il_participant_task ON interaction_log (participant_id, task_id);

-- Participants — registration and group assignment
CREATE TABLE IF NOT EXISTS participants (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    participant_code    VARCHAR(50) UNIQUE NOT NULL,  -- anonymous code, e.g. P001
    group_type          VARCHAR(20) NOT NULL CHECK (group_type IN ('control','experimental')),
    years_experience    INTEGER,
    pre_test_score      FLOAT,                        -- 0–10, code review pre-test
    tco_prior_exposure  BOOLEAN DEFAULT FALSE,
    registered_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- NASA Raw-TLX responses
CREATE TABLE IF NOT EXISTS nasa_tlx_responses (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    participant_id  VARCHAR(50) NOT NULL,
    session_id      UUID NOT NULL,
    measurement_point VARCHAR(10) NOT NULL CHECK (measurement_point IN ('post_t2','post_t4')),
    mental_demand   INTEGER CHECK (mental_demand   BETWEEN 1 AND 20),
    physical_demand INTEGER CHECK (physical_demand BETWEEN 1 AND 20),
    temporal_demand INTEGER CHECK (temporal_demand BETWEEN 1 AND 20),
    performance     INTEGER CHECK (performance     BETWEEN 1 AND 20),
    effort          INTEGER CHECK (effort          BETWEEN 1 AND 20),
    frustration     INTEGER CHECK (frustration     BETWEEN 1 AND 20),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
