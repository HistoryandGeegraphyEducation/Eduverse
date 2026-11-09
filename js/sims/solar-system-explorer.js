(function (global) {
  "use strict";

  const PLANETS = [
    {
      id: "mercury",
      name: "Sao Thủy",
      en: "Mercury",
      color: 0xaaa49b,
      radius: 0.38,
      orbit: 5.5,
      speed: 0.047,
      rotation: 0.004,
      diameter: "4.879 km",
      mass: "3,30 × 10²³ kg",
      distance: "57,9 triệu km",
      year: "88 ngày",
      day: "58,6 ngày",
      temperature: "167°C (trung bình)",
      atmosphere: "Ngoại quyển rất loãng, chủ yếu gồm oxy, natri, hydro, heli và kali.",
      composition: "Hành tinh đất đá, có lõi kim loại lớn và lớp phủ đá silicat.",
      moons: "Không có vệ tinh tự nhiên.",
      description: "Hành tinh gần Mặt Trời nhất. Bề mặt có nhiều hố va chạm, dấu tích của các vụ va chạm thiên thạch trong lịch sử hình thành.",
      features: ["Bề mặt nhiều hố va chạm", "Lưu vực Caloris", "Vách đá kiến tạo"],
      texture: "mercury"
    },
        {
      id: "venus",
      name: "Sao Kim",
      en: "Venus",
      color: 0xe4b66e,
      radius: 0.58,
      orbit: 7.5,
      speed: 0.035,
      rotation: -0.001,
      diameter: "12.104 km",
      mass: "4,87 × 10²⁴ kg",
      distance: "108,2 triệu km",
      year: "225 ngày",
      day: "243 ngày",
      temperature: "Khoảng 465°C",
      atmosphere: "Khí quyển rất dày, chủ yếu là carbon dioxide; mây chứa các giọt axit sulfuric.",
      composition: "Hành tinh đất đá, có lõi kim loại, lớp phủ và vỏ đá.",
      moons: "Không có vệ tinh tự nhiên.",
      description: "Sao Kim có kích thước gần tương đương Trái Đất. Hiệu ứng nhà kính mạnh khiến nhiệt độ bề mặt rất cao.",
      features: ["Mây axit sulfuric", "Núi lửa Maat Mons", "Địa hình Maxwell Montes"],
      texture: "venus"
    },
    {
      id: "earth",
      name: "Trái Đất",
      en: "Earth",
      color: 0x3b8bd7,
      radius: 0.62,
      orbit: 10,
      speed: 0.029,
      rotation: 0.018,
      diameter: "12.742 km",
      mass: "5,97 × 10²⁴ kg",
      distance: "149,6 triệu km",
      year: "365,25 ngày",
      day: "23 giờ 56 phút",
      temperature: "Khoảng 15°C (trung bình)",
      atmosphere: "Chủ yếu gồm nitơ và oxy; có hơi nước và các khí khác.",
      composition: "Gồm lõi trong, lõi ngoài, lớp phủ và vỏ Trái Đất.",
      moons: "Mặt Trăng.",
      description: "Hành tinh có nước lỏng ổn định trên bề mặt và là nơi đã biết có sự sống. Bề mặt gồm đại dương, lục địa và các hệ sinh thái đa dạng.",
      features: ["Thái Bình Dương", "Dãy Himalaya", "Sông Amazon", "Sa mạc Sahara"],
      texture: "earth"
    },
        {
      id: "mars",
      name: "Sao Hỏa",
      en: "Mars",
      color: 0xc66d4b,
      radius: 0.48,
      orbit: 13,
      speed: 0.024,
      rotation: 0.016,
      diameter: "6.779 km",
      mass: "6,42 × 10²³ kg",
      distance: "227,9 triệu km",
      year: "687 ngày",
      day: "24 giờ 37 phút",
      temperature: "Khoảng -65°C (trung bình)",
      atmosphere: "Khí quyển mỏng, chủ yếu là carbon dioxide.",
      composition: "Hành tinh đất đá, bề mặt giàu khoáng vật chứa sắt bị oxy hóa.",
      moons: "Phobos và Deimos.",
      description: "Sao Hỏa có màu đỏ đặc trưng. Trên hành tinh có núi lửa khổng lồ, hẻm vực sâu và dấu vết cho thấy nước từng tồn tại trên bề mặt.",
      features: ["Núi Olympus Mons", "Hẻm vực Valles Marineris", "Chỏm băng cực"],
      texture: "mars"
    },
    {
      id: "jupiter",
      name: "Sao Mộc",
      en: "Jupiter",
      color: 0xd9a77b,
      radius: 1.45,
      orbit: 17.5,
      speed: 0.013,
      rotation: 0.039,
      diameter: "139.820 km",
      mass: "1,90 × 10²⁷ kg",
      distance: "778,6 triệu km",
      year: "11,86 năm",
      day: "9 giờ 56 phút",
      temperature: "Khoảng -110°C (ở tầng mây)",
      atmosphere: "Chủ yếu gồm hydro và heli; có các dải mây và những hệ thống bão lớn.",
      composition: "Hành tinh khí khổng lồ, không có bề mặt rắn như các hành tinh đất đá.",
      moons: "Có nhiều vệ tinh; bốn vệ tinh Galilei gồm Io, Europa, Ganymede và Callisto.",
      description: "Sao Mộc là hành tinh lớn nhất Hệ Mặt Trời. Các dải mây có màu sắc khác nhau và Vết Đỏ Lớn là một hệ thống bão tồn tại lâu dài.",
      features: ["Vết Đỏ Lớn", "Các dải mây", "Vệ tinh Europa"],
      texture: "jupiter"
    },
        {
      id: "saturn",
      name: "Sao Thổ",
      en: "Saturn",
      color: 0xd9c18d,
      radius: 1.18,
      orbit: 22.5,
      speed: 0.0095,
      rotation: 0.035,
      diameter: "116.460 km",
      mass: "5,68 × 10²⁶ kg",
      distance: "1,43 tỷ km",
      year: "29,45 năm",
      day: "10 giờ 33 phút",
      temperature: "Khoảng -140°C (ở tầng mây)",
      atmosphere: "Chủ yếu gồm hydro và heli.",
      composition: "Hành tinh khí khổng lồ, có hệ thống vành đai gồm băng, đá và bụi.",
      moons: "Có nhiều vệ tinh; đáng chú ý gồm Titan và Enceladus.",
      description: "Sao Thổ nổi bật với hệ thống vành đai rộng lớn. Vành đai gồm nhiều hạt vật chất có kích thước khác nhau, chủ yếu là băng nước.",
      features: ["Hệ thống vành đai", "Vệ tinh Titan", "Vệ tinh Enceladus"],
      texture: "saturn"
    },
    {
      id: "uranus",
      name: "Sao Thiên Vương",
      en: "Uranus",
      color: 0x8ed8df,
      radius: 0.92,
      orbit: 27.5,
      speed: 0.0068,
      rotation: -0.025,
      diameter: "50.724 km",
      mass: "8,68 × 10²⁵ kg",
      distance: "2,87 tỷ km",
      year: "84 năm",
      day: "17 giờ 14 phút",
      temperature: "Khoảng -195°C (ở tầng mây)",
      atmosphere: "Chủ yếu gồm hydro, heli và methane; methane góp phần tạo màu xanh lục lam.",
      composition: "Hành tinh băng khổng lồ, chứa nhiều chất bay hơi như nước, ammonia và methane.",
      moons: "Có nhiều vệ tinh; đáng chú ý gồm Titania, Oberon, Ariel, Umbriel và Miranda.",
      description: "Sao Thiên Vương có trục quay nghiêng gần 98° so với mặt phẳng quỹ đạo. Vì vậy, hành tinh có tư thế quay rất khác biệt so với phần lớn các hành tinh khác.",
      features: ["Trục quay nghiêng lớn", "Hệ thống vành đai mờ", "Vệ tinh Miranda"],
      texture: "uranus"
    },
        {
      id: "neptune",
      name: "Sao Hải Vương",
      en: "Neptune",
      color: 0x315fce,
      radius: 0.9,
      orbit: 32,
      speed: 0.0054,
      rotation: 0.027,
      diameter: "49.244 km",
      mass: "1,02 × 10²⁶ kg",
      distance: "4,50 tỷ km",
      year: "164,8 năm",
      day: "16 giờ 6 phút",
      temperature: "Khoảng -200°C (ở tầng mây)",
      atmosphere: "Chủ yếu gồm hydro, heli và methane.",
      composition: "Hành tinh băng khổng lồ, có lớp trong giàu nước, ammonia và methane.",
      moons: "Có nhiều vệ tinh; Triton là vệ tinh lớn nhất.",
      description: "Sao Hải Vương là hành tinh xa Mặt Trời nhất trong tám hành tinh. Khí quyển có những hệ thống gió rất mạnh.",
      features: ["Vết Đen Lớn", "Gió khí quyển mạnh", "Vệ tinh Triton"],
      texture: "neptune"
    }
  ];

  const SUN_INFO = {
    id: "sun",
    name: "Mặt Trời",
    en: "Sun",
    diameter: "1.392.700 km",
    mass: "1,989 × 10³⁰ kg",
    temperature: "Khoảng 5.500°C ở bề mặt",
    composition: "Chủ yếu gồm hydro và heli.",
    description: "Mặt Trời là một ngôi sao ở trung tâm Hệ Mặt Trời. Năng lượng của nó được tạo ra thông qua phản ứng nhiệt hạch trong lõi.",
    features: ["Quang quyển", "Sắc quyển", "Vùng đối lưu", "Vùng bức xạ"]
  };

  const PLANET_BY_ID = Object.fromEntries(
    PLANETS.map(p => [p.id, p])
  );
    function loadScript(src) {
    return new Promise((resolve, reject) => {
      if (global.THREE) {
        resolve();
        return;
      }

      const existing = Array.from(document.scripts).find(
        s => s.src === src
      );

      if (existing) {
        if (global.THREE) {
          resolve();
        } else {
          existing.addEventListener("load", resolve, { once: true });
          existing.addEventListener("error", reject, { once: true });
        }
        return;
      }

      const script = document.createElement("script");
      script.src = src;
      script.async = true;
      script.onload = resolve;
      script.onerror = () => reject(
        new Error("Không thể tải thư viện: " + src)
      );
      document.head.appendChild(script);
    });
  }
    function loadControls() {
    return new Promise((resolve, reject) => {
      if (global.THREE && global.THREE.OrbitControls) {
        resolve();
        return;
      }

      const src =
        "https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js";

      const existing = Array.from(document.scripts).find(
        s => s.src === src
      );

      if (existing) {
        if (global.THREE && global.THREE.OrbitControls) {
          resolve();
        } else {
          existing.addEventListener("load", resolve, { once: true });
          existing.addEventListener("error", reject, { once: true });
        }
        return;
      }

      const script = document.createElement("script");
      script.src = src;
      script.async = true;
      script.onload = resolve;
      script.onerror = () => reject(
        new Error("Không thể tải OrbitControls.")
      );
      document.head.appendChild(script);
    });
  }
    function createPlanetTexture(type, size) {
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size / 2;

    const ctx = canvas.getContext("2d");
    const w = canvas.width;
    const h = canvas.height;

    const palettes = {
      mercury: ["#6f6d69", "#aaa49b", "#c0b8aa", "#55524f"],
      venus: ["#9e7447", "#d6ad6e", "#e9c58a", "#b98d55"],
      earth: ["#073d75", "#176e9e", "#3e9b55", "#a1b66a"],
      mars: ["#713b2e", "#b75c43", "#d17c5b", "#8d4534"],
      jupiter: ["#a87554", "#e3c19c", "#bd8b6a", "#f0d7b4"],
      saturn: ["#b99b6b", "#e0c89b", "#8c7657", "#d4b987"],
      uranus: ["#66aeb8", "#a5dce0", "#7dc6cf", "#c0e8e9"],
      neptune: ["#183d9a", "#2457c5", "#3978db", "#102c79"]
    };

    const colors = palettes[type] || palettes.earth;
    const gradient = ctx.createLinearGradient(0, 0, 0, h);

    colors.forEach((color, i) => {
      gradient.addColorStop(i / (colors.length - 1), color);
    });

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);
        if (type === "earth") {
      drawEarthTexture(ctx, w, h);
    } else if (type === "jupiter" || type === "saturn") {
      drawGasBands(ctx, w, h, type);
    } else if (type === "venus" || type === "uranus" || type === "neptune") {
      drawCloudBands(ctx, w, h, type);
    } else {
      drawCraterTexture(ctx, w, h, type);
    }

    const image = ctx.getImageData(0, 0, w, h);
    const data = image.data;

    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * 13;
      data[i] += noise;
      data[i + 1] += noise;
      data[i + 2] += noise;
    }

    ctx.putImageData(image, 0, 0);

    const texture = new global.THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }
    function drawEarthTexture(ctx, w, h) {
    ctx.fillStyle = "#176e9e";
    ctx.fillRect(0, 0, w, h);

    const continents = [
      [[0.08,0.22],[0.16,0.12],[0.25,0.18],[0.29,0.32],[0.24,0.48],[0.19,0.66],[0.13,0.58],[0.10,0.40]],
      [[0.28,0.48],[0.35,0.46],[0.39,0.62],[0.36,0.86],[0.31,0.78],[0.27,0.62]],
      [[0.48,0.20],[0.56,0.14],[0.63,0.21],[0.66,0.35],[0.60,0.43],[0.55,0.38],[0.50,0.32]],
      [[0.55,0.43],[0.62,0.45],[0.66,0.60],[0.63,0.82],[0.58,0.75],[0.54,0.59]],
      [[0.67,0.18],[0.76,0.12],[0.86,0.18],[0.91,0.34],[0.84,0.44],[0.75,0.38],[0.70,0.30]],
      [[0.82,0.61],[0.90,0.58],[0.94,0.70],[0.90,0.83],[0.84,0.78]]
    ];

    continents.forEach((points, index) => {
      ctx.beginPath();
      points.forEach((p, i) => {
        const x = p[0] * w;
        const y = p[1] * h;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.closePath();
            ctx.fillStyle = index % 2 ? "#6c9b52" : "#3c8b50";
      ctx.fill();

      ctx.strokeStyle = "rgba(196,185,116,.45)";
      ctx.lineWidth = 5;
      ctx.stroke();
    });

    ctx.fillStyle = "rgba(230,245,250,.75)";
    ctx.beginPath();
    ctx.ellipse(w * 0.5, h * 0.07, w * 0.11, h * 0.055, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.ellipse(w * 0.5, h * 0.94, w * 0.14, h * 0.06, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawCraterTexture(ctx, w, h, type) {
    const count = type === "mercury" ? 170 : 90;

    for (let i = 0; i < count; i++) {
      const x = Math.random() * w;
      const y = Math.random() * h;
      const r = 2 + Math.random() * (type === "mercury" ? 15 : 8);

      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(35,24,20,.16)";
      ctx.fill();
            ctx.beginPath();
      ctx.arc(x - r * 0.16, y - r * 0.18, r * 0.75, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(245,220,190,.2)";
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
  }

  function drawGasBands(ctx, w, h, type) {
    const bands = type === "jupiter" ? 22 : 14;

    for (let i = 0; i < bands; i++) {
      const y = (i / bands) * h;
      const bh = h / bands;
      const wave = Math.random() * 8;

      ctx.fillStyle = i % 2
        ? "rgba(255,235,205,.22)"
        : "rgba(70,40,25,.15)";

      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.bezierCurveTo(
        w * 0.28, y + wave,
        w * 0.65, y - wave,
        w, y + wave * 0.3
      );
            ctx.lineTo(w, y + bh);
      ctx.bezierCurveTo(
        w * 0.65, y + bh - wave,
        w * 0.28, y + bh + wave,
        0, y + bh
      );
      ctx.closePath();
      ctx.fill();
    }

    if (type === "jupiter") {
      ctx.beginPath();
      ctx.ellipse(w * 0.69, h * 0.58, w * 0.075, h * 0.075, -0.15, 0, Math.PI * 2);
      ctx.fillStyle = "#b65c43";
      ctx.fill();

      ctx.beginPath();
      ctx.ellipse(w * 0.69, h * 0.58, w * 0.055, h * 0.045, -0.15, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,190,145,.35)";
      ctx.fill();
    }
  }
    function drawCloudBands(ctx, w, h, type) {
    const count = type === "venus" ? 35 : 18;

    for (let i = 0; i < count; i++) {
      const y = Math.random() * h;
      const height = 2 + Math.random() * 14;

      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.bezierCurveTo(
        w * 0.3, y - height,
        w * 0.7, y + height,
        w, y
      );

      ctx.strokeStyle = type === "venus"
        ? "rgba(255,235,185,.25)"
        : "rgba(230,255,255,.18)";

      ctx.lineWidth = 2 + Math.random() * 5;
      ctx.stroke();
    }
  }

  function simPlanetExplorer(root) {
    if (!root) return null;

    let destroyed = false;
    let renderer = null;
    let scene = null;
    let camera = null;
    let controls = null;
    let resizeObserver = null;
    let animationFrame = 0;
    let clock = null;
        let selectedId = "earth";
    let paused = false;
    let timeScale = 1;
    let elapsed = 0;
    let cameraTarget = null;
    let cameraPosition = null;
    let cameraTween = 0;

    const cleanup = [];
    const textures = [];
    const geometries = [];
    const materials = [];
    const clickableObjects = [];
    const planetObjects = {};
    const orbitObjects = {};

    root.innerHTML = `
      <section class="pe-explorer">
        <header class="pe-header">
          <div>
            <div class="pe-eyebrow">EDUVERSE · ĐỊA LÍ 6</div>
            <h2>KHÁM PHÁ CÁC HÀNH TINH</h2>
            <p>Quan sát cấu trúc và chuyển động của các thiên thể trong Hệ Mặt Trời.</p>
          </div>
          <button class="pe-reset" type="button" data-action="reset">
            Đặt lại góc nhìn
          </button>
        </header>

        <div class="pe-layout">
          <aside class="pe-sidebar">
            <div class="pe-panel-title">THIÊN THỂ</div>
            <button class="pe-body-item" data-body="sun">
              <span class="pe-body-dot pe-sun-dot"></span>
              <span>Mặt Trời</span>
            </button>
            <div class="pe-separator"></div>
            ${PLANETS.map((p, i) => `
              <button class="pe-body-item ${p.id === selectedId ? "active" : ""}"
                data-body="${p.id}">
                <span class="pe-body-number">${i + 1}</span>
                <span>${p.name}</span>
              </button>
            `).join("")}
                        <div class="pe-sidebar-note">
              Chọn một thiên thể để quan sát và tìm hiểu thông tin.
            </div>
          </aside>

          <main class="pe-main">
            <div class="pe-stage" data-stage>
              <div class="pe-stage-loading" data-loading>
                Đang khởi tạo mô hình 3D...
              </div>
              <div class="pe-stage-label">MÔ HÌNH KHÔNG GIAN 3D</div>
              <div class="pe-stage-hint">Kéo để xoay · Cuộn để phóng to</div>
            </div>

            <div class="pe-controls">
              <button type="button" data-action="pause">Tạm dừng</button>
              <button type="button" data-action="speed-down">− Tốc độ</button>
              <span class="pe-speed" data-speed>1×</span>
              <button type="button" data-action="speed-up">+ Tốc độ</button>
              <button type="button" data-action="overview">Toàn cảnh</button>
            </div>

            <div class="pe-info" data-info></div>
          </main>
        </div>
                <footer class="pe-footer">
          <span>Khoảng cách và kích thước quỹ đạo đã được điều chỉnh để thuận tiện quan sát.</span>
          <span>Chuyển động mô phỏng, không theo tỷ lệ thời gian thực.</span>
        </footer>
      </section>
    `;

    const $ = selector => root.querySelector(selector);
    const $$ = selector => Array.from(root.querySelectorAll(selector));
    const stage = $("[data-stage]");
    const infoPanel = $("[data-info]");

    function setInfo(id) {
      selectedId = id;

      $$(".pe-body-item").forEach(button => {
        button.classList.toggle(
          "active",
          button.dataset.body === id
        );
      });

      const data = id === "sun" ? SUN_INFO : PLANET_BY_ID[id];
      if (!data) return;

      const isSun = id === "sun";

      infoPanel.innerHTML = `
              <div class="pe-info-top">
          <div>
            <div class="pe-eyebrow">THÔNG TIN THIÊN THỂ</div>
            <h3>${data.name}</h3>
            <div class="pe-english">${data.en}</div>
          </div>
          <span class="pe-type">${isSun ? "NGÔI SAO" : "HÀNH TINH"}</span>
        </div>

        <p class="pe-description">${data.description}</p>

        <div class="pe-facts">
          <div class="pe-fact">
            <span>Đường kính</span>
            <strong>${data.diameter}</strong>
          </div>
          ${data.mass ? `
            <div class="pe-fact">
              <span>Khối lượng</span>
              <strong>${data.mass}</strong>
            </div>
          ` : ""}
          ${data.distance ? `
            <div class="pe-fact">
              <span>Khoảng cách trung bình đến Mặt Trời</span>
              <strong>${data.distance}</strong>
            </div>
          ` : ""}
                    ${data.year ? `
            <div class="pe-fact">
              <span>Chu kì quỹ đạo</span>
              <strong>${data.year}</strong>
            </div>
          ` : ""}
          ${data.day ? `
            <div class="pe-fact">
              <span>Chu kì tự quay</span>
              <strong>${data.day}</strong>
            </div>
          ` : ""}
          ${data.temperature ? `
            <div class="pe-fact">
              <span>Nhiệt độ</span>
              <strong>${data.temperature}</strong>
            </div>
          ` : ""}
        </div>

        ${data.atmosphere ? `
          <div class="pe-detail">
            <h4>Khí quyển</h4>
            <p>${data.atmosphere}</p>
          </div>
        ` : ""}
                ${data.composition ? `
          <div class="pe-detail">
            <h4>Cấu tạo và thành phần</h4>
            <p>${data.composition}</p>
          </div>
        ` : ""}

        ${data.moons ? `
          <div class="pe-detail">
            <h4>Vệ tinh tự nhiên</h4>
            <p>${data.moons}</p>
          </div>
        ` : ""}

        <div class="pe-detail">
          <h4>Đặc điểm đáng chú ý</h4>
          <div class="pe-feature-list">
            ${data.features.map(item => `<span>${item}</span>`).join("")}
          </div>
        </div>

        <button class="pe-focus-button" type="button" data-action="focus">
          Quan sát ${data.name}
        </button>
      `;
    }
        function addGeometry(geometry) {
      geometries.push(geometry);
      return geometry;
    }

    function addMaterial(material) {
      materials.push(material);
      return material;
    }

    function addTexture(texture) {
      textures.push(texture);
      return texture;
    }

    function makeSphere(radius, texture, color, roughness) {
      const geometry = addGeometry(
        new global.THREE.SphereGeometry(radius, 64, 48)
      );

      const material = addMaterial(
        new global.THREE.MeshStandardMaterial({
          map: texture || null,
          color: color || 0xffffff,
          roughness: roughness === undefined ? 0.9 : roughness,
          metalness: 0
        })
      );

      return new global.THREE.Mesh(geometry, material);
    }
        function createOrbit(radius) {
      const points = [];
      const segments = 180;

      for (let i = 0; i <= segments; i++) {
        const angle = (i / segments) * Math.PI * 2;
        points.push(new global.THREE.Vector3(
          Math.cos(angle) * radius,
          0,
          Math.sin(angle) * radius
        ));
      }

      const geometry = addGeometry(
        new global.THREE.BufferGeometry().setFromPoints(points)
      );

      const material = addMaterial(
        new global.THREE.LineBasicMaterial({
          color: 0x54718f,
          transparent: true,
          opacity: 0.35
        })
      );

      const line = new global.THREE.Line(geometry, material);
      scene.add(line);
      return line;
    }
        function createSaturnRing(saturn) {
      const geometry = addGeometry(
        new global.THREE.RingGeometry(1.45, 2.35, 128)
      );

      const material = addMaterial(
        new global.THREE.MeshBasicMaterial({
          color: 0xcab88f,
          side: global.THREE.DoubleSide,
          transparent: true,
          opacity: 0.78
        })
      );

      const ring = new global.THREE.Mesh(geometry, material);
      ring.rotation.x = Math.PI / 2.35;
      ring.rotation.z = -0.18;
      saturn.add(ring);

      const innerGeometry = addGeometry(
        new global.THREE.RingGeometry(1.52, 1.78, 128)
      );
            const innerMaterial = addMaterial(
        new global.THREE.MeshBasicMaterial({
          color: 0x8c806d,
          side: global.THREE.DoubleSide,
          transparent: true,
          opacity: 0.6
        })
      );

      const innerRing = new global.THREE.Mesh(innerGeometry, innerMaterial);
      innerRing.rotation.copy(ring.rotation);
      saturn.add(innerRing);
    }

    function createStars() {
      const count = 2200;
      const positions = new Float32Array(count * 3);

      for (let i = 0; i < count; i++) {
        const radius = 45 + Math.random() * 75;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
                positions[i * 3] =
          radius * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] =
          radius * Math.cos(phi);
        positions[i * 3 + 2] =
          radius * Math.sin(phi) * Math.sin(theta);
      }

      const geometry = addGeometry(
        new global.THREE.BufferGeometry()
      );

      geometry.setAttribute(
        "position",
        new global.THREE.Float32BufferAttribute(positions, 3)
      );

      const material = addMaterial(
        new global.THREE.PointsMaterial({
          color: 0xffffff,
          size: 0.13,
          transparent: true,
          opacity: 0.85,
          sizeAttenuation: true
        })
      );

      const stars = new global.THREE.Points(geometry, material);
      scene.add(stars);
    }
        function createSun() {
      const sun = new global.THREE.Group();
      scene.add(sun);

      const core = makeSphere(1.8, null, 0xffc34e, 0.65);
      sun.add(core);

      const glowMaterial = addMaterial(
        new global.THREE.MeshBasicMaterial({
          color: 0xffa52d,
          transparent: true,
          opacity: 0.13,
          side: global.THREE.BackSide
        })
      );

      const glow = new global.THREE.Mesh(
        addGeometry(new global.THREE.SphereGeometry(2.08, 48, 32)),
        glowMaterial
      );
      sun.add(glow);

      const light = new global.THREE.PointLight(0xffffff, 2.3, 180);
      light.position.set(0, 0, 0);
      scene.add(light);
            const ambient = new global.THREE.AmbientLight(0x7185a5, 0.5);
      scene.add(ambient);

      clickableObjects.push(core);
      core.userData.planetId = "sun";
      planetObjects.sun = sun;
    }

    function createPlanets() {
      PLANETS.forEach((planet, index) => {
        createOrbit(planet.orbit);

        const orbit = new global.THREE.Group();
        scene.add(orbit);

        const texture = addTexture(
          createPlanetTexture(planet.texture, 1024)
        );

        const body = makeSphere(
          planet.radius,
          texture,
          0xffffff,
          0.88
        );

        body.userData.planetId = planet.id;
        orbit.add(body);

        if (planet.id === "saturn") {
          createSaturnRing(body);
        }
                if (planet.id === "earth") {
          const cloudTexture = addTexture(
            createCloudTexture()
          );

          const cloudMaterial = addMaterial(
            new global.THREE.MeshStandardMaterial({
              map: cloudTexture,
              transparent: true,
              opacity: 0.3,
              depthWrite: false
            })
          );

          const clouds = new global.THREE.Mesh(
            addGeometry(
              new global.THREE.SphereGeometry(
                planet.radius * 1.012,
                48,
                32
              )
            ),
            cloudMaterial
          );

          body.add(clouds);
          body.userData.cloudLayer = clouds;
        }
                if (planet.id === "uranus") {
          body.rotation.z = 1.7;
        }

        if (planet.id === "neptune") {
          body.rotation.z = 0.2;
        }

        clickableObjects.push(body);

        planetObjects[planet.id] = {
          orbit,
          body,
          data: planet,
          phase: index * 0.72
        };

        orbitObjects[planet.id] = orbit;
      });
    }

    function createCloudTexture() {
      const canvas = document.createElement("canvas");
      canvas.width = 512;
      canvas.height = 256;

      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, 512, 256);

      for (let i = 0; i < 180; i++) {
        const x = Math.random() * 512;
        const y = Math.random() * 256;
        const rx = 4 + Math.random() * 22;
        const ry = 2 + Math.random() * 8;
                ctx.beginPath();
        ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255,255,255," +
          (0.05 + Math.random() * 0.16) + ")";
        ctx.fill();
      }

      return new global.THREE.CanvasTexture(canvas);
    }

    function setupRenderer() {
      renderer = new global.THREE.WebGLRenderer({
        antialias: true,
        alpha: false,
        powerPreference: "high-performance"
      });

      renderer.setPixelRatio(
        Math.min(global.devicePixelRatio || 1, 1.8)
      );

      renderer.setClearColor(0x050b19, 1);
      renderer.outputEncoding = global.THREE.sRGBEncoding;
      renderer.domElement.className = "pe-canvas";

      stage.appendChild(renderer.domElement);
            camera = new global.THREE.PerspectiveCamera(
        45,
        1,
        0.1,
        300
      );

      camera.position.set(0, 22, 42);

      controls = new global.THREE.OrbitControls(
        camera,
        renderer.domElement
      );

      controls.enableDamping = true;
      controls.dampingFactor = 0.055;
      controls.minDistance = 2.2;
      controls.maxDistance = 100;
      controls.rotateSpeed = 0.55;
      controls.zoomSpeed = 0.8;
      controls.target.set(0, 0, 0);
      controls.update();

      resize();
    }

    function resize() {
      if (!renderer || !camera || !stage) return;

      const width = Math.max(1, stage.clientWidth);
      const height = Math.max(1, stage.clientHeight);

      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    }
        function focusBody(id) {
      if (!camera || !controls) return;

      let targetPosition;
      let distance;

      if (id === "sun") {
        targetPosition = new global.THREE.Vector3(0, 0, 0);
        distance = 8;
      } else {
        const object = planetObjects[id];
        if (!object) return;

        const worldPosition = new global.THREE.Vector3();
        object.body.getWorldPosition(worldPosition);

        targetPosition = worldPosition.clone();
        distance = Math.max(
          object.data.radius * 4.5,
          3.2
        );
      }

      const direction = camera.position.clone()
        .sub(controls.target)
        .normalize();

      if (direction.lengthSq() < 0.001) {
        direction.set(0.5, 0.4, 1).normalize();
      }
            cameraPosition = targetPosition.clone().add(
        direction.multiplyScalar(distance)
      );

      cameraTarget = targetPosition;
      cameraTween = 1;
    }

    function resetView() {
      cameraTarget = new global.THREE.Vector3(0, 0, 0);
      cameraPosition = new global.THREE.Vector3(0, 22, 42);
      cameraTween = 1;
    }

    function updateCamera() {
      if (cameraTween <= 0 || !cameraTarget || !cameraPosition) return;

      const factor = 0.09;
      camera.position.lerp(cameraPosition, factor);
      controls.target.lerp(cameraTarget, factor);

      cameraTween *= 0.91;

      if (cameraTween < 0.015) {
        camera.position.copy(cameraPosition);
        controls.target.copy(cameraTarget);
        cameraTween = 0;
      }
    }
        function updatePlanets(delta) {
      if (paused) return;

      elapsed += delta * timeScale;

      PLANETS.forEach(planet => {
        const object = planetObjects[planet.id];
        if (!object) return;

        object.phase += planet.speed * delta * timeScale;

        object.orbit.position.set(
          Math.cos(object.phase) * planet.orbit,
          0,
          Math.sin(object.phase) * planet.orbit
        );

        object.body.rotation.y +=
          planet.rotation * delta * timeScale;

        if (object.body.userData.cloudLayer) {
          object.body.userData.cloudLayer.rotation.y +=
            0.0005 * delta * timeScale;
        }
      });

      if (planetObjects.saturn) {
        planetObjects.saturn.body.rotation.y +=
          0.001 * delta * timeScale;
      }
    }
        function raycastSelect(event) {
      if (!renderer || !camera) return;

      const rect = renderer.domElement.getBoundingClientRect();
      const pointer = new global.THREE.Vector2(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -((event.clientY - rect.top) / rect.height) * 2 + 1
      );

      const raycaster = new global.THREE.Raycaster();
      raycaster.setFromCamera(pointer, camera);

      const hits = raycaster.intersectObjects(
        clickableObjects,
        false
      );

      if (!hits.length) return;

      const id = hits[0].object.userData.planetId;
      if (!id) return;

      setInfo(id);
      focusBody(id);
    }
        function bindEvents() {
      const onClick = event => {
        const button = event.target.closest("[data-body]");
        if (!button || !root.contains(button)) return;

        const id = button.dataset.body;
        setInfo(id);
        focusBody(id);
      };

      const onAction = event => {
        const button = event.target.closest("[data-action]");
        if (!button || !root.contains(button)) return;

        const action = button.dataset.action;

        if (action === "reset" || action === "overview") {
          resetView();
          return;
        }

        if (action === "focus") {
          focusBody(selectedId);
          return;
        }

        if (action === "pause") {
          paused = !paused;
          button.textContent = paused ? "Tiếp tục" : "Tạm dừng";
          return;
        }
                if (action === "speed-down") {
          timeScale = Math.max(0.25, timeScale / 2);
          $("[data-speed]").textContent = timeScale + "×";
          return;
        }

        if (action === "speed-up") {
          timeScale = Math.min(8, timeScale * 2);
          $("[data-speed]").textContent = timeScale + "×";
        }
      };

      const onCanvasClick = event => {
        if (event.button !== 0) return;
        raycastSelect(event);
      };

      root.addEventListener("click", onClick);
      root.addEventListener("click", onAction);

      cleanup.push(() => {
        root.removeEventListener("click", onClick);
        root.removeEventListener("click", onAction);
      });
            if (renderer) {
        renderer.domElement.addEventListener("dblclick", onCanvasClick);
        cleanup.push(() => {
          renderer.domElement.removeEventListener(
            "dblclick",
            onCanvasClick
          );
        });
      }
    }

    function animate() {
      if (destroyed) return;

      animationFrame = global.requestAnimationFrame(animate);

      const delta = Math.min(clock.getDelta(), 0.05);

      updatePlanets(delta);
      updateCamera();

      if (controls) controls.update();
      if (renderer && scene && camera) {
        renderer.render(scene, camera);
      }
    }
        function cleanupAll() {
      if (animationFrame) {
        global.cancelAnimationFrame(animationFrame);
        animationFrame = 0;
      }

      if (resizeObserver) {
        resizeObserver.disconnect();
        resizeObserver = null;
      }

      cleanup.forEach(fn => {
        try {
          fn();
        } catch (error) {}
      });
      cleanup.length = 0;

      if (controls) {
        controls.dispose();
        controls = null;
      }

      geometries.forEach(geometry => {
        try {
          geometry.dispose();
        } catch (error) {}
      });

      materials.forEach(material => {
        try {
          material.dispose();
        } catch (error) {}
      });
            textures.forEach(texture => {
        try {
          texture.dispose();
        } catch (error) {}
      });

      geometries.length = 0;
      materials.length = 0;
      textures.length = 0;

      if (renderer) {
        renderer.dispose();
        renderer.forceContextLoss();

        if (renderer.domElement.parentNode) {
          renderer.domElement.parentNode.removeChild(
            renderer.domElement
          );
        }

        renderer = null;
      }

      scene = null;
      camera = null;
    }
        async function init() {
      try {
        await loadScript(
          "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"
        );

        if (destroyed) return;

        await loadControls();

        if (destroyed) return;

        scene = new global.THREE.Scene();
        scene.background = new global.THREE.Color(0x050b19);

        createStars();
        createSun();
        createPlanets();
        setupRenderer();

        setInfo(selectedId);
        bindEvents();
                if ("ResizeObserver" in global) {
          resizeObserver = new global.ResizeObserver(resize);
          resizeObserver.observe(stage);
        } else {
          global.addEventListener("resize", resize);
          cleanup.push(() => {
            global.removeEventListener("resize", resize);
          });
        }

        clock = new global.THREE.Clock();
        $("[data-loading]").remove();

        animate();
      } catch (error) {
        console.error("[EDUVERSE] Solar System Explorer:", error);

        const loading = $("[data-loading]");
        if (loading) {
          loading.innerHTML = `
            <strong>Không thể khởi tạo mô hình 3D.</strong>
            <span>Kiểm tra kết nối Internet và tải lại trang.</span>
          `;
          loading.classList.add("error");
        }
      }
    }
        init();

    return {
      destroy() {
        if (destroyed) return;
        destroyed = true;
        cleanupAll();
        root.innerHTML = "";
      }
    };
  }

  global.simPlanetExplorer = simPlanetExplorer;

})(window);