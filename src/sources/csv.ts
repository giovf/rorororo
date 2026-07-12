/**
 * Streaming RFC-4180 CSV rows from a response body: handles quoted fields,
 * escaped quotes, and embedded commas/newlines without buffering the file.
 * Shared by CSV-based sources (uk-sanctions UKSL, sam-exclusions extract).
 */
export async function* csvRows(body: ReadableStream<Uint8Array>): AsyncGenerator<string[]> {
  const decoder = new TextDecoder();
  const reader = body.getReader();
  let field = '';
  let row: string[] = [];
  let inQuotes = false;
  let pendingQuote = false;

  const endField = (): void => {
    row.push(field);
    field = '';
  };

  for (;;) {
    const { done, value } = await reader.read();
    const chunk = done ? decoder.decode() : decoder.decode(value, { stream: true });
    for (const c of chunk) {
      if (inQuotes) {
        if (pendingQuote) {
          pendingQuote = false;
          if (c === '"') {
            field += '"';
            continue;
          }
          inQuotes = false; // the quote closed the field; c is a delimiter
        } else if (c === '"') {
          pendingQuote = true;
          continue;
        } else {
          field += c;
          continue;
        }
      }
      if (c === '"' && field === '') {
        inQuotes = true;
      } else if (c === ',') {
        endField();
      } else if (c === '\n') {
        endField();
        yield row;
        row = [];
      } else if (c !== '\r') {
        field += c;
      }
    }
    if (done) break;
  }
  if (field !== '' || row.length > 0) {
    endField();
    yield row;
  }
}
