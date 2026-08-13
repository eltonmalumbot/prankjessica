'use client';

import { useMemo, useState } from 'react';
import FlappyHeart from './FlappyHeart';
import ScratchCard from './ScratchCard';

const activities = [
  { id: 'dinner', label: 'Dinner Date', icon: '🍝' },
  { id: 'movie', label: 'Movie Night', icon: '🎬' },
  { id: 'coffee', label: 'Coffee & Walk', icon: '☕' },
  { id: 'picnic', label: 'Picnic', icon: '🧺' },
  { id: 'arcade', label: 'Arcade Date', icon: '🕹️' },
  { id: 'surprise', label: 'Surprise Me', icon: '🎀' },
];

const hearts = [
  { left: '7%', top: '18%', delay: '0s', size: 16 },
  { left: '15%', top: '63%', delay: '.8s', size: 10 },
  { left: '28%', top: '28%', delay: '1.7s', size: 12 },
  { left: '73%', top: '16%', delay: '.4s', size: 11 },
  { left: '84%', top: '44%', delay: '1.2s', size: 17 },
  { left: '91%', top: '70%', delay: '2s', size: 10 },
];

function PixelMascot({ mood = 'ask' }) {
  return (
    <div className={`mascot mascot-${mood}`} aria-hidden="true">
      <div className="mascot-ear ear-left" />
      <div className="mascot-ear ear-right" />
      <div className="mascot-head">
        <span className="eye eye-left" />
        <span className="eye eye-right" />
        <span className="mascot-mouth">{mood === 'yay' ? 'ᴗ' : mood === 'final' ? '♥' : '⌣'}</span>
      </div>
      <span className="mascot-blush blush-left" />
      <span className="mascot-blush blush-right" />
    </div>
  );
}

function Shell({ children }) {
  return (
    <main className="world">
      <div className="pixel-grid" />
      <div className="cloud cloud-a" />
      <div className="cloud cloud-b" />
      <div className="cloud cloud-c" />
      {hearts.map((heart, i) => (
        <span
          key={i}
          className="floating-heart"
          style={{ left: heart.left, top: heart.top, animationDelay: heart.delay, fontSize: heart.size }}
        >
          ♡
        </span>
      ))}
      <div className="sparkle sparkle-a">✦</div>
      <div className="sparkle sparkle-b">✧</div>
      <div className="mountains far" />
      <div className="mountains near" />
      <div className="ground" />
      <section className="content">{children}</section>
    </main>
  );
}

function Button({ children, variant = 'primary', className = '', ...props }) {
  return (
    <button className={`pixel-button ${variant} ${className}`} {...props}>
      <span>{children}</span>
    </button>
  );
}

