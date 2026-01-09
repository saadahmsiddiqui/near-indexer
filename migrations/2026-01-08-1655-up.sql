CREATE TABLE blocks (
    height BIGINT PRIMARY KEY,
    chunks_included BIGINT,
    gas_price BIGINT,
    hash BYTEA,
    latest_protocol_version INT,
    prev_hash BYTEA,
    timestamp TIMESTAMPTZ,
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

CREATE TABLE catchup_state (
    chain_id number PRIMARY KEY,
    height BIGINT,
)