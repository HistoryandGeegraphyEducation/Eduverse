/* EDUVERSE | Địa lí 6
 * Bộ mô phỏng 3D: mảng kiến tạo, chu trình nước, quá trình sông,
 * địa hình ven biển và ảnh hưởng địa hình đến khí hậu.
 * Dùng Three.js r147 + OrbitControls đã nạp từ index.html.
 */
(function () {
  "use strict";

  function compatibilityView(root, kind, error) {
    const old=root.querySelector('.evgeo-view');
    if(!old) return;
    const box=document.createElement('div');
    box.className='evgeo-view'; box.style.cssText='height:clamp(300px,56vh,510px);min-height:280px;position:relative;overflow:hidden;border-radius:13px;background:#a9cbdc';
    const canvas=document.createElement('canvas'); canvas.style.cssText='width:100%;height:100%;display:block'; box.appendChild(canvas);
    const tag=document.createElement('div');tag.className='evgeo-viewtag';tag.textContent='CHẾ ĐỘ TƯƠNG THÍCH · CANVAS 2D';box.appendChild(tag);
    old.replaceWith(box);
    const ctx=canvas.getContext('2d');
    if(!ctx){box.textContent='Trình duyệt không hỗ trợ Canvas 2D.';return;}
    function draw(){
      const w=Math.max(280,box.clientWidth),h=Math.max(260,box.clientHeight),d=Math.min(window.devicePixelRatio||1,2);
      canvas.width=w*d;canvas.height=h*d;ctx.setTransform(d,0,0,d,0,0);
      const g=ctx.createLinearGradient(0,0,0,h);g.addColorStop(0,'#9bc5d8');g.addColorStop(1,'#e2e8d9');ctx.fillStyle=g;ctx.fillRect(0,0,w,h);
      const y=h*.68;ctx.fillStyle='#66865a';ctx.fillRect(0,y,w,h-y);ctx.font='bold 13px system-ui';ctx.fillStyle='#173e50';
      if(kind==='tectonic'){ctx.fillStyle='#9b7958';ctx.fillRect(0,y-40,w*.48,110);ctx.fillStyle='#b18b65';ctx.fillRect(w*.52,y-40,w*.48,110);ctx.fillStyle='#c15c39';ctx.fillRect(0,y+70,w,55);ctx.fillStyle='#fff';ctx.fillText('VỎ TRÁI ĐẤT · RANH GIỚI MẢNG',12,24);}
      else if(kind==='water'){ctx.fillStyle='#168db8';ctx.fillRect(0,y,w,h-y);ctx.beginPath();ctx.moveTo(w*.25,y);ctx.lineTo(w*.42,h*.35);ctx.lineTo(w*.58,y);ctx.fillStyle='#718b5b';ctx.fill();ctx.fillStyle='#173e50';ctx.fillText('BỐC HƠI → NGƯNG TỤ → MƯA → DÒNG CHẢY',12,26);}
      else if(kind==='river'){ctx.beginPath();ctx.moveTo(0,y-95);ctx.lineTo(w*.25,y-5);ctx.lineTo(w*.5,y+15);ctx.lineTo(w,y+55);ctx.lineTo(w,h);ctx.lineTo(0,h);ctx.fillStyle='#78915e';ctx.fill();ctx.beginPath();ctx.moveTo(w*.18,y-45);ctx.bezierCurveTo(w*.25,y+40,w*.62,y-15,w*.8,h*.84);ctx.strokeStyle='#238fbd';ctx.lineWidth=24;ctx.stroke();ctx.fillStyle='#fff';ctx.fillText('THƯỢNG LƯU · TRUNG LƯU · HẠ LƯU',12,24);}
      else if(kind==='coast'){ctx.fillStyle='#168db8';ctx.fillRect(0,y,w,h-y);ctx.fillStyle='#c8ae7b';ctx.fillRect(0,y-55,w*.52,55);ctx.fillStyle='#173e50';ctx.fillText('VÁCH BIỂN · BÃI CÁT · DÒNG VEN BỜ',12,24);}
      else {ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w*.2,h*.45);ctx.lineTo(w*.38,h*.16);ctx.lineTo(w*.57,h*.48);ctx.lineTo(w,h*.7);ctx.lineTo(w,h);ctx.lineTo(0,h);ctx.fillStyle='#748d5d';ctx.fill();ctx.fillStyle='#173e50';ctx.fillText('SƯỜN ĐÓN GIÓ · SƯỜN KHUẤT GIÓ',12,24);}
    }
    draw(); if(window.ResizeObserver){const ro=new ResizeObserver(draw);ro.observe(box);}
    const note=root.querySelector('.evgeo-explain');if(note)note.textContent='WebGL không khởi tạo được. Đang hiển thị sơ đồ Canvas 2D tương thích. Lỗi gốc: '+String(error||'không xác định');
    console.warn('[EDUVERSE] WebGL fallback:',error);
  }
  const THREE = window.THREE;
  if (!THREE) {
    const fail = (root,kind) => {
      root.innerHTML='<section class="evgeo"><div class="evgeo-head"><h2>Không tải được thư viện 3D</h2></div><div class="evgeo-view"></div><div class="evgeo-explain"></div></section>';
      compatibilityView(root,kind,'Three.js CDN không tải được');
      return {destroy(){}};
    };
    window.simTectonics=root=>fail(root,'tectonic');
    window.simWaterCycle=root=>fail(root,'water');
    window.simRiverProcess=root=>fail(root,'river');
    window.simCoastalLandforms=root=>fail(root,'coast');
    window.simClimateRelief=root=>fail(root,'climate');
    return;
  }

  const C = {
    sky: 0xa9cbdc, skyDark: 0x8eb5c9, soil: 0x8d694b, soilLight: 0xb08b62,
    rock: 0x71685d, rockDark: 0x514b45, grass: 0x547c48, grassLight: 0x78945b,
    water: 0x1689b8, waterDeep: 0x07577d, foam: 0xd8f4f5, cloud: 0xf5f7f6,
    rain: 0x9bdcf5, sand: 0xcdb17b, magma: 0xe66a32, snow: 0xe8f0ed
  };

  const MAT = (color, roughness = .88, extra = {}) =>
    new THREE.MeshStandardMaterial({ color, roughness, ...extra });

  function makeTexture(base, seed, scale = 1) {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 512;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, 512, 512);
    let n = seed >>> 0;
    const rand = () => {
      n = (n * 1664525 + 1013904223) >>> 0;
      return n / 4294967296;
    };
    for (let i = 0; i < 18000; i++) {
      const v = rand(), a = .025 + rand() * .13;
      ctx.fillStyle = v > .52 ? "rgba(255,245,220," + a + ")" : "rgba(28,24,18," + a + ")";
      const s = .5 + rand() * 4 * scale;
      ctx.fillRect(rand() * 512, rand() * 512, s, s);
    }
    for (let i = 0; i < 90; i++) {
      ctx.strokeStyle = "rgba(40,35,28," + (.025 + rand() * .07) + ")";
      ctx.lineWidth = .5 + rand() * 2;
      ctx.beginPath();
      const x = rand() * 512, y = rand() * 512;
      ctx.moveTo(x, y);
      ctx.lineTo(x + (rand() - .5) * 90, y + (rand() - .5) * 90);
      ctx.stroke();
    }
    const map = new THREE.CanvasTexture(canvas);
    map.wrapS = map.wrapT = THREE.RepeatWrapping;
    map.repeat.set(2.5, 2.5);
    map.colorSpace = THREE.SRGBColorSpace || map.colorSpace;
    return map;
  }

  const TEX = {
    grass: makeTexture("#668452", 17),
    soil: makeTexture("#987653", 23),
    rock: makeTexture("#81786b", 31),
    sand: makeTexture("#c8ad7c", 41),
    seabed: makeTexture("#786b56", 53),
    sediment: makeTexture("#b69a6a", 67)
  };

  function terrainMaterial(map, color = 0xffffff) {
    return new THREE.MeshStandardMaterial({ map, color, roughness: .98, vertexColors: true });
  }

  function makeTerrain(width, depth, nx, nz, heightFn, map, colorFn) {
    const geo = new THREE.PlaneGeometry(width, depth, nx, nz);
    geo.rotateX(-Math.PI / 2);
    const p = geo.attributes.position;
    const colors = [];
    const base = new THREE.Color(0xffffff);
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), z = p.getZ(i), y = heightFn(x, z);
      p.setY(i, y);
      const col = colorFn ? colorFn(x, z, y) : base;
      colors.push(col.r, col.g, col.b);
    }
    geo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    geo.computeVertexNormals();
    const mesh = new THREE.Mesh(geo, terrainMaterial(map, 0xffffff));
    mesh.receiveShadow = true;
    return mesh;
  }

  function meshBox(scene, w, h, d, material, x, y, z) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
    m.position.set(x, y, z);
    m.castShadow = m.receiveShadow = true;
    scene.add(m);
    return m;
  }

  function addLine(scene, points, color = 0xffffff, opacity = .8, radius = 0) {
    const curve = new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(...p)));
    let obj;
    if (radius) {
      obj = new THREE.Mesh(new THREE.TubeGeometry(curve, Math.max(32, points.length * 8), radius, 7, false),
        new THREE.MeshStandardMaterial({ color, roughness: .45, transparent: opacity < 1, opacity }));
    } else {
      obj = new THREE.Line(new THREE.BufferGeometry().setFromPoints(curve.getPoints(100)),
        new THREE.LineBasicMaterial({ color, transparent: opacity < 1, opacity }));
    }
    scene.add(obj);
    return obj;
  }

  function makeCloud(scene, x, y, z, scale = 1, animated = []) {
    const group = new THREE.Group();
    const material = MAT(C.cloud, .96);
    [[0,0,0,.55],[.48,.08,0,.43],[-.45,.04,.03,.4],[.08,.23,0,.42]].forEach(([a,b,c,r]) => {
      const puff = new THREE.Mesh(new THREE.SphereGeometry(r, 20, 14), material);
      puff.position.set(a,b,c); puff.scale.y = .72; group.add(puff);
    });
    group.position.set(x,y,z); group.scale.setScalar(scale); scene.add(group);
    animated.push(t => { group.position.x = x + Math.sin(t * .12 + z) * .12; });
    return group;
  }

  function makeParticles(scene, count, color, bounds, size = .035) {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const velocities = [];
    for (let i = 0; i < count; i++) {
      positions[i*3] = (Math.random() - .5) * bounds.x;
      positions[i*3+1] = Math.random() * bounds.y;
      positions[i*3+2] = (Math.random() - .5) * bounds.z;
      velocities.push(.25 + Math.random() * .7);
    }
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const points = new THREE.Points(geometry, new THREE.PointsMaterial({
      color, size, transparent: true, opacity: .8, depthWrite: false, sizeAttenuation: true
    }));
    scene.add(points);
    return { points, velocities, bounds };
  }

  function makeWaterSurface(scene, width, depth, x, y, z, opts = {}) {
    const geo = new THREE.PlaneGeometry(width, depth, opts.segments || 80, opts.segments || 60);
    geo.rotateX(-Math.PI / 2);
    const material = new THREE.MeshPhysicalMaterial({
      color: opts.color || C.water, roughness: .22, metalness: .08,
      transparent: true, opacity: opts.opacity || .88,
      clearcoat: .55, clearcoatRoughness: .2, side: THREE.DoubleSide
    });
    const water = new THREE.Mesh(geo, material);
    water.position.set(x,y,z);
    water.receiveShadow = true;
    scene.add(water);
    const base = geo.attributes.position.array.slice();
    return {
      mesh: water,
      update(t, amp = .08) {
        const p = geo.attributes.position;
        for (let i = 0; i < p.count; i++) {
          const bx = base[i*3], bz = base[i*3+2];
          p.setY(i, base[i*3+1] + Math.sin(bx * .85 + t * 1.35) * amp +
            Math.cos(bz * 1.1 - t * .9) * amp * .48);
        }
        p.needsUpdate = true;
        geo.computeVertexNormals();
      }
    };
  }

  function seedParticles(system, range) {
    if(!system||!system.points)return;
    const a=system.points.geometry.attributes.position;
    for(let i=0;i<a.count;i++)a.setXYZ(i,range.x[0]+Math.random()*(range.x[1]-range.x[0]),range.y[0]+Math.random()*(range.y[1]-range.y[0]),range.z[0]+Math.random()*(range.z[1]-range.z[0]));
    a.needsUpdate=true;
  }
  function addTree(scene,x,y,z,scale=1) {
    const g=new THREE.Group();
    const trunk=new THREE.Mesh(new THREE.CylinderGeometry(.055*scale,.09*scale,.55*scale,7),MAT(0x725039));trunk.position.y=.28*scale;g.add(trunk);
    [[.42,.48],[.68,.35],[.9,.22]].forEach(([h,r],i)=>{const crown=new THREE.Mesh(new THREE.ConeGeometry(r*scale,.62*scale,8),MAT(i===1?0x527b48:0x638b50));crown.position.y=h*scale;g.add(crown);});
    g.position.set(x,y,z);scene.add(g);return g;
  }
  function addRockPillar(scene,x,y,z,height=1.2,color=0x766d60) {
    const rock=new THREE.Mesh(new THREE.CylinderGeometry(.28,.42,height,7,2),MAT(color));rock.position.set(x,y+height/2,z);scene.add(rock);return rock;
  }

  function addLabel(view, text, x, y) {
    const el = document.createElement("span");
    el.className = "evgeo-label";
    el.textContent = text;
    el.style.left = x + "%"; el.style.top = y + "%";
    view.appendChild(el);
    return el;
  }

  function mount(root, kind) {
    const configs = {
      tectonic: {
        title: "TƯƠNG TÁC GIỮA CÁC MẢNG KIẾN TẠO",
        lead: "Quan sát cách các mảng thạch quyển dịch chuyển và tác động tại ranh giới tiếp xúc.",
        controls: [["Tách giãn","diverge"],["Hội tụ: ĐD–LĐ","converge"],["Va chạm: LĐ–LĐ","collision"],["Hội tụ: ĐD–ĐD","islandarc"],["Trượt ngang","transform"]]
      },
      water: {
        title: "CHU TRÌNH NƯỚC TRONG TỰ NHIÊN",
        lead: "Theo dõi nước tuần hoàn giữa đại dương, khí quyển, lục địa, sông hồ và nước ngầm.",
        controls: [["Toàn chu trình","cycle"],["Bốc hơi – ngưng tụ","evaporation"],["Thoát hơi thực vật","transpiration"],["Mưa – dòng chảy","precipitation"],["Thấm xuống đất","infiltration"]]
      },
      river: {
        title: "XÂM THỰC, VẬN CHUYỂN VÀ BỒI TỤ CỦA DÒNG SÔNG",
        lead: "Quan sát sự thay đổi của dòng chảy và vật liệu từ thượng lưu đến hạ lưu.",
        controls: [["Thượng lưu","upper"],["Xâm thực","erosion"],["Vận chuyển","transport"],["Trung lưu","middle"],["Bồi tụ","deposition"],["Hạ lưu","lower"]]
      },
      coast: {
        title: "HÌNH THÀNH ĐỊA HÌNH VEN BIỂN",
        lead: "Sóng và dòng ven bờ làm biến đổi bờ đá, bãi cát và các dạng địa hình tích tụ.",
        controls: [["Bờ xâm thực","erosion"],["Dòng ven bờ","drift"],["Bờ bồi tụ","deposition"],["Thủy triều","tide"]]
      },
      climate: {
        title: "ẢNH HƯỞNG CỦA ĐỊA HÌNH ĐẾN KHÍ HẬU",
        lead: "Không khí ẩm bị địa hình nâng lên, gây mưa ở sườn đón gió; sườn khuất gió thường khô hơn.",
        controls: [["Sườn đón gió","windward"],["Sườn khuất gió","leeward"],["Đổi hướng gió","reverse"]]
      }
    };
    const cfg = configs[kind];
    if (!cfg) return { destroy() {} };

    root.innerHTML = `
      <section class="evgeo">
        <div class="evgeo-head">
          <div><div class="evgeo-kicker">EDUVERSE · ĐỊA LÍ 6 · MÔ PHỎNG 3D</div>
          <h2>${cfg.title}</h2></div>
          <span class="evgeo-live">TƯƠNG TÁC</span>
        </div>
        <p class="evgeo-lead">${cfg.lead}</p>
        <div class="evgeo-view">
          <canvas aria-label="Mô hình địa lí ba chiều"></canvas>
          <div class="evgeo-viewtag">GÓC NHÌN 3D · KÉO ĐỂ XOAY · CUỘN ĐỂ ZOOM</div>
          <div class="evgeo-readout">TOÀN CẢNH</div>
        </div>
        <div class="evgeo-buttons"></div>
        <div class="evgeo-process"><b>DIỄN BIẾN</b><div class="evgeo-process-track"><i data-progress></i></div><span data-stage>Chờ bắt đầu</span></div>
        <div class="evgeo-explain" aria-live="polite">${cfg.lead}</div>
        <div class="evgeo-footer">
          <button data-run="play">▶ Chạy diễn biến</button>
          <button data-run="pause">Ⅱ Tạm dừng</button>
          <button data-run="reset">↺ Đặt lại</button>
          <label>Tốc độ <input data-speed type="range" min=".25" max="2.5" step=".25" value="1"></label>
          <label>Cường độ <input data-force type="range" min=".25" max="2" step=".25" value="1"></label>
          <span>Điều chỉnh để so sánh mức độ tác động.</span>
        </div>
      </section>`;

    const style = document.createElement("style");
    style.textContent = `
      .evgeo{color:#edf6fb;background:linear-gradient(145deg,#071b2c,#12364a);border:1px solid #24475c;border-radius:18px;padding:clamp(10px,2vw,17px);overflow:hidden}
      .evgeo-head{display:flex;justify-content:space-between;align-items:flex-start;gap:12px}
      .evgeo-kicker{font-size:10px;letter-spacing:1.5px;color:#8fc5df;font-weight:700}
      .evgeo h2{font-size:clamp(14px,2vw,19px);line-height:1.35;margin:5px 0 0;font-weight:800}
      .evgeo-live{font-size:9px;letter-spacing:1px;border:1px solid #4c849d;color:#b8e6f5;padding:5px 8px;border-radius:20px;white-space:nowrap}
      .evgeo-lead{font-size:12px;line-height:1.55;color:#c7dce8;margin:9px 0 12px}
      .evgeo-view{height:clamp(300px,56vh,510px);min-height:280px;position:relative;overflow:hidden;border-radius:13px;background:linear-gradient(#9fc5d8,#d5e0d9 66%,#657d61);box-shadow:inset 0 0 35px #173a4d55}
      .evgeo-view canvas{width:100%;height:100%;display:block;touch-action:none}
      .evgeo-label{position:absolute;z-index:2;transform:translate(-8%,-50%);padding:5px 8px;border-radius:6px;background:#08283bcf;border:1px solid #ffffff42;color:#f5fbff;font-size:9px;font-weight:700;letter-spacing:.4px;pointer-events:none;white-space:nowrap;text-shadow:0 1px 2px #000}.evgeo-viewtag,.evgeo-readout{position:absolute;top:10px;background:#071b2cce;color:#e2f3fb;border:1px solid #ffffff24;border-radius:7px;padding:7px 9px;font-size:9px;letter-spacing:.5px;pointer-events:none}
      .evgeo-viewtag{left:10px}.evgeo-readout{right:10px}
      .evgeo-buttons{display:flex;gap:7px;flex-wrap:wrap;margin-top:10px}
      .evgeo button{border:1px solid #4e7e95;background:#17445d;color:#f2f8fb;border-radius:9px;padding:8px 11px;font-size:11px;cursor:pointer}
      .evgeo button.active,.evgeo button:focus-visible{background:#147c9d;border-color:#9be1f2;outline:none}
      .evgeo-explain{margin-top:9px;padding:11px 12px;border-radius:10px;background:#ffffff10;border-left:3px solid #58b5d0;color:#d9eaf2;font-size:12px;line-height:1.6;min-height:54px}
      .evgeo-footer{display:flex;align-items:center;gap:7px;flex-wrap:wrap;margin-top:10px}
      .evgeo-footer label{display:flex;align-items:center;gap:6px;color:#c8dce7;font-size:11px}
      .evgeo-footer input{width:88px;accent-color:#63c3dc}
      .evgeo-footer span{font-size:10px;color:#91afbf}.evgeo-process{display:grid;grid-template-columns:auto minmax(65px,1fr) auto;align-items:center;gap:9px;margin-top:10px;color:#b8d5e3;font-size:10px}.evgeo-process-track{height:6px;background:#ffffff20;border-radius:9px;overflow:hidden}.evgeo-process-track i{display:block;width:0;height:100%;background:linear-gradient(90deg,#4ca8c5,#b4e7ed);transition:width .15s}
      @media(max-width:480px){.evgeo-view{height:360px}.evgeo-footer span{width:100%}.evgeo button{padding:8px 9px}}
    `;
    root.appendChild(style);

    const canvas = root.querySelector("canvas");
    const view = root.querySelector(".evgeo-view");
    const explain = root.querySelector(".evgeo-explain");
    const readout = root.querySelector(".evgeo-readout");
    const buttons = root.querySelector(".evgeo-buttons");
    const progressBar=root.querySelector("[data-progress]"),stageText=root.querySelector("[data-stage]"),forceInput=root.querySelector("[data-force]");
    let renderer, scene, camera, orbit, observer, raf = 0, destroyed = false;
    let playing = false, elapsed = 0, speed = 1, force = 1, scenario = "", waterSurfaces = [], particleSystems = [], updaters = [];
    const objects = {};

    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: "high-performance" });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.65));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      if ("outputColorSpace" in renderer) renderer.outputColorSpace = THREE.SRGBColorSpace;
      scene = new THREE.Scene();
      scene.background = new THREE.Color(C.sky);
      scene.fog = new THREE.Fog(C.sky, 17, 36);
      camera = new THREE.PerspectiveCamera(42, 1, .1, 100);
      camera.position.set(8, 7, 10);
      scene.add(new THREE.HemisphereLight(0xe9f6ff, 0x52604a, 1.65));
      const sun = new THREE.DirectionalLight(0xfff1d7, 2.2);
      sun.position.set(-6, 12, 7); sun.castShadow = true;
      sun.shadow.mapSize.set(1024,1024); sun.shadow.camera.left = -12; sun.shadow.camera.right = 12;
      sun.shadow.camera.top = 12; sun.shadow.camera.bottom = -12; scene.add(sun);
      const floor = new THREE.Mesh(new THREE.PlaneGeometry(30,30), MAT(0x435b4a));
      floor.rotation.x = -Math.PI/2; floor.position.y = -1.4; floor.receiveShadow = true; scene.add(floor);

      const animated = [];
      const cloud = (x,y,z,s) => makeCloud(scene,x,y,z,s,animated);
      const addTerrain = (w,d,nx,nz,fn,map,colorFn) => {
        const t = makeTerrain(w,d,nx,nz,fn,map,colorFn); scene.add(t); return t;
      };
      const addWater = (w,d,x,y,z,opts) => {
        const wtr = makeWaterSurface(scene,w,d,x,y,z,opts); waterSurfaces.push(wtr); return wtr;
      };
      const addParticles = (n,color,bounds,size) => {
        const p = makeParticles(scene,n,color,bounds,size); particleSystems.push(p); return p;
      };

      function buildTectonic() {
        scene.background = new THREE.Color(0x9bc4d6);
        // Mặt cắt địa chất dạng khối, thể hiện vỏ, lớp phủ và ranh giới mảng.
        const mantle = meshBox(scene, 11, 1.45, 5.8, MAT(0xb95732,.9,{emissive:0x3b160b,emissiveIntensity:.18}), 0,-.65,0);
        const plateMat = new THREE.MeshStandardMaterial({map:TEX.rock,roughness:.95});
        const left = meshBox(scene,5,.95,5.8,plateMat,-2.65,.55,0);
        const right = meshBox(scene,5,.95,5.8,plateMat,2.65,.55,0);
        const topLeft = addTerrain(5,5.8,40,42,(x,z)=>.15+.09*Math.sin(x*1.3)+.05*Math.cos(z*1.7),TEX.soil,
          (x,z)=>new THREE.Color(x<0?0x728b5a:0x8c9a65));
        topLeft.position.set(-2.65,1.05,0);
        const topRight = addTerrain(5,5.8,40,42,(x,z)=>.15+.06*Math.sin(x*1.4)+.03*Math.cos(z*1.2),TEX.grass);
        topRight.position.set(2.65,1.05,0);
        const fault = addLine(scene,[[0,1.2,-2.9],[.15,.45,-1.8],[.3,-.4,-.5],[.45,-1.2,1.2]],0xffd7a0,.95,.045);
        const hot = new THREE.Mesh(new THREE.ConeGeometry(.32,.95,24),MAT(C.magma,.55,{emissive:0x8e2d10,emissiveIntensity:.45}));
        hot.position.set(.1,-.05,0);hot.rotation.z=Math.PI;scene.add(hot);
        const quakes = [];
        for(let i=0;i<4;i++){
          const ring = new THREE.Mesh(new THREE.TorusGeometry(.35+i*.2,.018,8,64),new THREE.MeshBasicMaterial({color:0xffe1a1,transparent:true,opacity:.65}));
          ring.rotation.x=Math.PI/2;ring.position.set(.15,-.1,0);scene.add(ring);quakes.push(ring);
        }
        const ridge=new THREE.Mesh(new THREE.ConeGeometry(.9,.72,5),MAT(0x8e9b78));ridge.position.set(0,1.45,0);ridge.scale.set(1.7,.7,1.2);scene.add(ridge);
        const uplift=new THREE.Mesh(new THREE.ConeGeometry(1.15,1.65,7),MAT(0x817b69));uplift.position.set(0,1.85,0);scene.add(uplift);
        const volcanoes=[];[-1.35,0,1.35].forEach(x=>{const cone=new THREE.Mesh(new THREE.ConeGeometry(.42,.95,24),MAT(0x66594d));cone.position.set(x,1.35,-1.65);scene.add(cone);volcanoes.push(cone);const lava=new THREE.Mesh(new THREE.SphereGeometry(.12,12,8),MAT(0xff7138,.4,{emissive:0xc43c16,emissiveIntensity:.8}));lava.position.set(x,1.84,-1.65);scene.add(lava);volcanoes.push(lava);});
        const trench=new THREE.Mesh(new THREE.BoxGeometry(1.25,.12,5.6),MAT(0x244e66));trench.position.set(.15,.2,0);scene.add(trench);
        const faultScar=new THREE.Mesh(new THREE.BoxGeometry(.13,.32,5.8),MAT(0x59463b));faultScar.position.set(0,.95,0);scene.add(faultScar);
        const subducted=meshBox(scene,5.8,.28,1.0,MAT(0x5f5148),-.05,-.15,0);subducted.rotation.z=-.28;subducted.position.set(.55,-.25,0);
        const crustNew=meshBox(scene,1.05,.12,5.65,MAT(0xd58a55),0,.98,0);
        const mountainChain=new THREE.Group();
        for(let i=0;i<7;i++){const peak=new THREE.Mesh(new THREE.ConeGeometry(.48+(i%3)*.08,1.1+(i%2)*.42,6),MAT(0x77776c));peak.position.set(-.25+i*.55,1.45,-2.35+(i%2)*.18);mountainChain.add(peak);}scene.add(mountainChain);
        const islandArc=new THREE.Group();
        for(let i=0;i<5;i++){const island=new THREE.Mesh(new THREE.ConeGeometry(.38,.95+(i%2)*.25,18),MAT(0x5e6f4d));island.position.set(-1.2+i*.62,1.05,-2.65);islandArc.add(island);}scene.add(islandArc);

        objects.plates={left,right,topLeft,topRight,mantle,fault,hot,quakes,ridge,uplift,volcanoes,trench,faultScar,subducted,crustNew,mountainChain,islandArc,baseLeft:-2.65,baseRight:2.65};
        camera.position.set(8,6.5,10);
        addLabel(view,"VỎ TRÁI ĐẤT",8,15);addLabel(view,"LỚP PHỦ",8,82);
      }

      function buildWaterCycle() {
        scene.background = new THREE.Color(0xa8cddd);
        addTerrain(14,10,100,80,(x,z)=> {
          const hill = 1.6*Math.exp(-Math.pow((x+3.8)/2.0,2)) + .55*Math.exp(-Math.pow((x-1.5)/2.8,2));
          return -.25 + hill + .08*Math.sin(z*1.3);
        },TEX.grass,(x,z,y)=>new THREE.Color(y>.65?0x728a62:0x78915d));
        const ocean = addWater(7,8,3.9,-.05,1.1,{segments:60,color:0x168fbe,opacity:.94});
        const clouds=[cloud(-3.3,3.4,-1.2,1.05),cloud(-.8,3.8,-1.5,.85)];
        const sunBall = new THREE.Mesh(new THREE.SphereGeometry(.42,24,16),new THREE.MeshBasicMaterial({color:0xffd36b}));
        sunBall.position.set(-5.3,4.8,-2.6);scene.add(sunBall);
        const sunGlow = new THREE.Mesh(new THREE.SphereGeometry(.65,24,16),new THREE.MeshBasicMaterial({color:0xffdf83,transparent:true,opacity:.13}));
        sunGlow.position.copy(sunBall.position);scene.add(sunGlow);
        const evaporation = addParticles(90,0xb7e7f7,{x:5,y:3.8,z:4},.035);
        const rainfall = addParticles(100,0x8bd3f2,{x:6,y:3.7,z:4},.035);
        const runoffPts = [];
        for(let i=0;i<70;i++){const z=-4+i*.11;runoffPts.push([-.7+Math.sin(i*.12)*.55,.18,z]);}
        const stream = addLine(scene,runoffPts,0x218fbd,.95,.095);
        const soilCut = meshBox(scene,5,.85,.28,MAT(0x9c7956),-1.5,-.8,-4.4);
        const aquifer = meshBox(scene,5,.28,.3,MAT(0x347b9a,.45,{transparent:true,opacity:.75}),-1.5,-1.25,-4.38);
        const soilTop=meshBox(scene,5,.12,.34,MAT(0x5c8a50),-1.5,-.28,-4.34);
        const bedrock=meshBox(scene,5,.18,.38,MAT(0x70685d),-1.5,-1.48,-4.34);
        const trees=[addTree(scene,-4.5,.45,-.9,.9),addTree(scene,-3.9,.5,.15,1.05),addTree(scene,-3.1,.35,.75,.78)];
        const transpiration=addParticles(48,0xc5efff,{x:2,y:2.8,z:2},.03);
        seedParticles(transpiration,{x:[-4.8,-2.8],y:[.7,2.8],z:[-1.1,1.1]});
        seedParticles(evaporation,{x:[2.5,5.5],y:[.1,2.5],z:[-2.4,2.3]});
        seedParticles(rainfall,{x:[-1.5,2.4],y:[1.2,3.8],z:[-1.8,1.8]});

        const infiltration = [];
        for(let i=0;i<14;i++){
          infiltration.push(addLine(scene,[[-3.6+i*.32,.45,-4.2],[-3.55+i*.32,-.65,-4.2]],0x66c8ec,.7,.018));
        }
        objects.cycle={ocean,evaporation,rainfall,stream,aquifer,infiltration,clouds,transpiration,trees,soilTop,bedrock};
        camera.position.set(9,7,11);
        addLabel(view,"BỐC HƠI",7,52);addLabel(view,"NGƯNG TỤ",37,13);addLabel(view,"GIÁNG THỦY",67,37);        addLabel(view,"THOÁT HƠI NƯỚC",17,42);addLabel(view,"DÒNG CHẢY",55,76);addLabel(view,"NƯỚC NGẦM",34,91);
      }

      function buildRiver() {
        scene.background = new THREE.Color(0xa9cad9);
        const h = (x,z)=>.12 + (4.5-z)*.17 + .2*Math.sin(x*1.15+z*.4) +
          .35*Math.exp(-Math.pow((x+3.5)/1.3,2)) + .12*Math.cos(z*1.4);
        addTerrain(14,10,110,90,h,TEX.grass,(x,z,y)=>new THREE.Color(y>1.8?0x71845a:y>.8?0x6e8b52:0x78945e));
        // Lòng sông uốn khúc, hạ thấp dần về hạ lưu.
        const pts=[];
        for(let i=0;i<=100;i++){const z=-4.6+i*.092;const x=Math.sin(i*.075)*1.9;pts.push([x,h(x,z)+.08,z]);}
        const curve=new THREE.CatmullRomCurve3(pts.map(p=>new THREE.Vector3(...p)));
        const bed=new THREE.Mesh(new THREE.TubeGeometry(curve,260,.42,14,false),MAT(0x75634d));
        bed.position.y=-.08;scene.add(bed);
        const waterCurve=new THREE.Mesh(new THREE.TubeGeometry(curve,260,.29,14,false),new THREE.MeshPhysicalMaterial({color:0x258fbd,roughness:.2,transparent:true,opacity:.92,clearcoat:.7}));
        waterCurve.position.y=.1;scene.add(waterCurve);
        const bars=[];
        for(let i=0;i<8;i++){
          const z=-3.6+i*.9,x=Math.sin(i*.8)*1.65+.35;
          const bar=new THREE.Mesh(new THREE.SphereGeometry(.48,24,14),new THREE.MeshStandardMaterial({map:TEX.sediment,roughness:1}));
          bar.scale.set(1.5,.13,.65);bar.position.set(x,h(x,z)+.07,z);scene.add(bar);bars.push(bar);
        }
        const gravel=addParticles(70,0xc1a16f,{x:4,y:1.2,z:8},.045);
        seedParticles(gravel,{x:[-1.8,1.8],y:[.18,.85],z:[-4.5,4.5]});
        const outerBank=meshBox(scene,1.05,.34,.85,MAT(0x9b7651),-2.25,.5,-.25);
        const bankFace=meshBox(scene,.12,.62,.9,MAT(0x76563e),-2.72,.47,-.25);
        const delta=new THREE.Group();
        for(let i=0;i<5;i++){const lobe=new THREE.Mesh(new THREE.CircleGeometry(.62,3),MAT(i%2?0xb99a68:0xc7aa78));lobe.rotation.x=-Math.PI/2;lobe.rotation.z=(i-2)*.22;lobe.position.set(-.55+(i-2)*.38,.02,3.95+(i%2)*.38);delta.add(lobe);}scene.add(delta);
        const sedimentLayers=[];
        for(let i=0;i<3;i++)sedimentLayers.push(meshBox(scene,2.4,.045,1.1,MAT(i%2?0x9c805d:0xc4a574),.4,-.55-i*.09,4.05));

        objects.river={bars,gravel,waterCurve,curve,barBase:bars.map(b=>b.position.clone()),outerBank,bankFace,delta,sedimentLayers};
        camera.position.set(8,7,11);
        addLabel(view,"THƯỢNG LƯU",6,20);addLabel(view,"TRUNG LƯU",42,43);addLabel(view,"HẠ LƯU",76,73);        addLabel(view,"XÂM THỰC BỜ NGOÀI",8,57);addLabel(view,"BÃI BỒI",51,61);addLabel(view,"CHÂU THỔ",77,83);
      }

      function buildCoast() {
        scene.background = new THREE.Color(0x9fc8da);
        const landH=(x,z)=>z<-.55?1.0+.35*Math.sin(x*.9)+.12*Math.cos(z):z<.25?.12:-.32;
        addTerrain(14,9,100,80,landH,TEX.grass,(x,z,y)=>new THREE.Color(z<-.55?0x71845b:0xc4a879));
        // Mũi đá và vách biển có lớp đá phân tầng.
        const cliff = meshBox(scene,4.5,1.55,1.1,MAT(0x777064),-2.6,.75,-.95);
        for(let i=0;i<4;i++){
          const stratum=meshBox(scene,4.55,.045,1.12,MAT(i%2?0x554f48:0xa0927c),-2.6,.18+i*.36,-.95);
        }
        const shore = new THREE.Mesh(new THREE.SphereGeometry(1,36,20),new THREE.MeshStandardMaterial({map:TEX.sand,roughness:1}));
        shore.scale.set(3.1,.18,.72);shore.position.set(.3,.03,.1);scene.add(shore);
        const sea=addWater(8,8,3.0,-.08,1.6,{segments:70,color:0x1388b7,opacity:.94});
        const spit = new THREE.Mesh(new THREE.SphereGeometry(1,32,18),new THREE.MeshStandardMaterial({map:TEX.sand,roughness:1}));
        spit.scale.set(1.9,.12,.34);spit.position.set(1.5,.11,-.45);spit.rotation.y=-.2;scene.add(spit);
        const waveFoam=[];
        for(let i=0;i<5;i++){
          const line=addLine(scene,[[.1,.18,2.7+i*.35],[1.5,.18,2.45+i*.35],[3,.18,2.2+i*.35],[4.5,.18,1.95+i*.35]],0xe1f7fa,.75,.025);
          waveFoam.push(line);
        }
        const sandParticles=addParticles(55,0xd5bd8d,{x:5,y:1.2,z:5},.04);
        seedParticles(sandParticles,{x:[-.2,4.8],y:[.08,.42],z:[-.8,2.8]});
        const caveMouth=new THREE.Mesh(new THREE.CircleGeometry(.34,24),MAT(0x202c32));caveMouth.position.set(-2.15,.76,-.365);scene.add(caveMouth);
        const archLeft=addRockPillar(scene,-1.15,.02,-.85,1.2,0x756d61);
        const archRight=addRockPillar(scene,-.15,.02,-.85,1.0,0x756d61);
        const archTop=meshBox(scene,1.15,.25,.55,MAT(0x756d61),-.65,1.12,-.85);
        const stack=addRockPillar(scene,-.95,.02,-2.35,1.65,0x6f695f);
        const tideMark=addLine(scene,[[-4,.15,2.95],[4,.15,2.95]],0xf1fbff,.8,.018);

        objects.coast={cliff,shore,sea,spit,waveFoam,sandParticles,caveMouth,archLeft,archRight,archTop,stack,tideMark};
        camera.position.set(9,6.5,10);
        addLabel(view,"VÁCH BIỂN",7,26);addLabel(view,"BÃI CÁT",42,63);addLabel(view,"DÒNG VEN BỜ",70,18);        addLabel(view,"HANG BIỂN",12,39);addLabel(view,"VÒM BIỂN",34,25);addLabel(view,"CỘT ĐÁ BIỂN",22,15);addLabel(view,"DOI CÁT",73,56);
      }

      function buildClimate() {
        scene.background = new THREE.Color(0xa8cbdc);
        const mountain=(x,z)=>.15+2.8*Math.exp(-Math.pow((x+.15)/1.75,2))+.18*Math.sin(z*1.1);
        addTerrain(14,10,110,90,mountain,TEX.grass,(x,z,y)=>new THREE.Color(y>2.25?0xd9ded5:y>1.2?0x70875c:x<-.2?0x668451:0x9a895e));
        const snow = new THREE.Mesh(new THREE.SphereGeometry(.2,24,14),MAT(0xe8efeb,.9));
        snow.scale.set(2.0,.55,1.2);snow.position.set(-.15,2.8,-.05);scene.add(snow);
        const clouds=[];
        clouds.push(cloud(-4.6,3.6,-2.1,.95));clouds.push(cloud(-3.2,3.4,-2.2,.8));
        const rain=addParticles(110,0xa9dff4,{x:3.5,y:3.4,z:3.8},.035);
        const windLines=[];
        for(let i=0;i<8;i++){
          const y=2.15+i*.16;
          windLines.push(addLine(scene,[[-6,y,-2.6],[-4.2,y+.12,-2.6],[-2.4,y+.35,-2.6],[-.7,y+.65,-2.6]],0xf1fbff,.8,.022));
        }
        const dryDust=addParticles(55,0xc8b58b,{x:3,y:1.8,z:3.5},.025);
        seedParticles(rain,{x:[-5.5,-1.2],y:[.9,3.5],z:[-1.7,1.8]});
        seedParticles(dryDust,{x:[1.2,5.5],y:[.15,1.4],z:[-1.8,1.8]});
        const windwardTrees=[addTree(scene,-5.0,.25,.6,.8),addTree(scene,-4.2,.3,-.2,1),addTree(scene,-3.5,.4,1.0,.9)];
        const dryShrubs=[];
        for(let i=0;i<8;i++){const shrub=new THREE.Mesh(new THREE.SphereGeometry(.13,8,6),MAT(0x9b895e));shrub.scale.set(1.5,.55,.8);shrub.position.set(1.5+(i%4)*.72,.24,((i/4)|0)*1.1-.4);scene.add(shrub);dryShrubs.push(shrub);}
        const airPath=[];
        for(let i=0;i<6;i++){const dot=new THREE.Mesh(new THREE.SphereGeometry(.07,10,8),MAT(0xf3fbff,.5,{emissive:0x9fc8dc,emissiveIntensity:.25}));dot.position.set(-5.5+i*.55,2.35+i*.13,-2.4);scene.add(dot);airPath.push(dot);}

        objects.climate={rain,windLines,dryDust,snow,clouds,windwardTrees,dryShrubs,airPath};
        camera.position.set(8,7,11);
        addLabel(view,"SƯỜN ĐÓN GIÓ",7,24);addLabel(view,"SƯỜN KHUẤT GIÓ",68,28);        addLabel(view,"KHÔNG KHÍ ẨM ĐI LÊN",24,14);addLabel(view,"MƯA ĐỊA HÌNH",15,45);addLabel(view,"KHÔNG KHÍ HẠ XUỐNG",66,42);
      }

      if(kind==="tectonic")buildTectonic();
      if(kind==="water")buildWaterCycle();
      if(kind==="river")buildRiver();
      if(kind==="coast")buildCoast();
      if(kind==="climate")buildClimate();

      if(THREE.OrbitControls){
        orbit = new THREE.OrbitControls(camera,canvas);
        orbit.enableDamping=true;orbit.dampingFactor=.055;
        orbit.minDistance=5;orbit.maxDistance=23;
        orbit.maxPolarAngle=Math.PI*.49;
        orbit.target.set(0,.25,0);
      }

      function select(action) {
        scenario=action;
        buttons.querySelectorAll("button").forEach(b=>b.classList.toggle("active",b.dataset.scenario===action));
        const descriptions={
          diverge:"Ranh giới phân kỳ: hai mảng tách xa nhau. Vật chất nóng từ bên dưới có thể đi lên, nguội đi và tạo phần vỏ mới.",
          converge:"Hội tụ đại dương – lục địa: mảng đại dương chìm xuống dưới mảng lục địa, hình thành rãnh đại dương và cung núi lửa.",
          collision:"Va chạm lục địa – lục địa: hai khối vỏ bị nén ép, uốn nếp và nâng cao thành dãy núi.",
          islandarc:"Hội tụ đại dương – đại dương: một mảng chìm xuống dưới mảng kia, tạo rãnh sâu và cung đảo núi lửa.",
          transform:"Ranh giới chuyển dạng: hai mảng trượt ngang ngược chiều nhau dọc theo đứt gãy; động đất có thể phát sinh khi ứng suất được giải phóng.",
          cycle:"Năng lượng Mặt Trời làm nước bốc hơi; hơi nước ngưng tụ thành mây, rơi xuống dưới dạng mưa và trở lại biển qua dòng chảy hoặc thấm xuống đất.",
          evaporation:"Nước từ biển, sông và hồ bốc hơi; hơi nước đi lên khí quyển và có thể ngưng tụ khi gặp điều kiện thích hợp.",
          transpiration:"Thực vật giải phóng hơi nước qua lá. Quá trình thoát hơi nước bổ sung hơi ẩm vào khí quyển.",
          precipitation:"Nước từ mây rơi xuống mặt đất. Một phần chảy trên bề mặt theo sườn dốc, tập trung vào suối và sông rồi đổ ra biển.",
          infiltration:"Một phần nước mưa thấm qua đất và khe nứt của đá, bổ sung cho nước ngầm; nước ngầm có thể di chuyển chậm và thoát ra suối.",
          upper:"Thượng lưu thường có độ dốc lớn, dòng chảy nhanh và xâm thực sâu mạnh; lòng sông thường hẹp, có nhiều ghềnh thác.",
          middle:"Trung lưu có độ dốc giảm. Dòng sông uốn khúc rõ hơn; bờ lõm thường bị xói mòn, bờ lồi có xu hướng bồi tụ.",
          lower:"Hạ lưu có độ dốc nhỏ, dòng chảy chậm hơn; phù sa dễ lắng đọng, có thể hình thành bãi bồi và châu thổ.",
          load:"Dòng nước vận chuyển vật liệu bằng cách hòa tan, cuốn lăn hoặc kéo lê hạt đáy và giữ các hạt mịn lơ lửng.",
          erosion:"Dòng chảy tác động vào lòng và bờ sông, bóc tách vật liệu và làm thay đổi hình dạng lòng dẫn.",
          transport:"Các hạt bùn, cát và sỏi di chuyển theo dòng nước bằng những hình thức vận chuyển khác nhau.",
          deposition:"Khi dòng chảy giảm khả năng vận chuyển, vật liệu lắng đọng và tích tụ thành bãi bồi hoặc châu thổ.",
          erosion:"Sóng liên tục tác động vào chân vách đá. Đá bị nứt vỡ, mài mòn và vật liệu được đưa ra khỏi vị trí ban đầu, làm bờ lùi dần.",
          drift:"Sóng tới bờ theo góc xiên tạo dòng vận chuyển dọc bờ. Cát và sỏi được dịch chuyển theo hướng dòng ven bờ.",
          deposition:"Khi năng lượng sóng và dòng ven bờ giảm, vật liệu lắng đọng, tạo bãi cát, doi cát hoặc các dạng bờ tích tụ.",
          tide:"Thủy triều làm mực nước biển dâng lên và hạ xuống theo chu kỳ. Đây là biến đổi mực nước, khác với dao động của sóng biển.",
          windward:"Ở sườn đón gió, không khí ẩm bị địa hình buộc nâng lên. Không khí lạnh đi, hơi nước ngưng tụ và có thể gây mưa địa hình.",
          leeward:"Sau khi vượt qua đỉnh núi, không khí hạ xuống, ấm lên và độ ẩm tương đối giảm. Sườn khuất gió thường khô hơn.",
          reverse:"Đổi hướng gió làm thay đổi sườn đón gió và sườn khuất gió. Mưa địa hình có thể chuyển sang phía đối diện."
        };
        explain.textContent=descriptions[action]||cfg.lead;
        readout.textContent=(cfg.controls.find(x=>x[1]===action)||["TOÀN CẢNH"])[0].toUpperCase();

        if(kind==="tectonic" && objects.plates){
          const p=objects.plates;
          p.left.position.set(p.baseLeft,.55,0);p.right.position.set(p.baseRight,.55,0);p.topLeft.position.set(p.baseLeft,1.05,0);p.topRight.position.set(p.baseRight,1.05,0);
          p.left.rotation.z=0;p.right.rotation.z=0;
          p.ridge.visible=action==="diverge";p.uplift.visible=action==="collision";p.mountainChain.visible=action==="collision";p.subducted.visible=action==="converge"||action==="islandarc";p.islandArc.visible=action==="islandarc";p.crustNew.visible=action==="diverge";p.volcanoes.forEach(o=>o.visible=action==="converge");p.trench.visible=action==="converge"||action==="islandarc";p.faultScar.visible=action==="transform";p.hot.visible=action==="diverge"||action==="converge"||action==="islandarc";p.quakes.forEach(o=>o.visible=action==="transform"||action==="converge"||action==="collision"||action==="islandarc");
          if(action==="diverge"){p.left.position.x=-3.05;p.right.position.x=3.05;}
          if(action==="converge"||action==="collision"||action==="islandarc"){p.left.position.x=-2.25;p.right.position.x=2.25;p.right.rotation.z=action==="collision"?.08:.06;}
          if(action==="transform"){p.left.position.z=-.35;p.right.position.z=.35;p.topLeft.position.z=-.35;p.topRight.position.z=.35;}
        }
        if(kind==="water" && objects.cycle){
          const o=objects.cycle;
          o.evaporation.points.visible=action==="cycle"||action==="evaporation";
          o.rainfall.points.visible=action==="cycle"||action==="precipitation";
          o.infiltration.forEach(x=>x.visible=action==="cycle"||action==="infiltration");if(o.transpiration)o.transpiration.points.visible=action==="cycle"||action==="evaporation"||action==="transpiration";
        }
        if(kind==="river" && objects.river){
          objects.river.bars.forEach((b,i)=>b.visible=action==="lower"||action==="middle"||action==="load" ? i>2 : action==="upper" ? i<3 : true);
          objects.river.gravel.points.visible=action==="load"||action==="transport"||action==="cycle";objects.river.delta.visible=action==="lower"||action==="load"||action==="deposition";objects.river.bankFace.visible=action==="upper"||action==="middle"||action==="erosion";
        }
        if(kind==="coast" && objects.coast){
          objects.coast.cliff.position.x=-2.6;objects.coast.spit.scale.x=1.9;
          objects.coast.sandParticles.points.visible=action==="drift"||action==="deposition";objects.coast.sea.mesh.visible=true;objects.coast.caveMouth.visible=action==="erosion";objects.coast.archLeft.visible=action==="erosion";objects.coast.archRight.visible=action==="erosion";objects.coast.archTop.visible=action==="erosion";objects.coast.stack.visible=action==="erosion";
          objects.coast.spit.visible=action==="deposition"||action==="drift"||action==="erosion";
        }
        if(kind==="climate" && objects.climate){
          objects.climate.rain.points.visible=action==="windward"||action==="reverse";objects.climate.windwardTrees.forEach(x=>x.visible=action!=="leeward");objects.climate.dryShrubs.forEach(x=>x.visible=action!=="windward");
          objects.climate.dryDust.points.visible=action==="leeward"||action==="reverse";
          objects.climate.windLines.forEach(line=>line.rotation.z=action==="reverse"?Math.PI:0);
        }
      }

      cfg.controls.forEach(([label,action])=>{
        const b=document.createElement("button");b.type="button";b.textContent=label;b.dataset.scenario=action;
        b.addEventListener("click",()=>select(action));buttons.appendChild(b);
      });
      root.querySelector('[data-run="play"]').addEventListener("click",()=>{playing=true;});
      root.querySelector('[data-run="pause"]').addEventListener("click",()=>{playing=false;});
      root.querySelector('[data-run="reset"]').addEventListener("click",()=>{
        playing=false;elapsed=0;speed=1;force=1;root.querySelector("[data-speed]").value="1";forceInput.value="1";camera.position.set(kind==="water"?9:8,kind==="water"?7:7,kind==="water"?11:10);
        if(objects.plates){const p=objects.plates;p.left.position.set(p.baseLeft,.55,0);p.right.position.set(p.baseRight,.55,0);p.topLeft.position.set(p.baseLeft,1.05,0);p.topRight.position.set(p.baseRight,1.05,0);p.hot.position.y=-.05;p.ridge.scale.y=.7;p.uplift.scale.y=1;p.volcanoes.forEach((o,i)=>{if(i%2===1)o.position.y=1.84;});}
        if(objects.coast){objects.coast.cliff.position.x=-2.6;objects.coast.spit.scale.x=1.9;objects.coast.sea.mesh.position.y=-.08;}if(objects.river){objects.river.bankFace.position.x=-2.72;objects.river.delta.scale.set(1,1,1);}
        if(orbit){orbit.target.set(0,.25,0);orbit.update();}select(cfg.controls[0][1]);
      });
      root.querySelector("[data-speed]").addEventListener("input",e=>speed=Number(e.target.value));
      forceInput.addEventListener("input",e=>force=Number(e.target.value));
      select(cfg.controls[0][1]);

      function updateParticles(system,dt,mode) {
        if(!system||!system.points.visible)return;
        const a=system.points.geometry.attributes.position;
        for(let i=0;i<a.count;i++){
          let x=a.getX(i),y=a.getY(i),z=a.getZ(i);
          if(mode==="rise"){y+=dt*(.3+system.velocities[i]*.45);x+=Math.sin(elapsed+i)*dt*.035;if(y>system.bounds.y)y=0;}
          else if(mode==="fall"){y-=dt*(1.0+system.velocities[i]*.55);if(y<-.7)y=system.bounds.y;}
          else if(mode==="drift"){x+=dt*(.35+system.velocities[i]*.35);z+=dt*.08;if(x>system.bounds.x/2)x=-system.bounds.x/2;}
          else {z+=dt*(.2+system.velocities[i]*.2);if(z>system.bounds.z/2)z=-system.bounds.z/2;}
          a.setXYZ(i,x,y,z);
        }
        a.needsUpdate=true;
      }

      let last=performance.now();
      function tick(now) {
        if(destroyed)return;
        raf=requestAnimationFrame(tick);
        const dt=Math.min(.04,(now-last)/1000||0);last=now;
        if(playing)elapsed+=dt*speed;
        waterSurfaces.forEach(w=>w.update(elapsed,playing ? .075 : .025));
        if(playing&&kind==="water"&&objects.cycle){
          const o=objects.cycle,step=elapsed%18;
          o.evaporation.points.visible=scenario==="cycle"||scenario==="evaporation"||step<5;o.rainfall.points.visible=scenario==="cycle"||scenario==="precipitation"||step>8&&step<14;
          o.infiltration.forEach(x=>x.visible=scenario==="infiltration"||scenario==="cycle"&&step>12);
          updateParticles(o.evaporation,dt*speed*force,"rise");updateParticles(o.rainfall,dt*speed*force,"fall");if(o.transpiration&&o.transpiration.points.visible)updateParticles(o.transpiration,dt*speed*force,"rise");
          o.clouds.forEach(c=>{c.position.x+=dt*.12*speed*force;if(c.position.x>4)c.position.x=-4.5;});
        }
        if(playing&&kind==="river"&&objects.river){const o=objects.river;updateParticles(o.gravel,dt*speed*force,"drift");o.bars.forEach((b,i)=>{const base=o.barBase[i];b.position.x=base.x+Math.sin(elapsed*.45+i)*.05*force;b.position.y=base.y+Math.sin(elapsed*.7+i*.4)*.025;});}
        if(playing&&kind==="coast"&&objects.coast)updateParticles(objects.coast.sandParticles,dt*speed,"drift");
        if(playing&&kind==="climate"&&objects.climate){const o=objects.climate;updateParticles(o.rain,dt*speed*force,"fall");updateParticles(o.dryDust,dt*speed*force,"drift");o.windLines.forEach((line,i)=>{line.position.x=Math.sin(elapsed*1.5+i*.3)*.12*force;line.position.y=Math.sin(elapsed*1.2+i*.5)*.08;});o.clouds.forEach(c=>{c.position.x+=dt*.22*speed*force*(scenario==="reverse"?-1:1);if(c.position.x>2.8)c.position.x=-5.5;if(c.position.x<-5.5)c.position.x=2.8;});o.airPath.forEach((dot,i)=>{dot.position.x=-5.5+((elapsed*.38+i*.62)%8.2);dot.position.y=2.25+Math.sin((dot.position.x+5.5)*.55)*.85;});}
        if(kind==="coast"&&objects.coast&&playing){const o=objects.coast,wave=Math.sin(elapsed*2.1*speed)*.16*force;o.sea.mesh.position.y=-.08+Math.sin(elapsed*.42*speed)*.13*force;o.waveFoam.forEach((line,i)=>{line.position.z=wave+i*.035;line.position.x=Math.sin(elapsed*1.2+i*.4)*.12;});if(scenario==="erosion")o.cliff.position.x=-2.6-Math.min(.28,elapsed*.012*force);else o.cliff.position.x=-2.6;if(scenario==="deposition")o.spit.scale.x=1.9+Math.min(.55,elapsed*.06*force);else o.spit.scale.x=1.9;updateParticles(o.sandParticles,dt*speed*force,"drift");}
        if(kind==="tectonic"&&objects.plates&&playing){
          const p=objects.plates,travel=Math.min(1.15,elapsed*.12*speed*force);
          p.left.position.x=p.baseLeft+(scenario==="diverge"?-travel:(scenario==="converge"||scenario==="collision"||scenario==="islandarc")?travel*.62:0);p.right.position.x=p.baseRight+(scenario==="diverge"?travel:(scenario==="converge"||scenario==="collision"||scenario==="islandarc")?-travel*.62:0);
          if(scenario==="transform"){p.left.position.z=-.28-Math.min(.65,elapsed*.09*speed*force);p.right.position.z=.28+Math.min(.65,elapsed*.09*speed*force);}
          p.topLeft.position.x=p.left.position.x;p.topRight.position.x=p.right.position.x;p.topLeft.position.z=p.left.position.z;p.topRight.position.z=p.right.position.z;
          p.ridge.scale.y=.7+Math.min(.8,travel*.6);p.uplift.scale.y=1+Math.min(.8,travel*.7);p.hot.position.y=-.05+Math.min(.55,elapsed*.08*speed*force);p.crustNew.position.y=.98+Math.min(.28,travel*.2);p.subducted.rotation.z=-.28-Math.min(.12,travel*.08);
          p.volcanoes.forEach((o,i)=>{if(i%2===1)o.position.y=1.84+Math.max(0,Math.sin(elapsed*2+i)*.12)*force;});
          p.quakes.forEach((r,i)=>{const phase=(elapsed*1.1+i*.22)%1;r.scale.setScalar(1+phase*2.1);r.material.opacity=.7*(1-phase);});
        }
        if(playing)animated.forEach(fn=>fn(elapsed));
        const phase=elapsed%20,stages={tectonic:["Ứng suất tích tụ","Mảng dịch chuyển","Biến dạng địa tầng","Hệ quả địa chất xuất hiện"],water:["Bốc hơi","Ngưng tụ","Giáng thủy","Dòng chảy và thấm"],river:["Xâm thực","Vận chuyển vật liệu","Dòng chảy giảm tốc","Bồi tụ phù sa"],coast:["Sóng tác động","Phá hủy và mài mòn","Vận chuyển dọc bờ","Tích tụ vật liệu"],climate:["Khối khí ẩm tiến đến","Không khí bị nâng lên","Ngưng tụ và mưa","Không khí hạ xuống khô hơn"]};
        progressBar.style.width=(phase/20*100).toFixed(1)+"%";stageText.textContent=playing?stages[kind][Math.min(3,Math.floor(phase/5))]:(elapsed?stages[kind][Math.min(3,Math.floor(phase/5))]:"Chờ bắt đầu");
        if(orbit)orbit.update();
        renderer.render(scene,camera);
      }
      function resize(){
        if(!renderer||destroyed)return;
        const w=Math.max(280,view.clientWidth),h=Math.max(260,view.clientHeight);
        renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();
      }
      resize();
      if(window.ResizeObserver){observer=new ResizeObserver(resize);observer.observe(view);}
      else window.addEventListener("resize",resize);
      raf=requestAnimationFrame(tick);
    } catch (error) {
      console.error('[EDUVERSE geo simulation] WebGL initialization failed:',error);
      if(observer) observer.disconnect();
      if(orbit) orbit.dispose();
      if(renderer) renderer.dispose();
      compatibilityView(root,kind,error && error.message ? error.message : String(error));
      return { destroy(){} };
    }

    return {
      destroy() {
        destroyed=true;
        if(raf)cancelAnimationFrame(raf);
        if(observer)observer.disconnect();
        if(orbit)orbit.dispose();
        if(scene)scene.traverse(o=>{
          if(o.geometry)o.geometry.dispose();
          if(o.material){
            const materials=Array.isArray(o.material)?o.material:[o.material];
            materials.forEach(m=>{if(m.map)m.map.dispose();m.dispose();});
          }
        });
        if(renderer)renderer.dispose();
        if(style.parentNode)style.parentNode.removeChild(style);
      }
    };
  }

  window.simTectonics = root => mount(root,"tectonic");
  window.simWaterCycle = root => mount(root,"water");
  window.simRiverProcess = root => mount(root,"river");
  window.simCoastalLandforms = root => mount(root,"coast");
  window.simClimateRelief = root => mount(root,"climate");
})();