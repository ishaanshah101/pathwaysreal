// Sample community for Pathways.
//
// Everything in src/data/sample* is illustrative seed content shown to every
// signed-in member so the app is not empty before real people arrive. It is
// deliberately kept in one folder so it can be deleted in one go later.
//
// The people below are written to sound like different humans: different
// regions, routes into college, confidence levels, and writing habits. Some
// are blunt, some ramble, some are formal. That variety is the point.

export const AUTHORS = {
  sofia: {
    name: 'Sofia Reyes', role: 'college_student', school: 'Carnegie Mellon',
    headline: 'CMU first-year, Information Systems',
    bio: 'First-gen. Applied to 14 schools on fee waivers. Happy to read a draft essay and tell you the truth about it.',
    interests: ['Essays', 'Applications', 'Campus life'], tone: 'warm',
  },
  marcus: {
    name: 'Marcus Webb', role: 'counselor', school: 'Oakwood High School',
    headline: 'School counselor, 12 years',
    bio: 'I have helped about 1,400 students through applications. Ask me about financial aid, I will not sugarcoat it.',
    interests: ['Scholarships', 'Applications'], tone: 'direct',
  },
  alice: {
    name: 'Dr. Alice Nkemdi', role: 'educator', school: 'State University',
    headline: 'Professor of Biology, advising 19 years',
    bio: 'If you are agonizing over declaring a major, talk to me before you decide anything.',
    interests: ['Choosing a major', 'Careers'], tone: 'measured',
  },
  priya: {
    name: 'Priya Raman', role: 'college_student', school: 'UC Berkeley',
    headline: 'UC Berkeley, Molecular Biology',
    bio: 'Cold-emailed my way into a lab at seventeen. I will show you the exact email template.',
    interests: ['Internships', 'Test prep'], tone: 'practical',
  },
  james: {
    name: 'James Okafor', role: 'college_student', school: 'Stanford',
    headline: 'Stanford, Mechanical Engineering, community college transfer',
    bio: 'Community college transfer. If you think transferring closes doors, it does not. Ask me.',
    interests: ['Applications', 'Careers', 'Internships'], tone: 'encouraging',
  },
  hana: {
    name: 'Hana Kim', role: 'counselor', school: 'Independent',
    headline: 'Former admissions reader, four seasons',
    bio: 'I read applications for four years. I can tell you what actually gets flagged and what nobody notices.',
    interests: ['Essays', 'Applications'], tone: 'insider',
  },
  darius: {
    name: 'Darius Bell', role: 'college_student', school: 'Morehouse College',
    headline: 'Morehouse, Economics, Posse Scholar',
    bio: 'Posse Scholar. Ask me about HBCUs, full-ride programs, and interviews that are actually group interviews.',
    interests: ['Scholarships', 'Applications'], tone: 'confident',
  },
  mei: {
    name: 'Mei Lin Chow', role: 'college_student', school: 'University of Michigan',
    headline: 'Michigan, Computer Science, international student from Malaysia',
    bio: 'International applicant. Visas, CSS Profile, and the parts of US applications nobody explains to us.',
    interests: ['Applications', 'Careers'], tone: 'thorough',
  },
  rosa: {
    name: 'Rosa Delgado', role: 'counselor', school: 'Valley View High School',
    headline: 'College and career counselor, Title I school',
    bio: 'I work at a school with one counselor for 480 students. Everything I share is built for students without a safety net.',
    interests: ['Scholarships', 'Applications'], tone: 'no-nonsense',
  },
  tobi: {
    name: 'Tobi Adeyemi', role: 'college_student', school: 'Georgia Tech',
    headline: 'Georgia Tech, Industrial Engineering, co-op program',
    bio: 'On my third co-op rotation. If you want to graduate with real work experience, ask me how co-op differs from internships.',
    interests: ['Internships', 'Careers'], tone: 'practical',
  },
  eleanor: {
    name: 'Eleanor Voss', role: 'educator', school: 'Northwestern',
    headline: 'Professor of English, teaches first-year writing',
    bio: 'I read 120 freshman essays a term. The gap between a good high school writer and a good college writer is smaller than you think.',
    interests: ['Essays', 'Choosing a major'], tone: 'literary',
  },
  andre: {
    name: 'Andre Fontaine', role: 'college_student', school: 'Rice University',
    headline: 'Rice, Music and Cognitive Science double major',
    bio: 'Auditioned at nine conservatories, ended up at a research university instead. Ask me about arts supplements.',
    interests: ['Applications', 'Choosing a major'], tone: 'reflective',
  },
  nadia: {
    name: 'Nadia Haddad', role: 'college_student', school: 'NYU',
    headline: 'NYU Stern, Finance, first-gen',
    bio: 'Nobody in my family had done this before. I made every mistake so you can skip a few.',
    interests: ['Applications', 'Careers'], tone: 'candid',
  },
  ben: {
    name: 'Ben Krause', role: 'student', school: 'Lincoln High School',
    headline: '12th grade, applying to state schools',
    bio: 'Senior right now, in the middle of it. I post what is actually happening, not what happened five years ago.',
    interests: ['Applications', 'Test prep'], tone: 'peer',
  },
  yuki: {
    name: 'Yuki Tanaka', role: 'college_student', school: 'Oberlin College',
    headline: 'Oberlin, Environmental Studies',
    bio: 'Small liberal arts college convert. I thought I wanted a big school. I was wrong and I can explain why.',
    interests: ['Campus life', 'Choosing a major'], tone: 'thoughtful',
  },
  gerald: {
    name: 'Gerald Whitfield', role: 'counselor', school: 'Regional college access nonprofit',
    headline: 'Financial aid specialist, 20 years',
    bio: 'FAFSA, CSS Profile, appeals, and verification. If a number on your aid letter confuses you, send it to me.',
    interests: ['Scholarships'], tone: 'technical',
  },
  amara: {
    name: 'Amara Osei', role: 'college_student', school: 'Howard University',
    headline: 'Howard, Political Science, pre-law',
    bio: 'Debate kid turned pre-law. Ask me about building an activity list that actually holds together.',
    interests: ['Applications', 'Careers'], tone: 'sharp',
  },
  luis: {
    name: 'Luis Moreno', role: 'college_student', school: 'Arizona State',
    headline: 'ASU, Nursing, works 25 hours a week',
    bio: 'I work nights and take a full load. If you are worried about balancing a job with school, I have opinions.',
    interests: ['Campus life', 'Careers'], tone: 'grounded',
  },
  sarah: {
    name: 'Sarah Whitmore', role: 'educator', school: 'Regional public university',
    headline: 'Director of Undergraduate Admissions',
    bio: 'I run an admissions office. Most of what students believe about us is wrong in a very specific way.',
    interests: ['Applications', 'Essays'], tone: 'authoritative',
  },
  kwame: {
    name: 'Kwame Boateng', role: 'college_student', school: 'MIT',
    headline: 'MIT, Physics, QuestBridge Match',
    bio: 'QuestBridge Match. Low income, rural school, no AP classes. It is possible and I will tell you exactly how.',
    interests: ['Scholarships', 'Applications'], tone: 'methodical',
  },
  chloe: {
    name: 'Chloe Bernard', role: 'student', school: 'Riverside High School',
    headline: '11th grade, first in my family to apply',
    bio: 'Junior year. Currently overwhelmed but taking notes. Posting my process as I go.',
    interests: ['Test prep', 'Applications'], tone: 'peer',
  },
  omar: {
    name: 'Omar Siddiqui', role: 'college_student', school: 'University of Texas at Austin',
    headline: 'UT Austin, Computer Science, top 6% auto-admit',
    bio: 'Got in through class rank, not essays. If your state has an auto-admit rule, it changes your whole strategy.',
    interests: ['Applications', 'Internships'], tone: 'analytical',
  },
  fatima: {
    name: 'Fatima Al-Rashid', role: 'educator', school: 'Community college',
    headline: 'Chemistry instructor and transfer advisor',
    bio: 'Community college is not a backup plan. I advise students who transfer into schools that rejected them at 17.',
    interests: ['Choosing a major', 'Careers'], tone: 'passionate',
  },
  theo: {
    name: 'Theo Lindqvist', role: 'college_student', school: 'University of Washington',
    headline: 'UW, Informatics, recruited swimmer',
    bio: 'Recruited athlete. The recruiting timeline is completely different from the normal one and nobody warns you.',
    interests: ['Applications', 'Campus life'], tone: 'brisk',
  },
  imani: {
    name: 'Imani Clarke', role: 'college_student', school: 'Spelman College',
    headline: 'Spelman, Psychology, undecided until sophomore year',
    bio: 'Changed my major twice and it cost me nothing. Ask me about arriving undecided.',
    interests: ['Choosing a major', 'Campus life'], tone: 'reassuring',
  },
  victor: {
    name: 'Victor Ramos', role: 'counselor', school: 'Independent',
    headline: 'Career counselor, former hiring manager',
    bio: 'I hired for a mid-size firm for nine years before this. I can tell you what a resume actually gets in six seconds.',
    interests: ['Careers', 'Internships'], tone: 'blunt',
  },
};

export const AUTHOR_KEYS = Object.keys(AUTHORS);

// Deterministic pastel from the brand palette so a person always looks the same.
const AVATAR_COLORS = [
  ['var(--color-accent-200)', 'var(--color-accent-800)'],
  ['var(--color-accent-2-200)', 'var(--color-accent-2-800)'],
  ['var(--color-neutral-300)', 'var(--color-neutral-800)'],
  ['var(--color-accent-300)', 'var(--color-accent-900)'],
  ['var(--color-accent-2-300)', 'var(--color-accent-2-900)'],
];

export function authorAvatar(key) {
  let hash = 0;
  for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

export function initialsOf(name) {
  return String(name || '?')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

// Sample people get a stable pseudo-email so links and threads behave, but they
// are flagged so the UI never offers a dead-end "message" action.
export function sampleEmail(key) {
  return `${key}@sample.pathways`;
}

export const SAMPLE_MENTORS = AUTHOR_KEYS.map((key) => ({
  ...AUTHORS[key],
  key,
  user_email: sampleEmail(key),
  full_name: AUTHORS[key].name,
  is_sample_profile: true,
}));
