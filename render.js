import {WIDTH,HEIGHT,dist} from './engine.js';
const C={ink:'#344c40',floor:'#e9dec0',line:'#d9cdaa',teal:'#438b82',red:'#ca6246'};
export class Renderer{
 constructor(canvas,game){this.canvas=canvas;this.ctx=canvas.getContext('2d');this.game=game;this.time=0;}
 rect(x,y,w,h,color,r=0){let c=this.ctx;c.fillStyle=color;c.beginPath();c.roundRect(x,y,w,h,r);c.fill();}
 ellipse(x,y,rx,ry,col){let c=this.ctx;c.fillStyle=col;c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fill();}
 line(x,y,x2,y2,col,width=1){let c=this.ctx;c.strokeStyle=col;c.lineWidth=width;c.beginPath();c.moveTo(x,y);c.lineTo(x2,y2);c.stroke();}
 text(str,x,y,size=12,color=C.ink,weight=600,align='center'){const c=this.ctx;c.fillStyle=color;c.font=`${weight} ${size}px "DM Sans",Arial,sans-serif`;c.textAlign=align;c.textBaseline='middle';c.fillText(str,x,y);}
 pill(str,x,y,bg='#fef9e7',fg=C.ink){const c=this.ctx;c.font='700 10px Arial';const w=c.measureText(str).width+20;this.rect(x-w/2,y-11,w,22,bg,5);this.text(str,x,y,10,fg,700);}
 timeLabel(seconds){const n=Math.max(0,Math.ceil(seconds));return Math.floor(n/60)+':'+String(n%60).padStart(2,'0');}
 objectStatus(){
  const g=this.game;
  for(const t of g.tables.filter(t=>t.state==='yours')){
   const wet=g.rain&&t.outdoor&&!t.protected;
   const urgent=t.hold<=25||wet;
   const color=urgent?'#a94b32':'#245f50';
   const x=t.x,y=t.y-77;
   this.rect(x-81,y-13,162,29,color,5);
   this.text(g.tutorial?'PRACTICE TABLE '+String(t.id).padStart(2,'0'):'YOUR TABLE '+String(t.id).padStart(2,'0')+' · '+this.timeLabel(t.hold),x,y,12,'#fff9e6',800);
   this.rect(x-76,y+20,152,5,'#ebe5cf',2);
   this.rect(x-76,y+20,152*Math.max(0,Math.min(1,t.hold/g.reservationSeconds)),5,urgent?'#c86c44':'#488e72',2);
   if(wet)this.pill('TISSUE WASHES AWAY IN '+Math.ceil(Math.max(0,12-t.wet))+'s',x,t.y+33,'#fff0d4','#a0472c');
   else if(t.protected)this.pill('UMBRELLA PROTECTED',x,t.y+33,'#e5efcf','#426743');
  }
  if(g.orderState==='preparing'||g.orderState==='ready'){
   const ready=g.orderState==='ready';
   this.rect(380,65,174,47,ready?'#245f50':'#fff5d8',5);
   this.text('PICKUP TICKET #04 · 4 PLATES',467,77,9,ready?'#dceac9':'#8f6944',700);
   this.text(ready?'READY TO COLLECT':g.tutorial?'COLLECT SUPPLIES':this.timeLabel(g.queue)+' UNTIL READY',467,96,13,ready?'#fff9e6':'#765037',800);
   this.rect(384,117,166,6,'#e4d7b4',3);
   this.rect(384,117,166*(ready?1:Math.max(0,Math.min(1,1-g.queue/g.queueTotal))),6,ready?'#62a382':'#cf8150',3);
  }
 }
 targetFocus(context){
  if(!context)return;
  const c=this.ctx,t=context.target;
  const actionable=context.enabled||context.secondary;
  const color=actionable?'#245f50':'#78684b';
  const bounds=context.kind==='table'?[t.x-80,t.y-60,160,119]:context.kind==='stall'?[377,15,180,132]:[t.x-35,t.y-40,70,61];
  c.save();c.lineWidth=7;c.strokeStyle='#fff8e5';c.beginPath();c.roundRect(...bounds,8);c.stroke();
  c.lineWidth=3;c.strokeStyle=color;if(!actionable)c.setLineDash([6,4]);c.stroke();c.restore();
  const label=context.label;
  c.font='700 13px Arial';const width=Math.min(240,Math.max(155,c.measureText(label).width+(context.enabled?54:24)));
  const x=Math.max(width/2+12,Math.min(WIDTH-width/2-12,t.x));
  const y=context.kind==='table'?t.y-1:context.kind==='stall'?172:t.y-66;
  this.line(x,y+22,t.x,context.kind==='supply'?t.y-41:y+24,color,2);
  this.rect(x-width/2+2,y-22+3,width,45,'#253e3433',6);
  this.rect(x-width/2,y-22,width,45,context.enabled?'#245f50':'#fcf5df',6);
  const title=context.kind==='table'?'TABLE '+String(context.id).padStart(2,'0'):context.kind==='stall'?'CHICKEN RICE':context.target.name.toUpperCase();
  this.text(title,x,y-12,8,context.enabled?'#c2d9b9':'#877252',700);
  if(context.enabled){this.rect(x-width/2+10,y-3,22,19,'#fff6d9',3);this.text('E',x-width/2+21,y+7,12,'#245f50',800);this.text(label,x+13,y+7,13,'#fff9e6',700);}
  else this.text(label,x,y+7,13,'#78684b',700);
 }
 person(x,y,shirt='#438b82',kind='diner',phase=0){let c=this.ctx;const moving=kind==='you'&&(this.game.path.length||this.game.sprinting);let bob=moving?Math.sin(this.time*12)*1.6:Math.sin(this.time*2+phase)*.8;this.ellipse(x+3,y+10,12,5,'#746f4933');this.rect(x-6,y+2+bob,5,10,'#344a40',2);this.rect(x+2,y+2-bob,5,10,'#344a40',2);this.rect(x-9,y-15,18,21,shirt,4);this.rect(x-12,y-12,4,13,'#d9a574',2);this.rect(x+9,y-12,4,13,'#d9a574',2);this.rect(x-7,y-27,15,15,'#e6b382',5);this.rect(x-8,y-29,16,7,'#3d3c30',3);this.rect(x-8,y-25,4,6,'#3d3c30');this.rect(x+3,y-22,2,2,'#4d4335');if(kind==='you'){this.line(x-4,y-13,x,y-3,'#f7e8bc',2);this.line(x+4,y-13,x,y-3,'#f7e8bc',2);this.rect(x-2,y-3,5,5,'#f9edc8');this.rect(x+10,y-5,10,7,'#f4f1d8',2);this.line(x+12,y-2,x+18,y-2,'#7eb4a5',1);if(this.game.food){this.rect(x-20,y+1,40,5,'#56644c',2);for(let i=0;i<4;i++)this.ellipse(x-14+i*9,y,5,3,'#fbefd5');}}if(kind==='rival'){this.rect(x+10,y-8,8,6,'#f8d5c5',1);this.line(x-3,y-12,x,y-2,'#f9e6d2',1);}}
 plant(x,y,scale=1){const c=this.ctx;c.save();c.translate(x,y);c.scale(scale,scale);this.ellipse(2,9,24,8,'#3c594528');this.rect(-12,-1,24,17,'#b0754a',3);this.rect(-14,-4,28,6,'#c18b57',2);this.line(0,-5,0,-35,'#58764b',3);for(const [dx,dy,rx,ry] of [[-12,-21,15,8],[12,-30,14,8],[-9,-40,11,7],[5,-48,8,11],[16,-17,12,8]]){this.ellipse(dx,dy,rx,ry,'#718c50');this.ellipse(dx-2,dy-2,rx*.7,ry*.5,'#90a66b');}c.restore();}
 stall(x,w,title,color,index){this.rect(x+5,40,w,103,'#5b594834',5);this.rect(x,23,w,113,'#e6d5aa',3);this.rect(x+8,53,w-16,64,'#536357',2);this.rect(x+13,58,w-26,45,'#6c7761',1);for(let i=0;i<3;i++){this.rect(x+22+i*31,65,23,30,'#efe7c7',1);this.line(x+26+i*31,71,x+39+i*31,71,'#c9a971',2);this.line(x+26+i*31,77,x+39+i*31,77,'#a9b495',1);this.line(x+26+i*31,82,x+36+i*31,82,'#a9b495',1);}this.person(x+w-29,111,'#f1e4be');this.rect(x-4,99,w+8,15,'#d0bd90',2);this.rect(x,114,w,28,color,2);this.rect(x+9,117,w-18,4,'#ffffff1c');this.rect(x-7,21,w+14,35,color,3);for(let i=0;i<Math.ceil(w/19);i++){this.rect(x-7+i*19,21,10,35,'#f7ebcd',1);}this.rect(x-8,47,w+16,12,color,3);this.rect(x+6,25,w-12,19,color,2);this.text(title,x+w/2,35,index===1?12:10,'#fff6df',800);for(let i=0;i<3;i++){this.ellipse(x+25+i*30,103,10,4,'#f5edd4');this.ellipse(x+25+i*30,102,6,3,index===1?'#e3be75':'#b47b4d');}this.rect(x+3,137,w-6,7,'#857f60');}
 table(t){let {x,y}=t;const c=this.ctx;const free=t.state==='free',own=t.state==='yours',rival=t.state==='rival';if(free||own){c.save();c.setLineDash([5,4]);c.strokeStyle=own?'#2d8d7d':'#749658';c.lineWidth=2;c.beginPath();c.roundRect(x-76,y-57,152,109,14);c.stroke();c.restore();}this.ellipse(x+7,y+21,68,29,'#81765025');this.rect(x-5,y+8,10,29,'#8b8060');this.rect(x-57,y-26,114,58,'#aa8053',14);this.rect(x-57,y-31,114,56,free?'#c5cb91':own?'#e4bf68':'#d9ae72',13);this.rect(x-52,y-28,104,6,'#ffffff20',6);this.line(x-48,y+19,x+48,y+19,'#9f82553b',1);this.text(String(t.id).padStart(2,'0'),x,y+13,8,'#97794e',700);
 if(t.state==='occupied'){const shirt=t.leave>70?'#8997a0':t.leave<35?'#b57f53':'#c29a55';this.ellipse(x-25,y-6,15,10,'#f3e9cb');this.ellipse(x-25,y-7,9,6,'#e7ca8a');this.ellipse(x+27,y+1,14,9,'#f6e9c8');this.ellipse(x+26,y,7,5,t.leave<35?'#d5ccb0':'#dcbb72');this.rect(x+15,y-15,7,10,'#f4e8ca',2);this.rect(x+16,y-15,5,4,'#8c6540');if(t.leave>70){this.rect(x-43,y-20,30,20,'#626e6b',2);this.rect(x-41,y-18,26,14,'#b6cdc6',1);this.rect(x-46,y,36,4,'#8b9990',1);}if(t.leave<35){this.pill(t.leave<14?'LAST SIP':'FINISHING UP',x,y-78,t.leave<14?'#f8de8d':'#f5eed4','#8f702c');}}
 if(free){this.pill('4 SEATS · FREE',x,y-64,'#e4eecb','#507746');this.text('＋',x,y-3,22,'#78965d',500);}if(own||rival){this.rect(x-17,y-13,34,20,rival?'#e4adb3':'#e9f1d8',3);this.rect(x-13,y-9,26,11,rival?'#cb7f8a':'#61a69b',2);this.rect(x-5,y-18,10,8,'#fff8e9',2);if(rival)this.pill('CHOPED',x,y-66,'#b86978','#fff5dc');}if(t.protected){this.line(x+51,y-15,x+51,y-78,'#806845',3);c.fillStyle='#efb85f';c.beginPath();c.arc(x+51,y-76,40,Math.PI,0);c.fill();this.line(x+51,y-114,x+51,y-76,'#d79c48',2);this.ellipse(x+52,y-74,40,4,'#b18f4d33');}if(this.game.rain&&t.outdoor&&!t.protected){this.ellipse(x+3,y+66,47,9,'#82a9a447');}}
 chair(t,sx,sy){const x=t.x+sx,y=t.y+sy;this.rect(x-10,y-3,20,13,'#426b5c',5);this.ellipse(x,y-4,13,8,t.outdoor?'#71958a':'#548a7c');this.ellipse(x,y-6,10,5,'#73a292');}
 supplyStation(s){
  const active=this.game.orderState==='preparing'&&!s.collected;
  const x=s.x,y=s.y,c=this.ctx;
  // Dedicated clear bays; item art and nameplates are drawn after characters.
  this.rect(x-35,y-40,70,61,active?'#fff1c3':'#f4ead4',8);
  c.strokeStyle=active?'#b78435':'#bdb59a';c.lineWidth=2;c.beginPath();c.roundRect(x-35,y-40,70,61,8);c.stroke();
  this.ellipse(x,y+10,26,6,'#75684925');
  if(s.id==='chilli'){
   this.rect(x-15,y-27,18,34,'#b8432c',5);this.rect(x-12,y-35,12,10,'#72815b',2);
   this.rect(x-12,y-17,12,14,'#f6dc9d',2);this.text('辣',x-6,y-10,10,'#a33d29',800);
   this.ellipse(x+13,y+1,16,10,'#ffefd1');this.ellipse(x+13,y-2,12,7,'#d85d30');
   this.ellipse(x+11,y-3,2,1,'#f6ca6e');this.ellipse(x+18,y-1,2,1,'#f6ca6e');
   this.line(x+22,y-6,x+30,y-20,'#586c53',3);this.ellipse(x+22,y-6,4,3,'#9baf83');
  }else{
   this.rect(x-25,y-8,22,17,'#fff9e5',2);this.line(x-22,y-3,x-7,y-3,'#ddd4b9');this.line(x-22,y+2,x-7,y+2,'#ddd4b9');
   this.rect(x-4,y-9,25,23,'#548b7d',4);this.rect(x-1,y-5,19,4,'#77a699',2);
   this.line(x+2,y-10,x-3,y-29,'#718980',4);this.ellipse(x-4,y-32,5,8,'#94aaa4');
   this.line(x+9,y-10,x+9,y-33,'#718980',4);for(let j=-1;j<=1;j++)this.line(x+9+j*4,y-36,x+9+j*4,y-28,'#94aaa4',2);this.line(x+5,y-28,x+13,y-28,'#94aaa4',2);
   this.line(x+15,y-10,x+23,y-32,'#718980',3);
  }
  this.rect(x-43,y+24,86,21,s.collected?'#54725a':'#294f43',4);
  this.text((s.collected?'✓ ':'')+(s.id==='chilli'?'CHILLI':'CUTLERY'),x,y+35,10,'#fff7df',800);
  if(active)this.pill('PICK UP · −10s',x,y-52,'#fae5a9','#735627');
  else if(!s.collected&&this.game.orderState==='none')this.text('AFTER ORDERING',x,y-49,8,'#776b4d',700);
  if(s.collected){this.ellipse(x+26,y-28,9,9,'#477c57');this.text('✓',x+26,y-28,12,'#fff8e7',800);}
 }
 tutorialMarker(){
  const lesson=this.game.tutorialLesson();if(!lesson)return;
  const {x,y}=lesson.target;const c=this.ctx;
  c.save();c.strokeStyle='#e36b35';c.lineWidth=3;c.setLineDash([6,5]);c.beginPath();c.ellipse(x,y,42,23,0,0,Math.PI*2);c.stroke();c.restore();
  const markerY=this.game.tutorial.step===0?y-42:y-100;
  this.pill('PRACTICE · '+(this.game.tutorial.step+1)+'/7',x,Math.max(150,markerY),'#df6a37','#fff9e7');
 }

