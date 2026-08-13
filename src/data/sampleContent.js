// Single entry point for all sample content. Import from here, not from the
// individual files, so removing seed content later is a one-line change in the
// three tabs that use it.

import { AUTHORS, authorAvatar, initialsOf, sampleEmail } from '@/data/sampleAuthors';
import { AUTHORS_EXTRA } from '@/data/sampleAuthorsExtra';
import { SAMPLE_POSTS } from '@/data/samplePosts';
import { SAMPLE_POSTS_EXTRA } from '@/data/samplePostsExtra';
import { SAMPLE_THREADS } from '@/data/sampleThreads';

export const ALL_AUTHORS = { ...AUTHORS, ...AUTHORS_EXTRA };

export { authorAvatar, initialsOf, sampleEmail };

const DAY = 24 * 60 * 60 * 1000;

// One shared "now" per page load so ordering stays stable while the user reads.
const NOW = Date.now();

function toPost(raw, index) {
  const author = ALL_AUTHORS[raw.a] || {};
  return {
    id: `sample-${raw.a}-${raw.c}-${index}`,
    is_sample: true,
    author_key: raw.a,
    author_email: sampleEmail(raw.a),
    author_name: author.name,
    author_role: author.role,
    author_headline: author.headline,
    title: raw.title,
    body: raw.body,
    category: raw.c,
    tags: raw.tags || [],
    variant: raw.v || 'plain',
    stats: raw.stats,
    items: raw.items,
    quote: raw.quote,
    created_date: new Date(NOW - (raw.d ?? index) * DAY).toISOString(),
  };
}

export const SAMPLE_FEED = [...SAMPLE_POSTS, ...SAMPLE_POSTS_EXTRA]
  .map(toPost)
  .sort((x, y) => new Date(y.created_date) - new Date(x.created_date));

export const SAMPLE_MENTORS = Object.keys(ALL_AUTHORS).map((key) => {
  const a = ALL_AUTHORS[key];
  return {
    key,
    user_email: sampleEmail(key),
    full_name: a.name,
    role: a.role,
    school: a.school,
    headline: a.headline,
    bio: a.bio,
    interests: a.interests || [],
    onboarded: true,
    is_sample_profile: true,
    // How many sample posts this person has, shown on their Explore card.
    post_count: SAMPLE_FEED.filter((p) => p.author_key === key).length,
  };
});

export const SAMPLE_MESSAGE_THREADS = SAMPLE_THREADS.map((t) => {
  const a = ALL_AUTHORS[t.key] || {};
  return {
    ...t,
    id: `sample-thread-${t.key}`,
    is_sample: true,
    other: sampleEmail(t.key),
    name: a.name,
    headline: a.headline,
    last: t.messages[t.messages.length - 1],
  };
});

// Shown on the Sage paywall so people can see the quality before paying.
export const SAMPLE_SAGE_EXCHANGES = [
  {
    q: 'How do I build a college list that actually fits me?',
    a: "Start with money, not names, because that constraint is the one that cannot be argued with later.\n\nRun the Net Price Calculator on four schools tonight: your state flagship, a regional public, a private that meets full need, and a private that does not. You will see the range your family is actually working inside, and it is usually not what people assume.\n\nThen build in thirds. Three schools where your grades sit comfortably above the middle 50 percent and the price already works. Four where you are inside the range. Three reaches. The bottom third is the one people under-build, and it is the one that decides whether April is calm.",
  },
  {
    q: 'What should I be doing this summer as a rising senior?',
    a: "Three things, in this order.\n\nDraft the personal statement badly in June. Not a good draft. Any draft. Everything in the fall gets easier once something exists to cut.\n\nSecond, do one thing with a beginning and an end. A job, a project, a class, forty hours of volunteering that is actually forty hours. Depth beats variety and finishing beats starting.\n\nThird, ask two teachers before the year ends, while they still remember your work. Give them a one-page summary of what you did in their class. September recommenders are already booked.",
  },
  {
    q: 'Is it bad that I still do not know what I want to major in?',
    a: "No, and the data is genuinely on your side here. Roughly a third of students formally change majors at least once, and that undercounts everyone who quietly stays in the wrong one.\n\nThe thing to watch is not indecision, it is prerequisite chains. Engineering, nursing, and the physical sciences have long sequences where starting late costs you a year. Most humanities and social science majors have almost no chain and can be picked up sophomore year for free.\n\nSo the real question is narrower than it feels: are you flirting with anything that has a ladder? If no, you have more time than your classmates are implying.",
  },
  {
    q: 'My SAT is below the median at half my schools. Do I submit it?',
    a: "Look at the middle 50 percent range published for each school specifically, not a general rule.\n\nAt or above the 50th percentile, submit. Below the 25th, do not. Between the two, it depends on what else is in your file: a strong upward grade trend or a rigorous schedule can make a mid-range score worth including, while a flat record probably cannot.\n\nOne caution: test optional and test blind are different. A small number of schools genuinely will not look. Most will read the score if you send it, so send it only where it helps.",
  },
];
