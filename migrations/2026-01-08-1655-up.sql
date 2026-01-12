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
