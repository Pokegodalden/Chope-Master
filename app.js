import {Game} from './engine.js';
import {Renderer} from './render.js';
const $=id=>document.getElementById(id),keys={};let sound=false,audio=null,toastUntil=0,helpWasRunning=false,last=performance.now(),lastHud=0,lastContextKey='',lastTutorialStep=-1,savedRun=null;
function beep(freq=600){if(!sound)return;try{audio??=new AudioContext();audio.resume();const o=audio.createOscillator(),v=audio.createGain();o.type='sine';o.frequency.value=freq;v.gain.setValueAtTime(.07,audio.currentTime);v.gain.exponentialRampToValueAtTime(.001,audio.currentTime+.13);o.connect(v);v.connect(audio.destination);o.start();o.stop(audio.currentTime+.14);}catch{}}
function notify(message){$('toast').textContent=message;$('toast').classList.add('visible');toastUntil=performance.now()+4000;beep();}
const game=new Game(notify,result=>{keysClear();if(result.mode==='tutorial'){
 $('result-kicker').textContent='PRACTICE COMPLETE';$('result-title').textContent='You’re ready to chope!';$('result-copy').textContent='You moved, read the diner, saved four seats, ordered, collected supplies, and brought lunch home.';$('result-stats').innerHTML='<div><strong>7 / 7</strong><span>ACTIONS COMPLETED</span></div><div><strong>✓</strong><span>READY FOR THE RUSH</span></div>';$('again').textContent=savedRun?'Resume your lunch run →':'Start the lunch rush →';$('result-dialog').showModal();$('pause').disabled=true;return;
 }$('again').textContent='One more lunch run ↗';$('result-kicker').textContent=result.won?'LUNCH MISSION COMPLETE':'THE CBD WINS THIS ROUND';$('result-title').textContent=result.won?'Steady lah. Time to makan!':'Alamak. Lunch got away.';$('result-copy').textContent=result.won?'Four seats, four plates, four very happy colleagues. That’s a lunch break well spent.':result.reason+' Watch for the last sip, keep your reservation dry, and use the lanyard to beat the queue.';let best=0;try{best=Number(localStorage.getItem('chope-best-v2-'+result.mode)||0);if(result.won&&(!best||result.elapsed<best)){best=Math.ceil(result.elapsed);localStorage.setItem('chope-best-v2-'+result.mode,best);}}catch{}$('result-stats').innerHTML=`<div><strong>${fmt(result.elapsed)}</strong><span>TIME TAKEN</span></div><div><strong>${result.bumps}</strong><span>ROBOT BUMPS</span></div><div><strong>${best?fmt(best):'—'}</strong><span>PERSONAL BEST</span></div>`;$('result-dialog').showModal();$('pause').disabled=true;beep(result.won?880:240);});
const renderer=new Renderer($('game'),game);
function fmt(n){n=Math.ceil(Math.max(0,n));return `${Math.floor(n/60).toString().padStart(2,'0')}:${(n%60).toString().padStart(2,'0')}`;}
function keysClear(){for(const k in keys)delete keys[k];}
function start(){savedRun=null;lastTutorialStep=-1;game.start($('relaxed').checked?600:180);$('start-card').hidden=true;$('start-card').style.display='none';$('pause').disabled=false;$('pause-overlay').hidden=true;$('pause').textContent='Ⅱ';$('pause').setAttribute('aria-label','Pause game');$('game').focus({preventScroll:true});}
function syncRunUI(){
 keysClear();$('start-card').hidden=game.running||game.ended;$('start-card').style.display=game.running||game.ended?'none':'grid';$('pause').disabled=!game.running;$('pause-overlay').hidden=!game.paused;$('pause').textContent=game.paused?'▶':'Ⅱ';$('pause').setAttribute('aria-label',game.paused?'Resume game':'Pause game');updateHud();$('game').focus({preventScroll:true});
}
function startTutorial(){
 if(game.tutorial&&game.running)return;
 savedRun=game.running&&!game.tutorial?JSON.parse(JSON.stringify(game)):null;
 game.startTutorial();lastTutorialStep=-1;syncRunUI();document.querySelector('.mission-bar').scrollIntoView({block:'start',behavior:'smooth'});
}
function exitTutorial(){
 if(savedRun){Object.assign(game,savedRun);savedRun=null;}else game.reset($('relaxed').checked?600:180);
 lastTutorialStep=-1;syncRunUI();
}

