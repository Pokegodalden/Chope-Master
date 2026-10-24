import test from 'node:test';
import assert from 'node:assert/strict';
import {Game,dist} from '../engine.js';
const tick=(g,s)=>{for(let i=0;i<Math.ceil(s*10);i++)g.update(.1);};
const order=(g)=>{const t=g.tables[0];t.state='free';g.player={x:t.x,y:t.y+70};g.interact();g.player={x:465,y:170};g.interact();return t;};

test('forecast arrives before outdoor seats free and rain starts before lunch pickup',()=>{
 const messages=[],g=new Game(m=>messages.push(m));g.start();tick(g,8.1);assert.equal(g.forecastShown,true);assert.ok(messages.some(m=>m.includes('Rain forecast')));
 assert.ok(g.tables.filter(t=>t.outdoor).some(t=>t.leave<g.tables.filter(t=>!t.outdoor).reduce((n,t)=>Math.min(n,t.leave),Infinity)));
 tick(g,47);assert.equal(g.rain,true);assert.equal(g.orderState,'none');
});
test('repeated order interaction does not reset the cooking ticket',()=>{const g=new Game();g.start();order(g);tick(g,3);const remaining=g.queue;g.interact();assert.equal(g.queue,remaining);g.player={x:480,y:600};tick(g,10);assert.ok(g.queue<remaining-9);assert.equal(g.orderState,'preparing');});
test('each supply saves ten seconds once, only for an active order',()=>{
 const g=new Game();g.start();const supply=g.supplies[0];g.player={x:supply.x,y:supply.y};g.interact();assert.equal(supply.collected,false);
 order(g);g.player={x:supply.x,y:supply.y};g.interact();assert.equal(supply.collected,true);assert.equal(g.queue,60);g.interact();assert.equal(g.queue,60);
 const second=g.supplies[1];g.player={x:second.x,y:second.y};g.queue=5;g.interact();assert.equal(g.orderState,'ready');assert.equal(g.queue,0);
});
test('lanyard saves twelve seconds once without adding time to an existing order',()=>{const g=new Game();g.start();order(g);tick(g,20);const before=g.queue;g.useLanyard();assert.ok(Math.abs(g.queue-(before-12))<.01);g.useLanyard();assert.ok(Math.abs(g.queue-(before-12))<.01);});
test('reservation loss preserves the order so players can recover',()=>{const g=new Game();g.start();const t=order(g);t.hold=.05;g.update(.1);assert.equal(g.reserved,null);assert.equal(g.orderState,'preparing');g.player={x:t.x,y:t.y+70};g.interact();assert.equal(g.tissues,1);assert.equal(g.orderState,'preparing');});
test('pause freezes the order, forecast and timer',()=>{const g=new Game();g.start();order(g);g.paused=true;tick(g,100);assert.equal(g.left,180);assert.equal(g.elapsed,0);assert.equal(g.queue,70);assert.equal(g.forecastShown,false);});
test('relaxed mode adds clock and reservation slack, restart resets ticket and supplies',()=>{const g=new Game();g.start();order(g);g.supplies[0].collected=true;g.forecastShown=true;g.start(600);assert.equal(g.left,600);assert.equal(g.reservationSeconds,150);assert.equal(g.orderState,'none');assert.equal(g.forecastShown,false);assert.ok(g.supplies.every(s=>!s.collected));assert.equal(g.phase,'scout');});
test('return phase increases robot speed',()=>{const g=new Game();g.start();const x=g.robots[0].x;g.update(.1);const normal=g.robots[0].x-x;g.returnRush=true;const next=g.robots[0].x;g.update(.1);assert.ok(g.robots[0].x-next>normal);});

// Runs the real simulation clock and pathfinder without teleporting,
// changing diner timers, or removing rivals, robots, or weather.
function play({outdoor=false,express=false,supplies=false}={}){
 let result;const g=new Game(()=>{},r=>result=r);g.start();
 const step=()=>g.update(.05);
 const until=(condition,max=180)=>{const end=g.elapsed+max;while(g.running&&!condition()&&g.elapsed<end)step();assert.ok(condition(),'run reaches next stage');};
 const walk=(p)=>{const end=g.elapsed+25;while(g.running&&dist(g.player,p)>22&&g.elapsed<end){if(!g.path.length)g.walkTo(p);step();}assert.ok(dist(g.player,p)<=22,'destination reached');};
 const t=g.tables[outdoor?3:0];walk({x:t.x,y:t.y+70});until(()=>t.state==='free');g.interact();assert.equal(g.reserved,t.id);if(outdoor)g.useUmbrella();
 const chopedAt=g.elapsed;walk({x:465,y:165});g.interact();if(express)g.useLanyard();const orderedAt=g.elapsed;
 if(supplies)for(const s of g.supplies){walk({x:s.x,y:s.y+80});g.interact();assert.equal(s.collected,true);}
 walk({x:465,y:165});until(()=>g.orderState==='ready');g.interact();const collectedAt=g.elapsed;
 walk({x:t.x,y:t.y+70});g.interact();assert.equal(result?.won,true,'lunch run wins');
 return {chopedAt,orderedAt,collectedAt,finishedAt:g.elapsed,bumps:g.bumps};
}
test('sheltered route lasts 2–3 minutes and includes the first rain event',()=>{const run=play();assert.ok(run.finishedAt>=120&&run.finishedAt<=180,JSON.stringify(run));assert.ok(run.collectedAt>55);console.log('Sheltered route:',run);});
test('prepared outdoor shortcut is faster but must survive the first downpour',()=>{const run=play({outdoor:true,express:true,supplies:true});assert.ok(run.finishedAt>=85&&run.finishedAt<145,JSON.stringify(run));assert.ok(run.collectedAt>55);console.log('Outdoor express + supplies:',run);});
