/* EDUVERSE | Địa lí 6
 * Bộ mô phỏng 3D: mảng kiến tạo, chu trình nước, quá trình sông,
 * địa hình ven biển và ảnh hưởng địa hình đến khí hậu.
 * Dựng hình WebGL 3D bằng Three.js r147; không có Canvas 2D/vector fallback.
 */
(function () {
  "use strict";

  const THREE = window.THREE;
  if (!THREE) {
    const fail = root => {
      root.innerHTML = '<section class="evgeo evgeo-error"><h2>Không thể khởi tạo mô phỏng 3D</h2><p>Thư viện Three.js chưa được tải. Kiểm tra kết nối mạng rồi tải lại trang.</p></section>';
      return { destroy() {} };
    };
    window.simTectonics=root=>fail(root);
    window.simWaterCycle=root=>fail(root);
    window.simRiverProcess=root=>fail(root);
    window.simCoastalLandforms=root=>fail(root);
    window.simClimateRelief=root=>fail(root);
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
    const size = 512, data = new Uint8Array(size * size * 4);
    const hex = base.replace("#", "");
    const br = parseInt(hex.slice(0, 2), 16), bg = parseInt(hex.slice(2, 4), 16), bb = parseInt(hex.slice(4, 6), 16);
    let n = seed >>> 0;
    const rand = () => { n = (n * 1664525 + 1013904223) >>> 0; return n / 4294967296; };
    const coarse = new Float32Array(64 * 64);
    for (let i = 0; i < coarse.length; i++) coarse[i] = rand() - .5;
    for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4, cx = Math.floor(x / 8), cy = Math.floor(y / 8);
      const broad = coarse[cy * 64 + cx] * 13, fine = (rand() - .5) * 22 * scale;
      const grain = Math.sin((x * .17 + y * .09) * scale) * 2.2, v = broad + fine + grain;
      data[i] = Math.max(0, Math.min(255, br + v));
      data[i + 1] = Math.max(0, Math.min(255, bg + v));
      data[i + 2] = Math.max(0, Math.min(255, bb + v)); data[i + 3] = 255;
    }
    const map = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
    map.wrapS = map.wrapT = THREE.RepeatWrapping; map.repeat.set(2.5, 2.5);
    map.magFilter = THREE.LinearFilter; map.minFilter = THREE.LinearMipmapLinearFilter;
    map.generateMipmaps = true; map.colorSpace = THREE.SRGBColorSpace || map.colorSpace; map.needsUpdate = true;
    return map;
  }
  const TEX = {
    grass: makeTexture("#668452", 17), soil: makeTexture("#987653", 23),
    rock: makeTexture("#81786b", 31), sand: makeTexture("#c8ad7c", 41),
    seabed: makeTexture("#786b56", 53), sediment: makeTexture("#b69a6a", 67)
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
    const geo = new THREE.PlaneGeometry(width, depth, opts.segments || 32, opts.segments || 24);
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
        // Normals are calculated once; recomputing them every frame is unnecessarily expensive.
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
        title: "VÒNG TUẦN HOÀN LỚN CỦA NƯỚC",
        lead: "Theo dõi nước bốc hơi chủ yếu từ đại dương, ngưng tụ thành mây, rơi xuống lục địa rồi trở lại biển qua dòng chảy mặt và nước ngầm.",
        controls: [["Toàn chu trình","cycle"]],
        groups: [
          {title:"Bốc hơi",items:[["Từ đại dương","evaporation_sea"],["Từ sông, hồ và đất ẩm","evaporation_inland"]]},
          {title:"Ngưng tụ",items:[["Hơi nước ngưng tụ","condensation"],["Hình thành mây","cloud_formation"]]},
          {title:"Giáng thủy",items:[["Mưa xuống lục địa","precipitation_rain"]]},
          {title:"Nước trở về đại dương",items:[["Dòng chảy mặt","surface_runoff"],["Thấm và dòng chảy ngầm","groundwater_flow"]]}
        ]
      },
      river: {
        title: "PHONG HÓA, XÂM THỰC VÀ BỒI TỤ",
        lead: "Quan sát đá bị phá vỡ, vật liệu được dòng nước bóc tách và vận chuyển, sau đó lắng đọng khi dòng chảy yếu đi.",
        controls: [["Phong hóa","weathering"],["Thượng lưu","upper"],["Xâm thực","erosion"],["Vận chuyển","transport"],["Trung lưu","middle"],["Bồi tụ","deposition"],["Hạ lưu","lower"]]
      },
      coast: {
        title: "SÓNG BIỂN, THỦY TRIỀU VÀ DÒNG BIỂN",
        lead: "Phân biệt dao động của sóng, sự lên xuống có chu kỳ của mực nước triều và dòng nước chuyển động trong đại dương.",
        controls: [["Sóng biển","waves"],["Thủy triều","tide"],["Dòng biển","current"]]
      },
      climate: {
        title: "KHÍ ÁP VÀ HƯỚNG GIÓ",
        lead: "Quan sát không khí chuyển động từ khu vực áp cao về khu vực áp thấp; chênh lệch khí áp càng lớn, gió có xu hướng càng mạnh.",
        controls: [["Gió từ cao áp đến thấp áp","highlow"],["Chênh lệch khí áp lớn","gradient"],["Đảo vị trí hai vùng áp","reverse"]]
      }
    };
    const cfg = configs[kind];
    if (!cfg) return { destroy() {} };

    root.classList.add("geo-sim-root");

    root.innerHTML = `
      <section class="evgeo">
        <div class="evgeo-head">
          <div><div class="evgeo-kicker">EDUVERSE · ĐỊA LÍ 6 · MÔ PHỎNG 3D</div>
          <h2>${cfg.title}</h2></div>
          <span class="evgeo-live">TƯƠNG TÁC</span>
        </div>
        <p class="evgeo-lead">${cfg.lead}</p>
        <div class="evgeo-layout">
          <div class="evgeo-view">
            <canvas aria-label="Khung dựng hình mô phỏng địa lí 3D bằng WebGL"></canvas>
            <div class="evgeo-viewtag">MÔ HÌNH 3D · KÉO ĐỂ XOAY · CUỘN ĐỂ ZOOM</div>
            <div class="evgeo-readout">TOÀN CẢNH</div>
          </div>
          <aside class="evgeo-controls" aria-label="Bảng điều khiển mô phỏng">
            <div class="evgeo-control-section"><b class="evgeo-section-title">CHỌN QUÁ TRÌNH</b><div class="evgeo-buttons"></div></div>
            <div class="evgeo-process"><b>DIỄN BIẾN</b><div class="evgeo-process-track"><i data-progress></i></div><span data-stage>Chờ bắt đầu</span></div>
            <div class="evgeo-explain" aria-live="polite">${cfg.lead}</div>
            <div class="evgeo-footer">
              <div class="evgeo-actions">
                <button data-run="play">▶ Chạy diễn biến</button>
                <button data-run="pause">Ⅱ Tạm dừng</button>
                <button data-run="reset">↺ Đặt lại</button>
              </div>
              <label>Tốc độ <input data-speed type="range" min=".25" max="2.5" step=".25" value="1"></label>
              <label>Cường độ <input data-force type="range" min=".25" max="2" step=".25" value="1"></label>
              <span>Điều chỉnh để so sánh mức độ tác động.</span>
            </div>
          </aside>
        </div>
      </section>`;

    const style = document.createElement("style");
    style.textContent = `
      .simroot.geo-sim-root{display:block!important;grid-column:1/-1!important;width:100%;max-width:none!important;min-width:0}.evgeo{width:100%;max-width:none;min-width:0;box-sizing:border-box;color:#edf6fb;background:linear-gradient(145deg,#071b2c,#12364a);border:1px solid #24475c;border-radius:18px;padding:clamp(10px,2vw,17px);overflow:hidden}
      .evgeo-head{display:flex;justify-content:space-between;align-items:flex-start;gap:12px}
      .evgeo-kicker{font-size:10px;letter-spacing:1.5px;color:#8fc5df;font-weight:700}
      .evgeo h2{font-size:clamp(14px,2vw,19px);line-height:1.35;margin:5px 0 0;font-weight:800}
      .evgeo-live{font-size:9px;letter-spacing:1px;border:1px solid #4c849d;color:#b8e6f5;padding:5px 8px;border-radius:20px;white-space:nowrap}
      .evgeo-lead{font-size:12px;line-height:1.55;color:#c7dce8;margin:9px 0 12px}
      .evgeo-layout{display:grid;grid-template-columns:minmax(0,1fr) 340px;gap:16px;align-items:stretch}
      .evgeo-view{height:clamp(500px,70vh,760px);min-height:460px;position:relative;overflow:hidden;border-radius:13px;background:linear-gradient(#9fc5d8,#d5e0d9 66%,#657d61);box-shadow:inset 0 0 35px #173a4d55}
      .evgeo-view canvas{width:100%;height:100%;display:block;touch-action:none}
      .evgeo-label,.evgeo-readout{display:none!important}
      .evgeo-viewtag{position:absolute;top:9px;left:9px;background:#071b2cce;color:#e2f3fb;border:1px solid #ffffff24;border-radius:7px;padding:6px 8px;font-size:9px;letter-spacing:.35px;pointer-events:none}
      .evgeo-controls{min-width:0;display:flex;flex-direction:column;gap:8px;padding:10px;border:1px solid #ffffff1c;border-radius:13px;background:#061725a8}
      .evgeo-control-section{min-width:0}.evgeo-section-title{font-size:10px;letter-spacing:1px;color:#91c9df}
      .evgeo-buttons{display:grid;grid-template-columns:1fr;gap:5px;margin-top:7px}
      .evgeo button{border:1px solid #4e7e95;background:#17445d;color:#f2f8fb;border-radius:7px;padding:7px 9px;font-size:10px;line-height:1.25;cursor:pointer;text-align:left}
      .evgeo button.active,.evgeo button:focus-visible{background:#147c9d;border-color:#9be1f2;outline:none}
      .evgeo-water-groups{display:grid;gap:6px;margin-top:6px}
      .evgeo-water-group{border:1px solid #31566b;border-radius:8px;padding:6px;background:#0d2b3d}
      .evgeo-water-toggle{display:flex!important;align-items:center;justify-content:space-between;width:100%;font-size:10px!important;font-weight:800;background:#0d2b3d!important;padding:7px 8px!important}
      .evgeo-water-toggle i{font-style:normal;color:#9fd9e9;font-size:13px}
      .evgeo-water-toggle[aria-expanded="true"]{background:#17445d!important}
      .evgeo-water-children{display:grid;grid-template-columns:1fr 1fr;gap:4px;padding-top:5px}
      .evgeo-water-children[hidden]{display:none!important}
      .evgeo-water-children button{font-size:9px;padding:6px 7px;border-radius:6px;background:#183f54}
      .evgeo-water-children button.active{background:#147c9d;border-color:#9be1f2}
      .evgeo-water-all{width:100%;font-weight:800}
      .evgeo-explain{padding:11px 12px;border-radius:10px;background:#ffffff10;border-left:3px solid #58b5d0;color:#d9eaf2;font-size:12px;line-height:1.6;min-height:72px}
      .evgeo-footer{display:flex;flex-direction:column;align-items:stretch;gap:9px;margin-top:auto}
      .evgeo-actions{display:grid;grid-template-columns:1fr;gap:6px}
      .evgeo-footer label{display:grid;grid-template-columns:58px minmax(0,1fr);align-items:center;gap:6px;color:#c8dce7;font-size:11px}
      .evgeo-footer input{width:100%;accent-color:#63c3dc}.evgeo-footer span{font-size:10px;color:#91afbf;line-height:1.45}
      .evgeo-process{display:grid;grid-template-columns:1fr;align-items:center;gap:7px;padding:9px 0;border-top:1px solid #ffffff1c;border-bottom:1px solid #ffffff1c;color:#b8d5e3;font-size:10px}
      .evgeo-process-track{height:6px;background:#ffffff20;border-radius:9px;overflow:hidden}
      .evgeo-process-track i{display:block;width:0;height:100%;background:linear-gradient(90deg,#4ca8c5,#b4e7ed);transition:width .15s}
      .evgeo-error{padding:22px;color:#f2f8fb;background:#182d3d;border:1px solid #a65c4d;border-radius:14px}
      .evgeo-error p{font-size:13px;line-height:1.6;color:#d7e6ed}
      .evgeo-webgl-error{height:100%;min-height:300px;display:grid;place-content:center;padding:28px;color:#fff;background:linear-gradient(145deg,#263c4b,#101f2b);font:600 14px/1.7 system-ui;text-align:center}
      @media(max-width:820px){.evgeo-layout{grid-template-columns:minmax(0,1fr)}.evgeo-view{height:clamp(340px,55vh,480px);min-height:300px}.evgeo-buttons{grid-template-columns:repeat(auto-fit,minmax(135px,1fr))}.evgeo-actions{grid-template-columns:repeat(3,minmax(0,1fr))}.evgeo-footer label{grid-template-columns:65px minmax(0,1fr)}}
      @media(max-width:480px){.evgeo-view{height:360px}.evgeo-footer span{width:100%}.evgeo button{padding:8px 9px}}
    `;
    root.appendChild(style);

    const canvas = root.querySelector("canvas");
    const view = root.querySelector(".evgeo-view");
    const explain = root.querySelector(".evgeo-explain");
    const readout = root.querySelector(".evgeo-readout");
    const buttons = root.querySelector(".evgeo-buttons");
    const progressBar=root.querySelector("[data-progress]"),stageText=root.querySelector("[data-stage]"),forceInput=root.querySelector("[data-force]");
    let renderer, scene, camera, orbit, observer, visibilityObserver, raf = 0, destroyed = false;
    let playing = true, elapsed = 0, speed = 1, force = 1, scenario = "", waterSurfaces = [], particleSystems = [], updaters = [];
    const objects = {};

    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false, powerPreference: "high-performance" });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.15));
      renderer.shadowMap.enabled = false;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.0;
      if ("outputColorSpace" in renderer) renderer.outputColorSpace = THREE.SRGBColorSpace;
      scene = new THREE.Scene();
      scene.background = new THREE.Color(0x9fb9c6);
      scene.fog = new THREE.Fog(0x9fb9c6, 20, 42);
      camera = new THREE.PerspectiveCamera(42, 1, .1, 100);
      camera.position.set(8, 7, 10);
      scene.add(new THREE.HemisphereLight(0xe5edf0, 0x514b40, 1.05));
      const sun = new THREE.DirectionalLight(0xfff0d8, 1.65);
      sun.position.set(-6, 12, 7); sun.castShadow = false; scene.add(sun);
      const floor = new THREE.Mesh(new THREE.PlaneGeometry(30,30), MAT(0x53615a));
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
        scene.background = new THREE.Color(0x9ebfce);
        scene.fog = new THREE.Fog(0x9ebfce, 23, 42);

        // River centreline also defines the incised valley in the terrain.
        const riverX=(z)=>-3.15+(z+4.8)*.72+Math.sin((z+4.8)*.72)*.48;
        const heightAt=(x,z)=>{
          const mainRidge=2.25*Math.exp(-Math.pow((x+4.55)/2.15,2))*(.78+.22*Math.cos(z*.38));
          const rearRidge=1.05*Math.exp(-Math.pow((x+1.9)/2.6,2));
          const foothill=.48*Math.exp(-Math.pow((x-.2)/2.4,2));
          const channel=Math.exp(-Math.pow((x-riverX(z))/.58,2))*.34;
          const valley=-.16*Math.exp(-Math.pow((x-2.0)/2.4,2));
          return -.18+mainRidge+rearRidge+foothill+valley-channel
            +.055*Math.sin(z*.8+x*.48)+.035*Math.cos(z*1.35-x*.22);
        };
        const terrain=addTerrain(16,12,144,108,heightAt,TEX.grass,(x,z,y)=>{
          if(y>1.9)return new THREE.Color(0x77766d);
          if(y>1.15)return new THREE.Color(0x65775a);
          if(x>3.5)return new THREE.Color(0x9b9877);
          if(y<.02)return new THREE.Color(0x78865b);
          return new THREE.Color(0x668252);
        });
        terrain.position.set(0,0,0);

        // Ocean basin and a narrow natural shore transition.
        const ocean=addWater(8.2,12,5.15,-.19,.05,{segments:88,color:0x176b8d,opacity:.97});
        const shoreShape=new THREE.Shape();
        shoreShape.moveTo(0,-5.8);shoreShape.lineTo(1.15,-5.8);
        shoreShape.quadraticCurveTo(.65,-2.6,1.45,0);
        shoreShape.quadraticCurveTo(2.1,2.8,1.25,5.8);
        shoreShape.lineTo(0,5.8);shoreShape.closePath();
        const shoreGeo=new THREE.ShapeGeometry(shoreShape,32);shoreGeo.rotateX(-Math.PI/2);
        const shore=new THREE.Mesh(shoreGeo,new THREE.MeshStandardMaterial({map:TEX.sand,roughness:.98,side:THREE.DoubleSide}));
        shore.position.set(3.35,-.12,.05);scene.add(shore);

        // A real ribbon-shaped river channel follows the carved valley.
        const riverPoints=[];
        for(let i=0;i<=120;i++){
          const t=i/120,z=-5.1+t*10.2,x=riverX(z);
          riverPoints.push(new THREE.Vector3(x,heightAt(x,z)+.065,z));
        }
        const riverCurve=new THREE.CatmullRomCurve3(riverPoints);
        const makeRiverRibbon=(offset,width,color,opacity)=>{
          const verts=[],indices=[],steps=180;
          for(let i=0;i<=steps;i++){
            const t=i/steps,p=riverCurve.getPointAt(t),t0=Math.max(0,t-.002),t1=Math.min(1,t+.002);
            const a=riverCurve.getPointAt(t0),b=riverCurve.getPointAt(t1);
            const dx=b.x-a.x,dz=b.z-a.z,len=Math.hypot(dx,dz)||1;
            const nx=-dz/len,nz=dx/len,w=width*(.72+.28*Math.sin(Math.PI*t));
            const y=p.y+offset;
            verts.push(p.x+nx*w,y,p.z+nz*w,p.x-nx*w,y,p.z-nz*w);
            if(i<steps){const k=i*2;indices.push(k,k+1,k+2,k+1,k+3,k+2);}
          }
          const geo=new THREE.BufferGeometry();
          geo.setAttribute("position",new THREE.Float32BufferAttribute(verts,3));
          geo.setIndex(indices);geo.computeVertexNormals();
          const mat=new THREE.MeshPhysicalMaterial({color,roughness:.22,metalness:.02,clearcoat:.85,transparent:opacity<1,opacity,side:THREE.DoubleSide});
          const mesh=new THREE.Mesh(geo,mat);mesh.receiveShadow=true;scene.add(mesh);return mesh;
        };
        const riverBed=makeRiverRibbon(-.035,.42,0x80694f,1);
        const river=makeRiverRibbon(.025,.31,0x267d9c,1);

        // A short cascade connects the upper stream to the incised channel.
        const fallsGroup=new THREE.Group();
        const fallMat=new THREE.MeshPhysicalMaterial({color:0x9edce9,roughness:.16,transparent:true,opacity:.88,side:THREE.DoubleSide});
        const fallGeo=new THREE.PlaneGeometry(.72,1.05,8,20);
        const fall= new THREE.Mesh(fallGeo,fallMat);
        fall.rotation.x=-.22;fall.position.set(-3.25,.42,-2.55);fallsGroup.add(fall);
        const plunge=new THREE.Mesh(new THREE.CircleGeometry(.48,32),new THREE.MeshPhysicalMaterial({color:0x8ed2e2,transparent:true,opacity:.55,roughness:.2}));
        plunge.rotation.x=-Math.PI/2;plunge.position.set(-2.55,.05,-2.25);fallsGroup.add(plunge);
        scene.add(fallsGroup);

        // Forest patches follow the mountain contours; rocks are clustered at the stream.
        [[-6,-3,.9],[-5.65,-1.9,.85],[-5.7,-.5,1],[-5.15,1,.92],[-4.7,2.6,.78],[-4.1,-3.6,.76],[-3.9,-1.65,.8],[-4.35,3.5,.72],[-2.7,1.7,.7],[-2.4,-3.2,.66]].forEach(([x,z,k])=>addTree(scene,x,heightAt(x,z),z,k));
        const rockMat=new THREE.MeshStandardMaterial({map:TEX.rock,roughness:.96});
        for(let i=0;i<24;i++){
          const z=-4.4+(i%8)*1.12,x=riverX(z)+(i%2?-.62:.62)+(Math.sin(i*2.1)*.12);
          const rock=new THREE.Mesh(new THREE.DodecahedronGeometry(.13+(i%4)*.035,1),rockMat);
          rock.position.set(x,heightAt(x,z)+.09,z);rock.rotation.set(i*.23,i*.61,i*.17);rock.scale.set(1,.72,.85);scene.add(rock);
        }

        // Geological cutaway: irregular strata instead of a detached wooden-looking box.
        const profileX=[-3.35,-2.5,-1.65,-.8,.05,.9,1.75,2.6,3.35];
        const topProfile=[-.12,-.04,-.1,-.02,-.13,-.06,-.15,-.08,-.18];
        const makeStratum=(top,bottom,color,roughness=1,opacity=1)=>{
          const shape=new THREE.Shape();
          shape.moveTo(profileX[0],top[0]);
          for(let i=1;i<profileX.length;i++)shape.lineTo(profileX[i],top[i]);
          for(let i=profileX.length-1;i>=0;i--)shape.lineTo(profileX[i],bottom[i]);
          shape.closePath();
          const geo=new THREE.ExtrudeGeometry(shape,{depth:.48,bevelEnabled:false,steps:1});
          const mat=new THREE.MeshStandardMaterial({color,roughness,transparent:opacity<1,opacity,side:THREE.DoubleSide});
          const mesh=new THREE.Mesh(geo,mat);mesh.position.z=4.55;mesh.castShadow=true;mesh.receiveShadow=true;scene.add(mesh);return mesh;
        };
        const layer=(v)=>v.map((n,i)=>n);
        const top=layer(topProfile);
        const humus=top.map(v=>v-.2);
        const subsoil=humus.map((v,i)=>v-.52-.06*Math.sin(i*.8));
        const weathered=subsoil.map((v,i)=>v-.42-.05*Math.cos(i*.65));
        const aquifer=weathered.map(v=>v-.34);
        const base=aquifer.map(v=>v-.52);
        const soilTop=makeStratum(top,humus,0x51402e,.98);
        const soilBody=makeStratum(humus,subsoil,0x98704e,.98);
        const weatheredRock=makeStratum(subsoil,weathered,0x827565,1);
        const groundwater=makeStratum(weathered,aquifer,0x397f98,.34,.82);
        const bedrock=makeStratum(aquifer,base,0x5d5a54,1);
        const rootLines=[];
        for(let i=0;i<9;i++){
          const x=-3.05+i*.76,y=topProfile[Math.min(8,Math.round(i*.95))]-.08;
          rootLines.push(addLine(scene,[[x,y,5.05],[x+.1,y-.22,5.05],[x-.08,y-.38,5.05]],0x493827,.82,.014));
        }

        const clouds=[cloud(-1.9,4.15,-2.5,1.2),cloud(.85,4.55,-1.5,1.05),cloud(3.0,4.15,-2.7,.82)];
        const sunBall=new THREE.Mesh(new THREE.SphereGeometry(.34,24,16),new THREE.MeshBasicMaterial({color:0xffd47a}));
        sunBall.position.set(-6.1,4.8,-3.9);scene.add(sunBall);
        const sunGlow=new THREE.Mesh(new THREE.SphereGeometry(.62,24,16),new THREE.MeshBasicMaterial({color:0xffd47a,transparent:true,opacity:.1,depthWrite:false}));
        sunGlow.position.copy(sunBall.position);scene.add(sunGlow);

        const evaporation=addParticles(120,0xd8f3ff,{x:6.2,y:4.1,z:6.8},.085);
        const rainfall=addParticles(165,0xc4eafa,{x:5.8,y:4.5,z:5.8},.075);
        const transpiration=addParticles(75,0xe0f6dc,{x:3.8,y:3.2,z:4.2},.027);
        const infiltrationPts=addParticles(65,0x8ed9ed,{x:6.2,y:1.5,z:1.4},.065);
        seedParticles(evaporation,{x:[3.2,6.5],y:[.05,3.8],z:[-2.5,2.8]});
        seedParticles(rainfall,{x:[-1.5,2.3],y:[1.0,4.1],z:[-2.8,2.7]});
        seedParticles(transpiration,{x:[-6.0,-2.8],y:[.5,2.8],z:[-3.0,2.8]});
        seedParticles(infiltrationPts,{x:[-2.9,2.4],y:[-.25,.8],z:[4.55,4.95]});

        const flowGeo=new THREE.BufferGeometry(),flowCount=120,flowPositions=new Float32Array(flowCount*3);
        for(let i=0;i<flowCount;i++){const p=riverCurve.getPointAt(i/flowCount);flowPositions.set([p.x,p.y+.09,p.z],i*3);}
        flowGeo.setAttribute("position",new THREE.BufferAttribute(flowPositions,3));
        const flowPoints=new THREE.Points(flowGeo,new THREE.PointsMaterial({color:0xe4f8ff,size:.045,transparent:true,opacity:.92,depthWrite:false}));
        scene.add(flowPoints);

        const infiltrationLines=[];
        for(let i=0;i<15;i++){
          const x=-2.8+i*.39,line=addLine(scene,[[x,.02,4.48],[x+.07,-.36,4.7],[x+.02,-.78,4.7],[x+.13,-1.18,4.7]],0x83d4e8,.78,.018);
          line.visible=false;infiltrationLines.push(line);
        }
        const runoffCoords=[[-2.9,3.35],[-1.6,3.55],[.0,3.6],[1.65,3.25],[3.1,2.5]];
        const runoff=addLine(scene,runoffCoords.map(([x,z])=>[x,heightAt(x,z)+.105,z]),0x9bd9e8,.9,.032);
        runoff.visible=false;

        // Broad, translucent undulating bands represent incoming solar radiation.
        const heatRays=[];
        for(let band=0;band<3;band++){
          const cols=56,rows=5,positions=[],indices=[];
          for(let r=0;r<=rows;r++)for(let c=0;c<=cols;c++){
            const u=c/cols,v=r/rows,x=-5.9+u*10.8;
            const z=-2.65+band*1.05+(v-.5)*.72+Math.sin(u*9+band)*.12;
            const y=4.35-u*4.25+Math.sin(u*11+band*.8)*.16+(v-.5)*.08;
            positions.push(x,y,z);
          }
          for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){
            const a=r*(cols+1)+c,b=a+1,d=(r+1)*(cols+1)+c,e=d+1;indices.push(a,d,b,b,d,e);
          }
          const geo=new THREE.BufferGeometry();geo.setAttribute("position",new THREE.Float32BufferAttribute(positions,3));geo.setIndex(indices);geo.computeVertexNormals();
          const material=new THREE.MeshBasicMaterial({color:band===1?0xffdf9a:0xffc96e,transparent:true,opacity:.105,side:THREE.DoubleSide,depthWrite:false});
          const wave=new THREE.Mesh(geo,material);scene.add(wave);heatRays.push({mesh:wave,base:positions.slice(),band,cols,rows});
        }
        const heatedSurface=new THREE.Mesh(
          new THREE.CircleGeometry(.92,40),
          new THREE.MeshBasicMaterial({color:0xffc66d,transparent:true,opacity:.17,depthWrite:false,side:THREE.DoubleSide})
        );
        heatedSurface.rotation.x=-Math.PI/2;heatedSurface.position.set(5.15,-.155,.1);scene.add(heatedSurface);

        // Moist air cools as it rises; droplets become visible around the cloud base.
        const coolingColumn=new THREE.Mesh(
          new THREE.CylinderGeometry(.52,.9,2.45,24,1,true),
          new THREE.MeshBasicMaterial({color:0x8bd8ed,transparent:true,opacity:.105,side:THREE.DoubleSide,depthWrite:false})
        );
        coolingColumn.position.set(1.05,3.15,-2.05);scene.add(coolingColumn);
        const condensationPts=addParticles(96,0xe8fbff,{x:3.2,y:1.5,z:2.2},.085);
        seedParticles(condensationPts,{x:[-.35,2.25],y:[3.0,4.35],z:[-2.65,-1.0]});
        condensationPts.points.visible=false;

        // Surface runoff follows the visible slope and joins the river channel.
        const runoffCurve=new THREE.CatmullRomCurve3([
          [-2.9,3.35],[-2.0,3.58],[-1.1,3.62],[-.1,3.55],
          [1.0,3.28],[2.0,2.92],[3.0,2.48],[4.15,1.8]
        ].map(([x,z])=>new THREE.Vector3(x,heightAt(x,z)+.13,z)));
        const runoffPts=addParticles(74,0xcaf5ff,{x:5,y:1,z:2},.075);runoffPts.points.visible=false;
        const runoffFoam=addParticles(110,0xf0ffff,{x:5,y:1,z:2},.055);runoffFoam.points.material.opacity=.92;runoffFoam.points.visible=false;
        const runoffBed=addLine(scene,runoffCurve.getPoints(90).map(p=>[p.x,p.y-.045,p.z]),0x126e91,.82,.115);runoffBed.visible=false;
        const runoffRills=[];
        for(let i=0;i<7;i++){const drop=new THREE.Mesh(new THREE.SphereGeometry(.075,8,6),new THREE.MeshBasicMaterial({color:0xc7f4ff,transparent:true,opacity:.8}));scene.add(drop);runoffRills.push(drop);}
        runoffRills.forEach(x=>x.visible=false);

        // Groundwater percolates through the strata, then moves laterally toward the coast.
        const groundwaterCurve=new THREE.CatmullRomCurve3([
          new THREE.Vector3(-2.65,-.12,5.08),new THREE.Vector3(-2.2,-.58,5.08),
          new THREE.Vector3(-1.35,-1.03,5.08),new THREE.Vector3(-.35,-1.42,5.08),
          new THREE.Vector3(.85,-1.58,5.08),new THREE.Vector3(2.0,-1.48,5.08),
          new THREE.Vector3(3.15,-1.12,5.08)
        ]);
        const groundwaterPath=addLine(scene,groundwaterCurve.getPoints(70).map(p=>[p.x,p.y,p.z]),0x55b9df,.95,.075);groundwaterPath.visible=false;
        const groundwaterFlowPts=addParticles(58,0xb6efff,{x:5,y:1,z:1},.075);groundwaterFlowPts.points.visible=false;
        const aquiferGlow=addLine(scene,groundwaterCurve.getPoints(70).map(p=>[p.x,p.y-.13,p.z]),0x328db7,.22,.23);aquiferGlow.visible=false;
        const seepagePoints=addParticles(34,0xd4f4ff,{x:4,y:1,z:1},.055);seepagePoints.points.visible=false;

        objects.cycle={ocean,clouds,evaporation,rainfall,transpiration,infiltrationPts,infiltrationLines,flowPoints,riverCurve,runoff,fallsGroup,sunGlow,
          heatRays,heatedSurface,coolingColumn,condensationPts,runoffCurve,runoffPts,runoffFoam,runoffBed,runoffRills,groundwaterCurve,groundwaterPath,groundwaterFlowPts,aquiferGlow,seepagePoints,
          soil:{soilTop,soilBody,weatheredRock,groundwater,bedrock,rootLines}};
        camera.position.set(11.8,9.2,14.5);
        addLabel(view,"BỐC HƠI",76,48);addLabel(view,"NGƯNG TỤ",42,13);addLabel(view,"MƯA",33,40);
        addLabel(view,"THOÁT HƠI THỰC VẬT",7,48);addLabel(view,"DÒNG CHẢY MẶT",53,69);
        addLabel(view,"THẤM XUỐNG ĐẤT",30,91);addLabel(view,"TẦNG NƯỚC NGẦM",68,91);
        animated.push(t=>{
          const a=flowGeo.attributes.position;
          for(let i=0;i<flowCount;i++){const p=riverCurve.getPointAt((i/flowCount+t*.055)%1);a.setXYZ(i,p.x,p.y+.09,p.z);}
          a.needsUpdate=true;sunGlow.material.opacity=.08+Math.sin(t*.65)*.025;
        });
      }

      function buildRiver() {
        scene.background = new THREE.Color(0xa9cad9);
        const h = (x,z)=>.12 + (4.5-z)*.17 + .2*Math.sin(x*1.15+z*.4) +
          .35*Math.exp(-Math.pow((x+3.5)/1.3,2)) + .12*Math.cos(z*1.4);
        addTerrain(14,10,64,52,h,TEX.grass,(x,z,y)=>new THREE.Color(y>1.8?0x6c725e:y>.8?0x687b55:0x71815d));
        // Lòng sông uốn khúc, hạ thấp dần về hạ lưu.
        const pts=[];
        for(let i=0;i<=100;i++){const z=-4.6+i*.092;const x=Math.sin(i*.075)*1.9;pts.push([x,h(x,z)+.08,z]);}
        const curve=new THREE.CatmullRomCurve3(pts.map(p=>new THREE.Vector3(...p)));
        const bed=new THREE.Mesh(new THREE.TubeGeometry(curve,260,.42,14,false),MAT(0x75634d));
        bed.position.y=-.08;scene.add(bed);
        const waterCurve=new THREE.Mesh(new THREE.TubeGeometry(curve,260,.29,14,false),new THREE.MeshPhysicalMaterial({color:0x176d91,roughness:.24,transparent:true,opacity:.94,clearcoat:.85,clearcoatRoughness:.12}));
        waterCurve.position.y=.1;scene.add(waterCurve);
        const bars=[];
        for(let i=0;i<8;i++){
          const z=-3.6+i*.9,x=Math.sin(i*.8)*1.65+.35;
          const bar=new THREE.Mesh(new THREE.SphereGeometry(.48,24,14),new THREE.MeshStandardMaterial({map:TEX.sediment,roughness:1}));
          bar.scale.set(1.5,.13,.65);bar.position.set(x,h(x,z)+.07,z);scene.add(bar);bars.push(bar);
        }
        const weatheringRock=meshBox(scene,1.15,1.05,.95,MAT(0x70685e),-3.45,2.12,-3.65);
        const weatheringCracks=[
          addLine(scene,[[-3.78,2.48,-3.17],[-3.55,2.3,-3.16],[-3.42,2.08,-3.16]],0x342f2b,.95,.018),
          addLine(scene,[[-3.22,2.55,-3.17],[-3.31,2.32,-3.16],[-3.12,2.13,-3.16]],0x342f2b,.95,.016)
        ];
        const weatheringFlakes=addParticles(34,0xc2a47b,{x:1.8,y:1.3,z:1.8},.045);
        seedParticles(weatheringFlakes,{x:[-4.2,-2.75],y:[1.7,2.85],z:[-4.25,-3.05]});
        const gravel=addParticles(70,0xc1a16f,{x:4,y:1.2,z:8},.045);
        const riverFlow=addParticles(150,0xc4e6ee,{x:3.8,y:.2,z:8.8},.026);
        seedParticles(riverFlow,{x:[-1.55,1.55],y:[.22,.48],z:[-4.4,4.4]});
        seedParticles(gravel,{x:[-1.8,1.8],y:[.18,.85],z:[-4.5,4.5]});
        const outerBank=meshBox(scene,1.05,.34,.85,MAT(0x9b7651),-2.25,.5,-.25);
        const bankFace=meshBox(scene,.12,.62,.9,MAT(0x76563e),-2.72,.47,-.25);
        const delta=new THREE.Group();
        for(let i=0;i<5;i++){const lobe=new THREE.Mesh(new THREE.CircleGeometry(.62,3),MAT(i%2?0xb99a68:0xc7aa78));lobe.rotation.x=-Math.PI/2;lobe.rotation.z=(i-2)*.22;lobe.position.set(-.55+(i-2)*.38,.02,3.95+(i%2)*.38);delta.add(lobe);}scene.add(delta);
        const sedimentLayers=[];
        for(let i=0;i<3;i++)sedimentLayers.push(meshBox(scene,2.4,.045,1.1,MAT(i%2?0x9c805d:0xc4a574),.4,-.55-i*.09,4.05));

        objects.river={bars,gravel,riverFlow,waterCurve,curve,barBase:bars.map(b=>b.position.clone()),outerBank,bankFace,delta,sedimentLayers,weatheringRock,weatheringCracks,weatheringFlakes};
        camera.position.set(8,7,11);
        addLabel(view,"THƯỢNG LƯU",6,20);addLabel(view,"TRUNG LƯU",42,43);addLabel(view,"HẠ LƯU",76,73);        addLabel(view,"XÂM THỰC BỜ NGOÀI",8,57);addLabel(view,"BÃI BỒI",51,61);addLabel(view,"CHÂU THỔ",77,83);
      }

      function buildCoast() {
        scene.background = new THREE.Color(0x9fc8da);
        scene.fog = new THREE.Fog(0x9fc8da, 22, 42);

        // Bờ biển, bãi triều và vùng biển nông.
        const coastLand=meshBox(scene,3.8,.72,9.2,MAT(0x71805d),-2.35,.18,0);
        const beach=meshBox(scene,1.05,.16,9.15,MAT(0xcdb17b),-.12,-.04,0);
        const sea=addWater(9.2,9.2,4.0,-.08,0,{segments:96,color:0x126b91,opacity:.97});
        const nearshore=meshBox(scene,.62,.025,8.6,MAT(0x9e9b78,.9,{transparent:true,opacity:.72}),.28,-.035,0);

        // Các đường đỉnh sóng cong tiến về bờ.
        const waveFoam=[];
        for(let i=0;i<7;i++){
          const x=1.0+i*.92;
          waveFoam.push(addLine(scene,[
            [x,.12,-3.65],[x-.22,.15,-2.45],[x+.12,.17,-1.2],
            [x-.18,.16,0],[x+.1,.15,1.2],[x-.2,.14,2.45],[x,.12,3.65]
          ],0xe1f7fa,.86,.026));
        }

        // Dòng biển được biểu diễn bằng một tuyến dòng chảy khép cong và các hạt nước.
        const currentCurve=new THREE.CatmullRomCurve3([
          new THREE.Vector3(.9,.18,-2.9),new THREE.Vector3(2.25,.2,-2.45),
          new THREE.Vector3(4.2,.22,-1.55),new THREE.Vector3(5.75,.2,-.25),
          new THREE.Vector3(5.0,.18,1.45),new THREE.Vector3(3.15,.18,2.55),
          new THREE.Vector3(1.25,.18,2.15)
        ],true,"catmullrom",.45);
        const currentLine=new THREE.Mesh(
          new THREE.TubeGeometry(currentCurve,180,.035,8,true),
          new THREE.MeshBasicMaterial({color:0x8ce5e8,transparent:true,opacity:.85})
        );
        scene.add(currentLine);
        const currentDots=addParticles(84,0xd6ffff,{x:9,y:.2,z:7},.055);
        const currentAttr=currentDots.points.geometry.attributes.position;
        for(let i=0;i<currentAttr.count;i++){
          const p=currentCurve.getPointAt(i/currentAttr.count);
          currentAttr.setXYZ(i,p.x,p.y,p.z);
        }
        currentAttr.needsUpdate=true;

        // Thước đo mực nước và dải bãi triều thay đổi theo chu kỳ lên – xuống.
        const gauge=meshBox(scene,.07,2.05,.07,MAT(0xf0e5c8),-.28,.92,-.1);
        const tideMarker=new THREE.Mesh(new THREE.SphereGeometry(.14,18,12),MAT(0xffd36c,.45,{emissive:0x8c5c17,emissiveIntensity:.25}));
        tideMarker.position.set(-.22,.15,-.1);scene.add(tideMarker);
        const tideLow=addLine(scene,[[-.52,-.04,-.9],[-.18,-.04,-.9],[.16,-.04,-.9]],0x9bd8e8,.9,.018);
        const tideHigh=addLine(scene,[[-.52,.42,-.9],[-.18,.42,-.9],[.16,.42,-.9]],0xffd36c,.9,.018);
        const moon=new THREE.Mesh(new THREE.SphereGeometry(.42,24,16),MAT(0xe8edf2,.82,{emissive:0x303947,emissiveIntensity:.2}));
        moon.position.set(2.8,4.3,-3.8);scene.add(moon);
        const sunOrb=new THREE.Mesh(new THREE.SphereGeometry(.34,20,14),MAT(0xffd36c,.55,{emissive:0xb77a24,emissiveIntensity:.45}));
        sunOrb.position.set(-3.5,4.7,-3.5);scene.add(sunOrb);

        const sandParticles=addParticles(42,0xd5bd8d,{x:5,y:1,z:5},.035);
        seedParticles(sandParticles,{x:[-.05,.65],y:[.04,.25],z:[-3.8,3.8]});
        objects.coast={coastLand,beach,nearshore,sea,waveFoam,currentCurve,currentLine,currentDots,
          gauge,tideMarker,tideLow,tideHigh,moon,sunOrb,sandParticles};
        camera.position.set(9,6.5,10);
        addLabel(view,"SÓNG LAN TRUYỀN",8,22);
        addLabel(view,"MỰC NƯỚC TRIỀU",12,58);
        addLabel(view,"DÒNG BIỂN",70,28);
      }

      function buildClimate() {
        scene.background = new THREE.Color(0x9fc7d8);
        scene.fog = new THREE.Fog(0x9fc7d8, 22, 44);

        // Mặt cắt khí quyển giản lược: gió hình thành do chênh lệch khí áp.
        const ground=meshBox(scene,14,.18,8.5,MAT(0x667b65),0,-.12,0);
        const highCenter=new THREE.Vector3(-3,.08,0);
        const lowCenter=new THREE.Vector3(3,.08,0);
        const highDisc=new THREE.Mesh(new THREE.CircleGeometry(1.55,64),
          new THREE.MeshBasicMaterial({color:0xd96b58,transparent:true,opacity:.15,side:THREE.DoubleSide}));
        highDisc.rotation.x=-Math.PI/2;highDisc.position.copy(highCenter);scene.add(highDisc);
        const lowDisc=new THREE.Mesh(new THREE.CircleGeometry(1.55,64),
          new THREE.MeshBasicMaterial({color:0x4aa7d1,transparent:true,opacity:.17,side:THREE.DoubleSide}));
        lowDisc.rotation.x=-Math.PI/2;lowDisc.position.copy(lowCenter);scene.add(lowDisc);

        const makeIsobars=(center,color)=>{
          const rings=[];
          [1.0,1.38,1.76].forEach((r,i)=>{
            const ring=new THREE.Mesh(new THREE.TorusGeometry(r,.022,8,72),
              new THREE.MeshBasicMaterial({color,transparent:true,opacity:.72-i*.12}));
            ring.rotation.x=-Math.PI/2;ring.position.set(center.x,.11+i*.012,center.z);scene.add(ring);rings.push(ring);
          });
          return rings;
        };
        const highRings=makeIsobars(highCenter,0xffc2a6);
        const lowRings=makeIsobars(lowCenter,0xa9e7fa);

        const windArrows=[];
        for(let i=0;i<5;i++){
          const z=-2+i;
          const arrow=new THREE.ArrowHelper(new THREE.Vector3(1,0,0),new THREE.Vector3(-2.45,1.15,z),4.9,0xfff1c4,.34,.17);
          scene.add(arrow);windArrows.push(arrow);
        }
        const windParticles=addParticles(150,0xf1fbff,{x:10,y:1.5,z:5.6},.045);
        seedParticles(windParticles,{x:[-4.8,4.8],y:[.75,2.2],z:[-2.6,2.6]});
        const clouds=[cloud(2.4,3.05,-1.6,.9),cloud(3.4,2.85,1.15,.72)];
        const highMarker=new THREE.Mesh(new THREE.SphereGeometry(.28,20,14),MAT(0xd95d4f,.5,{emissive:0x6d1e19,emissiveIntensity:.3}));
        highMarker.position.set(-3,.42,0);scene.add(highMarker);
        const lowMarker=new THREE.Mesh(new THREE.SphereGeometry(.28,20,14),MAT(0x45a8d4,.5,{emissive:0x164b70,emissiveIntensity:.3}));
        lowMarker.position.set(3,.42,0);scene.add(lowMarker);

        objects.climate={ground,highCenter,lowCenter,highDisc,lowDisc,highRings,lowRings,
          windArrows,windParticles,clouds,highMarker,lowMarker};
        camera.position.set(8,6.5,10);
        addLabel(view,"ÁP CAO · H",9,30);
        addLabel(view,"GIÓ THỔI",43,18);
        addLabel(view,"ÁP THẤP · L",72,30);
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
        if(kind==="water"){elapsed=0;playing=true;}
        buttons.querySelectorAll("button").forEach(b=>b.classList.toggle("active",b.dataset.scenario===action));
        const descriptions={
          diverge:"Ranh giới phân kỳ: hai mảng tách xa nhau. Vật chất nóng từ bên dưới có thể đi lên, nguội đi và tạo phần vỏ mới.",
          converge:"Hội tụ đại dương – lục địa: mảng đại dương chìm xuống dưới mảng lục địa, hình thành rãnh đại dương và cung núi lửa.",
          collision:"Va chạm lục địa – lục địa: hai khối vỏ bị nén ép, uốn nếp và nâng cao thành dãy núi.",
          islandarc:"Hội tụ đại dương – đại dương: một mảng chìm xuống dưới mảng kia, tạo rãnh sâu và cung đảo núi lửa.",
          transform:"Ranh giới chuyển dạng: hai mảng trượt ngang ngược chiều nhau dọc theo đứt gãy; động đất có thể phát sinh khi ứng suất được giải phóng.",
          cycle:"Năng lượng Mặt Trời làm nước bốc hơi; hơi nước ngưng tụ thành mây, rơi xuống dưới dạng mưa và trở lại biển qua dòng chảy hoặc thấm xuống đất.",
          evaporation_sea:"Bức xạ Mặt Trời làm nước ở bề mặt đại dương nóng lên và chuyển thành hơi nước. Hơi nước bốc lên khí quyển, là nguồn cung cấp ẩm chủ yếu cho vòng tuần hoàn lớn.",
          evaporation_inland:"Nước ở sông, hồ và bề mặt đất ẩm nhận nhiệt, chuyển thành hơi nước rồi khuếch tán lên khí quyển. Lượng hơi nước này bổ sung cho khối khí phía trên lục địa.",
          condensation:"Hơi nước được không khí ẩm mang lên cao. Áp suất giảm khiến khối khí giãn nở và lạnh đi. Khi nhiệt độ hạ đến mức bão hòa, hơi nước bắt đầu ngưng tụ trên các hạt nhân ngưng kết thành những giọt nước li ti hoặc tinh thể băng. Vùng không khí phía trên núi được làm nổi bật để quan sát quá trình lạnh đi.",
          cloud_formation:"Các giọt nước li ti và tinh thể băng tập trung thành đám mây. Chúng va chạm, kết hợp và phát triển; đám mây dày hơn khi lượng giọt nước và tinh thể băng tăng. Mô hình biểu diễn sự hình thành và phát triển của mây, không coi mây là khối hơi nước nhìn thấy được.",
          precipitation_rain:"Trong mây, các giọt nước va chạm và hợp nhất; ở vùng mây lạnh, tinh thể băng cũng có thể phát triển. Khi hạt nước đủ lớn để thắng lực cản của không khí, chúng rơi xuống thành mưa. Các vệt mưa sẽ đi từ đáy mây đến mặt đất.",
          surface_runoff:"Nước mưa chạm mặt đất. Phần không kịp thấm hoặc vượt quá khả năng thấm của đất chảy theo sườn dốc, tập trung vào rãnh nhỏ rồi nhập vào suối và sông. Các hạt nước di chuyển dọc tuyến dốc để cho thấy hướng dòng chảy về biển.",
          groundwater_flow:"Nước mưa đi vào các khe rỗng giữa hạt đất và đá phong hóa. Một phần tiếp tục thấm sâu đến tầng chứa nước; tại đây, nước di chuyển chậm theo độ dốc thủy lực và có thể bổ sung cho sông hoặc thoát ra biển.",
          weathering:"Nước, không khí và sự thay đổi nhiệt độ làm đá nứt vỡ hoặc biến đổi tại chỗ. Các mảnh vật liệu sau khi hình thành có thể được dòng chảy cuốn đi; phong hóa không đồng nghĩa với xâm thực.",
          upper:"Thượng lưu thường có độ dốc lớn, dòng chảy nhanh và xâm thực sâu mạnh; lòng sông thường hẹp, có nhiều ghềnh thác.",
          middle:"Trung lưu có độ dốc giảm. Dòng sông uốn khúc rõ hơn; bờ lõm thường bị xói mòn, bờ lồi có xu hướng bồi tụ.",
          lower:"Hạ lưu có độ dốc nhỏ, dòng chảy chậm hơn; phù sa dễ lắng đọng, có thể hình thành bãi bồi và châu thổ.",
          load:"Dòng nước vận chuyển vật liệu bằng cách hòa tan, cuốn lăn hoặc kéo lê hạt đáy và giữ các hạt mịn lơ lửng.",
          erosion:"Dòng chảy tác động vào lòng và bờ sông, bóc tách vật liệu và làm thay đổi hình dạng lòng dẫn.",
          transport:"Các hạt bùn, cát và sỏi di chuyển theo dòng nước bằng những hình thức vận chuyển khác nhau.",
          deposition:"Khi dòng chảy giảm khả năng vận chuyển, vật liệu lắng đọng và tích tụ thành bãi bồi hoặc châu thổ.",
          waves:"Gió truyền năng lượng cho mặt biển, tạo các đỉnh và hõm sóng lan truyền. Khi tiến vào vùng nước nông, sóng chậm lại, biến dạng và có thể vỡ gần bờ.",
          tide:"Lực hấp dẫn của Mặt Trăng và Mặt Trời cùng với chuyển động của hệ Trái Đất – Mặt Trăng làm mực nước biển lên xuống theo chu kỳ. Mô hình nén thời gian và phóng đại biên độ để dễ quan sát.",
          current:"Dòng biển là sự chuyển động tương đối ổn định của khối nước trên quy mô lớn. Gió, chênh lệch nhiệt độ – độ muối và sự quay của Trái Đất góp phần chi phối dòng biển; đường dòng trong mô hình là sơ đồ minh họa, không phải bản đồ hải lưu thực.",
          highlow:"Gió gần mặt đất có xu hướng thổi từ vùng khí áp cao về vùng khí áp thấp. Hướng mũi tên cho biết hướng chuyển động khái quát của không khí.",
          gradient:"Khi chênh lệch khí áp giữa hai khu vực tăng, lực làm không khí chuyển động tăng; mô hình biểu diễn bằng các luồng gió dày và chuyển động nhanh hơn.",
          reverse:"Đảo vị trí vùng áp cao và áp thấp làm hướng gió khái quát đổi chiều. Đây là mô hình đơn giản, chưa mô phỏng đầy đủ ảnh hưởng của lực Coriolis và ma sát.",
          drift:"Sóng tới bờ theo góc xiên tạo dòng vận chuyển dọc bờ. Cát và sỏi được dịch chuyển theo hướng dòng ven bờ.",
          windward:"Ở sườn đón gió, không khí ẩm bị địa hình buộc nâng lên. Không khí lạnh đi, hơi nước ngưng tụ và có thể gây mưa địa hình.",
          leeward:"Sau khi vượt qua đỉnh núi, không khí hạ xuống, ấm lên và độ ẩm tương đối giảm. Sườn khuất gió thường khô hơn."
        };
        explain.textContent=descriptions[action]||cfg.lead;
        const selectedControl=cfg.controls.find(x=>x[1]===action)||cfg.groups?.flatMap(g=>g.items).find(x=>x[1]===action);
        readout.textContent=(selectedControl||["TOÀN CẢNH"])[0].toUpperCase();

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
          const all=action==="cycle";
          o.evaporation.points.visible=all||action==="evaporation_sea"||action==="evaporation_inland"||action==="condensation"||action==="cloud_formation";
          o.rainfall.points.visible=all||action==="precipitation_rain";
          o.transpiration.points.visible=false;
          o.infiltrationPts.points.visible=all||action==="groundwater_flow";
          o.infiltrationLines.forEach(x=>x.visible=all||action==="groundwater_flow");
          o.runoff.visible=all||action==="surface_runoff";
          o.heatRays.forEach(x=>x.mesh.visible=all||action==="evaporation_sea"||action==="evaporation_inland");
          o.heatedSurface.visible=all||action==="evaporation_sea"||action==="evaporation_inland";
          o.coolingColumn.visible=all||action==="condensation"||action==="cloud_formation";
          o.condensationPts.points.visible=all||action==="condensation"||action==="cloud_formation";
          o.runoffPts.points.visible=all||action==="surface_runoff";
          o.runoffFoam.points.visible=all||action==="surface_runoff";o.runoffBed.visible=all||action==="surface_runoff";
          o.runoffRills.forEach(x=>x.visible=all||action==="surface_runoff");
          o.groundwaterPath.visible=all||action==="groundwater_flow";o.aquiferGlow.visible=all||action==="groundwater_flow";
          o.groundwaterFlowPts.points.visible=all||action==="groundwater_flow";o.seepagePoints.points.visible=all||action==="groundwater_flow";
          o.clouds.forEach(x=>x.visible=all||action==="condensation"||action==="cloud_formation"||action==="precipitation_rain");
          if(action==="evaporation_sea")seedParticles(o.evaporation,{x:[3.4,8.1],y:[.08,2.4],z:[-3.8,3.8]});
          if(action==="evaporation_inland")seedParticles(o.evaporation,{x:[-1.8,2.2],y:[.08,2.1],z:[-3.6,3.6]});
          if(action==="condensation"||action==="cloud_formation")seedParticles(o.evaporation,{x:[-1.8,3.2],y:[2.1,3.8],z:[-2.8,1.8]});
          if(action==="groundwater_flow")seedParticles(o.infiltrationPts,{x:[-2.8,2.5],y:[-.25,.7],z:[4.55,4.95]});
        }
        if(kind==="river" && objects.river){
          objects.river.bars.forEach((b,i)=>b.visible=action==="lower"||action==="middle"||action==="load" ? i>2 : action==="upper" ? i<3 : true);
          objects.river.gravel.points.visible=action==="load"||action==="transport"||action==="deposition";objects.river.riverFlow.points.visible=action!=="weathering";objects.river.delta.visible=action==="lower"||action==="load"||action==="deposition";objects.river.bankFace.visible=action==="upper"||action==="middle"||action==="erosion";
          objects.river.weatheringRock.visible=action==="weathering";objects.river.weatheringCracks.forEach(x=>x.visible=action==="weathering");objects.river.weatheringFlakes.points.visible=action==="weathering";
        }
        if(kind==="coast" && objects.coast){
          const o=objects.coast;
          o.waveFoam.forEach(x=>x.visible=action==="waves");
          o.currentLine.visible=action==="current";o.currentDots.points.visible=action==="current";
          o.tideMarker.visible=action==="tide";o.tideLow.visible=action==="tide";o.tideHigh.visible=action==="tide";o.gauge.visible=action==="tide";
          o.moon.visible=action==="tide";o.sunOrb.visible=action==="tide";o.nearshore.visible=action==="tide";
          o.sandParticles.points.visible=action==="current";
        }
        if(kind==="climate" && objects.climate){
          const o=objects.climate,reverse=action==="reverse",highX=reverse?3:-3,lowX=-highX,dir=reverse?-1:1;
          o.highCenter.x=highX;o.lowCenter.x=lowX;
          o.highDisc.position.x=highX;o.lowDisc.position.x=lowX;o.highMarker.position.x=highX;o.lowMarker.position.x=lowX;
          o.highRings.forEach(r=>r.position.x=highX);o.lowRings.forEach(r=>r.position.x=lowX);
          o.windArrows.forEach(a=>{a.position.set(dir>0?-2.45:2.45,1.15,a.position.z);a.setDirection(new THREE.Vector3(dir,0,0));a.setLength(action==="gradient"?5.5:4.9);});
          o.windParticles.points.visible=true;
          o.clouds.forEach(c=>c.visible=true);
        }
      }

      if(kind==="water"&&cfg.groups){
        const allButton=document.createElement("button");
        allButton.type="button";allButton.className="evgeo-water-all";allButton.textContent="Toàn chu trình";
        allButton.dataset.scenario="cycle";allButton.addEventListener("click",()=>select("cycle"));buttons.appendChild(allButton);
        const groups=document.createElement("div");groups.className="evgeo-water-groups";
        cfg.groups.forEach(group=>{
          const card=document.createElement("section");card.className="evgeo-water-group";
          const heading=document.createElement("button");heading.type="button";heading.className="evgeo-water-toggle";
          heading.innerHTML='<span></span><i aria-hidden="true">＋</i>';heading.querySelector("span").textContent=group.title;heading.setAttribute("aria-expanded","false");
          const children=document.createElement("div");children.className="evgeo-water-children";children.hidden=true;
          group.items.forEach(([label,action])=>{const b=document.createElement("button");b.type="button";b.textContent=label;b.dataset.scenario=action;b.addEventListener("click",()=>select(action));children.appendChild(b);});
          heading.addEventListener("click",()=>{const open=heading.getAttribute("aria-expanded")!=="true";groups.querySelectorAll(".evgeo-water-toggle").forEach(t=>{t.setAttribute("aria-expanded","false");t.querySelector("i").textContent="＋";t.nextElementSibling.hidden=true;});if(open){heading.setAttribute("aria-expanded","true");heading.querySelector("i").textContent="−";children.hidden=false;}});
          card.appendChild(heading);card.appendChild(children);groups.appendChild(card);
        });
        buttons.appendChild(groups);
      }else{
        cfg.controls.forEach(([label,action])=>{
          const b=document.createElement("button");b.type="button";b.textContent=label;b.dataset.scenario=action;
          b.addEventListener("click",()=>select(action));buttons.appendChild(b);
        });
      }
      if(kind==="water")select("cycle");
      root.querySelector('[data-run="play"]').addEventListener("click",()=>{playing=true;});
      root.querySelector('[data-run="pause"]').addEventListener("click",()=>{playing=false;});
      root.querySelector('[data-run="reset"]').addEventListener("click",()=>{
        playing=false;elapsed=0;speed=1;force=1;root.querySelector("[data-speed]").value="1";forceInput.value="1";camera.position.set(kind==="water"?9:8,kind==="water"?7:7,kind==="water"?11:10);
        if(objects.plates){const p=objects.plates;p.left.position.set(p.baseLeft,.55,0);p.right.position.set(p.baseRight,.55,0);p.topLeft.position.set(p.baseLeft,1.05,0);p.topRight.position.set(p.baseRight,1.05,0);p.hot.position.y=-.05;p.ridge.scale.y=.7;p.uplift.scale.y=1;p.volcanoes.forEach((o,i)=>{if(i%2===1)o.position.y=1.84;});}
        if(objects.coast){objects.coast.sea.mesh.position.y=-.08;objects.coast.tideMarker.position.y=.15;objects.coast.nearshore.scale.x=.8;}if(objects.river){objects.river.bankFace.position.x=-2.72;objects.river.delta.scale.set(1,1,1);}
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
          else if(mode==="river"){z+=dt*(.8+system.velocities[i]*.8);x=Math.sin((z+4.5)*.7)*1.75+(x*.08);if(z>4.5)z=-4.5;y=.22+Math.sin(elapsed*2+i*.21)*.025;}
          else {z+=dt*(.2+system.velocities[i]*.2);if(z>system.bounds.z/2)z=-system.bounds.z/2;}
          a.setXYZ(i,x,y,z);
        }
        a.needsUpdate=true;
      }

      let last=performance.now(), lastRender=0, inView=true;
      function tick(now) {
        if(destroyed)return;
        raf=requestAnimationFrame(tick);
        if(document.hidden || !inView){last=now;return;}
        if(now-lastRender<33)return;
        lastRender=now;
        const dt=Math.min(.05,(now-last)/1000||0);last=now;
        if(playing)elapsed+=dt*speed;
        waterSurfaces.forEach(w=>w.update(elapsed,playing ? .075 : .025));
        if(playing&&kind==="water"&&objects.cycle){
          const o=objects.cycle,cycleTime=elapsed%42,stage=Math.floor(cycleTime/6),stageProgress=(cycleTime%6)/6;
          if(scenario==="cycle"){
            o.heatRays.forEach(x=>x.mesh.visible=stage===0);
            o.heatedSurface.visible=stage===0;
            o.evaporation.points.visible=stage===0||stage===1;
            o.coolingColumn.visible=stage===1||stage===2;
            o.condensationPts.points.visible=stage===1||stage===2;
            o.clouds.forEach(x=>x.visible=stage>=2);
            o.rainfall.points.visible=stage===3;
            o.runoff.visible=stage===4;
            o.runoffPts.points.visible=stage===4;o.runoffFoam.points.visible=stage===4;o.runoffBed.visible=stage===4;o.runoffRills.forEach(x=>x.visible=stage===4);
            o.infiltrationPts.points.visible=stage===5;
            o.infiltrationLines.forEach(x=>x.visible=stage===5);
            o.groundwaterPath.visible=stage===6;o.aquiferGlow.visible=stage===6;
            o.groundwaterFlowPts.points.visible=stage===6;o.seepagePoints.points.visible=stage===6;
          }
          o.transpiration.points.visible=false;
          updateParticles(o.evaporation,dt*speed*force,"rise");
          updateParticles(o.rainfall,dt*speed*force,"fall");
          updateParticles(o.infiltrationPts,dt*speed*force,"fall");
          updateParticles(o.condensationPts,dt*speed*force,"drift");
          o.clouds.forEach((c,i)=>{
            if(c.visible){
              c.position.x+=dt*.12*speed*force;
              if(c.position.x>4)c.position.x=-4.5;
              const growth=scenario==="cycle"&&stage===2?.72+stageProgress*.48:1;
              c.scale.setScalar(growth*(1+Math.sin(elapsed*.7+i)*.018));
            }
          });
          o.heatRays.forEach((band,i)=>{
            const attr=band.mesh.geometry.attributes.position,base=band.base;
            for(let v=0;v<attr.count;v++){const x=base[v*3],y=base[v*3+1],z=base[v*3+2];attr.setXYZ(v,x,y+Math.sin(elapsed*1.15+x*.72+i)*.045,z+Math.sin(elapsed*.8+x*.45+i)*.035);}
            attr.needsUpdate=true;band.mesh.material.opacity=.07+.045*(.5+.5*Math.sin(elapsed*1.1+i));
          });
          const foamAttr=o.runoffFoam.points.geometry.attributes.position;
          for(let i=0;i<foamAttr.count;i++){const p=o.runoffCurve.getPointAt((i/foamAttr.count+elapsed*.075)%1);foamAttr.setXYZ(i,p.x,p.y+.075,p.z);}foamAttr.needsUpdate=true;
          o.runoffRills.forEach((drop,i)=>{const p=o.runoffCurve.getPointAt((i/7+elapsed*.045)%1);drop.position.set(p.x,p.y+.06,p.z);});
          const seepAttr=o.seepagePoints.points.geometry.attributes.position;
          for(let i=0;i<seepAttr.count;i++){const p=o.groundwaterCurve.getPointAt((i/seepAttr.count+elapsed*.024)%1);seepAttr.setXYZ(i,p.x,p.y,p.z);}seepAttr.needsUpdate=true;
          const runoffAttr=o.runoffPts.points.geometry.attributes.position;
          for(let i=0;i<runoffAttr.count;i++){
            const p=o.runoffCurve.getPointAt((i/runoffAttr.count+elapsed*.055)%1);
            runoffAttr.setXYZ(i,p.x,p.y+.035,p.z);
          }
          runoffAttr.needsUpdate=true;
          const groundAttr=o.groundwaterFlowPts.points.geometry.attributes.position;
          for(let i=0;i<groundAttr.count;i++){
            const p=o.groundwaterCurve.getPointAt((i/groundAttr.count+elapsed*.018)%1);
            groundAttr.setXYZ(i,p.x,p.y,p.z);
          }
          groundAttr.needsUpdate=true;
          const condAttr=o.condensationPts.points.geometry.attributes.position;
          for(let i=0;i<condAttr.count;i++){
            const x=-.35+(i%12)*.22;
            const y=3.05+Math.floor(i/12)*.17+Math.sin(elapsed*.9+i*.31)*.045;
            const z=-2.55+((i*7)%10)*.15;
            condAttr.setXYZ(i,x,y,z);
          }
          condAttr.needsUpdate=true;
        }
        if(playing&&kind==="river"&&objects.river){
          const o=objects.river;
          updateParticles(o.gravel,dt*speed*force,"drift");updateParticles(o.riverFlow,dt*speed*force,"river");
          if(scenario==="weathering")updateParticles(o.weatheringFlakes,dt*speed*force,"fall");
          o.bars.forEach((b,i)=>{const base=o.barBase[i];b.position.x=base.x+Math.sin(elapsed*.45+i)*.05*force;b.position.y=base.y+Math.sin(elapsed*.7+i*.4)*.025;});
        }
        if(playing&&kind==="coast"&&objects.coast){
          const o=objects.coast,phase=elapsed*speed,wave=Math.sin(phase*2.1)*.16*force;
          o.sea.mesh.position.y=-.08+(scenario==="tide"?Math.sin(phase*.42)*.34*force:Math.sin(phase*.42)*.035);
          o.waveFoam.forEach((line,i)=>{line.position.x=.12+Math.sin(phase*2.1-i*.52)*.16*force;line.position.z=Math.sin(phase*1.2+i*.4)*.035;});
          o.tideMarker.position.y=.15+Math.sin(phase*.42)*.34*force;
          o.nearshore.scale.x=.8+Math.max(0,Math.sin(phase*.42))*.8*force;
          if(scenario==="current"){
            const a=o.currentDots.points.geometry.attributes.position;
            for(let i=0;i<a.count;i++){const p=o.currentCurve.getPointAt((i/a.count+phase*.035)%1);a.setXYZ(i,p.x,p.y+.025,p.z);}
            a.needsUpdate=true;
          }
          if(scenario==="current")updateParticles(o.sandParticles,dt*speed*force,"drift");
        }
        if(playing&&kind==="climate"&&objects.climate){
          const o=objects.climate,dir=scenario==="reverse"?-1:1,rate=(scenario==="gradient"?1.65:1)*force*speed;
          const a=o.windParticles.points.geometry.attributes.position;
          for(let i=0;i<a.count;i++){
            let x=a.getX(i)+dt*.92*rate*dir,y=a.getY(i),z=a.getZ(i);
            if(dir>0&&x>4.9)x=-4.9;if(dir<0&&x<-4.9)x=4.9;
            a.setXYZ(i,x,y+Math.sin(elapsed*1.8+i*.22)*.002,z);
          }
          a.needsUpdate=true;
          o.clouds.forEach(c=>{c.position.x+=dt*.12*rate*dir;if(c.position.x>4.7)c.position.x=-4.7;if(c.position.x<-4.7)c.position.x=4.7;});
        }
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
        const phase=kind==="water"?elapsed%42:kind==="river"?elapsed%25:elapsed%20,duration=kind==="water"?42:kind==="river"?25:20,stages={tectonic:["Ứng suất tích tụ","Mảng dịch chuyển","Biến dạng địa tầng","Hệ quả địa chất xuất hiện"],water:["Bức xạ làm nóng mặt nước","Hơi nước bốc lên và lạnh đi","Giọt nước tập hợp thành mây","Mưa hình thành và rơi xuống","Nước chảy trên bề mặt","Nước thấm qua các tầng đất","Nước ngầm di chuyển về sông, biển"],river:["Phong hóa đá","Xâm thực vật liệu","Vận chuyển phù sa","Dòng chảy giảm tốc","Bồi tụ vật liệu"],coast:["Sóng lan truyền","Sóng biến dạng khi vào vùng nông","Mực nước triều thay đổi","Dòng nước chuyển động"],climate:["Xuất hiện vùng khí áp cao và thấp","Chênh lệch khí áp hình thành","Không khí chuyển động từ cao áp đến thấp áp","Gió duy trì theo hướng chênh lệch khí áp"]};
        progressBar.style.width=(phase/duration*100).toFixed(1)+"%";
        const waterStageNames={evaporation_sea:"Bức xạ làm nóng bề mặt biển; phân tử nước thoát khỏi mặt nước",evaporation_inland:"Nước ở sông, hồ và đất ẩm nhận nhiệt rồi chuyển thành hơi",condensation:"Không khí ẩm lạnh đi đến trạng thái bão hòa; hơi nước ngưng tụ",cloud_formation:"Các giọt nước li ti tập hợp, va chạm và phát triển thành mây",precipitation_rain:"Giọt nước trong mây lớn dần và rơi xuống thành mưa",surface_runoff:"Nước mưa chảy theo sườn dốc, nhập vào suối và sông",groundwater_flow:"Nước thấm qua đất, bổ sung tầng chứa nước và di chuyển về nơi thấp"};
        if(kind==="water")stageText.textContent=scenario==="cycle"?stages.water[Math.min(6,Math.floor(phase/6))]:(waterStageNames[scenario]||"Đang quan sát quá trình");
        else {const stageIndex=Math.min(stages[kind].length-1,Math.floor(phase/(duration/stages[kind].length)));stageText.textContent=playing?stages[kind][stageIndex]:(elapsed?stages[kind][stageIndex]:"Chờ bắt đầu");}
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
      if(window.IntersectionObserver){visibilityObserver=new IntersectionObserver(entries=>{inView=!!entries[0]?.isIntersecting;last=performance.now();},{threshold:0.01});visibilityObserver.observe(root);}
      raf=requestAnimationFrame(tick);
    } catch (error) {
      console.error('[EDUVERSE geo simulation] WebGL initialization failed:',error);
      if(observer) observer.disconnect();
      if(orbit) orbit.dispose();
      if(renderer) renderer.dispose();
      const failure = document.createElement("div");
      failure.className = "evgeo-webgl-error";
      failure.textContent = "Không thể dựng mô phỏng WebGL 3D trên thiết bị này. Hãy kiểm tra trình duyệt, tăng tốc phần cứng và kết nối thư viện Three.js. Chi tiết: " + (error && error.message ? error.message : String(error));
      view.replaceChildren(failure);
      return { destroy(){} };
    }

    return {
      destroy() {
        destroyed=true;
        if(raf)cancelAnimationFrame(raf);
        if(observer)observer.disconnect();
        if(visibilityObserver)visibilityObserver.disconnect();
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