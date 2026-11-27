// What to do, and when, from ninth grade to twelfth.
//
// This is general guidance that holds for most US students. Individual
// deadlines belong to individual colleges, so every date here is described as
// typical and the planner tells students to confirm with each school.
//
// `plan` on a step means the in-app planner can add it to a student's own
// checklist. `month` and `day` place it on the calendar of that school year
// (months are 1 to 12; anything from August to December belongs to the fall
// the grade starts in, anything from January to July to the spring after).

export const GRADES = [
  {
    id: '9',
    label: '9th grade',
    short: '9th',
    headline: 'Start well. Nothing else is due yet.',
    intro: 'Freshman grades count toward your GPA, and that is the only part of college admissions that has started. The rest of this year is for finding out what you like.',
    seasons: [
      { when: 'Fall', steps: [
        { text: 'Take classes that stretch you without sinking you. A B in a harder class usually reads better than an A in an easier one, but not if it costs you every other grade.' },
        { text: 'Try a few clubs, a sport, or a job. You are sampling, not committing.' },
        { text: 'Introduce yourself to your school counselor once, even if you have nothing to ask.', plan: { title: 'Meet my school counselor', category: 'school', month: 10, day: 15 } },
      ] },
      { when: 'Winter and spring', steps: [
        { text: 'Plan next year’s classes with all four years in mind, especially math and world language, where each class unlocks the next.', plan: { title: 'Pick 10th grade classes with a four-year plan', category: 'school', month: 2, day: 15 } },
        { text: 'Start a running list of what you do: activities, hours, awards, jobs. You will be asked for it in three years and will not remember.', plan: { title: 'Start a list of activities and hours', category: 'school', month: 3, day: 1 } },
      ] },
      { when: 'Summer', steps: [
        { text: 'Do one thing with a beginning and an end: a job, a class, a project, a set number of volunteer hours.' },
        { text: 'Read something nobody assigned.' },
      ] },
    ],
  },
  {
    id: '10',
    label: '10th grade',
    short: '10th',
    headline: 'Go deeper on what stuck.',
    intro: 'Colleges would rather see two or three things you kept showing up for than ten you joined once.',
    seasons: [
      { when: 'Fall', steps: [
        { text: 'Take the PSAT if your school offers it to sophomores. It is practice only and nothing is sent to colleges.', plan: { title: 'Take the PSAT for practice', category: 'testing', month: 10, day: 15 } },
        { text: 'Narrow your activities to the ones you actually care about, and take on a little more in them.' },
      ] },
      { when: 'Winter and spring', steps: [
        { text: 'Choose junior-year classes carefully. It is the last full year colleges see, so take AP, IB or dual enrollment where you are strong.', plan: { title: 'Choose 11th grade classes', category: 'school', month: 2, day: 15 } },
        { text: 'Notice which subjects you would keep doing if nobody graded them. That is the start of a major.' },
      ] },
      { when: 'Summer', steps: [
        { text: 'Walk around a college campus near you, any campus, just to learn what one feels like.', plan: { title: 'Visit a nearby college campus', category: 'visits', month: 7, day: 1 } },
        { text: 'Work, volunteer, or build something. Depth beats variety.' },
      ] },
    ],
  },
  {
    id: '11',
    label: '11th grade',
    short: '11th',
    headline: 'The year that does the most work.',
    intro: 'Junior year is when the list, the tests and the recommenders all get decided. Spread it out and none of it is hard.',
    seasons: [
      { when: 'Fall', steps: [
        { text: 'Take the PSAT/NMSQT in October. This is the one that counts for National Merit.', plan: { title: 'Take the PSAT/NMSQT', category: 'testing', month: 10, day: 15 } },
        { text: 'Keep your grades steady. An upward trend this year helps more than almost anything else.' },
      ] },
      { when: 'Winter', steps: [
        { text: 'Make a testing plan. Most students take the SAT or ACT in spring and once more in early fall.', plan: { title: 'Register for a spring SAT or ACT', category: 'testing', month: 1, day: 20 } },
        { text: 'Start a college list of fifteen or twenty, then run the net price calculator on each one. Cut the ones your family cannot afford before you get attached.', plan: { title: 'Run net price calculators on my list', category: 'money', month: 2, day: 1 } },
      ] },
      { when: 'Spring', steps: [
        { text: 'Take the SAT or ACT. AP exams are in May.', plan: { title: 'Take the SAT or ACT', category: 'testing', month: 3, day: 15 } },
        { text: 'Ask two teachers for recommendation letters before the year ends, while they still remember your work.', plan: { title: 'Ask two teachers for recommendations', category: 'recs', month: 5, day: 15 } },
        { text: 'Visit campuses over spring break if you can. Virtual tours count for getting a feel.', plan: { title: 'Visit or virtually tour three colleges', category: 'visits', month: 4, day: 1 } },
      ] },
      { when: 'Summer', steps: [
        { text: 'Write a first draft of your personal statement. A bad draft in June makes everything in the fall easier.', plan: { title: 'Draft my personal statement', category: 'essays', month: 7, day: 1 } },
        { text: 'The Common App opens on August 1. Create your account and fill in the parts that are just facts.', plan: { title: 'Create my Common App account', category: 'applications', month: 8, day: 1 } },
        { text: 'Cut your list to about eight to twelve schools: some likely, some target, some reach.', plan: { title: 'Narrow my college list to 8 to 12', category: 'applications', month: 7, day: 20 } },
      ] },
    ],
  },
  {
    id: '12',
    label: '12th grade',
    short: '12th',
    headline: 'Send it, then compare the offers.',
    intro: 'Most of senior fall is paperwork with deadlines. Put the dates somewhere you will see them.',
    seasons: [
      { when: 'Fall', steps: [
        { text: 'File the FAFSA as soon as it opens, usually October 1, and the CSS Profile if any of your schools require it.', plan: { title: 'File the FAFSA', category: 'money', month: 10, day: 1 } },
        { text: 'Early Decision and Early Action deadlines are typically November 1 or 15. Confirm each one on the college’s own site.', plan: { title: 'Submit early applications (ED or EA)', category: 'applications', month: 11, day: 1 } },
        { text: 'Give your recommenders and counselor your final list and deadlines, and send test scores where you are using them.', plan: { title: 'Send deadlines to my recommenders', category: 'recs', month: 9, day: 15 } },
        { text: 'Finish your personal statement and start the supplements. Read each one aloud once before you send it.', plan: { title: 'Finish personal statement and supplements', category: 'essays', month: 10, day: 15 } },
      ] },
      { when: 'Winter', steps: [
        { text: 'Regular Decision deadlines mostly fall between January 1 and 15.', plan: { title: 'Submit regular decision applications', category: 'applications', month: 1, day: 1 } },
        { text: 'Apply for local scholarships. They are smaller, and far fewer people apply.', plan: { title: 'Apply for three local scholarships', category: 'money', month: 2, day: 1 } },
        { text: 'Keep your grades up. Colleges see your mid-year report and can withdraw an offer.' },
      ] },
      { when: 'Spring', steps: [
        { text: 'Decisions arrive by early April. Compare aid offers by net price, not by the size of the scholarship.', plan: { title: 'Compare aid offers by net price', category: 'money', month: 4, day: 5 } },
        { text: 'If an offer comes in short, appeal it. It costs one polite letter.' },
        { text: 'Choose a college and pay the deposit by May 1.', plan: { title: 'Commit and pay my deposit', category: 'applications', month: 5, day: 1 } },
      ] },
      { when: 'Summer', steps: [
        { text: 'Sign up for orientation and housing, and make sure your final transcript is sent.', plan: { title: 'Register for orientation and housing', category: 'school', month: 6, day: 15 } },
      ] },
    ],
  },
];

export function gradeById(id) {
  return GRADES.find((g) => g.id === String(id)) || GRADES[2];
}
