'use client';

import { useEffect, useMemo, useState } from 'react';

export function CatchHearts({ onWin }) {
  const [score, setScore] = useState(0);
  const [pos, setPos] = useState({ x: 48, y: 48 });
  const target = 6;
  const catchHeart = () => {
    if (score >= target) return;
    const next = score + 1;
    setScore(next);
    setPos({ x: 8 + Math.random() * 80, y: 10 + Math.random() * 70 });
  };
  return <div className="mini-wrap">
    <div className="mini-hud"><span>CAUGHT <b>{score}</b> / {target}</span><span>catch my heart ♡</span></div>
    <div className="catch-field">
      <button className="catch-heart" style={{left:`${pos.x}%`,top:`${pos.y}%`}} onClick={catchHeart} aria-label="Catch the heart">♥</button>
      {score >= target && <div className="mini-win"><strong>YOU CAUGHT MY HEART!</strong><span>okay that was suspiciously easy 💗</span></div>}
    </div>
    {score >= target && <button className="game-continue" onClick={onWin}>NEXT QUEST →</button>}
  </div>;
}

const mazePath = new Set(['0-0','1-0','1-1','1-2','0-2','0-3','1-3','2-3','2-2','3-2','4-2','4-3','4-4']);
export function LoveMaze({ onWin }) {
  const [p, setP] = useState({r:0,c:0});
  const won = p.r === 4 && p.c === 4;
  const move = (dr,dc) => {
    const n={r:p.r+dr,c:p.c+dc};
    if(n.r>=0&&n.r<5&&n.c>=0&&n.c<5&&mazePath.has(`${n.r}-${n.c}`)) setP(n);
  };
  useEffect(()=>{
    const key=(e)=>{
      const dirs={ArrowUp:[-1,0],ArrowDown:[1,0],ArrowLeft:[0,-1],ArrowRight:[0,1]};
      if(dirs[e.key]){e.preventDefault();move(...dirs[e.key]);}
    };
    window.addEventListener('keydown',key); return()=>window.removeEventListener('keydown',key);
  });
  return <div className="mini-wrap">
    <div className="maze-grid">{Array.from({length:25},(_,i)=>{const r=Math.floor(i/5),c=i%5,key=`${r}-${c}`,open=mazePath.has(key);return <div key={key} className={`maze-cell ${open?'open':'wall'}`}>{p.r===r&&p.c===c?'💗':r===4&&c===4?'🎀':''}</div>})}</div>
    <div className="maze-controls"><span/><button onClick={()=>move(-1,0)}>▲</button><span/><button onClick={()=>move(0,-1)}>◀</button><button onClick={()=>move(1,0)}>▼</button><button onClick={()=>move(0,1)}>▶</button></div>
    <p className="game-help">Guide the heart to the ribbon. Arrow keys work too.</p>
    {won && <><div className="inline-win">MAZE CLEARED ♥</div><button className="game-continue" onClick={onWin}>NEXT QUEST →</button></>}
  </div>;
}

const memoryCards=[['heart','♥'],['coffee','☕'],['movie','🎬'],['flower','🌷'],['coffee','☕'],['flower','🌷'],['heart','♥'],['movie','🎬']];
export function MemoryMatch({ onWin }) {
  const [open,setOpen]=useState([]); const [matched,setMatched]=useState([]);
  const click=(i)=>{
    if(open.length===2||open.includes(i)||matched.includes(i))return;
    const next=[...open,i]; setOpen(next);
    if(next.length===2){
      if(memoryCards[next[0]][0]===memoryCards[next[1]][0]){setTimeout(()=>{setMatched(m=>[...m,...next]);setOpen([])},300)}
      else setTimeout(()=>setOpen([]),650);
    }
  };
  const won=matched.length===memoryCards.length;
  return <div className="mini-wrap"><div className="memory-grid">{memoryCards.map((card,i)=>{const shown=open.includes(i)||matched.includes(i);return <button key={i} onClick={()=>click(i)} className={`memory-card ${shown?'shown':''} ${matched.includes(i)?'matched':''}`}>{shown?card[1]:'?'}</button>})}</div><p className="game-help">Match all four pairs. Proof that we&apos;re a match? 👀</p>{won&&<><div className="inline-win">LOOKS LIKE WE&apos;RE A MATCH ✨</div><button className="game-continue" onClick={onWin}>NEXT QUEST →</button></>}</div>;
}

