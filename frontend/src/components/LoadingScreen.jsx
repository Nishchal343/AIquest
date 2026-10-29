import { useEffect, useRef, useState } from 'react';
import referenceImage from '../../images/image-clean.png';

const FEATURES = [
  { id: 'identity', icon: '●', title: 'Discover', detail: 'Your AI Identity', position: 'feature--identity' },
  { id: 'friends', icon: '●●', title: 'Invite', detail: 'Your Friends', position: 'feature--friends' },
  { id: 'workshop', icon: '✦', title: 'Join the', detail: 'Live Workshop', position: 'feature--workshop' },
  { id: 'quiz', icon: '☷', title: 'Take the', detail: 'AI Quiz', position: 'feature--quiz' },
  { id: 'challenge', icon: '⚔', title: 'Challenge', detail: 'Your Friends', position: 'feature--challenge' },
  { id: 'project', icon: '</>', title: 'Build & Submit', detail: 'Your Project', position: 'feature--project' },
  { id: 'growth', icon: '▥', title: 'Track', detail: 'Your Growth', position: 'feature--growth' },
  { id: 'leaderboard', icon: '♛', title: 'Climb the', detail: 'Leaderboard', position: 'feature--leaderboard' },
];

function FeatureCard({ feature }) {
  return (
    <div className={`feature-card ${feature.position}`}>
      <div className="feature-card__icon" aria-hidden="true">{feature.icon}</div>
      <div>
        <p>{feature.title}</p>
        <p>{feature.detail}</p>
      </div>
    </div>
  );
}

function NiatWordmark() {
  const [logoAvailable, setLogoAvailable] = useState(true);

  return (
    <div className="niat-wordmark" aria-label="NIAT, NxtWave Institute of Advanced Technologies">
      {logoAvailable ? (
        <img
          className="niat-wordmark__logo"
          src="/assets/niat-logo.svg"
          alt="NIAT"
          onError={() => setLogoAvailable(false)}
        />
      ) : (
        <span className="niat-wordmark__missing">NIAT</span>
      )}
      <span className="niat-wordmark__rule" aria-hidden="true" />
      <span className="niat-wordmark__copy">
        <strong>NIAT</strong>
        <small>NxtWave Institute<br />of Advanced<br />Technologies</small>
      </span>
    </div>
  );
}

export default function LoadingScreen({ onComplete }) {
  const [progress, setProgress] = useState(1);
  const startTimeRef = useRef(null);
  const frameRef = useRef(null);
  const holdRef = useRef(null);
  const completionRef = useRef(onComplete);

  useEffect(() => {
    completionRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finish = () => {
      completionRef.current?.();
    };

    if (reduceMotion) {
      setProgress(100);
      finish();
      return undefined;
    }

    const duration = 10000;
    const animate = (now) => {
      if (startTimeRef.current === null) startTimeRef.current = now;
      const elapsed = Math.min(now - startTimeRef.current, duration);
      const nextProgress = Math.min(100, Math.floor(1 + (99 * elapsed) / duration));
      setProgress(nextProgress);

      if (elapsed < duration) {
        frameRef.current = window.requestAnimationFrame(animate);
      } else {
        setProgress(100);
        holdRef.current = window.setTimeout(finish, 500);
      }
    };

    frameRef.current = window.requestAnimationFrame(animate);
    return () => {
      if (frameRef.current) window.cancelAnimationFrame(frameRef.current);
      if (holdRef.current) window.clearTimeout(holdRef.current);
    };
  }, []);

  return (
    <main className="reference-loading-screen">
      <span className="sr-only">AI Quest by NIAT loading screen</span>
      <img className="reference-art" src={referenceImage} alt="AI Quest campus loading screen" />
      <section className="reference-progress" aria-live="polite">
        <div
          className="reference-progress__track"
          role="progressbar"
          aria-valuemin="1"
          aria-valuemax="100"
          aria-valuenow={progress}
          aria-label="AI journey loading progress"
        >
          <div className="reference-progress__fill" style={{ width: `${progress}%` }} />
        </div>
        <span className="reference-progress__value">{progress}%</span>
      </section>
    </main>
  );
  /*
  return (
    <main className={`loading-screen${complete ? ' loading-screen--complete' : ''}`}>
      <span className="sr-only">AI Quest by NIAT loading screen</span>
      <div className="scene-backdrop" aria-hidden="true">
        <div className="scene-backdrop__stars" />
        <div className="scene-backdrop__aurora scene-backdrop__aurora--left" />
        <div className="scene-backdrop__aurora scene-backdrop__aurora--right" />
        <div className="scene-backdrop__moon" />
        <div className="scene-backdrop__city scene-backdrop__city--left" />
        <div className="scene-backdrop__city scene-backdrop__city--right" />
        <div className="scene-backdrop__road scene-backdrop__road--one" />
        <div className="scene-backdrop__road scene-backdrop__road--two" />
        <div className="scene-backdrop__horizon" />
        <div className="scene-backdrop__student" />
      </div>

      <header className="topbar">
        <NiatWordmark />
        <nav className="topbar__nav" aria-label="Primary">
          <span>LEARN</span><i />
          <span>BUILD</span><i />
          <span>COMPETE</span><i />
          <span>GROW</span>
        </nav>
      </header>

      <section className="loading-content" aria-live="polite">
        <div className="quest-mark" aria-hidden="true"><span />A</div>
        <h1>AI QUEST</h1>
        <div className="initiative-lockup">
          <span />
          <span>A <b>NIAT</b> INITIATIVE</span>
          <span />
        </div>

        <div className="loading-copy">YOUR AI JOURNEY IS LOADING...</div>
        <div className="progress-row">
          <div className="progress-track" role="progressbar" aria-valuemin="1" aria-valuemax="100" aria-valuenow={progress} aria-label="AI journey loading progress">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <span className="progress-value">{progress}%</span>
        </div>
        <p className="tagline">“ SAME CAMPUS. BIGGER POSSIBILITIES. ”</p>
        {complete && <div className="completion-message">JOURNEY INITIALIZED <span>✦</span></div>}
      </section>

      <div className="feature-ring" aria-label="AI Quest features">
        {FEATURES.map((feature) => <FeatureCard key={feature.id} feature={feature} />)}
      </div>

      <footer className="bottombar">
        <span>500+ ENGINEERS</span><i />
        <span>7 DAYS</span><i />
        <span>A BRIGHTER TOMORROW</span>
      </footer>
    </main>
  );
  */
}
