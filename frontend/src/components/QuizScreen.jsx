import { useMemo, useState } from 'react';
import backgroundImage from '../../images/image1.png';
import maleAvatarImage from '../../images/male.png';
import femaleAvatarImage from '../../images/female.png';
import './QuizScreen.css';

const QUESTIONS = [
  {
    category: 'AI INTERESTS',
    title: 'What excites you most about AI?',
    description: 'Choose the direction that feels most like you right now.',
    options: [
      { title: 'Building Applications', description: 'I enjoy creating apps and turning ideas into real products.', icon: 'code' },
      { title: 'Automating Tasks', description: 'I like making processes faster and smarter.', icon: 'settings' },
      { title: 'Analyzing Data', description: "I'm curious about data, patterns, and predictions.", icon: 'chart' },
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
    category: 'LEARNING STYLE',
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
    category: 'YOUR AVATAR',
    title: 'How should your AI Builder avatar appear?',
    description: 'Choose a preference, or skip this for now and decide later.',
    options: [
      { title: 'Male', description: 'Create a masculine-presenting avatar.', icon: 'male' },
      { title: 'Female', description: 'Create a feminine-presenting avatar.', icon: 'female' },
    ],
  },
];

function Icon({ name, size = 22 }) {
  const common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true };
  const paths = {
    code: <><path d="m8 8-4 4 4 4" /><path d="m16 8 4 4-4 4" /><path d="m14 4-4 16" /></>,
    settings: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-1.8 1.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-2.6V20a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1-1.8-1.8.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.6-1H6v-2.6h.2a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1 1.8-1.8.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.6V5h2.6v.2a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1 1.8 1.8-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v2.6h-.2a1.7 1.7 0 0 0-1.6 1Z" /></>,
    chart: <><path d="M4 19V5" /><path d="M4 19h16" /><path d="M8 16v-5" /><path d="M12 16V7" /><path d="M16 16v-8" /></>,
    bulb: <><path d="M9 18h6" /><path d="M10 22h4" /><path d="M8.4 14.5A6 6 0 1 1 15.7 15c-.7.6-1.1 1.4-1.2 2H9.6c-.1-.9-.5-1.7-1.2-2.5Z" /></>,
    spark: <><path d="m12 3 1.2 4.8L18 9l-4.8 1.2L12 15l-1.2-4.8L6 9l4.8-1.2L12 3Z" /><path d="m19 15 .6 2.4L22 18l-2.4.6L19 21l-.6-2.4L16 18l2.4-.6L19 15Z" /></>,
    book: <><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21V5.5Z" /><path d="M4 5.5V21" /><path d="M8 7h8" /></>,
    rocket: <><path d="M14 4c3-1 5.5-.5 6 0 .5.5 1 3 0 6l-5 5-4-4 3-7Z" /><path d="m11 13-3 1-3 3 4-1 1-3Z" /><path d="m7 17-2 2" /><path d="m13 7 4 4" /></>,
    layers: <><path d="m12 3 9 5-9 5-9-5 9-5Z" /><path d="m3 12 9 5 9-5" /><path d="m3 16 9 5 9-5" /></>,
    users: <><circle cx="9" cy="8" r="3" /><path d="M3 20a6 6 0 0 1 12 0" /><path d="M16 5.5a3 3 0 0 1 0 5.8" /><path d="M18 14a5 5 0 0 1 3 4.5" /></>,
    male: <><circle cx="10" cy="14" r="5" /><path d="m14 10 6-6" /><path d="M15 4h5v5" /></>,
    female: <><circle cx="12" cy="9" r="5" /><path d="M12 14v7" /><path d="M9 18h6" /></>,
    later: <><circle cx="12" cy="12" r="8" /><path d="M12 8v4l2.5 2" /></>,
  };
  return <svg {...common}>{paths[name]}</svg>;
}