export function RightHeart({ onWin }) {
  const [round,setRound]=useState(0); const [found,setFound]=useState(false); const [message,setMessage]=useState('One of these hearts is definitely the correct one.');
  const right=useMemo(()=>round%5,[round]);
  const pick=(i)=>{
    if(i===right){setFound(true);setMessage('Correct. Obviously you know my heart. 💗');}
    else {setMessage('Nope 😂 it moved. Try again.');setRound(r=>r+1);}
  };
  return <div className="mini-wrap"><div className="heart-choice-row">{[0,1,2,3,4].map(i=><button key={`${round}-${i}`} onClick={()=>pick(i)} className="mystery-heart">♥</button>)}</div><p className="game-help">{message}</p>{found&&<button className="game-continue" onClick={onWin}>NEXT QUEST →</button>}</div>;
}

const quiz=[
  {q:'Ideal date energy?',a:['Cute & chill','Chaotic & funny','Food first'],reply:'Correct. All three are acceptable.'},
  {q:'Most important item?',a:['Good mood','Snacks','A fully charged phone'],reply:'Excellent survival instincts.'},
  {q:'Final question: who has great taste?',a:['Jessica','Obviously Jessica','Still Jessica'],reply:'100% correct answer.'}
];
export function LoveQuiz({ onWin }) {
  const [index,setIndex]=useState(0); const [note,setNote]=useState(''); const done=index>=quiz.length;
  const answer=()=>{setNote(quiz[index].reply);setTimeout(()=>{setIndex(i=>i+1);setNote('')},450)};
  if(done)return <div className="mini-wrap"><div className="quiz-result"><strong>3 / 3 PERFECT</strong><span>Totally scientific compatibility test ✅</span></div><button className="game-continue" onClick={onWin}>NEXT QUEST →</button></div>;
  return <div className="mini-wrap"><div className="quiz-box"><small>QUESTION {index+1} / {quiz.length}</small><h3>{quiz[index].q}</h3><div className="quiz-options">{quiz[index].a.map(a=><button key={a} onClick={answer}>{a}</button>)}</div>{note&&<p>{note}</p>}</div></div>;
}

const wheelItems=['Coffee','Movie','Dinner','Dessert','Walk','Arcade'];
export function DateWheel({ onWin }) {
  const [spinning,setSpinning]=useState(false); const [rotation,setRotation]=useState(0); const [result,setResult]=useState('');
  const spin=()=>{
    if(spinning)return; setSpinning(true); setResult('');
    const idx=Math.floor(Math.random()*wheelItems.length); const extra=1440+(360-idx*60); setRotation(r=>r+extra);
    setTimeout(()=>{setResult(wheelItems[idx]);setSpinning(false)},1800);
  };
  return <div className="mini-wrap"><div className="wheel-area"><div className="wheel-pointer">▼</div><div className="date-wheel" style={{transform:`rotate(${rotation}deg)`}}>{wheelItems.map((x,i)=><span key={x} style={{transform:`rotate(${i*60}deg) translateY(-92px) rotate(${-i*60}deg)`}}>{x}</span>)}</div></div><button className="game-continue" disabled={spinning} onClick={spin}>{spinning?'SPINNING...':'SPIN THE DATE WHEEL'}</button>{result&&<div className="wheel-result"><strong>DESTINY SAYS: {result.toUpperCase()} ✨</strong><span>You can still choose whatever you want later.</span><button className="game-continue" onClick={()=>onWin(result)}>CONTINUE →</button></div>}</div>;
}
