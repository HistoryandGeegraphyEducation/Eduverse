/* EDUVERSE | Geography mini-projects 02–05 | Three.js/WebGL */
(function(){
"use strict";
if(!document.getElementById("evg-mini-style")){
 const s=document.createElement("style");s.id="evg-mini-style";
 s.textContent=".evg{display:grid;grid-template-columns:minmax(0,1.6fr) minmax(255px,.85fr);gap:14px;color:#eef6ff;font-family:system-ui,sans-serif}.evg *{box-sizing:border-box}.evg-stage{height:clamp(330px,56vh,640px);min-height:285px;position:relative;overflow:hidden;border:1px solid #496a80;border-radius:16px;background:radial-gradient(ellipse at 48% 38%,#254b67,#071725 78%)}.evg-stage canvas{display:block;width:100%;height:100%;touch-action:none}.evg-hud{position:absolute;left:12px;top:12px;display:flex;gap:7px;flex-wrap:wrap;pointer-events:none}.evg-chip{background:#071725e8;border:1px solid #7593a9;color:#f1f8ff;border-radius:30px;padding:7px 11px;font-size:11px;font-weight:800}.evg-hint{position:absolute;bottom:10px;left:10px;right:10px;text-align:center;background:#061522c9;color:#e4f3ff;border:1px solid #496a80;border-radius:9px;padding:8px;font-size:12px;pointer-events:none}.evg-panel{background:#10283a;border:1px solid #3d6078;border-radius:15px;padding:14px;min-width:0}.evg-panel h3{font-size:15px;margin:0 0 12px;color:#fff}.evg-field{margin:12px 0}.evg-field label{display:flex;justify-content:space-between;gap:8px;color:#d4e7f4;font-size:12px;font-weight:700;margin-bottom:7px}.evg-field input[type=range]{width:100%;accent-color:#ffbd42}.evg-val{color:#fff;font-variant-numeric:tabular-nums}.evg-row{display:flex;gap:7px;flex-wrap:wrap}.evg-btn{border:1px solid #65839a;background:#1b4059;color:#f4f9ff;border-radius:9px;padding:9px 11px;min-height:38px;font-size:12px;font-weight:750;cursor:pointer}.evg-btn.primary{background:#f6b83e;border-color:#ffda83;color:#172b3b}.evg-readout{background:#071b2b;border:1px solid #41647c;border-radius:11px;padding:12px;margin-top:12px}.evg-readout small{display:block;color:#a9c9dc;font-size:10px;font-weight:850;letter-spacing:.07em;margin-bottom:5px}.evg-readout output{display:block;color:#fff;font-size:19px;font-weight:850;font-variant-numeric:tabular-nums}.evg-note{font-size:12px;line-height:1.55;color:#c9dce8}.evg-knowledge{grid-column:1/-1;background:#f1f6fa;color:#203746;border-radius:13px;padding:13px 16px}.evg-knowledge h3{font-size:15px;margin:0 0 7px}.evg-knowledge p{font-size:13px;line-height:1.55;margin:5px 0}.evg-toggle{display:none}@media(max-width:900px){.evg{grid-template-columns:1fr}.evg-stage{height:clamp(300px,53svh,530px)}.evg-knowledge{grid-column:1}}@media(max-width:620px){.evg{gap:9px}.evg-stage{height:clamp(285px,49svh,440px)}.evg-panel{padding:11px}.evg-toggle{display:flex;width:100%;justify-content:space-between}.evg-panel.fold .evg-controls{display:none}.evg-knowledge{padding:12px}}@media(orientation:landscape) and (max-height:520px){.evg{grid-template-columns:minmax(0,1.5fr) minmax(225px,.8fr)}.evg-stage{height:calc(100svh - 145px);min-height:220px}}";
 document.head.appendChild(s);
}
function uiShell(root,no,title,hint,controls,knowledge){
 const id="evg"+Math.random().toString(36).slice(2,8);
 root.innerHTML='<section class="evg" id="'+id+'"><div class="evg-stage" data-stage><div class="evg-hud"><span class="evg-chip">'+no+'</span><span class="evg-chip">'+title+'</span></div><div class="evg-hint">'+hint+'</div></div><aside class="evg-panel fold" data-panel><button class="evg-btn evg-toggle" data-toggle aria-expanded="false">Bảng điều khiển <span>＋</span></button><div class="evg-controls">'+controls+'</div></aside><section class="evg-knowledge"><h3>Kiến thức cần nhớ</h3>'+knowledge+'</section></section>';
 const el=root.querySelector("#"+id),panel=el.querySelector("[data-panel]"),toggle=el.querySelector("[data-toggle]");
 toggle.addEventListener("click",()=>{panel.classList.toggle("fold");const open=!panel.classList.contains("fold");toggle.setAttribute("aria-expanded",String(open));toggle.lastElementChild.textContent=open?"−":"＋";});
 return{el,stage:el.querySelector("[data-stage]")};
}
function engine(stage,cameraPos){
 const T=window.THREE;if(!T)throw Error("Không tải được thư viện Three.js.");
 const scene=new T.Scene();scene.background=new T.Color(0x091b2b);
 const camera=new T.PerspectiveCamera(42,1,.1,250);camera.position.set(...cameraPos);
 const renderer=new T.WebGLRenderer({antialias:true,alpha:false,powerPreference:"high-performance"});renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.6));renderer.outputEncoding=T.sRGBEncoding;renderer.shadowMap.enabled=true;stage.insertBefore(renderer.domElement,stage.firstChild);
 scene.add(new T.HemisphereLight(0xd9efff,0x263b27,1.55));const key=new T.DirectionalLight(0xffffff,2.1);key.position.set(7,12,8);key.castShadow=true;scene.add(key);const fill=new T.DirectionalLight(0x62b7ef,.65);fill.position.set(-8,4,-7);scene.add(fill);
 let orbit=null;if(T.OrbitControls){orbit=new T.OrbitControls(camera,renderer.domElement);orbit.enableDamping=true;orbit.dampingFactor=.06;orbit.minDistance=3;orbit.maxDistance=32;orbit.target.set(0,0,0);}
 let raf=0,dead=false,ro=null;const updates=[];
 function resize(){const w=Math.max(1,stage.clientWidth),h=Math.max(1,stage.clientHeight);renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();}
 if(window.ResizeObserver){ro=new ResizeObserver(resize);ro.observe(stage);}else window.addEventListener("resize",resize);resize();
 function loop(){if(dead)return;raf=requestAnimationFrame(loop);if(orbit)orbit.update();updates.forEach(f=>f());renderer.render(scene,camera);}loop();
 return{T,scene,camera,renderer,orbit,updates,dispose(){dead=true;cancelAnimationFrame(raf);if(ro)ro.disconnect();else window.removeEventListener("resize",resize);if(orbit)orbit.dispose();scene.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material){const a=Array.isArray(o.material)?o.material:[o.material];a.forEach(m=>{Object.keys(m).forEach(k=>{if(m[k]&&m[k].isTexture)m[k].dispose();});m.dispose();});}});renderer.dispose();renderer.domElement.remove();}};
}
function M(E,c,r=.8,extra={}){return new E.T.MeshStandardMaterial({color:c,roughness:r,...extra});}
function floor(E,w,d,c){const m=new E.T.Mesh(new E.T.BoxGeometry(w,.22,d),M(E,c,1));m.position.y=-.22;m.receiveShadow=true;E.scene.add(m);return m;}
function tube(E,pts,c,r=.03){const curve=new E.T.CatmullRomCurve3(pts.map(p=>new E.T.Vector3(...p)));const m=new E.T.Mesh(new E.T.TubeGeometry(curve,Math.max(32,pts.length*10),r,8,false),M(E,c,.55,{emissive:c,emissiveIntensity:.1}));E.scene.add(m);return m;}
function pin(E,x,y,z,c){const g=new E.T.Group(),stem=new E.T.Mesh(new E.T.CylinderGeometry(.045,.07,.56,12),M(E,0xf5f7fa,.35)),head=new E.T.Mesh(new E.T.SphereGeometry(.16,20,16),M(E,c,.28,{emissive:c,emissiveIntensity:.15}));stem.position.y=.28;head.position.y=.62;g.add(stem,head);g.position.set(x,y,z);E.scene.add(g);return g;}
function label(E,txt,x,y,z,color){const c=document.createElement("canvas");c.width=512;c.height=128;const g=c.getContext("2d");g.font="bold 48px system-ui";g.textAlign="center";g.textBaseline="middle";g.lineWidth=8;g.strokeStyle="#10202c";g.strokeText(txt,256,64);g.fillStyle=color||"#fff";g.fillText(txt,256,64);const tex=new E.T.CanvasTexture(c);tex.encoding=E.T.sRGBEncoding;const m=new E.T.Mesh(new E.T.PlaneGeometry(2.4,.6),new E.T.MeshBasicMaterial({map:tex,transparent:true,side:E.T.DoubleSide,depthWrite:false}));m.position.set(x,y,z);E.scene.add(m);return m;}
function mount02(root){
 const U=uiShell(root,"MÔ PHỎNG 02","Quả Địa Cầu và bản đồ","Đối chiếu quả Địa Cầu với bản đồ phẳng; xoay mô hình để quan sát bề mặt.",
 '<h3>Phép chiếu bản đồ</h3><div class="evg-field"><label>Phép chiếu <span class="evg-val" data-name>Hình trụ</span></label><input type="range" min="0" max="2" step="1" value="0" data-proj></div><div class="evg-row"><button class="evg-btn primary" data-spin>⏸ Tạm dừng quay</button><button class="evg-btn" data-home>Góc nhìn ban đầu</button></div><div class="evg-readout"><small>ĐẶC ĐIỂM PHÉP CHIẾU</small><output data-out>Phép chiếu hình trụ làm biến dạng tăng ở vĩ độ cao.</output></div><p class="evg-note">Bề mặt quả Địa Cầu và bản đồ phẳng sử dụng cùng ảnh vệ tinh Blue Marble. Cần kết nối Internet để tải ảnh; nếu ảnh không tải được, mô hình vẫn có bề mặt màu dự phòng.</p>',
 '<p>Quả Địa Cầu mô phỏng gần đúng hình dạng và vị trí tương đối của lục địa, đại dương. Bản đồ là hình ảnh thu nhỏ toàn bộ hoặc một phần bề mặt Trái Đất trên mặt phẳng.</p><p>Khi chuyển bề mặt cong sang mặt phẳng, phép chiếu bản đồ luôn làm biến dạng một hoặc nhiều yếu tố: diện tích, hình dạng, khoảng cách hoặc phương hướng.</p>');
 const E=engine(U.stage,[7,5,9]),T=E.T;floor(E,12,8,0x203e4b);
 const globe=new T.Mesh(new T.SphereGeometry(2.2,96,64),M(E,0x176b91,.9));globe.position.set(-3.15,2,0);E.scene.add(globe);
 const loader=new T.TextureLoader();loader.setCrossOrigin("anonymous");let dead=false;
 const url="https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg";
 loader.load(url,t=>{if(dead){t.dispose();return;}t.encoding=T.sRGBEncoding;globe.material.map=t;globe.material.color.set(0xffffff);globe.material.needsUpdate=true;},undefined,()=>{});
 const halo=new T.Mesh(new T.SphereGeometry(2.27,64,48),new T.MeshBasicMaterial({color:0x58c5ef,transparent:true,opacity:.08,side:T.BackSide}));halo.position.copy(globe.position);E.scene.add(halo);
 const flat=new T.Mesh(new T.PlaneGeometry(5.25,3.05),M(E,0x176b91,.9));flat.rotation.x=-Math.PI/2;flat.position.set(3.1,.08,0);E.scene.add(flat);
 const rim=new T.Mesh(new T.BoxGeometry(5.42,.13,3.22),M(E,0xd5a94c,.4,{metalness:.35}));rim.position.set(3.1,-.04,0);E.scene.add(rim);
 loader.load(url,t=>{if(dead){t.dispose();return;}t.encoding=T.sRGBEncoding;flat.material.map=t;flat.material.color.set(0xffffff);flat.material.needsUpdate=true;},undefined,()=>{});
 for(let lat=-75;lat<=75;lat+=15){const pts=[];for(let lon=-180;lon<=180;lon+=5){const a=lat*Math.PI/180,b=lon*Math.PI/180;pts.push([-3.15+2.22*Math.cos(a)*Math.cos(b),2+2.22*Math.sin(a),2.22*Math.cos(a)*Math.sin(b)]);}tube(E,pts,0x9bd7e8,.009);}
 const names=["Hình trụ","Hình nón","Phương vị"],desc=["Hình trụ: biến dạng tăng mạnh về hai vùng cực; thường dùng trong một số bản đồ thế giới.","Hình nón: phù hợp thể hiện khu vực ở vĩ độ trung bình; thường dùng cho bản đồ khu vực ôn đới.","Phương vị: thể hiện phương hướng từ tâm bản đồ; biến dạng tăng dần khi ra xa tâm."];
 const proj=U.el.querySelector("[data-proj]"),out=U.el.querySelector("[data-out]");proj.addEventListener("input",()=>{const i=+proj.value;U.el.querySelector("[data-name]").textContent=names[i];out.textContent=desc[i];flat.scale.set(1-i*.06,1,1-i*.06);});
 let spin=true;U.el.querySelector("[data-spin]").addEventListener("click",e=>{spin=!spin;e.currentTarget.textContent=spin?"⏸ Tạm dừng quay":"▶ Tiếp tục quay";});U.el.querySelector("[data-home]").addEventListener("click",()=>{E.camera.position.set(7,5,9);if(E.orbit)E.orbit.target.set(0,1,0);});
 E.updates.push(()=>{if(spin)globe.rotation.y+=.0018;});return{destroy(){dead=true;E.dispose();}};
}
function mount03(root){
 const U=uiShell(root,"MÔ PHỎNG 03","La bàn và phương hướng","Quan sát cấu tạo la bàn 3D; xoay kim theo góc phương vị để xác định hướng.",
 '<h3>Góc phương vị</h3><div class="evg-field"><label>Góc quay <span class="evg-val" data-angle-label>000° · Bắc</span></label><input type="range" min="0" max="359" value="0" data-angle></div><div class="evg-row"><button class="evg-btn" data-dir="0">Bắc</button><button class="evg-btn" data-dir="90">Đông</button><button class="evg-btn" data-dir="180">Nam</button><button class="evg-btn" data-dir="270">Tây</button></div><div class="evg-readout"><small>HƯỚNG ĐANG CHỈ</small><output data-out>Bắc · 000°</output></div><p class="evg-note">Góc phương vị đo theo chiều kim đồng hồ, bắt đầu từ hướng Bắc: Đông 90°, Nam 180°, Tây 270°.</p>',
 '<p>La bàn xác định phương hướng dựa trên từ trường Trái Đất. Đầu Bắc của kim từ thường chỉ gần hướng Bắc địa lí; hai hướng này không trùng khít tuyệt đối do độ từ thiên.</p><p>Khi sử dụng, đặt la bàn nằm ngang và tránh xa vật có từ tính hoặc nguồn gây nhiễu.</p>');
 const E=engine(U.stage,[6,7,8]),T=E.T;floor(E,8,8,0x183647);
 const base=new T.Mesh(new T.CylinderGeometry(2.8,3,.36,96),M(E,0x9fb3c0,.38,{metalness:.3}));base.position.y=.25;E.scene.add(base);
 const face=new T.Mesh(new T.CylinderGeometry(2.65,2.65,.08,96),M(E,0xf1e9d5,.48));face.position.y=.48;E.scene.add(face);
 const ring=new T.Mesh(new T.TorusGeometry(2.68,.075,12,120),M(E,0xd19a3b,.3,{metalness:.5}));ring.rotation.x=Math.PI/2;ring.position.y=.53;E.scene.add(ring);
 for(let i=0;i<72;i++){const a=i*Math.PI/36,major=i%6===0;const tick=new T.Mesh(new T.BoxGeometry(major?.045:.022,major?.2:.105,.025),M(E,major?0x18364b:0x657d8d));tick.position.set(Math.sin(a)*2.55,.56,Math.cos(a)*2.55);tick.rotation.y=a;E.scene.add(tick);}
 const needle=new T.Group();needle.position.y=.65;E.scene.add(needle);
 const n=new T.Mesh(new T.ConeGeometry(.19,1.95,4),M(E,0xd72f35,.32,{emissive:0x5b0808,emissiveIntensity:.13}));n.position.set(0,.05,-.8);n.rotation.x=-Math.PI/2;needle.add(n);
 const south=new T.Mesh(new T.ConeGeometry(.19,1.95,4),M(E,0x23558a,.32));south.position.set(0,.05,.8);south.rotation.x=Math.PI/2;needle.add(south);
 const hub=new T.Mesh(new T.SphereGeometry(.22,24,18),M(E,0xf1c65e,.25,{metalness:.5}));hub.position.y=.15;needle.add(hub);
 label(E,"BẮC",0,1.2,-3.1,"#ff7373");label(E,"NAM",0,1.2,3.05,"#e3f1ff");label(E,"ĐÔNG",3.1,1.2,0,"#fff0be");label(E,"TÂY",-3.1,1.2,0,"#fff0be");
 const input=U.el.querySelector("[data-angle]"),out=U.el.querySelector("[data-out]"),lab=U.el.querySelector("[data-angle-label]"),dirs=["Bắc","Đông Bắc","Đông","Đông Nam","Nam","Tây Nam","Tây","Tây Bắc"];
 function set(v){v=(v+360)%360;input.value=Math.round(v);needle.rotation.y=v*Math.PI/180;const d=dirs[Math.round(v/45)%8],a=String(Math.round(v)).padStart(3,"0");lab.textContent=a+"° · "+d;out.textContent=d+" · "+a+"°";}
 input.addEventListener("input",()=>set(+input.value));U.el.querySelectorAll("[data-dir]").forEach(b=>b.addEventListener("click",()=>set(+b.dataset.dir)));set(0);return{destroy(){E.dispose();}};
}
function mount04(root){
 const U=uiShell(root,"MÔ PHỎNG 04","Tỉ lệ bản đồ","Thay đổi tỉ lệ và chiều dài đoạn đo để thấy khoảng cách thực địa thay đổi theo.",
 '<h3>Điều chỉnh phép đo</h3><div class="evg-field"><label>Tỉ lệ bản đồ <span class="evg-val" data-scale-label>1 : 50 000</span></label><input type="range" min="1" max="5" value="3" data-scale></div><div class="evg-field"><label>Đoạn trên bản đồ <span class="evg-val" data-length-label>4 cm</span></label><input type="range" min="1" max="8" step=".5" value="4" data-length></div><div class="evg-readout"><small>KHOẢNG CÁCH THỰC TẾ</small><output data-out>2 km</output></div><p class="evg-note">Khoảng cách thực tế = khoảng cách trên bản đồ × mẫu số tỉ lệ. Cần đổi về cùng đơn vị trước khi tính.</p>',
 '<p>Tỉ lệ 1 : 50 000 nghĩa là 1 cm trên bản đồ tương ứng 50 000 cm ngoài thực tế, tức 500 m.</p><p>Mẫu số tỉ lệ càng lớn thì mức độ thu nhỏ càng nhiều. Bản đồ tỉ lệ lớn thường thể hiện phạm vi hẹp hơn nhưng có nhiều chi tiết hơn.</p>');
 const E=engine(U.stage,[7,8,8]),T=E.T;floor(E,11,8,0x315d4c);
 const board=new T.Mesh(new T.BoxGeometry(9.8,.12,6.8),M(E,0xd9d4bc,1));board.position.y=-.02;E.scene.add(board);
 const road=new T.Mesh(new T.BoxGeometry(8.5,.04,.68),M(E,0x77838d,1));road.position.set(0,.08,0);E.scene.add(road);
 const road2=new T.Mesh(new T.BoxGeometry(.62,.05,5.5),M(E,0x77838d,1));road2.position.set(-1.2,.09,0);E.scene.add(road2);
 for(let x=-3.7;x<4;x+=.7){const dash=new T.Mesh(new T.BoxGeometry(.34,.05,.035),M(E,0xffe8a0));dash.position.set(x,.12,0);E.scene.add(dash);}
 [[-3,1.4,0xd96b4c],[-.1,1.6,0xe8b65d],[2.7,1.3,0x6b9ec5],[-3,-1.8,0x9b7bc3],[2.7,-1.8,0xd27b9a]].forEach(([x,z,c])=>{const b=new T.Mesh(new T.BoxGeometry(1.05,.55,.9),M(E,c));b.position.set(x,.4,z);E.scene.add(b);const r=new T.Mesh(new T.ConeGeometry(.78,.45,4),M(E,0x654a3b));r.position.set(x,.9,z);r.rotation.y=Math.PI/4;E.scene.add(r);});
 const A=pin(E,-2.8,.16,0,0xffd34f),B=pin(E,1.2,.16,0,0x47d9ff);let measure=tube(E,[[-2.8,.25,0],[1.2,.25,0]],0xffe05d,.055);
 const scale=U.el.querySelector("[data-scale]"),length=U.el.querySelector("[data-length]"),out=U.el.querySelector("[data-out]");
 const den=[10000,25000,50000,100000,250000];
 function update(){const d=den[+scale.value-1],cm=+length.value;U.el.querySelector("[data-scale-label]").textContent="1 : "+d.toLocaleString("vi-VN");U.el.querySelector("[data-length-label]").textContent=cm+" cm";const km=cm*d/100000;out.textContent=km<1?Math.round(km*1000).toLocaleString("vi-VN")+" m":km.toLocaleString("vi-VN",{maximumFractionDigits:2})+" km";B.position.x=A.position.x+cm/8*6;E.scene.remove(measure);measure.geometry.dispose();measure.material.dispose();measure=tube(E,[[A.position.x,.25,0],[B.position.x,.25,0]],0xffe05d,.055);}
 scale.addEventListener("input",update);length.addEventListener("input",update);update();return{destroy(){E.dispose();}};
}
function mount05(root){
 const U=uiShell(root,"MÔ PHỎNG 05","Đo khoảng cách trên bản đồ","Chạm hai vị trí trên mặt bản đồ để đặt điểm đầu và điểm cuối của đoạn đo.",
 '<h3>Công cụ đo khoảng cách</h3><div class="evg-field"><label>Tỉ lệ bản đồ <span class="evg-val" data-scale-label>1 : 50 000</span></label><input type="range" min="1" max="5" value="3" data-scale></div><div class="evg-row"><button class="evg-btn" data-clear>Xóa điểm đo</button><button class="evg-btn primary" data-example>Tuyến mẫu</button></div><div class="evg-readout"><small>CHIỀU DÀI TRÊN BẢN ĐỒ</small><output data-map>0 cm</output></div><div class="evg-readout"><small>KHOẢNG CÁCH THỰC TẾ</small><output data-ground>—</output></div><p class="evg-note">Chọn lần lượt điểm đầu và điểm cuối. Một đơn vị trên mặt bản đồ mô phỏng tương ứng 1 cm bản đồ; kết quả là khoảng cách đường thẳng.</p>',
 '<p>Đo khoảng cách bằng cách xác định chiều dài đoạn nối hai địa điểm trên bản đồ, sau đó nhân với mẫu số tỉ lệ.</p><p>Nếu đo tuyến đường có nhiều đoạn gấp khúc, cần đo từng đoạn rồi cộng lại. Khoảng cách đường thẳng không phải chiều dài thực tế của tuyến giao thông.</p>');
 const E=engine(U.stage,[0,11,.5]),T=E.T;if(E.orbit){E.orbit.maxPolarAngle=Math.PI/2.08;E.orbit.minPolarAngle=.3;}floor(E,12,8,0x274b3b);
 const map=new T.Mesh(new T.PlaneGeometry(10,6.4),M(E,0xd7d2b6,1));map.rotation.x=-Math.PI/2;map.position.y=-.04;E.scene.add(map);
 const park=new T.Mesh(new T.CircleGeometry(1.15,48),M(E,0x63955a,1));park.rotation.x=-Math.PI/2;park.position.set(-2,.015,-.8);E.scene.add(park);
 const lake=new T.Mesh(new T.CircleGeometry(.82,48),M(E,0x3c9dc5,.4));lake.rotation.x=-Math.PI/2;lake.scale.set(1.5,.8,1);lake.position.set(2,.025,1.25);E.scene.add(lake);
 [[[ -4,.04,-2.3],[-2,.04,-1.1],[0,.04,-.4],[2,.04,.3],[4,.04,2.2]],[[-4,.045,1.8],[-2,.045,.8],[0,.045,.2],[2,.045,-.5],[4,.045,-1.9]],[[-.8,.05,-3],[-.4,.05,-1],[.1,.05,1],[.5,.05,3]]].forEach(p=>tube(E,p,0x657786,.12));
 for(let i=0;i<10;i++){const x=-4.2+(i%5)*2.1,z=-2.5+Math.floor(i/5)*4.4,b=new T.Mesh(new T.BoxGeometry(.65,.16,.5),M(E,[0xd77b57,0xd9b65e,0x8e9fc0,0x9a78a7][i%4]));b.position.set(x,.08,z);E.scene.add(b);}
 const plane=new T.Plane(new T.Vector3(0,1,0),0),ray=new T.Raycaster(),pointer=new T.Vector2(),points=[],group=new T.Group(),segments=[];E.scene.add(group);
 const scale=U.el.querySelector("[data-scale]"),mapOut=U.el.querySelector("[data-map]"),groundOut=U.el.querySelector("[data-ground]"),den=[10000,25000,50000,100000,250000];
 function update(){const d=den[+scale.value-1];U.el.querySelector("[data-scale-label]").textContent="1 : "+d.toLocaleString("vi-VN");if(points.length<2){groundOut.textContent="—";return;}const cm=Math.hypot(points[1].x-points[0].x,points[1].z-points[0].z);mapOut.textContent=cm.toFixed(2)+" cm";const m=cm*d/100;groundOut.textContent=m>=1000?(m/1000).toFixed(2)+" km":Math.round(m)+" m";}
 function clear(){points.length=0;group.clear();segments.forEach(o=>{E.scene.remove(o);o.geometry.dispose();o.material.dispose();});segments.length=0;mapOut.textContent="0 cm";groundOut.textContent="—";}
 function add(x,z){if(points.length===2)clear();points.push({x,z});const p=pin(E,x,0,z,points.length===1?0xffc83d:0x30c7ed);group.add(p);if(points.length===2){const s=tube(E,[[points[0].x,.2,points[0].z],[x,.2,z]],0xffb72f,.055);segments.push(s);}update();}
 const canvas=E.renderer.domElement;
 function down(ev){const r=canvas.getBoundingClientRect();pointer.x=(ev.clientX-r.left)/r.width*2-1;pointer.y=-(ev.clientY-r.top)/r.height*2+1;ray.setFromCamera(pointer,E.camera);const hit=new T.Vector3();if(ray.ray.intersectPlane(plane,hit)&&Math.abs(hit.x)<=5&&Math.abs(hit.z)<=3.2)add(hit.x,hit.z);}
 canvas.addEventListener("pointerdown",down);U.el.querySelector("[data-clear]").addEventListener("click",clear);U.el.querySelector("[data-example]").addEventListener("click",()=>{clear();add(-3.4,-2.2);add(3.5,2.1);});scale.addEventListener("input",update);update();
 return{destroy(){canvas.removeEventListener("pointerdown",down);E.dispose();}};
}
window.simGeo02GlobeMap=mount02;window.simGeo03Compass=mount03;window.simGeo04MapScale=mount04;window.simGeo05Distance=mount05;
})();