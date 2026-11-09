// ---------- TRÁI ĐẤT TỰ QUAY (Three.js) ----------
function loadScript(src, ok){
  return new Promise((res,rej)=>{
    if(ok()) return res();
    const s = document.createElement("script"); s.src = src; s.onload = res;
    s.onerror = ()=>rej(new Error("load "+src)); document.head.appendChild(s);
  });
}
function simEarth(root){
  root.innerHTML = `
    <div class="simcv ev"><canvas></canvas><div class="evload" id="el">Đang tải mô hình 3D…</div></div>
    <div class="simctl">
      <div class="simbtns"><button class="cta" id="ep">⏸ Tạm dừng</button><button class="no" id="e1">1 vòng</button><button class="no" id="ed">Đảo chiều</button><button class="no" id="er">Đặt lại</button></div>
      <div class="simst" id="est">Hướng quay: Tây → Đông</div>
      <label>Tốc độ quay <b id="esv">4 giờ/giây</b><input id="es" type="range" min="0.5" max="12" step="0.5" value="4"></label>
      <div class="chips" id="estep"><span>Quay từng bước:</span><button class="chip" data-a="15">15°</button><button class="chip" data-a="30">30°</button><button class="chip" data-a="45">45°</button></div>
      <label>Góc nghiêng trục <b id="etv">23,5°</b><input id="et" type="range" min="0" max="45" step="0.5" value="23.5"></label>
      <label>Góc chiếu sáng của Mặt Trời <b id="eav">0°</b><input id="ea" type="range" min="-23.5" max="23.5" step="0.5" value="0"></label>
      <div class="chips" id="eview"><span>Góc nhìn:</span><button class="chip" data-v="def">Mặc định</button><button class="chip" data-v="n">Cực Bắc</button><button class="chip" data-v="eq">Xích đạo</button><button class="chip" data-v="s">Cực Nam</button></div>
      <div class="chips" id="elay"><span>Lớp hiển thị:</span></div>
      <div class="chips" id="ecity"><span>Địa điểm:</span></div>
      <div class="eout" id="eo"></div>
    </div>
    <div class="siminfo">Trái Đất tự quay quanh trục từ <b>Tây sang Đông</b>, một vòng hết khoảng <b>24 giờ</b>. Nửa hướng về Mặt Trời là <b>ban ngày</b>, nửa còn lại là <b>ban đêm</b>. Kéo để xoay góc nhìn, chụm hai ngón để thu phóng, chạm vào địa cầu để chọn địa điểm.</div>`;
  const q = s=>root.querySelector(s);
  let dead = false; const cleanup = [];
  loadScript("https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js", ()=>window.THREE)
    .then(()=>loadScript("https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js", ()=>window.THREE && THREE.OrbitControls))
    .then(()=>{ if(!dead) init(); })
    .catch(()=>{ const e = q("#el"); if(e) e.textContent = "Không tải được thư viện 3D. Hãy kiểm tra Internet rồi mở lại."; });

  function init(){
    const T = THREE, cv = q("canvas"), box = cv.parentNode, rad = d=>d*Math.PI/180, deg = r=>r*180/Math.PI;
    const renderer = new T.WebGLRenderer({canvas:cv, antialias:true});
    let pr = Math.min(window.devicePixelRatio||1, 2);
    renderer.setPixelRatio(pr); renderer.setClearColor(0x03061a, 1);
    const scene = new T.Scene(), camera = new T.PerspectiveCamera(42,1,.1,100);
    const CAM_DEF = new T.Vector3(0,1.1,3.5); camera.position.copy(CAM_DEF);
    const controls = new T.OrbitControls(camera, cv);
    controls.enableDamping = true; controls.dampingFactor = .08; controls.enablePan = false; controls.minDistance = 1.8; controls.maxDistance = 7;
    let tilt=23.5, sunDec=0, speed=4, dir=1, playing=true, anim=null, dirty=true, camGoal=null, cdrift=0, sel=0, custom=null;
    const sunDir = new T.Vector3(1,0,0);
    const sun = new T.DirectionalLight(0xfff3dc,1.25); scene.add(sun); scene.add(new T.AmbientLight(0x6070a0,.3));
    const latLon = (la,lo,R)=>{ const ph=rad(90-la), th=rad(lo+180); return new T.Vector3(-R*Math.sin(ph)*Math.cos(th), R*Math.cos(ph), R*Math.sin(ph)*Math.sin(th)); };
    const lonOf = v=>{ let a = deg(Math.atan2(v.z,-v.x)); if(a<0) a+=360; return a-180; };

    // Bản đồ dự phòng (vẽ bằng canvas) và bản đồ thật nếu tải được
    function earthTex(){
      const c = document.createElement("canvas"); c.width=1024; c.height=512; const g = c.getContext("2d");
      const X = lo=>(lo+180)/360*1024, Y = la=>(90-la)/180*512;
      const gr = g.createLinearGradient(0,0,0,512); gr.addColorStop(0,"#1f5fae"); gr.addColorStop(.5,"#2a7fd0"); gr.addColorStop(1,"#1f5fae");
      g.fillStyle = gr; g.fillRect(0,0,1024,512);
      const land = [
        [[-168,66],[-140,70],[-95,72],[-80,63],[-62,58],[-55,47],[-70,42],[-76,35],[-81,25],[-97,26],[-105,20],[-95,16],[-85,10],[-80,8],[-90,15],[-105,22],[-117,32],[-124,40],[-125,49],[-140,58],[-165,60]],
        [[-80,10],[-62,11],[-50,0],[-35,-6],[-40,-22],[-58,-38],[-66,-55],[-74,-50],[-72,-30],[-81,-5]],
        [[-10,36],[-9,43],[0,50],[10,56],[25,70],[60,70],[100,78],[140,72],[180,68],[170,60],[140,52],[142,46],[130,35],[122,30],[122,22],[108,18],[105,10],[100,2],[104,1],[98,8],[92,22],[80,10],[73,20],[67,25],[57,25],[48,30],[35,36],[28,36],[22,38],[15,40],[5,43]],
        [[-17,21],[-10,35],[10,37],[32,31],[43,12],[51,12],[40,-5],[40,-15],[33,-27],[20,-35],[12,-17],[9,4],[-8,5],[-17,14]],
        [[114,-22],[122,-18],[136,-12],[142,-11],[153,-27],[146,-39],[135,-35],[115,-34]],
        [[-55,60],[-45,60],[-20,70],[-20,82],[-60,82],[-70,76]]
      ];
      g.fillStyle = "#4f9f4a"; g.strokeStyle = "#3a7a3a"; g.lineWidth = 1.5;
      land.forEach(poly=>{ g.beginPath(); poly.forEach(([lo,la],i)=>i?g.lineTo(X(lo),Y(la)):g.moveTo(X(lo),Y(la))); g.closePath(); g.fill(); g.stroke(); });
      g.fillStyle = "#f2f6fb"; g.fillRect(0,0,1024,10); g.fillRect(0,Y(-68),1024,512-Y(-68));
      return new T.CanvasTexture(c);
    }
    function cloudTex(){
      const c = document.createElement("canvas"); c.width=512; c.height=256; const g = c.getContext("2d");
      for(let i=0;i<160;i++){
        const x=Math.random()*512, y=30+Math.random()*196, r=6+Math.random()*22, gr=g.createRadialGradient(x,y,0,x,y,r);
        gr.addColorStop(0,"rgba(255,255,255,.75)"); gr.addColorStop(1,"rgba(255,255,255,0)");
        g.fillStyle = gr; g.beginPath(); g.arc(x,y,r,0,Math.PI*2); g.fill();
      }
      return new T.CanvasTexture(c);
    }
    function label(txt,color){
      const c = document.createElement("canvas"); c.width=256; c.height=64; const g = c.getContext("2d");
      g.font = 'bold 34px "Times New Roman",serif'; g.textAlign = "center"; g.lineWidth = 5; g.strokeStyle = "rgba(0,0,0,.7)"; g.fillStyle = color;
      g.strokeText(txt,128,44); g.fillText(txt,128,44);
      const sp = new T.Sprite(new T.SpriteMaterial({map:new T.CanvasTexture(c), transparent:true, depthTest:false})); sp.scale.set(.75,.19,1); return sp;
    }

    // Trái Đất + trục nghiêng
    const tg = new T.Group(); tg.rotation.z = rad(tilt); scene.add(tg);
    const earth = new T.Mesh(new T.SphereGeometry(1,64,48), new T.MeshPhongMaterial({map:earthTex(), shininess:12, specular:0x222222}));
    tg.add(earth);
    try{
      const ld = new T.TextureLoader(); ld.setCrossOrigin("anonymous");
      const apply = t=>{ if(dead) return; earth.material.map = t; earth.material.needsUpdate = true; dirty = true; };
      ld.load("assets/img/earth.jpg", apply, undefined, ()=>ld.load("https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg", apply));
    }catch(e){}
    const clouds = new T.Mesh(new T.SphereGeometry(1.012,48,36), new T.MeshLambertMaterial({map:cloudTex(), transparent:true, opacity:.75, depthWrite:false}));
    tg.add(clouds);
    const atmo = new T.Mesh(new T.SphereGeometry(1.07,48,36), new T.ShaderMaterial({
      vertexShader:"varying vec3 vN;void main(){vN=normalize(normalMatrix*normal);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}",
      fragmentShader:"varying vec3 vN;void main(){float i=pow(max(0.0,0.72-dot(vN,vec3(0.0,0.0,1.0))),3.0);gl_FragColor=vec4(0.3,0.6,1.0,1.0)*i;}",
      side:T.BackSide, blending:T.AdditiveBlending, transparent:true, depthWrite:false}));
    scene.add(atmo);
    // kinh tuyến, vĩ tuyến, xích đạo
    const pos = [];
    const seg = (a,b)=>pos.push(a.x,a.y,a.z,b.x,b.y,b.z);
    for(let lo=-180;lo<180;lo+=30) for(let la=-90;la<90;la+=6) seg(latLon(la,lo,1.003), latLon(la+6,lo,1.003));
    for(let la=-60;la<=60;la+=30){ if(!la) continue; for(let lo=-180;lo<180;lo+=6) seg(latLon(la,lo,1.003), latLon(la,lo+6,1.003)); }
    const gg = new T.BufferGeometry(); gg.setAttribute("position", new T.Float32BufferAttribute(pos,3));
    const grat = new T.LineSegments(gg, new T.LineBasicMaterial({color:0xffffff, transparent:true, opacity:.35})); earth.add(grat);
    const eqp = []; for(let lo=0;lo<360;lo+=3) eqp.push(latLon(0,lo,1.005));
    const eq = new T.LineLoop(new T.BufferGeometry().setFromPoints(eqp), new T.LineBasicMaterial({color:0xff5a5a})); earth.add(eq);
    // trục, hai cực
    const axis = new T.Group(); tg.add(axis);
    axis.add(new T.Line(new T.BufferGeometry().setFromPoints([new T.Vector3(0,-1.6,0), new T.Vector3(0,1.6,0)]), new T.LineBasicMaterial({color:0xffe066})));
    [[1,0xff5a5f,"Cực Bắc","#ff9aa0"],[-1,0x4cc3ff,"Cực Nam","#9bdcff"]].forEach(([s,c,t,tc])=>{
      const m = new T.Mesh(new T.SphereGeometry(.03,12,10), new T.MeshBasicMaterial({color:c})); m.position.y = s*1.0; axis.add(m);
      const l = label(t,tc); l.position.y = s*1.3; axis.add(l);
    });
    // ranh giới ngày đêm, Mặt Trời, sao
    const cp = []; for(let i=0;i<128;i++){ const a=i/128*Math.PI*2; cp.push(new T.Vector3(1.006*Math.cos(a),1.006*Math.sin(a),0)); }
    const term = new T.LineLoop(new T.BufferGeometry().setFromPoints(cp), new T.LineBasicMaterial({color:0xffb347})); scene.add(term);
    const sc = document.createElement("canvas"); sc.width = sc.height = 128; const sg = sc.getContext("2d"), sgr = sg.createRadialGradient(64,64,0,64,64,64);
    sgr.addColorStop(0,"rgba(255,250,210,1)"); sgr.addColorStop(.3,"rgba(255,220,120,.6)"); sgr.addColorStop(1,"rgba(255,200,80,0)"); sg.fillStyle = sgr; sg.fillRect(0,0,128,128);
    const sunSp = new T.Sprite(new T.SpriteMaterial({map:new T.CanvasTexture(sc), blending:T.AdditiveBlending, transparent:true, depthWrite:false})); sunSp.scale.set(2.6,2.6,1); scene.add(sunSp);
    const sp = []; for(let i=0;i<700;i++){ const v = new T.Vector3(Math.random()-.5,Math.random()-.5,Math.random()-.5).normalize().multiplyScalar(30+Math.random()*30); sp.push(v.x,v.y,v.z); }
    const sg2 = new T.BufferGeometry(); sg2.setAttribute("position", new T.Float32BufferAttribute(sp,3));
    scene.add(new T.Points(sg2, new T.PointsMaterial({color:0xffffff, size:.12, sizeAttenuation:true, transparent:true, opacity:.8})));

    // địa điểm
    const CITIES = [{n:"Hà Nội",la:21.03,lo:105.85},{n:"Tokyo",la:35.68,lo:139.69},{n:"London",la:51.51,lo:-0.13},{n:"New York",la:40.71,lo:-74.0}];
    const marks = CITIES.map(c=>{ const m = new T.Mesh(new T.SphereGeometry(.02,12,10), new T.MeshBasicMaterial({color:0xffffff})); m.position.copy(latLon(c.la,c.lo,1.012)); earth.add(m); return m; });
    const cmark = new T.Mesh(new T.SphereGeometry(.02,12,10), new T.MeshBasicMaterial({color:0xffd23f})); cmark.visible = false; earth.add(cmark);
    function hilite(){ marks.forEach((m,i)=>{ const on = i===sel; m.material.color.set(on?0xffd23f:0xffffff); m.scale.setScalar(on?1.8:1); }); cmark.visible = sel===-1; cmark.scale.setScalar(1.8); dirty = true; }

    // Mặt Trời
    const Z = new T.Vector3(0,0,1);
    function setSun(){ sunDir.set(Math.cos(rad(sunDec)), Math.sin(rad(sunDec)), 0).normalize(); sun.position.copy(sunDir).multiplyScalar(10); term.quaternion.setFromUnitVectors(Z, sunDir); sunSp.position.copy(sunDir).multiplyScalar(7); dirty = true; }
    setSun();
    const qa = new T.Quaternion(), qb = new T.Quaternion();
    // bắt đầu với Hà Nội ở phía được chiếu sáng
    scene.updateMatrixWorld(true);
    let best = -2, rot0 = 0;
    for(let r=0;r<360;r+=5){ earth.rotation.y = rad(r); scene.updateMatrixWorld(true); const s = latLon(21.03,105.85,1).applyQuaternion(earth.getWorldQuaternion(qa)).dot(sunDir); if(s>best){ best = s; rot0 = r; } }
    earth.rotation.y = rad(rot0);

    // thông số hiển thị
    function readout(){
      const c = sel===-1 ? custom : CITIES[sel], out = q("#eo");
      if(!c){ out.textContent = "Chạm vào địa cầu hoặc chọn một địa điểm."; return; }
      scene.updateMatrixWorld(true);
      const n = latLon(c.la,c.lo,1).applyQuaternion(earth.getWorldQuaternion(qa)).normalize(), se = n.dot(sunDir);
      const axisW = new T.Vector3(0,1,0).applyQuaternion(tg.quaternion), rate = axisW.clone().cross(n).dot(sunDir)*dir;
      const st = se>.1 ? ["☀️","Ban ngày"] : se<-.1 ? ["🌙","Ban đêm"] : rate>0 ? ["🌅","Bình minh"] : ["🌇","Hoàng hôn"];
      const sl = sunDir.clone().applyQuaternion(earth.getWorldQuaternion(qb).invert()), lonS = lonOf(sl);
      const h = (((12+(c.lo-lonS)/15)%24)+24)%24, hh = Math.floor(h), mm = Math.floor((h-hh)*60);
      out.innerHTML = `<b>${c.n}</b> · ${Math.abs(c.la).toFixed(2)}° ${c.la>=0?"Bắc":"Nam"}, ${Math.abs(c.lo).toFixed(2)}° ${c.lo>=0?"Đông":"Tây"}<br>Giờ Mặt Trời địa phương: <b>${String(hh).padStart(2,"0")}:${String(mm).padStart(2,"0")}</b> · ${st[0]} <b>${st[1]}</b><br><small>Đây là giờ Mặt Trời, khác với giờ múi giờ hành chính.</small>`;
    }

    // điều khiển
    const on = (el,ev,fn)=>el.addEventListener(ev,fn);
    const setPlay = v=>{ playing = v; q("#ep").textContent = v ? "⏸ Tạm dừng" : "▶ Bắt đầu"; };
    on(q("#ep"),"click",()=>{ anim = null; setPlay(!playing); });
    on(q("#e1"),"click",()=>{ setPlay(false); anim = {remain:Math.PI*2, sgn:dir}; });
    on(q("#ed"),"click",()=>{ dir = -dir; q("#est").textContent = dir>0 ? "Hướng quay: Tây → Đông" : "Hướng quay: Đông → Tây (ngược với thực tế)"; });
    q("#estep").querySelectorAll("[data-a]").forEach(b=>on(b,"click",()=>{ setPlay(false); anim = {remain:rad(+b.dataset.a), sgn:dir}; }));
    on(q("#es"),"input",e=>{ speed = +e.target.value; q("#esv").textContent = speed+" giờ/giây"; });
    on(q("#et"),"input",e=>{ tilt = +e.target.value; tg.rotation.z = rad(tilt); q("#etv").textContent = String(tilt).replace(".",",")+"°"; dirty = true; });
    on(q("#ea"),"input",e=>{ sunDec = +e.target.value; q("#eav").textContent = String(sunDec).replace(".",",")+"°"; setSun(); });
    on(q("#er"),"click",()=>{
      earth.rotation.y = rad(rot0); cdrift = 0; clouds.rotation.y = earth.rotation.y; dir = 1; anim = null; setPlay(true);
      tilt = 23.5; sunDec = 0; speed = 4; tg.rotation.z = rad(tilt);
      q("#es").value = 4; q("#et").value = 23.5; q("#ea").value = 0;
      q("#esv").textContent = "4 giờ/giây"; q("#etv").textContent = "23,5°"; q("#eav").textContent = "0°"; q("#est").textContent = "Hướng quay: Tây → Đông";
      camGoal = CAM_DEF.clone(); setSun();
    });
    q("#eview").querySelectorAll("[data-v]").forEach(b=>on(b,"click",()=>{
      const ax = new T.Vector3(0,1,0).applyQuaternion(tg.quaternion), v = b.dataset.v;
      camGoal = v==="n" ? ax.multiplyScalar(3.3) : v==="s" ? ax.multiplyScalar(-3.3) : v==="eq" ? new T.Vector3(0,0,3.4) : CAM_DEF.clone();
    }));
    const LAY = [["Trục",axis],["Kinh vĩ tuyến",grat],["Xích đạo",eq],["Ranh giới ngày đêm",term],["Khí quyển",atmo],["Mây",clouds]];
    LAY.forEach(([n,o])=>{ const b = document.createElement("button"); b.className = "chip on"; b.textContent = n; on(b,"click",()=>{ o.visible = !o.visible; b.classList.toggle("on",o.visible); dirty = true; }); q("#elay").appendChild(b); });
    const cityBtns = CITIES.map((c,i)=>{ const b = document.createElement("button"); b.className = "chip"+(i===0?" on":""); b.textContent = c.n; on(b,"click",()=>{ sel = i; syncCity(); }); q("#ecity").appendChild(b); return b; });
    function syncCity(){ cityBtns.forEach((b,i)=>b.classList.toggle("on",i===sel)); hilite(); readout(); }
    hilite();
    // chạm vào địa cầu để chọn vị trí
    const ray = new T.Raycaster(), ndc = new T.Vector2(); let pd = null;
    on(cv,"pointerdown",e=>{ pd = {x:e.clientX, y:e.clientY, t:performance.now()}; });
    on(cv,"pointerup",e=>{
      if(!pd) return;
      if(Math.hypot(e.clientX-pd.x, e.clientY-pd.y)<6 && performance.now()-pd.t<400){
        const r = cv.getBoundingClientRect(); ndc.set(((e.clientX-r.left)/r.width)*2-1, -((e.clientY-r.top)/r.height)*2+1);
        ray.setFromCamera(ndc,camera); const hit = ray.intersectObject(earth,false)[0];
        if(hit){
          const lp = earth.worldToLocal(hit.point.clone()).normalize(), la = deg(Math.asin(lp.y)), lo = lonOf(lp);
          custom = {n:"Vị trí đã chọn", la, lo}; sel = -1; cmark.position.copy(latLon(la,lo,1.012)); syncCity();
        }
      }
      pd = null;
    });

    function resize(){ const w = box.clientWidth||320; renderer.setSize(w,w,false); camera.aspect = 1; camera.updateProjectionMatrix(); dirty = true; }
    const ro = window.ResizeObserver ? new ResizeObserver(resize) : null; if(ro) ro.observe(box); resize();
    const el = q("#el"); if(el) el.remove();
    controls.addEventListener("change",()=>{ dirty = true; });

    let last = performance.now(), raf = 0, infoT = 1, slow = 0;
    function frame(now){
      raf = requestAnimationFrame(frame); if(dead) return;
      const dt = Math.min(.05,(now-last)/1000); last = now;
      let d = 0;
      if(anim){ const m = Math.min(anim.remain, rad(100)*dt); d = anim.sgn*m; anim.remain -= m; if(anim.remain<1e-5) anim = null; }
      else if(playing) d = dir*speed*rad(15)*dt;
      if(d){ earth.rotation.y += d; cdrift += .02*dt; clouds.rotation.y = earth.rotation.y+cdrift; dirty = true; }
      if(camGoal){ camera.position.lerp(camGoal, Math.min(1,dt*6)); if(camera.position.distanceTo(camGoal)<.01) camGoal = null; dirty = true; }
      if(controls.update()) dirty = true;
      if(dirty){
        renderer.render(scene,camera); dirty = false;
        if(dt>.034){ if(++slow>45 && pr>1){ pr = 1; renderer.setPixelRatio(1); resize(); } } else slow = Math.max(0,slow-1);
      }
      infoT += dt; if(infoT>.12){ infoT = 0; readout(); }
    }
    raf = requestAnimationFrame(frame);
    cleanup.push(()=>{
      cancelAnimationFrame(raf); if(ro) ro.disconnect(); controls.dispose();
      scene.traverse(o=>{ if(o.geometry) o.geometry.dispose(); if(o.material){ if(o.material.map) o.material.map.dispose(); o.material.dispose(); } });
      renderer.dispose(); if(renderer.forceContextLoss) renderer.forceContextLoss();
    });
  }
  return { destroy(){ dead = true; cleanup.forEach(f=>{ try{ f(); }catch(e){} }); } };
}

