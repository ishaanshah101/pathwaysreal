// Sample message threads shown to every signed-in member so the Messages tab
// demonstrates what a real mentor conversation looks like instead of being an
// empty pane. These are read-only: the composer is disabled on a sample thread
// because there is nobody on the other end.
//
// `me` marks a message from the signed-in user's side.

export const SAMPLE_THREADS = [
  {
    key: 'sofia',
    subtitle: 'Essay feedback',
    messages: [
      { me: true, at: '3d', body: "Hi Sofia! I saw your post about the Common App essay. Would you be willing to look at mine? It's about my grandmother's shop too which felt like a weird coincidence." },
      { me: false, at: '3d', body: "Ha, send it over. Fair warning that I will be honest, that is kind of the point of me being here." },
      { me: true, at: '3d', body: "Sent it in the doc link. It's 640 words." },
      { me: false, at: '2d', body: "Okay, read it twice. The middle section where you describe counting the register at close is genuinely good. That is the essay.\n\nThe problem is the first two paragraphs are you explaining that the shop was important before you show me anything. Cut them entirely and start at \"The drawer never balanced on Fridays.\" You lose 90 words and gain the whole thing." },
      { me: true, at: '2d', body: "Oh that's uncomfortable but you're right. What about the ending? I have a paragraph about how this taught me responsibility." },
      { me: false, at: '2d', body: "Cut it. You are telling the reader the lesson they already got. End on the image of your grandmother re-counting it herself without saying anything. That is a better last line than anything you could explain." },
      { me: true, at: '1d', body: "Rewrote it. 512 words now and it feels way sharper. Thank you seriously." },
      { me: false, at: '1d', body: "That is the right length. Do not add anything back in to fill space, the empty room is doing work. Good luck with it." },
    ],
  },
  {
    key: 'marcus',
    subtitle: 'Financial aid question',
    messages: [
      { me: true, at: '5d', body: "Mr. Webb, I got my first aid letter and I don't understand it. It says $32,000 in aid but the school costs $41,000 so I thought I'd only owe $9,000, but there's a line for loans in the aid part?" },
      { me: false, at: '5d', body: "You have found the exact thing I complain about constantly. Yes. Schools list loans inside the aid total, which makes the aid number look bigger than the help actually is.\n\nDo this: write down only the grants and scholarships. Ignore anything with the word loan or work-study. What is that number?" },
      { me: true, at: '5d', body: "Grants and scholarships add up to $19,500." },
      { me: false, at: '5d', body: "Then your real cost is $21,500 a year, not $9,000. That is the number to make a decision on.\n\nNow, is this your first choice school? Because if it is, that sentence in an appeal letter matters more than people think." },
      { me: true, at: '4d', body: "It is my first choice. Is appealing rude? I feel weird asking for more." },
      { me: false, at: '4d', body: "It is not rude, it is a normal administrative process with a form and a staff. Nobody is offended.\n\nSend it to financial aid, not admissions. State what the FAFSA did not capture. Did anything change since you filed? Job change, medical bills, someone else in college now?" },
      { me: true, at: '4d', body: "My mom's hours got cut in January, after we filed in December." },
      { me: false, at: '4d', body: "That is exactly what professional judgment review exists for. Get a letter from her employer stating the reduction and the date. Attach it. Keep the email to four short paragraphs.\n\nSend me the draft before you submit it." },
    ],
  },
  {
    key: 'priya',
    subtitle: 'Cold emailing labs',
    messages: [
      { me: true, at: '8d', body: "I used your template and emailed 12 professors two weeks ago. Zero replies. Am I doing something wrong or is 12 just not enough?" },
      { me: false, at: '8d', body: "Twelve is not enough, but let me check the other thing first. Can you paste one of the emails you sent?" },
      { me: true, at: '8d', body: "[pasted]" },
      { me: false, at: '7d', body: "Okay, two problems and they are fixable.\n\nOne, your subject line is \"Research Opportunity Inquiry.\" That reads like a mass email and it is. Make it a specific question about their specific paper.\n\nTwo, you say you are interested in their research broadly. Which paper? Name it and say the thing that confused you. That single detail is what proves you are not sending forty identical emails, even though you are." },
      { me: true, at: '7d', body: "That's fair. Do I need to actually understand the paper? Most of them are way over my head." },
      { me: false, at: '7d', body: "No, and pretending to is worse. Read the abstract and the figures. Ask about a figure. \"I did not understand why the effect in Figure 3 drops off after week six\" is a great question and it is honest about your level.\n\nProfessors like teaching. That is literally the job." },
      { me: true, at: '6d', body: "Ok sending 20 more this weekend with real questions." },
      { me: false, at: '6d', body: "Good. Expect a lot of silence, it is not personal, their inboxes are catastrophic. One yes is all you need." },
    ],
  },
  {
    key: 'alice',
    subtitle: 'Undecided and panicking',
    messages: [
      { me: true, at: '11d', body: "Dr. Nkemdi, everyone in my class already knows what they want to do and I have no idea. Is it actually okay to apply undecided or does that hurt me?" },
      { me: false, at: '11d', body: "At most schools it does not hurt you at all, and at some it helps, because undecided students are easier to place across departments.\n\nThe exceptions are worth knowing: direct-admit programs like nursing, some engineering schools, and BFA programs. Those you generally have to apply into.\n\nWhat are you actually torn between? Not what sounds good. What do you find yourself reading about when nobody assigned it?" },
      { me: true, at: '11d', body: "Honestly? Weird stuff about how diseases spread. But I'm not good at math and I assume that rules out anything science." },
      { me: false, at: '10d', body: "That is epidemiology and you have just described it precisely.\n\nAlso, \"not good at math\" at seventeen usually means \"was taught math badly\" or \"has not yet needed math for something I cared about.\" The statistics you would need for this is not calculus, and people learn it fine when it is attached to a question they want answered.\n\nDo not close a door based on a course you took at fifteen." },
      { me: true, at: '10d', body: "That's kind of a lot to think about. Thank you." },
      { me: false, at: '10d', body: "Apply undecided, take an intro stats course and an intro bio course in your first year, and decide with information instead of anxiety. You are not behind." },
    ],
  },
  {
    key: 'james',
    subtitle: 'Transfer path',
    messages: [
      { me: true, at: '14d', body: "My parents think going to community college first means I'm giving up. You transferred to Stanford so I wanted to ask if that's true." },
      { me: false, at: '14d', body: "It is not true, but I understand why it feels that way, and I had the identical argument at my kitchen table.\n\nThe practical case: at a community college I paid almost nothing for two years of the same intro coursework, got small classes, and had professors who actually knew me and wrote real letters. Then I transferred with a college GPA that mattered more than my high school record ever would have." },
      { me: true, at: '13d', body: "Did you have a plan from the start or did it just work out?" },
      { me: false, at: '13d', body: "Half and half. What I did right was finding the articulation agreement early. In California it is ASSIST, most states have an equivalent. It tells you exactly which courses transfer to which university and for what credit.\n\nWhat I did wrong was waiting until my third semester to look at it, and taking two courses that did not transfer. That cost me a summer." },
      { me: true, at: '13d', body: "So look up the articulation agreement before picking classes at all." },
      { me: false, at: '12d', body: "Before your first registration. And meet the transfer advisor at the community college in your first month, they are usually underused and very good.\n\nShow your parents the transfer admit rates at your state flagship for students with an associate degree. At a lot of schools it is dramatically higher than the freshman rate. That number changed my dad's mind." },
    ],
  },
  {
    key: 'rosa',
    subtitle: 'Local scholarships',
    messages: [
      { me: true, at: '6d', body: "You said local scholarships are worth more than the big ones. How do I even find them? I searched and got a bunch of spam sites." },
      { me: false, at: '6d', body: "Skip the search engines entirely for this. Four places, in order.\n\nOne, your counselor's list. Every school has one and it is usually a Google Doc nobody opens.\nTwo, your county community foundation. Search the county name plus community foundation.\nThree, your parents' employers and any union they belong to.\nFour, local civic groups: Rotary, Elks, Kiwanis, Knights of Columbus, the credit union." },
      { me: true, at: '6d', body: "My mom works at a hospital, would that count?" },
      { me: false, at: '5d', body: "Hospitals very often have employee dependent scholarships and they are among the least competitive money that exists. Have her ask HR directly this week, not the website.\n\nSame for credit unions. If your family banks at one, check. Those awards regularly get five or six applicants." },
      { me: true, at: '5d', body: "Found two through the hospital. One is $2,500 and the deadline is in three weeks." },
      { me: false, at: '5d', body: "Good. Now write one strong 400-word answer to \"why do you deserve this\" and keep it in a document. You will reuse it fifteen times this spring with small edits.\n\nThat is how students end up with eight thousand dollars in local awards. Not luck, just reuse." },
    ],
  },
];
