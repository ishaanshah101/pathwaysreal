// Sample feed posts. See sampleAuthors.js for the note on deleting this later.
//
// Fields:
//   a       author key from AUTHORS
//   title   post headline
//   body    the post itself
//   c       category (matches the Post entity enum)
//   tags    optional chips
//   v       layout variant: plain | cover | stats | checklist | quote
//   stats   [{ n, label }] for the stats variant
//   items   [string] for the checklist variant
//   quote   pull quote string for the quote variant
//   d       days ago, used to build a believable timeline
//
// Voices are intentionally uneven. Counselors write in paragraphs, current
// high schoolers write short and hedge a lot, professors qualify everything,
// and a few people are just blunt. If every post reads the same, something has
// gone wrong.

export const SAMPLE_POSTS = [
  // ─────────────────────────────── applications ───────────────────────────────
  {
    a: 'hana', c: 'applications', v: 'stats', d: 1,
    title: 'What four years of reading applications actually taught me',
    body: "I want to be careful here because people love turning admissions into a conspiracy. It is not one. It is tired people reading fast.\n\nA first read took me somewhere between eight and fifteen minutes. In that window I am building a one-sentence summary of you in my head, and that sentence is what I carry into committee. If your application does not hand me that sentence, I will invent a worse one.\n\nSo the question is not \"am I impressive enough.\" It is \"what is the sentence.\" Write yours down. If it is longer than a sentence, you have not narrowed enough yet.",
    stats: [{ n: '8–15', label: 'minutes on a first read' }, { n: '1', label: 'sentence they remember you by' }],
    tags: ['admissions', 'strategy'],
  },
  {
    a: 'sarah', c: 'applications', v: 'plain', d: 2,
    title: 'We are not trying to reject you',
    body: "I run an admissions office and the most common thing I hear from students is some version of \"you are looking for a reason to say no.\" We are not. We have targets to hit and we would rather hit them with people who want to be here.\n\nWhat that means practically: demonstrated interest is real at schools like mine. Open the emails. Come to the virtual session. Ask a question that is not answerable from the website. It will not save a weak application, but between two similar files, it has decided things.",
    tags: ['demonstrated interest'],
  },
  {
    a: 'omar', c: 'applications', v: 'plain', d: 3,
    title: 'If your state has auto-admit, your strategy is completely different',
    body: "Texas top 6 percent, California ELC, Florida Bright Futures adjacent rules. If you are in a state like this, class rank is doing more work than anything else in your application, and you should know that early rather than in November of senior year.\n\nI spent junior year polishing essays that did not matter for my in-state schools. What mattered was one more semester of grade discipline. Look up your state's rule tonight. It takes four minutes and it may reorganize your entire year.",
    tags: ['auto admit', 'state schools'],
  },
  {
    a: 'ben', c: 'applications', v: 'plain', d: 1,
    title: 'currently doing this, here is what surprised me',
    body: "im a senior, submitting in like 3 weeks. things nobody told me:\n\nthe common app activity descriptions are 150 characters. not words. characters. i had to rewrite all ten.\n\nrecommenders need way more lead time than you think. i asked in september and my teacher said she already had 22 requests.\n\nalso the fee waiver thing is way easier than i expected, you just check a box and your counselor confirms it. i put that off for a month for no reason.",
    tags: ['common app', 'senior year'],
  },
  {
    a: 'rosa', c: 'applications', v: 'checklist', d: 4,
    title: 'The August checklist I give every senior',
    body: "I have one counselor for 480 students, so I front-load everything into August. If a student does these six things before Labor Day, the rest of the fall is manageable. If they do none of them, October is a crisis.",
    items: [
      'Create the Common App account and finish the Profile section, which never changes',
      'Ask two teachers in person, then follow up by email with a one-page brag sheet',
      'Build the college list with a real financial safety on it, not a hypothetical one',
      'Run the Net Price Calculator on every school before you fall in love with any of them',
      'Draft the personal statement badly on purpose, just to have something to cut',
      'Put every deadline in one calendar, including the FAFSA and CSS dates',
    ],
    tags: ['checklist', 'timeline'],
  },
  {
    a: 'mei', c: 'applications', v: 'plain', d: 6,
    title: 'What international applicants get told too late',
    body: "Nobody explained the CSS Profile to me until December, and by then I had missed two priority deadlines. If you are applying from outside the US, understand this early: need-blind and need-aware are different things, and most schools are need-aware for internationals even when they are need-blind for domestic students.\n\nThat is not unfair exactly, it is just a budget. But it means your list needs schools that are explicitly generous to internationals, and there are maybe forty of them. Find that list before you find your dream school.",
    tags: ['international', 'financial aid'],
  },
  {
    a: 'james', c: 'applications', v: 'quote', d: 8,
    title: 'Transferring is not a consolation prize',
    body: "I did two years at a community college in Sacramento and then transferred to Stanford. The number of people who told me transferring was \"giving up\" was genuinely high, and every one of them was wrong.\n\nTransfer admissions weight different things. Your high school record fades fast. What matters is college GPA, the rigor of what you took, and whether your reason for transferring is coherent. That last one is the whole essay. Mine was two paragraphs about a specific lab I wanted to work in and why my current school could not offer it.",
    quote: 'Your high school record fades fast. What matters is what you did with the two years after it.',
    tags: ['transfer', 'community college'],
  },
  {
    a: 'theo', c: 'applications', v: 'plain', d: 10,
    title: 'The recruiting timeline runs a full year ahead of everyone else',
    body: "Swimming. Verbally committed in September of junior year, which means my \"application\" was effectively done before most of my class started theirs.\n\nIf you are a recruited athlete, your calendar is: sophomore year make the recruiting video, junior fall email coaches directly with times or film, junior spring official visits, junior summer verbal. The academic application later is close to a formality if the coach has a slot for you.\n\nThe part nobody says: get the offer in writing from admissions, not just the coach. Coaches leave.",
    tags: ['athletics', 'recruiting'],
  },
  {
    a: 'amara', c: 'applications', v: 'plain', d: 12,
    title: 'Your activity list should argue for something',
    body: "Ten slots. Most people fill them with ten unrelated things and call it well-rounded. Well-rounded is not a thesis.\n\nMine read: debate, debate, mock trial, a legal-aid volunteer job, a research paper on sentencing, then everything else. By slot four a reader knows exactly what I care about. That is not narrowing yourself, that is being legible.\n\nYou can absolutely have a random passion in slot eight. Have several. But the top four should agree with each other.",
    tags: ['activities', 'strategy'],
  },
  {
    a: 'marcus', c: 'applications', v: 'plain', d: 14,
    title: 'Early decision is a financial decision before it is a strategic one',
    body: "Every year I have a student who applies ED to a school they cannot afford, gets in, and then has to withdraw and explain themselves. It is avoidable and it is heartbreaking.\n\nED is binding. You are agreeing to attend before you can compare aid offers. So the rule is simple: only apply ED if the Net Price Calculator number is one your family has already looked at and said yes to out loud. Not \"we will figure it out.\" Yes, out loud, in October.",
    tags: ['early decision', 'financial aid'],
  },
  {
    a: 'nadia', c: 'applications', v: 'plain', d: 16,
    title: 'Things I did wrong as a first-gen applicant',
    body: "I applied to eleven schools and eight of them were reaches. My counselor never told me that was a problem and I did not know to ask.\n\nI also did not understand that \"meets full need\" is a specific institutional promise and only about seventy schools make it. I assumed all private schools were expensive and all public schools were cheap. Neither is reliably true.\n\nIf nobody in your family has done this, the single best move is to find one adult who has, and ask them dumb questions on purpose.",
    tags: ['first gen'],
  },
  {
    a: 'kwame', c: 'applications', v: 'checklist', d: 18,
    title: 'How QuestBridge actually works, from someone who matched',
    body: "Rural school, no AP offerings, household income under 40k. QuestBridge Match got me into MIT with zero cost. The process is not complicated but it is unforgiving about deadlines.",
    items: [
      'Apply to the College Prep Scholars program as a junior if you can, it is practice and it opens doors',
      'The National College Match application is due in late September, months before everything else',
      'You rank up to fifteen partner schools, and matching is binding to your highest-ranked school that selects you',
      'If you do not match, your application is automatically forwarded as Regular Decision, which is a free second shot',
      'The essays are different from the Common App ones and take real time, do not recycle',
    ],
    tags: ['questbridge', 'low income'],
  },
  {
    a: 'chloe', c: 'applications', v: 'plain', d: 5,
    title: 'making my list as a junior and its harder than i thought',
    body: "everyone says have safeties matches reaches but nobody tells you how to know which is which. i looked at common data sets like people suggested and honestly the middle 50% ranges helped a lot more than any ranking list did.\n\nstill confused about whether to apply test optional. my sat is right at the 25th percentile for a few schools on my list. counselor said submit if youre above the 25th, other people online say only above the median. no idea who to believe.",
    tags: ['college list', 'junior year'],
  },
  {
    a: 'hana', c: 'applications', v: 'plain', d: 20,
    title: 'Things that genuinely do not matter as much as you think',
    body: "The name of your high school, unless it is one of about thirty schools and even then less than you would guess. The exact number of AP classes past a certain point. Whether you were president or vice president of something. A single B. Your senior fall schedule being marginally less rigorous than your junior one.\n\nThings that do matter: an upward grade trend, a recommendation that sounds like the teacher actually knows you, and whether your application makes internal sense.",
    tags: ['myths'],
  },

  // ───────────────────────────────── essays ─────────────────────────────────
  {
    a: 'sofia', c: 'essays', v: 'quote', d: 1,
    title: 'What I wish I knew before writing my Common App essay',
    body: "I rewrote mine four times. The version that worked was the one where I stopped trying to sound impressive and just described a Tuesday afternoon at my grandmother's shop.\n\nAdmissions readers see thousands of essays about leadership. They see almost none about a kid who actually noticed something. Pick a small moment you can describe in detail, then explain what it changed about how you see things. That is the whole formula, and the smallness is the part people refuse to believe.",
    quote: 'They see thousands of essays about leadership. Almost none about a kid who actually noticed something.',
    tags: ['common app', 'personal statement'],
  },
  {
    a: 'eleanor', c: 'essays', v: 'plain', d: 2,
    title: 'The adjective problem',
    body: "I teach first-year writing and I can usually tell within a paragraph whether a student was trained to write for a rubric.\n\nThe symptom is adjectives. \"An incredibly transformative experience that profoundly shaped my perspective.\" Four evaluative words and zero information. Strike all four and the sentence says nothing, which means it always said nothing.\n\nThe fix is concrete nouns and verbs. Not \"transformative,\" but what specifically changed. Not \"passionate about medicine,\" but the thing you did at 6am on a Saturday that nobody made you do.",
    tags: ['writing craft'],
  },
  {
    a: 'hana', c: 'essays', v: 'plain', d: 3,
    title: 'The three essays I got tired of reading',
    body: "The sports injury that taught resilience. The mission trip where a poor community taught the author gratitude, which reads badly for reasons I hope are obvious. And the grandparent's death, which is often genuinely the most important thing that happened to a seventeen year old and is still very hard to write well.\n\nNone of these are banned. I read a mission trip essay once that was excellent because the student wrote honestly about feeling useless the whole week. Honesty is the variable, not topic.",
    tags: ['topics'],
  },
  {
    a: 'sarah', c: 'essays', v: 'plain', d: 5,
    title: 'On AI-written essays, from the office that reads them',
    body: "We can usually tell, and not for the reason you think. It is not vocabulary. It is that the essays have no friction. Every paragraph resolves cleanly, every reflection lands on a tidy lesson, and nothing in them is awkward or unresolved.\n\nReal seventeen year olds contradict themselves. They are unsure. They notice something and cannot fully explain why it mattered. That texture is the signal we are reading for, and it is exactly what gets smoothed away.\n\nUse the tools to outline or to catch a comma. Do not let them write the sentence where you sound uncertain.",
    tags: ['ai', 'authenticity'],
  },
  {
    a: 'eleanor', c: 'essays', v: 'checklist', d: 7,
    title: 'A revision pass that actually improves things',
    body: "Most students revise by rereading and nodding. That does nothing. Try this instead, in this order, on a printed copy.",
    items: [
      'Circle every abstract noun: passion, journey, growth, impact. Replace half of them with something you can photograph.',
      'Find your last paragraph. Delete it. Nine times out of ten the essay ended one paragraph earlier.',
      'Read only the first sentence of each paragraph in sequence. Does it still track?',
      'Read the whole thing out loud to a person, not a wall. Mark every place you instinctively explained something the page did not say.',
      'Cut the first two sentences of the essay. Almost every draft warms up before it starts.',
    ],
    tags: ['revision'],
  },
  {
    a: 'andre', c: 'essays', v: 'plain', d: 9,
    title: 'Arts supplements are a separate application, treat them like one',
    body: "I submitted a music supplement to nine schools and the quality of the recording mattered more than I wanted it to. Not the playing, the recording. A phone video in a dead-sounding practice room undersells you badly.\n\nAlso: the artistic resume is not the activity list. It wants repertoire, teachers, competitions, and honest levels. Do not inflate. The faculty reading it will know within eight bars.",
    tags: ['arts supplement', 'music'],
  },
  {
    a: 'nadia', c: 'essays', v: 'plain', d: 11,
    title: 'The \"why us\" essay is a research assignment, not a love letter',
    body: "I wrote my first why-us essay entirely about how beautiful the campus was and how the energy felt right. It was rejected everywhere, and looking back that essay could have been about any of two thousand schools.\n\nThe version that worked named two professors, one course number, and a student organization I had actually emailed. Twenty minutes of real research beats an hour of adjectives. If a sentence in your why-us essay would be true of a different school, delete it.",
    tags: ['why us', 'supplements'],
  },
  {
    a: 'sofia', c: 'essays', v: 'plain', d: 13,
    title: 'On letting other people edit it',
    body: "My English teacher, my counselor, and my aunt all read my essay and all gave different advice, and I nearly wrote a fourth version that pleased everyone and sounded like nobody.\n\nThe rule I landed on: take notes on where readers got confused, ignore notes on how they would have written it. Confusion is data. Preference is noise. If three people stumble on the same paragraph, that paragraph is broken regardless of whether you like it.",
    tags: ['feedback'],
  },
  {
    a: 'rosa', c: 'essays', v: 'plain', d: 15,
    title: 'To students who think their life is not interesting enough',
    body: "I hear this every single year and it is the most common reason a good essay does not get written.\n\nYou do not need trauma. You do not need an unusual biography. I have read a genuinely excellent essay about restocking a vending machine at a rec center. It worked because the student noticed the pattern of what sold out on which days and what that told them about the people in that building.\n\nAttention is the qualification. Not hardship.",
    tags: ['topics', 'encouragement'],
  },
  {
    a: 'ben', c: 'essays', v: 'plain', d: 4,
    title: 'four drafts in and i finally like it',
    body: "draft 1 was about winning a tournament. boring, everyone does that.\ndraft 2 was about my dad which felt fake because we dont actually talk that much.\ndraft 3 i tried to be funny the whole way through and it was exhausting to read.\ndraft 4 is about the 40 minute bus ride i take every morning and what i notice out the window. its way smaller than the other ones and its the only one that sounds like me.\n\nanyway if youre on draft 2 and hate it thats normal apparently",
    tags: ['drafting'],
  },
  {
    a: 'eleanor', c: 'essays', v: 'quote', d: 17,
    title: 'Structure is a kindness to your reader',
    body: "A personal statement has roughly 650 words, which is about two and a half double-spaced pages. That is not enough room for a full narrative arc and a reflection and a conclusion that ties to your future.\n\nPick two of those three. The most common successful shape I see is: one specific scene rendered closely, then the reflection that scene earns. No conclusion, no gesture at your intended major. The essay simply stops at the moment it has said its thing, and the confidence of that ending does more than a paragraph of summary.",
    quote: 'Six hundred and fifty words is not enough room for three moves. Pick two.',
    tags: ['structure'],
  },
  {
    a: 'hana', c: 'essays', v: 'plain', d: 22,
    title: 'The additional information section is not a trap',
    body: "Students avoid it because they think explaining anything sounds like an excuse. It does not. It sounds like context, and readers want context.\n\nOne semester of bad grades because a parent was ill, a school that only offered four APs, a job at twenty hours a week. Two or three sentences, factual, no self-pity, no dramatics. I have seen that section move a file from no to maybe more than once.\n\nWhat does not belong there: a fourth essay, a list of every award again, or a complaint about a teacher.",
    tags: ['additional information'],
  },

  // ─────────────────────────────── scholarships ───────────────────────────────
  {
    a: 'marcus', c: 'scholarships', v: 'stats', d: 1,
    title: 'Scholarships nobody applies for are the ones you should apply for',
    body: "Everyone applies to the big national scholarships with forty thousand applicants. Meanwhile your county community foundation has a $2,500 award with eleven applicants and a two-paragraph essay.\n\nSearch your state name plus community foundation scholarship, then check your school counselor's local list, then check your parents' employers and unions. I stacked six small local awards into more money than any single national one would have given me.",
    stats: [{ n: '40,000+', label: 'applicants to a big national award' }, { n: '11', label: 'applicants to my county award' }],
    tags: ['local scholarships', 'strategy'],
  },
  {
    a: 'gerald', c: 'scholarships', v: 'plain', d: 2,
    title: 'Read your aid letter in this order',
    body: "Twenty years of doing this and families still read aid letters top to bottom, which is exactly backwards.\n\nStart at the bottom. Find total cost of attendance, which includes housing, food, books, and travel, not just tuition. Then subtract only the grants and scholarships, the money that is not repaid. That number is your real cost. Loans and work-study are not aid in the sense that matters, they are ways of paying the real cost.\n\nSchools present these together on purpose. Separate them yourself, on paper, for every offer.",
    tags: ['financial aid', 'award letters'],
  },
  {
    a: 'gerald', c: 'scholarships', v: 'checklist', d: 4,
    title: 'You can appeal an aid offer, and it works more often than people expect',
    body: "It is called a professional judgment review or an aid appeal. It is not haggling and tone matters enormously. Here is the shape of one that works.",
    items: [
      'Write to the financial aid office, not admissions, and address a specific person if you can find one',
      'State plainly what changed or what the FAFSA did not capture: job loss, medical costs, supporting a relative',
      'Attach documentation. An appeal without paperwork is a wish.',
      'If you have a competing offer from a comparable school, include it as information, never as a threat',
      'Say clearly that the school is your first choice, if that is true. It is the sentence that unlocks discretionary funds.',
    ],
    tags: ['appeals', 'financial aid'],
  },
  {
    a: 'rosa', c: 'scholarships', v: 'plain', d: 6,
    title: 'The scholarship search sites are mostly a waste of your evening',
    body: "I have watched hundreds of students burn twenty hours on the big aggregator sites and come away with nothing but a spam folder.\n\nThe money that actually shows up comes from four places: the college itself in institutional aid, your state's grant program, local civic organizations, and employer or union programs. Institutional aid dwarfs the rest. A school that gives you a $20,000 grant has out-earned every essay contest you will ever enter.\n\nSo the highest-value scholarship strategy is choosing which schools to apply to.",
    tags: ['search strategy'],
  },
  {
    a: 'darius', c: 'scholarships', v: 'plain', d: 8,
    title: 'What a Posse interview is actually like',
    body: "Nobody prepared me for the fact that the first round is a group interview with about a hundred people in a room doing activities together.\n\nThey are watching how you behave in a group. Do you talk over people. Do you bring in someone who has not spoken. Do you get quietly competitive when a task is timed. I saw very impressive students eliminated in round one for steamrolling a group exercise.\n\nIf you are invited, the preparation is not memorizing answers. It is deciding in advance what kind of person you want to be in a room.",
    tags: ['posse', 'interviews'],
  },
  {
    a: 'kwame', c: 'scholarships', v: 'plain', d: 10,
    title: 'Full ride and full tuition are not the same words',
    body: "This cost a friend of mine about eleven thousand dollars a year in surprises.\n\nFull tuition covers tuition. Housing, meals, fees, books, and getting yourself home at Thanksgiving are yours. Full ride generally covers cost of attendance, though even then check whether it includes summer, whether it renews automatically, and what GPA it requires.\n\nAsk the exact question in writing: what is my out-of-pocket cost in year one, all in. Make them give you a number.",
    tags: ['full ride', 'definitions'],
  },
  {
    a: 'gerald', c: 'scholarships', v: 'plain', d: 12,
    title: 'FAFSA verification is not an accusation',
    body: "Roughly one in five FAFSA filers gets selected for verification and every year students read that email as though they have been caught doing something.\n\nIt is often random. Sometimes it is a mismatch in a number. You send the documents, they check, it resolves. What causes actual damage is ignoring it, because your aid does not disburse until verification clears, and students find that out in August when the bill is due.\n\nOpen the portal. Do it the week you get the notice.",
    tags: ['fafsa', 'verification'],
  },
  {
    a: 'marcus', c: 'scholarships', v: 'plain', d: 15,
    title: 'The essay prompt for local scholarships is usually the same three questions',
    body: "Why do you deserve this. What are your goals. How have you served your community.\n\nWrite one strong 400-word answer to each, keep them in a document, and adapt rather than rewrite. I have students who apply to twenty local awards in a weekend because they built the block text once in October.\n\nThe adaptation matters though. Name the organization. If the Rotary Club funds it, know one thing the Rotary Club does.",
    tags: ['essays', 'efficiency'],
  },
  {
    a: 'luis', c: 'scholarships', v: 'plain', d: 18,
    title: 'Working while enrolled changed my aid, and not how I expected',
    body: "I was scared that earning money would tank my financial aid. There is an income protection allowance for students, and for most people working a normal part-time job, the effect is smaller than the anxiety about it.\n\nWhat did surprise me is that work-study earnings are treated differently from regular job earnings on the FAFSA. If you have the option, work-study is usually the better deal for that reason alone. Ask your aid office to explain your specific numbers rather than trusting a forum.",
    tags: ['work study', 'fafsa'],
  },
  {
    a: 'rosa', c: 'scholarships', v: 'plain', d: 21,
    title: 'Deadlines I watch students miss every single year',
    body: "State grant deadlines, which are often much earlier than federal ones and vary wildly. Some states run out of money in March.\n\nCSS Profile priority dates at private schools, frequently in November for early applicants.\n\nInstitutional merit scholarship deadlines, which are sometimes earlier than the admission deadline itself, so applying on time for admission can still make you late for money.\n\nPut all three in the calendar in September.",
    tags: ['deadlines'],
  },

  // ──────────────────────────────── majors ────────────────────────────────
  {
    a: 'alice', c: 'majors', v: 'quote', d: 1,
    title: 'You do not need to know your major',
    body: "I have advised undergraduates for nineteen years. The students who struggle most are not the undecided ones, they are the ones who locked in at seventeen and felt they could not change course.\n\nRoughly a third of students switch majors at least once, and that number understates it because it does not count the people who stay in a major they have quietly stopped wanting. Pick a school with strength in two or three areas you find interesting rather than one that is elite in a single field you have never actually studied.",
    quote: 'The students who struggle most are the ones who locked in at seventeen and felt they could not change course.',
    tags: ['undecided', 'advising'],
  },
  {
    a: 'imani', c: 'majors', v: 'plain', d: 3,
    title: 'I arrived undecided on purpose and it cost me nothing',
    body: "Everyone acted like this was reckless. It was the opposite. I took intro courses in four departments in my first year, discovered I disliked the field I was sure about, and declared psychology in spring of sophomore year on time.\n\nThe thing that would have cost me is if I had come in pre-med, taken only the pre-med sequence, and then realized in junior year. That is when switching gets expensive, because the prerequisite chains are long.\n\nExploring early is cheap. Exploring late is not.",
    tags: ['undecided'],
  },
  {
    a: 'fatima', c: 'majors', v: 'plain', d: 5,
    title: 'The prerequisite chain is the thing to actually look at',
    body: "I teach chemistry at a community college and advise transfers, and this is the practical advice nobody gives seventeen year olds.\n\nSome majors have a long ladder of courses that must be taken in strict sequence. Engineering, nursing, most of the physical sciences. If you start that ladder a year late, you graduate a year late, full stop.\n\nOther majors, most humanities and social sciences, have almost no chain and can be picked up in sophomore year with no penalty. Knowing which category you are flirting with tells you how urgent the decision really is.",
    tags: ['prerequisites', 'planning'],
  },
  {
    a: 'alice', c: 'majors', v: 'plain', d: 8,
    title: 'Biology is not pre-med and pre-med is not a major',
    body: "Every fall I meet first-years who believe they must major in biology to apply to medical school. You must complete a set of prerequisite courses. That is all. Medical schools admit music majors, classics majors, and engineers every year, and some admissions committees find them more interesting.\n\nIf you love biology, major in biology. If you love something else and are willing to fit the prerequisites around it, do that instead. The GPA you earn in a subject you actually like tends to be higher, and GPA is the part they are strict about.",
    tags: ['pre med', 'myths'],
  },
  {
    a: 'yuki', c: 'majors', v: 'plain', d: 10,
    title: 'I picked a small school and the major changed shape',
    body: "At a large university, environmental studies would have been one track among many, with lectures of three hundred. At Oberlin it is small enough that I built a concentration with two professors who know my name and my writing.\n\nThe tradeoff is real: fewer course offerings, no enormous research apparatus, some semesters where the one class you want is not running. I would make the same choice again but I want to be honest that it is a trade, not a free upgrade.",
    tags: ['liberal arts', 'small colleges'],
  },
  {
    a: 'eleanor', c: 'majors', v: 'plain', d: 13,
    title: 'In defense of the humanities degree, unsentimentally',
    body: "I will not tell you an English degree is a reliable path to wealth. It is not, on average, and anyone who says otherwise is selling something.\n\nWhat I will say is that the gap narrows substantially over a career, and that the specific skill of building an argument under time pressure and reading something long without panicking transfers to more jobs than students expect.\n\nThe worst outcome is a humanities degree with no evidence attached. Write publicly, work somewhere, learn one technical thing. The degree plus artifacts is durable. The degree alone is thin.",
    tags: ['humanities', 'outcomes'],
  },
  {
    a: 'fatima', c: 'majors', v: 'checklist', d: 16,
    title: 'How to test a major before you commit to it',
    body: "You can get most of the information for free in a weekend. Students almost never do this and then spend two years finding out.",
    items: [
      'Find the department course catalog and read the required course list end to end, not the marketing page',
      'Look up the syllabus for the hardest required course, usually a 300-level one, and read the assignments',
      'Search the department site for recent senior theses or capstone titles and see whether any of them interest you',
      'Find one person doing the job you imagine and read their actual daily schedule, not their job title',
      'Take the intro course as an elective before declaring, if your schedule allows it at all',
    ],
    tags: ['research', 'decision making'],
  },
  {
    a: 'andre', c: 'majors', v: 'plain', d: 19,
    title: 'Double majoring is often worse than a major and a minor',
    body: "I do music and cognitive science and I would not universally recommend it. Two sets of requirements means almost no free electives, which means the accidental class that changes your mind never happens.\n\nA major with a minor, or a major with a deliberate cluster of courses in another field, gets you most of the intellectual benefit and keeps four or five slots open for wandering. The wandering is where a lot of the value of college actually is.",
    tags: ['double major'],
  },
  {
    a: 'alice', c: 'majors', v: 'plain', d: 24,
    title: 'What to do if you are bad at the subject you love',
    body: "This comes up in office hours more than anything else and it deserves a real answer rather than encouragement.\n\nFirst, distinguish between bad at it and new at it. A C in your first physics course after a high school that never taught you problem sets is not evidence of aptitude, it is evidence of preparation. Those are different and the second is fixable.\n\nSecond, if after genuine effort and a second attempt the difficulty persists and you also dread it, that combination matters. Difficulty alone does not. Difficulty plus dread does.",
    tags: ['struggling', 'advising'],
  },

  // ────────────────────────────── campus_life ──────────────────────────────
  {
    a: 'yuki', c: 'campus_life', v: 'plain', d: 2,
    title: 'The first six weeks are strange for almost everyone',
    body: "Nobody tells you that the friend group you form in week one usually is not the one you keep. Everyone is auditioning, everyone is slightly performing, and it feels permanent while it is happening.\n\nMine reshuffled completely by October and the second version came from a class and a club rather than my floor. If you are three weeks in and quietly panicking that you chose wrong, the honest answer is that it is too early to have any information at all.",
    tags: ['first year', 'friendship'],
  },
  {
    a: 'luis', c: 'campus_life', v: 'stats', d: 4,
    title: 'Working twenty-five hours a week while enrolled full time',
    body: "It is doable and I would not romanticize it. My schedule is stacked into three long days so I have two clean study days, and that structural choice mattered more than any productivity technique.\n\nThe thing that actually saved me was telling professors in week one. Not asking for anything, just stating it. Two of them moved office hours for me without being asked. Faculty are far more accommodating to a student who communicates early than to one who explains after a missed deadline.",
    stats: [{ n: '25', label: 'hours a week at work' }, { n: '3', label: 'days a week on campus, by design' }],
    tags: ['working students', 'time management'],
  },
  {
    a: 'imani', c: 'campus_life', v: 'plain', d: 6,
    title: 'Office hours are the most underused thing on any campus',
    body: "For most of my first year I thought office hours were for people in trouble. They are mostly empty rooms with a professor in them.\n\nI started going once a week to one professor with a question I actually had, not a strategic one. That turned into a research assistantship, then a recommendation letter that got me an internship. None of that was the plan. The plan was asking about a reading.\n\nGo in week two, before anything is wrong. It is much easier than going in week ten when something is.",
    tags: ['professors', 'first year'],
  },
  {
    a: 'theo', c: 'campus_life', v: 'plain', d: 9,
    title: 'What being a varsity athlete actually costs you',
    body: "Twenty hours a week is the NCAA limit and it is a polite fiction. With travel, lifting, treatment, and film, mine runs closer to thirty in season.\n\nThe real cost is not the hours, it is the inflexibility. I cannot take a lab that meets at four. I have missed the same guest lecture series three years running. Study abroad is essentially off the table.\n\nI would still do it. But choose your school knowing that your academic schedule is downstream of a practice schedule you do not control.",
    tags: ['athletics', 'balance'],
  },
  {
    a: 'nadia', c: 'campus_life', v: 'plain', d: 11,
    title: 'Being first-gen at a wealthy school',
    body: "The academics were never the hard part. The hard part was the assumed knowledge around them.\n\nI did not know what a syllabus meant by \"participation.\" I did not know you could email a professor. I did not know that everyone talking about their summer in Croatia was not the norm, it was just loud.\n\nWhat helped: finding the first-gen office, which most schools now have and almost nobody uses, and being blunt with one upperclassman about not knowing how things worked. Ask the embarrassing questions to one safe person rather than guessing in public for two years.",
    tags: ['first gen', 'belonging'],
  },
  {
    a: 'sofia', c: 'campus_life', v: 'plain', d: 14,
    title: 'Roommate conflicts are almost never about the actual thing',
    body: "Ours was ostensibly about dishes and was actually about the fact that she thought I was avoiding her and I thought she found me annoying. Six weeks of passive aggression over a pan.\n\nThe RA-mediated conversation took eleven minutes and fixed it. I had been treating asking for mediation as an escalation. It is not. It is a free service staffed by someone trained to run exactly that conversation, and using it early is much less awkward than the alternative.",
    tags: ['roommates'],
  },
  {
    a: 'darius', c: 'campus_life', v: 'plain', d: 17,
    title: 'Why I chose an HBCU and what it is actually like',
    body: "I had offers from two schools people would consider more prestigious. I do not regret this for a second, and the reasons are not the ones people assume.\n\nIt was not about comfort. It was that the alumni network is unusually active and unusually willing, that being unremarkable in a room full of Black excellence recalibrated what I thought was normal for me, and that the faculty expectations were higher, not lower.\n\nVisit if you can. The thing people get wrong about HBCUs is almost always fixed by walking around one for a day.",
    tags: ['hbcu', 'choosing'],
  },
  {
    a: 'mei', c: 'campus_life', v: 'plain', d: 20,
    title: 'The international student things nobody warns you about',
    body: "Your visa status is tied to full-time enrollment, so dropping below a course load has consequences a domestic student never thinks about. Talk to the international office before you drop anything, not after.\n\nWork authorization is restricted and the rules for on-campus versus off-campus are strict. Do not take an under-the-table job because someone said it was fine.\n\nAnd the small one: the first winter break, when the dorms close and everyone goes home. Plan for it in October, not December.",
    tags: ['international'],
  },
  {
    a: 'ben', c: 'campus_life', v: 'plain', d: 23,
    title: 'visited 6 campuses this year, what actually told me anything',
    body: "the official tour is basically an ad, every school has a nice library and an enthusiastic sophomore walking backwards.\n\nwhat actually helped: eating in the dining hall alone and listening, reading the student newspaper especially the opinion section, and sitting in the main quad for 20 minutes on a normal weekday afternoon.\n\nyou can feel whether people look happy. thats not scientific but its the only thing i remember from any of the visits.",
    tags: ['campus visits'],
  },

  // ───────────────────────────── internships ─────────────────────────────
  {
    a: 'priya', c: 'internships', v: 'stats', d: 1,
    title: 'How I got a research internship with no connections',
    body: "I emailed thirty-one professors. Four replied, one said yes.\n\nThe emails that got responses named a specific paper of theirs and asked a real question about it, then offered to do the boring work. The ones that got ignored said I am very passionate about science.\n\nRead one paper, ask one honest question, offer to do data entry. That is the entire method and it works at seventeen.",
    stats: [{ n: '31', label: 'professors emailed' }, { n: '4', label: 'replies' }, { n: '1', label: 'yes, which was enough' }],
    tags: ['research', 'cold email'],
  },
  {
    a: 'priya', c: 'internships', v: 'plain', d: 2,
    title: 'The cold email template, since everyone asks',
    body: "Subject: Question about your 2024 paper on [specific thing]\n\nDear Professor [name], I am a high school junior in [place]. I read your paper on [specific thing] and was confused by [genuine, specific confusion]. [One or two sentences showing you actually read it.]\n\nI am hoping to spend the summer helping in a lab. I have no research experience, but I am reliable, I can commit [X] hours a week, and I am happy to start with data entry or cleaning. Is there any chance you have room?\n\nThat is it. Short, specific, honest about your level, and explicitly offering unglamorous work.",
    tags: ['cold email', 'template'],
  },
  {
    a: 'tobi', c: 'internships', v: 'plain', d: 4,
    title: 'Co-op versus internship, since they are not the same',
    body: "An internship is usually a summer. A co-op at a school like Georgia Tech is a multi-semester rotation where you alternate work terms and school terms with the same employer.\n\nThe tradeoff: co-op often means graduating a semester or two later. What you get is twelve to eighteen months of real experience with one company, which converts to a full-time offer far more often than three summer internships at three different places.\n\nIf a school offers co-op, ask what percentage of co-op students get return offers. That number tells you whether the program is real.",
    tags: ['co-op'],
  },
  {
    a: 'victor', c: 'internships', v: 'plain', d: 6,
    title: 'What your resume gets, from someone who screened them',
    body: "Six seconds on the first pass. I am looking at three things: does the top third tell me what you are, is there any evidence you have done a real thing, and is it one page.\n\nWhat wastes space: an objective statement, your full address, \"references available on request,\" a skills section listing Microsoft Word, and any use of the word passionate.\n\nWhat earns space: numbers. Not \"helped with social media\" but \"ran the account, grew it from 400 to 3,100 in a year.\" I do not care that the number is small. I care that you measured it.",
    tags: ['resume', 'hiring'],
  },
  {
    a: 'omar', c: 'internships', v: 'plain', d: 8,
    title: 'Applying to tech internships as a first-year is mostly a numbers game',
    body: "I sent about ninety applications my freshman year and got two interviews and zero offers. Sophomore year, forty applications, six interviews, two offers. The difference was not effort, it was that I had one project someone could click on.\n\nThe project did not need to be impressive. Mine was a small tool that scraped my university's course catalog and told you when a full class opened up. Around two hundred students used it. That single sentence did more than my GPA.",
    tags: ['tech', 'projects'],
  },
  {
    a: 'victor', c: 'internships', v: 'checklist', d: 12,
    title: 'How to not waste an internship once you have one',
    body: "Most interns do the assigned work well and leave with a line on a resume. A smaller number leave with a mentor and a referral. The difference is almost entirely behavioral and none of it is difficult.",
    items: [
      'In week one, ask your manager what a successful summer would look like, and write the answer down',
      'Keep a running document of everything you shipped, with numbers, updated weekly rather than reconstructed in August',
      'Ask three people outside your team for twenty minutes about how they got their job. Almost nobody says no to this.',
      'Volunteer once for something nobody wants, ideally documentation or cleanup. It is remembered disproportionately.',
      'In the final week ask directly whether they would work with you again, and if yes, ask for that in writing on LinkedIn',
    ],
    tags: ['performance', 'networking'],
  },
  {
    a: 'james', c: 'internships', v: 'plain', d: 15,
    title: 'Unpaid internships and when to walk away',
    body: "I took one unpaid internship and it was a mistake, and I want to be specific about why rather than making a blanket rule.\n\nThe test is whether the organization is structurally unable to pay or simply choosing not to. A four-person nonprofit with a real mentorship structure is a different proposition from a profitable company treating free labor as a pipeline.\n\nAlso check your school. Many have summer funding grants specifically to cover unpaid placements, and a startling number go unclaimed every year because students do not know they exist.",
    tags: ['unpaid', 'funding'],
  },
  {
    a: 'tobi', c: 'internships', v: 'plain', d: 18,
    title: 'The career fair is not the point of the career fair',
    body: "Handing a resume to a recruiter at a booth is close to useless, they collect four hundred of them and everything goes into the same portal you could have used from your dorm.\n\nWhat is useful is finding out which teams are hiring and getting one name. Then you apply online like everyone else, and you email that person saying you spoke at the fair. That email is the entire value of having attended.",
    tags: ['career fair', 'networking'],
  },

  // ─────────────────────────────── careers ───────────────────────────────
  {
    a: 'victor', c: 'careers', v: 'quote', d: 2,
    title: 'Nobody has a career plan, they have a next step',
    body: "I hired for nine years and interviewed several hundred people, and I never once met someone whose career had gone according to a plan made at eighteen.\n\nWhat successful people had instead was a bias toward taking the slightly uncomfortable next step, and a habit of staying in touch with people they liked working with. That is genuinely most of it. The narrative gets constructed afterwards and then gets told to seventeen year olds as though it was a strategy.",
    quote: 'The narrative gets constructed afterwards and then told to seventeen year olds as though it was a strategy.',
    tags: ['career planning'],
  },
  {
    a: 'alice', c: 'careers', v: 'plain', d: 5,
    title: 'What an academic career actually looks like, since students ask',
    body: "Students romanticize this and I would like to be accurate rather than discouraging.\n\nA PhD is five to seven years on a stipend that is livable and not comfortable. The academic job market after it is genuinely difficult and the number of tenure-track positions per graduate is not favorable in most fields. Many excellent people do not get one.\n\nThe reasons to do it anyway are that you want to spend those years on the question, and that the training opens non-academic doors. The reason not to is that you assume the professorship is waiting. It is not waiting.",
    tags: ['academia', 'phd'],
  },
  {
    a: 'fatima', c: 'careers', v: 'plain', d: 7,
    title: 'The trades are a real answer and I am tired of pretending otherwise',
    body: "I teach at a community college and I have watched students borrow forty thousand dollars for a degree they did not want because nobody in their life would say the word apprenticeship out loud.\n\nElectrician, HVAC, dental hygiene, radiologic technology, welding. Median pay in several of these beats plenty of bachelor's degrees, the training is one to four years, and much of it is paid.\n\nThis is not instead-of advice, plenty of people do a trade and a degree later. It is just that a seventeen year old should know the option exists before signing loan paperwork.",
    tags: ['trades', 'alternatives'],
  },
  {
    a: 'amara', c: 'careers', v: 'plain', d: 9,
    title: 'Pre-law does not mean what people think',
    body: "There is no required pre-law curriculum. Law schools care about GPA and LSAT to a degree that surprises people, and they admit from every major.\n\nWhat that means practically: choose a major you will do well in and that trains you to write. Philosophy and economics majors do well on the LSAT, but so do plenty of others, and the correlation is probably about the kind of person who picks them.\n\nThe more useful thing to do before law school is work for two years. Admissions likes it and, more importantly, you will find out whether you actually want this.",
    tags: ['pre law'],
  },
  {
    a: 'luis', c: 'careers', v: 'plain', d: 13,
    title: 'Nursing is not a fallback and the schedule is the real story',
    body: "People say nursing like it is the safe option. It is a competitive program with a clinical schedule that runs at hours no one warns you about, and the attrition in the first year of the program is significant.\n\nThe upside is genuinely large: near-immediate employment, a licence that travels, and a ladder to nurse practitioner that pays well. The part to be honest with yourself about is twelve-hour shifts and whether you can be steady around distress.\n\nShadow someone for a full shift before committing. Not four hours. A full one.",
    tags: ['nursing', 'healthcare'],
  },
  {
    a: 'victor', c: 'careers', v: 'plain', d: 16,
    title: 'Networking is a bad word for a simple thing',
    body: "Students hear networking and imagine schmoozing at an event, which almost nobody enjoys and which mostly does not work anyway.\n\nThe version that works is boring: after you meet someone useful, send one message within two days that references something specific from the conversation. Then, twice a year, send something they would find interesting with no ask attached.\n\nThat is it. Two emails a year to twenty people is a network. It requires no charisma at all, only a calendar reminder.",
    tags: ['networking'],
  },
  {
    a: 'tobi', c: 'careers', v: 'plain', d: 21,
    title: 'Negotiating your first offer, briefly',
    body: "You can negotiate an entry-level offer and the downside risk is much lower than students fear. Offers are effectively never rescinded for a polite ask.\n\nThe script is short: thank them, say you are excited, say that based on what you have seen for this role you were hoping for a number closer to X, and stop talking.\n\nIf the base is fixed, ask about the signing bonus or the start date instead. Something is usually movable even when salary is not.",
    tags: ['negotiation', 'first job'],
  },

  // ────────────────────────────── test_prep ──────────────────────────────
  {
    a: 'priya', c: 'test_prep', v: 'plain', d: 3,
    title: 'Free prep beat the expensive course for me',
    body: "My family looked at a $1,400 prep course and we could not do it. I used the free official practice tests and Khan Academy and went up 180 points.\n\nWhat mattered was not the material, all prep material is roughly the same. It was the error log. Every question I missed went into a spreadsheet with a column for why, and the why had to be specific: misread the question, did not know the rule, knew the rule and ran out of time. Those three problems have completely different fixes and treating them the same is why people plateau.",
    tags: ['sat', 'free resources'],
  },
  {
    a: 'chloe', c: 'test_prep', v: 'plain', d: 1,
    title: 'took my first practice test and it was rough',
    body: "scored way below what i wanted. spent a day being upset about it and then my counselor pointed out that a diagnostic is supposed to be bad, thats literally its job.\n\nstarting the error log thing people here recommend. so far most of my math mistakes are not actually math, im misreading what the question asks for. which is annoying but also probably easier to fix than not knowing the content?",
    tags: ['sat', 'starting out'],
  },
  {
    a: 'marcus', c: 'test_prep', v: 'plain', d: 6,
    title: 'Test optional, plainly',
    body: "Here is the rule I give students and it has held up. Look at the middle 50 percent range for admitted students at that specific school. If your score is at or above the 50th percentile, submit. If it is below the 25th, do not. In between, it depends on the rest of your file and whether your school is one where scores still carry weight.\n\nAnd know that test optional is not always test blind. A handful of schools genuinely do not look. Most look if you send.",
    tags: ['test optional'],
  },
  {
    a: 'omar', c: 'test_prep', v: 'stats', d: 10,
    title: 'Timed sections were my whole problem',
    body: "My untimed accuracy was fine. My timed score was not. That is a completely different problem from not knowing the content and I wasted two months reviewing material I already knew.\n\nWhat fixed it: doing sections at ninety percent of the allotted time so real conditions felt slow, and learning to skip aggressively. I now leave two questions per section deliberately and come back. Before, I would sink four minutes into one problem out of stubbornness.",
    stats: [{ n: '2', label: 'questions skipped on purpose per section' }, { n: '90%', label: 'of allotted time in practice' }],
    tags: ['pacing', 'strategy'],
  },
  {
    a: 'rosa', c: 'test_prep', v: 'plain', d: 14,
    title: 'Fee waivers cover more than the test',
    body: "Students know about the SAT fee waiver. Fewer know it also unlocks a set of college application fee waivers, which is where the real money is.\n\nOne of my students last year saved over six hundred dollars in application fees she had budgeted for and nearly did not apply because of. Ask your counselor for the waiver even if you think you might not qualify. The income thresholds are more generous than people assume.",
    tags: ['fee waivers', 'access'],
  },
  {
    a: 'kwame', c: 'test_prep', v: 'plain', d: 20,
    title: 'Studying for the SAT at a school with no AP classes',
    body: "My high school offered no APs and the math sequence stopped before precalculus. The SAT assumes content I had not been taught, and that gap is not an intelligence problem, it is a curriculum problem.\n\nI worked backwards: took a diagnostic, listed every topic I got wrong, and found which ones I had simply never seen. Then I taught myself those from free videos, three topics a week, before doing any timed practice at all.\n\nIf you are in a similar school, do not start with practice tests. Start with the inventory of what was never covered.",
    tags: ['rural', 'self study'],
  },
  {
    a: 'ben', c: 'test_prep', v: 'plain', d: 24,
    title: 'retook it and went up 90 points, what changed',
    body: "honestly not much studying between attempts. what changed was that i had already sat through the whole thing once so the length didnt wreck me in the last section.\n\nfirst time i was completely fried by the end. second time i knew what fried felt like and paced for it. if you can afford the retake, or get the waiver, the second one is usually better just from that.",
    tags: ['retake'],
  },
];

// A believable, stable ordering. Newest first, matching how the feed sorts.
export const SAMPLE_POSTS_SORTED = [...SAMPLE_POSTS].sort((x, y) => (x.d ?? 0) - (y.d ?? 0));
