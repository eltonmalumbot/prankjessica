'use client';

import { useEffect, useRef, useState } from 'react';

const WIDTH = 430;
const HEIGHT = 220;
const COLS = 18;
const ROWS = 9;
const REVEAL_AT = 55;

export default function ScratchCard({ onComplete }) {
  const canvasRef = useRef(null);
  const drawingRef = useRef(false);
  const scratchedRef = useRef(new Set());
  const [progress, setProgress] = useState(0);
  const [revealed, setRevealed] = useState(false);

  const paintCover = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.globalCompositeOperation = 'source-over';
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    ctx.fillStyle = '#cf4c8b';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    ctx.fillStyle = '#ec84b4';
    for (let x = 0; x < WIDTH; x += 18) {
      for (let y = 0; y < HEIGHT; y += 18) {
        if ((x / 18 + y / 18) % 2 === 0) ctx.fillRect(x, y, 9, 9);
      }
    }

    ctx.fillStyle = '#fff4fa';
    ctx.font = 'bold 22px Courier New';
    ctx.textAlign = 'center';
    ctx.fillText('SCRATCH ME ♡', WIDTH / 2, HEIGHT / 2 - 3);
    ctx.font = 'bold 11px Courier New';
    ctx.fillText('there is definitely no scam here', WIDTH / 2, HEIGHT / 2 + 24);
  };

  useEffect(() => {
    paintCover();
  }, []);

  const scratchAt = (clientX, clientY) => {
    if (revealed) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * WIDTH;
    const y = ((clientY - rect.top) / rect.height) * HEIGHT;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 28, 0, Math.PI * 2);
    ctx.fill();

    const centerCol = Math.floor((x / WIDTH) * COLS);
    const centerRow = Math.floor((y / HEIGHT) * ROWS);
    for (let dx = -1; dx <= 1; dx += 1) {
      for (let dy = -1; dy <= 1; dy += 1) {
        const col = centerCol + dx;
        const row = centerRow + dy;
        if (col >= 0 && col < COLS && row >= 0 && row < ROWS) {
          scratchedRef.current.add(`${col}-${row}`);
        }
      }
    }

    const percent = Math.min(100, Math.round((scratchedRef.current.size / (COLS * ROWS)) * 100));
    setProgress(percent);
    if (percent >= REVEAL_AT) {
      setRevealed(true);
      ctx.clearRect(0, 0, WIDTH, HEIGHT);
    }
  };

  return (
    <div className="scratch-wrap">
      <div className={`scratch-card ${revealed ? 'revealed' : ''}`}>
        <div className="scratch-prize">
          <span className="prize-stars">✦ ♥ ✦</span>
          <p>CONGRATULATIONS!</p>
          <h2>YOU WON A DATE<br />WITH ELTON 😂</h2>
          <small>No refunds. Prize includes questionable jokes &amp; good company.</small>
        </div>
        <canvas
          ref={canvasRef}
          width={WIDTH}
          height={HEIGHT}
          onPointerDown={(event) => {
            drawingRef.current = true;
            event.currentTarget.setPointerCapture?.(event.pointerId);
            scratchAt(event.clientX, event.clientY);
          }}
          onPointerMove={(event) => {
            if (drawingRef.current) scratchAt(event.clientX, event.clientY);
          }}
          onPointerUp={() => { drawingRef.current = false; }}
          onPointerCancel={() => { drawingRef.current = false; }}
          onPointerLeave={(event) => {
            if (event.buttons === 0) drawingRef.current = false;
          }}
          aria-label="Scratch card. Drag your finger or mouse to reveal the prize."
        />
      </div>
      <div className="scratch-meter" aria-live="polite">
        <div><span style={{ width: `${Math.max(progress, revealed ? 100 : 0)}%` }} /></div>
        <strong>{revealed ? 'PRIZE UNLOCKED! ♥' : `${progress}% scratched`}</strong>
      </div>
      <p className="game-help">Scratch with your finger or mouse until the secret is revealed.</p>
      {revealed && (
        <button type="button" className="game-continue" onClick={onComplete}>CLAIM MY PRIZE →</button>
      )}
    </div>
  );
}
