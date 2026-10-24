export const WIDTH=960,HEIGHT=650;
export const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
export class Game {
 constructor(notify=()=>{},onEnd=()=>{}){this.notify=notify;this.onEnd=onEnd;this.reset();}
 reset(duration=180){this.duration=duration;this.left=duration;this.elapsed=0;this.running=false;this.paused=false;this.ended=false;this.won=false;this.player={x:480,y:608};this.tissues=3;this.umbrella=true;this.lanyard=true;this.food=false;this.reserved=null;this.queue=0;this.queueTotal=70;this.orderState='none';this.forecastShown=false;this.returnRush=false;this.reservationSeconds=duration>=600?150:110;this.tutorial=null;this.supplies=[{id:'chilli',name:'Chilli sauce',x:240,y:535,collected:false},{id:'cutlery',name:'Cutlery',x:660,y:535,collected:false}];this.scenery=[{x:30,y:209,r:20},{x:30,y:466,r:20},{x:928,y:339,r:20},{x:731,y:617,r:23},{x:52,y:590,r:30}];this.stamina=100;this.bumpCooldown=0;this.bumps=0;this.rain=false;this.rainIn=55;this.path=[];this.sneaking=false;this.sprinting=false;this.tables=[];const times=[68,130,90,42,110,76,160,54,145,180,100,62];for(let row=0;row<3;row++)for(let col=0;col<4;col++){let i=row*4+col;this.tables.push({id:i+1,x:[138,350,563,800][col],y:[225,379,527][row],outdoor:col===3,state:'occupied',leave:times[i],protected:false,wet:0,hold:0});}this.robots=[{x:240,y:300,dir:1},{x:665,y:450,dir:-1}];this.rivals=[{x:95,y:610,color:'#c86878',target:null,path:[],think:47},{x:900,y:180,color:'#a987bf',target:null,path:[],think:60}];}
 start(duration=180){this.reset(duration);this.running=true;this.notify('Scout the room. Outdoor seats free first; sheltered seats take longer.');}
 startTutorial(){
  this.reset(600);this.running=true;this.tutorial={step:0,moved:false};this.robots=[];this.rivals=[];
  this.tables.forEach(t=>{t.state='occupied';t.leave=999;});this.tables[5].leave=3;
  this.notify('Practice run. No timer, rivals, or penalties. Follow the highlighted target.');
 }
 tutorialLesson(){
  if(!this.tutorial)return null;
  const lessons=[
   {title:'Move into the aisle',text:'Use WASD, arrow keys, or tap the glowing marker.',target:{x:480,y:450}},
   {title:'Read the diner, then chope',text:'Walk to table 06. Wait for the last sip, then press E or tap Chope.',target:{x:350,y:379}},
   {title:'Order four plates',text:'Go to the red chicken rice stall. Press E to order, or use L for express.',target:{x:465,y:165}},
   {title:'Pick up the chilli',text:'Walk beside the red chilli station near the entrance. Press E to collect.',target:this.supplies[0]},
   {title:'Pick up the cutlery',text:'Walk beside the cutlery station. Press E to collect.',target:this.supplies[1]},
   {title:'Collect your order',text:'Your ticket is ready. Return to the red stall and press E.',target:{x:465,y:165}},
   {title:'Return and makan',text:'Walk back to your table 06 and press E to sit down.',target:{x:350,y:379}}
  ];return lessons[this.tutorial.step];
 }
 updateTutorial(dt){
  const t=this.tutorial;
  if(t.step===0&&dist(this.player,{x:480,y:450})<30)t.step=1;
  if(t.step===1){const table=this.tables[5];if(table.state==='occupied'&&dist(this.player,table)<115){table.leave=Math.max(0,table.leave-dt);if(table.leave<=0)table.state='free';}if(this.reserved===6)t.step=2;}
  if(t.step===2&&this.orderState!=='none')t.step=3;
  if(t.step===3&&this.supplies[0].collected)t.step=4;
  if(t.step===4&&this.supplies[1].collected){if(this.orderState==='preparing')this.completePreparation();t.step=5;}
  if(t.step===5&&this.food)t.step=6;
 }

