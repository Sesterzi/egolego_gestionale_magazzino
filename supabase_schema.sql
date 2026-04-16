-- ============================================================
--  EGOLEGO — Schema Supabase
--  Esegui questo script nel SQL Editor di Supabase
--  (Database → SQL Editor → New query → incolla → Run)
-- ============================================================

-- ── 1. MATERIE PRIME ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS materie_prime (
    id              BIGSERIAL PRIMARY KEY,
    unique_id       TEXT NOT NULL UNIQUE,   -- es. "300578" (size_code + color_id)
    color_name      TEXT NOT NULL,          -- es. "Light Nougat"
    color_ref       TEXT,                   -- es. "#F6D7B3"
    color_id        TEXT,                   -- es. "78"
    lego_size       TEXT,                   -- es. "Brick 1*1"
    size_code       TEXT,                   -- es. "3005"
    picture_url     TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── 2. STOCK ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS stock (
    id                   BIGSERIAL PRIMARY KEY,
    codice_materiale     TEXT NOT NULL UNIQUE REFERENCES materie_prime(unique_id) ON UPDATE CASCADE,
    quantita_disponibile INTEGER NOT NULL DEFAULT 0,
    prezzo_medio         NUMERIC(12, 4) DEFAULT 0,
    updated_at           TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-aggiorna updated_at ad ogni modifica
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_stock_updated_at
BEFORE UPDATE ON stock
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── 3. CARICHI MAGAZZINO ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS carichi_magazzino (
    id                         BIGSERIAL PRIMARY KEY,
    codice_materiale           TEXT NOT NULL REFERENCES materie_prime(unique_id) ON UPDATE CASCADE,
    quantita                   INTEGER NOT NULL,
    prezzo_totale              NUMERIC(12, 4) NOT NULL DEFAULT 0,
    prezzo_incl_transport      NUMERIC(12, 4),
    iva_percentuale            NUMERIC(5, 2) DEFAULT 0,
    prezzo_unitario            NUMERIC(12, 6),
    prezzo_unitario_transport  NUMERIC(12, 6),
    numero_ordine              TEXT,           -- invoice number
    fornitore                  TEXT,
    data_carico                TIMESTAMPTZ DEFAULT NOW(),
    created_at                 TIMESTAMPTZ DEFAULT NOW()
);

-- ── 4. SCARICHI MAGAZZINO ────────────────────────────────────
CREATE TABLE IF NOT EXISTS scarichi_magazzino (
    id                  BIGSERIAL PRIMARY KEY,
    codice_materiale    TEXT NOT NULL REFERENCES materie_prime(unique_id) ON UPDATE CASCADE,
    quantita            INTEGER NOT NULL,
    numero_ordine       TEXT,
    note                TEXT,
    data_scarico        TIMESTAMPTZ DEFAULT NOW(),
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ── 5. ROW LEVEL SECURITY ────────────────────────────────────
-- Il gestionale usa la anon key dal browser.
-- Abilitiamo RLS ma permettiamo tutto con la anon key
-- (per uso interno — se in futuro vuoi restringere, modifica qui)

ALTER TABLE materie_prime      ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock              ENABLE ROW LEVEL SECURITY;
ALTER TABLE carichi_magazzino  ENABLE ROW LEVEL SECURITY;
ALTER TABLE scarichi_magazzino ENABLE ROW LEVEL SECURITY;

-- Policy: accesso completo per anon (gestionale interno)
CREATE POLICY "anon_all" ON materie_prime      FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_all" ON stock              FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_all" ON carichi_magazzino  FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_all" ON scarichi_magazzino FOR ALL TO anon USING (true) WITH CHECK (true);

-- ── 6. INDICI per performance ────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_carichi_codice    ON carichi_magazzino(codice_materiale);
CREATE INDEX IF NOT EXISTS idx_carichi_data      ON carichi_magazzino(data_carico DESC);
CREATE INDEX IF NOT EXISTS idx_scarichi_codice   ON scarichi_magazzino(codice_materiale);
CREATE INDEX IF NOT EXISTS idx_scarichi_data     ON scarichi_magazzino(data_scarico DESC);
