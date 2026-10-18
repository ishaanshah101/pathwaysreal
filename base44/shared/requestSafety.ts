export class RequestError extends Error {
  constructor(message, status = 400) { super(message); this.status = status; }
}

export function requirePost(req) {
  if (req.method !== 'POST') throw new RequestError('Use POST for this action.', 405);
}

export async function readLimitedBody(req, limit = 131072) {
  const reader = req.body?.getReader();
  if (!reader) return new Uint8Array();
  const chunks = []; let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > limit) { await reader.cancel(); throw new RequestError('This request is too large.', 413); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  const bytes = new Uint8Array(size); let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  return bytes;
}

export async function readJsonObject(req) {
  const bytes = await readLimitedBody(req);
  let body;
  try { body = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes)); }
  catch { throw new RequestError('Send a valid request.'); }
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw new RequestError('Send a valid request.');
  return body;
}

export function safeFailure(name, error, message) {
  if (error instanceof RequestError) return Response.json({ error: error.message }, {
    status: error.status, ...(error.status === 405 ? { headers: { Allow: 'POST' } } : {}),
  });
  const status = error?.status ?? error?.response?.status;
  if (status === 401) return Response.json({ error: 'Please sign in again.' }, { status: 401 });
  console.error(`${name} failed`, error?.message || error);
  return Response.json({ error: message }, { status: 500 });
}