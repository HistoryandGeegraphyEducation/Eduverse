(function(){
"use strict";
const sid="ev-coordinate-style";
if(!document.getElementById(sid)){
 const s=document.createElement("style");s.id=sid;s.textContent=".evc{display:grid;grid-template-columns:minmax(0,1.6fr) minmax(260px,1fr);gap:14px;color:#eaf2f7}.evc *{box-sizing:border-box}.evc-stage{height:clamp(340px,56vh,640px);min-height:300px;position:relative;overflow:hidden;border-radius:16px;background:radial-gradient(ellipse at 50% 40%,#244b67,#0a1b2b 75%);border:1px solid #31516a}.evc-stage canvas{display:block;width:100%;height:100%;touch-action:none}.evc-hud{position:absolute;top:12px;left:12px;display:flex;gap:7px;flex-wrap:wrap;pointer-events:none}.evc-chip{background:#071a2bd9;border:1px solid #547187;color:#e5f2f8;border-radius:20px;padding:7px 10px;font:600 11px system-ui}.evc-hint{position:absolute;bottom:10px;left:10px;right:10px;text-align:center;background:#071a2baf;color:#d6e6ef;padding:8px;border-radius:9px;font:12px system-ui;pointer-events:none}.evc-panel{background:#102638;border:1px solid #31516a;border-radius:15px;padding:14px;min-width:0}.evc-panel h3{font:700 15px system-ui;margin:0 0 12px}.evc-field{margin:12px 0}.evc-field label{display:flex;justify-content:space-between;gap:8px;font:600 12px system-ui;color:#c5d8e5;margin-bottom:7px}.evc-field input[type=range]{width:100%;accent-color:#64c6e8}.evc-val{color:#fff;font-variant-numeric:tabular-nums}.evc-row{display:flex;gap:7px;flex-wrap:wrap}.evc-btn{border:1px solid #496a80;background:#1c3b51;color:#eaf5fb;border-radius:9px;padding:9px 11px;font:600 12px system-ui;min-height:38px;cursor:pointer}.evc-checks{display:grid;grid-template-columns:1fr 1fr;gap:9px}.evc-checks label{font:12px system-ui;color:#d2e1e9;display:flex;gap:6px;align-items:center}.evc-checks input{accent-color:#64c6e8}.evc-result{background:#081b2a;padding:12px;border-radius:11px;margin-top:12px;border:1px solid #34566b}.evc-result b{display:block;color:#9fc6d8;font:700 11px system-ui;margin-bottom:5px}.evc-result output{font:700 18px system-ui;color:white}.evc-note{font:12px/1.55 system-ui;color:#c2d5e1}.evc-knowledge{grid-column:1/-1;background:#f3f7fa;color:#203746;border-radius:13px;padding:13px 16px}.evc-knowledge h3{font:700 15px system-ui;margin:0 0 8px}.evc-knowledge p{font:13px/1.6 system-ui;margin:5px 0}.evc-toggle{display:none}@media(max-width:900px){.evc{grid-template-columns:1fr}.evc-stage{height:clamp(300px,52svh,520px)}.evc-knowledge{grid-column:1}}@media(max-width:620px){.evc{gap:9px}.evc-stage{height:clamp(285px,49svh,430px)}.evc-toggle{display:flex;width:100%;justify-content:space-between}.evc-panel{padding:11px}.evc-panel.fold .evc-controls{display:none}.evc-knowledge{padding:12px}}@media(orientation:landscape) and (max-height:520px){.evc{grid-template-columns:minmax(0,1.4fr) minmax(230px,.8fr)}.evc-stage{height:calc(100svh - 150px);min-height:230px}}";
 document.head.appendChild(s);
}
window.simGeo01Coordinates=function(root){
 if(!window.THREE){root.textContent="Không thể tải thư viện dựng hình 3D.";return{destroy:function(){}};}
 const T=window.THREE,uid="evc"+Math.random().toString(36).slice(2,8);
 root.innerHTML='<section class="evc" id="'+uid+'"><div class="evc-stage" data-stage><div class="evc-hud"><span class="evc-chip">TỌA ĐỘ ĐỊA LÍ</span><span class="evc-chip" data-hud>21° Bắc · 105° Đông</span></div><div class="evc-hint">Kéo để xoay · Chạm lên quả Địa Cầu để chọn vị trí</div></div><aside class="evc-panel fold" data-panel><button class="evc-btn evc-toggle" data-toggle aria-expanded="false"><span>Điều khiển mô phỏng</span><span data-arrow>＋</span></button><div class="evc-controls"><h3>Điểm khảo sát</h3><div class="evc-field"><label>Vĩ độ <span class="evc-val" data-lat-txt>21° Bắc</span></label><input data-lat type="range" min="-90" max="90" value="21"></div><div class="evc-field"><label>Kinh độ <span class="evc-val" data-lon-txt>105° Đông</span></label><input data-lon type="range" min="-180" max="180" value="105"></div><div class="evc-row"><button class="evc-btn" data-preset="21,105">Hà Nội</button><button class="evc-btn" data-preset="10,106">TP. Hồ Chí Minh</button><button class="evc-btn" data-reset>Đặt lại</button></div><div class="evc-field"><label>Lớp tọa độ</label><div class="evc-checks"><label><input type="checkbox" data-layer="lat" checked> Vĩ tuyến</label><label><input type="checkbox" data-layer="lon" checked> Kinh tuyến</label><label><input type="checkbox" data-layer="eq" checked> Xích đạo</label><label><input type="checkbox" data-layer="prime" checked> Kinh tuyến gốc</label><label><input type="checkbox" data-layer="axis"> Trục Trái Đất</label></div></div><div class="evc-row"><button class="evc-btn" data-home>Góc nhìn ban đầu</button></div><div class="evc-result"><b>TỌA ĐỘ ĐIỂM ĐANG CHỌN</b><output data-output>21° Bắc, 105° Đông</output></div><p class="evc-note">Điều chỉnh bằng thanh trượt hoặc chạm trực tiếp lên bề mặt quả Địa Cầu. Hai thành phần tọa độ được cập nhật đồng thời.</p></div></aside><section class="evc-knowledge"><h3>Kiến thức cần nhớ</h3><p><b>Vĩ độ</b> là số đo góc từ mặt phẳng xích đạo đến vị trí xét, từ 0° đến 90° Bắc hoặc Nam.</p><p><b>Kinh độ</b> là số đo góc từ mặt phẳng kinh tuyến gốc đến kinh tuyến đi qua vị trí xét, từ 0° đến 180° Đông hoặc Tây.</p><p><b>Tọa độ địa lí</b> được xác định bằng cặp vĩ độ và kinh độ; khi ghi tọa độ, vĩ độ được ghi trước, kinh độ ghi sau.</p></section></section>';
 const el=root.querySelector("#"+uid),stage=el.querySelector("[data-stage]"),state={lat:21,lon:105};
 let renderer,scene,camera,orbit,earth,pin,axis,eq,prime,latGroup,lonGroup,raf=0,dead=false,ro;
 const V=(x,y,z)=>new T.Vector3(x,y,z),material=(c,r)=>new T.MeshStandardMaterial({color:c,roughness:r||.8});
 function point(lat,lon,r){const a=lat*Math.PI/180,b=lon*Math.PI/180;return V(r*Math.cos(a)*Math.cos(b),r*Math.sin(a),r*Math.cos(a)*Math.sin(b));}
 function tube(pts,color,r){const curve=new T.CatmullRomCurve3(pts),m=new T.Mesh(new T.TubeGeometry(curve,Math.max(48,pts.length*2),r,6,false),material(color,.65));scene.add(m);return m;}
 function land(lat,lon,a,b,c,d){const dl=((lon-c+540)%360)-180;return Math.pow((lat-a)/b,2)+Math.pow(dl/d,2)<1;}
 function makeEarth(){
  const g=new T.SphereGeometry(1.8,144,96),p=g.attributes.position,cols=[];
  for(let i=0;i<p.count;i++){const x=p.getX(i)/1.8,y=p.getY(i)/1.8,z=p.getZ(i)/1.8,la=Math.asin(T.MathUtils.clamp(y,-1,1))*180/Math.PI,lo=Math.atan2(z,x)*180/Math.PI;
   const l=land(48,15,27,42,15,42)||land(8,20,30,23,20,23)||land(-18,135,13,28,135,28)||land(-25,25,35,18,25,18)||land(48,-105,24,42,-105,42)||land(-15,-60,34,20,-60,20)||land(72,-40,13,18,-40,18);
   const c=Math.abs(la)>78?new T.Color(0xe8edf0):l?new T.Color(0x688e58).offsetHSL(0,.02,Math.sin(lo*1.7+la)*.02):new T.Color(0x17658a).offsetHSL(0,.02,Math.sin(lo+la)*.015);cols.push(c.r,c.g,c.b);
  }
  g.setAttribute("color",new T.Float32BufferAttribute(cols,3));earth=new T.Mesh(g,new T.MeshStandardMaterial({vertexColors:true,roughness:.9}));scene.add(earth);
  scene.add(new T.Mesh(new T.SphereGeometry(1.824,80,48),new T.MeshBasicMaterial({color:0x72c9ef,transparent:true,opacity:.1,side:T.BackSide})));
 }
 function makeLines(){
  latGroup=new T.Group();lonGroup=new T.Group();scene.add(latGroup,lonGroup);
  for(let la=-75;la<=75;la+=15){const pts=[];for(let lo=0;lo<=360;lo+=4)pts.push(point(la,lo,1.812));const m=new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts),180,la===0?.012:.004,6,false),material(la===0?0xffd36b:0xc7dce5));latGroup.add(m);if(la===0)eq=m;}
  for(let lo=-180;lo<180;lo+=15){const pts=[];for(let la=-89;la<=89;la+=4)pts.push(point(la,lo,1.814));const m=new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts),100,lo===0?.012:.004,6,false),material(lo===0?0xff9f63:0xc7dce5));lonGroup.add(m);if(lo===0)prime=m;}
  axis=new T.Mesh(new T.CylinderGeometry(.012,.012,4.35,12),material(0xffe1a1));axis.rotation.z=-23.5*Math.PI/180;scene.add(axis);
 }
 function updatePin(){
  const pos=point(state.lat,state.lon,1.84);pin.position.copy(pos);pin.quaternion.setFromUnitVectors(V(0,1,0),pos.clone().normalize());
 }
 function fmt(v,isLat){if(v===0)return"0°";return Math.abs(v)+"° "+(isLat?(v>0?"Bắc":"Nam"):(v>0?"Đông":"Tây"));}
 function update(){
  el.querySelector("[data-lat]").value=state.lat;el.querySelector("[data-lon]").value=state.lon;
  el.querySelector("[data-lat-txt]").textContent=fmt(state.lat,true);el.querySelector("[data-lon-txt]").textContent=fmt(state.lon,false);
  el.querySelector("[data-output]").textContent=fmt(state.lat,true)+", "+fmt(state.lon,false);
  el.querySelector("[data-hud]").textContent=fmt(state.lat,true)+" · "+fmt(state.lon,false);
  updatePin();
 }
 function setPoint(a,b){state.lat=Math.round(T.MathUtils.clamp(a,-90,90));state.lon=Math.round(T.MathUtils.clamp(b,-180,180));update();}
 function resize(){if(dead||!renderer)return;const w=Math.max(1,stage.clientWidth),h=Math.max(1,stage.clientHeight);renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();}
 function init(){
  scene=new T.Scene();scene.background=new T.Color(0x0b1d2b);camera=new T.PerspectiveCamera(38,1,.1,100);camera.position.set(5.4,3.2,6.8);camera.lookAt(0,0,0);
  renderer=new T.WebGLRenderer({antialias:true,powerPreference:"high-performance"});renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.5));renderer.outputColorSpace=T.SRGBColorSpace;stage.insertBefore(renderer.domElement,stage.firstChild);
  scene.add(new T.HemisphereLight(0xd8efff,0x263b32,2));const key=new T.DirectionalLight(0xfff1d6,2.4);key.position.set(4,5,6);scene.add(key);const fill=new T.DirectionalLight(0x5b9ac6,.9);fill.position.set(-5,1,-4);scene.add(fill);
  makeEarth();makeLines();pin=new T.Group();const stem=new T.Mesh(new T.CylinderGeometry(.018,.025,.34,12),material(0xffd34f));stem.position.y=.16;const head=new T.Mesh(new T.SphereGeometry(.075,20,16),material(0xff6b4f));head.position.y=.36;pin.add(stem,head);scene.add(pin);updatePin();
  if(T.OrbitControls){orbit=new T.OrbitControls(camera,renderer.domElement);orbit.enableDamping=true;orbit.dampingFactor=.06;orbit.minDistance=3.5;orbit.maxDistance=11;orbit.target.set(0,0,0);}
  resize();
  const ray=new T.Raycaster(),mouse=new T.Vector2();renderer.domElement.addEventListener("pointerup",e=>{if(e.pointerType==="mouse"&&e.button!==0)return;const r=renderer.domElement.getBoundingClientRect();mouse.set((e.clientX-r.left)/r.width*2-1,-((e.clientY-r.top)/r.height*2-1));ray.setFromCamera(mouse,camera);const hit=ray.intersectObject(earth,false)[0];if(hit){const n=hit.point.normalize();setPoint(Math.asin(T.MathUtils.clamp(n.y,-1,1))*180/Math.PI,Math.atan2(n.z,n.x)*180/Math.PI);}});
 }
 function animate(){if(dead)return;raf=requestAnimationFrame(animate);if(orbit)orbit.update();renderer.render(scene,camera);}
 try{init();animate();}catch(err){root.innerHTML='<p style="padding:16px;color:#b42318">Không thể khởi tạo mô hình 3D: '+String(err.message||err)+'</p>';return{destroy:function(){dead=true;cancelAnimationFrame(raf);if(renderer)renderer.dispose();}};}
 if(window.ResizeObserver){ro=new ResizeObserver(resize);ro.observe(stage);}else window.addEventListener("resize",resize);
 const la=el.querySelector("[data-lat]"),lo=el.querySelector("[data-lon]");la.addEventListener("input",()=>setPoint(+la.value,state.lon));lo.addEventListener("input",()=>setPoint(state.lat,+lo.value));
 el.querySelectorAll("[data-preset]").forEach(b=>b.addEventListener("click",()=>{const v=b.dataset.preset.split(",").map(Number);setPoint(v[0],v[1]);}));
 el.querySelector("[data-reset]").addEventListener("click",()=>setPoint(21,105));el.querySelector("[data-home]").addEventListener("click",()=>{if(orbit){camera.position.set(5.4,3.2,6.8);orbit.target.set(0,0,0);orbit.update();}});
 el.querySelectorAll("[data-layer]").forEach(c=>c.addEventListener("change",()=>{const k=c.dataset.layer;if(k==="lat")latGroup.visible=c.checked;if(k==="lon")lonGroup.visible=c.checked;if(k==="eq")eq.visible=c.checked;if(k==="prime")prime.visible=c.checked;if(k==="axis")axis.visible=c.checked;}));
 const panel=el.querySelector("[data-panel]"),toggle=el.querySelector("[data-toggle]");toggle.addEventListener("click",()=>{const fold=panel.classList.toggle("fold");toggle.setAttribute("aria-expanded",String(!fold));el.querySelector("[data-arrow]").textContent=fold?"＋":"−";});
 update();
 return{destroy:function(){if(dead)return;dead=true;cancelAnimationFrame(raf);if(ro)ro.disconnect();else window.removeEventListener("resize",resize);if(orbit)orbit.dispose();if(scene)scene.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material){if(Array.isArray(o.material))o.material.forEach(m=>m.dispose());else o.material.dispose();}});if(renderer){renderer.dispose();renderer.domElement.remove();}root.innerHTML="";}};
};
})();