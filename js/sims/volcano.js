// ---------- NÚI LỬA (mô hình cắt lớp, 4 giai đoạn) ----------
function simVolcano(root){
  root.classList.add("vol3");
  root.innerHTML = `
    <div class="simcv"><canvas></canvas></div>
    <div class="simctl vctl">
      <div class="vtitle">Điều khiển</div>
      <div class="vbtns">
        <button class="cta" id="vb-start">▶ Bắt đầu</button>
        <button class="no" id="vb-p">⬆ Tăng áp suất</button>
        <button class="no hot" id="vb-e">🌋 Phun trào</button>
        <button class="no" id="vb-pause">⏸ Tạm dừng</button>
        <button class="no" id="vb-reset">↺ Đặt lại</button>
        <button class="chip" id="vb-lab">Ẩn cấu tạo</button>
      </div>
      <div class="chips" id="vb-lv"><span>Mức độ phun trào:</span>
        <button class="chip" data-k="0.45">Nhẹ</button><button class="chip on" data-k="0.75">Trung bình</button><button class="chip" data-k="1">Mạnh</button></div>
    </div>
    <div class="siminfo vinfo">
      <div class="vstage s0" id="vstage"></div>
      <div class="vsteps" id="vsteps"></div>
      <div class="vdesc" id="vdesc"></div>
      <div class="gauge"><span>🌡️ Nhiệt độ</span><div class="bar2"><i id="vtb"></i></div><b id="vtv"></b></div>
      <div class="gauge"><span>⏱️ Áp suất</span><div class="bar2"><i id="vpb"></i></div><b id="vpv"></b></div>
      <div class="gauge"><span>⚡ Năng lượng</span><div class="bar2"><i id="veb"></i></div><b id="vev"></b></div>
      <div class="vnote">Thông số mang tính minh hoạ.</div>
      <div class="vpart" id="vpart"><b>Chạm vào núi lửa</b> để xem tên và chức năng từng bộ phận.</div>
      <div class="vquiz" id="vquiz" hidden></div>
    </div>`;
  const cv = root.querySelector("canvas"), ctx = cv.getContext("2d");
  const W=360, H=300, GY=170, BOT=286, ERUPT_P=85;
  const q = s=>root.querySelector(s);
  const rnd = (a,b)=>a+Math.random()*(b-a);
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const TAU=Math.PI*2;

  // ----- địa hình bất quy tắc, tạo cố định để không nhấp nháy -----
  const noise=(n)=>{const x=Math.sin(n*127.1+7319*311.7)*43758.5453;return (x-Math.floor(x))*2-1;};
  const bez = (c,s)=>({x:(1-s)*(1-s)*c[0][0]+2*(1-s)*s*c[1][0]+s*s*c[2][0], y:(1-s)*(1-s)*c[0][1]+2*(1-s)*s*c[1][1]+s*s*c[2][1]});
  const CX=180, CY=262, RX=64, RY=26, VX=174, VW=12, VTOP=94, VBOT=CY-RY+4;
  // Miệng núi lửa là một phần của đường bao: vành miệng ở y=CR_RIM, đáy miệng ở y=CR_FLOOR,
  // sườn núi nối liền với vành (không còn hình elip đặt rời trên đỉnh).
  const CR_W=18, CR_RIM=86.5, CR_FLOOR=98;
  const pts=[], NP=160;
  for(let i=0;i<=NP;i++){
    const x=14+326*i/NP, d=Math.abs(x-180), u=d/166;
    const base=90+80*Math.pow(u,1.32);
    const irregular=(noise(i/2+5)*3.1+noise(i/2+91)*1.3)*Math.sin(Math.PI*i/NP)*clamp((d-CR_W)/18,0,1);
    let y;
    if(d<=CR_W){const k=d/CR_W;y=CR_FLOOR-(CR_FLOOR-CR_RIM)*Math.pow(k,1.8)+noise(Math.round(x*2))*.7*k;}
    else y=CR_RIM+(base-94.25)*1.1+irregular;
    pts.push({x,y});
  }
  const surfaceY=x=>{
    const f=(x-14)/326*NP;
    if(f<=0)return pts[0].y;if(f>=NP)return pts[NP].y;
    const i=Math.floor(f),a=pts[i],b=pts[i+1];
    return a.y+(b.y-a.y)*(f-i);
  };
  // Miệng phụ nằm TRÊN mặt sườn (gò nhỏ nhô lên), ống phụ nối thẳng tới đó.
  const SVP={x:250,y:surfaceY(250)};
  const BR=[[185,180],[232,170],[SVP.x,SVP.y+3]];
  // Mực magma: buồng đầy trước (cl), sau đó magma dâng trong ống (pl), rồi tràn vào ống phụ (branchFill).
  const plOf=l=>clamp((l-.3)/.62,0,1), clOf=l=>clamp((l-.06)/.24,0,1);
  const PIPE_BOT=236, PIPE_TOP=CR_FLOOR-1;
  const pipeY=p=>PIPE_BOT-(PIPE_BOT-PIPE_TOP)*p;
  const branchFill=p=>clamp((p-.41)/.38,0,1);
  const pipeLevelY=()=>clOf(lvl)>=.98?pipeY(plOf(lvl)):999;
  // Vết nứt toả ra từ miệng phụ (nứt vỡ sườn núi khi áp lực dồn tới)
  const sideCracks=[];
  [[18,30],[58,24],[98,20],[138,26],[172,22],[-22,18],[-52,14]].forEach((a,ci)=>{
    const ang=a[0]*Math.PI/180,len=a[1],cp=[{x:SVP.x,y:SVP.y}];let px=SVP.x,py=SVP.y;
    for(let j=1;j<=5;j++){const aa=ang+noise(ci*13+j)*.45;px+=Math.cos(aa)*len/5;py+=Math.sin(aa)*len/5;cp.push({x:px,y:py});}
    sideCracks.push(cp);
  });

  // ----- chi tiết địa hình cố định -----
  const rocks=[], cracks=[], strata=[];
  for(let i=0;i<105;i++){
    const x=rnd(24,336), y=surfaceY(x);
    rocks.push({x,y:y-rnd(1,6),rx:rnd(1.5,6),ry:rnd(.8,2.8),rot:rnd(-.7,.7),tone:Math.floor(rnd(0,4))});
  }
  for(let i=0;i<22;i++){
    const x=rnd(35,325), points=[];
    let px=x,py=surfaceY(x)-rnd(2,9);
    for(let j=0;j<4;j++){points.push({x:px,y:py});px+=rnd(-3.5,3.5);py+=rnd(2.5,5);}
    cracks.push(points);
  }
  for(let k=0;k<6;k++){
    const layer=[];
    for(let i=0;i<=40;i++){
      const x=14+326*i/40;
      layer.push({x,y:surfaceY(x)+14+k*8+Math.sin(i*.39+k*1.4)*2+noise(i+k*37)*1.5});
    }
    strata.push(layer);
  }
  // Dòng dung nham được sinh thành nhiều nhánh độc lập, không đi theo một đường cong cố định.
  let lavaFlows=[], flowSpawn=0, lightning=[], lightningClock=0, lightningFlash=0;

  // ----- trạng thái -----
  let stage=0, stageT=0, P=8, lvl=.06, KL=.75, auto=false, paused=false, finished=false;
  let eruptT=0, eruptDur=10, cool=0, showLab=true, raf=0, last=0, sc=1, dead=false, gT=0, sel=null;
  let lava=[], ash=[], gas=[], steam=[], bub=[], accL=0, accA=0, accG=0, accS=0, accB=0;
  let E=1, erReady=false, weak=false;
  let sideK=0, crackP=0, sideBurst=false, debris=[], accSL=0, accSF=0, accSA=0, accD=0, bl=0;

  const STAGES=[
    {n:"Giai đoạn 1 · Trạng thái bình thường", d:"Núi lửa chưa phun trào. Magma tồn tại và tích tụ trong buồng magma bên dưới bề mặt Trái Đất."},
    {n:"Giai đoạn 2 · Bắt đầu hoạt động", d:"Magma dịch chuyển lên theo ống phun. Khí và hơi nước thoát ra, khu vực núi lửa có thể rung chấn."},
    {n:"Giai đoạn 3 · Phun trào", d:"Magma thoát ra qua miệng núi lửa (và miệng phụ), tạo thành dung nham. Tro bụi và khí núi lửa được phát tán lên không trung."},
    {n:"Giai đoạn 4 · Sau phun trào", d:"Núi lửa đã hết năng lượng nên ngừng phun trào. Dung nham chảy chậm dần, nguội đi và đông cứng, tạo thành lớp đá mới."}];
  const STEPS=["Magma tích tụ","Áp suất tăng","Magma dâng lên","Phun trào","Nguội và đông cứng"];
  const PARTS={
    miengnui:["Miệng núi lửa","Vị trí magma, khí và vật liệu núi lửa thoát ra ngoài."],
    mienphu:["Miệng phụ","Lối thoát phụ ở sườn núi lửa."],
    ongphun:["Ống phun","Đường dẫn magma từ buồng magma lên phía miệng núi lửa."],
    buong:["Buồng magma (lò magma)","Nơi magma tích tụ bên dưới bề mặt Trái Đất."],
    magma:["Magma","Vật chất nóng chảy nằm bên trong lòng đất."],
    dungnham:["Dung nham","Magma tràn ra bề mặt sau khi phun trào."],
    danoi:["Đá mới","Dung nham nguội đi và đông cứng, tạo thành lớp đá mới."],
    trobui:["Tro bụi và khí núi lửa","Vật chất được phát tán vào không khí trong quá trình phun trào."]};
  const QUIZ=[
    {q:"Nơi magma tích tụ bên dưới bề mặt Trái Đất gọi là gì?",o:["Miệng núi lửa","Buồng magma","Ống phun"],a:1},
    {q:"Đường dẫn magma từ buồng magma lên miệng núi lửa là gì?",o:["Miệng phụ","Sườn núi","Ống phun"],a:2},
    {q:"Magma tràn ra bề mặt sau khi phun trào được gọi là gì?",o:["Dung nham","Tro bụi","Hơi nước"],a:0},
    {q:"Sau khi phun trào, dung nham nguội đi sẽ như thế nào?",o:["Bay hơi hết","Đông cứng thành lớp đá mới","Chảy ngược xuống buồng magma"],a:1}];

  function renderInfo(){
    q("#vstage").className="vstage s"+stage;q("#vstage").textContent=STAGES[stage].n;
    q("#vdesc").textContent=STAGES[stage].d;
    const step=stage===0?0:stage===1?(P<55?1:2):stage===2?3:4;
    q("#vsteps").innerHTML=STEPS.map((s,i)=>`<i class="${i===step?"on":""}">${i+1}. ${s}</i>`).join("");
  }
  function renderGauges(){
    q("#vtv").textContent=Math.round(700+P*5)+" °C";q("#vtb").style.width=Math.round(P)+"%";
    q("#vpv").textContent=Math.round(P)+" %";q("#vpb").style.width=Math.round(P)+"%";
    const ev=stage<2?Math.min(100,P):stage===2?E*100:0;   // tích luỹ khi áp suất tăng, cạn dần khi phun, bằng 0 khi ngừng
    q("#vev").textContent=Math.round(ev)+" %";q("#veb").style.width=Math.round(ev)+"%";
  }
  function showPart(id,x,y,r){
    sel=id?{id,x,y,r}:null;
    q("#vpart").innerHTML=id?`<b>${PARTS[id][0]}</b>: ${PARTS[id][1]}`:"<b>Chạm vào núi lửa</b> để xem tên và chức năng từng bộ phận.";
  }
  let qi=0,score=0;
  function renderQuiz(){
    const box=q("#vquiz");box.hidden=false;
    if(qi>=QUIZ.length){
      box.innerHTML=`<b>Hoàn thành!</b> Bạn trả lời đúng ${score}/${QUIZ.length} câu.<br><button class="chip" id="vq-again">Làm lại</button>`;
      q("#vq-again").onclick=()=>{qi=0;score=0;renderQuiz();};return;
    }
    const it=QUIZ[qi];
    box.innerHTML=`<b>Câu hỏi củng cố ${qi+1}/${QUIZ.length}</b><div class="vqq">${it.q}</div>`+it.o.map((o,i)=>`<button class="vqo" data-i="${i}">${o}</button>`).join("");
    box.querySelectorAll(".vqo").forEach(b=>b.onclick=()=>{
      const ok=+b.dataset.i===it.a;if(ok)score++;
      box.querySelectorAll(".vqo").forEach(x=>{x.disabled=true;if(+x.dataset.i===it.a)x.classList.add("ok");});
      if(!ok)b.classList.add("bad");
      setTimeout(()=>{if(!dead){qi++;renderQuiz();}},1100);
    });
  }

  function setStage(s){if(stage===s)return;stage=s;stageT=0;renderInfo();}
  function beginEruption(){
    eruptDur=5+7*KL;eruptT=0;cool=0;P=100;E=1;erReady=false;weak=false;setStage(2);
    try{navigator.vibrate&&navigator.vibrate([50,40,90+Math.round(80*KL)]);}catch(e){}
  }
  function fullReset(){
    stage=0;stageT=0;P=8;lvl=.06;auto=false;paused=false;finished=false;cool=0;eruptT=0;
    lavaFlows=[];flowSpawn=0;lightning=[];lightningClock=0;lightningFlash=0;lava=[];ash=[];gas=[];steam=[];bub=[];
    sideK=0;crackP=0;sideBurst=false;debris=[];bl=0;E=1;erReady=false;weak=false;accSL=0;accSF=0;accSA=0;accD=0;
    q("#vquiz").hidden=true;qi=0;score=0;showPart(null);
    q("#vb-pause").textContent="⏸ Tạm dừng";syncBtns();renderInfo();renderGauges();
  }
  function syncBtns(){q("#vb-p").disabled=paused;q("#vb-e").disabled=paused;}

  function spawnLavaFlow(source="main"){
    const side=source==="side"?1:(Math.random()<.5?-1:1);
    const x=source==="side"?SVP.x+rnd(3,8):clamp(180+side*rnd(18,22),18,336);
    const y=surfaceY(x)-1.4;
    lavaFlows.push({x,y,side,src:source,age:0,dist:0,reach:1e9,done:false,seed:rnd(0,1000),
      width:rnd(4.2,7),trail:[{x,y,w:rnd(2.8,4.6)}],branch:false,minY:y,maxY:y});
  }
  // Hệ số tốc độ: dung nham chảy đều khi đang phun, sau đó chậm dần (miệng phụ kết thúc muộn hơn miệng chính).
  function flowK(f){
    if(stage===2){const e=f.src==="side"?clamp(E/.25,0,1):clamp(E/.5,0,1);return .3+.7*e;}   // năng lượng cạn → chảy chậm dần
    if(stage===3)return Math.max(.18,.3*Math.exp(-stageT/3));                                   // vẫn bò xuống chân núi rồi mới nguội hẳn
    return 1;
  }
  function updateLavaFlows(dt){
    for(const f of lavaFlows){
      if(f.done)continue;
      f.age+=dt;
      const k=flowK(f);
      if(stage===3&&cool>=.97){f.done=true;continue;}
      let kk=k;
      if(stage===3){const rem=Math.abs((f.side>0?338:16)-f.x),tr=Math.max(.5,(1-cool)*8*.85);kk=Math.max(k,Math.min(.5,rem/tr/(14+KL*16)));}
      const speed=(14+KL*16)*(1+Math.sin(f.age*2.1+f.seed)*.22)*kk;
      const dx=f.side*speed*dt+noise(Math.floor(f.age*31+f.seed))*1.1*dt;
      f.x+=dx;f.dist+=Math.abs(dx);
      const wander=Math.sin(f.age*2.8+f.seed)*2.2+noise(Math.floor(f.age*18+f.seed))*2.1;
      f.y=surfaceY(clamp(f.x,14,340))-1.2+wander*.3;
      const lp=f.trail[f.trail.length-1];
      if(Math.hypot(f.x-lp.x,f.y-lp.y)>1.5){
        let w=Math.max(1.1,f.width*(.82+Math.sin(f.age*3.1+f.seed)*.17+Math.random()*.13));
        if(f.y>GY-8)w*=1+.6*clamp((f.y-(GY-8))/8,0,1);   // dung nham loang rộng trên đất bằng
        f.trail.push({x:f.x,y:f.y,w});f.minY=Math.min(f.minY,f.y);f.maxY=Math.max(f.maxY,f.y);
      }
      if(!f.branch&&f.age>1.1&&f.age<2.4&&Math.random()<dt*.14&&lavaFlows.length<24){
        f.branch=true;
        lavaFlows.push({x:f.x,y:f.y,side:f.side,src:f.src,age:0,dist:0,reach:1e9,done:false,seed:rnd(0,1000),
          width:f.width*.62,trail:[{x:f.x,y:f.y,w:f.width*.48}],branch:true,minY:f.y,maxY:f.y});
      }
      if(f.x<=16||f.x>=338)f.done=true;   // chảy tới sát mép khung
    }
  }
  function drawLavaFlow(f){
    const n=f.trail.length;if(n<2)return;
    const A=[],B=[];
    for(let i=0;i<n;i++){
      const p=f.trail[i],a=f.trail[Math.max(0,i-1)],b=f.trail[Math.min(n-1,i+1)];
      const dx=b.x-a.x,dy=b.y-a.y,len=Math.hypot(dx,dy)||1,nx=-dy/len,ny=dx/len;
      const w=p.w*(1+Math.sin(i*.83+f.seed)*.13+noise(i+f.seed)*.12);
      A.push({x:p.x+nx*w,y:p.y+ny*w});B.push({x:p.x-nx*w,y:p.y-ny*w});
    }
    const trace=()=>{ctx.beginPath();A.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));for(let i=n-1;i>=0;i--)ctx.lineTo(B[i].x,B[i].y);ctx.closePath();};
    const heat=1-cool;
    // lớp vỏ: nâu đỏ sẫm → xám đen của đá bazan khi nguội
    trace();ctx.fillStyle=`rgb(${Math.round(75-24*cool)},${Math.round(24+22*cool)},${Math.round(12+30*cool)})`;ctx.fill();
    if(heat>.02){
      ctx.save();ctx.translate(0,-.35);trace();
      const gr=ctx.createLinearGradient(0,f.minY-5,0,f.maxY+5);
      gr.addColorStop(0,`rgba(255,190,65,${.96*heat})`);gr.addColorStop(.38,`rgba(255,93,20,${.98*heat})`);gr.addColorStop(1,`rgba(165,35,9,${.96*heat})`);
      ctx.fillStyle=gr;ctx.fill();
      ctx.beginPath();
      for(let i=0;i<n;i++){const p=f.trail[i],x=p.x+Math.sin(i*.57+f.seed)*p.w*.25,y=p.y-p.w*.22;i?ctx.lineTo(x,y):ctx.moveTo(x,y);}
      ctx.strokeStyle=`rgba(255,224,125,${.7*heat})`;ctx.lineWidth=1.1;ctx.lineCap="round";ctx.stroke();ctx.restore();
    }
    if(cool>.45){
      const a=clamp((cool-.45)/.55,0,1);
      ctx.beginPath();A.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));
      ctx.strokeStyle=`rgba(170,152,136,${.5*a})`;ctx.lineWidth=.9;ctx.stroke();
      ctx.beginPath();
      for(let i=4;i<n-1;i+=6){ctx.moveTo(A[i].x*.82+B[i].x*.18,A[i].y*.82+B[i].y*.18);ctx.lineTo(A[i].x*.3+B[i].x*.7,A[i].y*.3+B[i].y*.7);}
      ctx.strokeStyle=`rgba(18,12,10,${.55*a})`;ctx.lineWidth=.8;ctx.stroke();
    }
    if(!f.done&&flowK(f)>.1){
      const h=f.trail[n-1],gg=ctx.createRadialGradient(h.x,h.y,0,h.x,h.y,7);
      gg.addColorStop(0,"rgba(255,200,90,.85)");gg.addColorStop(1,"rgba(255,110,20,0)");
      ctx.fillStyle=gg;ctx.fillRect(h.x-8,h.y-8,16,16);
    }
  }
  function makeLightning(){
    const x=rnd(85,285),y=rnd(8,42),endX=x+rnd(-48,48),endY=rnd(76,125),points=[{x,y}];
    const count=8;
    for(let i=1;i<count;i++){
      const u=i/count;points.push({x:x+(endX-x)*u+rnd(-13,13),y:y+(endY-y)*u});
    }
    points.push({x:endX,y:endY});
    const branches=Math.random()<.55,branch=[];
    if(branches){const p=points[4];branch.push({x:p.x,y:p.y},{x:p.x+rnd(-17,17),y:p.y+rnd(8,23)});}
    lightning.push({points,branch,life:0,max:rnd(.12,.24)});
    lightningFlash=.09;
  }
  function drawLightning(){
    lightning.forEach(b=>{
      const a=1-b.life/b.max;
      ctx.save();ctx.lineCap="round";ctx.lineJoin="round";
      ctx.shadowColor="#a9dfff";ctx.shadowBlur=15;ctx.strokeStyle=`rgba(170,220,255,${.9*a})`;ctx.lineWidth=3.2;
      ctx.beginPath();b.points.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.stroke();
      ctx.shadowBlur=3;ctx.strokeStyle=`rgba(255,255,255,${a})`;ctx.lineWidth=1.15;ctx.stroke();
      if(b.branch.length){ctx.beginPath();b.branch.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.stroke();}
      ctx.restore();
    });
  }

  function update(dt){
    stageT+=dt;
    if(stage===0){
      if(auto){P=Math.min(40,P+4.6*dt);if(P>=32&&stageT>=2.5)setStage(1);}
      else if(P>=30)setStage(1);
    }else if(stage===1){
      if(auto)P=Math.min(100,P+(8+(P-30)*.14)*dt);
      if(P>=ERUPT_P)beginEruption();
    }else if(stage===2){
      eruptT+=dt;cool=Math.max(0,cool-dt*.6);
      if(erReady)E=Math.max(0,E-dt/eruptDur);            // phun trào tiêu hao năng lượng
      P=8+92*E;
      if(!weak&&E<.4){weak=true;q("#vdesc").textContent=STAGES[2].d+" Năng lượng đang cạn dần nên phun trào yếu đi.";}
      if(E<=.02)setStage(3);                              // chỉ dừng khi đã hết năng lượng
    }else{
      P=Math.max(8,P-9*dt);cool=Math.min(1,cool+dt/8);
      if(cool>=1&&P<=8.5&&!finished){finished=true;auto=false;renderQuiz();}
    }
    // Mực magma: dâng nhanh hơn một chút; sau phun trào giữ mức một lúc (để miệng phụ còn phun) rồi mới rút xuống.
    let target;
    if(stage===2)target=.82+.18*clamp(E/.6,0,1);       // magma tụt dần khi năng lượng cạn
    else if(stage===3)target=clamp(.82-stageT*.2,.06,1);
    else target=clamp(.06+(P-8)/77*.94,.06,1);
    lvl+=(target-lvl)*Math.min(1,dt*(stage===2?6:stage===1?3.4:3));
    const pl=plOf(lvl),sb=branchFill(pl),full=pl>.9;
    if(stage===2&&full)erReady=true;
    const f3=0,er=stage===2,go=er&&erReady,mm=Math.pow(clamp(E/.5,0,1),1.2);
    // ---- miệng chính: chỉ phun khi magma đã dâng tới miệng ----
    if(go||f3>0){
      const m=go?mm:f3;
      accL+=dt*(8+20*KL)*m;
      while(accL>=1){accL--;if(lava.length<70)lava.push({x:180+rnd(-8,8),y:90,vx:rnd(-65,65)*(.6+.8*KL),vy:-(105+rnd(0,100))*(.6+.6*KL)});}
      flowSpawn+=dt*(1.0+KL*1.4)*m;
      while(flowSpawn>=1){flowSpawn--;if(lavaFlows.length<22)spawnLavaFlow("main");}
      lightningClock-=dt;
      if(ash.length>8&&lightningClock<=0){makeLightning();lightningClock=rnd(1.1,3.2)/(0.65+KL*.35);}
      accA+=dt*(9+16*KL)*m;
      while(accA>=1){accA--;if(ash.length<80)ash.push({x:180+rnd(-7,7),y:88,vx:12+rnd(-8,10),vy:-(32+rnd(0,36))*(.8+.5*KL),r:4,g:10,life:0,max:3.6,a:.62});}
      accG+=dt*(6+8*KL)*m;
      while(accG>=1){accG--;if(gas.length<50)gas.push({x:180+rnd(-6,6),y:88,vx:8+rnd(-6,10),vy:-(45+rnd(0,40)),r:3,g:7,life:0,max:2.6,a:.35});}
    }else if(stage===1){
      const e=clamp((P-30)/55,0,1);
      if(pl>.97){
        accG+=dt*(.8+3*e);
        while(accG>=1){accG--;if(steam.length<40)steam.push({x:180+rnd(-5,5),y:88,vx:6+rnd(-4,4),vy:-(18+rnd(0,12)),r:3,g:6,life:0,max:2.4,a:.3});}
      }
      if(sb>.2&&sideK<.02){
        accS+=dt*(.6+2*e);
        while(accS>=1){accS--;if(steam.length<40)steam.push({x:SVP.x,y:SVP.y-4,vx:5+rnd(-3,5),vy:-(14+rnd(0,10)),r:2.5,g:5,life:0,max:2.2,a:.26});}
      }
    }
    // mực dung nham trong lòng miệng chính
    const blT=go?clamp(E/.5,0,1):(stage===1&&pl>.97?.3:0);
    bl+=(blT-bl)*Math.min(1,dt*4);
    // ---- miệng phụ: magma tới sớm hơn → phun sớm, mạnh, nhanh; và kết thúc muộn hơn miệng chính ----
    const sT=(stage===1&&sb>=1)?.55:(stage===2&&sb>=1&&erReady)?clamp(E/.25,0,1):0;   // miệng phụ yếu đi muộn hơn miệng chính
    sideK+=clamp(sT-sideK,-dt/2.6,dt/.9);
    if(stage===1&&sb>.55)crackP=Math.max(crackP,(sb-.55)/.45*.45);
    if(sideK>.02){
      if(!sideBurst){
        sideBurst=true;
        for(let i=0;i<14;i++)debris.push({x:SVP.x+rnd(-4,4),y:SVP.y-4,vx:rnd(-30,75),vy:-rnd(60,145),rot:rnd(0,TAU),vr:rnd(-9,9),s:rnd(1.2,2.8)});
      }
      crackP=Math.min(1,crackP+dt/1.5);
      accSL+=dt*(10+22*KL)*sideK;
      while(accSL>=1){accSL--;if(lava.length<90)lava.push({x:SVP.x+rnd(-2,2),y:SVP.y-3,vx:rnd(14,75)*(.7+.6*KL),vy:-(95+rnd(0,95))*(.7+.5*KL)*(.6+.4*sideK)});}
      accSF+=dt*(1.1+1.6*KL)*sideK;
      while(accSF>=1){accSF--;if(lavaFlows.length<24)spawnLavaFlow("side");}
      accSA+=dt*5*sideK;
      while(accSA>=1){accSA--;if(ash.length<80)ash.push({x:SVP.x+rnd(-3,3),y:SVP.y-5,vx:10+rnd(-6,8),vy:-(26+rnd(0,26)),r:3,g:8,life:0,max:2.6,a:.5});}
      accD+=dt*3.5*sideK;
      while(accD>=1){accD--;if(debris.length<40)debris.push({x:SVP.x+rnd(-3,3),y:SVP.y-4,vx:rnd(-20,60),vy:-rnd(50,110),rot:rnd(0,TAU),vr:rnd(-9,9),s:rnd(1,2.2)});}
    }
    for(let i=debris.length-1;i>=0;i--){
      const d=debris[i];d.vy+=280*dt;d.x+=d.vx*dt;d.y+=d.vy*dt;d.rot+=d.vr*dt;
      if(d.y>H||(d.vy>0&&d.y>=surfaceY(clamp(d.x,14,340))-1))debris.splice(i,1);
    }
    accB+=dt*(1+P/9);
    while(accB>=1){accB--;if(bub.length<26)bub.push({x:CX+rnd(-42,42),y:CY+rnd(-10,14),v:rnd(10,22),r:rnd(1.2,2.8)});}
    const levelY=pipeLevelY();
    for(let i=bub.length-1;i>=0;i--){
      const b=bub[i];
      if(b.y>VBOT-6)b.x+=(CX-b.x)*Math.min(1,dt*1.5);
      b.y-=b.v*dt*(.5+P/60);
      if(b.x>VX&&b.x<VX+VW){if(b.y<levelY)bub.splice(i,1);}
      else if(b.y<VBOT-6)bub.splice(i,1);
    }
    for(let i=lava.length-1;i>=0;i--){
      const b=lava[i];b.vy+=230*dt;b.x+=b.vx*dt;b.y+=b.vy*dt;
      if(b.y>H||(b.vy>0&&b.y>=surfaceY(clamp(b.x,14,340))-1))lava.splice(i,1);
    }
    [ash,gas,steam].forEach(arr=>{
      for(let i=arr.length-1;i>=0;i--){const a=arr[i];a.x+=a.vx*dt;a.y+=a.vy*dt;a.r+=a.g*dt;a.life+=dt;if(a.life>a.max)arr.splice(i,1);}
    });
    updateLavaFlows(dt);
    lightningFlash=Math.max(0,lightningFlash-dt);
    for(let i=lightning.length-1;i>=0;i--){lightning[i].life+=dt;if(lightning[i].life>lightning[i].max)lightning.splice(i,1);}
  }

  function conePath(ox=0,oy=0,bottom=GY){
    ctx.beginPath();ctx.moveTo(pts[0].x+ox,pts[0].y+oy);
    for(let i=1;i<pts.length;i++)ctx.lineTo(pts[i].x+ox,pts[i].y+oy);
    ctx.lineTo(340+ox,bottom+oy);ctx.lineTo(14+ox,bottom+oy);ctx.closePath();
  }
  // Các hình khối bên trong được dựng bằng đường bao bất quy tắc.
  function chamberPath(sx=1,sy=1,t=0){
    ctx.beginPath();
    for(let i=0;i<=56;i++){
      const a=TAU*i/56, n=noise(i+211)*2.7+noise(i+517)*1.2+Math.sin(a*5+t*1.35)*1.15;
      const x=CX+Math.cos(a)*(RX+n)*sx;
      const y=CY+Math.sin(a)*(RY+n*.48+Math.sin(a*3-t*1.1)*.8)*sy;
      i?ctx.lineTo(x,y):ctx.moveTo(x,y);
    }
    ctx.closePath();
  }
  function craterPath(x,y,rx,ry,seed=0){
    ctx.beginPath();
    for(let i=0;i<=32;i++){
      const a=TAU*i/32, n=noise(i+seed)*1.35+noise(i+seed+70)*.55;
      const px=x+Math.cos(a)*(rx+n),py=y+Math.sin(a)*(ry+n*.45);
      i?ctx.lineTo(px,py):ctx.moveTo(px,py);
    }
    ctx.closePath();
  }
  function tubePath(points,widths){
    const left=[],right=[];
    for(let i=0;i<points.length;i++){
      const a=points[Math.max(0,i-1)],b=points[Math.min(points.length-1,i+1)];
      const dx=b.x-a.x,dy=b.y-a.y,len=Math.hypot(dx,dy)||1,nx=-dy/len,ny=dx/len,w=widths[i];
      left.push({x:points[i].x+nx*w,y:points[i].y+ny*w});
      right.push({x:points[i].x-nx*w,y:points[i].y-ny*w});
    }
    ctx.beginPath();ctx.moveTo(left[0].x,left[0].y);
    for(let i=1;i<left.length;i++)ctx.lineTo(left[i].x,left[i].y);
    for(let i=right.length-1;i>=0;i--)ctx.lineTo(right[i].x,right[i].y);
    ctx.closePath();
  }
  const mainTube=[];
  for(let i=0;i<=28;i++){
    const u=i/28;
    mainTube.push({x:180+Math.sin(u*5.4)*2.5+noise(i+820)*1.2,y:98+u*144});
  }
  const mainWidths=mainTube.map((p,i)=>8.2+Math.sin(i*.43)*1.25+noise(i+920)*.8);
  const branchTube=[];
  for(let i=0;i<=22;i++){
    const u=i/22,p=bez(BR,u);
    branchTube.push({x:p.x+Math.sin(u*7)*1.3+noise(i+1120)*.8,y:p.y+noise(i+1190)*.7});
  }
  const branchWidths=branchTube.map((p,i)=>5.2+Math.sin(i*.5)*.8+noise(i+1250)*.5);
  // ----- miệng phụ: gò nhỏ trên sườn, vết nứt, hố phun -----
  const MR=14;
  const moundH=x=>{const d=(x-SVP.x)/MR;return Math.abs(d)>=1?0:7.5*Math.pow(Math.cos(d*Math.PI/2),2);};
  const notchD=x=>{const d=Math.abs(x-SVP.x)/5;return d>=1?0:3.4*(1-d*d);};
  const moundTop=x=>surfaceY(x)-moundH(x)+notchD(x);
  function drawSideMound(){
    ctx.beginPath();
    for(let x=SVP.x-MR;x<=SVP.x+MR;x+=1)x===SVP.x-MR?ctx.moveTo(x,moundTop(x)):ctx.lineTo(x,moundTop(x));
    for(let x=SVP.x+MR;x>=SVP.x-MR;x-=1)ctx.lineTo(x,surfaceY(x)+1.5);
    ctx.closePath();
    const mg=ctx.createLinearGradient(0,SVP.y-9,0,SVP.y+5);mg.addColorStop(0,"#8d7d6b");mg.addColorStop(1,"#6b5d50");
    ctx.fillStyle=mg;ctx.fill();ctx.strokeStyle="rgba(35,24,18,.8)";ctx.lineWidth=1.1;ctx.stroke();
  }
  function drawSideNotch(t){
    const x0=SVP.x-5,x1=SVP.x+5;
    ctx.beginPath();ctx.moveTo(x0,moundTop(x0));
    for(let x=x0+1;x<=x1;x+=1)ctx.lineTo(x,moundTop(x));
    ctx.closePath();ctx.fillStyle="#1b110d";ctx.fill();
    const la=sideK>.02?.55+.45*sideK:(branchFill(plOf(lvl))>=.98?.45:0);
    if(la>0&&cool<.95){ctx.fillStyle=`rgba(255,${150+Math.round(60*Math.sin(t*14))},35,${la*(1-cool)})`;ctx.fill();}
  }
  function drawSideCracks(){
    if(crackP<=.001)return;
    const glow=(stage===1||stage===2||sideK>.02)?1-cool*.9:Math.max(0,1-cool*1.2)*.8;
    ctx.lineCap="round";ctx.lineJoin="round";
    sideCracks.forEach((c,ci)=>{
      const p=clamp((crackP-ci*.07)/.55,0,1);if(p<=0)return;
      const segs=c.length-1,f=p*segs;
      ctx.beginPath();ctx.moveTo(c[0].x,c[0].y);
      for(let j=1;j<=segs;j++){
        if(j<=f)ctx.lineTo(c[j].x,c[j].y);
        else{const u=f-(j-1);if(u>0)ctx.lineTo(c[j-1].x+(c[j].x-c[j-1].x)*u,c[j-1].y+(c[j].y-c[j-1].y)*u);break;}
      }
      ctx.strokeStyle="rgba(24,15,11,.9)";ctx.lineWidth=2.2;ctx.stroke();
      if(glow>.05){ctx.strokeStyle=`rgba(255,${130+ci*8},35,${.8*glow})`;ctx.lineWidth=1;ctx.stroke();}
    });
  }
  // Miệng chính: hố khoét vào đường bao núi (thành sau + đáy), dung nham dâng trong lòng miệng
  const rimL=()=>surfaceY(180-CR_W), rimR=()=>surfaceY(180+CR_W);
  const farY=x=>{const u=(x-(180-CR_W))/(2*CR_W);return rimL()+(rimR()-rimL())*u+1.2*Math.sin(u*Math.PI)+noise(Math.round(x))*.5;};
  function craterShape(){
    ctx.beginPath();
    for(let x=180-CR_W;x<=180+CR_W;x+=1.5)x===180-CR_W?ctx.moveTo(x,surfaceY(x)):ctx.lineTo(x,surfaceY(x));
    for(let x=180+CR_W;x>=180-CR_W;x-=1.5)ctx.lineTo(x,farY(x));
    ctx.closePath();
  }
  function drawMainCrater(t){
    craterShape();
    const cg=ctx.createLinearGradient(0,CR_RIM,0,CR_FLOOR+1);cg.addColorStop(0,"#6a5143");cg.addColorStop(.55,"#3a271f");cg.addColorStop(1,"#150d0a");
    ctx.fillStyle=cg;ctx.fill();
    ctx.save();craterShape();ctx.clip();
    // vệt sáng trên thành sau của miệng
    ctx.strokeStyle="rgba(190,160,130,.18)";ctx.lineWidth=1;
    for(let k=0;k<4;k++){const x=180-CR_W+6+k*7;ctx.beginPath();ctx.moveTo(x,farY(x)+1.5);ctx.lineTo(x+noise(k+60)*2,CR_FLOOR-2);ctx.stroke();}
    if(bl>.02){
      const top=CR_FLOOR+2-(CR_FLOOR+2-(CR_RIM-1))*bl;
      ctx.beginPath();
      for(let x=180-CR_W;x<=180+CR_W;x+=2){const y=top+Math.sin(x*.5+t*5)*.9;x===180-CR_W?ctx.moveTo(x,y):ctx.lineTo(x,y);}
      ctx.lineTo(180+CR_W,CR_FLOOR+4);ctx.lineTo(180-CR_W,CR_FLOOR+4);ctx.closePath();
      const lg=ctx.createLinearGradient(0,top,0,CR_FLOOR+3);lg.addColorStop(0,"#ffc455");lg.addColorStop(.5,"#ff7a1c");lg.addColorStop(1,"#c6350f");
      ctx.fillStyle=lg;ctx.fill();
    }
    ctx.restore();
    // vành miệng phía sau: một dải đá mỏng nối hai đỉnh vành
    ctx.beginPath();
    for(let x=180-CR_W;x<=180+CR_W;x+=1.5)x===180-CR_W?ctx.moveTo(x,farY(x)):ctx.lineTo(x,farY(x));
    ctx.strokeStyle="rgba(140,118,98,.9)";ctx.lineWidth=1.6;ctx.lineCap="round";ctx.stroke();
    if(bl>.1){
      const hg=ctx.createRadialGradient(180,CR_RIM-2,2,180,CR_RIM-2,42);
      hg.addColorStop(0,`rgba(255,150,50,${.4*bl})`);hg.addColorStop(1,"rgba(255,120,30,0)");
      ctx.fillStyle=hg;ctx.fillRect(132,CR_RIM-44,96,56);
    }
  }
  function line(x1,y1,x2,y2){
    ctx.strokeStyle="rgba(255,255,255,.75)";ctx.lineWidth=1;
    ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();
  }
  function drawSurfaceDetails(){
    const rockColors=["#62554b","#756457","#887765","#a08b75"];
    rocks.forEach(p=>{
      ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.rot);
      ctx.fillStyle=rockColors[p.tone];ctx.beginPath();
      ctx.moveTo(-p.rx,-p.ry*.2);ctx.lineTo(-p.rx*.45,-p.ry);
      ctx.lineTo(p.rx*.55,-p.ry*.7);ctx.lineTo(p.rx,p.ry*.15);
      ctx.lineTo(p.rx*.35,p.ry);ctx.lineTo(-p.rx*.7,p.ry*.65);
      ctx.closePath();ctx.fill();ctx.restore();
    });
    cracks.forEach(points=>{
      ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));
      ctx.strokeStyle="rgba(42,31,25,.5)";ctx.lineWidth=.8;ctx.stroke();
    });
    strata.forEach((layer,i)=>{
      ctx.beginPath();layer.forEach((p,j)=>j?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));
      ctx.strokeStyle=i%2?"rgba(65,45,34,.25)":"rgba(225,195,155,.28)";
      ctx.lineWidth=1.2;ctx.stroke();
    });
  }

  function draw(now){
    const t=now/1000,er=stage===2;
    ctx.setTransform(sc,0,0,sc,0,0);ctx.clearRect(0,0,W,H);
    const sh=stage===1?clamp((P-30)/55,0,1)*1.3:er?1+1.6*KL:0;
    if(sh>0)ctx.translate((Math.random()-.5)*sh*2,(Math.random()-.5)*sh*2);
    let g=ctx.createLinearGradient(0,0,0,GY);
    g.addColorStop(0,"#5fb3f0");g.addColorStop(1,"#dff2ff");
    ctx.fillStyle=g;ctx.fillRect(-6,-6,W+12,GY+10);
    ctx.fillStyle="rgba(120,150,185,.55)";ctx.beginPath();
    ctx.moveTo(-6,GY-14);
    [[40,GY-44],[80,GY-24],[120,GY-52],[150,GY-30],[250,GY-34],[300,GY-60],[340,GY-30],[W+6,GY-40]].forEach(p=>ctx.lineTo(p[0],p[1]));
    ctx.lineTo(W+6,GY);ctx.lineTo(-6,GY);ctx.closePath();ctx.fill();
    if(er){ctx.fillStyle=`rgba(255,110,40,${.1+.1*KL})`;ctx.fillRect(-6,-6,W+12,GY+10);}
    const dark=clamp((ash.length+gas.length)/110,0,.4);
    if(dark>0){ctx.fillStyle=`rgba(60,55,62,${dark})`;ctx.fillRect(-6,-6,W+12,GY+10);}
    if(lightningFlash>0){ctx.fillStyle=`rgba(190,220,255,${lightningFlash*1.8})`;ctx.fillRect(-6,-6,W+12,GY+10);}
    drawLightning();
    g=ctx.createLinearGradient(0,GY-10,0,GY);
    g.addColorStop(0,"#79cf84");g.addColorStop(1,"#4aa65a");
    ctx.fillStyle=g;ctx.fillRect(14,GY,326,10);

    g=ctx.createLinearGradient(20,82,330,174);
    g.addColorStop(0,"#88796c");g.addColorStop(.38,"#8e806e");g.addColorStop(.72,"#6f805d");g.addColorStop(1,"#4f7550");
    conePath(0,0,GY);ctx.fillStyle=g;ctx.fill();
    ctx.save();conePath();ctx.clip();drawSurfaceDetails();
    const shade=ctx.createLinearGradient(18,95,340,170);
    shade.addColorStop(0,"rgba(20,17,15,.28)");shade.addColorStop(.48,"rgba(255,255,255,.035)");shade.addColorStop(1,"rgba(20,18,15,.3)");
    ctx.fillStyle=shade;ctx.fillRect(14,80,326,100);ctx.restore();
    ctx.strokeStyle="rgba(35,24,18,.8)";ctx.lineWidth=1.3;conePath(0,0,GY+1);ctx.stroke();
    ctx.save();conePath();ctx.clip();drawSideCracks();ctx.restore();
    drawSideMound();

    ctx.fillStyle="#4a3a30";ctx.beginPath();ctx.moveTo(340,GY);ctx.lineTo(354,GY-10);ctx.lineTo(354,BOT-10);ctx.lineTo(340,BOT);ctx.closePath();ctx.fill();
    ctx.fillStyle="#9b6b3c";ctx.fillRect(14,GY,326,22);
    ctx.fillStyle="#7d6a58";ctx.fillRect(14,GY+22,326,38);
    ctx.fillStyle="#5d4a49";ctx.fillRect(14,GY+60,326,BOT-GY-60);
    ctx.strokeStyle="rgba(0,0,0,.14)";ctx.lineWidth=1;
    for(let i=0;i<6;i++){ctx.beginPath();ctx.moveTo(14,GY+30+i*18);ctx.lineTo(340,GY+30+i*18);ctx.stroke();}
    ctx.beginPath();ctx.rect(14,GY,326,BOT-GY);ctx.stroke();

    if(P>12){
      g=ctx.createRadialGradient(CX,CY,10,CX,CY,120);
      g.addColorStop(0,`rgba(255,120,30,${.32*P/100})`);g.addColorStop(1,"rgba(255,120,30,0)");
      ctx.fillStyle=g;ctx.fillRect(14,GY,326,BOT-GY);
    }
    // Buồng magma: khoang rộng, méo lệch tự nhiên thay cho hình elip đều.
    chamberPath(1,1,t);ctx.fillStyle="#35201b";ctx.fill();
    ctx.save();chamberPath(1,1,t);ctx.clip();
    const h=P/100,pulse=.88+.12*Math.sin(t*3),magmaTop=CY+RY-14-clOf(lvl)*40;
    g=ctx.createLinearGradient(CX,magmaTop,CX,CY+RY);
    g.addColorStop(0,`rgb(255,${Math.round(105+105*h)},35)`);
    g.addColorStop(.55,`rgb(220,${Math.round(65+45*h)},13)`);g.addColorStop(1,"#6f1d0d");
    ctx.fillStyle=g;ctx.fillRect(CX-RX-5,magmaTop,CX*2,CY+RY-magmaTop+8);
    ctx.beginPath();
    for(let i=0;i<=28;i++){const x=CX-RX+i*(RX*2/28),y=magmaTop+Math.sin(i*.62+t*2.2)*1.8+noise(i+1500)*1.1;i?ctx.lineTo(x,y):ctx.moveTo(x,y);}
    ctx.lineTo(CX+RX,CY+RY);ctx.lineTo(CX-RX,CY+RY);ctx.closePath();
    ctx.fillStyle=`rgba(255,190,75,${.28+.22*pulse})`;ctx.fill();
    for(let i=0;i<7;i++){
      const bx=CX+Math.sin(t*(.48+i*.09)+i*2.1)*(30+i%3*5),by=CY+Math.cos(t*(.63+i*.11)+i*1.7)*11;
      ctx.fillStyle=`rgba(255,${165+i*11},65,${.13+.13*h})`;ctx.beginPath();
      ctx.ellipse(bx,by,7+i%3*3,2.5+i%2*1.5,Math.sin(t+i)*.35,0,TAU);ctx.fill();
    }
    for(let k=0;k<3;k++){
      ctx.beginPath();
      for(let i=0;i<=32;i++){
        const u=i/32,x=CX-48+u*96;
        const y=CY-8+k*9+Math.sin(u*10+t*(1.3+k*.24)+k)*3.1+Math.sin(u*23-t*.8)*1.2;
        i?ctx.lineTo(x,y):ctx.moveTo(x,y);
      }
      ctx.strokeStyle=`rgba(255,${190+k*15},95,${.28+.12*h})`;ctx.lineWidth=1.3+k*.35;ctx.stroke();
    }
    ctx.restore();
    ctx.strokeStyle="#241713";ctx.lineWidth=2;chamberPath(1,1,t);ctx.stroke();

    // Ống dẫn chính và ống phụ: rỗng (tối) cho tới khi magma thật sự dâng tới đó.
    tubePath(mainTube,mainWidths);ctx.fillStyle="#321a15";ctx.fill();
    tubePath(mainTube,mainWidths.map(w=>Math.max(2,w-3.1)));ctx.fillStyle="#3d221b";ctx.fill();
    tubePath(branchTube,branchWidths);ctx.fillStyle="#321a15";ctx.fill();
    tubePath(branchTube,branchWidths.map(w=>Math.max(1.5,w-2.1)));ctx.fillStyle="#3d221b";ctx.fill();
    const pl=plOf(lvl),sb=branchFill(pl),pY=pipeLevelY();
    if(pY<300){
      ctx.save();tubePath(mainTube,mainWidths.map(w=>Math.max(1,w-3.1)));ctx.clip();
      ctx.beginPath();for(let i=0;i<=20;i++){const x=VX-12+i*1.8,y=pY+Math.sin(i*.7+t*3)*1.4;i?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.lineTo(VX+24,VBOT+8);ctx.lineTo(VX-12,VBOT+8);ctx.closePath();
      ctx.fillStyle=`rgb(255,${Math.round(90+90*lvl)},20)`;ctx.fill();
      const span=Math.max(8,VBOT+6-pY);
      for(let k=0;k<5;k++){
        const yy=VBOT+6-((t*24+k*27)%span);
        ctx.fillStyle=`rgba(255,${190+k*8},80,${.22+.08*Math.sin(t*3+k)})`;
        ctx.beginPath();ctx.ellipse(VX+VW/2+Math.sin(t*2+k)*2,yy,3.5+Math.sin(k+t)*1.2,7,0,0,TAU);ctx.fill();
      }
      ctx.strokeStyle="rgba(255,235,140,.7)";ctx.lineWidth=1.4;ctx.beginPath();for(let i=0;i<=20;i++){const x=VX-12+i*1.8,y=pY+Math.sin(i*.7+t*3)*1.4;i?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.stroke();
      ctx.restore();
    }
    if(sb>0){
      ctx.save();ctx.lineCap="round";ctx.lineJoin="round";
      ctx.strokeStyle=`rgb(255,${Math.round(100+80*sb)},22)`;ctx.lineWidth=4.2;ctx.beginPath();
      for(let i=0;i<=14;i++){const q=bez(BR,sb*i/14);i?ctx.lineTo(q.x,q.y):ctx.moveTo(q.x,q.y);}
      ctx.stroke();ctx.restore();
    }
    bub.forEach(b=>{ctx.fillStyle="rgba(255,225,130,.8)";ctx.beginPath();ctx.arc(b.x,b.y,b.r,0,TAU);ctx.fill();});
    drawMainCrater(t);drawSideNotch(t);
    lavaFlows.forEach(drawLavaFlow);
    ash.forEach(a=>{ctx.fillStyle=`rgba(70,68,74,${Math.max(0,a.a*(1-a.life/a.max))})`;ctx.beginPath();ctx.arc(a.x,a.y,a.r,0,TAU);ctx.fill();});
    gas.forEach(a=>{ctx.fillStyle=`rgba(235,225,190,${Math.max(0,a.a*(1-a.life/a.max))})`;ctx.beginPath();ctx.arc(a.x,a.y,a.r,0,TAU);ctx.fill();});
    steam.forEach(a=>{ctx.fillStyle=`rgba(255,255,255,${Math.max(0,a.a*(1-a.life/a.max))})`;ctx.beginPath();ctx.arc(a.x,a.y,a.r,0,TAU);ctx.fill();});
    lava.forEach(b=>{ctx.fillStyle="rgba(255,120,20,.4)";ctx.beginPath();ctx.arc(b.x,b.y,4.2,0,TAU);ctx.fill();ctx.fillStyle="#ff8a1f";ctx.beginPath();ctx.arc(b.x,b.y,2.4,0,TAU);ctx.fill();});
    debris.forEach(d=>{ctx.save();ctx.translate(d.x,d.y);ctx.rotate(d.rot);ctx.fillStyle="#4a3b32";ctx.beginPath();
      ctx.moveTo(-d.s,-d.s*.4);ctx.lineTo(0,-d.s);ctx.lineTo(d.s,-d.s*.2);ctx.lineTo(d.s*.5,d.s);ctx.lineTo(-d.s*.7,d.s*.6);ctx.closePath();ctx.fill();ctx.restore();});
    if(sideK>.02){
      const sg=ctx.createRadialGradient(SVP.x,SVP.y-4,1,SVP.x,SVP.y-4,26);
      sg.addColorStop(0,`rgba(255,170,60,${.5*sideK})`);sg.addColorStop(1,"rgba(255,120,30,0)");
      ctx.fillStyle=sg;ctx.fillRect(SVP.x-28,SVP.y-32,56,56);
    }
    if(stage===1||er){
      const a=stage===1?clamp((P-30)/55,0,1):1,ph=t*30;
      ctx.strokeStyle=`rgba(255,255,255,${.35+.4*a})`;ctx.lineWidth=1.4;
      [[24,GY-4],[W-34,GY-4]].forEach(([x,y])=>{
        ctx.beginPath();for(let i=0;i<=8;i++){const px=x+i*2.6,py=y+Math.sin(ph+i*1.4)*3*a;i?ctx.lineTo(px,py):ctx.moveTo(px,py);}ctx.stroke();
      });
    }
    if(showLab){
      line(66,60,163,86);simLabel(ctx,"Miệng núi lửa",8,56,"left");
      line(66,124,VX,124);simLabel(ctx,"Ống phun",8,120,"left");
      line(100,240,128,256);simLabel(ctx,"Buồng magma",8,236,"left");
      simLabel(ctx,"Magma",CX,CY+4,"center");
      line(300,92,SVP.x+4,SVP.y-3);simLabel(ctx,"Miệng phụ",W-6,88,"right");
      if(lavaFlows.length){const p=lavaFlows[lavaFlows.length-1];line(300,150,p.x,p.y);simLabel(ctx,cool>=.98?"Đá mới":"Dung nham",W-6,146,"right");}
      if(ash.length>6||gas.length>6){line(262,40,215,52);simLabel(ctx,"Tro bụi và khí",W-6,36,"right");}
    }
    if(stage===2&&weak&&E>.02)simLabel(ctx,"Năng lượng cạn dần…",W/2,22,"center");
    if(stage===3&&stageT<5){ctx.save();ctx.globalAlpha=clamp(1-(stageT-3)/2,0,1);simLabel(ctx,"Hết năng lượng → ngừng phun trào",W/2,22,"center");ctx.restore();}
    if(sel){const r=sel.r+2*Math.sin(t*6);ctx.strokeStyle="#ffd23f";ctx.lineWidth=2;ctx.beginPath();ctx.arc(sel.x,sel.y,r,0,TAU);ctx.stroke();}
  }

  cv.addEventListener("pointerup",e=>{
    const r=cv.getBoundingClientRect(),x=(e.clientX-r.left)/r.width*W,y=(e.clientY-r.top)/r.height*H,d=(ax,ay)=>Math.hypot(x-ax,y-ay);
    const levelY=pipeLevelY();let res=null;
    if((ash.length>3||gas.length>3)&&y<GY-70&&Math.abs(x-190)<90&&y<80)res=["trobui",190,56,26];
    else if(d(180,92)<20)res=["miengnui",180,92,17];
    else if(d(SVP.x,SVP.y-2)<14)res=["mienphu",SVP.x,SVP.y,12];
    else{
      for(const f of lavaFlows){for(const p of f.trail){if(d(p.x,p.y)<Math.max(8,p.w+4)){res=[cool>=.98?"danoi":"dungnham",p.x,p.y,Math.max(8,p.w+4)];break;}}if(res)break;}
      if(!res){
        const ex=((x-CX)/(RX+5))**2+((y-CY)/(RY+4))**2;
        if(ex<=.14)res=["magma",CX,CY,12];
        else if(ex<=1.18)res=["buong",CX,CY,RY+6];
        else if(y>98&&y<244&&Math.abs(x-(180+Math.sin((y-98)/144*5.4)*2.5))<13)res=y>=levelY?["magma",x,y,9]:["ongphun",x,y,10];
        else if(branchTube.some(p=>d(p.x,p.y)<9))res=["ongphun",x,y,9];
      }
    }
    if(res)showPart(res[0],res[1],res[2],res[3]);else showPart(null);
    if(paused||!raf)draw(performance.now());
  });
  const on=(id,fn)=>{q(id).onclick=fn;};
  on("#vb-start",()=>{fullReset();auto=true;kick();});
  on("#vb-p",()=>{if(paused)return;if(finished)fullReset();if(stage>=2)return;P=Math.min(100,P+12);if(P>=ERUPT_P)beginEruption();else if(P>=30&&stage===0)setStage(1);renderGauges();kick();});
  on("#vb-e",()=>{if(paused)return;if(finished)fullReset();if(stage>=2)return;P=Math.max(P,ERUPT_P);beginEruption();renderGauges();kick();});
  on("#vb-pause",()=>{paused=!paused;q("#vb-pause").textContent=paused?"▶ Tiếp tục":"⏸ Tạm dừng";syncBtns();if(paused){if(raf){cancelAnimationFrame(raf);raf=0;}draw(performance.now());}else kick();});
  on("#vb-reset",()=>{fullReset();kick();});
  on("#vb-lab",()=>{showLab=!showLab;q("#vb-lab").textContent=showLab?"Ẩn cấu tạo":"Hiện cấu tạo";draw(performance.now());});
  q("#vb-lv").querySelectorAll("[data-k]").forEach(b=>b.onclick=()=>{KL=+b.dataset.k;q("#vb-lv").querySelectorAll("[data-k]").forEach(x=>x.classList.toggle("on",x===b));});

  function loop(now){
    raf=0;if(dead)return;
    const dt=Math.min(.05,(now-last)/1000||.016);last=now;
    if(!paused){update(dt);gT+=dt;if(gT>.12){gT=0;renderGauges();}}
    draw(now);if(!paused)raf=requestAnimationFrame(loop);
  }
  function kick(){if(!raf&&!paused&&!dead){last=performance.now();raf=requestAnimationFrame(loop);}}
  function fit(){
    const w=cv.parentNode.clientWidth||320,d=Math.min(window.devicePixelRatio||1,2),nw=Math.round(w*d);
    if(cv.width!==nw){cv.width=nw;cv.height=Math.round(w*H/W*d);}
    sc=cv.width/W;draw(performance.now());
  }
  const ro=window.ResizeObserver?new ResizeObserver(fit):null;
  if(ro)ro.observe(cv.parentNode);else window.addEventListener("resize",fit);
  renderInfo();renderGauges();syncBtns();kick();
  return{destroy(){dead=true;if(raf)cancelAnimationFrame(raf);if(ro)ro.disconnect();else window.removeEventListener("resize",fit);}};
}
