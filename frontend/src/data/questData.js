export const QUESTIONS = [
  {
    category: 'AI INTERESTS',
    title: 'What excites you most about AI?',
    description: 'Choose the direction that feels most like you right now.',
    options: [
      { title: 'Building Applications', description: 'I enjoy creating apps and turning ideas into real products.', icon: 'code' },
      { title: 'Automating Tasks', description: 'I like making processes faster and smarter.', icon: 'settings' },
      { title: 'Analyzing Data', description: 'I am curious about data, patterns, and predictions.', icon: 'chart' },
      { title: 'Exploring Creative Ideas', description: 'I enjoy using AI for creative and innovative projects.', icon: 'bulb' },
    ],
  },
  {
    category: 'EXPERIENCE',
    title: 'How would you describe your coding experience?',
    description: 'There is no wrong answer — this helps us tailor your quest.',
    options: [
      { title: 'I am just starting', description: 'I am curious and ready to learn the basics.', icon: 'spark' },
      { title: 'I have followed tutorials', description: 'I understand some fundamentals and want to practise.', icon: 'book' },
      { title: 'I have built projects', description: 'I can turn ideas into working prototypes.', icon: 'code' },
      { title: 'I code confidently', description: 'I am ready for ambitious technical challenges.', icon: 'rocket' },
    ],
  },
  {
    category: 'PROJECT STYLE',
    title: 'What would you love to build?',
    description: 'Pick the kind of project you would be excited to bring to life.',
    options: [
      { title: 'A Digital Product', description: 'A useful web or mobile experience for people.', icon: 'code' },
      { title: 'A Smart Automation', description: 'A tool that removes repetitive work.', icon: 'settings' },
      { title: 'A Data Dashboard', description: 'A visual way to find meaning in information.', icon: 'chart' },
      { title: 'A Creative Experiment', description: 'Something expressive, playful, and unexpected.', icon: 'bulb' },
    ],
  },
  {
    category: 'PROBLEM-SOLVING STYLE',
    title: 'How do you like to solve problems?',
    description: 'Your natural approach helps us shape better recommendations.',
    options: [
      { title: 'Break It Down', description: 'I solve big problems one clear step at a time.', icon: 'layers' },
      { title: 'Explore Possibilities', description: 'I like testing ideas until something clicks.', icon: 'spark' },
      { title: 'Collaborate', description: 'I get my best ideas by working with others.', icon: 'users' },
      { title: 'Learn by Doing', description: 'I understand things best when I build them.', icon: 'rocket' },
    ],
  },
  {
    category: 'LEARNING GOAL',
    title: 'What do you want to achieve this week?',
    description: 'Your goal helps us recommend the right next quest.',
    options: [
      { title: 'Build my first AI project', description: 'I want to turn an idea into something real.', icon: 'rocket' },
      { title: 'Understand AI tools', description: 'I want a practical map of what to use and when.', icon: 'book' },
      { title: 'Improve my problem-solving', description: 'I want to become more confident with challenges.', icon: 'layers' },
      { title: 'Share my work', description: 'I want to make and show something I am proud of.', icon: 'spark' },
    ],
  },
];

export const IDENTITY_DEFINITIONS = {
  'AI Problem Solver': {
    description: 'Turns complex challenges into clear, useful solutions.',
    strengths: ['Structured thinking', 'Rapid prototyping', 'Practical decisions'],
    starterProject: 'A campus helpdesk assistant that routes student questions.',
    accent: '#54d9ff',
  },
  'Automation Architect': {
    description: 'Builds smart systems that make everyday work flow better.',
    strengths: ['Process design', 'Systems thinking', 'Efficiency mindset'],
    starterProject: 'A workflow that turns form responses into organised follow-ups.',
    accent: '#d76cff',
  },
  'Creative AI Builder': {
    description: 'Blends imagination and technology to make memorable experiences.',
    strengths: ['Original ideas', 'Experimentation', 'Human-centred design'],
    starterProject: 'An interactive story generator for a student community.',
    accent: '#ff77c8',
  },
  'Data Detective': {
    description: 'Finds the story hiding inside patterns, signals, and evidence.',
    strengths: ['Curiosity', 'Pattern recognition', 'Evidence-led thinking'],
    starterProject: 'A dashboard that reveals trends in campus event participation.',
    accent: '#7c9cff',
  },
};

export const RANKS = ['ROOKIE EXPLORER', 'SKILL SEEKER', 'PROTOTYPE RANGER', 'LAUNCH CAPTAIN'];

export const QUEST_SCHEDULE = [
  { day: 1, title: 'Explore the AI Universe', description: 'Learn about AI tools, their capabilities, and how to use them effectively.', quest: 'Complete an AI tools exploration activity.' },
  { day: 2, title: 'Build an App in 60 Minutes', description: 'Attend the guided workshop and build a working application using AI.', quest: 'Complete the guided build and demonstrate the result.' },
  { day: 3, title: 'Project Builder Challenge', description: 'Choose a real-world problem and start developing a project.', quest: 'Submit a project idea and demonstrate meaningful progress.' },
  { day: 4, title: 'The AI Arena', description: 'Compete in a quiz covering tools, prompting, app-building, and problem-solving.', quest: 'Complete the official quiz within its time limit.' },
  { day: 5, title: 'Submit, Polish and Learn', description: 'Improve the project and provide a concise explanation.', quest: 'Submit the completed project before the deadline.' },
  { day: 6, title: 'Bonus XP Festival', description: 'Complete optional prompt, debugging, identification, and creative challenges.', quest: 'Earn bonus points within published limits.' },
  { day: 7, title: 'The Grand Finale', description: 'Finalize the eligible leaderboard, verify scores, resolve ties, and announce the winner.', quest: 'Prize: ₹2,000 for the eligible first-place winner under the published rules.' },
];

export function scoreIdentity(answerTitles) {
  const interestIdentity = {
    'Building Applications': 'AI Problem Solver',
    'Automating Tasks': 'Automation Architect',
    'Analyzing Data': 'Data Detective',
    'Exploring Creative Ideas': 'Creative AI Builder',
  };
  const identity = interestIdentity[answerTitles[0]] ?? 'AI Problem Solver';
  const experienceIndex = Math.max(0, RANKS.findIndex((_, index) => index === [
    'I am just starting',
    'I have followed tutorials',
    'I have built projects',
    'I code confidently',
  ].indexOf(answerTitles[1])));
  return {
    identity,
    ...IDENTITY_DEFINITIONS[identity],
    rank: RANKS[experienceIndex] ?? RANKS[0],
    level: 3 + experienceIndex,
    focus: answerTitles[2],
    style: answerTitles[3],
    learningGoal: answerTitles[4],
  };
}
