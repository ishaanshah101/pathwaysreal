// The words everyone assumes you already know.
//
// Each entry is written to be understood by a ninth grader whose family has
// never been through this, and each is checked against how the term is used by
// colleges and by studentaid.gov. Where a rule differs from school to school,
// the entry says so instead of pretending there is one answer.
//
// `group` decides which section it sits in. `aka` lists the other names and
// abbreviations people use, so search finds it either way.

export const GLOSSARY_GROUPS = [
  { id: 'applying', label: 'Applying', sign: 'green' },
  { id: 'paying', label: 'Paying for it', sign: 'yellow' },
  { id: 'classes', label: 'Classes and tests', sign: 'blue' },
  { id: 'college', label: 'Once you are there', sign: 'brown' },
];

export const GLOSSARY = [
  // ---- Applying ----------------------------------------------------------
  { group: 'applying', term: 'Common App', aka: ['Common Application'], def: 'One online application accepted by more than a thousand colleges. You enter your details, activities and main essay once, then send it to each school on your list. Many schools add a few questions of their own.' },
  { group: 'applying', term: 'Coalition Application', aka: ['Scoir'], def: 'Another shared application, like the Common App, accepted by a smaller group of colleges. A school that takes both does not prefer one over the other.' },
  { group: 'applying', term: 'Early Decision', aka: ['ED', 'ED I', 'ED II'], def: 'You apply early, usually by November 1 or 15, and hear back in December. It is binding: if you are admitted you agree to attend and withdraw your other applications. Use it only for a clear first choice whose price will work for your family.' },
  { group: 'applying', term: 'Early Action', aka: ['EA'], def: 'You apply early and hear back early, but it is not binding. You still have until May 1 to decide, and you can compare aid offers from every school that admits you.' },
  { group: 'applying', term: 'Restrictive Early Action', aka: ['REA', 'Single-Choice Early Action', 'SCEA'], def: 'Early Action with a condition: you agree not to apply early to other private colleges. It is still not binding, so you are free to say no.' },
  { group: 'applying', term: 'Regular Decision', aka: ['RD'], def: 'The standard deadline, usually between January 1 and January 15. Decisions arrive by late March or early April.' },
  { group: 'applying', term: 'Rolling admission', aka: ['rolling'], def: 'The college reads applications as they arrive and answers within a few weeks, until the class is full. Applying earlier gives you better odds and more aid.' },
  { group: 'applying', term: 'Deferred', aka: ['deferral'], def: 'You applied early and the college moved your application into the regular round instead of deciding now. It is not a rejection. Send your new grades and a short update if the school invites one.' },
  { group: 'applying', term: 'Waitlist', aka: ['waitlisted'], def: 'The college may admit you later if spots open up, usually after May 1. Accept a place at another school in the meantime, because many waitlists never move.' },
  { group: 'applying', term: 'Personal statement', aka: ['college essay', 'Common App essay'], def: 'The main application essay, up to 650 words on the Common App, which goes to every school you apply to. It is the one part of the application that is entirely in your voice.' },
  { group: 'applying', term: 'Supplemental essay', aka: ['supplement', 'supplementals'], def: 'Extra short essays an individual college asks for on top of your personal statement. The most common one is some version of “Why this school?”' },
  { group: 'applying', term: 'Letter of recommendation', aka: ['rec letter', 'recommendation', 'LOR'], def: 'A letter from a teacher or counselor describing you as a student. Ask at least a month before your first deadline, and ask teachers who know your work well, not only the ones who gave you the highest grade.' },
  { group: 'applying', term: 'Transcript', aka: [], def: 'The official record of every class you took in high school and the grade you earned. Your school sends it to colleges directly.' },
  { group: 'applying', term: 'Holistic review', aka: ['holistic admissions'], def: 'The college reads your whole application, including essays, activities, recommendations and context, instead of admitting by a formula of grades and scores.' },
  { group: 'applying', term: 'Demonstrated interest', aka: [], def: 'Signs that you actually want to attend, such as visiting, going to an info session, or opening the college’s emails. Some colleges track it and many do not. Each school’s admissions site usually says which.' },
  { group: 'applying', term: 'Test-optional', aka: [], def: 'You choose whether to send SAT or ACT scores. If you do not send them, your application is read without them and is not penalized for it.' },
  { group: 'applying', term: 'Test-blind', aka: ['test-free'], def: 'The college will not look at SAT or ACT scores even if you send them. The University of California is one example.' },
  { group: 'applying', term: 'Superscore', aka: ['superscoring'], def: 'When a college takes your best section scores from different test dates and combines them into your highest possible total.' },
  { group: 'applying', term: 'Fee waiver', aka: ['application fee waiver'], def: 'Lets you skip an application or testing fee when paying it would be a hardship. The Common App has one built in, and your school counselor can help you qualify.' },
  { group: 'applying', term: 'First-generation', aka: ['first-gen'], def: 'Generally, a student whose parents did not finish a four-year college degree. The exact definition varies by college, and many schools have programs and scholarships set aside for first-gen students.' },
  { group: 'applying', term: 'Legacy', aka: ['legacy admissions'], def: 'An applicant whose parent, and sometimes another relative, attended the college. Some schools give legacies an edge. A growing number have stopped.' },
  { group: 'applying', term: 'Yield', aka: ['yield rate'], def: 'The share of admitted students who actually enroll. Colleges care about it, which is one reason some of them track demonstrated interest.' },
  { group: 'applying', term: 'QuestBridge', aka: ['National College Match'], def: 'A nonprofit that matches high-achieving students from lower-income families with full four-year scholarships at its partner colleges. The application is due in late September of senior year.' },

  // ---- Paying -------------------------------------------------------------
  { group: 'paying', term: 'FAFSA', aka: ['Free Application for Federal Student Aid'], def: 'The form that unlocks federal grants, loans and work-study, and most state and college aid too. It is free at studentaid.gov and usually opens on October 1 for the following school year. File it even if you think your family earns too much.' },
  { group: 'paying', term: 'CSS Profile', aka: ['CSS', 'Profile'], def: 'A second, more detailed aid form run by the College Board. A few hundred mostly private colleges require it before they award their own money. There is a fee, and it is waived for many lower-income families.' },
  { group: 'paying', term: 'Student Aid Index', aka: ['SAI', 'EFC', 'Expected Family Contribution'], def: 'The number the FAFSA produces to measure how much your family can put toward college. A lower number means more financial need. It replaced the Expected Family Contribution, or EFC, in 2024.' },
  { group: 'paying', term: 'Cost of attendance', aka: ['COA', 'sticker price'], def: 'The college’s full estimate for one year: tuition, fees, housing, food, books, travel and personal costs. Very few students pay this number.' },
  { group: 'paying', term: 'Net price', aka: [], def: 'What you actually pay for a year after grants and scholarships are subtracted from the cost of attendance. This is the number to compare between schools.' },
  { group: 'paying', term: 'Net price calculator', aka: ['NPC'], def: 'A tool on every college’s website that estimates your net price from your family’s finances. It takes about fifteen minutes and is the fastest way to find out whether a school is in reach.' },
  { group: 'paying', term: 'Need-based aid', aka: [], def: 'Money awarded because of your family’s finances, as measured by the FAFSA and sometimes the CSS Profile.' },
  { group: 'paying', term: 'Merit aid', aka: ['merit scholarship'], def: 'Scholarships awarded for grades, test scores, talent or leadership, regardless of what your family earns.' },
  { group: 'paying', term: 'Need-blind', aka: [], def: 'The admissions office does not consider whether you can pay when it decides whether to admit you.' },
  { group: 'paying', term: 'Need-aware', aka: ['need-sensitive'], def: 'Your ability to pay can be a factor in the decision for some applicants, often those considered near the end of the process.' },
  { group: 'paying', term: 'Meets full need', aka: ['100% of demonstrated need'], def: 'The college promises to cover the gap between its cost and what the aid formulas say your family can pay. Check whether the package uses loans to do it, because some schools do and some do not.' },
  { group: 'paying', term: 'Grant', aka: [], def: 'Money for college that you do not pay back, usually awarded based on need.' },
  { group: 'paying', term: 'Pell Grant', aka: ['Federal Pell Grant'], def: 'The main federal grant for students from lower-income families. You apply through the FAFSA and never repay it.' },
  { group: 'paying', term: 'Scholarship', aka: [], def: 'Money you do not pay back, from colleges, companies, community groups or foundations. Local scholarships get far fewer applicants than national ones.' },
  { group: 'paying', term: 'Work-study', aka: ['Federal Work-Study'], def: 'A federal program that funds part-time jobs for students with financial need, usually on campus. You are paid as you work, so it does not come off your bill up front.' },
  { group: 'paying', term: 'Subsidized loan', aka: ['Direct Subsidized Loan'], def: 'A federal student loan, based on need, where the government pays the interest while you are in school at least half time.' },
  { group: 'paying', term: 'Unsubsidized loan', aka: ['Direct Unsubsidized Loan'], def: 'A federal student loan that is not based on need. Interest starts adding up as soon as the money is paid out.' },
  { group: 'paying', term: 'Aid offer', aka: ['award letter', 'financial aid package'], def: 'The letter listing the aid a college is offering you. Separate the grants and scholarships, which are free, from the loans, which are not, before you compare schools.' },
  { group: 'paying', term: 'Aid appeal', aka: ['professional judgment', 'financial aid appeal'], def: 'Asking the financial aid office to reconsider your offer because your family’s situation changed or the forms missed something, such as a job loss or medical bills. It costs one polite letter.' },
  { group: 'paying', term: 'In-state tuition', aka: ['resident tuition'], def: 'The lower price a public university charges residents of its own state. Out-of-state students at the same school can pay two or three times as much.' },

  // ---- Classes and tests --------------------------------------------------
  { group: 'classes', term: 'GPA', aka: ['grade point average', 'weighted GPA', 'unweighted GPA'], def: 'Your grade point average. Unweighted is on a 4.0 scale. Weighted gives extra points for harder classes such as AP, IB or honors, so it can go above 4.0.' },
  { group: 'classes', term: 'Class rank', aka: [], def: 'Where your GPA sits compared with everyone in your grade. Many high schools no longer report it.' },
  { group: 'classes', term: 'AP', aka: ['Advanced Placement'], def: 'College-level classes taught in high school, each with an exam in May scored from 1 to 5. Many colleges give credit or let you skip an intro class for a 3 or higher, and selective ones often want a 4 or 5.' },
  { group: 'classes', term: 'IB', aka: ['International Baccalaureate'], def: 'A two-year program of advanced classes with its own exams, scored from 1 to 7. Offered at some high schools in place of, or alongside, AP.' },
  { group: 'classes', term: 'Dual enrollment', aka: ['concurrent enrollment'], def: 'Taking a real college class, often at a community college, while you are still in high school. It can count toward both your diploma and a future degree.' },
  { group: 'classes', term: 'Honors class', aka: [], def: 'A more demanding version of a standard high school class. It shows colleges you chose the harder option when one was available.' },
  { group: 'classes', term: 'SAT', aka: [], def: 'A college admissions test taken on a computer. It has two sections, Reading and Writing, and Math, each scored from 200 to 800 for a total between 400 and 1600.' },
  { group: 'classes', term: 'ACT', aka: [], def: 'A college admissions test scored from 1 to 36, covering English, math and reading, with optional science and writing sections. Colleges accept the SAT and ACT equally.' },
  { group: 'classes', term: 'PSAT/NMSQT', aka: ['PSAT', 'National Merit'], def: 'A practice SAT given in October. Your junior-year score is also what enters you in the National Merit Scholarship Program.' },
  { group: 'classes', term: 'Prerequisite', aka: ['prereq'], def: 'A class you must pass before you are allowed to take the next one, such as Algebra 2 before Precalculus.' },

  // ---- Once you are there -------------------------------------------------
  { group: 'college', term: 'Major', aka: [], def: 'The subject you specialize in and earn your degree in. At most colleges you do not have to choose until the end of your second year.' },
  { group: 'college', term: 'Minor', aka: [], def: 'A smaller set of classes in a second subject, usually five or six courses.' },
  { group: 'college', term: 'Undeclared', aka: ['undecided'], def: 'Starting college without a major. It is common and usually fine, except in programs like engineering or nursing where you often have to apply to the major up front.' },
  { group: 'college', term: 'Credit hour', aka: ['credit', 'unit'], def: 'The unit colleges use to count coursework. Most classes are three or four credits, and a bachelor’s degree usually takes about 120.' },
  { group: 'college', term: 'Liberal arts college', aka: [], def: 'A small college focused on undergraduates, with small classes and a broad education across subjects. You can still major in the sciences there.' },
  { group: 'college', term: 'Community college', aka: ['junior college', 'two-year college'], def: 'A two-year public college with open admission and low tuition. Many students start there and transfer to a four-year university to finish a bachelor’s degree.' },
  { group: 'college', term: 'Transfer', aka: ['transfer student'], def: 'Moving from one college to another and bringing your credits with you. Starting at a community college and transferring is a well-worn route to a degree.' },
  { group: 'college', term: 'Articulation agreement', aka: [], def: 'A formal agreement spelling out which community college classes a particular university will accept for credit, so you know they will count before you take them.' },
  { group: 'college', term: 'Public university', aka: ['state school'], def: 'A university funded partly by its state. Residents of that state pay much lower tuition than students from elsewhere.' },
  { group: 'college', term: 'Gap year', aka: [], def: 'A year off between high school and college. Many colleges let an admitted student defer for a year if you ask in writing.' },
  { group: 'college', term: 'Decision Day', aka: ['May 1', 'enrollment deposit'], def: 'May 1 is the usual deadline to choose one college and pay its enrollment deposit. Ask the school about a deposit waiver if the cost is a problem.' },
  { group: 'college', term: 'FERPA', aka: [], def: 'The federal law that keeps your education records private. On applications you are asked whether to waive your right to read your recommendation letters, and most students do, because colleges trust confidential letters more.' },
  { group: 'college', term: 'Office hours', aka: [], def: 'Set times each week when a professor is in their office and available to talk. You do not need an appointment or a crisis. You can just go.' },
  { group: 'college', term: 'TRIO', aka: ['Upward Bound', 'Talent Search'], def: 'A group of federal programs, including Upward Bound, that help students from lower-income families and first-generation students get ready for college. Many are free and run through local colleges.' },
];

// A URL-safe id for linking straight to a term.
export function termId(term) {
  return String(term).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}
