import { useMemo, useState } from 'react';
import backgroundImage from '../../images/image1.png';
import { QUESTIONS, scoreIdentity } from '../data/questData';
import { readStudentState, writeStudentState } from '../services/storage';
import './QuizScreen.css';

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
  };
  return <svg {...common}>{paths[name]}</svg>;
}

export default function StudentQuiz({ onComplete }) {
  const saved = readStudentState();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState(saved.quizAnswers ?? {});
  const question = QUESTIONS[step];
  const selected = answers[step];
  const progressLabel = useMemo(() => `${step + 1} / ${QUESTIONS.length}`, [step]);
  const chooseAnswer = (optionIndex) => setAnswers((current) => ({ ...current, [step]: optionIndex }));
  const goNext = () => {
    if (selected === undefined) return;
    if (step === QUESTIONS.length - 1) {
      const answerTitles = QUESTIONS.map((item, index) => item.options[answers[index]]?.title ?? 'Not selected');
      const profile = scoreIdentity(answerTitles);
      writeStudentState({ quizAnswers: answers, answerTitles, profile, quizComplete: true });
      onComplete?.({ answerTitles, profile });
      return;
    }
    setStep((current) => current + 1);
  };
  return (
    <main className="quiz-screen" style={{ '--quiz-background': `url(${backgroundImage})` }}>
      <div className="quiz-screen__shade" aria-hidden="true" />
      <div className="quiz-layout">
        <section className="quiz-intro" aria-labelledby="quiz-intro-title">
          <div className="quiz-eyebrow"><span className="quiz-eyebrow__mark"><Icon name="spark" size={15} /></span> AI QUEST <span className="quiz-eyebrow__line" /> STEP {step + 1} OF {QUESTIONS.length}</div>
          <h1 id="quiz-intro-title">Let&apos;s Discover<br /><span>Your AI Identity</span></h1>
          <p className="quiz-intro__description">Answer a few quick questions to understand your interests, goals, and learning style. Get a personalized AI Builder identity and project recommendation at the end.</p>
          <div className="quiz-highlights">{[['spark', '5 Quick Questions'], ['users', 'Personalized Identity'], ['rocket', 'Project Recommendation'], ['book', 'A Seven-Day Quest']].map(([icon, text]) => <div className="quiz-highlight" key={text}><span><Icon name={icon} size={18} /></span>{text}</div>)}</div>
        </section>
        <section className="quiz-panel" aria-labelledby="question-title">
          <div className="quiz-panel__topline"><div className="quiz-steps" aria-label="Quiz progress">{QUESTIONS.map((item, index) => <span className={`quiz-step-dot${index < step ? ' quiz-step-dot--done' : ''}${index === step ? ' quiz-step-dot--active' : ''}`} key={item.category}>{index < step ? '✓' : index + 1}</span>)}</div><span className="quiz-count">{progressLabel}</span></div>
          <div className="quiz-panel__rule"><span style={{ width: `${((step + 1) / QUESTIONS.length) * 100}%` }} /></div>
          <div className="quiz-question__category">{question.category}</div>
          <h2 id="question-title">{question.title}</h2>
          <p className="quiz-question__description">{question.description}</p>
          <div className="quiz-options">{question.options.map((option, index) => { const isSelected = selected === index; return <button className={`quiz-option${isSelected ? ' quiz-option--selected' : ''}`} type="button" aria-pressed={isSelected} key={option.title} onClick={() => chooseAnswer(index)}><span className="quiz-option__icon"><Icon name={option.icon} size={24} /></span><span className="quiz-option__copy"><strong>{option.title}</strong><small>{option.description}</small></span><span className="quiz-option__radio" aria-hidden="true"><span /></span></button>; })}</div>
          <div className="quiz-panel__footer"><button className="quiz-back-button" type="button" onClick={() => setStep((current) => Math.max(0, current - 1))} disabled={step === 0}>← <span>Back</span></button><button className="quiz-primary-button" type="button" onClick={goNext} disabled={selected === undefined}>{step === QUESTIONS.length - 1 ? 'Reveal My Identity' : 'Next Question'} <span>→</span></button></div>
        </section>
      </div>
      <div className="quiz-bottom-note"><span>✦</span> BUILD YOUR FUTURE WITH AI <span>✦</span></div>
    </main>
  );
}
