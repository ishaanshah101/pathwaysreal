import { RequestError } from './requestSafety.ts';

// Inspect actual bytes before accepting names or browser-declared media types.
// This is file identification, not a malware scanner for document contents.
export async function inspectUpload(file, name) {
  const bytes = new Uint8Array(await file.slice(0, 4096).arrayBuffer());
  const starts = (...values) => values.every((value, i) => bytes[i] === value);
  const text = new TextDecoder().decode(bytes, { stream: true });
  const ext = name.toLowerCase().split('.').pop();
  const declared = String(file.type || '').toLowerCase().split(';')[0];
  const executable = starts(0x4d, 0x5a) || starts(0x7f, 0x45, 0x4c, 0x46)
    || starts(0xca, 0xfe, 0xba, 0xbe) || starts(0xcf, 0xfa, 0xed, 0xfe)
    || starts(0xfe, 0xed, 0xfa, 0xcf) || starts(0xce, 0xfa, 0xed, 0xfe)
    || starts(0xfe, 0xed, 0xfa, 0xce) || starts(0, 0x61, 0x73, 0x6d);
  if (executable) throw new RequestError('Executable files cannot be shared on Pathways.');
  let mime = '';
  if (starts(137, 80, 78, 71, 13, 10, 26, 10)) mime = 'image/png';
  else if (starts(255, 216, 255)) mime = 'image/jpeg';
  else if (/^GIF8[79]a/.test(text)) mime = 'image/gif';
  else if (text.startsWith('RIFF') && text.slice(8, 12) === 'WEBP') mime = 'image/webp';
  else if (text.slice(4, 8) === 'ftyp' && /^(heic|heix|hevc|hevx|mif1|msf1)$/.test(text.slice(8, 12))) mime = 'image/heic';
  else if (text.startsWith('%PDF-')) mime = 'application/pdf';
  const expected = { png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', gif: 'image/gif', webp: 'image/webp', heic: 'image/heic', heif: 'image/heic', pdf: 'application/pdf' };
  if ((expected[ext] && expected[ext] !== mime) || ((declared.startsWith('image/') || declared === 'application/pdf') && !mime)) {
    throw new RequestError('The file contents do not match its type. Choose the original file.');
  }
  if (mime) return mime;
  const textExtensions = ['txt', 'md', 'csv', 'json', 'xml', 'yaml', 'yml', 'js', 'jsx', 'ts', 'tsx', 'py', 'java', 'c', 'cpp', 'h', 'css', 'html', 'sql', 'sh', 'bash', 'zsh', 'ps1', 'rs', 'go', 'rb', 'swift'];
  if (declared.startsWith('text/') || textExtensions.includes(ext)) {
    if (bytes.includes(0) || text.includes('\ufffd')) throw new RequestError('This file does not contain readable text. Choose the original file.');
    return declared.startsWith('text/') ? declared : 'text/plain';
  }
  return declared || 'application/octet-stream';
}