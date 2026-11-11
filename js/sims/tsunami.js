// ---------- MO PHONG SONG THAN 3D ----------
function simTsunami(root){
  root.classList.add("tsunami-root");
  root.innerHTML = `
    <style>
      .tsunami-root{display:grid;grid-template-columns:minmax(0,1fr);gap:12px}
      .tsunami-root .ts-stage{position:relative;min-width:0;border-radius:18px;overflow:hidden;background:#061b35;border:1px solid rgba(255,255,255,.55);box-shadow:0 8px 18px rgba(6,50,120,.25)}
      .tsunami-root .ts-canvas{display:block;width:100%;height:clamp(270px,58vw,490px);touch-action:none;outline:none}
      .tsunami-root .ts-loading{position:absolute;inset:0;display:grid;place-items:center;padding:20px;color:#fff;text-align:center;background:rgba(3,17,39,.78);font-size:14px;z-index:2}
      .tsunami-root .ts-loading[hidden]{display:none}
      .tsunami-root .ts-overlay{position:absolute;left:10px;right:10px;top:10px;display:flex;justify-content:space-between;gap:8px;pointer-events:none}
      .tsunami-root .ts-tag{padding:6px 9px;border-radius:9px;background:rgba(3,20,43,.76);color:#fff;font-size:12px;font-weight:700;letter-spacing:.2px}
      .tsunami-root .ts-legend{position:absolute;left:10px;bottom:10px;display:flex;gap:6px;flex-wrap:wrap;pointer-events:none}
      .tsunami-root .ts-legend span{font-size:11px;color:#fff;background:rgba(3,20,43,.76);padding:5px 7px;border-radius:7px}
      .tsunami-root .ts-controls{display:flex;flex-direction:column;gap:11px;background:linear-gradient(180deg,#fff,#eaf0ff);border-radius:18px;padding:13px;color:var(--deep,#142b62);box-shadow:0 6px 14px rgba(6,50,120,.2)}
      .tsunami-root .ts-section{border-bottom:1px solid #d9e0f1;padding-bottom:10px}
      .tsunami-root .ts-section:last-child{border:0;padding-bottom:0}
      .tsunami-root .ts-label{font-size:13px;font-weight:800;color:#344879;margin:0 0 7px}
      .tsunami-root .ts-modes,.tsunami-root .ts-actions,.tsunami-root .ts-views{display:flex;gap:6px;flex-wrap:wrap}
      .tsunami-root .ts-modes button,.tsunami-root .ts-actions button,.tsunami-root .ts-views button{border:0;border-radius:10px;padding:8px 10px;background:#e5ebfa;color:#263d76;font-size:12px;font-weight:700;flex:1;min-width:74px}
      .tsunami-root button.ts-active{background:#173f83;color:#fff}
      .tsunami-root .ts-actions button.ts-primary{background:#1266a7;color:#fff}
      .tsunami-root .ts-range{display:block;margin:9px 0 11px}
      .tsunami-root .ts-range:last-child{margin-bottom:0}
      .tsunami-root .ts-range div{display:flex;justify-content:space-between;gap:8px;font-size:12px;color:#35466d;margin-bottom:4px}
      .tsunami-root .ts-range b{color:#123d83;font-variant-numeric:tabular-nums}
      .tsunami-root input[type=range]{display:block;width:100%;margin:0;accent-color:#1768a9}
      .tsunami-root .ts-readout{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:7px}
      .tsunami-root .ts-metric{background:#f1f4fb;border-radius:10px;padding:8px 9px;min-width:0}
      .tsunami-root .ts-metric small{display:block;font-size:10px;color:#64708c;margin-bottom:3px}
      .tsunami-root .ts-metric strong{display:block;font-size:15px;color:#173d78;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-variant-numeric:tabular-nums}
      .tsunami-root .ts-explain{background:rgba(255,255,255,.94);border-radius:16px;padding:12px 14px;color:#27324b;font-size:13px;line-height:1.5;box-shadow:0 4px 10px rgba(6,50,120,.16)}
      .tsunami-root .ts-explain strong{color:#173d78}
      .tsunami-root .ts-foot{font-size:11px;color:#65718b;line-height:1.4;margin-top:6px}
      @media(min-width:820px){.tsunami-root{grid-template-columns:minmax(0,1.5fr) minmax(270px,.8fr);grid-template-areas:"stage controls" "info controls";align-items:start}.tsunami-root .ts-stage{grid-area:stage}.tsunami-root .ts-controls{grid-area:controls}.tsunami-root .ts-explain{grid-area:info}.tsunami-root .ts-canvas{height:480px}}
    </style>
    <div class="ts-stage">
      <canvas class="ts-canvas" aria-label="Mô phỏng 3D sóng thần"></canvas>
      <div class="ts-loading">Đang tải mô hình 3D…</div>
      <div class="ts-overlay"><span class="ts-tag" data-role="mode-tag">GIAI ĐOẠN 1 · HÌNH THÀNH</span><span class="ts-tag" data-role="clock">0,0 s</span></div>
      <div class="ts-legend"><span>● Đáy đại dương</span><span>● Mặt sóng</span><span>● Vùng ngập minh họa</span></div>
    </div>
    <div class="ts-controls">
      <section class="ts-section"><div class="ts-label">GIAI ĐOẠN MÔ PHỎNG</div><div class="ts-modes">
        <button data-mode="0" class="ts-active">Hình thành</button><button data-mode="1">Ngoài khơi</button><button data-mode="2">Tiến vào bờ</button><button data-mode="3">Tác động</button><button data-mode="4">Phòng tránh</button>
      </div></section>
      <section class="ts-section"><div class="ts-label">THÔNG SỐ NGUỒN SÓNG</div>
        <label class="ts-range"><div><span>Độ sâu vùng phát sinh</span><b data-value="depth">4.000 m</b></div><input data-param="depth" type="range" min="1000" max="6000" step="100" value="4000"></label>
        <label class="ts-range"><div><span>Cường độ động đất</span><b data-value="magnitude">7,8 Mw</b></div><input data-param="magnitude" type="range" min="6" max="9.5" step="0.1" value="7.8"></label>
        <label class="ts-range"><div><span>Dịch chuyển đáy biển</span><b data-value="shift">3,0 m</b></div><input data-param="shift" type="range" min="0.5" max="12" step="0.5" value="3"></label>
      </section>
      <section class="ts-section"><div class="ts-label">ĐỊA HÌNH VÀ MỰC NƯỚC</div>
        <label class="ts-range"><div><span>Độ dốc thềm lục địa</span><b data-value="slope">Trung bình</b></div><input data-param="slope" type="range" min="1" max="5" step="1" value="3"></label>
        <label class="ts-range"><div><span>Mực nước biển</span><b data-value="sea">0,0 m</b></div><input data-param="sea" type="range" min="-1" max="2" step="0.1" value="0"></label>
        <label class="ts-range"><div><span>Tốc độ phát mô phỏng</span><b data-value="speed">1,0×</b></div><input data-param="speed" type="range" min="0.25" max="2" step="0.05" value="1"></label>
      </section>
      <section class="ts-section"><div class="ts-label">ĐIỀU KHIỂN</div><div class="ts-actions">
        <button class="ts-primary" data-action="play">Ⅱ Tạm dừng</button><button data-action="restart">↺ Phát lại</button><button data-action="reset">Đặt lại</button>
      </div></section>
      <section class="ts-section"><div class="ts-label">GÓC QUAN SÁT</div><div class="ts-views">
        <button data-view="overview" class="ts-active">Toàn cảnh</button><button data-view="surface">Mặt biển</button><button data-view="underwater">Dưới nước</button><button data-view="section">Mặt cắt</button><button data-view="coast">Ven bờ</button>
      </div></section>
      <section><div class="ts-label">THÔNG SỐ VẬT LÍ</div><div class="ts-readout">
        <div class="ts-metric"><small>Vận tốc lý thuyết</small><strong data-stat="velocity">—</strong></div>
        <div class="ts-metric"><small>Độ cao sóng minh họa</small><strong data-stat="wave">—</strong></div>
        <div class="ts-metric"><small>Vị trí mặt sóng</small><strong data-stat="front">Ngoài khơi</strong></div>
        <div class="ts-metric"><small>Trạng thái</small><strong data-stat="status">Đang hình thành</strong></div>
      </div></section>
    </div>
    <div class="ts-explain"><strong data-role="explain-title">1. Hình thành sóng thần</strong><div data-role="explain">Động đất dưới đáy biển làm đáy biển nâng lên hoặc hạ xuống đột ngột, khiến một khối nước lớn bị dịch chuyển. Mô hình thể hiện cơ chế khởi phát bằng chuyển động của mảng đáy biển và mặt nước phía trên.</div><div class="ts-foot">Vận tốc sóng nước nông được ước tính theo công thức v = √(g × h), trong đó g = 9,81 m/s² và h là độ sâu nước. Biên độ hiển thị được phóng đại để dễ quan sát (*). Địa hình không theo tỉ lệ thực; mô hình không giải hệ phương trình thủy động lực học và không dùng để dự báo vùng ngập.</div></div>`;

  const q = s=>root.querySelector(s);
  const canvas=q("canvas"), loading=q(".ts-loading");
  const state={depth:4000,magnitude:7.8,shift:3,slope:3,sea:0,speed:1,mode:0,view:"overview",playing:true,elapsed:0,front:-31,last:0,dead:false};
  const modeInfo=[
    ["1. Hình thành sóng thần","Động đất dưới đáy biển làm đáy biển nâng lên hoặc hạ xuống đột ngột, khiến một khối nước lớn bị dịch chuyển. Mô hình thể hiện cơ chế khởi phát bằng chuyển động của mảng đáy biển và mặt nước phía trên."],
    ["2. Sóng truyền qua đại dương","Ở vùng nước sâu, sóng thần có bước sóng rất dài và lan truyền nhanh. Biên độ ngoài khơi thường nhỏ nên tàu thuyền có thể khó nhận biết sự bất thường nếu chỉ quan sát mặt biển."],
    ["3. Sóng tiến vào vùng nước nông","Khi tiến vào thềm lục địa, độ sâu giảm làm vận tốc sóng giảm. Bước sóng ngắn lại và độ cao sóng có thể tăng do hiệu ứng nước nông (shoaling)."],
    ["4. Tác động đến bờ biển","Sóng có thể tràn qua đường bờ, gây ngập sâu vào đất liền tùy địa hình, độ cao địa hình và cấu trúc bờ biển. Vùng màu xanh nhạt là phạm vi ngập được giản lược để quan sát cơ chế."],
    ["5. Phòng tránh và ứng phó","Khi có cảnh báo sóng thần hoặc cảm nhận động đất mạnh, kéo dài ở khu vực ven biển, cần rời xa bờ biển và di chuyển đến nơi cao hoặc sâu trong đất liền theo hướng dẫn của cơ quan chức năng. Không quay lại bờ khi chưa có thông báo an toàn."]
  ];
  let T=null,renderer=null,scene=null,camera=null,controls=null,terrain=null,water=null,waterGeo=null,waterBase=null,waterPos=null,foam=null,foamGeo=null,quakeGroup=null,plateA=null,plateB=null,flood=null,raf=0,resizeObs=null,resizeFn=null;
  const materials=[],geometries=[];
  const rad=d=>d*Math.PI/180;
  const fmt=(n,d=1)=>Number(n).toLocaleString("vi-VN",{minimumFractionDigits:d,maximumFractionDigits:d});
  const depthAt=x=>{
    const shore=17;
    if(x>=shore)return 0;
    const p=Math.max(0,Math.min(1,(shore-x)/77));
    const shelf=Math.pow(p,.72+(state.slope-3)*.12);
    const basin=state.depth*(.015+.985*shelf);
    // Rãnh sâu ngoài khơi và sống núi ngầm tạo địa hình đáy biển không phẳng.
    const trench=state.depth*.17*Math.exp(-Math.pow((x+43)/7.5,2));
    const ridge=state.depth*.075*Math.exp(-Math.pow((x+18)/10,2));
    return Math.max(30,Math.min(state.depth*1.16,basin+trench-ridge));
  };
  const terrainHeight=x=>{
    if(x<17){
      const d=depthAt(x);
      const ridge=.85*Math.exp(-Math.pow((x+18)/8,2));
      const trench=-.55*Math.exp(-Math.pow((x+43)/6,2));
      return -.0035*d+ridge+trench;
    }
    const inland=x-17;
    return Math.min(7.5,Math.pow(inland/9,.78)*1.9+.22*Math.sin(inland*.32));
  };
  function addMesh(geo,mat,parent=scene){geometries.push(geo);materials.push(mat);const m=new T.Mesh(geo,mat);parent.add(m);return m;}
  function mat(color,extra={}){const m=new T.MeshPhongMaterial({color,...extra});materials.push(m);return m;}
  function addMapLabel(text,x,y,z,width=12){
    const c=document.createElement("canvas");c.width=512;c.height=128;const g=c.getContext("2d");
    g.fillStyle="rgba(4,25,48,.78)";g.fillRect(8,18,496,92);
    g.font='bold 36px Arial,sans-serif';g.textAlign="center";g.textBaseline="middle";g.fillStyle="#ffffff";g.fillText(text,256,64,470);
    const tex=new T.CanvasTexture(c);const material=new T.SpriteMaterial({map:tex,transparent:true,depthTest:false,depthWrite:false});materials.push(material);
    const sprite=new T.Sprite(material);sprite.position.set(x,y,z);sprite.scale.set(width,width*.25,1);scene.add(sprite);
  }
  function makeTerrain(){
    const nx=180,nz=100,x0=-60,x1=60,z0=-31,z1=31,positions=[],colors=[],indices=[];
    const deep=new T.Color(0x102f50),slope=new T.Color(0x285d78),shelf=new T.Color(0x71999a),
          sand=new T.Color(0xd6c28b),land=new T.Color(0x557b50),high=new T.Color(0x9b9a76);
    for(let iz=0;iz<=nz;iz++)for(let ix=0;ix<=nx;ix++){
      const x=x0+(x1-x0)*ix/nx,z=z0+(z1-z0)*iz/nz,y=terrainHeight(x);
      const rough=.12*Math.sin(x*.43+z*.27)+.08*Math.sin(z*.82-x*.21)+.045*Math.cos(x*.91+z*.6);
      positions.push(x,y+(x<17?rough:rough*.3),z);
      let c;
      if(x<17){
        const d=depthAt(x)/Math.max(1,state.depth);
        c=deep.clone().lerp(slope,Math.max(0,Math.min(1,(1-d)*1.35)));
        if(x>-10)c.lerp(shelf,Math.max(0,(x+10)/27)*.7);
        if(x>8)c.lerp(sand,Math.max(0,(x-8)/9)*.8);
        if(x<-37)c.lerp(new T.Color(0x172d48),.4);
      }else c=land.clone().lerp(high,Math.max(0,Math.min(1,y/7.5))*.8);
      colors.push(c.r,c.g,c.b);
      if(ix<nx&&iz<nz){const a=iz*(nx+1)+ix,b=a+1,c0=a+nx+1,d0=c0+1;indices.push(a,c0,b,b,c0,d0);}
    }
    const g=new T.BufferGeometry();g.setAttribute("position",new T.Float32BufferAttribute(positions,3));
    g.setAttribute("color",new T.Float32BufferAttribute(colors,3));g.setIndex(indices);g.computeVertexNormals();
    terrain=addMesh(g,new T.MeshStandardMaterial({vertexColors:true,roughness:.95,side:T.DoubleSide}));
    // Dải cát ven bờ và địa hình bờ biển chuyển tiếp lên đất liền.
    const shore=addMesh(new T.BoxGeometry(.42,.16,62),mat(0xd8c58d));shore.position.set(17.05,.04,0);
    // Mảng đáy biển được tạo từ bề mặt địa hình, có hai khối chuyển dịch ở hai phía đứt gãy.
    function seabedPlate(x0,x1,color){
      const nxp=44,nzp=38,verts=[],idx=[];
      for(let iz=0;iz<=nzp;iz++)for(let ix=0;ix<=nxp;ix++){
        const x=x0+(x1-x0)*ix/nxp,z=-30+60*iz/nzp;
        verts.push(x,terrainHeight(x)-.12,z);
        if(ix<nxp&&iz<nzp){const a=iz*(nxp+1)+ix,b=a+1,c=a+nxp+1,d=c+1;idx.push(a,c,b,b,c,d);}
      }
      const pg=new T.BufferGeometry();pg.setAttribute("position",new T.Float32BufferAttribute(verts,3));pg.setIndex(idx);pg.computeVertexNormals();
      return addMesh(pg,mat(color,{side:T.DoubleSide}));
    }
    plateA=seabedPlate(-47,-23,0x526b75);plateB=seabedPlate(-23,1,0x6d8182);
    quakeGroup=new T.Group();scene.add(quakeGroup);
    const fault=addMesh(new T.PlaneGeometry(1.2,60,2,24),mat(0x9d7656,{side:T.DoubleSide}));fault.rotation.y=Math.PI/2;fault.position.set(-23,terrainHeight(-23)-.1,0);quakeGroup.add(fault);
    const epic=addMesh(new T.SphereGeometry(.72,24,16),mat(0xffbd43,{emissive:0x8c3900,emissiveIntensity:.6}));
    epic.position.set(-23,terrainHeight(-23)+.8,0);quakeGroup.add(epic);
    const pulse=addMesh(new T.SphereGeometry(1.1,24,16),new T.MeshBasicMaterial({color:0xffa33c,transparent:true,opacity:.3,wireframe:true}));
    pulse.position.copy(epic.position);quakeGroup.add(pulse);quakeGroup.userData.pulse=pulse;
    const town=new T.Group();scene.add(town);
    for(let i=0;i<8;i++){
      const x=25+(i%4)*5,z=-13+Math.floor(i/4)*11,h=1.2+(i%3)*.45,base=terrainHeight(x);
      const house=addMesh(new T.BoxGeometry(2.1,h,2),mat(i%2?0xe7dfc7:0xd9e5ee));house.position.set(x,base+h/2,z);town.add(house);
      const roof=addMesh(new T.ConeGeometry(1.55,.8,4),mat(0x9a5948));roof.position.set(x,base+h+.4,z);roof.rotation.y=Math.PI/4;town.add(roof);
    }
    addMapLabel("RÃNH ĐẠI DƯƠNG",-47,terrainHeight(-47)+1,-19,13);
    addMapLabel("SỐNG NÚI NGẦM",-18,terrainHeight(-18)+1,18,13);
    addMapLabel("SƯỜN LỤC ĐỊA",3,terrainHeight(3)+1,-18,12);
    addMapLabel("THỀM LỤC ĐỊA",11,terrainHeight(11)+1,16,11);
    addMapLabel("ĐƯỜNG BỜ",19,1.5,-19,8);
    addMapLabel("ĐẤT LIỀN",39,terrainHeight(39)+2,18,9);
    const route=new T.ArrowHelper(new T.Vector3(1,.12,0),new T.Vector3(-18,1.8,14),30,0x38a66b,4,2);scene.add(route);
    const fg=new T.PlaneGeometry(1,1);
    flood=addMesh(fg,new T.MeshBasicMaterial({color:0x48c9e8,transparent:true,opacity:.3,side:T.DoubleSide,depthWrite:false}));
    flood.rotation.x=-Math.PI/2;flood.position.set(20,.13,0);flood.scale.set(1,48,1);
  }
  function updateTerrain(){
    if(!terrain)return;
    const p=terrain.geometry.attributes.position.array,c=terrain.geometry.attributes.color.array;
    const deep=new T.Color(0x102f50),slope=new T.Color(0x285d78),shelf=new T.Color(0x71999a),
          sand=new T.Color(0xd6c28b),land=new T.Color(0x557b50),high=new T.Color(0x9b9a76);
    for(let i=0;i<p.length;i+=3){
      const x=p[i],z=p[i+2],y=terrainHeight(x);
      p[i+1]=y+.12*Math.sin(x*.43+z*.27)+.08*Math.sin(z*.82-x*.21)+.045*Math.cos(x*.91+z*.6);
      let col;
      if(x<17){
        const d=depthAt(x)/Math.max(1,state.depth);
        col=deep.clone().lerp(slope,Math.max(0,Math.min(1,(1-d)*1.35)));
        if(x>-10)col.lerp(shelf,Math.max(0,(x+10)/27)*.7);
        if(x>8)col.lerp(sand,Math.max(0,(x-8)/9)*.8);
        if(x<-37)col.lerp(new T.Color(0x172d48),.4);
      }else col=land.clone().lerp(high,Math.max(0,Math.min(1,y/7.5))*.8);
      c[i]=col.r;c[i+1]=col.g;c[i+2]=col.b;
    }
    terrain.geometry.attributes.position.needsUpdate=true;
    terrain.geometry.attributes.color.needsUpdate=true;
    terrain.geometry.computeVertexNormals();
    [plateA,plateB].forEach(plate=>{
      if(!plate)return;
      const a=plate.geometry.attributes.position;
      for(let i=0;i<a.count;i++){
        const x=a.getX(i),z=a.getZ(i);
        a.setY(i,terrainHeight(x)-.12);
      }
      a.needsUpdate=true;plate.geometry.computeVertexNormals();
    });
  }
  function makeWater(){
    const nx=110,nz=66,x0=-60,x1=17,z0=-31,z1=31,positions=[],indices=[];
    for(let iz=0;iz<=nz;iz++)for(let ix=0;ix<=nx;ix++){
      const x=x0+(x1-x0)*ix/nx,z=z0+(z1-z0)*iz/nz;positions.push(x,state.sea,z);
      if(ix<nx&&iz<nz){const a=iz*(nx+1)+ix,b=a+1,c=a+nx+1,d=c+1;indices.push(a,b,c,b,d,c);}
    }
    waterGeo=new T.BufferGeometry();waterGeo.setAttribute("position",new T.Float32BufferAttribute(positions,3));waterGeo.setIndex(indices);waterBase=positions.slice();waterPos=waterGeo.attributes.position.array;
    water=addMesh(waterGeo,new T.MeshPhongMaterial({color:0x1685bd,transparent:true,opacity:.82,shininess:90,specular:0xa7e9ff,side:T.DoubleSide,flatShading:false}));
    // Dải bọt ở mặt sóng, cập nhật theo bán kính sóng.
    const count=180;foamGeo=new T.BufferGeometry();foamGeo.setAttribute("position",new T.Float32BufferAttribute(new Float32Array(count*3),3));
    foam=new T.Line(foamGeo,new T.LineBasicMaterial({color:0xe7fbff,transparent:true,opacity:.9}));scene.add(foam);geometries.push(foamGeo);materials.push(foam.material);foam.userData.count=count;
  }
  function init(){
    if(state.dead||!window.THREE||!THREE.OrbitControls)return;
    T=THREE;
    try{
      renderer=new T.WebGLRenderer({canvas,antialias:true,alpha:false,powerPreference:"low-power"});
      renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.5));renderer.setClearColor(0x8bc5df,1);
      if("outputColorSpace" in renderer && T.SRGBColorSpace)renderer.outputColorSpace=T.SRGBColorSpace;
      scene=new T.Scene();scene.background=new T.Color(0x8bc5df);scene.fog=new T.Fog(0x8bc5df,75,145);
      camera=new T.PerspectiveCamera(43,1,.1,220);camera.position.set(36,42,74);
      controls=new T.OrbitControls(camera,canvas);controls.enableDamping=true;controls.dampingFactor=.07;controls.target.set(-8,0,0);controls.minDistance=18;controls.maxDistance=145;controls.maxPolarAngle=Math.PI*.92;
      scene.add(new T.HemisphereLight(0xd8f3ff,0x53634c,1.1));
      const sun=new T.DirectionalLight(0xfff0d2,1.25);sun.position.set(-25,55,30);scene.add(sun);
      makeTerrain();makeWater();
      const grid=new T.GridHelper(120,24,0x8ba6ad,0x8ba6ad);grid.position.set(0,-.42,0);grid.material.transparent=true;grid.material.opacity=.18;scene.add(grid);
      loading.hidden=true;resize();setView("overview",false);updateLabels();
      resizeFn=()=>resize();window.addEventListener("resize",resizeFn);
      if(window.ResizeObserver){resizeObs=new ResizeObserver(resize);resizeObs.observe(canvas.parentElement);}
      state.last=performance.now();animate(state.last);
    }catch(err){loading.hidden=false;loading.textContent="Không thể khởi tạo mô hình 3D trên thiết bị này. Hãy kiểm tra khả năng hỗ trợ WebGL.";}
  }
  function resize(){
    if(!renderer||!camera)return;const w=Math.max(1,canvas.clientWidth),h=Math.max(1,canvas.clientHeight);
    renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();
  }
  function localDepth(x){
    if(x>=17)return 30;
    const f=Math.max(0,Math.min(1,(17-x)/77));
    return Math.max(30,state.depth*(.015+.985*Math.pow(f,.85+(state.slope-3)*.12)));
  }
  function waveSpeed(x){return Math.sqrt(9.81*localDepth(x))/1000;}
  function waveAmplitude(x){
    const deep=state.depth,shallow=localDepth(x),base=(.24+state.shift*.105)*(.65+(state.magnitude-6)*.2);
    return Math.min(4.8,base*Math.sqrt(deep/shallow));
  }
  function updateWave(dt){
    const speed=waveSpeed(state.front)*1000/1000*45*state.speed;
    if(state.playing && state.mode!==4){state.front+=Math.max(.01,speed)*dt;state.elapsed+=dt;}
    const radius=Math.max(0,state.front+23),width=8.5;
    const phaseShift=(state.magnitude-6)*.35;
    for(let i=0;i<waterPos.length;i+=3){
      const x=waterBase[i],z=waterBase[i+2],dx=x+23,r=Math.sqrt(dx*dx+z*z),dist=r-radius;
      const env=Math.exp(-(dist*dist)/(2*width*width));
      const amp=waveAmplitude(x<17?x:16);
      const longWave=Math.sin(dist*.22+phaseShift);
      const leading=Math.exp(-Math.max(0,dist)*.035);
      waterPos[i+1]=state.sea+amp*env*longWave*leading;
    }
    waterGeo.attributes.position.needsUpdate=true;waterGeo.computeVertexNormals();
    const arr=foamGeo.attributes.position.array,n=foam.userData.count;
    for(let i=0;i<n;i++){
      const a=i/n*Math.PI*2,x=-23+Math.cos(a)*radius,z=Math.sin(a)*radius;
      const y=state.sea+waveAmplitude(Math.min(16,x))*Math.sin(phaseShift)*Math.exp(-.5)+.08;
      arr[i*3]=x;arr[i*3+1]=y;arr[i*3+2]=z;
    }
    foamGeo.attributes.position.needsUpdate=true;
    const uplift=state.shift*.045*(1-Math.exp(-state.elapsed*2));
    if(quakeGroup)quakeGroup.position.y=uplift;
    if(plateA)plateA.position.y=-10.75-uplift*.15;
    if(plateB)plateB.position.y=-7.0+uplift;
    const pulse=quakeGroup&&quakeGroup.userData.pulse;
    if(pulse){const s=1+Math.sin(state.elapsed*2.5)*.16;pulse.scale.setScalar(s);}
    const reached=Math.max(0,Math.min(1,(state.front-(-5))/28));
    flood.scale.x=.5+reached*22;flood.position.x=17.4+flood.scale.x*.5;flood.position.y=state.sea+.12;
    flood.visible=state.front>2&&state.mode>=2;
  }
  function updateLabels(){
    const slopeNames={1:"Thoải",2:"Hơi thoải",3:"Trung bình",4:"Dốc",5:"Rất dốc"};
    q('[data-value="depth"]').textContent=Math.round(state.depth).toLocaleString("vi-VN")+" m";
    q('[data-value="magnitude"]').textContent=fmt(state.magnitude,1)+" Mw";
    q('[data-value="shift"]').textContent=fmt(state.shift,1)+" m";
    q('[data-value="slope"]').textContent=slopeNames[state.slope];
    q('[data-value="sea"]').textContent=fmt(state.sea,1)+" m";
    q('[data-value="speed"]').textContent=fmt(state.speed,2)+"×";
    q('[data-role="mode-tag"]').textContent="GIAI ĐOẠN "+(state.mode+1)+" · "+["HÌNH THÀNH","NGOÀI KHƠI","TIẾN VÀO BỜ","TÁC ĐỘNG","PHÒNG TRÁNH"][state.mode];
    q('[data-role="explain-title"]').textContent=modeInfo[state.mode][0];q('[data-role="explain"]').textContent=modeInfo[state.mode][1];
    root.querySelectorAll("[data-mode]").forEach(b=>b.classList.toggle("ts-active",+b.dataset.mode===state.mode));
    root.querySelectorAll("[data-view]").forEach(b=>b.classList.toggle("ts-active",b.dataset.view===state.view));
    q('[data-action="play"]').textContent=state.playing?"Ⅱ Tạm dừng":"▶ Tiếp tục";
  }
  function updateStats(){
    const v=waveSpeed(state.front)*1000;
    const amp=waveAmplitude(Math.min(16,state.front));
    q('[data-stat="velocity"]').textContent=Math.round(v).toLocaleString("vi-VN")+" m/s";
    q('[data-stat="wave"]').textContent=fmt(amp,1)+" m*";
    q('[data-stat="front"]').textContent=state.front< -5?"Ngoài khơi":state.front<17?"Thềm lục địa":"Ven bờ";
    q('[data-stat="status"]').textContent=state.mode===4?"Phòng tránh":state.front>17?"Đã chạm bờ":state.playing?"Đang lan truyền":"Đang tạm dừng";
    q('[data-role="clock"]').textContent=fmt(state.elapsed,1)+" s mô phỏng";
  }
  function setMode(m){
    state.mode=Math.max(0,Math.min(4,m));
    if(state.mode===0){state.front=-31;state.elapsed=0;state.playing=false;}
    if(state.mode===1){state.front=-25;state.elapsed=1;state.playing=true;}
    if(state.mode===2){state.front=2;state.elapsed=5;state.playing=true;}
    if(state.mode===3){state.front=18;state.elapsed=8;state.playing=true;}
    if(state.mode===4){state.front=18;state.elapsed=8;state.playing=false;}
    updateLabels();updateStats();
  }
  function setView(name,animate=true){
    state.view=name;
    const presets={
      overview:{p:[36,42,74],t:[-8,0,0]},surface:{p:[-4,19,44],t:[-8,0,0]},underwater:{p:[-34,-17,25],t:[-22,-4,0]},section:{p:[-5,24,105],t:[-5,-2,0]},coast:{p:[35,18,35],t:[20,1,0]}
    };
    const v=presets[name]||presets.overview;
    if(camera&&controls){camera.position.set(...v.p);controls.target.set(...v.t);controls.update();}
    updateLabels();
  }
  function reset(){
    state.depth=4000;state.magnitude=7.8;state.shift=3;state.slope=3;state.sea=0;state.speed=1;
    state.front=-31;state.elapsed=0;state.mode=0;state.playing=true;
    root.querySelectorAll("[data-param]").forEach(el=>el.value=state[el.dataset.param]);
    updateTerrain();
    water.position.y=0;
    updateLabels();updateStats();
  }
  root.querySelectorAll("[data-param]").forEach(el=>el.addEventListener("input",()=>{
    state[el.dataset.param]=Number(el.value);updateLabels();
    if(el.dataset.param==="slope"||el.dataset.param==="depth")updateTerrain();
  }));
  root.querySelectorAll("[data-mode]").forEach(b=>b.addEventListener("click",()=>setMode(+b.dataset.mode)));
  root.querySelectorAll("[data-view]").forEach(b=>b.addEventListener("click",()=>setView(b.dataset.view)));
  q('[data-action="play"]').addEventListener("click",()=>{state.playing=!state.playing;updateLabels();});
  q('[data-action="restart"]').addEventListener("click",()=>{state.front=-31;state.elapsed=0;state.mode=0;state.playing=true;updateLabels();});
  q('[data-action="reset"]').addEventListener("click",reset);

  function animate(now){
    if(state.dead)return;raf=requestAnimationFrame(animate);
    const dt=Math.min(.05,Math.max(0,(now-state.last)/1000));state.last=now;
    if(renderer&&scene&&camera){updateWave(dt);controls.update();renderer.render(scene,camera);if(Math.floor(now/150)%2===0)updateStats();}
  }
  function destroy(){
    if(state.dead)return;state.dead=true;cancelAnimationFrame(raf);
    if(resizeFn)window.removeEventListener("resize",resizeFn);if(resizeObs)resizeObs.disconnect();
    if(controls)controls.dispose();
    if(scene)scene.traverse(o=>{if(o.geometry&&!geometries.includes(o.geometry))o.geometry.dispose();if(o.material){const ms=Array.isArray(o.material)?o.material:[o.material];ms.forEach(m=>{if(m.map&&m.map.dispose)m.map.dispose();if(!materials.includes(m))m.dispose();});}});
    geometries.forEach(g=>g.dispose());materials.forEach(m=>{if(m.map&&m.map.dispose)m.map.dispose();m.dispose();});
    if(renderer){renderer.dispose();renderer.forceContextLoss();}
    root.classList.remove("tsunami-root");
  }
  // index.html đã nạp Three.js và OrbitControls trước mô-đun này; dùng chung một phiên bản để tránh xung đột.
  if(window.THREE && THREE.OrbitControls){
    init();
  }else{
    loading.hidden=false;
    loading.textContent="Không tải được Three.js hoặc OrbitControls. Hãy kiểm tra kết nối Internet rồi mở lại mô hình.";
  }
  return {destroy};
}
