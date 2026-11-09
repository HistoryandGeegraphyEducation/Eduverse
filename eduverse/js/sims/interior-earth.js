// ---------- CẤU TẠO BÊN TRONG TRÁI ĐẤT (Three.js) ----------
function simInteriorEarth(root){
  root.innerHTML = `
    <div class="ie-wrap">
      <style>
        .ie-wrap{color:#eaf2ff;font-family:Arial,sans-serif;background:linear-gradient(145deg,#071326,#102b4a 58%,#071323);border:1px solid rgba(130,190,255,.22);border-radius:18px;overflow:hidden;box-shadow:0 12px 35px rgba(0,0,0,.2)}
        .ie-head{padding:13px 15px 8px}.ie-head strong{display:block;font-size:17px;letter-spacing:.3px}.ie-head small{display:block;color:#a9c5e8;margin-top:4px;font-size:11px;line-height:1.45}
        .ie-stage{height:clamp(290px,58vw,490px);min-height:290px;position:relative;background:radial-gradient(ellipse at 50% 48%,#173b61 0,#091b31 58%,#040d19 100%);overflow:hidden}
        .ie-stage canvas{width:100%;height:100%;display:block;touch-action:none;user-select:none}
        .ie-loading{position:absolute;inset:0;display:grid;place-items:center;color:#d7e8ff;font-size:13px;pointer-events:none}
        .ie-hud{position:absolute;left:10px;top:10px;display:flex;flex-wrap:wrap;gap:5px;max-width:85%;pointer-events:none}.ie-tag{font-size:10px;padding:5px 8px;border-radius:20px;background:rgba(4,14,29,.72);border:1px solid rgba(180,215,255,.2);color:#d7eaff}
        .ie-controls{padding:11px;display:grid;gap:10px;background:rgba(3,12,25,.65)}
        .ie-tabs,.ie-actions,.ie-views{display:flex;flex-wrap:wrap;gap:6px}
        .ie-wrap button{border:1px solid rgba(154,196,242,.25);border-radius:10px;background:#173452;color:#e9f3ff;padding:8px 10px;font-size:11px;font-weight:700;min-height:34px;cursor:pointer}
        .ie-wrap button.active{background:#f0a84b;color:#17263b;border-color:#ffd18b}.ie-wrap button:active{transform:scale(.98)}
        .ie-row{display:grid;grid-template-columns:1fr auto;gap:8px;align-items:center;color:#c7d9ef;font-size:11px}.ie-row input{grid-column:1/-1;width:100%;accent-color:#f2a84b;margin:0}
        .ie-panels{display:grid;grid-template-columns:1fr;gap:9px}.ie-card{background:rgba(14,37,62,.85);border:1px solid rgba(142,187,232,.17);border-radius:12px;padding:11px;min-width:0}.ie-card h3{font-size:13px;margin:0 0 7px;color:#ffd18b}.ie-card p{font-size:11px;line-height:1.55;color:#d1e0f2;margin:5px 0}.ie-facts{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px}.ie-fact{padding:7px;background:rgba(255,255,255,.045);border-radius:8px}.ie-fact small{display:block;color:#9fb8d6;font-size:9px}.ie-fact b{font-size:11px;color:#fff;display:block;margin-top:3px}.ie-layerlist{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px}.ie-layer{display:flex;align-items:center;gap:7px;text-align:left}.ie-dot{width:10px;height:10px;border-radius:50%;flex:none;box-shadow:0 0 9px currentColor}.ie-note{font-size:10px!important;color:#9fb5d0!important}.ie-quiz{margin-top:9px}.ie-question{padding:8px 0;border-top:1px solid rgba(142,187,232,.14)}.ie-question:first-of-type{border-top:0}.ie-question p{font-size:12px;font-weight:700;color:#eaf2ff;margin:2px 0 8px}.ie-options{display:flex;flex-wrap:wrap;gap:6px}.ie-options button{font-size:10px;min-height:31px}.ie-options button.selected{background:#f0a84b;color:#17263b;border-color:#ffd18b}.ie-feedback{display:block;min-height:15px;margin-top:5px;color:#c6d9ef;font-size:10px}.ie-quiz-actions{display:flex;align-items:center;gap:10px;flex-wrap:wrap}.ie-quiz-actions b{font-size:11px;color:#ffd18b}
        @media(min-width:720px){.ie-panels{grid-template-columns:1.15fr .85fr}.ie-stage{height:440px}}
      </style>
      <div class="ie-head"><strong>🌎 CẤU TẠO BÊN TRONG TRÁI ĐẤT</strong><small>Quay quả Địa Cầu để quan sát bề mặt; chuyển sang mặt cắt để tìm hiểu cấu trúc bên trong. Kéo để xoay · Chụm hai ngón để thu phóng.</small></div>
      <div class="ie-stage"><canvas></canvas><div class="ie-loading" id="ie-load">Đang tải không gian 3D…</div><div class="ie-hud"><span class="ie-tag" id="ie-mode-label">BỀ MẶT TRÁI ĐẤT</span><span class="ie-tag" id="ie-scale-label">Tỉ lệ gần đúng</span><span class="ie-tag">Bản đồ nền: NASA Blue Marble</span></div></div>
      <div class="ie-controls">
        <div class="ie-tabs" id="ie-tabs">
          <button class="active" data-mode="surface">Bề mặt</button><button data-mode="cut">Cắt lớp</button><button data-mode="explode">Bóc tách</button><button data-mode="flow">Chuyển động</button><button data-mode="seismic">Sóng địa chấn</button>
        </div>
        <div class="ie-row"><span>Độ tách các lớp</span><b id="ie-explode-val">0%</b><input id="ie-explode" type="range" min="0" max="100" value="0"></div>
        <div class="ie-actions"><button id="ie-play" class="active">⏸ Tạm dừng</button><button id="ie-scale">Phóng đại vỏ</button><button id="ie-reset">Đặt lại góc nhìn</button></div>
        <div class="ie-views"><button data-view="all" class="active">Toàn cảnh</button><button data-view="side">Mặt cắt</button><button data-view="top">Nhìn từ cực</button></div>
      </div>
      <div class="ie-panels">
        <section class="ie-card"><h3 id="ie-info-title">Trái Đất</h3><p id="ie-info-desc">Trái Đất có cấu trúc phân lớp. Hãy chọn một chế độ hoặc chạm vào phần mô hình để khám phá.</p><div class="ie-facts" id="ie-facts"></div></section>
        <section class="ie-card"><h3>Các lớp cấu tạo</h3><div class="ie-layerlist" id="ie-layers"></div><p class="ie-note" id="ie-science-note">Vỏ Trái Đất rất mỏng; bật chế độ phóng đại nếu cần quan sát rõ hơn.</p></section>
      </div>
      <section class="ie-card ie-quiz">
        <h3>Kiểm tra kiến thức</h3>
        <div class="ie-question" data-question="0"><p>1. Lớp nào của Trái Đất ở trạng thái lỏng?</p><div class="ie-options"><button data-answer="crust">Vỏ Trái Đất</button><button data-answer="mantle">Lớp phủ</button><button data-answer="outer">Nhân ngoài</button><button data-answer="inner">Nhân trong</button></div><small class="ie-feedback"></small></div>
        <div class="ie-question" data-question="1"><p>2. Sóng địa chấn S có truyền qua nhân ngoài không?</p><div class="ie-options"><button data-answer="yes">Có</button><button data-answer="no">Không</button></div><small class="ie-feedback"></small></div>
        <div class="ie-question" data-question="2"><p>3. Vật chất trong lớp phủ chủ yếu ở trạng thái nào?</p><div class="ie-options"><button data-answer="liquid">Lỏng</button><button data-answer="solid">Rắn, có thể biến dạng chậm</button></div><small class="ie-feedback"></small></div>
        <div class="ie-quiz-actions"><button id="ie-quiz-check">Kiểm tra đáp án</button><b id="ie-quiz-result" aria-live="polite"></b></div>
      </section>
    </div>`;

  const q=s=>root.querySelector(s), canvas=q('canvas');
  const layers=[
    {id:'crust',name:'Vỏ Trái Đất',color:0x5da7d8,radius:1,depth:'0–khoảng 5–70 km',thickness:'Khoảng 5–70 km',state:'Rắn',material:'Đá silicat',desc:'Lớp ngoài cùng, gồm vỏ lục địa và vỏ đại dương. Vỏ đại dương thường mỏng hơn vỏ lục địa.'},
    {id:'mantle',name:'Lớp phủ (Manti)',color:0xe87936,radius:.9945,depth:'Đến khoảng 2.900 km',thickness:'Khoảng 2.850–2.900 km',state:'Chủ yếu rắn, biến dạng chậm',material:'Silicat giàu magiê và sắt',desc:'Lớp rất dày nằm dưới vỏ. Vật chất chủ yếu ở trạng thái rắn nhưng có thể biến dạng và chuyển động chậm trong thời gian địa chất.'},
    {id:'outer',name:'Nhân ngoài',color:0xf2a52e,radius:.545,depth:'Khoảng 2.900–5.150 km',thickness:'Khoảng 2.260 km',state:'Lỏng',material:'Chủ yếu sắt và nickel',desc:'Lớp kim loại lỏng bao quanh nhân trong. Chuyển động của vật chất dẫn điện trong nhân ngoài góp phần tạo ra từ trường Trái Đất.'},
    {id:'inner',name:'Nhân trong',color:0xffe18a,radius:.192,depth:'Khoảng 5.150–6.371 km',thickness:'Bán kính khoảng 1.220 km',state:'Rắn',material:'Chủ yếu sắt và nickel',desc:'Phần trung tâm Trái Đất. Dù nhiệt độ rất cao, áp suất cực lớn giữ vật chất ở trạng thái rắn.'}
  ];
  let dead=false, started=false, renderer=null, scene=null, camera=null, controls=null, raf=0, resizeObs=null, selected=0, mode='surface', playing=true, expanded=false, exaggerate=false, time=0, last=0;
  const meshes=[], flowLines=[], waveLines=[], cutFaces=[];
  const load=(src,ok)=>new Promise((resolve,reject)=>{if(ok())return resolve();const s=document.createElement('script');s.src=src;s.onload=resolve;s.onerror=()=>reject(new Error('Không tải được '+src));document.head.appendChild(s);});

  function makeSphereGeometry(T,r,cut){
    const start=cut?Math.PI*.8:0, length=cut?Math.PI*1.4:Math.PI*2;
    const geometry=new T.SphereGeometry(r,96,64,start,length,0,Math.PI);
    if(cut){
      const uv=geometry.attributes.uv;
      for(let i=0;i<uv.count;i++){
        const fraction=1-uv.getX(i);
        uv.setX(i,1-(start+fraction*length)/(Math.PI*2));
      }
      uv.needsUpdate=true;
    }
    return geometry;
  }

  function makeCutFaceGeometry(T,outer,inner,phi){
    const radialSegments=8,thetaSegments=64,positions=[],indices=[];
    for(let i=0;i<=radialSegments;i++){
      const radius=inner+(outer-inner)*i/radialSegments;
      for(let j=0;j<=thetaSegments;j++){
        const theta=Math.PI*j/thetaSegments;
        const s=Math.sin(theta);
        positions.push(
          -radius*s*Math.cos(phi),
          radius*Math.cos(theta),
          radius*s*Math.sin(phi)
        );
      }
    }
    for(let i=0;i<radialSegments;i++){
      for(let j=0;j<thetaSegments;j++){
        const a=i*(thetaSegments+1)+j;
        const b=a+thetaSegments+1;
        indices.push(a,b,a+1,b,b+1,a+1);
      }
    }
    const geometry=new T.BufferGeometry();
    geometry.setAttribute('position',new T.Float32BufferAttribute(positions,3));
    geometry.setIndex(indices);geometry.computeVertexNormals();
    return geometry;
  }

  function init(){
    if(dead||started)return; started=true;
    try{
      const T=window.THREE, cv=canvas, stage=cv.parentElement;
      renderer=new T.WebGLRenderer({canvas:cv,antialias:true,alpha:true,powerPreference:'low-power'});
      renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.6)); renderer.setClearColor(0x000000,0);
      scene=new T.Scene(); camera=new T.PerspectiveCamera(38,1,.1,30); camera.position.set(0,1.35,3.5);
      controls=new T.OrbitControls(camera,cv); controls.enableDamping=true; controls.dampingFactor=.075; controls.enablePan=false; controls.minDistance=1.65; controls.maxDistance=7;
      scene.add(new T.HemisphereLight(0xb9dcff,0x291326,1.45));
      const key=new T.DirectionalLight(0xffffff,2.0);key.position.set(3,4,5);scene.add(key);
      const rim=new T.PointLight(0x398bff,1.4,8);rim.position.set(-3,1,-2);scene.add(rim);
      const earthGroup=new T.Group();scene.add(earthGroup);
      const makeFallbackTexture=()=>{
        const c=document.createElement('canvas');c.width=1024;c.height=512;
        const g=c.getContext('2d');
        const grad=g.createLinearGradient(0,0,0,512);
        grad.addColorStop(0,'#164b79');grad.addColorStop(.5,'#247bb0');grad.addColorStop(1,'#123e70');
        g.fillStyle=grad;g.fillRect(0,0,1024,512);
        const polys=[[[80,110],[140,70],[220,85],[250,135],[210,180],[180,220],[125,190]],[[250,230],[290,250],[300,320],[270,390],[245,335]],[[440,100],[510,75],[610,90],[690,130],[730,190],[670,220],[620,190],[580,240],[530,210],[490,170]],[[500,230],[570,250],[600,330],[560,420],[520,360]],[[750,330],[820,310],[880,350],[850,410],[780,390]]];
        g.fillStyle='#5e9b63';g.strokeStyle='#a2c58a';g.lineWidth=3;
        polys.forEach(p=>{g.beginPath();p.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.closePath();g.fill();g.stroke();});
        return new T.CanvasTexture(c);
      };
      const fallbackTexture=makeFallbackTexture();
      layers.forEach((L,i)=>{
        const mat=new T.MeshStandardMaterial({color:i===0?0xffffff:L.color,map:i===0?fallbackTexture:null,roughness:i===0?.94:.78,metalness:i>1?.16:.02,side:T.DoubleSide});
        const mesh=new T.Mesh(makeSphereGeometry(T,L.radius,false),mat);
        mesh.userData.layer=i;earthGroup.add(mesh);meshes.push(mesh);
      });
      const cutAngles=[Math.PI*.8,Math.PI*.8+Math.PI*1.4];
      const cutColors=[0x8b755e,0xe87936,0xf2a52e,0xffe18a];
      const createCutFaces=()=>{
        cutFaces.forEach(face=>{earthGroup.remove(face);face.geometry.dispose();face.material.dispose();});
        cutFaces.length=0;
        const radii=[1,exaggerate?.94:layers[1].radius,layers[2].radius,layers[3].radius,0];
        for(let layer=0;layer<4;layer++){
          for(const angle of cutAngles){
            const geometry=makeCutFaceGeometry(T,radii[layer],radii[layer+1],angle);
            const material=new T.MeshStandardMaterial({color:cutColors[layer],roughness:.92,metalness:layer>1?.08:0,side:T.DoubleSide});
            const face=new T.Mesh(geometry,material);
            face.userData.layer=layer;face.visible=false;
            earthGroup.add(face);cutFaces.push(face);
          }
        }
      };
      createCutFaces();
      // Ảnh nền Blue Marble của NASA là bản đồ toàn cầu dạng equirectangular, phù hợp ánh xạ lên mặt cầu.
      const earthMapUrl='https://assets.science.nasa.gov/content/dam/science/esd/eo/images/bmng/bmng-topography-bathymetry/january/world.topo.bathy.200401.3x5400x2700.jpg';
      const textureLoader=new T.TextureLoader();textureLoader.setCrossOrigin('anonymous');
      textureLoader.load(earthMapUrl,sourceTexture=>{
        if(dead){sourceTexture.dispose();return;}
        const image=sourceTexture.image;
        const reduced=document.createElement('canvas');
        reduced.width=2048;reduced.height=1024;
        const context=reduced.getContext('2d',{alpha:false});
        context.drawImage(image,0,0,reduced.width,reduced.height);
        const texture=new T.CanvasTexture(reduced);
        texture.encoding=T.sRGBEncoding;
        texture.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());
        const old=meshes[0].material.map;
        meshes[0].material.map=texture;meshes[0].material.color.set(0xffffff);meshes[0].material.needsUpdate=true;
        sourceTexture.dispose();
        if(old)old.dispose();
      },undefined,()=>{ /* Giữ texture dự phòng nếu thiết bị không tải được ảnh NASA. */ });
      const atmosphere=new T.Mesh(new T.SphereGeometry(1.045,48,32),new T.MeshBasicMaterial({color:0x4b9cff,transparent:true,opacity:.11,side:T.BackSide,depthWrite:false}));earthGroup.add(atmosphere);
      // Các đường chuyển động đối lưu là sơ đồ khái niệm, không biểu diễn dòng chảy thực theo tỉ lệ.
      for(let i=0;i<8;i++){const pts=[];for(let j=0;j<=40;j++){const a=j/40*Math.PI*2;const r=.68+Math.sin(a*2+i)*.045;pts.push(new T.Vector3(Math.cos(a+i*.78)*r,Math.sin(a*2+i)*.10,Math.sin(a+i*.78)*r));}const line=new T.Line(new T.BufferGeometry().setFromPoints(pts),new T.LineBasicMaterial({color:i%2?0xffc15b:0xff6a38,transparent:true,opacity:.75}));earthGroup.add(line);flowLines.push(line);}
      // Đường truyền sơ đồ: P đi xuyên qua các lớp; S chỉ minh họa trong lớp phủ rắn.
      const pPts=[];for(let j=0;j<=80;j++){const x=-.96+j/80*1.92;pPts.push(new T.Vector3(x,0,.015));}
      const pLine=new T.Line(new T.BufferGeometry().setFromPoints(pPts),new T.LineBasicMaterial({color:0x61e5ff,transparent:true,opacity:.95}));earthGroup.add(pLine);waveLines.push(pLine);
      [[0,Math.PI*.78],[Math.PI,Math.PI*1.78]].forEach(([a0,a1])=>{const pts=[];for(let j=0;j<=45;j++){const a=a0+(a1-a0)*j/45;pts.push(new T.Vector3(Math.cos(a)*.72,Math.sin(a)*.72,.02));}const line=new T.Line(new T.BufferGeometry().setFromPoints(pts),new T.LineBasicMaterial({color:0xffd166,transparent:true,opacity:.95}));earthGroup.add(line);waveLines.push(line);});
      const stars=new T.BufferGeometry(), arr=[];for(let i=0;i<240;i++){const u=Math.random()*2-1,a=Math.random()*Math.PI*2,r=4+Math.random()*5;arr.push(r*Math.sqrt(1-u*u)*Math.cos(a),r*u,r*Math.sqrt(1-u*u)*Math.sin(a));}stars.setAttribute('position',new T.Float32BufferAttribute(arr,3));scene.add(new T.Points(stars,new T.PointsMaterial({color:0xb7d8ff,size:.018,transparent:true,opacity:.65})));
      const ray=new T.Raycaster(), pointer=new T.Vector2();let down=null;
      cv.addEventListener('pointerdown',e=>{down={x:e.clientX,y:e.clientY};});
      cv.addEventListener('pointerup',e=>{if(!down||Math.hypot(e.clientX-down.x,e.clientY-down.y)>7){down=null;return;}down=null;const r=cv.getBoundingClientRect();pointer.set((e.clientX-r.left)/r.width*2-1,-((e.clientY-r.top)/r.height)*2+1);ray.setFromCamera(pointer,camera);const hits=ray.intersectObjects(meshes,false);if(hits.length){const i=hits[0].object.userData.layer;selectLayer(i);}});
      const resize=()=>{const w=Math.max(280,stage.clientWidth||320),h=Math.max(260,stage.clientHeight||320);renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();};
      resize();if(window.ResizeObserver){resizeObs=new ResizeObserver(resize);resizeObs.observe(stage);}else window.addEventListener('resize',resize);
      controls.addEventListener('change',()=>{});
      q('#ie-load').remove();applyMode();updateInfo();
      function frame(now){raf=requestAnimationFrame(frame);if(dead)return;const dt=Math.min(.05,(now-last)/1000||0);last=now;if(playing){time+=dt;flowLines.forEach((o,i)=>{o.rotation.y=time*(i%2?-.12:.12);});waveLines.forEach((o,i)=>{o.scale.setScalar(1+.025*Math.sin(time*(i?2.2:1.35)));});if(mode==='flow'||mode==='seismic')earthGroup.rotation.y+=dt*.025;}controls.update();renderer.render(scene,camera);}
      raf=requestAnimationFrame(frame);
    }catch(err){const el=q('#ie-load');if(el)el.textContent='Không thể khởi tạo mô hình 3D: '+err.message;}
  }
  function applyGeometry(cut){
    if(!window.THREE)return;
    meshes.forEach((m,i)=>{const old=m.geometry;const radius=i===1&&exaggerate?.94:layers[i].radius;m.geometry=makeSphereGeometry(THREE,radius,cut);old.dispose();});
    if(cutFaces.length){const T=window.THREE;const radii=[1,exaggerate?.94:layers[1].radius,layers[2].radius,layers[3].radius,0];const angles=[Math.PI*.8,Math.PI*.8+Math.PI*1.4];cutFaces.forEach((face,index)=>{const layer=Math.floor(index/2),angle=angles[index%2],old=face.geometry;face.geometry=makeCutFaceGeometry(T,radii[layer],radii[layer+1],angle);old.dispose();});}
  }
  function applyMode(){
    const cut=mode!=='surface';applyGeometry(cut);
    meshes.forEach((m,i)=>{m.visible=mode==='surface'?i===0:true;m.material.transparent=(mode==='explode'&&i===0);m.material.opacity=(mode==='explode'&&i===0)?.42:1;});
    updateExplodePositions();
    flowLines.forEach(o=>o.visible=mode==='flow');waveLines.forEach(o=>o.visible=mode==='seismic');cutFaces.forEach(o=>o.visible=mode!=='surface');
    q('#ie-mode-label').textContent=({surface:'BỀ MẶT TRÁI ĐẤT',cut:'MẶT CẮT CẤU TẠO',explode:'BÓC TÁCH CÁC LỚP',flow:'CHUYỂN ĐỘNG BÊN TRONG',seismic:'SÓNG ĐỊA CHẤN'})[mode];
    q('#ie-scale-label').textContent=exaggerate?'Vỏ Trái Đất đang được phóng đại':'Tỉ lệ gần đúng';
    q('#ie-science-note').textContent=exaggerate?'Vỏ được phóng đại rõ rệt để quan sát; kích thước này không theo tỉ lệ thực.':'Vỏ được dựng với độ dày đại diện gần 35 km so với bán kính trung bình 6.371 km; độ dày thực tế thay đổi khoảng 5–70 km.';
    root.querySelectorAll('[data-mode]').forEach(b=>b.classList.toggle('active',b.dataset.mode===mode));
    if(mode==='seismic'){q('#ie-info-title').textContent='Sóng địa chấn P và S';q('#ie-info-desc').textContent='Sóng P truyền được qua chất rắn và chất lỏng. Sóng S chỉ truyền qua chất rắn nên không truyền qua nhân ngoài đang ở trạng thái lỏng. Các đường sóng trong mô hình là sơ đồ minh họa.';setFacts([['Sóng P','Truyền qua rắn và lỏng'],['Sóng S','Chỉ truyền qua chất rắn'],['Nhân ngoài','Lỏng'],['Bằng chứng','Sóng địa chấn']]);}
    else if(mode==='flow'){q('#ie-info-title').textContent='Chuyển động bên trong';q('#ie-info-desc').textContent='Các đường chuyển động minh họa sự biến dạng và đối lưu chậm của vật chất trong lớp phủ. Chuyển động kim loại lỏng trong nhân ngoài góp phần tạo từ trường Trái Đất.';setFacts([['Lớp phủ','Rắn, biến dạng chậm'],['Nhân ngoài','Kim loại lỏng'],['Thời gian','Thang địa chất'],['Từ trường','Liên quan nhân ngoài']]);}
  }
  function updateExplodePositions(){const v=mode==='explode'?(+(q('#ie-explode')?.value||0)/100):0;meshes.forEach((m,i)=>{const d=v*[.035,.13,.23,.34][i];m.position.set(0,d,0);});cutFaces.forEach((face)=>{const layer=face.userData.layer,d=v*[.035,.13,.23,.34][layer];face.position.set(0,d,0);});}
  function setFacts(items){q('#ie-facts').innerHTML=items.map(([a,b])=>`<div class="ie-fact"><small>${a}</small><b>${b}</b></div>`).join('');}
  function selectLayer(i){selected=i;const L=layers[i];q('#ie-info-title').textContent=L.name;q('#ie-info-desc').textContent=L.desc;setFacts([['Độ sâu',L.depth],['Độ dày / kích thước',L.thickness],['Trạng thái',L.state],['Thành phần',L.material]]);root.querySelectorAll('[data-layer]').forEach(b=>b.classList.toggle('active',+b.dataset.layer===i));meshes.forEach((m,j)=>{m.material.emissive=new THREE.Color(j===i?0x34200c:0x000000);m.material.emissiveIntensity=j===i?.5:0;});cutFaces.forEach(face=>{face.material.emissive=new THREE.Color(face.userData.layer===i?0x34200c:0x000000);face.material.emissiveIntensity=face.userData.layer===i?.35:0;});}
  function updateInfo(){q('#ie-layers').innerHTML=layers.map((L,i)=>`<button class="ie-layer ${i===selected?'active':''}" data-layer="${i}"><span class="ie-dot" style="background:#${L.color.toString(16).padStart(6,'0')};color:#${L.color.toString(16).padStart(6,'0')}"></span>${L.name}</button>`).join('');root.querySelectorAll('[data-layer]').forEach(b=>b.addEventListener('click',()=>selectLayer(+b.dataset.layer)));selectLayer(0);}
  const quizAnswers={};
  root.querySelectorAll('.ie-options button').forEach(b=>b.addEventListener('click',()=>{
    const question=b.closest('.ie-question'),index=question.dataset.question;
    question.querySelectorAll('button').forEach(x=>x.classList.toggle('selected',x===b));
    quizAnswers[index]=b.dataset.answer;
    question.querySelector('.ie-feedback').textContent='';
    q('#ie-quiz-result').textContent='';
  }));
  q('#ie-quiz-check').addEventListener('click',()=>{
    const correct=['outer','no','solid'];let score=0;
    root.querySelectorAll('.ie-question').forEach((question,i)=>{
      const ok=quizAnswers[i]===correct[i];if(ok)score++;
      question.querySelector('.ie-feedback').textContent=ok?'Chính xác.':'Chưa đúng. Hãy xem lại thông tin của lớp cấu tạo tương ứng.';
      question.querySelector('.ie-feedback').style.color=ok?'#8fe0b0':'#ffc18c';
    });
    q('#ie-quiz-result').textContent='Kết quả: '+score+'/3 câu đúng';
  });
  q('#ie-tabs').addEventListener('click',e=>{const b=e.target.closest('[data-mode]');if(!b)return;mode=b.dataset.mode;applyMode();});
  q('#ie-explode').addEventListener('input',e=>{const v=+e.target.value/100;expanded=v; q('#ie-explode-val').textContent=Math.round(v*100)+'%';updateExplodePositions();});
  q('#ie-scale').addEventListener('click',()=>{exaggerate=!exaggerate;q('#ie-scale').classList.toggle('active',exaggerate);q('#ie-scale').textContent=exaggerate?'Tắt phóng đại vỏ':'Phóng đại vỏ';q('#ie-scale-label').textContent=exaggerate?'Vỏ Trái Đất đang được phóng đại':'Tỉ lệ gần đúng';if(meshes.length)applyGeometry(mode!=='surface');});
  q('#ie-play').addEventListener('click',()=>{playing=!playing;q('#ie-play').textContent=playing?'⏸ Tạm dừng':'▶ Tiếp tục';q('#ie-play').classList.toggle('active',playing);});
  q('#ie-reset').addEventListener('click',()=>{if(camera&&controls){camera.position.set(0,1.35,3.5);controls.target.set(0,0,0);controls.update();}q('#ie-explode').value=0;q('#ie-explode').dispatchEvent(new Event('input'));});
  root.querySelectorAll('[data-view]').forEach(b=>b.addEventListener('click',()=>{root.querySelectorAll('[data-view]').forEach(x=>x.classList.toggle('active',x===b));if(!camera||!controls)return;const v=b.dataset.view;if(v==='top')camera.position.set(0,3.6,.01);else if(v==='side')camera.position.set(3.4,.15,.01);else camera.position.set(0,1.35,3.5);controls.target.set(0,0,0);controls.update();}));
  load('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js',()=>window.THREE).then(()=>load('https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js',()=>window.THREE&&THREE.OrbitControls)).then(()=>{if(!dead)init();}).catch(()=>{const el=q('#ie-load');if(el)el.textContent='Không tải được thư viện 3D. Hãy kiểm tra kết nối Internet rồi mở lại mô hình.';});
  return {destroy(){dead=true;if(raf)cancelAnimationFrame(raf);if(resizeObs)resizeObs.disconnect();if(controls)controls.dispose();if(scene)scene.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material){if(Array.isArray(o.material))o.material.forEach(m=>m.dispose());else o.material.dispose();}});if(renderer){renderer.dispose();if(renderer.forceContextLoss)renderer.forceContextLoss();}}};
}
