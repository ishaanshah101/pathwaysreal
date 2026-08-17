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
 * The split below is the one deliberate duplication of COMPANY_EMAIL in
 * src/lib/company.js. Importing that constant would put the joined literal back
 * into the bundle and defeat the point. If the address ever changes, both
 * places have to change together.
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
