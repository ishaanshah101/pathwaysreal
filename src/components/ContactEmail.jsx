import { useMemo } from 'react';

/**
 * The public contact address, assembled at render time instead of sitting in
 * the source as one literal string.
 *
 * Address-harvesting bots overwhelmingly work by regexing a served document for
 * `something@something.tld`. Keeping the local part and the domain apart until
 * the component renders means the complete address never appears as a
 * contiguous string in the bundle or in any served HTML, while a human still
 * sees it and can click it.
 *
 * This is obfuscation, not security: anyone running a real browser can read it.
 * That is the correct trade — the address has to be usable by students and
 * schools. It just should not be free to scrape.
 *
 * The address itself lives in src/lib/company.js. Do not duplicate it here.
 */
const LOCAL = ['pathways', 'admins'];
const DOMAIN = ['gmail', 'com'];

export default function ContactEmail({ className, style, bold = true }) {
  const address = useMemo(
    () => `${LOCAL.join('.')}@${DOMAIN.join('.')}`,
    []
  );

  return (
    <a
      href={`mailto:${address}`}
      className={className}
      style={{
        color: 'var(--color-accent-700)',
        fontWeight: bold ? 600 : 400,
        wordBreak: 'break-word',
        ...style,
      }}
    >
      {address}
    </a>
  );
}
