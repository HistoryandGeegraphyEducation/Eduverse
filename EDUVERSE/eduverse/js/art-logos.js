/* =====================================================================
   ART-LOGOS – logo động cho ÂM NHẠC (id "am") và MĨ THUẬT (id "mt")
   Cùng cơ chế với history-logo.js: canvas thay biểu tượng trong ô môn học
   (ẩn emoji), hiệu ứng vào, chuyển động duy trì, hover/nhấn, chuyển trang.
   Logo là hình vẽ vector gốc (không dùng ảnh ngoài). Hỗ trợ prefers-reduced-motion.
   Gắn vào app.js qua ArtLogos.mountAll(main).
   ===================================================================== */
(function(){
"use strict";
var W=304,H=224,PADX=24,PADY=27,TAU=Math.PI*2;
function clamp01(x){return x<0?0:x>1?1:x;}
function seg(t,a,b){return clamp01((t-a)/(b-a));}
function eOut(x){return 1-Math.pow(1-x,3);}
function eBack(x,k){var c=k+1;return 1+c*Math.pow(x-1,3)+k*Math.pow(x-1,2);}
function pop(t,a,d){var u=seg(t,a,a+d);return u<=0?0:eBack(u,1.6);}
function fade(t,a,d){return eOut(seg(t,a,a+d));}

var reduced=false;
try{
  var mq=window.matchMedia("(prefers-reduced-motion: reduce)");reduced=!!mq.matches;
  var onMq=function(e){reduced=!!e.matches;for(var i=0;i<insts.length;i++){insts[i].lastDraw=-1e9;}kick();};
  if(mq.addEventListener)mq.addEventListener("change",onMq);else if(mq.addListener)mq.addListener(onMq);
}catch(e){}

/* ---------------- LOGO ÂM NHẠC: đĩa nhạc xanh + cặp nốt vàng + sóng âm ---------------- */
function gold(c,x0,y0,x1,y1){var g=c.createLinearGradient(x0,y0,x1,y1);g.addColorStop(0,"#ffe08a");g.addColorStop(.5,"#f6b13c");g.addColorStop(1,"#d9811a");return g;}
function drawMusic(c,t,s){
  var o=s.o,b=s.b,i,a;
  // 1) đĩa
  var dS=pop(t,0,.7);
  if(dS>0){
    c.save();c.translate(176,114);c.scale(dS,dS);
    c.shadowColor="rgba(10,40,130,.35)";c.shadowBlur=10;c.shadowOffsetY=4;
    var g=c.createRadialGradient(-24,-28,6,0,0,82);g.addColorStop(0,"#8fd6ff");g.addColorStop(.55,"#2f7de8");g.addColorStop(1,"#1443b0");
    c.fillStyle=g;c.beginPath();c.arc(0,0,78,0,TAU);c.fill();
    c.shadowColor="transparent";
    c.strokeStyle="rgba(255,255,255,.17)";c.lineWidth=1.6;
    for(i=0;i<4;i++){c.beginPath();c.arc(0,0,32+i*11,0,TAU);c.stroke();}
    c.save();c.rotate(o*(.5+1.6*b));c.lineCap="round";
    c.strokeStyle="rgba(255,255,255,.55)";c.lineWidth=6;c.beginPath();c.arc(0,0,62,-.55,.1);c.stroke();
    c.strokeStyle="rgba(255,255,255,.22)";c.lineWidth=4;c.beginPath();c.arc(0,0,62,Math.PI-.5,Math.PI+.05);c.stroke();
    c.restore();
    c.fillStyle=gold(c,-20,-20,20,20);c.beginPath();c.arc(0,0,21,0,TAU);c.fill();
    c.strokeStyle="#b8650f";c.lineWidth=2;c.stroke();
    c.fillStyle="#fff";c.beginPath();c.arc(0,0,4.5,0,TAU);c.fill();
    c.restore();
  }
  // 2) sóng âm phía phải đĩa (xuất hiện sau đĩa)
  for(i=0;i<3;i++){
    a=fade(t,.8+i*.18,.4);if(a<=0)continue;
    var pulse=.5+.5*Math.sin(o*3.2-i*1.0)*(1+b*.6);
    c.strokeStyle="rgba(150,210,255,"+(a*(.30+.5*Math.min(1,pulse)))+")";
    c.lineWidth=7-i*1.5;c.lineCap="round";
    c.beginPath();c.arc(176,114,94+i*13+b*3*Math.sin(o*5),-.52,.52);c.stroke();
  }
  // 3) cặp nốt vàng đè lên đĩa
  var nS=pop(t,1.1,.7);
  if(nS>0){
    var bob=Math.sin(o*2.3)*3*(1+b*1.5),sw=Math.sin(o*1.7)*.03*(1+b*2);
    c.save();c.translate(124,124+bob);c.rotate(sw);c.scale(nS,nS);c.translate(-124,-124);
    c.shadowColor="rgba(60,30,0,.35)";c.shadowBlur=8;c.shadowOffsetY=4;
    c.fillStyle=gold(c,90,50,190,175);c.strokeStyle="#a85a0c";c.lineWidth=3.5;c.lineJoin="round";
    c.beginPath();c.rect(113,62,9,102);c.fill();c.stroke();          // thân nốt 1
    c.beginPath();c.rect(178,48,9,92);c.fill();c.stroke();           // thân nốt 2
    c.beginPath();c.moveTo(113,60);c.lineTo(187,44);c.lineTo(187,70);c.lineTo(113,86);c.closePath();c.fill();c.stroke(); // gạch nối
    var hs=[[96,166],[161,150]];
    for(i=0;i<2;i++){
      c.save();c.translate(hs[i][0],hs[i][1]);c.rotate(-.42);
      c.fillStyle=gold(c,-24,-16,24,16);c.beginPath();c.ellipse(0,0,25,17,0,0,TAU);c.fill();c.stroke();
      c.shadowColor="transparent";c.fillStyle="rgba(255,255,255,.5)";c.beginPath();c.ellipse(-8,-6,9,4,0,0,TAU);c.fill();
      c.restore();c.shadowColor="rgba(60,30,0,.35)";
    }
    c.restore();
  }
}

/* ---------------- LOGO MĨ THUẬT: bảng màu gỗ + 5 mảng màu + cọ vẽ ---------------- */
function drawArt(c,t,s){
  var o=s.o,b=s.b,i;
  // 1) bảng màu
  var pS=pop(t,0,.7);
  if(pS>0){
    c.save();c.translate(150,118);c.rotate(Math.sin(o*1.1)*.025*(1+b*2));c.scale(pS,pS);c.translate(-150,-118);
    c.shadowColor="rgba(80,40,0,.35)";c.shadowBlur=10;c.shadowOffsetY=5;
    c.fillStyle=gold(c,60,30,270,200);c.strokeStyle="#a85a0c";c.lineWidth=4;c.lineJoin="round";
    c.beginPath();c.moveTo(60,110);
    c.bezierCurveTo(52,60,110,28,170,34);
    c.bezierCurveTo(250,40,292,92,262,140);
    c.bezierCurveTo(240,182,196,172,180,190);
    c.bezierCurveTo(166,208,110,206,84,176);
    c.bezierCurveTo(60,150,62,128,60,110);
    c.closePath();
    c.moveTo(126,150);c.ellipse(112,150,14,10,-.3,0,TAU,true);
    c.fill("evenodd");c.shadowColor="transparent";c.stroke();
    c.fillStyle="rgba(255,255,255,.35)";c.beginPath();c.ellipse(120,56,34,8,-.35,0,TAU);c.fill();
    c.restore();
  }
  // 2) các mảng màu
  var cols=[["#ff4d5e","#c81f36"],["#ffd23a","#d89b0a"],["#45cf72","#1c8f48"],["#3a8cff","#1a54c4"],["#b062f5","#7a2bc0"]];
  var ps=[[98,86],[142,62],[192,62],[234,88],[240,132]];
  for(i=0;i<5;i++){
    var d=pop(t,.7+i*.17,.55);if(d<=0)continue;
    var k=d*(1+.06*Math.sin(o*2.6+i*1.3)*(1+b*1.5));
    c.save();c.translate(ps[i][0],ps[i][1]);c.scale(k,k);
    c.shadowColor="rgba(0,0,0,.28)";c.shadowBlur=5;c.shadowOffsetY=3;
    var g=c.createRadialGradient(-5,-6,2,0,0,19);g.addColorStop(0,cols[i][0]);g.addColorStop(1,cols[i][1]);
    c.fillStyle=g;c.beginPath();c.arc(0,0,18,0,TAU);c.fill();c.shadowColor="transparent";
    c.fillStyle="rgba(255,255,255,.65)";c.beginPath();c.ellipse(-6,-7,6,3.2,-.6,0,TAU);c.fill();
    c.restore();
  }
  // 3) cọ vẽ đè lên bảng màu
  var bd=seg(t,1.7,2.4);
  if(bd>0){
    var sl=(1-eOut(bd))*46,ang=-.62+Math.sin(o*2.1)*.05*(1+b*2.2);
    c.save();c.globalAlpha=Math.min(1,bd*2);c.translate(150,168);c.rotate(ang);c.translate(sl,0);
    c.shadowColor="rgba(0,0,0,.3)";c.shadowBlur=7;c.shadowOffsetY=4;
    c.lineJoin="round";c.lineWidth=3.2;c.strokeStyle="#7a3f08";
    c.fillStyle="#f0b64a";                                  // đầu lông cọ
    c.beginPath();c.moveTo(0,0);c.bezierCurveTo(10,-14,26,-14,36,-11);c.lineTo(36,11);c.bezierCurveTo(26,14,10,14,0,0);c.closePath();c.fill();c.stroke();
    c.shadowColor="transparent";c.fillStyle="#ff4d5e";      // giọt màu ở đầu cọ
    c.beginPath();c.moveTo(0,0);c.bezierCurveTo(5,-7,14,-8,18,-6);c.lineTo(18,6);c.bezierCurveTo(14,8,5,7,0,0);c.closePath();c.fill();
    var m=c.createLinearGradient(0,-12,0,12);m.addColorStop(0,"#f4f7fb");m.addColorStop(.5,"#b7c3d4");m.addColorStop(1,"#7e8ea6");
    c.fillStyle=m;c.strokeStyle="#4b5a73";c.beginPath();c.rect(36,-12,28,24);c.fill();c.stroke();   // đai kim loại
    c.beginPath();c.moveTo(64,-9);c.lineTo(150,-6);c.arc(150,0,6,-Math.PI/2,Math.PI/2);c.lineTo(64,9);c.closePath();   // cán
    var hg=c.createLinearGradient(0,-9,0,9);hg.addColorStop(0,"#6fb6ff");hg.addColorStop(1,"#1c58c8");
    c.fillStyle=hg;c.strokeStyle="#12388a";c.fill();c.stroke();
    c.fillStyle="rgba(255,255,255,.45)";c.fillRect(70,-6,70,2.6);
    c.restore();
  }
}

var KINDS={am:drawMusic,mt:drawArt};
var introDone={};

/* ---------------- ĐIỀU PHỐI ---------------- */
var insts=[],running=false;
function Logo(btn,host,kind,opts){
  this.opts=opts||{};this.btn=btn;this.host=host;this.kind=kind;this.fn=KINDS[kind];
  this.t0=0;this.mode="sustain";this.o=0;this.hov=0;this.hovT=0;this.act=null;this.last=0;this.lastDraw=-1e9;
  this.visible=true;this.ready=false;this.gone=false;
}
Logo.prototype.layout=function(){
  var dpr=Math.min(this.opts.transient?2:3,Math.max(1,window.devicePixelRatio||1));
  var cssW=this.cv.clientWidth||this.host.clientWidth*1.16||60,cssH=this.cv.clientHeight||cssW*.8;
  this.cv.width=Math.max(48,Math.round(cssW*dpr));this.cv.height=Math.max(36,Math.round(cssH*dpr));
  var S=Math.min(this.cv.width/(W+2*PADX),this.cv.height/(H+2*PADY));
  this.S=S;this.ox=(this.cv.width-(W+2*PADX)*S)/2+PADX*S;this.oy=(this.cv.height-(H+2*PADY)*S)/2+PADY*S;
  this.cx=this.cv.getContext("2d");this.cx.imageSmoothingQuality="high";this.lastDraw=-1e9;
};
Logo.prototype.init=function(){
  var self=this;
  this.host.classList.add("hl");
  var cv=document.createElement("canvas");cv.setAttribute("aria-hidden","true");
  this.host.appendChild(cv);this.cv=cv;
  this.layout();this.host.classList.add("ready");this.ready=true;
  if(this.opts.transient){
    var f=this.opts.from;this.mode="sustain";this.o=f.o;this.last=performance.now();
    insts.push(this);kick();if(this.opts.onReady)this.opts.onReady(this);return;
  }
  this.bind();this.start(performance.now());
  if(window.IntersectionObserver){
    this.io=new IntersectionObserver(function(es){self.visible=es[es.length-1].isIntersecting;if(self.visible){self.last=performance.now();kick();}},{threshold:0.01});
    this.io.observe(this.host);
  }
  if(window.ResizeObserver){
    var w0=this.host.clientWidth;
    this.ro=new ResizeObserver(function(){if(self.host.clientWidth!==w0){w0=self.host.clientWidth;self.layout();kick();}});
    this.ro.observe(this.host);
  }
  insts.push(this);kick();
};
Logo.prototype.start=function(now){
  if(!reduced&&!introDone[this.kind]){this.mode="intro";this.t0=now;introDone[this.kind]=true;}
  else this.mode="sustain";
  this.last=now;
};
Logo.prototype.bind=function(){
  var self=this,b=this.btn;
  var enter=function(){self.hovT=1;kick();};
  var leave=function(){self.hovT=0;kick();};
  b.addEventListener("pointerenter",enter);b.addEventListener("pointerleave",leave);
  b.addEventListener("pointerdown",enter);b.addEventListener("pointercancel",leave);
  b.addEventListener("pointerup",function(e){if(e.pointerType&&e.pointerType!=="mouse")setTimeout(leave,350);});
  b.addEventListener("focus",enter);b.addEventListener("blur",leave);
  b.addEventListener("click",function(e){
    if(b._alPass||reduced||!self.ready)return;
    e.preventDefault();e.stopImmediatePropagation();
    if(b._alBusy)return;b._alBusy=true;
    var go=function(){b._alPass=true;try{b.click();}finally{b._alPass=false;}};
    var end=function(){b._alBusy=false;};
    if(b.classList.contains("live"))self.transition(go,end);   // môn đã có trang bên trong → chuyển trang
    else{self.activate(520);setTimeout(function(){go();end();},460);}  // môn "sắp ra mắt" → chỉ hiệu ứng nhấn rồi hiện thông báo
  },true);
};
Logo.prototype.activate=function(dur){this.act={t0:performance.now(),dur:dur||520};this.hovT=1;kick();};

/* Chuyển trang: logo phóng to bay ra giữa màn hình, vòng sáng loang phủ kín → điều hướng → tan ra */
var TR={fly:560,iris:680,nav:760,out:420,total:1320};
Logo.prototype.transition=function(go,end){
  var host=this.host,doc=document;
  if(!host.animate||!doc.body){this.activate();setTimeout(function(){go();end();},300);return;}
  var vw=window.innerWidth,vh=window.innerHeight,r=host.getBoundingClientRect();
  var cx=r.left+r.width/2,cy=r.top+r.height/2;
  var size=Math.round(Math.min(vw*.62,240)),sh=size*H/W,fx=vw/2,fy=vh*.40;
  var root=doc.createElement("div");root.className="hlx";root.setAttribute("aria-hidden","true");
  var iris=doc.createElement("div");iris.className="hlx-iris";
  var box=doc.createElement("div");box.className="hlx-logo";
  box.style.width=size+"px";box.style.height=sh+"px";box.style.left=(fx-size/2)+"px";box.style.top=(fy-sh/2)+"px";
  iris.style.clipPath="circle(0px at "+cx+"px "+cy+"px)";box.style.opacity="0";
  root.appendChild(iris);root.appendChild(box);doc.body.appendChild(root);
  var finished=false;
  function finish(){if(finished)return;finished=true;host.style.visibility="";if(root.parentNode)root.parentNode.removeChild(root);end();}
  var tr=new Logo(this.btn,box,this.kind,{transient:true,from:this,onReady:function(t){
    host.style.visibility="hidden";
    var s0=r.width/size,dx=cx-fx,dy=cy-fy;
    box.style.opacity="1";
    box.animate([{transform:"translate("+dx+"px,"+dy+"px) scale("+s0+")"},{transform:"none"}],{duration:TR.fly,easing:"cubic-bezier(.2,.8,.2,1)",fill:"forwards"});
    var mx=Math.max(cx,vw-cx),my=Math.max(cy,vh-cy),far=Math.sqrt(mx*mx+my*my)+8;
    iris.animate([{clipPath:"circle(0px at "+cx+"px "+cy+"px)"},{clipPath:"circle("+far+"px at "+cx+"px "+cy+"px)"}],{duration:TR.iris,delay:90,easing:"cubic-bezier(.5,0,.2,1)",fill:"forwards"});
    t.activate(TR.nav+120);
    setTimeout(function(){go();},TR.nav);
    setTimeout(function(){
      box.animate([{opacity:1,transform:"none"},{opacity:0,transform:"scale(1.35)"}],{duration:TR.out,easing:"ease-in",fill:"forwards"});
      iris.animate([{opacity:1},{opacity:0}],{duration:TR.out,delay:50,easing:"ease-out",fill:"forwards"});
    },TR.nav+40);
    setTimeout(finish,TR.total);
  }});
  tr.init();
};

Logo.prototype.tick=function(now){
  var dt=Math.min(.1,Math.max(0,(now-this.last)/1000));this.last=now;
  var ab=0;
  if(this.act){var u=(now-this.act.t0)/this.act.dur;if(u>=1)this.act=null;else ab=Math.sin(Math.PI*Math.min(1,u*1.2));}
  this.hov+=(this.hovT-this.hov)*Math.min(1,dt*8);if(this.hov<.005&&!this.hovT)this.hov=0;
  var b=Math.max(this.hov,ab);
  var t=99;
  if(this.mode==="intro"){t=(now-this.t0)/1000;if(t>2.9){this.mode="sustain";t=99;}}
  if(reduced){t=99;b=0;}else this.o+=dt*(1+2.2*b);
  this.draw(t,b);
};
Logo.prototype.draw=function(t,b){
  var c=this.cx;c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,this.cv.width,this.cv.height);
  c.setTransform(this.S,0,0,this.S,this.ox,this.oy);
  this.fn(c,t,{o:this.o,b:b});
  if(b>.01){c.save();c.globalCompositeOperation="source-atop";c.fillStyle="rgba(255,255,255,"+(.22*b)+")";c.fillRect(-PADX,-PADY,W+2*PADX,H+2*PADY);c.restore();}
};
function kick(){if(!running&&insts.length){running=true;requestAnimationFrame(loop);}}
function loop(now){
  var any=false,i;
  for(i=insts.length-1;i>=0;i--){
    var it=insts[i];
    if(!it.host.isConnected){it.gone=true;if(it.io)it.io.disconnect();if(it.ro)it.ro.disconnect();insts.splice(i,1);continue;}
    if(!it.visible)continue;
    var busy=it.mode==="intro"||it.hov>.01||it.hovT>0||it.act;
    if(reduced&&!busy){if(it.lastDraw<0){it.tick(now);it.lastDraw=now;}continue;}
    any=true;
    if(!busy&&now-it.lastDraw<33)continue;
    it.lastDraw=now;it.tick(now);
  }
  if(insts.length&&(any||reduced))requestAnimationFrame(loop);else running=false;
}
document.addEventListener("visibilitychange",function(){if(!document.hidden){for(var i=0;i<insts.length;i++)insts[i].last=performance.now();kick();}});

window.ArtLogos={
  mountAll:function(root){
    try{
      var list=(root||document).querySelectorAll('.subj[data-s="am"],.subj[data-s="mt"]');
      for(var i=0;i<list.length;i++){
        var b=list[i];if(b._al)continue;
        var host=b.querySelector(".e");if(!host)continue;
        b._al=new Logo(b,host,b.getAttribute("data-s"));b._al.init();
      }
    }catch(e){}
  }
};
})();
