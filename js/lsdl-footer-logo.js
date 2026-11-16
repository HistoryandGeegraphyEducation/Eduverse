/* EDUVERSE – Logo chân trang môn LỊCH SỬ VÀ ĐỊA LÍ
   Canvas vector tự vẽ, không phụ thuộc ảnh ngoài.
   Chuỗi intro chạy một lần trong phiên; hỗ trợ prefers-reduced-motion.
*/
(function(){
"use strict";
var done=false,instances=[];
var RED="#c71920",GOLD="#d8b45a",NAVY="#172b50",TAU=Math.PI*2;
var reduced=false;
try{
 var mq=matchMedia("(prefers-reduced-motion: reduce)");
 reduced=!!mq.matches;
 mq.addEventListener?mq.addEventListener("change",function(e){reduced=!!e.matches;instances.forEach(function(x){x.draw(reduced?10: x.t);});}):mq.addListener(function(e){reduced=!!e.matches;});
}catch(e){}
function clamp(v){return Math.max(0,Math.min(1,v));}
function ease(v){v=clamp(v);return 1-Math.pow(1-v,3);}
function mix(a,b,t){return a+(b-a)*t;}
function pathMap(c,x,y,s){
 c.save();c.translate(x,y);c.scale(s,s);c.beginPath();
 c.moveTo(0,-39);c.bezierCurveTo(8,-35,5,-28,12,-24);
 c.bezierCurveTo(7,-18,15,-12,10,-5);c.bezierCurveTo(18,1,13,8,8,13);
 c.bezierCurveTo(12,21,3,27,5,34);c.bezierCurveTo(1,40,-5,47,-8,55);
 c.bezierCurveTo(-10,46,-7,39,-13,33);c.bezierCurveTo(-18,26,-13,20,-20,14);
 c.bezierCurveTo(-25,8,-18,1,-23,-6);c.bezierCurveTo(-17,-12,-22,-18,-15,-24);
 c.bezierCurveTo(-10,-29,-8,-36,0,-39);c.closePath();c.restore();
}
function bird(c,x,y,s,alpha,parts){
 c.save();c.translate(x,y);c.scale(s,s);c.globalAlpha=alpha;
 c.fillStyle=RED;c.strokeStyle=GOLD;c.lineWidth=1.1;c.lineJoin="round";
 // Thân và cổ
 c.beginPath();c.moveTo(-24,1);c.quadraticCurveTo(-5,-9,12,-2);c.quadraticCurveTo(24,2,31,-4);c.quadraticCurveTo(23,12,5,9);c.lineTo(-20,7);c.closePath();c.fill();c.stroke();
 // Đầu và mỏ
 c.beginPath();c.moveTo(8,-4);c.quadraticCurveTo(18,-20,29,-17);c.lineTo(39,-13);c.lineTo(28,-10);c.quadraticCurveTo(23,0,13,3);c.closePath();c.fill();c.stroke();
 // Cánh chim Lạc cách điệu
 c.beginPath();c.moveTo(-13,0);c.quadraticCurveTo(-29,-24,-52,-27);c.lineTo(-42,-17);c.lineTo(-59,-19);c.lineTo(-43,-9);c.lineTo(-62,-7);c.lineTo(-39,0);c.quadraticCurveTo(-25,8,-13,7);c.closePath();c.fill();c.stroke();
 // Lông đuôi
 c.beginPath();c.moveTo(-22,4);c.lineTo(-48,18);c.lineTo(-27,13);c.lineTo(-43,27);c.lineTo(-17,12);c.closePath();c.fill();c.stroke();
 c.restore();
}
function drawRice(c,x,y,s,grow){
 c.save();c.translate(x,y);c.scale(s,s);c.strokeStyle=GOLD;c.lineWidth=1.8;c.lineCap="round";
 c.beginPath();c.moveTo(0,22);c.quadraticCurveTo(2,2,-2,-30*grow);c.stroke();
 for(var i=0;i<6;i++){var yy=-26+i*7,xx=-2+(i%2?2:-1);c.beginPath();c.ellipse(xx-7,yy,3.2,7,-.65,0,TAU);c.fillStyle=RED;c.fill();c.stroke();}
 c.beginPath();c.moveTo(0,20);c.quadraticCurveTo(-9,7,-16,1);c.moveTo(0,14);c.quadraticCurveTo(9,2,16,-4);c.stroke();
 c.restore();
}
function rocket(c,x,y,s,a){
 c.save();c.translate(x,y);c.rotate(-.12);c.scale(s,s);c.globalAlpha=a;
 c.fillStyle=RED;c.strokeStyle=GOLD;c.lineWidth=1.4;
 c.beginPath();c.moveTo(-24,-6);c.quadraticCurveTo(-4,-15,17,-7);c.lineTo(27,0);c.lineTo(17,7);c.quadraticCurveTo(-4,15,-24,6);c.closePath();c.fill();c.stroke();
 c.beginPath();c.moveTo(-12,-6);c.lineTo(-21,-16);c.lineTo(-19,-5);c.moveTo(-12,6);c.lineTo(-21,16);c.lineTo(-19,5);c.fill();c.stroke();
 c.beginPath();c.arc(10,0,3.3,0,TAU);c.fillStyle=GOLD;c.fill();
 c.fillStyle="#f29a32";c.beginPath();c.moveTo(-24,-4);c.lineTo(-39,0);c.lineTo(-24,4);c.closePath();c.fill();
 c.restore();
}
function island(c,x,y,s){
 c.save();c.translate(x,y);c.scale(s,s);c.fillStyle=RED;c.strokeStyle=GOLD;c.lineWidth=1;
 c.beginPath();c.ellipse(0,0,4,2.2,-.25,0,TAU);c.fill();c.stroke();c.restore();
}
function make(host){
 var cv=document.createElement("canvas");cv.className="lsdl-footer-canvas";cv.setAttribute("role","img");cv.setAttribute("aria-label","Logo động Lịch Sử và Địa Lí");
 host.appendChild(cv);
 var ctx=cv.getContext("2d"),w=0,h=0,dpr=1,t=0,raf=0,started=performance.now(),active=!done&&!reduced;
 function resize(){dpr=Math.min(2,window.devicePixelRatio||1);w=Math.max(260,host.clientWidth||320);h=118;cv.width=Math.round(w*dpr);cv.height=Math.round(h*dpr);cv.style.height=h+"px";ctx.setTransform(dpr,0,0,dpr,0,0);draw(active?Math.max(0,(performance.now()-started)/1000):10);}
 function text(c,str,x,y,size,alpha){
  c.save();c.globalAlpha=alpha;c.font="900 "+size+"px Impact, 'Arial Narrow', sans-serif";c.textAlign="left";c.textBaseline="middle";c.lineJoin="round";
  c.lineWidth=Math.max(1.5,size*.085);c.strokeStyle=GOLD;c.fillStyle=RED;
  c.strokeText(str,x,y);c.fillText(str,x,y);var width=c.measureText(str).width;c.restore();return width;
 }
 function draw(time){
  t=time;ctx.clearRect(0,0,w,h);
  var scale=Math.min(1,(w-22)/410),cx=w/2,baseY=58;
  ctx.save();ctx.translate(cx,0);ctx.scale(scale,scale);ctx.translate(-205,0);
  var reveal=ease((time-1.1)/.9);
  var titleAlpha=time<.6?0:1;
  ctx.save();ctx.beginPath();
  var revealHeight=time<1.1?24:mix(24,118,reveal);
  ctx.rect(0,118-revealHeight,410,revealHeight);ctx.clip();
  var fs=27, gap=0, x=14, y=58;
  // Từng cụm chữ được tách để thay thế S, VÀ và L bằng biểu tượng.
  var w1=text(ctx,"LỊCH ",x,y,fs,titleAlpha);x+=w1+2;
  var mapT=ease((time-3.75)/.7);
  var dropY=time<3.75?(-50*(1-ease(time/3.75))):mix(-42,0,mapT);
  if(time<3.75){text(ctx,"S",x,y+dropY,fs,titleAlpha);}
  else{
   ctx.save();ctx.globalAlpha=titleAlpha;
   pathMap(ctx,x+9,y-7,0.47);ctx.fillStyle=RED;ctx.strokeStyle=GOLD;ctx.lineWidth=1.5;ctx.fill();ctx.stroke();
   island(ctx,x+7,y+17,.7);island(ctx,x+11,y+21,.65);ctx.restore();
  }
  x+=19;
  var w2=text(ctx,"Ử ",x,y,fs,titleAlpha);x+=w2+2;
  var vaFade=1-ease((time-2.85)/.55);
  if(time<3.4){x+=text(ctx,"VÀ",x,y,fs,titleAlpha*vaFade)+3;}
  else{
   ctx.globalAlpha=titleAlpha;
   island(ctx,x+4,y-3,1.35);island(ctx,x+14,y+3,1.1);island(ctx,x+23,y+8,.8);
   island(ctx,x+9,y+11,.7);x+=32;
  }
  x+=text(ctx," ĐỊ",x,y,fs,titleAlpha);
  var rocketX=x+10;
  if(time<6.1){text(ctx,"A",x,y,fs,titleAlpha);}
  else if(time<8.2){
   var rp=time<7.05?ease((time-6.1)/.95):ease((time-7.05)/1.15);
   var rx=time<7.05?mix(rocketX,500,rp):mix(-48,rocketX,rp);
   rocket(ctx,rx,y,.66,1);
  }else{text(ctx,"A",x,y,fs,titleAlpha);}
  x+=20;
  var riceT=ease((time-4.8)/1.2);
  if(time<4.8){text(ctx,"L",x,y,fs,titleAlpha);}
  else{drawRice(ctx,x+7,y+2,.72,riceT);}
  x+=18;text(ctx,"Í",x,y,fs,titleAlpha);
  // Chim Lạc mở đầu và quay lại ở cuối chuỗi.
  if(time<1.15){var p=ease(time/1.15);bird(ctx,mix(-75,465,p),26+Math.sin(p*Math.PI)*-10,.68,1-p*.9,0);}
  if(time>7.8){
   var p=ease((time-7.8)/1.5);
   bird(ctx,mix(455,344,p),20,.36*(1-p*.15),p,0);
   // Cánh, đầu và đuôi tách ra rồi hoà thành các nét trang trí của chữ.
   ctx.globalAlpha=p*.9;ctx.strokeStyle=GOLD;ctx.fillStyle=RED;ctx.lineWidth=1.4;
   ctx.beginPath();ctx.moveTo(118,27);ctx.quadraticCurveTo(132,16,148,27);ctx.lineTo(137,25);ctx.stroke();
   ctx.beginPath();ctx.arc(291,28,3,0,TAU);ctx.fill();ctx.stroke();
   ctx.beginPath();ctx.moveTo(316,82);ctx.quadraticCurveTo(331,75,342,83);ctx.stroke();
  }
  // Hai quần đảo được nhấn bằng cụm chấm nhỏ dưới bản đồ Việt Nam.
  if(time>3.4){ctx.globalAlpha=titleAlpha;ctx.fillStyle=RED;for(var j=0;j<5;j++){ctx.beginPath();ctx.arc(202+j*3,88+(j%2)*2,1,0,TAU);ctx.fill();}}
  ctx.restore();ctx.restore();
  if(active&&time<10){raf=requestAnimationFrame(function(){draw((performance.now()-started)/1000);});}
  else{active=false;done=true;}
 }
 function destroy(){if(raf)cancelAnimationFrame(raf);if(ro)ro.disconnect();if(cv.parentNode)cv.parentNode.removeChild(cv);}
 var ro=null;if(window.ResizeObserver){ro=new ResizeObserver(resize);ro.observe(host);}
 resize();
 return {destroy:destroy,draw:draw};
}
function mount(root){
 if(!root||root.querySelector(".lsdl-footer-logo"))return;
 var footer=document.createElement("div");footer.className="lsdl-footer-logo";
 footer.innerHTML='<div class="lsdl-footer-rule"></div><div class="lsdl-footer-caption">LỊCH SỬ VÀ ĐỊA LÍ</div>';
 root.appendChild(footer);
 var host=document.createElement("div");host.className="lsdl-footer-art";footer.appendChild(host);
 var inst=make(host);instances.push(inst);
}
window.LsdlFooterLogo={mount:mount};
})();