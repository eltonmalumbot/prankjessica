'use client';

import { useEffect, useRef, useState } from 'react';

const WIDTH = 520;
const HEIGHT = 300;
const HEART_SIZE = 28;
const PIPE_WIDTH = 46;
const GAP_HEIGHT = 112;
const TARGET_SCORE = 7;

function randomGapY() {
  return 56 + Math.random() * (HEIGHT - GAP_HEIGHT - 112);
}

export default function FlappyHeart({ onWin }) {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const phaseRef = useRef('ready');
  const heartRef = useRef({ x: 88, y: 136, vy: 0 });
  const pipesRef = useRef([]);
  const lastTimeRef = useRef(0);
  const [phase, setPhase] = useState('ready');
  const [score, setScore] = useState(0);

  const setGamePhase = (next) => {
    phaseRef.current = next;
    setPhase(next);
  };

  const resetWorld = () => {
    heartRef.current = { x: 88, y: 136, vy: 0 };
    pipesRef.current = [0, 1, 2].map((index) => ({
      x: 340 + index * 185,
      gapY: randomGapY(),
      passed: false,
    }));
    setScore(0);
  };

  const drawHeart = (ctx, x, y) => {
    ctx.save();
    ctx.translate(Math.round(x), Math.round(y));
    ctx.fillStyle = '#e63f87';
    ctx.fillRect(4, 0, 8, 8);
    ctx.fillRect(16, 0, 8, 8);
    ctx.fillRect(0, 4, 28, 12);
    ctx.fillRect(4, 16, 20, 4);
    ctx.fillRect(8, 20, 12, 4);
    ctx.fillRect(12, 24, 4, 4);
    ctx.fillStyle = '#ffadd0';
    ctx.fillRect(5, 4, 5, 5);
    ctx.restore();
  };

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    ctx.fillStyle = '#f7b4d4';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    ctx.fillStyle = 'rgba(255,255,255,.34)';
    for (let x = 0; x < WIDTH; x += 16) {
      for (let y = 0; y < HEIGHT; y += 16) {
        if ((x / 16 + y / 16) % 3 === 0) ctx.fillRect(x, y, 2, 2);
      }
    }

    ctx.fillStyle = 'rgba(255,250,253,.85)';
    ctx.fillRect(34, 54, 72, 22);
    ctx.fillRect(49, 42, 40, 12);
    ctx.fillRect(388, 38, 82, 22);
    ctx.fillRect(409, 24, 42, 14);

    pipesRef.current.forEach((pipe) => {
      const gapTop = pipe.gapY;
      const gapBottom = gapTop + GAP_HEIGHT;
      ctx.fillStyle = '#b63b76';
      ctx.fillRect(Math.round(pipe.x), 0, PIPE_WIDTH, gapTop);
      ctx.fillRect(Math.round(pipe.x), gapBottom, PIPE_WIDTH, HEIGHT - gapBottom);
      ctx.fillStyle = '#e672a8';
      ctx.fillRect(Math.round(pipe.x) + 6, 0, 7, gapTop);
      ctx.fillRect(Math.round(pipe.x) + 6, gapBottom, 7, HEIGHT - gapBottom);
      ctx.fillStyle = '#8e2859';
      ctx.fillRect(Math.round(pipe.x) - 5, gapTop - 13, PIPE_WIDTH + 10, 13);
      ctx.fillRect(Math.round(pipe.x) - 5, gapBottom, PIPE_WIDTH + 10, 13);
    });

    ctx.fillStyle = '#a52c63';
    ctx.fillRect(0, HEIGHT - 18, WIDTH, 18);
    ctx.fillStyle = '#d85b97';
    for (let x = 0; x < WIDTH; x += 18) ctx.fillRect(x, HEIGHT - 18, 9, 5);

    drawHeart(ctx, heartRef.current.x, heartRef.current.y);
  };

  const endGame = () => {
    setGamePhase('lost');
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
  };

  const gameLoop = (time) => {
    if (phaseRef.current !== 'playing') return;
    const previous = lastTimeRef.current || time;
    const frameScale = Math.min((time - previous) / 16.667, 1.7);
    lastTimeRef.current = time;

    const heart = heartRef.current;
    heart.vy += 0.39 * frameScale;
    heart.y += heart.vy * frameScale;

    let scored = false;
    pipesRef.current.forEach((pipe) => {
      pipe.x -= 2.65 * frameScale;

      if (!pipe.passed && pipe.x + PIPE_WIDTH < heart.x) {
        pipe.passed = true;
        scored = true;
      }

      if (pipe.x + PIPE_WIDTH < -10) {
        const farthest = Math.max(...pipesRef.current.map((item) => item.x));
        pipe.x = farthest + 185;
        pipe.gapY = randomGapY();
        pipe.passed = false;
      }
    });

    if (scored) {
      setScore((current) => {
        const updated = current + 1;
        if (updated >= TARGET_SCORE) {
          setGamePhase('won');
          if (rafRef.current) cancelAnimationFrame(rafRef.current);
          rafRef.current = null;
        }
        return updated;
      });
    }

    const hitPipe = pipesRef.current.some((pipe) => {
      const overlapX = heart.x + HEART_SIZE - 3 > pipe.x && heart.x + 3 < pipe.x + PIPE_WIDTH;
      const gapBottom = pipe.gapY + GAP_HEIGHT;
      return overlapX && (heart.y + 3 < pipe.gapY || heart.y + HEART_SIZE - 3 > gapBottom);
    });

    if (heart.y < -5 || heart.y + HEART_SIZE > HEIGHT - 18 || hitPipe) {
      endGame();
      draw();
      return;
    }

    draw();
    if (phaseRef.current === 'playing') rafRef.current = requestAnimationFrame(gameLoop);
  };

  const startGame = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    resetWorld();
    setGamePhase('playing');
    lastTimeRef.current = 0;
    heartRef.current.vy = -6.5;
    rafRef.current = requestAnimationFrame(gameLoop);
  };

  const flap = () => {
    if (phaseRef.current === 'ready' || phaseRef.current === 'lost') {
      startGame();
      return;
    }
    if (phaseRef.current === 'playing') heartRef.current.vy = -6.5;
  };

  useEffect(() => {
    resetWorld();
    draw();

    const onKeyDown = (event) => {
      if (event.code === 'Space' || event.code === 'ArrowUp') {
        event.preventDefault();
        flap();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (phase !== 'playing') draw();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, score]);

  return (
    <div className="flappy-wrap">
      <div className="game-hud">
        <span>SCORE <strong>{score}</strong> / {TARGET_SCORE}</span>
        <span>{phase === 'won' ? 'CLEAR! ♥' : 'TAP TO FLY'}</span>
      </div>
      <button
        type="button"
        className="flappy-stage"
        onPointerDown={(event) => {
          event.preventDefault();
          flap();
        }}
        aria-label="Flappy Heart game. Tap to make the heart fly."
      >
        <canvas ref={canvasRef} width={WIDTH} height={HEIGHT} />
        {phase !== 'playing' && (
          <div className={`game-overlay ${phase}`}>
            {phase === 'ready' && <><strong>READY?</strong><span>Tap anywhere to flap ♡</span></>}
            {phase === 'lost' && <><strong>OOPS!</strong><span>Tap to try again — you got this.</span></>}
            {phase === 'won' && <><strong>HEART DELIVERED!</strong><span>You made it through {TARGET_SCORE} gates ✨</span></>}
          </div>
        )}
      </button>
      <p className="game-help">Tap/click the game or press <b>Space</b>. Get {TARGET_SCORE} points to unlock the next surprise.</p>
      {phase === 'won' && (
        <button type="button" className="game-continue" onClick={onWin}>UNLOCK SURPRISE →</button>
      )}
    </div>
  );
}