export default function Home() {
  const [step, setStep] = useState('ask');
  const [noCount, setNoCount] = useState(0);
  const [noPosition, setNoPosition] = useState({ x: 0, y: 0 });
  const [date, setDate] = useState('');
  const [activity, setActivity] = useState('');
  const [showLetter, setShowLetter] = useState(false);

  const chosenActivity = useMemo(
    () => activities.find((item) => item.id === activity),
    [activity]
  );

  const formattedDate = useMemo(() => {
    if (!date) return '';
    return new Intl.DateTimeFormat('en', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date(`${date}T12:00:00`));
  }, [date]);

  const dodgeNo = () => {
    const rangeX = typeof window !== 'undefined' && window.innerWidth < 600 ? 115 : 175;
    const rangeY = 86;
    const x = Math.round((Math.random() * 2 - 1) * rangeX);
    const y = Math.round((Math.random() * 2 - 1) * rangeY);
    setNoPosition({ x, y });
    setNoCount((value) => value + 1);
  };

  const reset = () => {
    setStep('ask');
    setNoCount(0);
    setNoPosition({ x: 0, y: 0 });
    setDate('');
    setActivity('');
    setShowLetter(false);
  };

  return (
    <Shell>
      {step === 'ask' && (
        <div className="panel ask-panel step-enter">
          <div className="picture-frame"><PixelMascot mood="ask" /></div>
          <p className="eyebrow">a tiny question for jessica</p>
          <h1>WILL YOU GO<br />OUT WITH ME?</h1>
          <p className="subtitle">Choose carefully... there is definitely a correct answer.</p>
          <div className="choice-zone">
            <Button
              className="yes-button"
              style={{ transform: `scale(${1 + Math.min(noCount, 7) * 0.075})` }}
              onClick={() => setStep('yay')}
            >
              YES! ♥
            </Button>
            <Button
              variant="secondary"
              className="no-button"
              onMouseEnter={dodgeNo}
              onPointerDown={(event) => {
                event.preventDefault();
                dodgeNo();
              }}
              style={{ transform: `translate(${noPosition.x}px, ${noPosition.y}px)` }}
            >
              {noCount > 5 ? 'Still no?' : noCount > 2 ? 'Nice try' : 'No'}
            </Button>
          </div>
          {noCount > 0 && <p className="tiny-note">the “no” button seems a little shy...</p>}
        </div>
      )}

      {step === 'yay' && (
        <div className="panel step-enter">
          <div className="picture-frame happy"><PixelMascot mood="yay" /></div>
          <p className="eyebrow">excellent decision</p>
          <h1 className="huge">YAY!</h1>
          <p className="subtitle">I knew you had great taste ✨ But your prize has two tiny security checks.</p>
          <div className="heart-burst" aria-hidden="true">
            <span>♥</span><span>♡</span><span>♥</span><span>♡</span><span>♥</span>
          </div>
          <Button onClick={() => setStep('flappy')}>START MINI GAME →</Button>
        </div>
      )}

      {step === 'flappy' && (
        <div className="panel wide game-panel step-enter">
          <p className="eyebrow">bonus game 1 of 2</p>
          <h1 className="medium">FLAPPY HEART</h1>
          <p className="subtitle">Deliver this tiny heart safely. Seven gates only — I promise I&apos;m not evil.</p>
          <FlappyHeart onWin={() => setStep('scratch')} />
        </div>
      )}

      {step === 'scratch' && (
        <div className="panel wide game-panel step-enter">
          <p className="eyebrow">bonus game 2 of 2</p>
          <h1 className="medium">SECRET PRIZE</h1>
          <p className="subtitle">You survived the heart delivery. Now scratch the card to see what you actually won.</p>
          <ScratchCard onComplete={() => setStep('date')} />
        </div>
      )}

      {step === 'date' && (
        <div className="panel step-enter">
          <div className="picture-frame small"><PixelMascot mood="ask" /></div>
          <p className="eyebrow">date setup · step 1 of 2</p>
          <h1 className="medium">PICK A DATE</h1>
          <p className="subtitle">When should our tiny adventure happen?</p>
          <label className="date-box">
            <span>DATE</span>
            <input
              type="date"
              value={date}
              min={new Date().toISOString().slice(0, 10)}
              onChange={(event) => setDate(event.target.value)}
            />
          </label>
          <Button disabled={!date} onClick={() => setStep('activity')}>CONTINUE →</Button>
        </div>
      )}

      {step === 'activity' && (
        <div className="panel wide step-enter">
          <div className="picture-frame small"><PixelMascot mood="ask" /></div>
          <p className="eyebrow">date setup · step 2 of 2</p>
          <h1 className="medium">WHAT WOULD YOU LIKE TO DO?</h1>
          <div className="activity-grid">
            {activities.map((item) => (
              <button
                key={item.id}
                className={`activity-card ${activity === item.id ? 'selected' : ''}`}
                onClick={() => setActivity(item.id)}
              >
                <span className="activity-icon">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>
          <Button disabled={!activity} onClick={() => setStep('final')}>LOCK IT IN ♥</Button>
        </div>
      )}

      {step === 'final' && (
        <div className="panel step-enter">
          <div className="picture-frame happy"><PixelMascot mood="final" /></div>
          <p className="eyebrow">mission accomplished</p>
          <h1 className="medium">IT&apos;S A DATE!</h1>
          <div className="ticket">
            <div><span>WHEN</span><strong>{formattedDate}</strong></div>
            <div><span>PLAN</span><strong>{chosenActivity?.icon} {chosenActivity?.label}</strong></div>
          </div>
          <div className="final-actions">
            <Button onClick={() => setShowLetter(true)}>OPEN NOTE 💌</Button>
            <button className="text-button" onClick={reset}>start over</button>
          </div>
        </div>
      )}

      {showLetter && (
        <div className="modal-backdrop" onClick={() => setShowLetter(false)}>
          <div className="letter step-enter" onClick={(event) => event.stopPropagation()}>
            <button className="close" onClick={() => setShowLetter(false)} aria-label="Close">×</button>
            <p className="letter-kicker">to: jessica ♡</p>
            <h2>Okay, you said yes.</h2>
            <p>
              This started as a silly little website, but I hope it made you smile.
              I&apos;m looking forward to spending time with you — no escaping button required.
            </p>
            <p>See you on our date. 🌷</p>
            <p className="signature">— your favorite IT guy (hopefully)</p>
          </div>
        </div>
      )}

      <footer>made with questionable amounts of pink &amp; code</footer>
    </Shell>
  );
}
