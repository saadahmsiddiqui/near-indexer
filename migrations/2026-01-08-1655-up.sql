CREATE TABLE blocks (
    height BIGINT PRIMARY KEY,
    block_merkle_root BYTEA,
    chunk_receipts_root BYTEA,
    chunk_tx_root BYTEA,
    chunk_headers_root BYTEA,
    chunks_included BIGINT,
    gas_price BIGINT,
    hash BYTEA,
    latest_protocol_version INT,
    prev_hash BYTEA,
    prev_state_root BYTEA,
    timestamp TIMESTAMPTZ,
    timestamp_nanosec NUMERIC,
    total_supply NUMERIC
);

CREATE TABLE chunks (
    height BIGINT,
    chunk_hash BYTEA,
    height_created BIGINT,
    height_included BIGINT,
    shard_id BIGINT,
    gas_used BIGINT,
    gas_limit BIGINT,
    rent_paid NUMERIC,
    PRIMARY KEY (height, chunk_hash)
);

CREATE TABLE block_index_state (
    height BIGINT,
    chunk_hash BYTEA,
    state VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (height, chunk_hash)
);