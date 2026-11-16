/* EDUVERSE | Logo động chân trang môn Lịch Sử và Địa Lí */
(function(){
"use strict";
var RED="#c71920",GOLD="#d5ad4e",TAU=Math.PI*2;
var reduced=false;
try{reduced=!!window.matchMedia("(prefers-reduced-motion: reduce)").matches;}catch(e){}
function clamp(v){return Math.max(0,Math.min(1,v));}
function ease(v){v=clamp(v);return v*v*(3-2*v);}
function lerp(a,b,t){return a+(b-a)*t;}
function style(c,width){c.fillStyle=RED;c.strokeStyle=GOLD;c.lineWidth=width||1.55;c.lineJoin="round";c.lineCap="round";}

/* Chim Lạc cách điệu theo bố cục chim bay trên hoa văn Đông Sơn:
   mỏ nhọn, mào, cổ vươn, cánh xòe nhiều lông và đuôi dài phân dải. */
function drawBird(c,x,y,s,alpha,flap){
 c.save();c.translate(x,y);c.scale(s,s);c.globalAlpha=alpha;style(c,1.65);
 var f=flap||0;
 c.beginPath();
 c.moveTo(-30,2);c.bezierCurveTo(-18,-7,1,-8,17,-2);
 c.bezierCurveTo(24,-1,29,-5,34,-11);
 c.lineTo(29,-3);c.lineTo(43,-5);c.lineTo(30,2);
 c.bezierCurveTo(22,11,0,11,-18,7);c.closePath();c.fill();c.stroke();
 // Đầu, cổ và mỏ nhọn
 c.beginPath();c.moveTo(15,-3);c.bezierCurveTo(18,-15,26,-19,34,-17);
 c.lineTo(31,-12);c.lineTo(47,-10);c.lineTo(32,-7);
 c.bezierCurveTo(30,-1,25,2,19,3);c.closePath();c.fill();c.stroke();
 // Mào chim
 c.beginPath();c.moveTo(23,-16);c.lineTo(18,-27);c.lineTo(28,-21);
 c.lineTo(34,-29);c.lineTo(34,-17);c.stroke();
 // Cánh lớn, các lông cánh tách lớp
 c.beginPath();c.moveTo(-13,1);
 c.bezierCurveTo(-25,-8-f,-35,-23-f,-65,-37-f);
 c.lineTo(-57,-25-f);c.lineTo(-78,-29-f);c.lineTo(-59,-17-f);
 c.lineTo(-81,-17-f);c.lineTo(-59,-8-f);c.lineTo(-75,-4-f);
 c.bezierCurveTo(-48,5,-28,9,-13,7);c.closePath();c.fill();c.stroke();
 for(var i=0;i<6;i++){
  var q=i/5;
  c.beginPath();c.moveTo(-19-i*5,-1-i*1.1);
  c.quadraticCurveTo(-31-i*5,-12-f*q,-43-i*5,-20-f*q);
  c.stroke();
 }
 // Đuôi dài, ba dải lông cong
 c.beginPath();c.moveTo(-22,5);c.quadraticCurveTo(-43,12,-67,21);
 c.quadraticCurveTo(-49,17,-31,14);
 c.moveTo(-24,7);c.quadraticCurveTo(-43,22,-58,34);
 c.quadraticCurveTo(-39,25,-24,16);
 c.moveTo(-19,8);c.quadraticCurveTo(-32,28,-42,40);
 c.quadraticCurveTo(-27,26,-13,13);c.stroke();
 c.restore();
}

/* Đường bao Việt Nam dạng chữ S: phần Bắc mở rộng, dải Trung Bộ hẹp,
   phần Nam mở ra ở Đông Nam Bộ và đồng bằng sông Cửu Long. */
function drawVietnam(c,x,y,s,alpha,progress){
 c.save();c.translate(x,y);c.scale(s,s);c.globalAlpha=alpha;style(c,1.8);
 var p=clamp(progress===undefined?1:progress);
 c.beginPath();
 c.moveTo(-4,-48);
 c.bezierCurveTo(-13,-48,-19,-43,-18,-37);
 c.bezierCurveTo(-26,-35,-29,-29,-23,-25);
 c.bezierCurveTo(-19,-22,-24,-17,-19,-13);
 c.bezierCurveTo(-16,-9,-22,-4,-17,1);
 c.bezierCurveTo(-14,5,-18,10,-13,15);
 c.bezierCurveTo(-10,19,-14,24,-8,29);
 c.bezierCurveTo(-4,34,-5,40,2,47);
 c.bezierCurveTo(8,44,13,39,18,35);
 c.bezierCurveTo(24,31,24,26,19,22);
 c.bezierCurveTo(15,18,19,13,14,9);
 c.bezierCurveTo(11,5,15,0,11,-5);
 c.bezierCurveTo(8,-10,13,-14,9,-19);
 c.bezierCurveTo(5,-24,12,-29,7,-34);
 c.bezierCurveTo(3,-39,5,-44,-4,-48);
 c.closePath();
 // Vẽ theo tiến độ để chữ S rơi xuống rồi chuyển hình
 if(c.setLineDash){c.setLineDash([]);}
 c.save();c.beginPath();c.rect(-35,49-98*p,70,98*p);c.clip();
 c.fill();c.stroke();c.restore();
 // Hoàng Sa ở ngoài khơi miền Trung
 drawIslandGroup(c,27,-5,1.35);
 // Trường Sa ở ngoài khơi phía đông nam
 drawIslandGroup(c,26,27,1.2);
 c.restore();
}
function drawIslandGroup(c,x,y,s){
 c.save();c.translate(x,y);c.scale(s,s);style(c,1.15);
 function island(dx,dy,r){c.beginPath();c.moveTo(dx-r,dy);c.quadraticCurveTo(dx-r*.3,dy-r*.75,dx+r,dy-r*.15);c.quadraticCurveTo(dx+r*.5,dy+r*.8,dx-r,dy);c.closePath();c.fill();c.stroke();}
 island(-3,-4,2.2);island(3,-7,1.7);island(7,-1,1.5);island(1,2,1.4);
 c.restore();
}
function drawIslands(c,x,y,s,alpha,progress){
 c.save();c.translate(x,y);c.scale(s,s);c.globalAlpha=alpha;style(c,1.5);
 var p=clamp(progress===undefined?1:progress);
 function group(dx,dy,k){
  var islands=[[-9,-4,3],[-2,-8,2.2],[5,-5,2.7],[10,1,1.8],[-3,3,2.1],[4,8,2.4]];
  islands.forEach(function(a,i){
   var xx=dx+a[0],yy=dy+a[1];
   c.beginPath();c.ellipse(xx,yy,a[2]*p,a[2]*.52*p,-.35,0,TAU);c.fill();c.stroke();
  });
 }
 group(-7,-5,1);group(9,8,1);c.restore();
}
function drawRice(c,x,y,s,grow,alpha){
 c.save();c.translate(x,y);c.scale(s,s);c.globalAlpha=alpha;style(c,1.6);
 var g=clamp(grow);
 c.beginPath();c.moveTo(0,26);c.bezierCurveTo(-3,12,4,-8,2,-38*g);c.stroke();
 // Bông lúa rủ xuống ở ngọn
 for(var i=0;i<8;i++){
  var q=i/7,yy=-8-q*27*g,side=i%2?-1:1,xx=2+side*(2+q*4);
  c.beginPath();c.ellipse(xx+side*4,yy,2.5,5.1,side*-.55,0,TAU);c.fill();c.stroke();
 }
 c.beginPath();c.moveTo(0,16);c.quadraticCurveTo(-12,7,-18,1);
 c.moveTo(1,10);c.quadraticCurveTo(11,1,17,-9);c.stroke();
 c.restore();
}
function drawRocket(c,x,y,s,alpha){
 c.save();c.translate(x,y);c.rotate(-.08);c.scale(s,s);c.globalAlpha=alpha;style(c,1.6);
 c.beginPath();c.moveTo(-25,-6);c.quadraticCurveTo(-5,-12,15,-7);
 c.lineTo(30,0);c.lineTo(15,7);c.quadraticCurveTo(-5,12,-25,6);c.closePath();c.fill();c.stroke();
 c.beginPath();c.moveTo(-10,-6);c.lineTo(-19,-17);c.lineTo(-18,-4);
 c.moveTo(-10,6);c.lineTo(-19,17);c.lineTo(-18,4);c.stroke();
 c.beginPath();c.arc(8,0,3.2,0,TAU);c.fillStyle=GOLD;c.fill();c.stroke();
 c.beginPath();c.moveTo(-25,-4);c.lineTo(-42,0);c.lineTo(-25,4);c.closePath();c.fillStyle="#f28b32";c.fill();
 c.restore();
}
function make(host){
 var canvas=document.createElement("canvas");canvas.className="lsdl-footer-canvas";
 canvas.setAttribute("role","img");canvas.setAttribute("aria-label","Logo Lịch Sử và Địa Lí với chim Lạc, bản đồ Việt Nam, Hoàng Sa, Trường Sa và bông lúa");
 host.appendChild(canvas);
 var c=canvas.getContext("2d"),w=440,h=154,dpr=1,raf=0,ro=null,start=performance.now(),elapsed=0,playing=!reduced;
 function fit(){
  dpr=Math.min(2,window.devicePixelRatio||1);w=Math.max(250,host.clientWidth||440);
  canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);
  canvas.style.height=h+"px";c.setTransform(dpr,0,0,dpr,0,0);
  if(raf)cancelAnimationFrame(raf);
  paint(playing?(performance.now()-start)/1000:13);
 }
 function measure(str,size){c.font="900 "+size+"px Georgia,serif";return c.measureText(str).width;}
 function word(str,x,y,size,alpha){
  c.save();c.globalAlpha=alpha;c.font="900 "+size+"px Georgia,serif";
  c.textAlign="left";c.textBaseline="middle";c.lineJoin="round";c.lineWidth=1.8;
  c.fillStyle=RED;c.strokeStyle=GOLD;c.strokeText(str,x,y);c.fillText(str,x,y);
  var z=c.measureText(str).width;c.restore();return z;
 }
 function paint(sec){
  elapsed=sec;c.clearRect(0,0,w,h);
  var size=29,sp=4;
  var widths={lead:measure("LỊCH ",size),tail:measure("Ử ",size),middle:measure(" ĐỊ",size),a:measure("A",size),last:measure("Í",size)};
  var slots={map:42,islands:48,rice:27};
  var total=widths.lead+slots.map+widths.tail+slots.islands+widths.middle+widths.a+slots.rice+widths.last+sp*7;
  var sc=Math.min(1,(w-16)/total),left=(w-total*sc)/2;
  c.save();c.translate(left,0);c.scale(sc,sc);
  var baseline=89,top=baseline-59;
  // Chim Lạc mở màn: bay hết chiều ngang rồi khuất khỏi khung hình.
  if(sec<1.45){
   var q=ease(sec/1.45);
   drawBird(c,lerp(-95,total+100,q),25-Math.sin(q*Math.PI)*8,.66,1-q*.96,Math.sin(q*TAU)*4);
  }
  var revealA=ease((sec-1.45)/.4),revealB=ease((sec-1.85)/.85);
  var reveal=sec<1.45?0:sec<1.85?.2*revealA:lerp(.2,1,revealB);
  var alpha=sec<1.45?0:1;
  c.save();c.beginPath();c.rect(-6,baseline-59,total+12,118*reveal);c.clip();
  var px=0;
  px+=word("LỊCH ",px,baseline,size,alpha)+sp;
  // Chữ S rơi từ trên xuống, dừng lại rồi biến thành đường bao Việt Nam.
  var sFall=ease((sec-4.05)/.7),mapDraw=ease((sec-4.75)/.65);
  if(sec<4.75){
   var sy=lerp(-65,baseline,sFall);
   word("S",px,sy,size,alpha*(1-mapDraw));
  }
  if(sec>=4.75)drawVietnam(c,px+slots.map*.5,baseline-1,.47,alpha,mapDraw);
  px+=slots.map+sp;
  px+=word("Ử ",px,baseline,size,alpha)+sp;
  // VÀ tan thành hai cụm quần đảo trước khi chữ S rơi xuống.
  var islandOut=ease((sec-3.0)/.6),islandIn=ease((sec-3.6)/.55);
  if(sec<3.6)word("VÀ",px,baseline,size,alpha*(1-islandOut));
  if(sec>=3.6)drawIslands(c,px+slots.islands*.5,baseline-1,.92,alpha,islandIn);
  px+=slots.islands+sp;
  px+=word(" ĐỊ",px,baseline,size,alpha)+sp;
  // Chữ A tách ra thành tên lửa, bay khỏi khung bên phải rồi trở về từ trái.
  var rocketX=px+widths.a*.5,rocketAlpha=1;
  if(sec<6.55||sec>=9.05)word("A",px,baseline,size,alpha);
  else{
   var rx,ry=baseline;
   if(sec<7.45){var q=ease((sec-6.55)/.9);rx=lerp(rocketX,total+95,q);}
   else if(sec<8.15){rx=total+95;ry=baseline-30*ease((sec-7.45)/.7);}
   else{var q=ease((sec-8.15)/.9);rx=lerp(-55,rocketX,q);}
   drawRocket(c,rx,ry,.68,rocketAlpha);
  }
  px+=widths.a+sp;
  // Chữ L tàn lụi, bông lúa mọc lên đúng vị trí chữ.
  var fade=ease((sec-5.0)/.55),growth=ease((sec-5.55)/1.0);
  if(sec<5.55)word("L",px,baseline,size,alpha*(1-fade));
  if(sec>=5.55)drawRice(c,px+slots.rice*.5,baseline+2,.76,growth,alpha);
  px+=slots.rice+sp;word("Í",px,baseline,size,alpha);
  c.restore();
  // Chim Lạc trở lại. Thân chim tách thành nét đầu, cánh và đuôi nhập vào viền logo.
  if(sec>9.05){
   var q=ease((sec-9.05)/1.1),merge=ease((sec-10.15)/1.5);
   drawBird(c,lerp(total+95,total*.68,q),27,.53,1-merge,0);
   c.save();c.globalAlpha=merge;c.strokeStyle=GOLD;c.fillStyle=RED;c.lineWidth=2;
   // Mào/đầu hòa thành nét nhấn trên cụm chữ đầu
   c.beginPath();c.moveTo(53,top+8);c.quadraticCurveTo(62,top-5,73,top+7);c.stroke();
   // Lông cánh nhập vào các nét chữ trung tâm
   for(var i=0;i<4;i++){c.beginPath();c.moveTo(155+i*5,top+15);c.lineTo(169+i*5,top+2+i*2);c.stroke();}
   // Đuôi kéo thành nét viền vàng dưới logo
   c.beginPath();c.moveTo(225,baseline+27);c.quadraticCurveTo(247,baseline+37,269,baseline+25);c.stroke();
   c.restore();
  }
  c.restore();
  if(playing&&sec<12.9){raf=requestAnimationFrame(function(){paint((performance.now()-start)/1000);});}
  else{playing=false;if(raf)cancelAnimationFrame(raf);raf=0;}
 }
 function destroy(){if(raf)cancelAnimationFrame(raf);if(ro)ro.disconnect();if(canvas.parentNode)canvas.parentNode.removeChild(canvas);}
 if(window.ResizeObserver){ro=new ResizeObserver(fit);ro.observe(host);}
 fit();return{destroy:destroy,draw:paint,get t(){return elapsed;}};
}
var active=null;
function mount(root){
 if(!root||root.querySelector(".lsdl-footer-logo"))return;
 var footer=document.createElement("div");footer.className="lsdl-footer-logo";
 footer.innerHTML='<div class="lsdl-footer-rule"></div><div class="lsdl-footer-caption">LỊCH SỬ VÀ ĐỊA LÍ</div>';
 root.appendChild(footer);
 var host=document.createElement("div");host.className="lsdl-footer-art";footer.appendChild(host);
 active=make(host);
}
function unmount(){if(active){active.destroy();active=null;}}
window.LsdlFooterLogo={mount:mount,unmount:unmount};
})();