/* =====================================================================
   EDUVERSE – Logo động môn LỊCH SỬ VÀ ĐỊA LÍ (cột cổ đại + địa cầu + la bàn)
   ---------------------------------------------------------------------
   Logo được tách thành 3 thành phần độc lập, cắt từ chính ảnh logo gốc:
     • history-column   : cột kiến trúc  (assets/img/subject/lsdl-column.png)
     • history-globe    : địa cầu xoay 3D thật (kết cấu lục địa + hàm dựng cầu bên dưới)
     • history-compass  : la bàn (lsdl-compass.png) + kim (lsdl-needle.png) xoay riêng
     • history-logo-animation : bộ điều phối trình tự (phần "ĐIỀU PHỐI" bên dưới)
   Gắn vào nút môn học  .subj[data-s="lsdl"]  (màn hình chính + tab Danh mục)
   thông qua  HistoryLogo.mountAll(main)  trong app.js.
   Không có tệp/ảnh/JS hỏng → nút giữ biểu tượng emoji cũ, điều hướng không đổi.
   ===================================================================== */
(function(){
"use strict";

/* ===================== 1. CẤU HÌNH ===================== */
var ASSET="assets/img/subject/";
var FILES={column:"lsdl-column.png",compass:"lsdl-compass.png",needle:"lsdl-needle.png"};

// Hệ toạ độ logo (đơn vị ≈ điểm ảnh của ảnh gốc), gốc = góc trên-trái của logo
var W=304,H=224;
var PADX=24,PADY=27;                                   // lề trong canvas cho hiệu ứng phóng to/toả sáng
var COL={x:1,y:0,w:164,h:222};                         // cột
var GLOBE={cx:182.73,cy:131.88,r:81};                  // địa cầu
var COMP={x:179,y:99,size:125,cx:241.3,cy:161.4,r:59.7}; // la bàn (thân + vòng)
var NEEDLE={x:190,y:109,size:104,hx:242.31,hy:161.35};   // kim (hub = tâm xoay)
// Tư thế địa cầu trong logo gốc (kinh độ giữa, vĩ độ nhìn, nghiêng trục)
var LON0=-66.493,LAT0=11.579,ROLL=6.637;

var T={                                                // mốc thời gian (giây) của chuỗi xuất hiện
  glowIn:0.5, glowOutA:4.5, glowOutB:5.7,
  base:[0.35,0.80], shaft:[0.75,1.30], cap:[1.25,1.75],  // cột: chân → thân → đầu cột
  shine:[1.8,2.6],
  globe:[1.4,2.1], spin:[1.9,3.1],
  compass:[2.1,2.65], needleGo:2.5, ring:[2.9,4.2],
  sync:[4.1,5.0], end:5.7
};
var NEEDLE_START=42.5;       // góc kim trong logo gốc (độ, theo chiều kim đồng hồ từ hướng Bắc)
var NEEDLE_REST=0;           // hướng Bắc
var SPIN_BASE=360/52;        // độ/giây: ~52 giây một vòng (chậm, ổn định)
var INTRO_ONCE=true;         // chỉ chạy chuỗi xuất hiện đầy đủ một lần mỗi lần mở trang

/* ===================== 2. TIỆN ÍCH ===================== */
function clamp01(x){return x<0?0:x>1?1:x;}
function lerp(a,b,t){return a+(b-a)*t;}
function seg(t,a,b){return clamp01((t-a)/(b-a));}
function eOut(x){return 1-Math.pow(1-x,3);}
function eInOut(x){return x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2;}
function eBack(x,k){var c=k+1;return 1+c*Math.pow(x-1,3)+k*Math.pow(x-1,2);}
function bump(t,a,b){var u=seg(t,a,b);var s=Math.sin(Math.PI*u);return s*s;}
var DEG=Math.PI/180;

var reduced=false,mq=null;
try{
  mq=window.matchMedia("(prefers-reduced-motion: reduce)");
  reduced=!!mq.matches;
  var onMq=function(e){reduced=!!e.matches;for(var i=0;i<insts.length;i++)insts[i].onMotionPref();};
  if(mq.addEventListener)mq.addEventListener("change",onMq);else if(mq.addListener)mq.addListener(onMq);
}catch(e){}

/* ===================== 3. NẠP TÀI NGUYÊN ===================== */
var assets=null;
function b64(s){var r=atob(s),a=new Uint8Array(r.length);for(var i=0;i<r.length;i++)a[i]=r.charCodeAt(i);return a;}
function loadImg(src){
  return new Promise(function(res,rej){var im=new Image();im.onload=function(){res(im);};im.onerror=function(){rej(new Error(src));};im.src=src;});
}
function loadAssets(){
  if(assets)return assets;
  assets=Promise.all([
    loadImg(ASSET+FILES.column),loadImg(ASSET+FILES.compass),loadImg(ASSET+FILES.needle),
    loadImg("data:image/png;base64,"+DATA.tex)
  ]).then(function(a){
    var c=document.createElement("canvas");c.width=a[3].width;c.height=a[3].height;
    var x=c.getContext("2d");x.drawImage(a[3],0,0);
    var d=x.getImageData(0,0,c.width,c.height).data,g=new Uint8Array(c.width*c.height);
    for(var i=0;i<g.length;i++)g[i]=d[i*4];
    return {column:a[0],compass:a[1],needle:a[2],tw:c.width,th:c.height,tex:g,
            fo:b64(DATA.fo),fl:b64(DATA.fl),fn:DATA.n};
  });
  assets.catch(function(){assets=null;});
  return assets;
}

/* ===================== 4. history-globe: địa cầu 3D ===================== */
/* Phép chiếu trực giao ngược: mỗi điểm ảnh của đĩa → (kinh độ, vĩ độ) → lấy mẫu kết cấu lục địa.
   Màu biển/đất lấy từ trường màu của logo gốc (ánh sáng cố định theo màn hình) nên bề mặt giữ
   nguyên màu sắc khi xoay. Mỗi khung chỉ cần dịch kinh độ → chi phí rất nhỏ. */
function buildGlobe(inst){
  var A=inst.A,D=Math.max(24,Math.ceil(2*GLOBE.r*inst.S*1.0));
  var c=Math.cos(ROLL*DEG),s=Math.sin(ROLL*DEG),la=LAT0*DEG,sl=Math.sin(la),cl=Math.cos(la);
  var N=A.fn,TH=A.th,TW=A.tw,n=0,i,px,py;
  var cap=D*D;
  var idx=new Int32Array(cap),u0=new Float32Array(cap),v=new Float32Array(cap),
      o=new Float32Array(cap*3),d=new Float32Array(cap*3),rim=new Float32Array(cap),al=new Uint8Array(cap);
  function fld(arr,fx,fy,k){                           // nội suy song tuyến trường màu (hàng 0 = trên)
    var X=fx*N-0.5,Y=fy*N-0.5;X=X<0?0:X>N-1.001?N-1.001:X;Y=Y<0?0:Y>N-1.001?N-1.001:Y;
    var x0=X|0,y0=Y|0,tx=X-x0,ty=Y-y0;
    var a=arr[(y0*N+x0)*3+k],b=arr[(y0*N+x0+1)*3+k],cc=arr[((y0+1)*N+x0)*3+k],dd=arr[((y0+1)*N+x0+1)*3+k];
    return (a+(b-a)*tx)*(1-ty)+(cc+(dd-cc)*tx)*ty;
  }
  for(py=0;py<D;py++)for(px=0;px<D;px++){
    var nx=(px+0.5)/D*2-1,ny=1-(py+0.5)/D*2,r=Math.sqrt(nx*nx+ny*ny);
    var a=clamp01((1-r)*D/2+0.5);
    if(a<=0)continue;
    var q=r>0.9999?0.9999/r:1,qx=nx*q,qy=ny*q;
    var x=c*qx+s*qy,y=-s*qx+c*qy,z=Math.sqrt(Math.max(0,1-x*x-y*y));
    var lat=Math.asin(Math.max(-1,Math.min(1,y*cl+z*sl)))/DEG;
    var dl=Math.atan2(x,z*cl-y*sl)/DEG;
    idx[n]=(py*D+px)*4;
    u0[n]=dl/360*TW-0.5;
    var vv=(90-lat)/180*TH-0.5;v[n]=vv<0?0:vv>TH-1.001?TH-1.001:vv;
    var fx=(nx+1)/2,fy=(1-ny)/2;
    for(i=0;i<3;i++){var oc=fld(A.fo,fx,fy,i),lc=fld(A.fl,fx,fy,i);o[n*3+i]=oc;d[n*3+i]=lc-oc;}
    var k=clamp01((r-0.955)/0.04),dir=clamp01(-nx*0.6+ny*0.8);
    rim[n]=k*(0.30+0.35*dir);
    al[n]=Math.round(a*255);
    n++;
  }
  var cv=document.createElement("canvas");cv.width=D;cv.height=D;
  var cx=cv.getContext("2d");
  inst.G={D:D,n:n,idx:idx,u0:u0,v:v,o:o,d:d,rim:rim,al:al,cv:cv,cx:cx,img:cx.createImageData(D,D)};
}
function drawGlobe(inst,lon){
  var G=inst.G,A=inst.A,tg=A.tex,TW=A.tw,TH=A.th,data=G.img.data;
  var base=(lon+180)/360*TW,n=G.n,i;
  for(i=0;i<n;i++){
    var u=base+G.u0[i];u-=Math.floor(u/TW)*TW;
    var i0=u|0,i1=i0+1>=TW?0:i0+1,fx=u-i0,vv=G.v[i],j0=vv|0,j1=j0+1,fy=vv-j0;
    if(j1>=TH)j1=TH-1;
    var a=tg[j0*TW+i0],b=tg[j0*TW+i1],c=tg[j1*TW+i0],e=tg[j1*TW+i1];
    var L=((a+(b-a)*fx)*(1-fy)+(c+(e-c)*fx)*fy)/255;
    var k=i*3,rim=G.rim[i],p=G.idx[i];
    var r=G.o[k]+G.d[k]*L,g=G.o[k+1]+G.d[k+1]*L,bl=G.o[k+2]+G.d[k+2]*L;
    data[p]=r+(255-r)*rim;data[p+1]=g+(255-g)*rim;data[p+2]=bl+(255-bl)*rim;data[p+3]=G.al[i];
  }
  G.cx.putImageData(G.img,0,0);
}

/* ===================== 5. history-column: cột kiến trúc ===================== */
function drawColumn(inst,reveal,shine,amp){
  var c=inst.cc.cx,w=inst.cc.cv.width,h=inst.cc.cv.height;
  c.globalCompositeOperation="source-over";c.clearRect(0,0,w,h);
  c.drawImage(inst.A.column,0,0,w,h);
  if(reveal<1){                                        // hiện dần từ chân lên đầu cột, mép mềm
    var soft=0.10*h,front=(1-reveal)*(h+soft)-soft;
    var g=c.createLinearGradient(0,front,0,front+soft);
    g.addColorStop(0,"rgba(0,0,0,0)");g.addColorStop(1,"rgba(0,0,0,1)");
    c.globalCompositeOperation="destination-in";c.fillStyle=g;c.fillRect(0,0,w,h);
  }
  if(amp>0.01){                                        // vệt sáng chạy dọc bề mặt cột
    var yc=h*(1-shine),dx=0.55,dy=-0.83,hw=0.14*h,mx=w*0.5;
    var gr=c.createLinearGradient(mx-dx*hw,yc-dy*hw,mx+dx*hw,yc+dy*hw);
    gr.addColorStop(0,"rgba(255,255,255,0)");gr.addColorStop(0.5,"rgba(255,250,225,"+(amp*0.8).toFixed(3)+")");gr.addColorStop(1,"rgba(255,255,255,0)");
    c.globalCompositeOperation="source-atop";c.fillStyle=gr;c.fillRect(0,0,w,h);
    c.globalCompositeOperation="source-over";
  }
}

/* ===================== 6. history-compass: la bàn + kim ===================== */
function stepNeedle(nd,dt,target){                    // lò xo giảm chấn: dao động vài lần rồi dừng ở hướng Bắc
  var w=2*Math.PI/0.9,zeta=0.22,k=w*w,cc=2*zeta*w,sub=Math.max(1,Math.ceil(dt/(1/120))),h=dt/sub;
  for(var i=0;i<sub;i++){nd.v+=(-k*(nd.a-target)-cc*nd.v)*h;nd.a+=nd.v*h;}
}
function drawRing(ctx,sweepDeg,amp){                   // vòng chia độ phát sáng tuần tự (vệt sáng chạy quanh viền)
  if(amp<0.02)return;
  var seg=16,tail=110,i;
  ctx.globalCompositeOperation="source-atop";ctx.lineCap="butt";
  for(i=0;i<seg;i++){
    var t0=sweepDeg-tail*(i+1)/seg,t1=sweepDeg-tail*i/seg,a=(1-i/seg);
    ctx.strokeStyle="rgba(255,246,205,"+(amp*a*a*0.95).toFixed(3)+")";
    ctx.lineWidth=6.4;ctx.beginPath();ctx.arc(COMP.cx,COMP.cy,55.2,t0*DEG,(t1+0.8)*DEG);ctx.stroke();
  }
  ctx.globalCompositeOperation="source-over";
}

/* ===================== 7. ĐIỀU PHỐI (history-logo-animation) ===================== */
var insts=[],running=false,introDone=false;

function Logo(btn,host,opts){
  this.opts=opts||{};this.btn=btn;this.host=host;this.A=null;this.cv=null;this.visible=true;this.last=0;this.lastDraw=-1e9;
  this.t0=0;this.mode="sustain";this.lon=LON0;this.sp=1;this.hov=0;this.hovT=0;this.boostUntil=0;
  this.needle={a:NEEDLE_REST,v:0};this.act=null;this.ring=null;this.gone=false;this.ready=false;
}
Logo.prototype.layout=function(){
  var dpr=Math.min(this.opts.transient?2:3,Math.max(1,window.devicePixelRatio||1));
  var cssW=this.cv.clientWidth||this.host.clientWidth*1.16||60,cssH=this.cv.clientHeight||cssW*0.8;
  this.cv.width=Math.max(48,Math.round(cssW*dpr));this.cv.height=Math.max(36,Math.round(cssH*dpr));
  var S=Math.min(this.cv.width/(W+2*PADX),this.cv.height/(H+2*PADY));
  this.S=S;this.ox=(this.cv.width-(W+2*PADX)*S)/2+PADX*S;this.oy=(this.cv.height-(H+2*PADY)*S)/2+PADY*S;
  var cvs=document.createElement("canvas");cvs.width=Math.ceil(COL.w*S);cvs.height=Math.ceil(COL.h*S);
  this.cc={cv:cvs,cx:cvs.getContext("2d")};
  buildGlobe(this);
  this.cx=this.cv.getContext("2d");this.cx.imageSmoothingQuality="high";
  this.lastDraw=-1e9;
};
Logo.prototype.init=function(){
  var self=this;
  this.host.classList.add("hl");
  loadAssets().then(function(A){
    if(self.gone||!self.host.isConnected)return;
    self.A=A;
    var cv=document.createElement("canvas");cv.setAttribute("aria-hidden","true");
    self.host.appendChild(cv);self.cv=cv;
    self.layout();
    self.host.classList.add("ready");self.ready=true;
    if(self.opts.transient){                              // bản phóng to dùng cho chuyển trang
      var f=self.opts.from;self.mode="sustain";self.fade0=performance.now()-1000;self.last=performance.now();
      self.lon=f.lon;self.sp=f.sp;self.needle.a=f.needle.a;self.needle.v=f.needle.v;
      insts.push(self);kick();if(self.opts.onReady)self.opts.onReady(self);return;
    }
    self.bind();self.start(performance.now());
    if(window.IntersectionObserver){
      self.io=new IntersectionObserver(function(es){self.visible=es[es.length-1].isIntersecting;});self.io.observe(self.host);
    }
    if(window.ResizeObserver){
      var tmr=0;self.ro=new ResizeObserver(function(){clearTimeout(tmr);tmr=setTimeout(function(){if(self.cv&&self.host.isConnected&&self.cv.clientWidth)self.layout();},120);});
      self.ro.observe(self.host);
    }
    insts.push(self);kick();
  }).catch(function(){self.host.classList.remove("hl");});    // lỗi tài nguyên → giữ emoji cũ
};
Logo.prototype.start=function(now){
  var playIntro=!reduced&&!(INTRO_ONCE&&introDone);
  if(playIntro){this.mode="intro";this.t0=now;this.needle.a=NEEDLE_START;this.needle.v=0;this.lon=LON0;this.sp=0;introDone=true;
    this.ring={t0:now+T.ring[0]*1000,dur:(T.ring[1]-T.ring[0])*1000};}
  else{this.mode="sustain";this.fade0=now;this.needle.a=reduced?NEEDLE_REST:NEEDLE_START;this.needle.v=0;
    if(!reduced)this.sp=1;}
  this.last=now;
};
Logo.prototype.onMotionPref=function(){
  if(!this.ready)return;
  if(reduced){this.mode="sustain";this.needle.a=NEEDLE_REST;this.needle.v=0;this.lon=LON0;this.lastDraw=-1e9;}
  kick();
};
/* ---- tương tác ---- */
Logo.prototype.bind=function(){
  var self=this,b=this.btn;
  var enter=function(){self.hovT=1;self.boostUntil=performance.now()+1400;kick();};
  var leave=function(){self.hovT=0;kick();};
  b.addEventListener("pointerenter",enter);b.addEventListener("pointerleave",leave);
  b.addEventListener("pointerdown",enter);b.addEventListener("pointercancel",leave);
  b.addEventListener("pointerup",function(e){if(e.pointerType&&e.pointerType!=="mouse")setTimeout(leave,350);});
  b.addEventListener("focus",enter);b.addEventListener("blur",leave);
  // Nhấn chọn: chạy hiệu ứng ngắn rồi mới điều hướng (click thật được phát lại sau hiệu ứng)
  b.addEventListener("click",function(e){
    if(b._hlPass||reduced||!self.ready)return;
    e.preventDefault();e.stopImmediatePropagation();
    if(b._hlBusy)return;b._hlBusy=true;
    var go=function(){b._hlPass=true;try{b.click();}finally{b._hlPass=false;}};
    var end=function(){b._hlBusy=false;};
    self.transition(go,end);
  },true);
};
Logo.prototype.activate=function(dur){
  var now=performance.now();dur=dur||520;
  this.act={t0:now,dur:dur};this.boostUntil=now+dur;this.hovT=1;
  this.needle.v+=240;this.ring={t0:now,dur:Math.min(dur,700)};kick();
};
/* ---- HIỆU ỨNG CHUYỂN TRANG ----
   Nhấn nút → bản logo phóng to bay từ vị trí trên nút ra giữa màn hình (sáng đồng bộ, địa cầu tăng tốc,
   kim giật), một vòng sáng loang ra từ logo phủ kín màn hình → điều hướng sang trang bên trong khi
   màn hình đang được phủ → logo nở ra rồi mờ dần, vòng sáng tan để lộ trang mới. */
var TR={fly:560,iris:680,nav:760,out:420,total:1320};
Logo.prototype.transition=function(go,end){
  var self=this,host=this.host,doc=document;
  if(!host.animate||!doc.body){this.activate();setTimeout(function(){go();end();},300);return;}
  var vw=window.innerWidth,vh=window.innerHeight,r=host.getBoundingClientRect();
  var cx=r.left+r.width/2,cy=r.top+r.height/2;
  var size=Math.round(Math.min(vw*0.62,240)),sh=size*H/W,fx=vw/2,fy=vh*0.40;
  var root=doc.createElement("div");root.className="hlx";root.setAttribute("aria-hidden","true");
  var iris=doc.createElement("div");iris.className="hlx-iris";
  var box=doc.createElement("div");box.className="hlx-logo";
  box.style.width=size+"px";box.style.height=sh+"px";box.style.left=(fx-size/2)+"px";box.style.top=(fy-sh/2)+"px";
  iris.style.clipPath="circle(0px at "+cx+"px "+cy+"px)";box.style.opacity="0";
  root.appendChild(iris);root.appendChild(box);doc.body.appendChild(root);
  var finished=false;
  function finish(){
    if(finished)return;finished=true;
    host.style.visibility="";if(root.parentNode)root.parentNode.removeChild(root);end();
  }
  var tr=new Logo(this.btn,box,{transient:true,from:this,onReady:function(t){
    host.style.visibility="hidden";                         // bản trên nút nhường chỗ cho bản phóng to
    var s0=r.width/size,dx=cx-fx,dy=cy-fy,ease="cubic-bezier(.2,.8,.2,1)";
    box.style.opacity="1";
    box.animate([{transform:"translate("+dx+"px,"+dy+"px) scale("+s0+")"},{transform:"none"}],{duration:TR.fly,easing:ease,fill:"forwards"});
    var far=Math.sqrt(Math.max(cx,vw-cx)*Math.max(cx,vw-cx)+Math.max(cy,vh-cy)*Math.max(cy,vh-cy))+8;
    iris.animate([{clipPath:"circle(0px at "+cx+"px "+cy+"px)"},{clipPath:"circle("+far+"px at "+cx+"px "+cy+"px)"}],
      {duration:TR.iris,delay:90,easing:"cubic-bezier(.5,0,.2,1)",fill:"forwards"});
    t.activate(TR.nav+120);                                  // sáng đồng bộ, địa cầu tăng tốc, kim giật, vòng la bàn sáng chạy
    setTimeout(function(){go();},TR.nav);                    // điều hướng khi màn hình đã được phủ
    setTimeout(function(){
      box.animate([{opacity:1,transform:"none"},{opacity:0,transform:"scale(1.35)"}],{duration:TR.out,easing:"ease-in",fill:"forwards"});
      iris.animate([{opacity:1},{opacity:0}],{duration:TR.out,delay:50,easing:"ease-out",fill:"forwards"});
    },TR.nav+40);
    setTimeout(finish,TR.total);
  }});
  tr.init();
  setTimeout(function(){if(!tr.ready){go();finish();}},900);   // dự phòng: tài nguyên lỗi → vẫn điều hướng
};
/* ---- tính tham số mỗi khung ---- */
Logo.prototype.params=function(now){
  var p={ov:1,opa:1,glow:0,sync:0,reveal:1,shine:0,shineA:0,gS:1,gA:1,cS:1,cA:1,flt:0,ringA:0,ringDeg:0};
  var t=this.mode==="intro"?(now-this.t0)/1000:99;
  if(this.mode==="intro"){
    p.opa=seg(t,0,0.6);
    p.ov=lerp(0.86,1,eBack(seg(t,0,1.3),1.2))*(1+0.045*bump(t,T.sync[0],T.sync[1]+0.2));
    p.glow=eOut(seg(t,0,T.glowIn))*(1-eInOut(seg(t,T.glowOutA,T.glowOutB)));
    var r=0;
    r=0.30*eOut(seg(t,T.base[0],T.base[1]));
    if(t>=T.shaft[0])r=0.30+0.46*eOut(seg(t,T.shaft[0],T.shaft[1]));
    if(t>=T.cap[0])r=0.76+0.24*eOut(seg(t,T.cap[0],T.cap[1]));
    p.reveal=r;
    var su=seg(t,T.shine[0],T.shine[1]);p.shine=eInOut(su);p.shineA=Math.sin(Math.PI*su)*0.62;
    var g=seg(t,T.globe[0],T.globe[1]);p.gS=0.7+0.3*eBack(g,1.1);p.gA=eOut(g);
    var c=seg(t,T.compass[0],T.compass[1]);p.cS=0.8+0.2*eBack(c,1.4);p.cA=eOut(c);
    p.sync=bump(t,T.sync[0],T.sync[1]);
    if(this.ring){var ru=seg(now,this.ring.t0,this.ring.t0+this.ring.dur);}
  }else{
    p.opa=reduced?1:clamp01((now-(this.fade0||0))/350);
    // phản chiếu ánh sáng rất nhẹ trên cột (chu kỳ ~7 giây)
    if(!reduced){var ph=((now/1000)%7)/1.2;if(ph<1){p.shine=eInOut(ph);p.shineA=Math.sin(Math.PI*ph)*0.2;}
      p.flt=Math.sin(now/1000*2*Math.PI/5.5)*3;}
  }
  if(this.ring&&this.mode!=="x"){
    var ru2=seg(now,this.ring.t0,this.ring.t0+this.ring.dur);
    if(ru2>0&&ru2<1){p.ringA=Math.sin(Math.PI*ru2)*0.95;p.ringDeg=-90+360*eInOut(ru2);}
    else if(ru2>=1)this.ring=null;
  }
  if(this.act){
    var au=seg(now,this.act.t0,this.act.t0+this.act.dur);
    p.sync=Math.max(p.sync,Math.sin(Math.PI*Math.min(1,au*1.15))*0.9);
    if(au>=1)this.act=null;
  }
  p._t=t;return p;
};
Logo.prototype.tick=function(now){
  if(!this.ready||!this.cv)return;
  var dt=Math.min(0.05,Math.max(0,(now-this.last)/1000));this.last=now;
  var intro=this.mode==="intro",p=this.params(now);
  // trượt mượt hover / tốc độ xoay
  this.hov+=(this.hovT-this.hov)*Math.min(1,dt*9);
  if(reduced){p.flt=0;this.hov=0;}
  var targetSp=1;
  if(intro)targetSp=eInOut(seg(p._t,T.spin[0],T.spin[1]));
  if(now<this.boostUntil&&!reduced)targetSp=Math.max(targetSp,this.act?5.5:3.2);
  if(!reduced)this.sp+=(targetSp-this.sp)*Math.min(1,dt*(this.act?10:5));
  if(!reduced)this.lon-=SPIN_BASE*this.sp*dt;            // lon giảm → bề mặt trôi từ TRÁI sang PHẢI
  // kim la bàn
  if(reduced){this.needle.a=NEEDLE_REST;}
  else if(intro&&p._t<T.needleGo){this.needle.a=NEEDLE_START;this.needle.v=0;}
  else{
    var wob=intro?0:0.8*Math.sin(now/1000*2*Math.PI/3.6);
    stepNeedle(this.needle,dt,NEEDLE_REST+wob);
  }
  if(intro&&p._t>=T.end){this.mode="sustain";this.fade0=now-1000;}
  // hover: phóng nhẹ + sáng thêm
  p.ov*=1+0.08*this.hov;
  this.draw(p);
};
Logo.prototype.draw=function(p){
  var ctx=this.cx,S=this.S,A=this.A,cw=this.cv.width,ch=this.cv.height;
  ctx.setTransform(1,0,0,1,0,0);ctx.globalCompositeOperation="source-over";ctx.globalAlpha=1;ctx.clearRect(0,0,cw,ch);
  if(p.opa<=0.003)return;
  drawGlobe(this,this.lon);
  var rev=p.reveal;drawColumn(this,rev,p.shine,p.shineA);
  ctx.setTransform(S,0,0,S,this.ox,this.oy);
  ctx.save();
  ctx.translate(W/2,H/2+p.flt);ctx.scale(p.ov,p.ov);ctx.translate(-W/2,-H/2);
  // 1) cột (nằm dưới cùng, vẽ đầy đủ)
  ctx.globalAlpha=p.opa;ctx.drawImage(this.cc.cv,COL.x,COL.y,COL.w,COL.h);
  // 2) địa cầu đè lên cột
  ctx.globalAlpha=p.opa*p.gA;
  ctx.save();ctx.translate(GLOBE.cx,GLOBE.cy);ctx.scale(p.gS,p.gS);
  ctx.drawImage(this.G.cv,-GLOBE.r,-GLOBE.r,2*GLOBE.r,2*GLOBE.r);ctx.restore();
  // 3) la bàn + kim đè lên địa cầu
  ctx.globalAlpha=p.opa*p.cA;
  ctx.save();ctx.translate(COMP.cx,COMP.cy);ctx.scale(p.cS,p.cS);ctx.translate(-COMP.cx,-COMP.cy);
  ctx.drawImage(A.compass,COMP.x,COMP.y,COMP.size,COMP.size);
  drawRing(ctx,p.ringDeg,p.ringA);
  ctx.save();ctx.translate(NEEDLE.hx,NEEDLE.hy);ctx.rotate((this.needle.a-NEEDLE_START)*DEG);   // ảnh kim vẽ sẵn ở góc gốc 42,5° → xoay phần chênh lệch
  ctx.drawImage(A.needle,NEEDLE.x-NEEDLE.hx,NEEDLE.y-NEEDLE.hy,NEEDLE.size,NEEDLE.size);ctx.restore();
  ctx.restore();
  ctx.restore();
  // ánh sáng đồng bộ cả 3 thành phần + tăng sáng khi hover
  var br=0.34*p.sync+0.10*this.hov;
  ctx.setTransform(1,0,0,1,0,0);ctx.globalAlpha=1;
  if(br>0.004){ctx.globalCompositeOperation="source-atop";ctx.fillStyle="rgba(255,250,232,"+br.toFixed(3)+")";ctx.fillRect(0,0,cw,ch);}
  // quầng sáng trung tâm (vẽ phía sau)
  var ga=Math.min(1,p.glow*0.85+p.sync*0.5+this.hov*0.25);
  if(ga>0.004){
    var cx0=this.ox+W/2*S,cy0=this.oy+(H/2+p.flt)*S,rad=Math.min(cw,ch)*0.62;
    var gr=ctx.createRadialGradient(cx0,cy0,0,cx0,cy0,rad);
    gr.addColorStop(0,"rgba(255,238,175,"+(0.95*ga).toFixed(3)+")");gr.addColorStop(0.45,"rgba(130,195,255,"+(0.38*ga).toFixed(3)+")");gr.addColorStop(1,"rgba(130,195,255,0)");
    ctx.globalCompositeOperation="destination-over";ctx.fillStyle=gr;ctx.fillRect(0,0,cw,ch);
  }
  ctx.globalCompositeOperation="source-over";
};
/* ---- vòng lặp chung ---- */
function kick(){if(!running&&insts.length){running=true;requestAnimationFrame(loop);}}
function loop(now){
  var any=false,i;
  for(i=insts.length-1;i>=0;i--){
    var it=insts[i];
    if(!it.host.isConnected){it.gone=true;if(it.io)it.io.disconnect();if(it.ro)it.ro.disconnect();insts.splice(i,1);continue;}
    if(!it.visible)continue;
    var busy=it.mode==="intro"||it.hov>0.01||it.hovT>0||it.act||it.ring||now<it.boostUntil;
    if(reduced&&!busy){if(it.lastDraw<0){it.tick(now);it.lastDraw=now;}continue;}   // giảm chuyển động: vẽ tĩnh một lần
    any=true;
    if(!busy&&now-it.lastDraw<33)continue;                // trạng thái duy trì: ~30 khung/giây
    it.lastDraw=now;it.tick(now);
  }
  if(insts.length&&(any||reduced))requestAnimationFrame(loop);else running=false;
}
document.addEventListener("visibilitychange",function(){if(!document.hidden){for(var i=0;i<insts.length;i++)insts[i].last=performance.now();kick();}});

/* ===================== 8. API ===================== */
window.HistoryLogo={
  mountAll:function(root){
    try{
      var list=(root||document).querySelectorAll('.subj[data-s="lsdl"]');
      for(var i=0;i<list.length;i++){
        var b=list[i];if(b._hl)continue;
        var host=b.querySelector(".e");if(!host)continue;
        b._hl=new Logo(b,host);b._hl.init();
      }
    }catch(e){}
  },
  replay:function(){introDone=false;for(var i=0;i<insts.length;i++)insts[i].start(performance.now());kick();}
};

/* ===================== 9. DỮ LIỆU ĐỊA CẦU (tự sinh – không chỉnh tay) ===================== */
/* tex: kết cấu lục địa 1024×512 (PNG xám, dữ liệu nhúng để canvas không bị chặn khi mở bằng file://)
   fo / fl: trường màu biển / đất 32×32 (RGB) lấy từ ánh sáng của logo gốc */
var DATA={
n:32,
fo:"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",
fl:"v9vZx9/RzeLK0+bE2em93uy34u6x5vGs6fOm6/Wh7fed7/iY7/qU8PuQ7/uM7vyI7fyF6/yC6Px/5fx94ft73Pp51/l30vh1y/Z0xPVzvfNztfByrO5yo+tymuhzj+Vzxd/NzOLG0ubA2Om53eyz4e+t5fGn6POi6/Wd7feY7/iT7/qP8PuL8PuH7/yE7fyA6/x96fx65fx44vt23fp02Ply0/hwzfZvxvRuv/Jtt/Btru1tpeptnOdtkuRuh+Fvy+PC0ea81+m13Oyv4O+p5PGj6POe6/WZ7feU7viP7/mL8PqH8PuD7/x/7vx87Px56fx25vtz4/tx3vpv2vht1PdszvVqyPRpwPFpue9osO1op+ponudolONpieBpftxq0Oa41umy2+yr4O+l5PGg5/Oa6vWV7PeQ7viL7/mH8PqD8Pt/7/x77vx47Px06vxy5/tv4/pt3/lq2/hp1fdn0PVmyfNlwvFkuu9jsuxjqeljoOZjluNki99lgNtmdddn1equ2u2o3++i4/Gc5/SX6vWR7PeM7viI7/qD8Pp/8Pt77/x37vx07fxx6/tu6Ptr5Ppp4Plm3Phk1/dj0fVhyvNgxPFgvO5ftOxfq+lfouZfmOJfjt9gg9thd9dia9Nk2e2l3vCf4vKZ5vST6faO7PeJ7vmE7/qA8Pt78Pt38Px07/xw7fxt6/tq6Ptn5fpl4flj3fhh2PZf0vVezPNcxfBcvu5btutarehapOVbmuJbkN5chdpdetZebtJfYc1h3fCc4fKW5fSQ6PaL6/iG7fmB7/p98Pt48Pt08Pxw7/xt7fxq6/tn6ftk5vph4vlf3vhd2fZb0/RazfJZxvBYv+5Xt+tXr+hXpuVXnOFXkt5Yh9pYfNZacNFbZM1dVshf4POT5PWO6PaI6viD7fl+7vp67/t18Pxx8Pxt7/xq7vxn7Pxj6fth5vpe4/lc3/ha2vZY1PRXzvJVyPBUwe5UuetTsehTqOVTnuFTlN5UitpVftVWc9FXZsxZWchbTMJd4/WL5/eG6viB7Pp87vt37/tz8Pxv8Pxr7/xn7vxk7Pxh6vte5/pb4/lZ3/hX2/ZV1fRT0PJSyfBRwu5Qu+tQsuhQquRQoOFQlt1QjNlRgdVSddFUacxVXMdXTsJZQL1b5viE6fl/7Pp67ft17/xx7/xs8P1o7/1l7v1h7Pxe6vtb5/tZ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",
tex:"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"
};
})();