function BrandMark() {
  return (
    <div className="quiz-brand" aria-label="NIAT, NxtWave Institute of Advanced Technologies">
      <div className="quiz-brand__crest">NI<br />AT</div>
      <div className="quiz-brand__copy"><strong>NIAT</strong><span>NxtWave Institute of Advanced<br />Technologies</span></div>
    </div>
  );
}

function roundedRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
}

function drawAvatar(ctx, gender, centerX, centerY) {
  const isFemale = gender === 'Female';
  const skin = '#f3b790';
  const hair = isFemale ? '#401d68' : '#10152e';

  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.shadowColor = isFemale ? '#d15cff' : '#52cfff';
  ctx.shadowBlur = 28;

  const bodyGradient = ctx.createLinearGradient(-150, 70, 150, 300);
  bodyGradient.addColorStop(0, isFemale ? '#cf4eff' : '#3d8dff');
  bodyGradient.addColorStop(1, '#16144d');
  ctx.fillStyle = bodyGradient;
  ctx.beginPath();
  ctx.moveTo(-145, 290);
  ctx.quadraticCurveTo(-125, 80, 0, 70);
  ctx.quadraticCurveTo(125, 80, 145, 290);
  ctx.closePath();
  ctx.fill();

  ctx.shadowBlur = 0;
  ctx.fillStyle = skin;
  ctx.fillRect(-29, 35, 58, 75);
  ctx.beginPath();
  ctx.arc(0, -22, 83, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = hair;
  if (isFemale) {
    ctx.beginPath();
    ctx.arc(0, -33, 95, Math.PI, Math.PI * 2);
    ctx.lineTo(99, 112);
    ctx.quadraticCurveTo(58, 142, 47, 56);
    ctx.lineTo(-58, 56);
    ctx.quadraticCurveTo(-66, 138, -101, 111);
    ctx.closePath();
    ctx.fill();
  } else {
    ctx.beginPath();
    ctx.moveTo(-84, -38);
    ctx.quadraticCurveTo(-62, -126, 0, -119);
    ctx.quadraticCurveTo(65, -128, 88, -40);
    ctx.lineTo(54, -50);
    ctx.lineTo(38, -79);
    ctx.lineTo(16, -51);
    ctx.lineTo(-9, -82);
    ctx.lineTo(-30, -51);
    ctx.closePath();
    ctx.fill();
  }

  ctx.fillStyle = '#141331';
  ctx.beginPath(); ctx.arc(-29, -25, 7, 0, Math.PI * 2); ctx.arc(29, -25, 7, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#9e4e91'; ctx.lineWidth = 5; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.arc(0, 2, 22, .15, Math.PI - .15); ctx.stroke();
  ctx.restore();
}

function wrapCanvasText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(' ');
  let line = '';
  let currentY = y;
  words.forEach((word) => {
    const next = `${line}${word} `;
    if (ctx.measureText(next).width > maxWidth && line) {
      ctx.fillText(line.trim(), x, currentY);
      line = `${word} `;
      currentY += lineHeight;
    } else {
      line = next;
    }
  });
  ctx.fillText(line.trim(), x, currentY);
  return currentY + lineHeight;
}

function loadImage(source) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = source;
  });
}

function drawCoverImage(ctx, image, x, y, width, height) {
  const scale = Math.max(width / image.width, height / image.height);
  const drawWidth = image.width * scale;
  const drawHeight = image.height * scale;
  ctx.drawImage(image, x + (width - drawWidth) / 2, y + (height - drawHeight) / 2, drawWidth, drawHeight);
}

