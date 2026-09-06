// Attachment safety. Every file that reaches a Post or a Message goes through
// here first.
//
// The honest limits of this module, stated up front because they matter:
//
//   - Images ARE inspected. Each one is described by a vision model and refused
//     if it looks sexual, violent, or like it contains a minor in an unsafe
//     context. That is a real check, not a token one, but it is a model and
//     models miss things.
//   - Everything else is NOT inspected. A PDF, a docx, a zip: nothing here can
//     see inside them. They are size-capped, type-checked, and labelled
//     `scanned: false` so the UI can tell the recipient that nobody looked.
//   - Executables are refused outright. No legitimate use on this platform is
//     worth being a malware channel for.

export const MAX_FILES = 10;
export const MAX_FILE_BYTES = 25 * 1024 * 1024;      // 25 MB per file
export const MAX_TOTAL_BYTES = 100 * 1024 * 1024;    // 100 MB per post or message

// Refused outright. Extension and mime are both checked, because either one
// alone is trivially spoofed.
const BLOCKED_EXTENSIONS = [
  'exe', 'msi', 'bat', 'cmd', 'com', 'scr', 'pif', 'cpl', 'hta',
  'sh', 'bash', 'zsh', 'ps1', 'vbs', 'vbe', 'js', 'jse', 'wsf', 'wsh',
  'apk', 'ipa', 'dmg', 'pkg', 'deb', 'rpm', 'appimage',
  'jar', 'app', 'gadget', 'reg', 'dll', 'so', 'bin', 'run',
];

const BLOCKED_MIMES = [
  'application/x-msdownload', 'application/x-executable', 'application/x-dosexec',
  'application/vnd.microsoft.portable-executable', 'application/x-sh',
  'application/x-shellscript', 'application/vnd.android.package-archive',
  'application/x-apple-diskimage', 'application/java-archive',
];