function pause(force){if(!game.running)return;game.paused=typeof force==='boolean'?force:!game.paused;keysClear();$('pause-overlay').hidden=!game.paused;$('pause').textContent=game.paused?'▶':'Ⅱ';$('pause').setAttribute('aria-label',game.paused?'Resume game':'Pause game');}
function help(){helpWasRunning=game.running&&!game.paused;if(helpWasRunning)pause(true);$('help-dialog').showModal();}
function closeHelp(){$('help-dialog').close();}
$('help-dialog').addEventListener('close',()=>{if(helpWasRunning)pause(false);helpWasRunning=false;});
$('start').onclick=start;$('pause').onclick=()=>pause();$('resume').onclick=()=>pause(false);$('help').onclick=help;document.querySelector('.close-dialog').onclick=closeHelp;document.querySelector('.close-help').onclick=closeHelp;
$('again').onclick=()=>{$('result-dialog').close();if(game.tutorial&&savedRun)exitTutorial();else start();};$('result-dialog').addEventListener('cancel',e=>{e.preventDefault();$('result-dialog').close();if(game.tutorial){exitTutorial();return;}game.reset($('relaxed').checked?600:180);$('start-card').style.display='grid';$('start-card').hidden=false;});
$('sound').onclick=()=>{sound=!sound;$('sound').setAttribute('aria-label',sound?'Mute sound':'Enable sound');$('sound').title=sound?'Mute sound':'Enable sound';document.querySelector('.sound-dot').style.background=sound?'#71a476':'#ed653b';beep();};
$('tissue').onclick=()=>game.interact();$('umbrella').onclick=()=>game.useUmbrella();$('lanyard').onclick=()=>game.useLanyard();$('touch-action').onclick=()=>game.interact();$('context-action').onclick=()=>game.interact();$('context-secondary').onclick=()=>{const secondary=game.interaction()?.secondary;if(secondary?.action==='umbrella')game.useUmbrella();if(secondary?.action==='lanyard')game.useLanyard();};$('start-tutorial').onclick=startTutorial;$('quick-tutorial').onclick=startTutorial;$('exit-tutorial').onclick=exitTutorial;$('relaxed').onchange=()=>{if(!game.running){game.reset($('relaxed').checked?600:180);updateHud();}};
window.addEventListener('keydown',e=>{if($('help-dialog').open||$('result-dialog').open)return;const key=e.key.length===1?e.key.toLowerCase():e.key;if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' ','Shift'].includes(key)&&game.running)e.preventDefault();if((key==='p'||key==='Escape')&&!e.repeat){pause();return;}if(['INPUT','BUTTON'].includes(document.activeElement?.tagName)&&!game.running)return;keys[key]=true;if(!e.repeat){if(key==='e')game.interact();if(key==='u')game.useUmbrella();if(key==='l')game.useLanyard();}});
window.addEventListener('keyup',e=>{keys[e.key.length===1?e.key.toLowerCase():e.key]=false;});window.addEventListener('blur',()=>{keysClear();if(game.running&&!game.paused)pause(true);});document.addEventListener('visibilitychange',()=>{if(document.hidden&&game.running)pause(true);});
$('game').addEventListener('pointerdown',e=>{const r=$('game').getBoundingClientRect();game.walkTo({x:(e.clientX-r.left)/r.width*960,y:(e.clientY-r.top)/r.height*650});$('game').focus({preventScroll:true});});
document.querySelectorAll('[data-key]').forEach(b=>{b.addEventListener('pointerdown',e=>{e.preventDefault();b.setPointerCapture(e.pointerId);keys[b.dataset.key]=true;});for(const event of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(event,()=>{keys[b.dataset.key]=false;});});
function updateHud(){
 $('timer').textContent=game.tutorial?'∞':fmt(game.left);$('timer').classList.toggle('urgent',!game.tutorial&&game.left<60);$('time-fill').style.width=game.tutorial?'100%':(game.left/game.duration*100)+'%';
 $('tissue-count').textContent='×'+game.tissues;$('umbrella-count').textContent=game.umbrella?'×1':'✓';$('lanyard-count').textContent=game.lanyard?'×1':'✓';
 for(const [id,done] of [['table',game.reserved!==null],['food',game.food],['sit',game.won]]){const item=$('obj-'+id);item.classList.toggle('done',!!done);item.querySelector('.status-mark').textContent=done?'✓':'○';item.classList.toggle('current',game.running&&!done&&(id==='table'?game.reserved===null:id==='food'?game.reserved!==null&&!game.food:game.food));}
 $('phase-label').textContent=game.tutorial?'GUIDED PRACTICE':!game.running?game.ended?'LUNCH RUN COMPLETE':'READY FOR THE RUSH?':game.paused?'LUNCH BREAK PAUSED':({scout:'01 · SCOUT & CHOPE',order:'02 · PLACE YOUR ORDER',prepare:'03 · PREPARE & PICK UP',return:'04 · BRING LUNCH HOME'})[game.phase];
 $('weather').innerHTML=game.tutorial?'☀ <span>NO TIMER · NO RIVALS</span>':game.rain?'☂ <span>RAIN · '+Math.ceil(game.rainIn)+'s TO CLEAR</span>':(game.forecastShown?'☁':'☀')+' <span>'+(game.forecastShown?'RAIN IN '+Math.ceil(game.rainIn)+'s':'32°C · SUNNY FOR NOW')+'</span>';
 $('ticket').hidden=game.orderState==='none'||game.food;$('ticket-time').textContent=game.orderState==='ready'?'4 plates ready':game.tutorial?'Gather supplies':fmt(game.queue)+' · cooking';$('ticket-supplies').textContent=game.supplies.map(s=>(s.collected?'✓ ':'○ ')+(s.id==='chilli'?'Chilli':'Cutlery')).join(' · ');
 $('tutorial-coach').hidden=!game.tutorial||!game.running;
 if(game.tutorial&&lastTutorialStep!==game.tutorial.step){const lesson=game.tutorialLesson();$('tutorial-step').textContent='PRACTICE '+(game.tutorial.step+1)+' / 7';$('tutorial-title').textContent=lesson.title;$('tutorial-instruction').textContent=lesson.text;lastTutorialStep=game.tutorial.step;}
 updateInteractionHud();
}
function updateInteractionHud(){
 const context=game.interaction();
 const active=!!context?.enabled;
 const fallback=game.paused?'Resume to interact':game.running?'Move closer to a target':'Start your lunch run';
 const title=context?.title||'Nothing in reach yet';
 const detail=context?.detail||'Walk to a table, the red chicken rice stall, or a supply point. The nearest target will be outlined.';
 const label=context?.label||fallback;
 for(const id of ['context-action','touch-action']){
  const button=$(id);button.disabled=!active;
  button.replaceChildren(document.createTextNode(label));
  if(active){const key=document.createElement('kbd');key.textContent='E';key.setAttribute('aria-hidden','true');button.append(key);}
  button.setAttribute('aria-label',label+(context?' — '+title:''));
 }
 $('action-dock').hidden=!game.running;
 $('action-dock').classList.toggle('unavailable',!active);
 $('action-target').textContent=context?.title||'';
 
 const secondary=context?.secondary;
 $('tissue').disabled=context?.action!=='chope';
 $('tissue').title=context?.action==='chope'?'Reserve the highlighted table':'Move beside a free table to use a tissue packet';
 $('umbrella').disabled=secondary?.action!=='umbrella';
 $('umbrella').title=game.umbrella?'Use beside your own outdoor table':'Umbrella already deployed';
 $('lanyard').disabled=secondary?.action!=='lanyard';
 $('lanyard').title=game.lanyard?'Use at the red chicken rice stall after reserving a table':'Express pass already used';
 $('context-secondary').hidden=!secondary;
 if(secondary){$('context-secondary').replaceChildren(document.createTextNode(secondary.action==='umbrella'?'Umbrella':'Express −12s'));const key=document.createElement('kbd');key.textContent=secondary.key;key.setAttribute('aria-hidden','true');$('context-secondary').append(key);}
 // Announce target/action changes, not the ticking countdown every 100ms.
 const semanticKey=context?[context.kind,context.id,context.action,context.label.replace(/\d+/g,'#'),context.secondary?.action].join(':'):fallback;
 if(semanticKey!==lastContextKey){$('context-announcement').textContent=game.running?title+'. '+label+(active?'. Press E.':'. '+detail)+(secondary?' '+secondary.label+'. Press '+secondary.key+'.':''):'';lastContextKey=semanticKey;}
}

function frame(now){const dt=Math.min((now-last)/1000,.1);last=now;game.update(dt,keys);renderer.draw(dt);if(now-lastHud>100){updateHud();lastHud=now;}if(now>toastUntil)$('toast').classList.remove('visible');requestAnimationFrame(frame);}updateHud();requestAnimationFrame(frame);