function getIdentityProfile(answerTitles) {
  const identityMap = {
    'Building Applications': ['PRODUCT ARCHITECT', 'Turns bold ideas into useful experiences.'],
    'Automating Tasks': ['AUTOMATION ALCHEMIST', 'Makes every workflow faster and smarter.'],
    'Analyzing Data': ['DATA ORACLE', 'Finds the story hidden inside every pattern.'],
    'Exploring Creative Ideas': ['CREATIVE NOVA', 'Brings imagination and intelligence together.'],
  };
  const rankMap = {
    'I am just starting': 'ROOKIE EXPLORER',
    'I have followed tutorials': 'SKILL SEEKER',
    'I have built projects': 'PROTOTYPE RANGER',
    'I code confidently': 'LAUNCH CAPTAIN',
  };
  const [identity, tagline] = identityMap[answerTitles[0]] ?? identityMap['Building Applications'];
  const rank = rankMap[answerTitles[1]] ?? 'ROOKIE EXPLORER';
  const level = 3 + Math.max(0, Object.keys(rankMap).indexOf(answerTitles[1]));
  return { identity, tagline, rank, level, focus: answerTitles[2], style: answerTitles[3] };
}

function drawStat(ctx, x, label, value, color) {
  const width = 166;
  const height = 62;
  const horizontalPadding = 14;
  const valueMaxWidth = width - horizontalPadding * 2;

  roundedRect(ctx, x, 270, width, height, 12);
  ctx.fillStyle = 'rgba(24, 31, 91, .8)'; ctx.fill();
  ctx.strokeStyle = color; ctx.lineWidth = 1; ctx.stroke();

  // The canvas keeps the 4px tracking used by the frame heading unless it is
  // explicitly reset. Reset it here so long rank names stay inside the card.
  ctx.save();
  ctx.letterSpacing = '0px';
  ctx.textAlign = 'left';
  ctx.fillStyle = '#9fa9e9'; ctx.font = '600 11px Arial'; ctx.fillText(label, x + horizontalPadding, 292);
  ctx.fillStyle = '#fff';

  // Fit by measured width instead of string length. This covers every current
  // rank and remains safe if a future rank has wider characters.
  let fontSize = value.length > 12 ? 12 : 17;
  while (fontSize > 9) {
    ctx.font = `700 ${fontSize}px Arial`;
    if (ctx.measureText(value).width <= valueMaxWidth) break;
    fontSize -= 0.5;
  }
  ctx.fillText(value, x + horizontalPadding, 316);
  ctx.restore();
}