const IMAGE_MIMES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/heic', 'image/heif', 'image/gif'];
const ARCHIVE_EXT = ['zip', 'rar', '7z', 'tar', 'gz', 'bz2'];
const DOC_EXT = ['doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'txt', 'rtf', 'md', 'csv', 'pages', 'key', 'numbers'];

function extOf(name: string) {
  const parts = String(name || '').toLowerCase().split('.');
  return parts.length > 1 ? parts[parts.length - 1] : '';
}

export function kindOf(name: string, mime: string) {
  const e = extOf(name);
  const m = String(mime || '').toLowerCase();
  if (IMAGE_MIMES.includes(m) || ['png', 'jpg', 'jpeg', 'webp', 'heic', 'heif', 'gif'].includes(e)) return 'image';
  if (m === 'application/pdf' || e === 'pdf') return 'pdf';
  if (ARCHIVE_EXT.includes(e)) return 'archive';
  if (DOC_EXT.includes(e)) return 'document';
  return 'other';
}

export function isBlockedType(name: string, mime: string) {
  const e = extOf(name);
  const m = String(mime || '').toLowerCase();
  if (BLOCKED_EXTENSIONS.includes(e)) return true;
  if (BLOCKED_MIMES.includes(m)) return true;
  // A double extension like "essay.pdf.exe" is the oldest trick there is.
  const parts = String(name || '').toLowerCase().split('.');
  if (parts.length > 2 && BLOCKED_EXTENSIONS.includes(parts[parts.length - 1])) return true;
  return false;
}

export type IncomingAttachment = {
  url?: string; name?: string; mime?: string; size?: number;
};

export type ValidationResult =
  | { ok: true; files: any[] }
  | { ok: false; error: string; code: string };

// Shape and type checks. Cheap, runs before anything expensive.
export function validateAttachments(raw: unknown): ValidationResult {
  if (!raw) return { ok: true, files: [] };
  if (!Array.isArray(raw)) return { ok: false, error: 'Attachments were not in the expected format.', code: 'bad_attachments' };
  if (raw.length === 0) return { ok: true, files: [] };

  if (raw.length > MAX_FILES) {
    return { ok: false, error: `You can attach up to ${MAX_FILES} files at a time.`, code: 'too_many_files' };
  }

  let total = 0;
  const files: any[] = [];

  for (const a of raw as IncomingAttachment[]) {
    const url = String(a?.url || '').trim();
    const name = String(a?.name || 'file').trim().slice(0, 200);
    const mime = String(a?.mime || '').trim().slice(0, 120);
    const size = Number(a?.size || 0);

    if (!url || !/^https?:\/\//i.test(url)) {
      return { ok: false, error: 'One of those files did not upload properly. Try again.', code: 'bad_url' };
    }
    if (isBlockedType(name, mime)) {
      return {
        ok: false,
        error: `"${name}" is a program, not a document, so it can't be shared on Pathways.`,
        code: 'blocked_type',
      };
    }
    if (size > MAX_FILE_BYTES) {
      return { ok: false, error: `"${name}" is over 25 MB. Try compressing it.`, code: 'file_too_big' };
    }
    total += size;

    files.push({ url, name, mime, size, kind: kindOf(name, mime), scanned: false });
  }

  if (total > MAX_TOTAL_BYTES) {
    return { ok: false, error: 'Those files come to more than 100 MB together. Send fewer at a time.', code: 'total_too_big' };
  }

  return { ok: true, files };
}

export type ImageVerdict = {
  safe: boolean;
  category?: string;
  reason?: string;
  severity?: 'low' | 'high';
};

// Vision check on a single image. Fails CLOSED: if the model errors or returns
// something unparseable, the image does not publish. An unchecked image on a
// platform full of minors is not a risk worth taking for convenience.
export async function screenImage(base44: any, url: string): Promise<ImageVerdict> {
  const prompt = `You are a content safety reviewer for Pathways, a platform where high school students, most of them minors, get college and career guidance from students, educators, and counselors.

Look at this image and decide whether it is safe to publish there.

Refuse the image if it contains any of the following:
- Nudity, partial nudity, underwear, swimwear, or any sexualised depiction of a person
- Any sexual content whatsoever, including suggestive posing
- A minor in any state of undress, or any image of a minor that appears sexualised
- Graphic violence, gore, self-harm, or weapons presented threateningly
- Illegal drugs or drug paraphernalia
- Hate symbols or harassing imagery
- Someone's personal documents showing a home address, government ID, or financial account numbers

Allow ordinary things students share: screenshots of essays and applications, whiteboards, notes, textbooks, campus photos, charts, graphs, spreadsheets, everyday photographs of people who are clothed and not sexualised.

Respond with JSON only.`;

  try {
    const res = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      file_urls: [url],
      response_json_schema: {
        type: 'object',
        properties: {
          safe: { type: 'boolean' },
          category: { type: 'string' },
          reason: { type: 'string' },
          severity: { type: 'string', enum: ['low', 'high'] },
        },
        required: ['safe'],
      },
    });

    if (!res || typeof res.safe !== 'boolean') {
      return { safe: false, category: 'unreadable', reason: 'Safety check did not return a verdict', severity: 'low' };
    }
    return {
      safe: res.safe,
      category: res.category,
      reason: res.reason,
      severity: res.severity === 'high' ? 'high' : 'low',
    };
  } catch (err) {
    return { safe: false, category: 'check_failed', reason: String((err as Error)?.message || err), severity: 'low' };
  }
}

// Screens every image in a set. Non-images pass through untouched and stay
// marked scanned:false, which the UI surfaces to whoever is about to open one.
export async function screenAttachments(base44: any, files: any[]) {
  const out: any[] = [];
  for (const f of files) {
    if (f.kind !== 'image') { out.push(f); continue; }
    const verdict = await screenImage(base44, f.url);
    if (!verdict.safe) {
      return {
        ok: false as const,
        file: f,
        verdict,
      };
    }
    out.push({ ...f, scanned: true });
  }
  return { ok: true as const, files: out };
}

export const IMAGE_BLOCK_REASON =
  'One of those images was held back by our safety check. If you think that was a mistake, email pathways.admins@gmail.com.';