-- Indexed lookup key (gankdat d1-lookup-key-index, burn-down 2026-11-15). A read of a D1
-- register by one company number or one organisation name walked every wide row of the
-- register (record, record_lc and search text, 1.5-3 KB a row) to evaluate a json_extract
-- predicate: 0.9-4.2 s a read, and D1's 10-second throttle refused the 4th read in a row
-- (relay round d1-burst-2026-11-15: 7 of 10 answered). A source may now name one string
-- field as its `lookupKey`; its JS-lowercased value is written here at ingest, one short row
-- per record that has one, and a filter on that field first walks these rows (a primary-key
-- range of this table) and reaches the matching records by seq. The filter keeps its
-- case-insensitive substring meaning, and the record's own predicate still runs, so a stale
-- row here (a key that changed, a record since removed) costs one extra row read and never
-- a wrong answer; a full reload starts a clean generation.
--
-- A table of its own, not a column on source_records: the first form of this migration
-- (ALTER TABLE source_records ADD COLUMN lookup_key + CREATE INDEX) failed in CI run 209 —
-- building an index walks all ~1.5M wide rows and D1 reset the statement at 60 s
-- ("storage operation exceeded timeout", code 7429). Nothing here reads source_records.
CREATE TABLE source_keys (
  source_slug TEXT NOT NULL,
  generation INTEGER NOT NULL,
  lookup_key TEXT NOT NULL,
  seq INTEGER NOT NULL,
  PRIMARY KEY (source_slug, generation, lookup_key, seq)
) WITHOUT ROWID;
-- The field every live row of the source is keyed by; set once the in-place key backfill
-- (or a full reload) has covered the generation. Reads use source_keys only when it names
-- the source's current lookupKey, so a half-keyed register is never answered from it.
ALTER TABLE source_meta ADD COLUMN lookup_keyed TEXT;