async function generateAvatarFrame(answerTitles) {
  const canvas = document.createElement('canvas');
  canvas.width = 1200;
  canvas.height = 900;
  const ctx = canvas.getContext('2d');
  const gender = answerTitles[4];
  const profile = getIdentityProfile(answerTitles);
  const avatar = await loadImage(gender === 'Female' ? femaleAvatarImage : maleAvatarImage);

  const background = ctx.createLinearGradient(0, 0, 1200, 900);
  background.addColorStop(0, '#070827');
  background.addColorStop(.55, '#121051');
  background.addColorStop(1, '#050617');
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.globalAlpha = .45;
  ctx.fillStyle = '#9f40ff';
  ctx.beginPath(); ctx.arc(1060, 70, 190, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#1bcfff';
  ctx.beginPath(); ctx.arc(90, 840, 180, 0, Math.PI * 2); ctx.fill();
  ctx.globalAlpha = 1;

  roundedRect(ctx, 28, 28, 1144, 844, 34);
  ctx.strokeStyle = '#6bd8ff'; ctx.lineWidth = 3; ctx.shadowColor = '#963dff'; ctx.shadowBlur = 25; ctx.stroke(); ctx.shadowBlur = 0;

  ctx.fillStyle = '#aeb5ff'; ctx.font = '600 18px Arial'; ctx.letterSpacing = '4px';
  ctx.fillText('AI QUEST  /  NIAT INITIATIVE', 78, 88);
  ctx.fillStyle = '#fff'; ctx.font = '700 46px Arial';
  ctx.fillText('YOUR AI BUILDER IDENTITY', 78, 145);
  ctx.fillStyle = '#df7dff'; ctx.font = '600 18px Arial';
  ctx.fillText(`${profile.identity}  |  ${gender.toUpperCase()} AVATAR`, 78, 185);

  roundedRect(ctx, 78, 230, 390, 560, 24);
  ctx.fillStyle = 'rgba(22, 20, 91, .72)'; ctx.fill();
  ctx.strokeStyle = 'rgba(109, 229, 255, .7)'; ctx.lineWidth = 2; ctx.stroke();
  ctx.save();
  roundedRect(ctx, 78, 230, 390, 560, 24); ctx.clip();
  drawCoverImage(ctx, avatar, 78, 230, 390, 560);
  const avatarShade = ctx.createLinearGradient(78, 570, 78, 790);
  avatarShade.addColorStop(0, 'rgba(5, 7, 35, 0)'); avatarShade.addColorStop(1, 'rgba(5, 7, 35, .96)');
  ctx.fillStyle = avatarShade; ctx.fillRect(78, 570, 390, 220);
  ctx.restore();
  ctx.fillStyle = '#fff'; ctx.font = '700 24px Arial'; ctx.textAlign = 'center';
  ctx.fillText(profile.identity, 273, 735);
  ctx.fillStyle = '#aab5ef'; ctx.font = '500 16px Arial';
  ctx.fillText(profile.rank, 273, 764);
  ctx.textAlign = 'left';

  ctx.fillStyle = '#aeb5ff'; ctx.font = '600 16px Arial';
  ctx.fillText('QUEST PROFILE', 545, 245);
  drawStat(ctx, 545, 'LEVEL', `LEVEL ${profile.level}`, '#d66bff');
  drawStat(ctx, 726, 'RANK', profile.rank, '#9c8aff');
  ctx.fillStyle = '#d76cff'; ctx.font = '700 14px Arial';
  ctx.fillText('STUDENT DISCOVERY DETAILS', 545, 375);
  let y = 420;
  QUESTIONS.forEach((question, index) => {
    ctx.fillStyle = '#d76cff'; ctx.font = '700 14px Arial';
    ctx.fillText(`${index + 1}. ${question.category}`, 545, y);
    ctx.fillStyle = '#fff'; ctx.font = '600 20px Arial';
    y = wrapCanvasText(ctx, answerTitles[index], 545, y + 32, 540, 27) + 25;
  });

  ctx.fillStyle = '#7782c8'; ctx.font = '500 14px Arial';
  ctx.fillText('500+ ENGINEERS  •  7 DAYS  •  A BRIGHTER TOMORROW', 78, 835);
  return { dataUrl: canvas.toDataURL('image/png'), profile };
}

function downloadAvatarFrame(dataUrl, gender) {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = `ai-quest-${gender.toLowerCase()}-avatar.png`;
  document.body.appendChild(link);
  link.click();
  link.remove();
}

export default function QuizScreen() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [completed, setCompleted] = useState(false);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [generatedProfile, setGeneratedProfile] = useState(null);
  const [generating, setGenerating] = useState(false);
  const question = QUESTIONS[step];
  const selected = answers[step];
  const progressLabel = useMemo(() => `${step + 1} / ${QUESTIONS.length}`, [step]);

  const chooseAnswer = (optionIndex) => {
    setAnswers((current) => ({ ...current, [step]: optionIndex }));
    setCompleted(false);
    setGeneratedImage(null);
    setGeneratedProfile(null);
  };

  const goBack = () => {
    if (step > 0) setStep((current) => current - 1);
  };

  const goNext = async () => {
    if (selected === undefined) return;
    if (step === QUESTIONS.length - 1) {
      const answerTitles = QUESTIONS.map((item, index) => item.options[answers[index]]?.title ?? 'Not selected');
      setGenerating(true);
      try {
        const result = await generateAvatarFrame(answerTitles);
        setGeneratedImage(result.dataUrl);
        setGeneratedProfile(result.profile);
        setCompleted(true);
        downloadAvatarFrame(result.dataUrl, answerTitles[4]);
      } finally {
        setGenerating(false);
      }
      return;
    }
    setStep((current) => current + 1);
  };

  return (
    <main className="quiz-screen" style={{ '--quiz-background': `url(${backgroundImage})` }}>
      <div className="quiz-screen__shade" aria-hidden="true" />
      <div className="quiz-layout">
        <section className="quiz-intro" aria-labelledby="quiz-intro-title">
          <div className="quiz-eyebrow"><span className="quiz-eyebrow__mark"><Icon name="spark" size={15} /></span> AI QUEST <span className="quiz-eyebrow__line" /> STEP 1 OF 5</div>
          <h1 id="quiz-intro-title">Let&apos;s Discover<br /><span>Your AI Identity</span></h1>
          <p className="quiz-intro__description">Answer a few quick questions to help us understand your interests, goals, and learning style. Get a personalized AI Builder identity, avatar, and project recommendations at the end.</p>
          <div className="quiz-highlights">
            {[['spark', '5 Quick Questions'], ['users', 'Personalized AI Identity'], ['rocket', 'Project Recommendations'], ['male', 'A Unique Avatar']].map(([icon, text]) => <div className="quiz-highlight" key={text}><span><Icon name={icon} size={18} /></span>{text}</div>)}
          </div>
        </section>

        <section className="quiz-panel" aria-labelledby="question-title">
          <div className="quiz-panel__topline"><div className="quiz-steps" aria-label="Quiz progress">{QUESTIONS.map((item, index) => <span className={`quiz-step-dot${index < step ? ' quiz-step-dot--done' : ''}${index === step ? ' quiz-step-dot--active' : ''}`} key={item.category}>{index < step ? '✓' : index + 1}</span>)}</div><span className="quiz-count">{progressLabel}</span></div>
          <div className="quiz-panel__rule"><span style={{ width: `${((step + 1) / QUESTIONS.length) * 100}%` }} /></div>
          <div className="quiz-question__category">{question.category}</div>
          <h2 id="question-title">{question.title}</h2>
          <p className="quiz-question__description">{question.description}</p>

          <div className={`quiz-options${question.options.length === 3 ? ' quiz-options--three' : ''}`}>
            {question.options.map((option, index) => {
              const isSelected = selected === index;
              return <button className={`quiz-option${isSelected ? ' quiz-option--selected' : ''}`} type="button" aria-pressed={isSelected} key={option.title} onClick={() => chooseAnswer(index)}>
                <span className="quiz-option__icon"><Icon name={option.icon} size={24} /></span>
                <span className="quiz-option__copy"><strong>{option.title}</strong><small>{option.description}</small></span>
                <span className="quiz-option__radio" aria-hidden="true"><span /></span>
              </button>;
            })}
          </div>

          {completed && <div className="quiz-complete" role="status"><Icon name="spark" size={17} /> Your AI identity is ready to discover.</div>}
          {generatedImage && <div className="quiz-generated-result" role="status"><img src={generatedImage} alt="Generated AI Builder avatar frame" /><div><strong>{generatedProfile?.identity ?? 'Your avatar frame'} downloaded</strong><small>Level {generatedProfile?.level} | {generatedProfile?.rank}</small><a href={generatedImage} download={`ai-quest-${answers[4] === 0 ? 'male' : 'female'}-avatar.png`}>Download again</a></div></div>}
          <div className="quiz-panel__footer"><button className="quiz-back-button" type="button" onClick={goBack} disabled={step === 0 || generating}>← <span>Back</span></button><button className="quiz-primary-button" type="button" onClick={goNext} disabled={selected === undefined || generating}>{generating ? 'Generating Avatar…' : step === QUESTIONS.length - 1 ? 'Discover My AI Identity' : 'Next Question'} <span>→</span></button></div>
        </section>
      </div>
      <div className="quiz-bottom-note"><span>✦</span> BUILD YOUR FUTURE WITH AI <span>✦</span></div>
    </main>
  );
}