 get phase(){return this.food?(this.reserved===null?'scout':'return'):this.orderState!=='none'?'prepare':this.reserved!==null?'order':'scout';}
 nearbySupply(){return this.orderState==='preparing'?this.supplies.find(s=>!s.collected&&dist(this.player,s)<95):null;}
 placeOrder(){this.orderState='preparing';this.queue=this.queueTotal;this.notify('Ticket #04! Collect chilli and cutlery while Uncle cooks: each saves 10s.');}
 completePreparation(){this.queue=0;this.orderState='ready';this.notify('Ticket #04 is ready! Collect all four plates at the red stall.');}
 weatherUpdate(){
  if(this.elapsed>=8&&!this.forecastShown){this.forecastShown=true;this.notify('Rain forecast at 12:15:55. Outdoor seats free first—bring your umbrella!');}
  const firstRain=55,cycle=120,duration=65;
  const rainNow=this.elapsed>=firstRain&&(this.elapsed-firstRain)%cycle<duration;
  if(rainNow!==this.rain){this.rain=rainNow;this.notify(rainNow?'Downpour! Protect your outdoor table before its tissue washes away.':'Rain has cleared. Outdoor tables are open again.');}
  this.rainIn=this.elapsed<firstRain?firstRain-this.elapsed:this.rain?duration-(this.elapsed-firstRain)%cycle:cycle-(this.elapsed-firstRain)%cycle;
 }
 obstacles(x,y,r=13){
  if(x<26||x>934||y<150||y>624)return true;
  for(const t of this.tables){
   if(Math.abs(t.x-x)<56+r&&Math.abs(t.y-y)<31+r)return true;
   // Stools and seated diners have their own solid footprint.
   for(const sx of [-35,35])for(const sy of [-44,44])if(Math.hypot(x-t.x-sx,y-t.y-sy)<14+r)return true;
  }
  if(this.scenery.some(p=>Math.hypot(x-p.x,y-p.y)<p.r+r))return true;
  // Keep the entire walking sprite out of the pickup display, not just its feet.
  return this.supplies.some(s=>Math.abs(x-s.x)<34+r&&y>s.y-37-r&&y<s.y+34+r);
 }
 move(entity,dx,dy){
  const allAgents=[this.player,...this.rivals,...this.robots];const agents=allAgents.includes(entity)?allAgents:[];
  const blocked=(x,y)=>this.obstacles(x,y)||agents.some(a=>a!==entity&&Math.hypot(a.x-x,a.y-y)<27);
  // Small swept steps prevent sprinting or a long frame from crossing a stool.
  const steps=Math.max(1,Math.ceil(Math.hypot(dx,dy)/4));
  for(let i=0;i<steps;i++){if(!blocked(entity.x+dx/steps,entity.y))entity.x+=dx/steps;if(!blocked(entity.x,entity.y+dy/steps))entity.y+=dy/steps;}
 }
 route(from,to){
  const routeAgents=[this.player,...this.rivals,...this.robots].filter(a=>a!==from&&dist(a,from)>27);const blocked=(x,y)=>this.obstacles(x,y)||routeAgents.some(a=>Math.hypot(a.x-x,a.y-y)<29);
  const step=10,cols=96,key=p=>p.y*cols+p.x;
  const cell=p=>({x:Math.max(3,Math.min(93,Math.round(p.x/step))),y:Math.max(15,Math.min(62,Math.round(p.y/step)))});
  const nearestOpen=point=>{let result=cell(point);if(!blocked(result.x*step,result.y*step))return result;let best=Infinity;for(let y=15;y<=62;y++)for(let x=3;x<=93;x++){if(blocked(x*step,y*step))continue;const d=Math.hypot(x*step-point.x,y*step-point.y);if(d<best){best=d;result={x,y};}}return result;};
  const a=nearestOpen(from),target=nearestOpen(to),queue=[a],seen=new Map([[key(a),null]]);let end=null;
  for(let i=0;i<queue.length;i++){const p=queue[i];if(key(p)===key(target)){end=p;break;}for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const n={x:p.x+dx,y:p.y+dy};if(n.x<3||n.x>93||n.y<15||n.y>62||seen.has(key(n))||blocked(n.x*step,n.y*step)||blocked((p.x+n.x)*step/2,(p.y+n.y)*step/2))continue;seen.set(key(n),p);queue.push(n);}}
  if(!end)return [];const path=[];while(end){path.push({x:end.x*step,y:end.y*step});end=seen.get(key(end));}return path.reverse();
 }
 walkPath(entity,path,speed,dt){
  if(!path.length)return;
  const p=path[0],d=dist(entity,p),before={x:entity.x,y:entity.y};
  if(d<speed*dt+2){this.move(entity,p.x-entity.x,p.y-entity.y);if(dist(entity,p)<2)path.shift();}else this.move(entity,(p.x-entity.x)/d*speed*dt,(p.y-entity.y)/d*speed*dt);
  entity.stuck=dist(before,entity)<.2?(entity.stuck||0)+dt:0;
  if(entity.stuck>.4&&path.length){const goal=path.at(-1),replacement=this.route(entity,goal);path.splice(0,path.length,...replacement);entity.stuck=0;}
 }
 walkTo(p){if(!this.running||this.paused)return;const supply=this.supplies.find(s=>Math.abs(p.x-s.x)<42&&Math.abs(p.y-s.y)<48);if(supply)p={x:supply.x,y:supply.y+80};let t=this.tables.find(t=>Math.abs(t.x-p.x)<75&&Math.abs(t.y-p.y)<50);if(t)p={x:t.x,y:t.y+70};this.path=this.route(this.player,p);}
 nearest(){let table=this.tables.reduce((best,t)=>!best||dist(this.player,t)<dist(this.player,best)?t:best,null);return table&&dist(this.player,table)<115?table:null;}
 atStall(){return this.player.y<202&&Math.abs(this.player.x-465)<107;}
 interaction(){
  if(!this.running||this.paused)return null;
  const supply=this.nearbySupply();
  if(supply)return {kind:'supply',id:supply.id,target:supply,title:supply.name+' station',action:'collect',label:'Collect '+supply.name.toLowerCase(),enabled:true,detail:'Saves 10 seconds on your chicken rice order.',secondary:null};
  if(this.atStall()){
   const result={kind:'stall',id:'chicken-rice',target:{x:467,y:130},title:'Uncle’s chicken rice',secondary:null};
   if(this.food)return {...result,action:'blocked',label:'Lunch already collected',enabled:false,detail:'Return to your reserved table and sit down to makan.'};
   if(this.orderState==='ready')return {...result,action:'pickup',label:'Collect 4 plates',enabled:true,detail:'Ticket #04 is ready. Bring lunch back to your table.'};
   if(this.orderState==='preparing')return {...result,action:'blocked',label:this.tutorial?'Collect supplies':'Cooking · '+Math.ceil(this.queue)+'s',enabled:false,detail:'Your ticket keeps cooking. Collect chilli and cutlery to save time.',secondary:this.lanyard?{key:'L',label:'Save 12s with lanyard',action:'lanyard'}:null};
   if(this.reserved===null)return {...result,action:'blocked',label:'Chope a table first',enabled:false,detail:'Find four free seats and reserve them before ordering lunch.'};
   return {...result,action:'order',label:'Order chicken rice',enabled:true,detail:'Four plates for your crew. Cooking continues while you walk.',secondary:this.lanyard?{key:'L',label:'Order express · save 12s',action:'lanyard'}:null};
  }
  const t=this.nearest();if(!t)return null;
  const result={kind:'table',id:t.id,target:t,title:'Table '+String(t.id).padStart(2,'0')+' · '+(t.outdoor?'Outdoor':'Sheltered'),secondary:null};
  if(t.state==='occupied')return {...result,action:'blocked',label:'Seats occupied',enabled:false,detail:this.clue(t)};
  if(t.state==='rival')return {...result,action:'blocked',label:'Choped by a rival',enabled:false,detail:'This table is taken. Look for four free seats.'};
  if(t.state==='free'){
   if(this.reserved!==null)return {...result,action:'blocked',label:'You already have a table',enabled:false,detail:'Your crew’s seats are saved at table '+String(this.reserved).padStart(2,'0')+'.'};
   if(!this.tissues)return {...result,action:'blocked',label:'No tissue packets left',enabled:false,detail:'You need a tissue packet to reserve four seats.'};
   return {...result,action:'chope',label:'Chope 4 seats',enabled:true,detail:t.outdoor?'Uses 1 tissue packet. Outdoor seats need an umbrella in rain.':'Uses 1 tissue packet. These seats are sheltered from rain.'};
  }
  if(t.state==='yours')return {...result,action:this.food?'sit':'check',label:this.food?'Sit & makan':'Check reservation',enabled:true,detail:this.food?'Four plates, four seats. Finish your lunch run!':this.clue(t)+(this.orderState==='none'?'. Order lunch at the red stall.':'. Your pickup ticket is at the red stall.'),secondary:t.outdoor&&!t.protected&&this.umbrella?{key:'U',label:'Protect table with umbrella',action:'umbrella'}:null};
  return null;
 }
 clue(t){if(t.state==='yours'&&this.tutorial)return 'Your practice table is reserved.';if(t.state==='yours')return `${t.protected?'Umbrella protected · ':''}${Math.ceil(t.hold)}s left on your reservation`;if(t.state==='rival')return 'Already choped. Look for another table.';if(t.state==='free')return t.outdoor?'Four free seats · outdoors. Watch the weather!':'Four free seats · sheltered. Chope now!';if(t.leave<14)return 'Last sip of teh. They’ll leave any moment.';if(t.leave<35)return 'Stacking plates. Lunch is nearly over.';if(t.leave>70)return 'Laptop just opened. This could take a while.';return 'Still eating. Give them a little time.';}
 interact(){
  if(!this.running||this.paused)return;
  const context=this.interaction();
  if(!context){this.notify('Move closer to a table, supply point, or the red chicken rice stall.');return;}
  if(!context.enabled){this.notify(context.detail);return;}
  const supply=this.nearbySupply();
  if(supply){supply.collected=true;this.queue=Math.max(0,this.queue-10);this.notify(supply.name+' collected. Uncle saves 10 seconds!');if(this.queue<=0)this.completePreparation();return;}
  if(this.atStall()){
   if(this.food){this.notify('Four plates ready. Get everyone seated!');return;}
   if(this.orderState==='ready'){this.food=true;this.orderState='collected';this.returnRush=true;this.notify('Lunch collected! Tray return traffic is picking up. Head back to your table.');return;}
   if(this.orderState==='preparing'){this.notify('Ticket #04: '+Math.ceil(this.queue)+'s. You can leave the queue and collect supplies.');return;}
   if(this.reserved===null){this.notify('Chope a table first. Your crew needs four seats!');return;}
   this.placeOrder();return;
  }
  const t=this.nearest();
  if(!t){this.notify('Get closer to a table, supply point, or the chicken rice stall.');return;}
  if(t.state==='yours'){if(this.food){this.finish(true);return;}this.notify(this.orderState==='none'?'Seats saved. Place your order at the red chicken rice stall.':'Your seats are saved. Check your pickup ticket for lunch.');return;}
  if(t.state==='free'){
   if(this.reserved!==null){this.notify('You already have a table. Go get lunch!');return;}
   if(!this.tissues){this.finish(false,'You ran out of tissue packets.');return;}
   t.state='yours';t.hold=this.reservationSeconds;t.wet=0;this.reserved=t.id;this.tissues--;
   this.notify(this.tutorial?'Practice table secured. Next: order at the red stall.':'Table '+t.id+' secured for '+this.reservationSeconds+'s. '+(t.outdoor?'Rain is coming—deploy your umbrella with U!':'Head to the red stall for your order.'));return;
  }
  this.notify(this.clue(t));
 }
 useUmbrella(){if(!this.running||this.paused)return;const t=this.nearest();if(!this.umbrella){this.notify('Your umbrella is already deployed.');return;}if(!t||t.state!=='yours'||!t.outdoor){this.notify('Use your umbrella beside your own outdoor table.');return;}t.protected=true;t.wet=0;this.umbrella=false;this.notify('Umbrella up! This table is safe from the rain.');}
 useLanyard(){
  if(!this.running||this.paused)return;
  if(!this.atStall()){this.notify('Flash your lanyard at the chicken rice stall.');return;}
  if(this.food||this.orderState==='ready'){this.notify('Your food is already ready. Press E to collect it.');return;}
  if(this.reserved===null&&this.orderState==='none'){this.notify('Secure your table before ordering.');return;}
  if(!this.lanyard){this.notify('Express pass already used.');return;}
  if(this.orderState==='none')this.placeOrder();
  this.lanyard=false;this.queue=Math.max(0,this.queue-12);
  this.notify('Office express! 12 seconds saved. Grab supplies while Uncle cooks.');
  if(this.queue<=0)this.completePreparation();
 }
 loseTable(t,reason){t.state='free';t.protected=false;t.wet=0;this.reserved=null;this.notify(reason);if(!this.tissues)this.finish(false,'Your last reservation was lost. No tissue packets left.');}
 finish(won,reason='The lunch break is over.'){if(this.ended)return;this.running=false;this.ended=true;this.won=won;this.onEnd({won,reason,elapsed:this.elapsed,mode:this.tutorial?'tutorial':this.duration>=600?'relaxed':'rush',bumps:this.bumps,tissues:this.tissues});}
 update(dt,keys={}){if(!this.running||this.paused)return;dt=Math.min(dt,.1);if(!this.tutorial){this.elapsed+=dt;this.left=Math.max(0,this.left-dt);}if(this.left<=0){this.finish(false);return;}this.bumpCooldown=Math.max(0,this.bumpCooldown-dt);if(!this.tutorial)this.weatherUpdate();
 let dx=Number(!!(keys.ArrowRight||keys.d))-Number(!!(keys.ArrowLeft||keys.a)),dy=Number(!!(keys.ArrowDown||keys.s))-Number(!!(keys.ArrowUp||keys.w));this.sneaking=!!keys.Shift;this.sprinting=!!keys[' ']&&this.stamina>1&&!this.sneaking&&(dx||dy||this.path.length);let speed=this.sneaking?60:this.sprinting?220:133;if(this.rain&&this.player.x>710)speed*=.75;if(this.food)speed*=.92;this.stamina=Math.max(0,Math.min(100,this.stamina+(this.sprinting?-29:19)*dt));if(dx||dy){this.path=[];const d=Math.hypot(dx,dy);this.move(this.player,dx/d*speed*dt,dy/d*speed*dt);}else this.walkPath(this.player,this.path,speed,dt);
 if(this.tutorial){this.updateTutorial(dt);return;}
 for(const t of this.tables){if(t.state==='occupied'){t.leave-=dt;if(t.leave<=0){t.state='free';t.freeTime=0;}}else if(t.state==='free'){t.freeTime=(t.freeTime||0)+dt;if(t.freeTime>55){t.state='occupied';t.leave=35+(t.id*17%65);}}else if(t.state==='yours'){t.hold-=dt;if(t.hold<=0)this.loseTable(t,'Your reservation expired. Find another table!');else if(this.rain&&t.outdoor&&!t.protected){t.wet+=dt;if(t.wet>=12)this.loseTable(t,'Rain washed your tissue away! Chope another table.');}}else if(t.state==='rival'){t.hold-=dt;if(t.hold<=0){t.state='occupied';t.leave=15+(t.id*7%20);}}}
 if(this.orderState==='preparing'){this.queue=Math.max(0,this.queue-dt);if(this.queue<=0)this.completePreparation();}
 if(!this.running)return;
 for(const r of this.rivals){r.think-=dt;const target=this.tables.find(t=>t.id===r.target);if(target&&target.state!=='free'){r.target=null;r.path=[];r.think=5;}if(!r.target&&r.think<=0){const free=this.tables.filter(t=>t.state==='free').sort((a,b)=>dist(r,a)-dist(r,b))[0];if(free){r.target=free.id;r.path=this.route(r,{x:free.x,y:free.y+70});}r.think=4;}if(r.target&&!r.path.length&&r.think<=0){const goal=this.tables.find(t=>t.id===r.target);if(goal)r.path=this.route(r,{x:goal.x,y:goal.y+70});r.think=4;}this.walkPath(r,r.path,48,dt);if(target&&target.state==='free'&&dist(r,target)<90){target.state='rival';target.hold=40;r.target=null;r.path=[];r.think=16;this.notify(`A rival choped table ${target.id}. Stay sharp!`);}}
 for(const [i,r] of this.robots.entries()){const oldX=r.x;this.move(r,r.dir*(i?62:48)*(this.returnRush?1.35:1)*dt,0);if(Math.abs(r.x-oldX)<.01)r.dir*=-1;if(r.x>900){r.x=900;r.dir=-1;}if(r.x<55){r.x=55;r.dir=1;}if(dist(this.player,r)<34&&!this.sneaking&&this.bumpCooldown<=0){this.bumpCooldown=2.5;this.bumps++;this.left=Math.max(0,this.left-5);this.notify('Alamak! Robot bump. −5 seconds. Hold Shift to sneak.');this.path=[];}}
 }
}

