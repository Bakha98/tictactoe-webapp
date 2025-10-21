(()=>{
  const boardEl = document.getElementById('board');
  const statusEl = document.getElementById('status');
  const xWinsEl = document.getElementById('xWins');
  const oWinsEl = document.getElementById('oWins');
  const drawsEl = document.getElementById('draws');
  const modeEl = document.getElementById('mode');
  const resetBtn = document.getElementById('reset');
  const WINS = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  const LS_KEY = 'ttt_stats_v1';
  let stats = JSON.parse(localStorage.getItem(LS_KEY) || '{"x":0,"o":0,"d":0}');
  const saveStats = () => localStorage.setItem(LS_KEY, JSON.stringify(stats));
  const syncStats = () => { xWinsEl.textContent = stats.x; oWinsEl.textContent = stats.o; drawsEl.textContent = stats.d; };
  let cells = Array(9).fill(null); let turn='X'; let frozen=false;
  function setStatus(text){ statusEl.innerHTML=text; }
  function renderBoard(){ boardEl.innerHTML=''; for(let i=0;i<9;i++){ const btn=document.createElement('button'); btn.className='cell'; btn.setAttribute('role','gridcell'); btn.setAttribute('aria-label',`Клетка ${i+1}`); btn.textContent=cells[i]||''; btn.addEventListener('pointerenter', e=>{btn.style.setProperty('--mx',`${e.offsetX}px`);btn.style.setProperty('--my',`${e.offsetY}px`)}); btn.addEventListener('mousemove', e=>{btn.style.setProperty('--mx',`${e.offsetX}px`);btn.style.setProperty('--my',`${e.offsetY}px`)}); btn.addEventListener('click',()=>onCell(i)); boardEl.appendChild(btn);} }
  function winner(brd){ for(const [a,b,c] of WINS){ if(brd[a]&&brd[a]===brd[b]&&brd[a]===brd[c]) return {player:brd[a], line:[a,b,c]}; } if(brd.every(Boolean)) return {player:'D', line:null}; return null; }
  function onCell(i){ if(frozen || cells[i]) return; move(i,turn); const w=winner(cells); if(w){ end(w); return; } const m=modeEl.value; if(m.startsWith('ai') && !frozen){ setTimeout(()=>{ aiMove(m); const w2=winner(cells); if(w2) end(w2); }, 220);} }
  function move(i,p){ cells[i]=p; boardEl.children[i].textContent=p; turn=(p==='X')?'O':'X'; setStatus(`Ход: <b>${turn}</b>`); }
  function end(res){ frozen=true; if(res.player==='D'){ setStatus('Ничья!'); stats.d++; saveStats(); syncStats(); return;} setStatus(`Победа: <b>${res.player}</b> 🎉`); stats[res.player.toLowerCase()]++; saveStats(); syncStats(); if(res.line){ for(const idx of res.line){ boardEl.children[idx].classList.add('win'); } } }
  function reset(){ cells=Array(9).fill(null); turn='X'; frozen=false; setStatus('Ход: <b>X</b>'); renderBoard(); }
  function aiMove(mode){ const me='O', you='X'; let idx=-1; if(mode==='ai_easy'){ if(Math.random()<0.6){ const empty=cells.map((v,i)=>v?null:i).filter(i=>i!==null); idx=empty[Math.floor(Math.random()*empty.length)]; } else { idx=bestMoveMinimax(me,you,3).idx; } } else if(mode==='ai_medium'){ idx=bestMoveMinimax(me,you,5).idx; } else { idx=bestMoveMinimax(me,you,9).idx; } if(idx!==-1) move(idx,me); }
  function bestMoveMinimax(me,you,depthLimit){ let best={idx:-1,score:-Infinity}; for(let i=0;i<9;i++){ if(!cells[i]){ cells[i]=me; const score=minimax(cells,false,me,you,depthLimit,-Infinity,+Infinity); cells[i]=null; if(score>best.score) best={idx:i,score}; } } return best; }
  function minimax(brd,isMax,me,you,depth,alpha,beta){ const res=winner(brd); if(res){ if(res.player==='D') return 0; return res.player===me?10:-10; } if(depth===0) return heuristic(brd,me,you); if(isMax){ let best=-Infinity; for(let i=0;i<9;i++){ if(!brd[i]){ brd[i]=me; best=Math.max(best,minimax(brd,false,me,you,depth-1,alpha,beta)); brd[i]=null; alpha=Math.max(alpha,best); if(beta<=alpha) break; } } return best; } else { let best=+Infinity; for(let i=0;i<9;i++){ if(!brd[i]){ brd[i]=you; best=Math.min(best,minimax(brd,true,me,you,depth-1,alpha,beta)); brd[i]=null; beta=Math.min(beta,best); if(beta<=alpha) break; } } return best; } }
  function heuristic(brd,me,you){ let score=0; for(const [a,b,c] of [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]]){ const line=[brd[a],brd[b],brd[c]]; const m=line.filter(v=>v===me).length; const y=line.filter(v=>v===you).length; if(m>0&&y===0) score+=(m===2?3:1); if(y>0&&m===0) score-=(y===2?3:1); } return score; }
  resetBtn.addEventListener('click', reset); modeEl.addEventListener('change', reset);
  reset();
  syncStats();
})();