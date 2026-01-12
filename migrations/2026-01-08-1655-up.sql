CREATE TABLE blocks (
    id BIGSERIAL PRIMARY KEY,
    height BIGINT,
    chunks_included BIGINT,
    gas_price BIGINT,
    hash BYTEA,
    latest_protocol_version INT,
    prev_hash BYTEA,
    timestamp TIMESTAMPTZ,
    total_supply NUMERIC
);

CREATE TABLE chunks (
    id BIGSERIAL PRIMARY KEY,
    height BIGINT,
    chunk_hash BYTEA,
    height_created BIGINT,
    height_included BIGINT,
    shard_id BIGINT,
    gas_used BIGINT,
    gas_limit BIGINT,
    rent_paid NUMERIC,
    index_state INT DEFAULT 0
);

CREATE TABLE transactions (
    id BIGSERIAL PRIMARY KEY,
    hash TEXT NOT NULL UNIQUE,
    nonce BIGINT NOT NULL,
    priority_fee BIGINT,
    public_key TEXT NOT NULL,
    receiver_id TEXT NOT NULL,
    signature TEXT NOT NULL,
    signer_id TEXT NOT NULL,
    actions JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);