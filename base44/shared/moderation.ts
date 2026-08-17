// Safety filtering for anything a user types at another user.
//
// This exists because the marketing site already promises that "sharing contact
// info or arranging meetups is blocked automatically". Both send-message and
// create-post run through here so the promise is true on every surface.

const NUMBER_WORDS = 'zero|one|two|three|four|five|six|seven|eight|nine|oh';

// Domains a student legitimately needs to share. Everything else is treated as
// an off-platform handoff.
const ALLOWED_LINK = /(^|\.)((.+\.)?edu|gov|collegeboard\.org|commonapp\.org|fafsa\.gov|khanacademy\.org|bigfuture\.org|questbridge\.org|coalitionforcollegeaccess\.org|scholarships\.com|fastweb\.com|niche\.com|pathways\.uno)$/i;

const RULES = [
  {
    rule: 'email_address',
    // Catches plain addresses and the usual "name (at) gmail (dot) com" dodge.
    re: /[a-z0-9._%+-]+\s*(?:@|\(\s*at\s*\)|\[\s*at\s*\]|\bat\b)\s*[a-z0-9.-]{2,}\s*(?:\.|\(\s*dot\s*\)|\[\s*dot\s*\]|\bdot\b)\s*[a-z]{2,}/i,
  },
  {
    rule: 'phone_number',
    // 7+ digits with any spacing/punctuation, or a run of spelled-out digits.
    // The repeat is {6,} plus one trailing digit, so a plain 7-digit local
    // number is caught: eight digits was never the floor for reaching someone.
    re: new RegExp(
      '(?:\\+?\\d[\\s().-]{0,3}){6,}\\d'
      + '|(?:\\b(?:' + NUMBER_WORDS + ')\\b[\\s,.-]*){7,}',
      'i',
    ),
  },
  {
    rule: 'social_handoff',
    // "ig" belongs in the platform list as much as "insta" does; it is written
    // with \b so it only fires as a whole word and "dig:" or "big:" cannot
    // trip it. "snap" on its own is already covered by snap(?:chat)?.
    re: /\b(?:add me on|dm me on|my (?:snap|insta|ig|discord|telegram|handle|username)\b|(?:snap(?:chat)?|insta(?:gram)?|ig\b|discord|telegram|whatsapp|signal|kik|tiktok)\s*(?:is|:|@|handle|username|me)|(?:find|follow|message|text) me on (?:snap(?:chat)?|insta(?:gram)?|ig|discord|telegram|whatsapp|signal|kik|tiktok))/i,
  },
  {
    rule: 'social_handle',
    // A bare @handle. Emails are caught above, so this is a username.
    re: /(^|\s)@[a-z0-9._]{3,}/i,
  },
  {
    rule: 'off_platform',
    // Everything here has to be an unambiguous move off Pathways or an offer to
    // meet in person. A counselor and a student talk about deadlines and campus
    // visits all day, so anything that could plausibly be ordinary advice stays
    // out of this list.
    re: /\b(?:text me|call me|facetime|hit me up|let'?s meet|meet up|meet in person|come over|come (?:see|visit) me|my address|where do you live|what'?s your address|what'?s your (?:phone|cell)\b|pick you up|see you in person|(?:let'?s|lets|wanna|want to|we should|we could) (?:grab|get|have) (?:a |some )?(?:coffee|lunch|dinner|drinks?)|(?:let'?s|lets|wanna|want to|we should|we could) hang ?out|hang ?out (?:sometime|in person|irl))\b/i,
  },
  {
    rule: 'photo_request',
    re: /\b(?:send (?:me )?(?:a |your )?(?:pic|pics|picture|photo|photos|selfie|video)|what do you look like|show me (?:a )?(?:pic|picture|photo|yourself)|turn on your camera)\b/i,
  },
  {
    rule: 'secrecy',
    re: /\b(?:don'?t tell (?:your |anyone|you?r )?(?:parents|mom|dad|teacher|counselor|anyone)|keep this between us|our little secret|our secret|delete this (?:chat|message)|don'?t screenshot)\b/i,
  },
  {
    rule: 'sexual_content',
    re: /\b(?:sexy|sexual|nudes?|naked|horny|hook ?up|hot body|turn me on|send nudes|dick|boobs|penis|vagina|porn|onlyfans)\b/i,
  },
];

// Rules that are serious enough that we block even if the AI classifier is down.
const FAIL_CLOSED_RULES = new Set(['sexual_content', 'secrecy', 'photo_request']);

const BLOCK_REASON =
  "Pathways keeps conversations on-platform, so contact details and meetup plans can't be sent here.";

function findLinks(text: string) {
  const matches = text.match(/\b(?:https?:\/\/)?(?:[a-z0-9-]+\.)+[a-z]{2,}(?:\/\S*)?/gi) || [];
  return matches.filter((raw) => {
    const host = raw.replace(/^https?:\/\//i, '').split('/')[0].toLowerCase();
    // Skip things that are really email fragments; the email rule owns those.
    if (host.includes('@')) return false;
    return !ALLOWED_LINK.test(host);
  });
}

export function excerptOf(text: string) {
  return String(text || '').slice(0, 280);
}

// Full-width digits and letters read exactly like ASCII ones to a student, so
// "５５５１２３４５６７" has to be treated as the phone number it is. NFKC folds
// those and the other compatibility forms down to ASCII before any rule runs,
// which is why it happens here rather than inside one rule: a normalisation
// that only covered the phone check would just move the hole somewhere else.
function normalizeForMatching(text: string): string {
  const value = String(text || '');
  try {
    return value.normalize('NFKC');
  } catch {
    return value;
  }
}

// Deterministic checks. Fast, free, and the same on every surface.
export function screenContent(text: string) {
  const value = normalizeForMatching(text);
  for (const { rule, re } of RULES) {
    if (re.test(value)) {
      return { blocked: true, rule, severity: FAIL_CLOSED_RULES.has(rule) ? 'high' : 'low', reason: BLOCK_REASON };
    }
  }
  if (findLinks(value).length > 0) {
    return { blocked: true, rule: 'external_link', severity: 'low', reason: BLOCK_REASON };
  }
  return { blocked: false, rule: null, severity: null, reason: null };
}

// Catches what patterns cannot: grooming build-up, coercion, sexualized framing
// with clean vocabulary. Only a "high" verdict blocks.
export async function classifyRisk(base44: any, text: string) {
  const prompt = [
    'You are a child-safety classifier for a mentoring platform where high school students,',
    'some as young as 13, message adult mentors. Classify the following message.',
    'Return high risk ONLY for: grooming or trust-building toward private contact,',
    'requests for secrecy from parents or school, sexual or romantic content directed at a user,',
    'or pressure to move the conversation off the platform.',
    'Ordinary college and career advice is always "none".',
    '',
    'MESSAGE: ' + String(text || '').slice(0, 2000),
  ].join('\n');

  try {
    const res = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          risk: { type: 'string', enum: ['none', 'low', 'high'] },
          category: { type: 'string' },
          reason: { type: 'string' },
        },
        required: ['risk'],
      },
    });
    const risk = res?.risk || 'none';
    return { ok: true, risk, category: res?.category || '', reason: res?.reason || '' };
  } catch (err: any) {
    // Fail closed only where the stakes are highest, open otherwise, so an
    // outage never silently switches safety off and never bricks messaging.
    return { ok: false, risk: 'unknown', category: '', reason: err?.message || 'classifier unavailable' };
  }
}

export async function logModerationEvent(base44: any, row: any) {
  try {
    await base44.asServiceRole.entities.ModerationEvent.create({
      occurred_at: new Date().toISOString(),
      ...row,
    });
  } catch {
    // Never let audit logging stop the block itself from taking effect.
  }
}

export const MODERATION_BLOCK_REASON = BLOCK_REASON;