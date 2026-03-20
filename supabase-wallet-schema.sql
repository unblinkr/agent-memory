-- Wallet Credits Schema
-- Run this in your Supabase SQL Editor after running supabase-schema.sql

-- Wallet credits table
CREATE TABLE IF NOT EXISTS wallet_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address TEXT UNIQUE NOT NULL,
  credits INTEGER DEFAULT 0,
  total_funded_usdc DECIMAL(18,6) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Funding transactions table
CREATE TABLE IF NOT EXISTS funding_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address TEXT NOT NULL,
  amount_usdc DECIMAL(18,6) NOT NULL,
  tx_hash TEXT UNIQUE NOT NULL,
  credits_added INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_wallet_credits_address 
  ON wallet_credits (wallet_address);

CREATE INDEX IF NOT EXISTS idx_funding_transactions_wallet 
  ON funding_transactions (wallet_address);

CREATE INDEX IF NOT EXISTS idx_funding_transactions_tx 
  ON funding_transactions (tx_hash);

-- Function to get or create wallet credits
CREATE OR REPLACE FUNCTION get_wallet_credits(p_wallet_address TEXT)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_credits INTEGER;
BEGIN
  SELECT credits INTO v_credits
  FROM wallet_credits
  WHERE wallet_address = LOWER(p_wallet_address);
  
  IF NOT FOUND THEN
    INSERT INTO wallet_credits (wallet_address, credits)
    VALUES (LOWER(p_wallet_address), 0)
    RETURNING credits INTO v_credits;
  END IF;
  
  RETURN v_credits;
END;
$$;

-- Function to deduct credits
CREATE OR REPLACE FUNCTION deduct_credits(
  p_wallet_address TEXT,
  p_amount INTEGER
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
  v_success BOOLEAN;
BEGIN
  UPDATE wallet_credits
  SET credits = credits - p_amount,
      updated_at = NOW()
  WHERE wallet_address = LOWER(p_wallet_address)
    AND credits >= p_amount;
  
  GET DIAGNOSTICS v_success = ROW_COUNT;
  RETURN v_success > 0;
END;
$$;

-- Function to add credits from funding
CREATE OR REPLACE FUNCTION add_credits_from_funding(
  p_wallet_address TEXT,
  p_amount_usdc DECIMAL,
  p_tx_hash TEXT
)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_credits_to_add INTEGER;
  v_new_balance INTEGER;
BEGIN
  -- Calculate credits: $1 = 1000 credits
  v_credits_to_add := FLOOR(p_amount_usdc * 1000);
  
  -- Insert funding transaction
  INSERT INTO funding_transactions (wallet_address, amount_usdc, tx_hash, credits_added)
  VALUES (LOWER(p_wallet_address), p_amount_usdc, p_tx_hash, v_credits_to_add);
  
  -- Add credits to wallet
  INSERT INTO wallet_credits (wallet_address, credits, total_funded_usdc)
  VALUES (LOWER(p_wallet_address), v_credits_to_add, p_amount_usdc)
  ON CONFLICT (wallet_address)
  DO UPDATE SET
    credits = wallet_credits.credits + v_credits_to_add,
    total_funded_usdc = wallet_credits.total_funded_usdc + p_amount_usdc,
    updated_at = NOW()
  RETURNING credits INTO v_new_balance;
  
  RETURN v_new_balance;
END;
$$;
