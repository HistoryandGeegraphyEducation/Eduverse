/* EDUVERSE – Các mô phỏng địa lí 6: mảng kiến tạo, chu trình nước,
   địa hình sông, địa hình ven biển và ảnh hưởng địa hình đến khí hậu.
   Dùng Three.js đã được nạp tại index.html; không thêm thư viện phụ thuộc. */
(function(){
  "use strict";
  const THREE_REF=()=>window.THREE;
  const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  const palettes={
    rock:0x806b58,soil:0x9a7956,grass:0x557b45,water:0x238fc0,deep:0x145477,
    sand:0xc9ad78,cloud:0xe9f1f4,magma:0xf07835
  };
  function texture(T,base,grain){
    const c=document.createElement("canvas");c.width=512;c.height=512;
    const x=c.getContext("2d");x.fillStyle=base;x.fillRect(0,0,512,512);
    for(let i=0;i<9000;i++){const a=Math.random()*0.12;x.fillStyle="rgba(20,18,14,"+a+")";x.fillRect(Math.random()*512,Math.random()*512,1+Math.random()*grain,1+Math.random()*grain);}
    for(let i=0;i<260;i++){x.strokeStyle="rgba(255,255,255,"+(Math.random()*.07)+")";x.lineWidth=.5+Math.random()*2;x.beginPath();x.moveTo(Math.random()*512,Math.random()*512);x.lineTo(Math.random()*512,Math.random()*512);x.stroke();}
    const t=new T.CanvasTexture(c);t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(3,3);return t;
  }
  function mount(root,kind){
    const T=THREE_REF(); if(!T){root.innerHTML='<div class="box">Không tải được thư viện 3D. Hãy kiểm tra kết nối Internet.</div>';return {destroy(){}};}
    const titles={
      tectonic:"TƯƠNG TÁC GIỮA CÁC MẢNG KIẾN TẠO",
      water:"CHU TRÌNH NƯỚC TRONG TỰ NHIÊN",
      river:"XÂM THỰC, VẬN CHUYỂN VÀ BỒI TỤ CỦA DÒNG SÔNG",
      coast:"HÌNH THÀNH ĐỊA HÌNH VEN BIỂN",
      climate:"ẢNH HƯỞNG CỦA ĐỊA HÌNH ĐẾN KHÍ HẬU"
    };
    const intro={
      tectonic:"Quan sát chuyển động tương đối của các mảng và những dạng địa hình hình thành tại ranh giới tiếp xúc.",
      water:"Theo dõi nước di chuyển giữa biển, khí quyển, sông hồ và lòng đất.",
      river:"Quan sát dòng sông bào mòn địa hình, vận chuyển vật liệu và bồi đắp trầm tích.",
      coast:"Khám phá tác động của sóng và dòng ven bờ đối với địa hình bờ biển.",
      climate:"Thay đổi hướng gió và độ cao để quan sát sự khác nhau giữa sườn đón gió và khuất gió."
    };
    root.innerHTML=`
      <section class="evgeo" style="color:#eaf5ff;background:linear-gradient(145deg,#071b31,#102d45);border-radius:18px;overflow:hidden;padding:12px">
        <header style="display:flex;justify-content:space-between;gap:10px;align-items:center;flex-wrap:wrap">
          <div><div style="font-size:11px;letter-spacing:1.5px;color:#8fc8ed">EDUVERSE • ĐỊA LÍ 6</div>
          <b style="font-size:16px">${titles[kind]}</b></div>
          <span style="font-size:11px;color:#a9cde2">MÔ HÌNH 3D TƯƠNG TÁC</span>
        </header>
        <p style="font-size:12px;line-height:1.5;color:#c3d9e8;margin:8px 0">${intro[kind]}</p>
        <div class="evgeo-stage" style="height:min(58vh,480px);min-height:300px;position:relative;border-radius:13px;overflow:hidden;background:linear-gradient(#7eb5d0,#d5e5df 60%,#426b50)">
          <canvas style="width:100%;height:100%;display:block;touch-action:none"></canvas>
          <div class="evgeo-label" style="position:absolute;left:10px;top:10px;background:#071b31c9;padding:7px 10px;border-radius:8px;font-size:11px">TOÀN CẢNH 3D</div>
          <div class="evgeo-readout" style="position:absolute;right:10px;top:10px;background:#071b31c9;padding:7px 10px;border-radius:8px;font-size:11px">Sẵn sàng</div>
        </div>
        <div class="evgeo-controls" style="display:flex;gap:7px;flex-wrap:wrap;margin-top:10px"></div>
        <div class="evgeo-info" style="margin-top:9px;padding:10px 12px;border-radius:10px;background:#ffffff12;font-size:12px;line-height:1.55;color:#d8e9f5" aria-live="polite">${intro[kind]}</div>
        <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-top:9px">
          <button data-action="play">▶ Bắt đầu</button><button data-action="pause">Ⅱ Tạm dừng</button><button data-action="reset">↺ Đặt lại</button>
          <label style="font-size:11px;color:#c3d9e8">Tốc độ <input data-speed type="range" min=".25" max="3" step=".25" value="1" style="width:90px;vertical-align:middle"></label>
          <span style="font-size:10px;color:#9ebbd0">Chuyển động được tăng tốc để dễ quan sát.</span>
        </div>
      </section>`;
    const stage=root.querySelector(".evgeo-stage"),canvas=stage.querySelector("canvas"),info=root.querySelector(".evgeo-info"),readout=root.querySelector(".evgeo-readout"),controls=root.querySelector(".evgeo-controls");
    const style=document.createElement("style");style.textContent=`.evgeo button{border:1px solid #5b87a4;background:#17415d;color:#f1f8ff;border-radius:9px;padding:8px 11px;font-size:12px;cursor:pointer}.evgeo button.active{background:#167b9c;border-color:#8bdcff}.evgeo button:focus-visible{outline:2px solid #fff;outline-offset:2px}`;root.appendChild(style);
    let renderer,scene,camera,orbit,raf=0,dead=false,playing=false,clock=0,speed=1,resizeObserver=null,variant=0;
    const animated=[],disposables=[];
    const mat=(color,rough=.9,extra={})=>new T.MeshStandardMaterial({color,roughness:rough,...extra});
    const add=(geo,m,x=0,y=0,z=0)=>{const o=new T.Mesh(geo,m);o.position.set(x,y,z);scene.add(o);return o;};
    const box=(w,h,d,m,x,y,z)=>add(new T.BoxGeometry(w,h,d),m,x,y,z);
    const sphere=(r,m,x,y,z,scale)=>{const o=add(new T.SphereGeometry(r,28,18),m,x,y,z);if(scale)o.scale.set(...scale);return o;};
    const line=(pts,color=0xffffff,opacity=.8)=>{const g=new T.BufferGeometry().setFromPoints(pts.map(p=>new T.Vector3(...p)));const o=new T.Line(g,new T.LineBasicMaterial({color,transparent:true,opacity}));scene.add(o);return o;};
    const terrain=(w,d,fn,material,segments=90)=>{const g=new T.PlaneGeometry(w,d,segments,segments);g.rotateX(-Math.PI/2);const p=g.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i);p.setY(i,fn(x,z));}g.computeVertexNormals();return add(g,material);};
    function addCloud(x,y,z,scale=1){const g=new T.Group();for(let i=0;i<6;i++){const o=new T.Mesh(new T.SphereGeometry(.34+Math.random()*.2,18,12),mat(0xf4f7f8,.98));o.position.set((i-2.5)*.27,Math.random()*.16,Math.random()*.12);o.scale.set(1.25,.72,1);g.add(o);}g.position.set(x,y,z);g.scale.setScalar(scale);scene.add(g);animated.push({obj:g,type:"cloud",base:x});return g;}
    function particles(color,count,spread){const arr=[];for(let i=0;i<count;i++){const o=sphere(.025,mat(color,.5,{transparent:true,opacity:.8}), (Math.random()-.5)*spread,Math.random()*2,(Math.random()-.5)*spread);arr.push(o);}animated.push({type:"particles",items:arr});return arr;}
    function terrainMaterial(base){return mat(0xffffff,.96,{map:texture(T,base,3)});}
    function buildTectonic(){
      scene.background=new T.Color(0x9fc9d9);
      terrain(12,8,(x,z)=>-.8+.07*Math.sin(x*1.7)+.05*Math.cos(z*2),terrainMaterial("#92785d"));
      const crust=terrainMaterial("#b18c67"),side=mat(0x655344),magma=mat(0xef7136,.55,{emissive:0x6b210c,emissiveIntensity:.35});
      const left=box(4,.8,5,crust,-2,.05,0),right=box(4,.8,5,crust,2,.05,0);
      const mantle=box(10,.7,5,magma,0,-.72,0);mantle.material=mat(0xd45b2d,.7,{emissive:0x6b210c,emissiveIntensity:.22});
      const fault=line([[0,.5,-2.5],[0,-.9,-1.3],[0,-.9,1.3],[0,.5,2.5]],0xffd7a0,1);
      const ridge=sphere(.12,mat(0xffc06b,.4,{emissive:0x9d3c14}),0,.5,0,[.7,1,8]);
      animated.push({obj:left,type:"plate",dir:-1},{obj:right,type:"plate",dir:1},{obj:ridge,type:"pulse"});
      const labels=[["Vỏ Trái Đất",-3,.7,2],["Lớp phủ",0,-1.15,2],["Ranh giới mảng",0,1.1,-2]];
      labels.forEach(([t,x,y,z])=>{const s=sphere(.055,mat(0xffe6a8),x,y,z);s.userData.label=t;});
      return {left,right,mantle,fault};
    }
    function buildWater(){
      scene.background=new T.Color(0x9bc9df);
      terrain(13,9,(x,z)=>.25+1.0*Math.exp(-Math.pow((x+2.5)/2.4,2))+.25*Math.sin(z*1.3),terrainMaterial("#4d7950"));
      const sea=add(new T.PlaneGeometry(13,4,1,1),mat(0x1689bd,.25,{transparent:true,opacity:.88,metalness:.12}),0,.08,2.5);sea.rotation.x=-Math.PI/2;animated.push({obj:sea,type:"water"});
      for(let i=0;i<4;i++)addCloud(-3+i*1.7,3.1+Math.sin(i)*.2,-1.5,.9);
      const rain=particles(0xb9e8ff,110,7);rain.forEach(o=>{o.position.y=Math.random()*3+1;o.userData.rain=true;});
      const riverPts=[];for(let i=0;i<=60;i++){const z=-4+i*.13;riverPts.push([-.3+Math.sin(i*.11)*.5,.13,z]);}
      line(riverPts,0x1f9bc9,.95);
      // Lớp cắt địa chất phía trước để thấy nước thấm xuống tầng đất.
      box(7,.8,.25,mat(0x9a7652),0,-.55,-4.3);box(7,.3,.25,mat(0x554c42),0,-1.1,-4.3);
      for(let i=0;i<22;i++){const x=-3.2+Math.random()*6.4;line([[x,.3,-4.12],[x+.12,-.35,-4.12],[x+.2,-.9,-4.12]],0x63c9ef,.65);}
      return {rain,sea};
    }
    function buildRiver(){
      scene.background=new T.Color(0xadd0df);
      terrain(13,9,(x,z)=>.1+Math.max(0,-z)*.18+.16*Math.sin(x*1.3+z),terrainMaterial("#68845a"));
      const pts=[];for(let i=0;i<=150;i++){const z=-4.3+i*.057;const x=Math.sin(i*.055)*1.65;pts.push([x,.18,z]);}
      const curve=new T.CatmullRomCurve3(pts.map(p=>new T.Vector3(...p)));
      const river=add(new T.TubeGeometry(curve,180,.32,12,false),mat(0x238fc0,.2,{transparent:true,opacity:.92,metalness:.08}));
      const bars=[];
      for(let i=0;i<8;i++){const z=-3.5+i*.95,x=Math.sin(i*.8)*1.5;const b=sphere(.38,terrainMaterial("#c3a16e"),x,.1,z,[1.4,.15,.7]);bars.push(b);}
      const sed=particles(0xc6a36c,65,5);sed.forEach(o=>{o.position.y=.22+Math.random()*.12;});
      animated.push({obj:river,type:"river"});
      return {river,bars,sed};
    }
    function buildCoast(){
      scene.background=new T.Color(0x9bc9df);
      terrain(13,8,(x,z)=>z<-.5?1.15+.35*Math.sin(x*1.1):z<.8?.1:-.18,terrainMaterial("#9a825e"));
      // Bờ đá, mặt cắt đá và thềm sóng.
      const cliff=box(5,1.6,1.15,terrainMaterial("#8c7966"),-2.2,.8,-1.05);
      const cliffTop=terrain(5,4,(x,z)=>1.2+.35*Math.sin(x*1.1),terrainMaterial("#718b58"),48);
      const sea=add(new T.PlaneGeometry(7,6,36,24),mat(0x188fc1,.22,{transparent:true,opacity:.9}),2.8,.05,1.4);sea.rotation.x=-Math.PI/2;animated.push({obj:sea,type:"water"});
      const sand=add(new T.CylinderGeometry(1.0,.55,.12,48),terrainMaterial("#d1b27c"),1.6,.12,-.15);sand.scale.set(1.8,1, .55);
      const waveLines=[];for(let i=0;i<5;i++){const l=line([[-.2+i*.2,.18,2.8],[1.4+i*.2,.18,2.5],[3+i*.2,.18,2.2],[5+i*.2,.18,1.9]],0xd7f5ff,.7);waveLines.push(l);}
      animated.push({type:"waves",items:waveLines});
      return {cliff,sea,sand};
    }
    function buildClimate(){
      scene.background=new T.Color(0x9dc6dc);
      terrain(13,9,(x,z)=>.15+2.25*Math.exp(-Math.pow((x+.1)/1.8,2))+.2*Math.sin(z*1.2),terrainMaterial("#5b8251"));
      // Hai sườn núi được phủ vật liệu khác nhau để phân biệt đón gió và khuất gió.
      const summit=sphere(.18,mat(0xe9f1ef),0,2.35,-.1,[2.2,.45,1.4]);
      for(let i=0;i<5;i++)addCloud(-4+i*.75,3.4,-2.4,.8);
      const rain=particles(0xb8e8ff,90,4);rain.forEach(o=>o.userData.rain=true);
      const wind=[];for(let i=0;i<7;i++){wind.push(line([[-5,2.2+i*.13,-2],[ -3,2.35+i*.13,-2],[-1,2.5+i*.13,-2]],0xf2fbff,.65));}
      animated.push({type:"wind",items:wind});
      return {summit,rain};
    }
    scene=new T.Scene();camera=new T.PerspectiveCamera(43,1,.1,100);camera.position.set(8,6,10);
    renderer=new T.WebGLRenderer({canvas,antialias:true,alpha:false,powerPreference:"low-power"});
    renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.7));renderer.shadowMap.enabled=true;
    scene.add(new T.HemisphereLight(0xe7f6ff,0x3b4938,1.7));
    const sun=new T.DirectionalLight(0xfff0d8,2.1);sun.position.set(-4,9,6);sun.castShadow=true;scene.add(sun);
    const ground=box(14,.15,10,mat(0x344d43),0,-1.55,0);ground.receiveShadow=true;
    let objects;
    if(kind==="tectonic")objects=buildTectonic();
    if(kind==="water")objects=buildWater();
    if(kind==="river")objects=buildRiver();
    if(kind==="coast")objects=buildCoast();
    if(kind==="climate")objects=buildClimate();
    if(T.OrbitControls){orbit=new T.OrbitControls(camera,canvas);orbit.enableDamping=true;orbit.dampingFactor=.06;orbit.maxPolarAngle=Math.PI*.49;orbit.minDistance=5;orbit.maxDistance=22;}
    const btn=(label,action)=>{const b=document.createElement("button");b.textContent=label;b.dataset.action=action;controls.appendChild(b);b.onclick=()=>{variant=action;applyVariant(action);};};
    if(kind==="tectonic"){btn("Mảng tách xa","diverge");btn("Mảng xô vào","converge");btn("Mảng trượt ngang","transform");}
    if(kind==="water"){btn("Bốc hơi","evaporate");btn("Ngưng tụ","condense");btn("Mưa và dòng chảy","rain");btn("Nước ngầm","groundwater");}
    if(kind==="river"){btn("Thượng lưu","upper");btn("Trung lưu","middle");btn("Hạ lưu","lower");btn("Trầm tích","sediment");}
    if(kind==="coast"){btn("Xâm thực","erosion");btn("Dòng ven bờ","drift");btn("Bồi tụ","deposit");}
    if(kind==="climate"){btn("Sườn đón gió","windward");btn("Sườn khuất gió","leeward");btn("Đổi hướng gió","reverse");}
    function applyVariant(action){
      controls.querySelectorAll("button").forEach(b=>b.classList.toggle("active",b.dataset.action===action));
      const messages={
        diverge:"Hai mảng dịch chuyển ra xa. Vật chất nóng có thể đi lên và tạo vỏ mới tại một số ranh giới phân kỳ.",
        converge:"Hai mảng tiến lại gần. Tùy loại vỏ, có thể xảy ra hút chìm hoặc va chạm lục địa.",
        transform:"Hai mảng trượt ngang tương đối dọc theo đới đứt gãy.",
        evaporate:"Năng lượng Mặt Trời làm nước chuyển từ thể lỏng thành hơi nước. Hơi nước không nhìn thấy bằng mắt thường.",
        condense:"Không khí ẩm lạnh đi; hơi nước ngưng tụ thành các giọt nước nhỏ tạo thành mây.",
        rain:"Nước rơi xuống bề mặt; một phần chảy tràn, một phần thấm xuống đất.",
        groundwater:"Nước thấm qua đất và đá có lỗ rỗng hoặc khe nứt, bổ sung cho nước ngầm.",
        upper:"Thượng lưu thường có độ dốc lớn, dòng chảy có năng lực xâm thực mạnh.",
        middle:"Ở trung lưu, sông thường mở rộng và uốn khúc; bờ ngoài có xu hướng xói mòn, bờ trong có xu hướng bồi tụ.",
        lower:"Ở hạ lưu, dòng chảy thường chậm hơn và có thể tích tụ phù sa.",
        sediment:"Hạt lớn thường di chuyển sát đáy; vật liệu mịn có thể lơ lửng trong nước.",
        erosion:"Sóng tác động vào chân vách đá, làm đá nứt vỡ và vật liệu bị cuốn đi.",
        drift:"Sóng tới bờ theo góc xiên có thể tạo dòng ven bờ, vận chuyển cát dọc đường bờ.",
        deposit:"Khi năng lượng dòng nước giảm, cát và vật liệu có thể tích tụ thành bãi hoặc doi cát.",
        windward:"Không khí ẩm bị địa hình nâng lên, lạnh đi và có thể tạo mưa ở sườn đón gió.",
        leeward:"Không khí hạ xuống ở sườn khuất gió thường khô hơn; đây là một cơ chế tạo bóng mưa.",
        reverse:"Đổi hướng gió để xác định sườn đón gió và sườn khuất gió mới."
      };
      info.textContent=messages[action]||intro[kind];readout.textContent=action.toUpperCase();
      if(kind==="tectonic")animated.filter(a=>a.type==="plate").forEach(a=>a.dir=action==="diverge"?(a.obj.position.x<0?-1:1):action==="converge"?(a.obj.position.x<0?1:-1):(a.obj.position.x<0?0:0));
      if(kind==="climate")animated.filter(a=>a.type==="wind").forEach(a=>a.reverse=action==="reverse");
      if(kind==="river")readout.textContent=({upper:"THƯỢNG LƯU",middle:"TRUNG LƯU",lower:"HẠ LƯU",sediment:"VẬN CHUYỂN TRẦM TÍCH"})[action];
    }
    root.querySelector('[data-action="play"]').onclick=()=>{playing=true;info.textContent="Đang chạy diễn biến mô phỏng. Có thể chọn từng kịch bản để quan sát.";};
    root.querySelector('[data-action="pause"]').onclick=()=>{playing=false;info.textContent="Mô phỏng đã tạm dừng.";};
    root.querySelector('[data-action="reset"]').onclick=()=>{clock=0;playing=false;animated.filter(a=>a.type==="plate").forEach(a=>a.obj.position.x=a.obj.position.x<0?-2:2);info.textContent=intro[kind];readout.textContent="Sẵn sàng";};
    root.querySelector("[data-speed]").oninput=e=>speed=+e.target.value;
    function resize(){const w=Math.max(280,stage.clientWidth),h=Math.max(260,stage.clientHeight);renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();}
    resize();if(window.ResizeObserver){resizeObserver=new ResizeObserver(resize);resizeObserver.observe(stage);}else window.addEventListener("resize",resize);
    function animate(){raf=requestAnimationFrame(animate);if(dead)return;if(playing){clock+=.016*speed;animated.forEach(a=>{
      if(a.type==="plate")a.obj.position.x+=a.dir*.0015*speed;
      if(a.type==="cloud")a.obj.position.x+=.001*speed;
      if(a.type==="pulse")a.obj.scale.y=1+.15*Math.sin(clock*2);
      if(a.type==="water")a.obj.position.y=.08+Math.sin(clock*1.6)*.035;
      if(a.type==="river")a.obj.material.opacity=.78+.12*Math.sin(clock*2);
      if(a.type==="waves")a.items.forEach((o,i)=>o.position.z=Math.sin(clock*1.5+i)*.08);
      if(a.type==="wind")a.items.forEach(o=>o.position.x=Math.sin(clock*1.4)*(a.reverse?-1:1)*.12);
      if(a.type==="particles")a.items.forEach(o=>{if(o.userData.rain){o.position.y-=.035*speed;if(o.position.y<-.9)o.position.y=2.8+Math.random();}else{o.position.z+=.012*speed;if(o.position.z>4)o.position.z=-4;}});
    });}
    if(orbit)orbit.update();renderer.render(scene,camera);}
    animate();
    return {destroy(){dead=true;cancelAnimationFrame(raf);if(resizeObserver)resizeObserver.disconnect();if(orbit)orbit.dispose();if(scene)scene.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material){if(Array.isArray(o.material))o.material.forEach(m=>m.dispose());else o.material.dispose();}});renderer.dispose();}};
  }
  window.simTectonics=root=>mount(root,"tectonic");
  window.simWaterCycle=root=>mount(root,"water");
  window.simRiverProcess=root=>mount(root,"river");
  window.simCoastalLandforms=root=>mount(root,"coast");
  window.simClimateRelief=root=>mount(root,"climate");
})();