 robot(r){const x=r.x,y=r.y;this.ellipse(x+4,y+10,18,7,'#68756625');this.rect(x-14,y-18,28,30,'#7c8d7c',6);this.rect(x-15,y-23,30,27,'#e5e6cf',5);this.rect(x-10,y-18,20,10,'#506c62',3);this.rect(x-7,y-15,4,3,'#a6dac1',1);this.rect(x+3,y-15,4,3,'#a6dac1',1);this.rect(x-17,y-4,34,5,'#9ba88e',2);this.ellipse(x,y-4,10,3,'#d6d9c0');this.rect(x-10,y+10,6,5,'#405a4d',1);this.rect(x+5,y+10,6,5,'#405a4d',1);this.line(x,y-23,x,y-30,'#8d9d80',2);this.ellipse(x,y-32,3,3,'#dfaa54');}
 draw(dt){this.time+=dt;const c=this.ctx,g=this.game;c.clearRect(0,0,WIDTH,HEIGHT);this.rect(0,0,960,650,'#ddd8b9');this.rect(20,16,685,619,C.floor,8);this.rect(721,15,219,620,'#d5d5b7',8);for(let y=160;y<640;y+=32){this.line(22,y,704,y,C.line);this.line(722,y,938,y,'#c4c9a8');}for(let x=26;x<940;x+=40){this.line(x,153,x,636,x>710?'#c4c9a8':C.line);}this.rect(703,17,10,618,'#b5b497');this.rect(709,17,5,618,'#f5edce');for(let y=184;y<620;y+=150){this.rect(699,y,20,22,'#b1b399',3);this.rect(699,y,17,15,'#e3ddbb',2);}this.stall(43,157,'KOPI & TEH','#608a76',0);this.stall(222,142,'SATAY CLUB','#bc974f',0);this.stall(386,162,'CHICKEN RICE','#bd593c',1);this.stall(570,123,'FRESH JUICE','#729076',0);this.text('UNCLE’S FAMOUS',467,151,8,'#9c6b41',700);this.text('COVERED DINING',318,182,9,'#a59b7c',700);this.text('OUTDOOR SEATS',816,152,9,'#7c8c6a',700);this.text('WATCH THE WEATHER',816,167,7,'#8f9a7c',500);
 this.plant(746,92,.9);this.plant(912,89,1.1);this.rect(756,26,137,59,'#e1e2c4',5);this.line(767,44,882,44,'#c0c8a5',2);this.line(767,60,882,60,'#c0c8a5',2);this.rect(28,571,48,43,'#9ca68b',5);this.rect(24,564,56,12,'#758775',4);this.text('TRAY',52,587,8,'#f1f0d9');this.text('RETURN',52,598,7,'#f1f0d9');this.text('← RETURN TRAYS',153,618,8,'#9a9677',700);this.text('ENTRANCE',480,640,8,'#809078',700);this.line(418,633,542,633,'#b4bca0',2);
 if(g.path.length){c.save();c.setLineDash([3,9]);c.strokeStyle='#408b8190';c.lineWidth=3;c.beginPath();c.moveTo(g.player.x,g.player.y);for(const p of g.path)c.lineTo(p.x,p.y);c.stroke();c.restore();const end=g.path.at(-1);this.ellipse(end.x,end.y,6,4,'#398b80');}

 const drawables=[];for(const t of g.tables){drawables.push({y:t.y,draw:()=>this.table(t)});for(const [sx,sy] of [[-35,-44],[35,-44],[-35,44],[35,44]])drawables.push({y:t.y+sy,draw:()=>this.chair(t,sx,sy)});if(t.state==='occupied'){drawables.push({y:t.y-43,draw:()=>this.person(t.x-35,t.y-46,t.leave>70?'#8997a0':t.leave<35?'#b57f53':'#c29a55','diner',t.id)});drawables.push({y:t.y+47,draw:()=>this.person(t.x+35,t.y+43,['#b78b73','#7b9d83','#b09b7c'][t.id%3],'diner',t.id+1)});}}
 for(const p of [{x:30,y:209,s:.8},{x:30,y:466,s:.8},{x:928,y:339,s:.8},{x:731,y:617,s:.7}])drawables.push({y:p.y,draw:()=>this.plant(p.x,p.y,p.s)});for(const r of g.robots)drawables.push({y:r.y,draw:()=>this.robot(r)});for(const r of g.rivals)drawables.push({y:r.y,draw:()=>{this.person(r.x,r.y,r.color,'rival');this.pill('RIVAL',r.x,r.y-44,'#f3e0d5','#a56670');}});drawables.push({y:g.player.y,draw:()=>{this.ellipse(g.player.x,g.player.y+11,18,7,'#59a8a458');if(g.bumpCooldown>0&&Math.floor(this.time*10)%2===0)c.globalAlpha=.45;this.person(g.player.x,g.player.y,'#3b9491','you');c.globalAlpha=1;if(!g.supplies.some(s=>dist(g.player,s)<100))this.pill(g.food?'YOU · LUNCH READY':'YOU',g.player.x,g.player.y-44,'#28756d','#fff6d9');if(g.running){this.rect(g.player.x-18,g.player.y+20,36,4,'#506d5455',2);this.rect(g.player.x-18,g.player.y+20,36*g.stamina/100,4,'#6ba995',2);}}});drawables.sort((a,b)=>a.y-b.y).forEach(d=>d.draw());
 if(g.rain){this.rect(716,0,244,650,'#52798e22');c.save();c.beginPath();c.rect(716,0,244,650);c.clip();for(let i=0;i<60;i++){const x=716+(i*37+this.time*42)%265,y=(i*67+this.time*270)%680;this.line(x,y,x-5,y+12,'#648fa278',1.4);}c.restore();this.pill('TROPICAL DOWNPOUR',815,113,'#526f76','#f0f4e5');}else this.pill(g.forecastShown?'RAIN IN '+Math.ceil(g.rainIn)+'s':'AL FRESCO',815,113,g.forecastShown?'#f4dda2':'#e9ebcc','#7e8c66');
 for(const supply of g.supplies)this.supplyStation(supply);if(g.running){this.objectStatus();this.targetFocus(g.interaction());this.tutorialMarker();}
 }
}

