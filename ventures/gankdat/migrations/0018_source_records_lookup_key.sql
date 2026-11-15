-- Indexed lookup key (gankdat d1-lookup-key-index, burn-down 2026-11-15). A read of a D1
-- register by one company number or one organisation name walked every wide row of the
-- register (record, record_lc and search text, 1.5-3 KB a row) to evaluate a json_extract
-- predicate: 0.9-4.2 s a read, and D1's 10-second throttle refused the 4th read in a row
-- (relay round d1-burst-2026-11-15: 7 of 10 answered). A source may now name one string
-- field as its `lookupKey`; its JS-lowercased value is written here at ingest ('' when the
-- record has none) and a filter on that field is narrowed through the index below — a walk of
-- short index entries that carries seq, so only the matching rows are read whole. The filter
-- keeps its case-insensitive substring meaning. NULL = not keyed (a source without a key, or
-- a row written before this migration); the index leaves those rows out.
ALTER TABLE source_records ADD COLUMN lookup_key TEXT;
CREATE INDEX idx_source_records_lookup ON source_records (source_slug, generation, lookup_key, seq)
  WHERE lookup_key IS NOT NULL;
-- The field every live row of the source is keyed by; set once the in-place key backfill
-- (or a full reload) has covered the generation. Reads use the index only when it names the
-- source's current lookupKey, so a half-keyed register is never answered from the index.
ALTER TABLE source_meta ADD COLUMN lookup_keyed TEXT;
