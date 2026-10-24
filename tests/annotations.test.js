import test from 'node:test';
import assert from 'node:assert/strict';
import {Game,dist} from '../engine.js';
const tick=(g,n)=>{for(let i=0;i<n*20;i++)g.update(.05);};
function walk(g,p){g.walkTo(p);for(let i=0;i<800&&g.path.length;i++)g.update(.05);assert.equal(g.path.length,0,'path reaches its target');assert.equal(g.obstacles(g.player.x,g.player.y),false,'player stays in walkable space');}

test('seated diners, stools, scenery and pickup displays are solid',()=>{
 const g=new Game();g.startTutorial();const t=g.tables[0];g.player={x:t.x+35,y:t.y+90};g.move(g.player,0,-100);assert.ok(dist(g.player,{x:t.x+35,y:t.y+44})>=27);
 const supply=g.supplies[0];g.player={x:supply.x,y:620};g.move(g.player,0,-150);assert.ok(g.player.y>=supply.y+47);assert.equal(g.obstacles(g.player.x,g.player.y),false);
 const plant=g.scenery[1];g.player={x:90,y:plant.y};g.move(g.player,-100,0);assert.ok(dist(g.player,plant)>=plant.r+13);
});
test('sprinting cannot tunnel through table geometry or another character',()=>{
 const g=new Game();g.start();g.player={x:350,y:300};g.move(g.player,0,-250);assert.ok(g.player.y>=269);assert.equal(g.obstacles(g.player.x,g.player.y),false);
 g.player={x:450,y:300};const rival=g.rivals[0];rival.x=500;rival.y=300;g.move(g.player,90,0);assert.ok(dist(g.player,rival)>=27);assert.ok(g.player.x<500);
});
test('both illustrated pickup bays have clear footprints and reachable approaches',()=>{
 const g=new Game();g.startTutorial();for(const s of g.supplies){
  // Artwork is 70px wide, from 40px above its base to 21px below it.
  const box={left:s.x-35,right:s.x+35,top:s.y-40,bottom:s.y+21};
  for(const t of g.tables){assert.ok(box.right<t.x-57||box.left>t.x+57||box.bottom<t.y-31||box.top>t.y+32,'pickup art does not intersect tabletop');for(const sx of [-35,35])for(const sy of [-44,44]){const x=t.x+sx,y=t.y+sy;assert.ok(box.right<x-13||box.left>x+13||box.bottom<y-29||box.top>y+12,'pickup art does not intersect seated diner');}}
  walk(g,s);assert.ok(dist(g.player,s)<95);assert.ok(g.player.y>s.y+47);
 }
});
test('tutorial completes seven real actions with no timer, rivals or automatic skipping',()=>{
 let result;const g=new Game(()=>{},r=>result=r);g.startTutorial();tick(g,120);assert.equal(g.tutorial.step,0);assert.equal(g.elapsed,0);assert.equal(g.left,600);assert.equal(g.rivals.length,0);assert.equal(g.robots.length,0);
 walk(g,{x:480,y:450});assert.equal(g.tutorial.step,1);
 walk(g,{x:350,y:449});tick(g,3.1);assert.equal(g.tables[5].state,'free');assert.equal(g.tutorial.step,1);g.interact();tick(g,.1);assert.equal(g.tutorial.step,2);
 walk(g,{x:465,y:165});g.interact();tick(g,.1);assert.equal(g.tutorial.step,3);assert.equal(g.orderState,'preparing');
 walk(g,g.supplies[0]);g.interact();tick(g,.1);assert.equal(g.tutorial.step,4);
 walk(g,g.supplies[1]);g.interact();tick(g,.1);assert.equal(g.tutorial.step,5);assert.equal(g.orderState,'ready');
 walk(g,{x:465,y:165});g.interact();tick(g,.1);assert.equal(g.tutorial.step,6);
 walk(g,{x:350,y:449});g.interact();assert.equal(result.won,true);assert.equal(result.mode,'tutorial');assert.equal(g.elapsed,0);
});
test('tutorial pause freezes the lesson and restarting restores regular rules',()=>{
 const g=new Game();g.startTutorial();g.paused=true;tick(g,20);assert.equal(g.tutorial.step,0);g.start(180);assert.equal(g.tutorial,null);assert.equal(g.left,180);assert.equal(g.robots.length,2);tick(g,1);assert.ok(g.left<180);
});
