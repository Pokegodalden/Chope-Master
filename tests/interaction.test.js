import test from 'node:test';
import assert from 'node:assert/strict';
import {Game} from '../engine.js';
const near=(g,t)=>{g.player={x:t.x,y:t.y+70};};
const claim=(g,index=0)=>{const t=g.tables[index];t.state='free';near(g,t);g.interact();return t;};

test('occupied and rival tables explain their state and cannot spend tissues',()=>{
 const g=new Game();g.start();const t=g.tables[0];near(g,t);t.leave=8;
 let context=g.interaction();assert.equal(context.id,t.id);assert.equal(context.enabled,false);assert.match(context.detail,/Last sip/);g.interact();assert.equal(g.tissues,3);
 t.state='rival';context=g.interaction();assert.match(context.label,/rival/);assert.equal(context.enabled,false);g.interact();assert.equal(g.tissues,3);
});
test('a table becoming free immediately offers the action that reserves it',()=>{
 const g=new Game();g.start();const t=g.tables[0];near(g,t);t.leave=.05;g.update(.1);
 assert.equal(g.interaction().action,'chope');assert.equal(g.interaction().label,'Chope 4 seats');assert.equal(g.interaction().enabled,true);
 g.interact();assert.equal(g.reserved,t.id);assert.equal(g.interaction().action,'check');
 const other=g.tables[1];other.state='free';near(g,other);assert.equal(g.interaction().enabled,false);assert.match(g.interaction().detail,/table 01/);g.interact();assert.equal(g.reserved,t.id);assert.equal(g.tissues,2);
});
test('umbrella action only appears for the nearby owned outdoor table',()=>{
 const g=new Game();g.start();let t=claim(g,3);assert.equal(g.interaction().secondary.action,'umbrella');g.useUmbrella();assert.equal(t.protected,true);assert.equal(g.interaction().secondary,null);
 g.start();claim(g);assert.equal(g.interaction().secondary,null);
});
test('stall prompt progresses from prerequisite to order, cooking, pickup, and collected',()=>{
 const g=new Game();g.start();g.player={x:465,y:170};assert.equal(g.interaction().enabled,false);assert.match(g.interaction().label,/Chope/);g.interact();assert.equal(g.orderState,'none');
 const t=claim(g);g.player={x:465,y:170};assert.equal(g.interaction().action,'order');assert.equal(g.interaction().secondary.action,'lanyard');g.interact();
 assert.equal(g.interaction().enabled,false);assert.match(g.interaction().label,/Cooking/);g.useLanyard();assert.equal(g.interaction().secondary,null);
 g.completePreparation();assert.equal(g.interaction().action,'pickup');assert.equal(g.interaction().label,'Collect 4 plates');g.interact();assert.equal(g.food,true);assert.equal(g.interaction().enabled,false);
 near(g,t);assert.equal(g.interaction().action,'sit');assert.equal(g.interaction().label,'Sit & makan');g.interact();assert.equal(g.won,true);assert.equal(g.interaction(),null);
});
test('overlapping interaction ranges select the same target shown and acted on',()=>{
 const g=new Game();g.start();claim(g);g.player={x:563,y:190};assert.ok(g.nearest());assert.equal(g.interaction().kind,'stall');g.interact();assert.equal(g.orderState,'preparing');
 const supply=g.supplies[0];g.player={x:supply.x,y:supply.y};assert.ok(g.nearest());assert.equal(g.interaction().kind,'supply');assert.equal(g.interaction().id,supply.id);const before=g.queue;g.interact();assert.equal(g.queue,before-10);assert.equal(supply.collected,true);assert.notEqual(g.interaction()?.kind,'supply');
});
test('out-of-range, paused and ended runs never advertise an active target',()=>{
 const g=new Game();assert.equal(g.interaction(),null);g.start();assert.equal(g.interaction(),null);claim(g);g.paused=true;assert.equal(g.interaction(),null);g.interact();assert.equal(g.tissues,2);g.paused=false;g.finish(false);assert.equal(g.interaction(),null);
});
test('interaction context does not mutate the game or consume inventory',()=>{
 const g=new Game();g.start();claim(g,3);const before=JSON.stringify(g);for(let i=0;i<50;i++)g.interaction();assert.equal(JSON.stringify(g),before);
});
