CREATE TABLE blocks (
    id BIGSERIAL PRIMARY KEY,
    height BIGINT,
    chunks_included BIGINT,
    gas_price BIGINT,
    hash TEXT NOT NULL,
    latest_protocol_version INT,
    timestamp TIMESTAMPTZ,
    total_supply NUMERIC
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