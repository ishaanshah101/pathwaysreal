// Second batch of sample posts, bringing the feed past a hundred and filling
// out every category from the second wave of community members.

export const SAMPLE_POSTS_EXTRA = [
  // applications
  {
    a: 'wes', c: 'applications', v: 'plain', d: 7,
    title: 'When your school has no college-going culture',
    body: "I cover three rural high schools. At one of them, four students in a graduating class of sixty apply anywhere at all.\n\nIf that is your school, understand that the absence of pressure is a real disadvantage and also that colleges know it. Context matters in reading. A student taking the hardest four courses their school offers is evaluated on that, not on the eleven APs a suburban school offered someone else.\n\nWhat you do have to do is be your own deadline system, because nobody around you is on the same calendar.",
    tags: ['rural', 'context'],
  },
  {
    a: 'jonah', c: 'applications', v: 'plain', d: 11,
    title: 'The gap year made my application better, which was not the plan',
    body: "I did not take a gap year strategically. I got rejected from most of my list and did not want to attend the one that took me.\n\nI worked at a small newspaper for a year, mostly obituaries and town council meetings. When I reapplied I had three hundred published clips and a completely different essay, and got into schools that had rejected me flat.\n\nThe thing that changed was not maturity in some vague sense. It was that I could point at work.",
    tags: ['gap year', 'reapplying'],
  },
  {
    a: 'peter', c: 'applications', v: 'plain', d: 19,
    title: 'Applying as a veteran at twenty-five',
    body: "Different process almost entirely. My high school transcript was barely looked at. What mattered was my service record, two community college courses I took while enlisted, and an essay about why now.\n\nPractical notes: the Yellow Ribbon program covers the gap between the GI Bill and private tuition at participating schools, and the list of participants changes yearly. Check the current one, not a forum post from 2019.\n\nAlso find out whether the school has a veterans' resource center with actual staff. It is the difference between a smooth first semester and fighting the registrar alone.",
    tags: ['veterans', 'nontraditional'],
  },
  {
    a: 'grace', c: 'applications', v: 'plain', d: 25,
    title: 'What a full-ride scholarship interview weekend is actually testing',
    body: "Robertson finalist weekend was three days and I went in thinking it was an academic evaluation. It was not, or not mostly.\n\nThey put forty finalists together and watch how you behave over seventy-two hours. Who listens. Who is generous with airtime. Who is different in the formal interview than at breakfast.\n\nThe students who did not advance were often the most obviously impressive on paper. Consistency across settings is the thing. You cannot perform that for three days, which is presumably the point.",
    tags: ['scholarship interviews'],
  },

  // essays
  {
    a: 'camille', c: 'essays', v: 'checklist', d: 5,
    title: 'Cuts I make in almost every first draft',
    body: "I have read something like four thousand personal statements. My editing is ninety percent deletion, and it is nearly always the same five things.",
    items: [
      'The throat-clearing opening paragraph, which announces the theme before showing anything',
      'Every sentence that tells the reader how to feel about what just happened',
      'The second example, which is almost always weaker than the first and dilutes it',
      'The forward-looking final line about how you will bring this to their campus',
      'Any sentence containing the phrase "little did I know"',
    ],
    tags: ['editing'],
  },
  {
    a: 'camille', c: 'essays', v: 'plain', d: 16,
    title: 'Humor in an essay, and the specific way it fails',
    body: "Funny essays work when the humor is a byproduct of precise observation. They fail when the student is performing being funny, because the reader can feel the effort and effort is the opposite of funny.\n\nA useful test: read it to someone who does not love you. If they smile once in the middle rather than at a punchline you engineered, you are fine. If nobody smiles anywhere and you thought three parts were hilarious, cut the jokes and keep the observations. The observations were doing the work.",
    tags: ['tone', 'humor'],
  },
  {
    a: 'lena', c: 'essays', v: 'plain', d: 26,
    title: 'The transfer essay is a different genre',
    body: "Transferring after freshman year meant writing an essay about why I was leaving, which is a trap. Every draft where I criticized my first school read as though I was the problem.\n\nWhat worked was framing forward. Two sentences on what I learned about myself, then the rest on the specific program, courses, and field station I wanted access to. No complaints at all, even true ones.\n\nReaders are asking one question: will this person leave again. Answer that.",
    tags: ['transfer'],
  },

  // scholarships
  {
    a: 'tasha', c: 'scholarships', v: 'plain', d: 3,
    title: 'Aid for foster youth that nobody tells you exists',
    body: "I aged out of care at eighteen and found out about most of this by accident, years too late for some of it.\n\nFederal: you are automatically an independent student on the FAFSA, which usually means a much lower expected contribution. Many states have tuition waivers for former foster youth at public institutions, and the eligibility windows are strict about age.\n\nThere are also dedicated scholarships with tiny applicant pools. Search your state name plus foster youth tuition waiver tonight. If you are in care now, ask your caseworker to put it in your transition plan in writing.",
    tags: ['foster youth', 'access'],
  },
  {
    a: 'malik', c: 'scholarships', v: 'plain', d: 9,
    title: 'The scholarship you lose in sophomore year',
    body: "I work with students after they enroll, and the most painful conversations are about renewal.\n\nMost merit scholarships require a GPA, often 3.0 or 3.25, checked annually. Students have a hard first year, dip below, and discover in June that next year's award is gone. Sometimes there is a one-semester probation, sometimes not.\n\nKnow your number the week you accept the award. Then treat the semester you are struggling as an emergency in November, when you can still withdraw from a course, not in May.",
    tags: ['renewal', 'persistence'],
  },
  {
    a: 'grace', c: 'scholarships', v: 'plain', d: 22,
    title: 'Merit aid is a discount, and you can shop it',
    body: "Private colleges publish a sticker price almost nobody pays. Merit aid is the discount, and how much they offer depends on how much they want you relative to their class.\n\nThe practical consequence: a school slightly below your academic profile will often pay you more than your reach school. That is not a consolation prize, it is a real financial instrument.\n\nApply to at least two schools where your stats are comfortably above the median specifically to generate leverage and options. Students skip this and end up with one expensive choice.",
    tags: ['merit aid', 'strategy'],
  },

  // majors
  {
    a: 'samuel', c: 'majors', v: 'quote', d: 4,
    title: 'To everyone who thinks they are behind in computer science',
    body: "I teach the intro course to about four hundred students a year. Every semester, a large number of them believe everyone else has been programming since they were eleven.\n\nSome have. It matters much less than they fear, and the advantage is usually gone by the second course. What actually predicts who does well is whether a student is willing to sit with a broken thing for forty minutes without concluding they are stupid.\n\nThat is a habit, not a talent, and it can be built at eighteen as easily as at eleven.",
    quote: 'What predicts success is sitting with a broken thing for forty minutes without concluding you are stupid.',
    tags: ['computer science', 'imposter syndrome'],
  },
  {
    a: 'raj', c: 'majors', v: 'checklist', d: 12,
    title: 'The engineering four-year plan, and why switching late hurts',
    body: "I advise engineering students and I spend most of my time on scheduling math. If you are considering engineering, understand the structure before you arrive.",
    items: [
      'Calculus placement in your first semester sets your entire sequence. Being one course behind cascades for three years.',
      'Most upper-division courses run once a year, not every semester. Miss one and you wait twelve months.',
      'Switching between engineering disciplines in year one is usually free. In year three it is rarely free.',
      'Switching out of engineering is almost always easy. Switching in after sophomore year often is not.',
      'Take the intro-to-discipline seminar if your school offers it. It is the cheapest way to find out you hate it.',
    ],
    tags: ['engineering', 'scheduling'],
  },
  {
    a: 'sophie', c: 'majors', v: 'plain', d: 17,
    title: 'Being one of nine women in an engineering cohort',
    body: "Petroleum engineering at Mines. I want to be accurate rather than either bleak or falsely upbeat.\n\nThe overt hostility I was warned about mostly did not happen. What did happen was quieter: being assumed to be the note-taker in group projects, having a correct answer restated by someone else and heard the second time, and the loneliness of not having anyone to sit with who shared the experience.\n\nWhat helped was finding the SWE chapter in week two and one faculty mentor. Not for support in a soft sense. For the practical business of having someone who would vouch for me.",
    tags: ['women in engineering', 'representation'],
  },
  {
    a: 'lena', c: 'majors', v: 'plain', d: 27,
    title: 'I picked the wrong major and leaving was cheap',
    body: "I went in certain about marine biology, took the intro sequence, and discovered I liked the idea of it far more than the actual work, which was substantially more chemistry and statistics than ocean.\n\nHere is the part I want people to hear: I switched, and then later transferred schools, and I lost one semester total. One. I had spent months treating the decision as irreversible and catastrophic.\n\nIt is a course schedule. It is not a life sentence.",
    tags: ['switching majors'],
  },

  // campus life
  {
    a: 'aisha', c: 'campus_life', v: 'stats', d: 6,
    title: 'Commuting an hour each way to save money',
    body: "Living at home saves me about eighteen thousand dollars a year and costs me roughly ten hours a week and most of campus social life. That is the honest trade and I would still take it.\n\nWhat made it survivable: stacking classes into four days, treating the train as real study time rather than dead time, and deliberately joining two clubs that met right after class so I had a reason to stay. Without that last one I would have been a stranger at my own school.",
    stats: [{ n: '$18k', label: 'saved per year' }, { n: '10 hrs', label: 'a week on trains' }],
    tags: ['commuting', 'saving money'],
  },
  {
    a: 'malik', c: 'campus_life', v: 'plain', d: 15,
    title: 'The first bad grade is the dangerous moment',
    body: "I work with students in their first two years and there is a specific pattern I see over and over.\n\nA student gets a bad grade on a first midterm. They feel like a fraud. They stop going to that class because walking in feels bad. Missing class makes the next grade worse. By week ten it is unrecoverable and they have told nobody.\n\nThe intervention is embarrassingly simple: go to the professor within a week of the bad grade. Not to argue. To ask what to do differently. Almost nobody does this and it works almost every time.",
    tags: ['struggling', 'first year'],
  },
  {
    a: 'peter', c: 'campus_life', v: 'plain', d: 28,
    title: 'Being twenty-five in a freshman dorm, briefly',
    body: "I did not live in the dorm, which I recommend for anyone coming in older. The gap between twenty-five and eighteen is not enormous in principle and is enormous in practice at eleven on a Tuesday night.\n\nWhat worked was finding the other nontraditional students, who exist at every school and are usually invisible. Veterans' center, adult learner office, or just the people in the back row who are visibly not seventeen.\n\nYou will also find that professors treat you differently, in a good way. Use it.",
    tags: ['nontraditional', 'veterans'],
  },

  // internships
  {
    a: 'divya', c: 'internships', v: 'stats', d: 8,
    title: 'Three co-ops later, was graduating late worth it',
    body: "Yes, and I want to show the arithmetic rather than assert it.\n\nI graduate one semester later than a four-year track. In exchange I have eighteen months of full-time experience, two industries to compare, and a return offer in hand before senior year. My starting salary is meaningfully higher than classmates with two summer internships, and I did not spend senior fall applying.\n\nThe cost was real: I was on a different calendar from my friends for two years and it was isolating at times.",
    stats: [{ n: '18', label: 'months of full-time experience' }, { n: '1', label: 'extra semester' }],
    tags: ['co-op', 'northeastern'],
  },
  {
    a: 'connor', c: 'internships', v: 'plain', d: 13,
    title: 'applying to an apprenticeship and college at the same time',
    body: "the electrical apprenticeship application had an aptitude test and an interview, and honestly the interview was harder than any college thing ive done. they ask you very directly why you want this and they can tell if youre using it as a backup.\n\nthe math on it: four years earning while training, no debt, journeyman wage at the end. versus four years of tuition. im still applying to two state schools but im not treating the apprenticeship as the lesser option anymore.",
    tags: ['apprenticeship', 'trades'],
  },
  {
    a: 'divya', c: 'internships', v: 'plain', d: 23,
    title: 'What to do when your internship has no work for you',
    body: "My first co-op, I had about two hours of assigned work a day for the first three weeks. I sat there feeling useless and did not say anything because I thought asking for work would look bad.\n\nWhat I should have done, and did on the second one: ask your manager for a standing fifteen minutes weekly, and come with a proposal rather than a complaint. \"I noticed the onboarding doc is out of date, can I rewrite it\" is a much better sentence than \"I do not have enough to do.\"\n\nThat rewritten doc got mentioned in my review.",
    tags: ['first internship'],
  },

  // careers
  {
    a: 'samuel', c: 'careers', v: 'plain', d: 10,
    title: 'You do not need to be a genius to work in software',
    body: "The industry mythologizes brilliance and it puts off a lot of people who would be good at this.\n\nMost professional software work is reading someone else's code, understanding a system that nobody fully understands, and making a small careful change without breaking things. That is a craft. It rewards patience, communication, and a tolerance for ambiguity far more than it rewards raw cleverness.\n\nThe people I have seen do best were not the fastest students. They were the ones who wrote clearly and asked good questions.",
    tags: ['software', 'myths'],
  },
  {
    a: 'sophie', c: 'careers', v: 'plain', d: 18,
    title: 'Choosing an industry that might not exist in thirty years',
    body: "Petroleum engineering. People ask me about this constantly and it is a fair question.\n\nMy answer: the core training is thermodynamics, fluid mechanics, subsurface modelling, and large-scale project management, and those transfer to geothermal, carbon storage, and water. Several of my professors have moved that direction already.\n\nI would be more worried if I had picked a major that was a job title. Pick the one that is a set of transferable physical principles and the job title can change under you.",
    tags: ['energy', 'future proofing'],
  },
  {
    a: 'jonah', c: 'careers', v: 'plain', d: 29,
    title: 'Journalism, honestly',
    body: "The industry has contracted and anyone telling you otherwise is being kind rather than accurate. Entry-level pay is low, the jobs are concentrated in expensive cities, and stability is not a feature.\n\nAnd I would still do it. The parts that are healthy are healthy in a specific way: local nonprofit newsrooms, trade publications that nobody thinks about, and newsletters with real subscriber revenue.\n\nIf you want this, get clips now. Not internships eventually. Clips, this month, from your school paper or a town blog. Nobody in this field asks about your GPA.",
    tags: ['journalism', 'realism'],
  },

  // test prep
  {
    a: 'wes', c: 'test_prep', v: 'plain', d: 21,
    title: 'When your school does not offer the test during the school day',
    body: "Some districts do school-day SAT or ACT administrations for free. Many rural districts do not, which means a Saturday test at a site an hour away, and for a family with one car and a weekend shift, that is a real barrier.\n\nThings that help: ask your counselor whether the district will fund a testing bus, check whether a nearer site opens later in the cycle, and know that the digital SAT has more test dates than the old paper one did.\n\nAnd if it truly is not workable, build a test-optional list. It is a legitimate strategy now, not a fallback.",
    tags: ['access', 'rural'],
  },
  {
    a: 'aisha', c: 'test_prep', v: 'plain', d: 30,
    title: 'Studying for the MCAT while commuting',
    body: "Different test, same principle as everything else on this board: the constraint is not intelligence, it is contiguous time.\n\nI do content review on the train, which is genuinely fine for flashcards and terrible for full-length practice. Full lengths need a quiet room and seven hours, and I could only get that on Sundays at the library.\n\nIf your life is fragmented, split your studying by what tolerates fragmentation. Content review does. Timed practice does not, and doing it badly in twenty-minute chunks taught me nothing.",
    tags: ['mcat', 'commuting'],
  },
];
