// ---------- ĐỘNG ĐẤT ----------
function simQuake(root){
  root.innerHTML = `
    <div class="simcv"><canvas></canvas></div>
    <div class="simctl">
      <label>Cường độ động đất <b id="qmv">6.0</b><input id="qm" type="range" min="3" max="9" step="0.1" value="6"></label>
      <label>Độ sâu chấn tiêu <b id="qdv">20 km</b><input id="qd" type="range" min="5" max="60" step="1" value="20"></label>
      <div class="simst" id="qs">Kéo thanh trượt rồi bấm “Gây động đất”.</div>
      <div class="simbtns"><button class="cta" id="qgo">Gây động đất</button><button class="no" id="qrs">Đặt lại</button><button class="chip" id="qlb">Tên gọi: Bật</button></div>
    </div>
    <div class="siminfo"><b>Chấn tiêu</b> là nơi phát sinh động đất ở dưới sâu. <b>Chấn tâm</b> là điểm trên mặt đất nằm ngay phía trên chấn tiêu, nơi rung mạnh nhất. <b>Sóng địa chấn</b> lan từ chấn tiêu ra mọi phía, càng xa chấn tâm thì rung càng yếu.</div>`;
  const cv = root.querySelector("canvas"), ctx = cv.getContext("2d");
  const W=360, H=260, SY=110, V=110;
  const GR = ctx.createPattern(makeGrain(),"repeat");
  const q = s=>root.querySelector(s);
  let mag=6, dep=20, showLab=true, t0=null, raf=0, k=1, dead=false, qMag=6, qF=null;
  const houses = [38,92,140,238,288,334].map((x,i)=>({x, col:["#e8c97a","#d98b6a","#9fc5e8","#e8c97a","#c9a0dc","#d98b6a"][i], will:false, ta:0}));
  const faultX = y => 190-(y-SY)*0.28;
  const focusAt = d => { const y = SY+12+(d-5)/55*130; return {x:faultX(y), y}; };
  let F = focusAt(dep), M = mag;
  const att = x => { const d = Math.hypot(x-F.x, SY-F.y); return {d, A:Math.pow(Math.max(M-2,0),1.3)*0.7*Math.exp(-d/200)}; };
  const disp = (x,t) => {
    if(t<0) return {y:0,a:0};
    const {d,A} = att(x), dt = t-d/V;
    if(dt<0) return {y:0,a:0};
    const a = A*Math.exp(-dt*0.9);
    return {y:a*Math.sin(dt*28), a};
  };
  function house(h,base,tilt,fallen){
    ctx.save(); ctx.translate(h.x,base);
    if(fallen){
      ctx.fillStyle="#7f746c"; ctx.beginPath(); ctx.moveTo(-17,0); ctx.lineTo(-10,-11); ctx.lineTo(0,-6); ctx.lineTo(9,-13); ctx.lineTo(17,0); ctx.closePath(); ctx.fill();
      ctx.save(); ctx.translate(14,-6); ctx.rotate(.9); ctx.fillStyle="#b4563c"; ctx.fillRect(-9,-3,18,6); ctx.restore();
    } else {
      ctx.rotate(tilt);
      ctx.fillStyle=h.col; ctx.fillRect(-13,-26,26,26);
      ctx.fillStyle="#b4563c"; ctx.beginPath(); ctx.moveTo(-17,-26); ctx.lineTo(0,-40); ctx.lineTo(17,-26); ctx.closePath(); ctx.fill();
      ctx.fillStyle="#6b4a2f"; ctx.fillRect(-4,-14,8,14);
      ctx.fillStyle="#bfe6ff"; ctx.fillRect(-11,-22,6,6); ctx.fillRect(5,-22,6,6);
    }
    ctx.restore();
  }
  function draw(){
    let t = t0==null ? -1 : (performance.now()-t0)/1000;
    if(t>6.5) t = 99;
    if(t0==null){ F = focusAt(dep); M = mag; } else { F = qF; M = qMag; }
    const slip = t0==null ? 0 : Math.max(0,M-3.5)*0.9*Math.min(1,t/0.5);
    ctx.setTransform(k,0,0,k,0,0); ctx.clearRect(0,0,W,H);
    let g = ctx.createLinearGradient(0,0,0,SY); g.addColorStop(0,"#79c4f7"); g.addColorStop(1,"#dff3ff");
    ctx.fillStyle = g; ctx.fillRect(0,0,W,SY+2);
    const ground = dy => {
      ctx.fillStyle="#9b6b3c"; ctx.fillRect(0,SY+2+dy,W,38);
      ctx.fillStyle="#7d6a58"; ctx.fillRect(0,SY+40+dy,W,72);
      ctx.fillStyle="#5d4a49"; ctx.fillRect(0,SY+112+dy,W,H-SY-102);
      ctx.strokeStyle="rgba(0,0,0,.12)"; ctx.lineWidth=1;
      for(let i=0;i<5;i++){ ctx.beginPath(); ctx.moveTo(0,SY+52+i*26+dy); ctx.lineTo(W,SY+52+i*26+dy); ctx.stroke(); }
      ctx.save(); ctx.globalCompositeOperation="multiply"; ctx.globalAlpha=.4; ctx.fillStyle=GR; ctx.fillRect(0,SY+2+dy,W,H-SY+8); ctx.restore();
    };
    ctx.save(); ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(190,0); ctx.lineTo(190,SY); ctx.lineTo(faultX(H),H); ctx.lineTo(0,H); ctx.closePath(); ctx.clip(); ground(0); ctx.restore();
    ctx.save(); ctx.beginPath(); ctx.moveTo(190,0); ctx.lineTo(W,0); ctx.lineTo(W,H); ctx.lineTo(faultX(H),H); ctx.lineTo(190,SY); ctx.closePath(); ctx.clip(); ground(-slip); ctx.restore();
    ctx.strokeStyle="rgba(30,15,10,.85)"; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(190,SY); ctx.lineTo(faultX(H),H); ctx.stroke();
    // sóng địa chấn
    if(t>=0 && t<99){
      ctx.save(); ctx.beginPath(); ctx.rect(0,SY-slip-4,W,H); ctx.clip();
      for(let e=0;e<=1.4;e+=0.35){
        const tt = t-e; if(tt<=0 || tt>3.4) continue;
        const r = V*tt;
        ctx.strokeStyle = `rgba(255,238,120,${Math.max(0,.9*(1-r/280))})`; ctx.lineWidth = 2.6;
        ctx.beginPath(); ctx.arc(F.x,F.y,r,0,TAU); ctx.stroke();
      }
      ctx.restore();
    }
    // mặt đất rung
    const top = x => SY-(x>190?slip:0)+disp(x,t).y;
    ctx.fillStyle="#9b6b3c"; ctx.beginPath(); ctx.moveTo(0,SY+16);
    for(let x=0;x<=W;x+=6) ctx.lineTo(x,top(x));
    ctx.lineTo(W,SY+16); ctx.closePath(); ctx.fill();
    ctx.fillStyle="#5cb85c"; ctx.beginPath();
    for(let x=0;x<=W;x+=6) ctx.lineTo(x,top(x));
    for(let x=W;x>=0;x-=6) ctx.lineTo(x,top(x)+6);
    ctx.closePath(); ctx.fill();
    if(t0!=null && M>=5.5){
      ctx.strokeStyle="rgba(40,20,10,.8)"; ctx.lineWidth=1.4;
      const n = Math.round((M-5)*2);
      for(let i=0;i<n;i++){ const cx = 190+(i-n/2)*9, cy = top(cx); ctx.beginPath(); ctx.moveTo(cx,cy+6); ctx.lineTo(cx+2,cy+12); ctx.lineTo(cx-1,cy+17); ctx.stroke(); }
    }
    // nhà
    houses.forEach((h,i)=>{
      const d = disp(h.x,t), fallen = h.will && t>=h.ta;
      house(h, top(h.x), d.y*0.012*(i%2?-1:1), fallen);
    });
    // chấn tiêu, chấn tâm
    const pulse = (t>=0&&t<99) ? 1+0.5*Math.sin(t*14) : 1;
    ctx.fillStyle="rgba(255,60,40,.35)"; ctx.beginPath(); ctx.arc(F.x,F.y,9*pulse,0,TAU); ctx.fill();
    ctx.fillStyle="#ff3b30"; ctx.beginPath(); ctx.arc(F.x,F.y,4.5,0,TAU); ctx.fill();
    ctx.strokeStyle="#fff"; ctx.lineWidth=1.5; ctx.stroke();
    const ex = F.x, ey = top(ex);
    ctx.setLineDash([3,3]); ctx.strokeStyle="rgba(255,255,255,.85)"; ctx.lineWidth=1.2;
    ctx.beginPath(); ctx.moveTo(F.x,F.y); ctx.lineTo(ex,ey+2); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle="#ffd23f"; ctx.strokeStyle="rgba(60,30,0,.8)"; ctx.lineWidth=1;
    ctx.beginPath(); ctx.moveTo(ex,ey+1); ctx.lineTo(ex-6,ey-10); ctx.lineTo(ex+6,ey-10); ctx.closePath(); ctx.fill(); ctx.stroke();
    if(showLab){
      const left = F.x>W-70;
      simLabel(ctx,"Chấn tiêu", left?F.x-12:F.x+12, F.y+4, left?"right":"left");
      ctx.setLineDash([2,3]); ctx.strokeStyle="rgba(255,255,255,.7)"; ctx.beginPath(); ctx.moveTo(ex,SY-46); ctx.lineTo(ex,ey-12); ctx.stroke(); ctx.setLineDash([]);
      simLabel(ctx,"Chấn tâm", ex, SY-50, "center");
      ctx.strokeStyle="rgba(255,238,120,.95)"; ctx.lineWidth=2; ctx.beginPath(); ctx.arc(12,H-13,5,0,TAU); ctx.stroke();
      simLabel(ctx,"Sóng địa chấn", 22, H-9, "left");
    }
  }
  function loop(){ raf=0; if(dead) return; draw(); if(t0!=null && (performance.now()-t0)/1000<6.6) raf = requestAnimationFrame(loop); }
  function fit(){
    const w = cv.parentNode.clientWidth || 320, d = Math.min(window.devicePixelRatio||1,2);
    const nw = Math.round(w*d); if(cv.width!==nw){ cv.width = nw; cv.height = Math.round(w*H/W*d); }
    k = cv.width/W; draw();
  }
  const ro = window.ResizeObserver ? new ResizeObserver(fit) : null;
  if(ro) ro.observe(cv.parentNode); else window.addEventListener("resize",fit);
  const note = m => m<4 ? "rung nhẹ, hầu như không hư hại." : m<5.5 ? "rung rõ, hư hại nhẹ." : m<7 ? "rung mạnh, nhà yếu gần chấn tâm hư hại." : "rung dữ dội, nhà gần chấn tâm đổ sập.";
  function resetQ(){ if(raf){ cancelAnimationFrame(raf); raf=0; } t0=null; houses.forEach(h=>h.will=false); }
  function upd(){
    mag = +q("#qm").value; dep = +q("#qd").value;
    q("#qmv").textContent = mag.toFixed(1); q("#qdv").textContent = dep+" km";
    if(t0!=null && !raf){ t0=null; houses.forEach(h=>h.will=false); q("#qs").textContent = "Kéo thanh trượt rồi bấm “Gây động đất”."; }
    if(t0==null) draw();
  }
  q("#qm").oninput = upd; q("#qd").oninput = upd;
  q("#qgo").onclick = ()=>{
    if(raf){ cancelAnimationFrame(raf); raf=0; }
    qMag = mag; qF = focusAt(dep); F = qF; M = qMag;
    houses.forEach(h=>{ const a = att(h.x); h.ta = a.d/V; h.will = a.A>4.3; });
    t0 = performance.now();
    q("#qs").textContent = "Cường độ "+mag.toFixed(1)+": "+note(mag);
    try{ navigator.vibrate && navigator.vibrate([Math.round(20+mag*8),60,Math.round(20+mag*6)]); }catch(e){}
    raf = requestAnimationFrame(loop);
  };
  q("#qrs").onclick = ()=>{ resetQ(); q("#qs").textContent = "Kéo thanh trượt rồi bấm “Gây động đất”."; draw(); };
  q("#qlb").onclick = e=>{ showLab=!showLab; e.currentTarget.textContent = "Tên gọi: "+(showLab?"Bật":"Tắt"); draw(); };
  return { destroy(){ dead=true; if(raf) cancelAnimationFrame(raf); if(ro) ro.disconnect(); else window.removeEventListener("resize",fit); } };
}

