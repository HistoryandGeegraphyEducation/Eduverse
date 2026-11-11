// ---------- MO PHONG DONG DAT 3D ----------
function simQuake(root){
  root.classList.add("quake3d-root");
  root.innerHTML = `
    <style>
      .quake3d-root{display:grid;grid-template-columns:minmax(0,1fr);gap:12px}
      .quake3d-root .q3-stage{position:relative;min-width:0;overflow:hidden;border-radius:18px;background:#091d32;border:1px solid rgba(255,255,255,.55);box-shadow:0 8px 18px rgba(6,50,120,.2)}
      .quake3d-root .q3-canvas{display:block;width:100%;height:clamp(300px,62vw,500px);touch-action:none;outline:none}
      .quake3d-root .q3-loading{position:absolute;inset:0;display:grid;place-items:center;padding:20px;color:#fff;text-align:center;background:rgba(3,17,39,.82);z-index:2}
      .quake3d-root .q3-loading[hidden]{display:none}
      .quake3d-root .q3-hud{position:absolute;top:10px;left:10px;right:10px;display:flex;justify-content:space-between;gap:8px;pointer-events:none}
      .quake3d-root .q3-tag{padding:6px 9px;border-radius:9px;background:rgba(3,20,43,.8);color:#fff;font-size:11px;font-weight:800}
      .quake3d-root .q3-legend{position:absolute;bottom:10px;left:10px;display:flex;flex-wrap:wrap;gap:6px;pointer-events:none}
      .quake3d-root .q3-legend span{padding:5px 7px;border-radius:7px;background:rgba(3,20,43,.8);color:#fff;font-size:10px}
      .quake3d-root .q3-controls{display:flex;flex-direction:column;gap:11px;padding:13px;border-radius:18px;background:linear-gradient(180deg,#fff,#eaf0ff);color:#142b62;box-shadow:0 6px 14px rgba(6,50,120,.16)}
      .quake3d-root .q3-section{padding-bottom:10px;border-bottom:1px solid #d9e0f1}
      .quake3d-root .q3-section:last-child{padding:0;border:0}
      .quake3d-root .q3-label{margin:0 0 7px;color:#344879;font-size:12px;font-weight:800}
      .quake3d-root .q3-range{display:block;margin:9px 0}
      .quake3d-root .q3-range div{display:flex;justify-content:space-between;gap:8px;margin-bottom:4px;color:#35466d;font-size:12px}
      .quake3d-root .q3-range b{color:#123d83;font-variant-numeric:tabular-nums}
      .quake3d-root input[type=range]{display:block;width:100%;margin:0;accent-color:#1768a9}
      .quake3d-root .q3-actions,.quake3d-root .q3-views{display:flex;flex-wrap:wrap;gap:6px}
      .quake3d-root button{flex:1;min-width:78px;border:0;border-radius:10px;padding:9px 10px;background:#e5ebfa;color:#263d76;font-size:12px;font-weight:800}
      .quake3d-root button.q3-primary{background:#1266a7;color:#fff}
      .quake3d-root button.q3-active{background:#173f83;color:#fff}
      .quake3d-root .q3-readout{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:7px}
      .quake3d-root .q3-metric{min-width:0;padding:8px 9px;border-radius:10px;background:#f1f4fb}
      .quake3d-root .q3-metric small{display:block;margin-bottom:3px;color:#64708c;font-size:10px}
      .quake3d-root .q3-metric strong{display:block;overflow:hidden;color:#173d78;font-size:14px;text-overflow:ellipsis;white-space:nowrap}
      .quake3d-root .q3-info{padding:12px 14px;border-radius:16px;background:rgba(255,255,255,.96);color:#27324b;font-size:13px;line-height:1.55;box-shadow:0 4px 10px rgba(6,50,120,.12)}
      .quake3d-root .q3-info strong{color:#173d78}
      @media(min-width:820px){.quake3d-root{grid-template-columns:minmax(0,1.5fr) minmax(260px,.8fr);grid-template-areas:"stage controls" "info controls";align-items:start}.quake3d-root .q3-stage{grid-area:stage}.quake3d-root .q3-controls{grid-area:controls}.quake3d-root .q3-info{grid-area:info}.quake3d-root .q3-canvas{height:490px}}
    </style>
    <div class="q3-stage">
      <canvas class="q3-canvas" aria-label="Mô hình 3D cấu trúc vỏ Trái Đất và động đất"></canvas>
      <div class="q3-loading">Đang khởi tạo mô hình 3D…</div>
      <div class="q3-hud"><span class="q3-tag">MẶT CẮT CẤU TRÚC VỎ TRÁI ĐẤT</span><span class="q3-tag" data-role="clock">TRẠNG THÁI TĨNH</span></div>
      <div class="q3-legend"><span>● Mảng kiến tạo</span><span>● Mặt đứt gãy</span><span>● Chấn tiêu</span><span>● Sóng địa chấn</span></div>
    </div>
    <div class="q3-controls">
      <section class="q3-section">
        <div class="q3-label">THÔNG SỐ ĐỘNG ĐẤT</div>
        <label class="q3-range"><div><span>Độ lớn động đất</span><b data-value="magnitude">6,0 Mw</b></div><input data-param="magnitude" type="range" min="3" max="9.5" step=".1" value="6"></label>
        <label class="q3-range"><div><span>Độ sâu chấn tiêu</span><b data-value="depth">20 km</b></div><input data-param="depth" type="range" min="5" max="60" step="1" value="20"></label>
        <label class="q3-range"><div><span>Độ trượt mô hình</span><b data-value="slip">2,0 m</b></div><input data-param="slip" type="range" min=".2" max="8" step=".1" value="2"></label>
      </section>
      <section class="q3-section">
        <div class="q3-label">ĐIỀU KHIỂN MÔ PHỎNG</div>
        <div class="q3-actions"><button class="q3-primary" data-action="trigger">▶ Gây động đất</button><button data-action="reset">↺ Đặt lại</button><button data-action="labels">Tên gọi: Bật</button></div>
      </section>
      <section class="q3-section">
        <div class="q3-label">GÓC QUAN SÁT</div>
        <div class="q3-views"><button class="q3-active" data-view="section">Mặt cắt</button><button data-view="surface">Bề mặt</button><button data-view="fault">Đứt gãy</button></div>
      </section>
      <section>
        <div class="q3-label">THÔNG TIN HIỆN TƯỢNG</div>
        <div class="q3-readout">
          <div class="q3-metric"><small>Vị trí nguồn phát</small><strong data-stat="focus">20 km</strong></div>
          <div class="q3-metric"><small>Sóng địa chấn</small><strong data-stat="wave">Chưa phát</strong></div>
          <div class="q3-metric"><small>Độ lớn</small><strong data-stat="magnitude">6,0 Mw</strong></div>
          <div class="q3-metric"><small>Trạng thái</small><strong data-stat="status">Ổn định</strong></div>
        </div>
      </section>
    </div>
    <div class="q3-info"><strong>Chấn tiêu</strong> là nơi bắt đầu sự phá vỡ và trượt đột ngột trên đứt gãy bên trong Trái Đất. <strong>Chấn tâm</strong> là điểm trên bề mặt nằm thẳng đứng phía trên chấn tiêu. Năng lượng giải phóng truyền đi dưới dạng sóng địa chấn. Mô hình minh họa cơ chế đứt gãy và sự lan truyền của sóng; kích thước, độ trượt và tốc độ hoạt ảnh không theo tỉ lệ thực.</div>
  `;

  const $=s=>root.querySelector(s),canvas=$(".q3-canvas"),loading=$(".q3-loading");
  const state={magnitude:6,depth:20,slip:2,elapsed:0,playing:false,showLabels:true,dead:false,last:0,view:"section"};
  let T=null,renderer=null,scene=null,camera=null,controls=null,raf=0,resizeObs=null,resizeFn=null;
  let plateLeft=null,plateRight=null,rupture=null,focus=null,epicenter=null,sourceGlow=null,houseGroup=null;
  const waveShells=[],surfaceWaves=[],labels=[],geometries=[],materials=[];
  const V=(x,y,z)=>new T.Vector3(x,y,z);
  function material(color,opts={}){const m=new T.MeshStandardMaterial({color,roughness:.82,...opts});materials.push(m);return m;}
  function mesh(geo,mat,parent=scene){geometries.push(geo);const o=new T.Mesh(geo,mat);parent.add(o);return o;}
  function label(text,pos,scale=1){
    const c=document.createElement("canvas");c.width=512;c.height=128;
    const g=c.getContext("2d");g.fillStyle="rgba(4,20,38,.82)";g.fillRect(8,15,496,98);
    g.font="bold 34px Arial,sans-serif";g.textAlign="center";g.textBaseline="middle";g.fillStyle="#fff";g.fillText(text,256,64,470);
    const tex=new T.CanvasTexture(c),mat=new T.SpriteMaterial({map:tex,transparent:true,depthTest:false,depthWrite:false});
    materials.push(mat);const s=new T.Sprite(mat);s.position.copy(pos);s.scale.set(7.2*scale,1.8*scale,1);scene.add(s);labels.push(s);return s;
  }
  function makeLayers(){
    const width=52,depth=24,nx=96,nz=44;
    const surface=(x,z)=>.34*Math.sin(x*.16)*Math.cos(z*.2)+.12*Math.sin(x*.43+z*.17);
    const layers=[
      {base:-.25,thick:2.1,color:0x9b7955},
      {base:-2.35,thick:2.2,color:0x826b58},
      {base:-4.65,thick:2.3,color:0x6d5b5a},
      {base:-7.05,thick:2.5,color:0x574b5c},
      {base:-9.65,thick:2.8,color:0x493f50}
    ];
    function geologicalSheet(base,amplitude,color){
      const g=new T.PlaneGeometry(width,depth,nx,nz);g.rotateX(-Math.PI/2);
      const p=g.attributes.position;
      for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i);p.setY(i,base+surface(x,z)*amplitude);}
      g.computeVertexNormals();
      const m=mesh(g,material(color,{side:T.DoubleSide,roughness:1}));
      return m;
    }
    // Các tầng đá uốn lượn theo địa hình, có mặt cắt lộ ra ở phía trước.
    layers.forEach((l,i)=>{
      geologicalSheet(l.base,l.thick*.12,l.color);
      const edge=mesh(new T.BoxGeometry(width,l.thick*.78,.16),material([0xb18a61,0x9c846d,0x827477,0x716579,0x62566b][i]));
      edge.position.set(0,l.base-l.thick*.45,depth/2);
    });
    const topGeo=new T.PlaneGeometry(width,depth,nx,nz);topGeo.rotateX(-Math.PI/2);
    const tp=topGeo.attributes.position,cols=[];
    const grass=new T.Color(0x52764b),rock=new T.Color(0x9a8668);
    for(let i=0;i<tp.count;i++){
      const x=tp.getX(i),z=tp.getZ(i),h=surface(x,z);
      tp.setY(i,.42+h);
      const c=grass.clone().lerp(rock,Math.max(0,Math.min(1,(h+.3)*.85)));
      cols.push(c.r,c.g,c.b);
    }
    topGeo.setAttribute("color",new T.Float32BufferAttribute(cols,3));topGeo.computeVertexNormals();
    mesh(topGeo,new T.MeshStandardMaterial({vertexColors:true,roughness:1,side:T.DoubleSide}));
    // Mặt đứt gãy nghiêng cắt qua toàn bộ các tầng đá.
    const faultGeo=new T.PlaneGeometry(13,11,16,16);faultGeo.rotateY(-.35);faultGeo.rotateX(-.12);
    const fp=faultGeo.attributes.position;
    for(let i=0;i<fp.count;i++){const x=fp.getX(i),y=fp.getY(i);fp.setZ(i,.08*Math.sin(x*1.3+y*.8));}
    faultGeo.computeVertexNormals();
    rupture=mesh(faultGeo,material(0x332d2c,{side:T.DoubleSide,roughness:1}));
    rupture.position.set(0,-5.1,0);
    plateLeft=new T.Group();plateRight=new T.Group();scene.add(plateLeft,plateRight);
    function plate(group,x0,x1,color){
      const g=new T.PlaneGeometry(x1-x0,depth*.98,48,32);g.rotateX(-Math.PI/2);
      const p=g.attributes.position;
      for(let i=0;i<p.count;i++){const x=p.getX(i)+(x0+x1)/2,z=p.getZ(i);p.setY(i,.48+surface(x,z));}
      g.computeVertexNormals();
      const top=mesh(g,material(color,{roughness:.95,side:T.DoubleSide}),group);
      top.position.x=(x0+x1)/2;
      const side=mesh(new T.BoxGeometry(x1-x0,8.5,.22),material(color===0x68865a?0x80694f:0x6d5d56),group);
      side.position.set((x0+x1)/2,-4.2,depth/2);
    }
    plate(plateLeft,-26,-.48,0x68865a);plate(plateRight,.48,26,0x71805b);
    // Vệt địa tầng lộ trên mặt cắt, hơi uốn theo bề mặt.
    layers.forEach((l,i)=>{
      const pts=[];for(let x=-26;x<=26;x+=.35)pts.push(V(x,l.base+surface(x,depth/2)*.12,depth/2+.12));
      const line=new T.Line(new T.BufferGeometry().setFromPoints(pts),new T.LineBasicMaterial({color:[0xd2ad7b,0xc2a17b,0xa28a83,0x8a7e8c,0x74687c][i],transparent:true,opacity:.9}));
      scene.add(line);geometries.push(line.geometry);materials.push(line.material);
    });
    houseGroup=new T.Group();scene.add(houseGroup);
    for(let i=0;i<8;i++){
      const x=-23+i*6,z=(i%2?5:-5),h=1.3+(i%3)*.5,y=.55+surface(x,z);
      const body=mesh(new T.BoxGeometry(1.8,h,1.7),material(i%2?0xe0d8c9:0xd5e0e8),houseGroup);
      body.position.set(x,y+h/2,z);
      const roof=mesh(new T.ConeGeometry(1.35,.72,4),material(0x985b48),houseGroup);
      roof.position.set(x,y+h+.36,z);roof.rotation.y=Math.PI/4;
    }
    focus=new T.Group();scene.add(focus);
    mesh(new T.SphereGeometry(.52,24,18),material(0xff4c35,{emissive:0x8d1608,emissiveIntensity:.8}),focus);
    sourceGlow=mesh(new T.SphereGeometry(1.05,24,18),new T.MeshBasicMaterial({color:0xff6a35,wireframe:true,transparent:true,opacity:.42}),focus);
    epicenter=mesh(new T.SphereGeometry(.32,20,14),material(0xffd34e,{emissive:0x8a5b00,emissiveIntensity:.6}));
    epicenter.position.set(-.8,.82,0);
    for(let i=0;i<5;i++){
      const m=new T.MeshBasicMaterial({color:i%2?0x8ce7ff:0xffdc70,wireframe:true,transparent:true,opacity:.4,depthWrite:false});
      const s=mesh(new T.SphereGeometry(1,32,22),m);s.visible=false;waveShells.push(s);
    }
    for(let i=0;i<4;i++){
      const m=new T.MeshBasicMaterial({color:0xffe28a,transparent:true,opacity:.8,side:T.DoubleSide,depthWrite:false});
      const ring=mesh(new T.RingGeometry(.94,1,96),m);ring.rotation.x=-Math.PI/2;ring.position.y=.76;ring.visible=false;surfaceWaves.push(ring);
    }
  }
  function addLabels(){
    label("MẢNG ĐÁ PHÍA TÂY",V(-17,2.2,-13),.78);
    label("MẢNG ĐÁ PHÍA ĐÔNG",V(17,2.2,-13),.78);
    label("MẶT ĐỨT GÃY",V(3,-3.4,12),.78);
    label("CHẤN TIÊU",V(-1,-5.2,3),.72);
    label("CHẤN TÂM",V(1,2.4,3),.72);
    label("SÓNG ĐỊA CHẤN",V(-17,-1.4,12),.72);
  }
  function positionFocus(){
    const y=-Math.max(.8,Math.min(7.6,state.depth/8));
    focus.position.set(-.8,y,0);epicenter.position.set(-.8,.42,0);
    waveShells.forEach(o=>o.position.copy(focus.position));
    surfaceWaves.forEach(o=>o.position.x=-.8);
  }
  function updateValues(){
    const fmt=(n,d=1)=>Number(n).toLocaleString("vi-VN",{minimumFractionDigits:d,maximumFractionDigits:d});
    $("[data-value=magnitude]").textContent=fmt(state.magnitude,1)+" Mw";
    $("[data-value=depth]").textContent=state.depth+" km";
    $("[data-value=slip]").textContent=fmt(state.slip,1)+" m";
    $("[data-stat=focus]").textContent=state.depth+" km";
    $("[data-stat=magnitude]").textContent=fmt(state.magnitude,1)+" Mw";
    $("[data-stat=wave]").textContent=state.elapsed>0?"Đang lan truyền":"Chưa phát";
    $("[data-stat=status]").textContent=state.playing?"Đang giải phóng năng lượng":state.elapsed>0?"Đã phát sóng":"Ổn định";
    $("[data-role=clock]").textContent=state.playing?"ĐANG LAN TRUYỀN":"TRẠNG THÁI TĨNH";
  }
  function reset(){
    state.elapsed=0;state.playing=false;state.magnitude=6;state.depth=20;state.slip=2;
    root.querySelectorAll("[data-param]").forEach(el=>el.value=state[el.dataset.param]);
    plateLeft.position.set(0,0,0);plateRight.position.set(0,0,0);houseGroup.position.set(0,0,0);
    waveShells.forEach(o=>o.visible=false);surfaceWaves.forEach(o=>o.visible=false);
    positionFocus();updateValues();renderOnce();
  }
  function trigger(){
    state.elapsed=0;state.playing=true;state.last=performance.now();
    waveShells.forEach((o,i)=>{o.visible=true;o.scale.setScalar(.1+i*.12);});
    surfaceWaves.forEach(o=>{o.visible=true;o.scale.set(.1,.1,1);});
    updateValues();try{if(navigator.vibrate)navigator.vibrate([45,55,45]);}catch(e){}
    if(!raf)raf=requestAnimationFrame(animate);
  }
  function animate(now){
    raf=0;if(state.dead)return;
    const dt=Math.min(.05,Math.max(0,(now-(state.last||now))/1000));state.last=now;
    if(state.playing){
      state.elapsed+=dt;
      const strength=Math.max(0,state.magnitude-3)/6.5,ramp=Math.min(1,state.elapsed/.55),offset=state.slip*.12*strength*ramp;
      plateLeft.position.x=-offset*.5;plateRight.position.x=offset*.5;
      plateLeft.position.y=Math.sin(state.elapsed*18)*.035*strength;plateRight.position.y=-Math.sin(state.elapsed*18)*.035*strength;
      houseGroup.position.y=Math.sin(state.elapsed*22)*.025*strength;
      waveShells.forEach((o,i)=>{const speed=i%2?3.1:5.2;const radius=Math.max(.1,(state.elapsed-i*.24)*speed);o.scale.set(radius,radius*.78,radius);o.material.opacity=Math.max(0,.5-radius/42);});
      surfaceWaves.forEach((o,i)=>{const radius=Math.max(.1,(state.elapsed-i*.42)*6.4);o.scale.set(radius,radius,1);o.material.opacity=Math.max(0,.8-radius/48);});
      sourceGlow.scale.setScalar(1+.28*Math.sin(state.elapsed*14));
      if(state.elapsed>8){state.playing=false;updateValues();}
      if(Math.floor(now/160)!==Math.floor((now-dt*1000)/160))updateValues();
    }
    controls.update();renderer.render(scene,camera);if(state.playing)raf=requestAnimationFrame(animate);
  }
  function renderOnce(){if(renderer&&scene&&camera){controls.update();renderer.render(scene,camera);}}
  function resize(){if(!renderer||!camera)return;const w=Math.max(1,canvas.clientWidth),h=Math.max(1,canvas.clientHeight);renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();renderOnce();}
  function setView(view){
    state.view=view;const views={section:{p:[34,25,46],t:[0,-3,0]},surface:{p:[0,43,54],t:[0,-1,0]},fault:{p:[17,8,24],t:[0,-4,0]}};
    const v=views[view]||views.section;camera.position.set(...v.p);controls.target.set(...v.t);controls.update();
    root.querySelectorAll("[data-view]").forEach(b=>b.classList.toggle("q3-active",b.dataset.view===view));renderOnce();
  }
  function init(){
    if(state.dead)return;
    if(!window.THREE||!THREE.OrbitControls){loading.textContent="Không tải được Three.js hoặc OrbitControls. Kiểm tra kết nối Internet rồi mở lại mô hình.";return;}
    T=THREE;
    try{
      renderer=new T.WebGLRenderer({canvas,antialias:true,alpha:false,powerPreference:"low-power"});renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.5));renderer.setClearColor(0x9ac8dc,1);
      scene=new T.Scene();scene.background=new T.Color(0x9ac8dc);scene.fog=new T.Fog(0x9ac8dc,75,140);
      camera=new T.PerspectiveCamera(43,1,.1,180);camera.position.set(34,25,46);
      controls=new T.OrbitControls(camera,canvas);controls.enableDamping=true;controls.dampingFactor=.07;controls.target.set(0,-3,0);controls.minDistance=15;controls.maxDistance=110;controls.maxPolarAngle=Math.PI*.92;
      scene.add(new T.HemisphereLight(0xe4f6ff,0x55463c,1.35));const sun=new T.DirectionalLight(0xfff1d7,1.25);sun.position.set(-25,38,25);scene.add(sun);
      makeLayers();addLabels();positionFocus();
      const grid=new T.GridHelper(52,26,0x748d96,0x748d96);grid.position.y=-8.25;grid.material.transparent=true;grid.material.opacity=.18;scene.add(grid);
      loading.hidden=true;resize();setView("section");resizeFn=resize;window.addEventListener("resize",resizeFn);
      if(window.ResizeObserver){resizeObs=new ResizeObserver(resize);resizeObs.observe(canvas.parentElement);}renderOnce();
    }catch(err){loading.textContent="Không thể khởi tạo WebGL trên thiết bị này. Hãy thử trình duyệt hỗ trợ WebGL.";loading.hidden=false;}
  }
  root.querySelectorAll("[data-param]").forEach(el=>el.addEventListener("input",()=>{state[el.dataset.param]=Number(el.value);if(el.dataset.param==="depth")positionFocus();updateValues();renderOnce();}));
  $("[data-action=trigger]").addEventListener("click",trigger);$("[data-action=reset]").addEventListener("click",reset);
  $("[data-action=labels]").addEventListener("click",e=>{state.showLabels=!state.showLabels;labels.forEach(o=>o.visible=state.showLabels);e.currentTarget.textContent="Tên gọi: "+(state.showLabels?"Bật":"Tắt");renderOnce();});
  root.querySelectorAll("[data-view]").forEach(b=>b.addEventListener("click",()=>setView(b.dataset.view)));
  function destroy(){
    if(state.dead)return;state.dead=true;cancelAnimationFrame(raf);
    if(resizeFn)window.removeEventListener("resize",resizeFn);if(resizeObs)resizeObs.disconnect();if(controls)controls.dispose();
    if(scene)scene.traverse(o=>{if(o.geometry&&!geometries.includes(o.geometry))o.geometry.dispose();if(o.material){const list=Array.isArray(o.material)?o.material:[o.material];list.forEach(m=>{if(m.map&&m.map.dispose)m.map.dispose();if(!materials.includes(m))m.dispose();});}});
    geometries.forEach(g=>g.dispose());materials.forEach(m=>{if(m.map&&m.map.dispose)m.map.dispose();m.dispose();});
    if(renderer){renderer.dispose();renderer.forceContextLoss();}root.classList.remove("quake3d-root");
  }
  init();return {destroy};
}
