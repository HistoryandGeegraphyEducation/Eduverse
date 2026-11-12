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

  function addLabel(view, text, x, y) {
    const el = document.createElement("span");
    el.className = "evgeo-label";
    el.textContent = text;
    el.style.left = x + "%"; el.style.top = y + "%";
    root.appendChild(el);
    return el;
  }

  function mount(root, kind) {
    const configs = {
      tectonic: {
        title: "TƯƠNG TÁC GIỮA CÁC MẢNG KIẾN TẠO",
        lead: "Quan sát cách các mảng thạch quyển dịch chuyển và tác động tại ranh giới tiếp xúc.",
        controls: [["Tách giãn","diverge"],["Hội tụ – hút chìm","converge"],["Trượt ngang","transform"]]
      },
      water: {
        title: "CHU TRÌNH NƯỚC TRONG TỰ NHIÊN",
        lead: "Theo dõi nước tuần hoàn giữa đại dương, khí quyển, lục địa, sông hồ và nước ngầm.",
        controls: [["Toàn chu trình","cycle"],["Bốc hơi – ngưng tụ","evaporation"],["Mưa – dòng chảy","precipitation"],["Thấm xuống đất","infiltration"]]
      },
      river: {
        title: "XÂM THỰC, VẬN CHUYỂN VÀ BỒI TỤ CỦA DÒNG SÔNG",
        lead: "Quan sát sự thay đổi của dòng chảy và vật liệu từ thượng lưu đến hạ lưu.",
        controls: [["Thượng lưu","upper"],["Trung lưu","middle"],["Hạ lưu","lower"],["Vận chuyển phù sa","load"]]
      },
      coast: {
        title: "HÌNH THÀNH ĐỊA HÌNH VEN BIỂN",
        lead: "Sóng và dòng ven bờ làm biến đổi bờ đá, bãi cát và các dạng địa hình tích tụ.",
        controls: [["Bờ xâm thực","erosion"],["Dòng ven bờ","drift"],["Bờ bồi tụ","deposition"]]
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
        <div class="evgeo-explain" aria-live="polite">${cfg.lead}</div>
        <div class="evgeo-footer">
          <button data-run="play">▶ Chạy diễn biến</button>
          <button data-run="pause">Ⅱ Tạm dừng</button>
          <button data-run="reset">↺ Đặt lại</button>
          <label>Tốc độ <input data-speed type="range" min=".25" max="2.5" step=".25" value="1"></label>
          <span>Chuyển động được tăng tốc để dễ quan sát.</span>
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
      .evgeo-footer span{font-size:10px;color:#91afbf}
      @media(max-width:480px){.evgeo-view{height:360px}.evgeo-footer span{width:100%}.evgeo button{padding:8px 9px}}
    `;
    root.appendChild(style);

    const canvas = root.querySelector("canvas");
    const view = root.querySelector(".evgeo-view");
    const explain = root.querySelector(".evgeo-explain");
    const readout = root.querySelector(".evgeo-readout");
    const buttons = root.querySelector(".evgeo-buttons");
    let renderer, scene, camera, orbit, observer, raf = 0, destroyed = false;
    let playing = false, elapsed = 0, speed = 1, scenario = "", waterSurfaces = [], particleSystems = [], updaters = [];
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
        objects.plates={left,right,topLeft,topRight,mantle,fault,hot,quakes,baseLeft:-2.65,baseRight:2.65};
        camera.position.set(8,6.5,10);
        addLabel(root,"VỎ TRÁI ĐẤT",8,15);addLabel(root,"LỚP PHỦ",8,82);
      }

      function buildWaterCycle() {
        scene.background = new THREE.Color(0xa8cddd);
        addTerrain(14,10,100,80,(x,z)=> {
          const hill = 1.6*Math.exp(-Math.pow((x+3.8)/2.0,2)) + .55*Math.exp(-Math.pow((x-1.5)/2.8,2));
          return -.25 + hill + .08*Math.sin(z*1.3);
        },TEX.grass,(x,z,y)=>new THREE.Color(y>.65?0x728a62:0x78915d));
        const ocean = addWater(7,8,3.9,-.05,1.1,{segments:60,color:0x168fbe,opacity:.94});
        cloud(-3.3,3.4,-1.2,1.05);cloud(-.8,3.8,-1.5,.85);
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
        const infiltration = [];
        for(let i=0;i<14;i++){
          infiltration.push(addLine(scene,[[-3.6+i*.32,.45,-4.2],[-3.55+i*.32,-.65,-4.2]],0x66c8ec,.7,.018));
        }
        objects.cycle={ocean,evaporation,rainfall,stream,aquifer,infiltration};
        camera.position.set(9,7,11);
        addLabel(root,"BỐC HƠI",7,52);addLabel(root,"NGƯNG TỤ",37,13);addLabel(root,"GIÁNG THỦY",67,37);
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
        objects.river={bars,gravel,waterCurve,curve};
        camera.position.set(8,7,11);
        addLabel(root,"THƯỢNG LƯU",6,20);addLabel(root,"TRUNG LƯU",42,43);addLabel(root,"HẠ LƯU",76,73);
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
        objects.coast={cliff,shore,sea,spit,waveFoam,sandParticles};
        camera.position.set(9,6.5,10);
        addLabel(root,"VÁCH BIỂN",7,26);addLabel(root,"BÃI CÁT",42,63);addLabel(root,"DÒNG VEN BỜ",70,18);
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
        objects.climate={rain,windLines,dryDust,snow};
        camera.position.set(8,7,11);
        addLabel(root,"SƯỜN ĐÓN GIÓ",7,24);addLabel(root,"SƯỜN KHUẤT GIÓ",68,28);
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
          converge:"Ranh giới hội tụ: hai mảng tiến lại gần. Trong mô hình này, mảng đại dương chúi xuống dưới mảng lục địa, tạo đới hút chìm.",
          transform:"Ranh giới chuyển dạng: hai mảng trượt ngang ngược chiều nhau dọc theo đứt gãy; động đất có thể phát sinh khi ứng suất được giải phóng.",
          cycle:"Năng lượng Mặt Trời làm nước bốc hơi; hơi nước ngưng tụ thành mây, rơi xuống dưới dạng mưa và trở lại biển qua dòng chảy hoặc thấm xuống đất.",
          evaporation:"Bốc hơi chuyển nước lỏng thành hơi nước. Khi không khí ẩm lên cao và lạnh đi, hơi nước ngưng tụ thành những giọt nước nhỏ tạo mây.",
          precipitation:"Nước từ mây rơi xuống mặt đất. Một phần chảy trên bề mặt theo sườn dốc, tập trung vào suối và sông rồi đổ ra biển.",
          infiltration:"Một phần nước mưa thấm qua đất và khe nứt của đá, bổ sung cho nước ngầm; nước ngầm có thể di chuyển chậm và thoát ra suối.",
          upper:"Thượng lưu thường có độ dốc lớn, dòng chảy nhanh và xâm thực sâu mạnh; lòng sông thường hẹp, có nhiều ghềnh thác.",
          middle:"Trung lưu có độ dốc giảm. Dòng sông uốn khúc rõ hơn; bờ lõm thường bị xói mòn, bờ lồi có xu hướng bồi tụ.",
          lower:"Hạ lưu có độ dốc nhỏ, dòng chảy chậm hơn; phù sa dễ lắng đọng, có thể hình thành bãi bồi và châu thổ.",
          load:"Dòng nước vận chuyển vật liệu bằng cách hòa tan, cuốn lăn hoặc kéo lê hạt đáy và giữ các hạt mịn lơ lửng.",
          erosion:"Sóng liên tục tác động vào chân vách đá. Đá bị nứt vỡ, mài mòn và vật liệu được đưa ra khỏi vị trí ban đầu, làm bờ lùi dần.",
          drift:"Sóng tới bờ theo góc xiên tạo dòng vận chuyển dọc bờ. Cát và sỏi được dịch chuyển theo hướng dòng ven bờ.",
          deposition:"Khi năng lượng sóng và dòng ven bờ giảm, vật liệu lắng đọng, tạo bãi cát, doi cát hoặc các dạng bờ tích tụ.",
          windward:"Ở sườn đón gió, không khí ẩm bị địa hình buộc nâng lên. Không khí lạnh đi, hơi nước ngưng tụ và có thể gây mưa địa hình.",
          leeward:"Sau khi vượt qua đỉnh núi, không khí hạ xuống, ấm lên và độ ẩm tương đối giảm. Sườn khuất gió thường khô hơn.",
          reverse:"Đổi hướng gió làm thay đổi sườn đón gió và sườn khuất gió. Mưa địa hình có thể chuyển sang phía đối diện."
        };
        explain.textContent=descriptions[action]||cfg.lead;
        readout.textContent=(cfg.controls.find(x=>x[1]===action)||["TOÀN CẢNH"])[0].toUpperCase();

        if(kind==="tectonic" && objects.plates){
          const p=objects.plates;
          p.left.position.x=p.baseLeft;p.right.position.x=p.baseRight;
          p.left.rotation.z=0;p.right.rotation.z=0;
          if(action==="diverge"){p.left.position.x=-3.05;p.right.position.x=3.05;}
          if(action==="converge"){p.left.position.x=-2.25;p.right.position.x=2.25;p.right.rotation.z=.06;}
          if(action==="transform"){p.left.position.z=-.35;p.right.position.z=.35;p.topLeft.position.z=-.35;p.topRight.position.z=.35;}
        }
        if(kind==="water" && objects.cycle){
          const o=objects.cycle;
          o.evaporation.points.visible=action==="cycle"||action==="evaporation";
          o.rainfall.points.visible=action==="cycle"||action==="precipitation";
          o.infiltration.forEach(x=>x.visible=action==="cycle"||action==="infiltration");
        }
        if(kind==="river" && objects.river){
          objects.river.bars.forEach((b,i)=>b.visible=action==="lower"||action==="middle"||action==="load" ? i>2 : action==="upper" ? i<3 : true);
          objects.river.gravel.points.visible=action==="load"||action==="cycle";
        }
        if(kind==="coast" && objects.coast){
          objects.coast.sandParticles.points.visible=action==="drift"||action==="deposition";
          objects.coast.spit.visible=action==="deposition"||action==="drift"||action==="erosion";
        }
        if(kind==="climate" && objects.climate){
          objects.climate.rain.points.visible=action==="windward"||action==="reverse";
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
        playing=false;elapsed=0;camera.position.set(8,7,10);
        if(orbit){orbit.target.set(0,.25,0);orbit.update();}
        select(cfg.controls[0][1]);
      });
      root.querySelector("[data-speed]").addEventListener("input",e=>speed=Number(e.target.value));
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
          updateParticles(objects.cycle.evaporation,dt*speed,"rise");
          updateParticles(objects.cycle.rainfall,dt*speed,"fall");
        }
        if(playing&&kind==="river"&&objects.river)updateParticles(objects.river.gravel,dt*speed,"drift");
        if(playing&&kind==="coast"&&objects.coast)updateParticles(objects.coast.sandParticles,dt*speed,"drift");
        if(playing&&kind==="climate"&&objects.climate){
          updateParticles(objects.climate.rain,dt*speed,"fall");
          updateParticles(objects.climate.dryDust,dt*speed,"drift");
        }
        if(kind==="coast"&&objects.coast&&playing){objects.coast.waveFoam.forEach((line,i)=>line.position.z=Math.sin(elapsed*1.2+i*.7)*.08);}
        if(kind==="tectonic"&&objects.plates&&playing){
          const p=objects.plates;
          if(scenario==="diverge"){p.left.position.x-=dt*.035*speed;p.right.position.x+=dt*.035*speed;}
          if(scenario==="converge"){p.left.position.x+=dt*.025*speed;p.right.position.x-=dt*.025*speed;}
          if(scenario==="transform"){p.left.position.z-=dt*.04*speed;p.right.position.z+=dt*.04*speed;}
          p.topLeft.position.x=p.left.position.x;p.topRight.position.x=p.right.position.x;p.topLeft.position.z=p.left.position.z;p.topRight.position.z=p.right.position.z;
          p.quakes.forEach((r,i)=>{r.scale.setScalar(1+((elapsed*.7+i*.22)%1)*1.6);r.material.opacity=.55*(1-((elapsed*.7+i*.22)%1));});
        }
        if(playing)animated.forEach(fn=>fn(elapsed));
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