/* EDUVERSE | Animated footer mark: LỊCH SỬ VÀ ĐỊA LÍ */
(function(){
"use strict";
var finished=false,activeInstance=null,instances=[];
var RED="#c71920",GOLD="#d5ad4e",TAU=Math.PI*2;
var reduced=false;
try{reduced=!!matchMedia("(prefers-reduced-motion: reduce)").matches;}catch(e){}
function clamp(v){return Math.max(0,Math.min(1,v));}
function ease(v){v=clamp(v);return v*v*(3-2*v);}
function lerp(a,b,t){return a+(b-a)*t;}
function strokeFill(c){c.fillStyle=RED;c.strokeStyle=GOLD;c.lineWidth=1.45;c.lineJoin="round";c.lineCap="round";}
function drawBird(c,x,y,s,alpha,wing){
 c.save();c.translate(x,y);c.scale(s,s);c.globalAlpha=alpha;strokeFill(c);
 // Thân dài, thuôn; đầu hướng sang phải, mỏ nhọn.
 c.beginPath();c.moveTo(-25,2);c.bezierCurveTo(-10,-7,8,-5,23,-1);
 c.bezierCurveTo(31,1,35,-2,42,-7);c.lineTo(34,2);
 c.bezierCurveTo(27,10,7,10,-12,7);c.closePath();c.fill();c.stroke();
 // Đầu, mào và mỏ chim Lạc.
 c.beginPath();c.moveTo(21,-3);c.quadraticCurveTo(26,-17,38,-16);
 c.lineTo(34,-11);c.lineTo(49,-9);c.lineTo(35,-6);
 c.quadraticCurveTo(31,1,24,3);c.closePath();c.fill();c.stroke();
 c.beginPath();c.moveTo(27,-14);c.lineTo(21,-24);c.lineTo(33,-18);c.lineTo(38,-25);c.lineTo(38,-15);c.stroke();
 // Cánh lớn xoè ngược về phía sau, có các vạch lông song song.
 var lift=wing||0;
 c.beginPath();c.moveTo(-12,1);
 c.bezierCurveTo(-26,-12-lift,-38,-31-lift,-67,-35-lift);
 c.lineTo(-54,-23-lift);c.lineTo(-75,-25-lift);c.lineTo(-56,-14-lift);
 c.lineTo(-77,-12-lift);c.lineTo(-54,-5-lift);
 c.bezierCurveTo(-37,5,-25,8,-12,7);c.closePath();c.fill();c.stroke();
 for(var i=0;i<5;i++){
  var sx=-25-i*7,sy=-7-i*2.7;
  c.beginPath();c.moveTo(sx,sy);c.lineTo(sx-8,sy-15-lift*.18);c.stroke();
 }
 // Đuôi dài, phân lông thành các dải.
 c.beginPath();c.moveTo(-22,5);c.lineTo(-57,17);c.lineTo(-34,15);
 c.lineTo(-53,29);c.lineTo(-25,18);c.lineTo(-45,35);c.lineTo(-15,12);c.closePath();c.fill();c.stroke();
 c.restore();
}
function drawVietnam(c,x,y,s,alpha){
 c.save();c.translate(x,y);c.scale(s,s);c.globalAlpha=alpha;strokeFill(c);
 // Đường bao giản lược theo dáng chữ S: Bắc Bộ rộng, Trung Bộ hẹp,
 // Nam Bộ mở rộng; không dùng một đường cong đối xứng giả lập.
 c.beginPath();
 c.moveTo(-2,-48);
 c.bezierCurveTo(5,-47,11,-43,15,-37);
 c.bezierCurveTo(22,-34,27,-29,22,-24);
 c.bezierCurveTo(18,-20,25,-16,20,-11);
 c.bezierCurveTo(16,-7,22,-2,17,3);
 c.bezierCurveTo(13,8,17,13,12,18);
 c.bezierCurveTo(8,23,14,29,8,35);
 c.bezierCurveTo(5,40,1,46,-4,49);
 c.bezierCurveTo(-7,43,-8,39,-14,35);
 c.bezierCurveTo(-20,30,-17,24,-22,19);
 c.bezierCurveTo(-27,13,-20,8,-24,2);
 c.bezierCurveTo(-27,-4,-19,-9,-22,-15);
 c.bezierCurveTo(-25,-21,-17,-25,-17,-31);
 c.bezierCurveTo(-16,-39,-10,-45,-2,-48);
 c.closePath();c.fill();c.stroke();
 // Nét bờ biển phía đông được nhấn nhẹ, giữ đường bao tổng thể liền mạch.
 c.beginPath();c.moveTo(14,-25);
 c.bezierCurveTo(19,-20,15,-15,18,-10);
 c.bezierCurveTo(14,-5,18,0,13,5);
 c.bezierCurveTo(10,11,14,16,9,22);c.stroke();
 // Hoàng Sa và Trường Sa: cụm đảo tách khỏi đường bờ.
 c.fillStyle=RED;
 [[28,-2,1.8],[31,1,1.4],[29,5,1.2],[23,23,1.6],[27,27,1.2],[21,31,1]].forEach(function(p){
  c.beginPath();c.ellipse(p[0],p[1],p[2],p[2]*.7,-.4,0,TAU);c.fill();c.stroke();
 });
 c.restore();
}
function drawIslands(c,x,y,s,alpha){
 c.save();c.translate(x,y);c.scale(s,s);c.globalAlpha=alpha;strokeFill(c);
 // Cụm Hoàng Sa và Trường Sa biểu diễn thành hai nhóm đảo, không phải chấm trang trí.
 function at(dx,dy,rx,ry,rot){c.beginPath();c.ellipse(dx,dy,rx,ry,rot,0,TAU);c.fill();c.stroke();}
 at(-12,-7,5,2.2,-.35);at(-2,-11,3,1.6,.2);at(7,-5,4,2,-.5);
 at(12,8,4,1.8,.25);at(3,13,3.2,1.5,-.4);at(-7,9,2.8,1.4,.1);
 c.restore();
}
function drawRice(c,x,y,s,grow,alpha){
 c.save();c.translate(x,y);c.scale(s,s);c.globalAlpha=alpha;strokeFill(c);
 // Thân lúa mọc từ gốc lên, nghiêng nhẹ theo chiều gió.
 c.beginPath();c.moveTo(0,25);c.bezierCurveTo(-2,8,5,-12,2,-34*grow);c.stroke();
 for(var i=0;i<7;i++){
  var yy=-8-i*5,side=i%2?-1:1,xx=2+side*(3+i*.7);
  c.beginPath();c.ellipse(xx+side*5,yy,3.1,6.2,side*-.62,0,TAU);c.fill();c.stroke();
 }
 c.beginPath();c.moveTo(0,15);c.quadraticCurveTo(-10,5,-17,2);
 c.moveTo(1,8);c.quadraticCurveTo(10,-2,17,-8);c.stroke();
 c.restore();
}
function drawRocket(c,x,y,s,alpha){
 c.save();c.translate(x,y);c.rotate(-.08);c.scale(s,s);c.globalAlpha=alpha;strokeFill(c);
 c.beginPath();c.moveTo(-25,-6);c.quadraticCurveTo(-5,-12,16,-7);
 c.lineTo(29,0);c.lineTo(16,7);c.quadraticCurveTo(-5,12,-25,6);c.closePath();c.fill();c.stroke();
 c.beginPath();c.moveTo(-12,-6);c.lineTo(-22,-16);c.lineTo(-19,-4);
 c.moveTo(-12,6);c.lineTo(-22,16);c.lineTo(-19,4);c.stroke();
 c.beginPath();c.arc(9,0,3.2,0,TAU);c.fillStyle=GOLD;c.fill();c.stroke();
 c.beginPath();c.moveTo(-25,-4);c.lineTo(-40,0);c.lineTo(-25,4);c.closePath();c.fillStyle="#f28b32";c.fill();
 c.restore();
}
function make(host){
 var canvas=document.createElement("canvas");canvas.className="lsdl-footer-canvas";
 canvas.setAttribute("role","img");canvas.setAttribute("aria-label","Logo động Lịch Sử và Địa Lí");
 host.appendChild(canvas);
 var c=canvas.getContext("2d"),w=320,h=132,dpr=1,raf=0,t=0,start=performance.now();
 var playing=!finished&&!reduced,ro=null;
 function fit(){
  dpr=Math.min(2,window.devicePixelRatio||1);w=Math.max(260,host.clientWidth||320);
  h=132;canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);
  canvas.style.height=h+"px";c.setTransform(dpr,0,0,dpr,0,0);
  if(raf)cancelAnimationFrame(raf);paint(playing?(performance.now()-start)/1000:10);
 }
 function measure(str,size){c.font="900 "+size+"px 'Arial Narrow',Impact,sans-serif";return c.measureText(str).width;}
 function word(str,x,y,size,alpha){
  c.save();c.globalAlpha=alpha;c.font="900 "+size+"px 'Arial Narrow',Impact,sans-serif";
  c.textAlign="left";c.textBaseline="middle";c.lineJoin="round";c.lineWidth=1.6;
  c.fillStyle=RED;c.strokeStyle=GOLD;c.strokeText(str,x,y);c.fillText(str,x,y);
  var z=c.measureText(str).width;c.restore();return z;
 }
 function paint(sec){
  t=sec;c.clearRect(0,0,w,h);
  var scale=Math.min(1,(w-24)/430),size=29;
  var widths=["LỊCH ","Ử "," ĐỊ","A","Í"].map(function(v){return measure(v,size);});
  var mapW=34,islandW=34,riceW=20,gap=3;
  var total=widths[0]+mapW+widths[1]+islandW+widths[2]+widths[3]+riceW+widths[4]+gap*7;
  var sc=Math.min(scale,(w-18)/total),x=(w-total*sc)/2;
  c.save();c.translate(x,0);c.scale(sc,sc);
  var y=66;
  // Chim bay ngang ở lớp trên, trước khi chữ xuất hiện.
  if(sec<1.2){var q=ease(sec/1.2);drawBird(c,lerp(-95,total+100,q),26+Math.sin(q*Math.PI)*-8,.72,1-q*.88,Math.sin(q*TAU)*4);}
  var reveal=ease((sec-1.15)/1.05),alpha=sec<1.15?0:1;
  // Lộ dần theo chiều cao: phần chữ mở lên từ 1/5 rồi hoàn chỉnh.
  c.save();c.beginPath();var hh=sec<1.15?0:lerp(24,132,reveal);
  c.rect(-8,y-hh/2,total+16,hh);c.clip();
  var px=0;
  px+=word("LỊCH ",px,y,size,alpha)+gap;
  var mapAlpha=ease((sec-3.45)/.65);
  if(sec<3.45){var fall=lerp(-54,0,ease((sec-2.95)/.5));word("S",px,y+fall,size,alpha);}
  else drawVietnam(c,px+mapW*.5,y-1,.46,alpha);
  px+=mapW+gap;
  px+=word("Ử ",px,y,size,alpha)+gap;
  if(sec<3.1){word("VÀ",px,y,size,alpha*(1-ease((sec-2.55)/.55)));}
  else drawIslands(c,px+islandW*.5,y-1,.9,alpha);
  px+=islandW+gap;
  px+=word(" ĐỊ",px,y,size,alpha)+gap;
  var rocketX=px+widths[3]*.5;
  if(sec<6.05||sec>8.2)word("A",px,y,size,alpha);
  else{
   var rq=sec<7.05?ease((sec-6.05)/1):ease((sec-7.05)/1.15);
   var rx=sec<7.05?lerp(rocketX,rocketX+180,rq):lerp(-45,rocketX,rq);
   drawRocket(c,rx,y,.68,1);
  }
  px+=widths[3]+gap;
  var riceProgress=ease((sec-4.65)/1.1);
  if(sec<4.65)word("L",px,y,size,alpha*(1-ease((sec-4.15)/.5)));
  drawRice(c,px+riceW*.5,y+2,.72,riceProgress,sec<4.65?0:alpha);
  px+=riceW+gap;word("Í",px,y,size,alpha);
  c.restore();
  // Chim trở lại; cánh, đầu và đuôi lần lượt tách ra rồi nhập vào nét viền chữ.
  if(sec>8.1){
   var b=ease((sec-8.1)/1.55);
   drawBird(c,lerp(total+85,total*.78,b),25,.44,1-b*.35,0);
   c.save();c.globalAlpha=b*.9;c.strokeStyle=GOLD;c.fillStyle=RED;c.lineWidth=1.8;
   c.beginPath();c.moveTo(56,38);c.quadraticCurveTo(69,24,82,37);c.stroke();
   c.beginPath();c.arc(total*.72,38,3,0,TAU);c.fill();
   c.beginPath();c.moveTo(total*.82,89);c.quadraticCurveTo(total*.86,78,total*.9,86);c.stroke();c.restore();
  }
  c.restore();
  if(playing&&sec<10){raf=requestAnimationFrame(function(){paint((performance.now()-start)/1000);});}
  else{playing=false;finished=true;}
 }
 function destroy(){if(raf)cancelAnimationFrame(raf);if(ro)ro.disconnect();if(canvas.parentNode)canvas.parentNode.removeChild(canvas);}
 if(window.ResizeObserver){ro=new ResizeObserver(fit);ro.observe(host);}
 fit();return{destroy:destroy,draw:paint,get t(){return t;}};
}
function mount(root){
 if(!root||root.querySelector(".lsdl-footer-logo"))return;
 var footer=document.createElement("div");footer.className="lsdl-footer-logo";
 footer.innerHTML='<div class="lsdl-footer-rule"></div><div class="lsdl-footer-caption">LỊCH SỬ VÀ ĐỊA LÍ</div>';
 root.appendChild(footer);var host=document.createElement("div");host.className="lsdl-footer-art";footer.appendChild(host);
 activeInstance=make(host);instances.push(activeInstance);
}
function unmount(){if(activeInstance){activeInstance.destroy();instances=instances.filter(function(v){return v!==activeInstance;});activeInstance=null;}}
window.LsdlFooterLogo={mount:mount,unmount:unmount};
})();