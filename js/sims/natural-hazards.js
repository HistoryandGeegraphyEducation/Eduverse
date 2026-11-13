/* EDUVERSE | 5 mô phỏng thiên tai và biến đổi môi trường — Three.js */
(function(){
"use strict";
const T=window.THREE;
const DEFINITIONS={
 "bao-nhiet-doi":{
  title:"Bão nhiệt đới",param:"Tốc độ gió",min:40,max:220,step:5,value:120,unit:"km/h",
  stages:["Nhiễu động nhiệt đới","Áp thấp nhiệt đới","Bão phát triển","Bão suy yếu"],
  explain:[
   "Không khí nóng ẩm trên biển bốc lên, tạo vùng áp thấp và mây dông. Nhiễu động ban đầu chưa nhất thiết phát triển thành bão.",
   "Áp thấp mạnh lên khi điều kiện khí quyển và đại dương thuận lợi. Gió xoáy quanh tâm áp thấp tăng dần.",
   "Hệ thống có hoàn lưu xoáy rõ, dải mây mưa cuộn quanh tâm. Mắt bão có thể hình thành ở những cơn bão đủ mạnh.",
   "Bão thường suy yếu khi đi vào đất liền, vùng biển lạnh hơn hoặc gặp điều kiện khí quyển bất lợi."
  ],
  stat:"Gió cực đại mô phỏng",note:"Mô hình khái niệm về cấu trúc và diễn biến bão; không phải công cụ dự báo đường đi hay cường độ bão."
 },
 "lu-quet":{
  title:"Lũ quét",param:"Lượng mưa",min:0,max:250,step:5,value:120,unit:"mm",
  stages:["Mưa trên lưu vực","Dòng chảy tập trung","Lũ dâng nhanh","Nước và bùn đá tràn qua"],
  explain:[
   "Mưa rơi trên sườn dốc và lưu vực. Một phần nước thấm xuống đất, phần còn lại chảy tràn trên bề mặt.",
   "Nước từ các sườn dốc tập trung vào khe suối và lòng dẫn. Địa hình dốc làm dòng chảy tăng tốc.",
   "Lưu lượng tăng nhanh trong thời gian ngắn. Dòng nước có thể cuốn theo đất, đá, cây gãy và vật liệu rời.",
   "Dòng lũ bùn đá tràn qua khu vực thấp ven suối, gây xói lở và phá hủy công trình. Mức độ phụ thuộc nhiều yếu tố."
  ],
  stat:"Lượng mưa tích lũy",note:"Mô hình giản lược quá trình dòng chảy trong lưu vực nhỏ; không dùng để dự báo ngưỡng lũ tại địa phương."
 },
 "sat-lo-dat":{
  title:"Sạt lở đất",param:"Độ bão hòa đất",min:10,max:100,step:5,value:65,unit:"%",
  stages:["Sườn dốc ổn định","Đất thấm nước","Sức chống trượt giảm","Khối đất trượt xuống"],
  explain:[
   "Khối đất nằm trên sườn dốc. Trạng thái ổn định phụ thuộc độ dốc, cấu trúc đất đá, nước trong đất và các tác động bên ngoài.",
   "Nước mưa thấm vào đất làm tăng độ ẩm và có thể tăng áp lực nước lỗ rỗng. Trọng lượng khối đất cũng tăng.",
   "Khi lực gây trượt vượt quá sức chống trượt dọc mặt yếu, sườn dốc mất ổn định. Mặt trượt có thể nằm sâu bên dưới bề mặt.",
   "Khối đất đá dịch chuyển xuống chân dốc. Hình thái trượt thực tế có thể khác nhau tùy vật liệu, địa chất và địa hình."
  ],
  stat:"Độ bão hòa đất",note:"Mô hình minh họa cơ chế mất ổn định sườn dốc; không thể hiện đầy đủ địa chất công trình của một điểm sạt lở cụ thể."
 },
 "xam-nhap-man":{
  title:"Xâm nhập mặn",param:"Lưu lượng nước ngọt",min:10,max:100,step:5,value:55,unit:"%",
  stages:["Dòng sông nước ngọt","Triều đẩy nước mặn vào","Ranh mặn dịch chuyển","Nước ngọt đẩy mặn ra"],
  explain:[
   "Nước sông chảy từ thượng nguồn ra biển. Nước ngọt có khối lượng riêng nhỏ hơn nước biển và tạo dòng chảy hướng ra cửa sông.",
   "Khi triều lên hoặc dòng nước ngọt suy giảm, nước mặn có thể đi sâu hơn vào cửa sông và các nhánh kênh.",
   "Ranh giới mặn – ngọt dịch chuyển theo tương quan giữa dòng chảy sông, thủy triều, hình dạng lòng dẫn và điều kiện cửa sông.",
   "Khi dòng nước ngọt tăng, khả năng đẩy ranh mặn ra phía biển có thể lớn hơn. Xâm nhập mặn còn có thể xảy ra trong tầng nước ngầm."
  ],
  stat:"Lưu lượng nước ngọt tương đối",note:"Mặt cắt mô phỏng sự phân tầng và lan truyền nước mặn trong cửa sông; không phải bản đồ ranh mặn hay mô hình thủy lực định lượng."
 },
 "nuoc-bien-dang":{
  title:"Nước biển dâng",param:"Mực nước biển tăng",min:0,max:2,step:.05,value:.8,unit:"m",
  stages:["Mực nước nền","Mực nước tăng","Vùng trũng bị ngập","Đường bờ dịch chuyển"],
  explain:[
   "Đường bờ và vùng thấp ven biển được xác định bởi địa hình, thủy triều và mực nước biển tại thời điểm quan sát.",
   "Mực nước biển trung bình tăng làm cao trình mặt nước nền dịch chuyển lên. Mô hình dùng thang đo phóng đại để dễ quan sát.",
   "Các khu vực có cao độ thấp hơn mực nước mới có nguy cơ bị ngập thường xuyên hoặc ngập khi kết hợp triều và sóng.",
   "Đường bờ có thể dịch chuyển vào đất liền. Mức độ thực tế còn phụ thuộc địa hình, sụt lún, bồi tụ, xói lở và công trình bảo vệ."
  ],
  stat:"Mực nước biển tăng",note:"Không đồng nhất nước biển dâng dài hạn với ngập do triều, nước dâng do bão hoặc sóng thần."
 }
};
function mount(root,id){
 const D=DEFINITIONS[id];if(!D||!T){root.textContent="Không thể tải mô hình 3D. Hãy kiểm tra kết nối và khả năng hỗ trợ WebGL.";return{destroy:function(){}};}
 let dead=false,raf=0,renderer=null,scene=null,camera=null,controls=null,resizeObs=null,resizeFn=null,elapsed=0,last=0,playing=true,mode=0,quality=1;
 const objects={};const mats=[],geos=[];
 const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
 const V=(x,y,z)=>new T.Vector3(x,y,z);
 const material=(color,extra)=>{const m=new T.MeshStandardMaterial(Object.assign({color:color,roughness:.88},extra||{}));mats.push(m);return m;};
 const mesh=(geo,mat,parent)=>{geos.push(geo);const m=new T.Mesh(geo,mat);(parent||scene).add(m);return m;};
 const group=(parent)=>{const g=new T.Group();(parent||scene).add(g);return g;};
 const box=(w,h,d,color,x,y,z,parent,extra)=>{const m=mesh(new T.BoxGeometry(w,h,d),material(color,extra),parent);m.position.set(x,y,z);return m;};
 const sphere=(r,color,x,y,z,parent,scale)=>{const m=mesh(new T.SphereGeometry(r,22,16),material(color),parent);m.position.set(x,y,z);if(scale)m.scale.set(scale[0],scale[1],scale[2]);return m;};
 const line=(pts,color,r,parent)=>{const curve=new T.CatmullRomCurve3(pts.map(p=>V(p[0],p[1],p[2])));return mesh(new T.TubeGeometry(curve,Math.max(24,pts.length*8),r,7,false),material(color,{roughness:.7}),parent);};
 function terrain(fn,w,d,nx,nz){
  const g=new T.PlaneGeometry(w,d,nx,nz);g.rotateX(-Math.PI/2);const p=g.attributes.position,cols=[];
  for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i),y=fn(x,z);p.setY(i,y);const h=clamp((y+.3)/5,0,1);const c=new T.Color(0x596f4c).lerp(new T.Color(0x9a9a70),h);cols.push(c.r,c.g,c.b);}
  g.setAttribute("color",new T.Float32BufferAttribute(cols,3));g.computeVertexNormals();
  const m=mesh(g,new T.MeshStandardMaterial({vertexColors:true,roughness:1,side:T.DoubleSide}));m.receiveShadow=true;return m;
 }
 function tree(x,y,z,s,parent){
  const g=group(parent);const trunk=mesh(new T.CylinderGeometry(.07*s,.11*s,.9*s,7),material(0x60472e),g);trunk.position.set(x,y+.45*s,z);
  for(let i=0;i<3;i++){const crown=sphere(.38*s,0x47704a,x+(i-1)*.09*s,y+(.95+i*.18)*s,z,g,[1,1.15,1]);crown.material.color.setHex(i===1?0x527e4d:0x416843);}
  return g;
 }
 function house(x,y,z,s,parent){
  const g=group(parent);box(.9*s,.75*s,.8*s,0xd9d3bd,x,y+.38*s,z,g);const roof=mesh(new T.ConeGeometry(.78*s,.48*s,4),material(0x8a5544),g);roof.position.set(x,y+.98*s,z);roof.rotation.y=Math.PI/4;return g;
 }
 function cloud(x,y,z,s,parent,color){
  const g=group(parent);for(let i=0;i<6;i++){const r=(.35+(i%3)*.11)*s;const c=sphere(r,color||0xe7eceb,x+(i-2.5)*.32*s,y+Math.sin(i*1.4)*.12*s,z+Math.cos(i)*.12*s,g);c.material.roughness=1;}g.position.set(x,y,z);return g;
 }
 function waterPlane(w,d,color,y,parent,opacity){
  const m=mesh(new T.PlaneGeometry(w,d,48,32),material(color,{transparent:opacity!==undefined,opacity:opacity===undefined?1:opacity,roughness:.3,metalness:.05,side:T.DoubleSide,depthWrite:opacity===undefined}),parent);
  m.rotation.x=-Math.PI/2;m.position.y=y;return m;
 }
 function label(text,x,y,z){
  const el=document.createElement("div");el.className="nh-label";el.textContent=text;el.dataset.pos=x+","+y+","+z;uiStage.appendChild(el);labels.push(el);
 }
 const labels=[];
 function addTerrainGrid(){
  const grid=new T.GridHelper(28,28,0x66808b,0x9aaeb2);grid.position.y=-.03;grid.material.transparent=true;grid.material.opacity=.18;scene.add(grid);
 }
 function buildStorm(){
  terrain((x,z)=>-.1+.07*Math.sin(x*.4)*Math.cos(z*.35),26,20,70,54);
  waterPlane(30,24,0x286d8b,-.08);
  const land=mesh(new T.CircleGeometry(5.8,64),material(0x71815b),scene);land.rotation.x=-Math.PI/2;land.position.set(7,.02,0);
  for(let i=0;i<12;i++){const a=i/12*Math.PI*2;tree(7+Math.cos(a)*3.7,.05,Math.sin(a)*3.7,.65,scene);}
  const swirl=group(scene);objects.swirl=swirl;
  for(let band=0;band<5;band++){
   const pts=[];for(let i=0;i<=90;i++){const t=i/90*Math.PI*4.7+band*.45,r=1.4+t*.29;pts.push([Math.cos(t)*r,2.1+band*.12,Math.sin(t)*r]);}
   line(pts,band%2?0xc7d7db:0xf1f3ed,.18,swirl);
  }
  for(let i=0;i<34;i++){const a=i*2.399,r=2.3+(i%9)*.37;const c=cloud(Math.cos(a)*r,2.1+(i%4)*.16,Math.sin(a)*r,.8+(i%3)*.15,swirl,0xe8eeee);objects.clouds=(objects.clouds||[]).concat(c);}
  objects.eye=sphere(.55,0x345d70,0,1.9,0,swirl,[1,.22,1]);
  objects.rain=[];
  for(let i=0;i<100;i++){const r=2.5+(i%10)*.42,a=i*2.4;const d=mesh(new T.CylinderGeometry(.012,.012,.42,5),material(0x9bc9dc,{transparent:true,opacity:.65}),scene);d.position.set(Math.cos(a)*r,1.4+(i%7)*.35,Math.sin(a)*r);objects.rain.push(d);}
  for(let i=0;i<8;i++)cloud(-10+i*2.7,4.4+(i%2)*.4,-7,.95,scene,0xe1e8e8);
  label("TÂM BÃO",0,2.8,0);label("DẢI MÂY XOẮN",-6,3,-5);label("VÙNG BIỂN ẤM",9,.4,7);
 }
 function buildFlood(){
  const h=(x,z)=>.25+Math.max(0,Math.abs(x)*.22+Math.abs(z)*.14)+1.2*Math.exp(-((x+5)*(x+5))/22)+.6*Math.exp(-((z-2)*(z-2))/15);
  terrain(h,26,20,80,60);
  const river=waterPlane(2.5,23,0x3986a4,.18);river.position.set(1,.2,0);objects.river=river;
  const flood=waterPlane(8,22,0x4a9fbd,.28,scene,.62);flood.position.set(1,.28,0);objects.flood=flood;
  objects.rain=[];
  for(let i=0;i<90;i++){const d=mesh(new T.CylinderGeometry(.012,.012,.4,5),material(0xa8d5e5,{transparent:true,opacity:.6}),scene);d.position.set(-12+(i*7%240)/10,2+(i%8)*.5,-9+(i*13%180)/10);objects.rain.push(d);}
  objects.houses=[];for(let i=0;i<7;i++){const x=(i%2?4:-5)+(i%3)*.7,z=-7+Math.floor(i/2)*4;objects.houses.push(house(x,h(x,z),z,.75,scene));}
  objects.trees=[];for(let i=0;i<16;i++){const x=-11+(i*17%220)/10,z=-9+(i*11%180)/10;objects.trees.push(tree(x,h(x,z),z,.6,scene));}
  label("SƯỜN DỐC", -8,4,-6);label("KHE SUỐI",1,1,0);label("VÙNG THẤP",6,1,6);
 }
 function buildSlide(){
  const h=(x,z)=>.35+Math.max(0,x*.34)+.18*Math.sin(z*.7);terrain(h,26,20,80,60);
  // mặt cắt địa tầng ở phía trước
  for(let k=0;k<4;k++){const pts=[];for(let i=0;i<=20;i++){const x=-10+i;pts.push([x,h(x,8)-.6-k*.55,8]);}line(pts,[0x8c7658,0xa18a67,0x6e6553,0x9c9a80][k],.065);}
  const slip=[];for(let i=0;i<=24;i++){const x=-1+i*.22;slip.push([x,h(x,0)-.45-Math.sin(i/24*Math.PI)*.55,0]);}line(slip,0x493d35,.1);
  objects.mass=group(scene);const slab=mesh(new T.BoxGeometry(5,.72,5),material(0x887354),objects.mass);slab.position.set(1,0,0);slab.rotation.z=-.12;
  for(let i=0;i<5;i++){tree(-.8+(i%3)*1.1,h(-.8+(i%3)*1.1,-1+Math.floor(i/3)*1.8),-1+Math.floor(i/3)*1.8,.65,objects.mass);}
  objects.cracks=[];for(let i=0;i<6;i++){const x=-6+i*2;objects.cracks.push(line([[x,h(x,0)+.08,0],[x+.25,h(x,0)+.1,.4],[x+.45,h(x,0)-.15,.8]],0x342f29,.035));}
  label("KHỐI ĐẤT TRƯỢT",1,4,0);label("MẶT TRƯỢT",-1,1,5);label("CHÂN DỐC",8,1,4);
 }
 function buildSalt(){
  // Mặt cắt cửa sông: bờ hai bên, lòng dẫn ở giữa
  const bed=mesh(new T.BoxGeometry(28,.7,8),material(0x9c8b69));bed.position.set(0,-1.1,0);
  box(28,2.1,4,0x6f805e,0,0,6);
  box(28,2.1,4,0x6f805e,0,0,-6);
  const fresh=waterPlane(27,7,0x4a9fc0,.05,scene,.82);fresh.position.z=0;objects.fresh=fresh;
  const wedge=mesh(new T.BoxGeometry(16,1.2,6),material(0x1b6d99,{transparent:true,opacity:.68,depthWrite:false}));wedge.position.set(6,-.45,0);objects.wedge=wedge;
  const halocline=line([[-12,-.15,0],[-7,-.28,0],[-2,-.48,0],[3,-.72,0],[8,-.78,0],[13,-.8,0]],0xb8d9d4,.045);
  objects.halocline=halocline;
  for(let i=0;i<8;i++){const x=-11+i*3.1;const arrow=mesh(new T.ConeGeometry(.16,.7,8),material(0xe1f1ed));arrow.position.set(x,.42,0);arrow.rotation.z=-Math.PI/2;objects.flow=(objects.flow||[]).concat(arrow);}
  label("THƯỢNG NGUỒN",-9,1.7,0);label("RANH MẶN – NGỌT",1,1.5,0);label("CỬA BIỂN",10,1.7,0);label("NƯỚC MẶN",-1,-1.5,0);
 }
 function buildSea(){
  const h=(x,z)=>.1+Math.max(0,x+7)*.17+.22*Math.sin(z*.6);terrain(h,28,20,80,60);
  const sea=waterPlane(30,22,0x287b9c,0,scene,.8);sea.position.set(-8,0,0);objects.sea=sea;
  objects.houses=[];for(let i=0;i<10;i++){const x=-2+(i%5)*2.2,z=-7+Math.floor(i/5)*8;objects.houses.push(house(x,h(x,z),z,.8,scene));}
  objects.trees=[];for(let i=0;i<14;i++){const x=-10+(i*13%210)/10,z=-8+(i*7%160)/10;objects.trees.push(tree(x,h(x,z),z,.55,scene));}
  const marker=mesh(new T.BoxGeometry(1,.05,20),material(0xf1d9a0));marker.position.set(-1,.04,0);objects.shore=marker;
  label("BIỂN", -10,1,0);label("VÙNG TRŨNG VEN BIỂN",3,2,5);label("ĐẤT CAO",10,4,-5);
 }
 function makeScene(){
  if(id==="bao-nhiet-doi")buildStorm();
  if(id==="lu-quet")buildFlood();
  if(id==="sat-lo-dat")buildSlide();
  if(id==="xam-nhap-man")buildSalt();
  if(id==="nuoc-bien-dang")buildSea();
  addTerrainGrid();
 }
 function updateModel(){
  const v=Number(slider.value),n=(v-D.min)/(D.max-D.min);
  value.textContent=(D.unit==="m"?v.toFixed(2):Math.round(v))+ " "+D.unit;
  statValue.textContent=(D.unit==="m"?v.toFixed(2):Math.round(v))+" "+D.unit;
  stageName.textContent="GIAI ĐOẠN "+(mode+1)+" · "+D.stages[mode].toUpperCase();
  explain.textContent=D.explain[mode];
  stageButtons.querySelectorAll("button").forEach((b,i)=>b.classList.toggle("on",i===mode));
  if(id==="bao-nhiet-doi"){objects.swirl.scale.setScalar(.72+n*.48);objects.eye.visible=mode>=2;objects.rain.forEach((r,i)=>r.visible=mode>0&&i<Math.floor(20+n*80));}
  if(id==="lu-quet"){objects.flood.position.y=.12+n*1.5;objects.flood.scale.set(1+n*.9,1,1+n*.3);objects.river.material.color.setHex(n>.55?0x806b50:0x3986a4);objects.rain.forEach((r,i)=>r.visible=mode>0&&i<Math.floor(n*90));}
  if(id==="sat-lo-dat"){objects.mass.position.set(-.5-n*3,mode===3?-.4-n*.8:0,0);objects.mass.rotation.z=-.12-n*.22;objects.cracks.forEach((c,i)=>c.visible=mode>0&&i<Math.floor(n*6));}
  if(id==="xam-nhap-man"){const intrusion=1.2+(1-n)*10+(mode===2?2:0);objects.wedge.scale.x=intrusion/16;objects.wedge.position.x=8-intrusion*.42;objects.halocline.scale.x=.7+intrusion/12;objects.flow.forEach((a,i)=>{a.visible=mode!==1||i%2===0;a.material.color.setHex(n>.6?0xc5e6e5:0xe1f1ed);});}
  if(id==="nuoc-bien-dang"){const rise=v*.85;objects.sea.position.y=rise;objects.shore.position.x=-1+v*3.8;objects.houses.forEach((h,i)=>{h.children.forEach(c=>{if(c.geometry&&c.geometry.type==="BoxGeometry")c.material.color.setHex(h.position.y<rise?0x9eaaad:0xd9d3bd);});});}
 }
 function updateLabels(){
  if(!camera||!renderer)return;const rect=canvas.getBoundingClientRect();
  labels.forEach(el=>{const p=el.dataset.pos.split(",").map(Number),v=V(p[0],p[1],p[2]).project(camera);el.style.left=((v.x*.5+.5)*rect.width)+"px";el.style.top=((-v.y*.5+.5)*rect.height)+"px";el.style.display=v.z<1?"block":"none";});
 }
 root.className+=" natural-hazard";
 root.innerHTML='<style>'+
 '.natural-hazard{display:block!important;width:100%;max-width:100%;min-width:0;color:#203746;font-family:Arial,sans-serif}.nh-layout{display:grid;grid-template-columns:minmax(0,1fr);gap:12px;width:100%;min-width:0}.nh-stage{position:relative;height:clamp(270px,58vh,570px);height:clamp(270px,58svh,570px);min-width:0;overflow:hidden;border-radius:16px;background:#8eabb5;box-shadow:0 7px 20px rgba(14,37,49,.18)}.nh-stage canvas{display:block;width:100%;height:100%;touch-action:none}.nh-label{position:absolute;transform:translate(-50%,-50%);padding:4px 7px;border-radius:5px;background:rgba(20,43,54,.78);color:#f3f5ef;font-size:10px;font-weight:700;letter-spacing:.04em;white-space:nowrap;pointer-events:none;text-shadow:0 1px 2px #142c38}.nh-panel{min-width:0;border-radius:15px;background:linear-gradient(180deg,#f7f9fa,#e7edf0);box-shadow:0 5px 15px rgba(16,42,55,.12);overflow:hidden}.nh-panel summary{display:flex;align-items:center;justify-content:space-between;min-height:46px;padding:11px 14px;color:#203c4b;font-size:14px;font-weight:700;cursor:pointer;list-style:none}.nh-panel summary::-webkit-details-marker{display:none}.nh-panel summary:after{content:"＋";font-size:18px}.nh-panel[open] summary:after{content:"−"}.nh-controls{display:grid;gap:11px;padding:0 13px 13px}.nh-actions,.nh-stages{display:flex;gap:7px;flex-wrap:wrap}.natural-hazard button{border:0;border-radius:9px;min-height:39px;padding:8px 12px;background:#dbe5e9;color:#244354;font-weight:700;font-size:13px}.natural-hazard button.primary{background:#315f72;color:#fff}.natural-hazard button.on{background:#315f72;color:#fff}.nh-param{display:grid;grid-template-columns:1fr auto;gap:7px 12px;align-items:center;font-size:13px;font-weight:700}.nh-param input{grid-column:1/-1;width:100%;accent-color:#416f80}.nh-param output{font-variant-numeric:tabular-nums;color:#315f72}.nh-readout{padding:11px 12px;border-radius:10px;background:#e0e9ed;color:#263f4c}.nh-readout small{display:block;margin-bottom:5px;color:#59717c;font-size:10px;font-weight:700;letter-spacing:.06em}.nh-readout b{font-size:14px}.nh-explain{font-size:13px;line-height:1.55;color:#304854}.nh-note{padding:9px 10px;border-left:3px solid #7895a1;background:#edf1f2;color:#526772;font-size:11px;line-height:1.45}.nh-error{position:absolute;inset:0;display:grid;place-items:center;padding:22px;background:#203746;color:#fff;text-align:center;font-size:14px;line-height:1.5}@media(min-width:900px){.nh-layout{grid-template-columns:minmax(0,1.65fr) minmax(245px,.7fr);align-items:start}.nh-stage{height:min(68vh,570px);height:min(68svh,570px)}.nh-panel{display:contents}.nh-panel summary{display:none}.nh-controls{grid-column:2;grid-row:1;padding:13px;border-radius:15px;background:linear-gradient(180deg,#f7f9fa,#e7edf0);box-shadow:0 5px 15px rgba(16,42,55,.12)}}@media(max-width:420px){.nh-stage{height:clamp(255px,54vh,430px);height:clamp(255px,54svh,430px)}.nh-label{font-size:9px;padding:3px 5px}.nh-controls{padding:0 10px 11px}.natural-hazard button{font-size:12px;padding:8px 10px}}@media(orientation:landscape) and (max-height:520px){.nh-stage{height:clamp(220px,62vh,350px);height:clamp(220px,62svh,350px)}}'+
 '</style><section class="nh-layout"><div class="nh-stage"><canvas aria-label="'+D.title+'"></canvas><div class="nh-error" hidden></div></div><details class="nh-panel"><summary>Điều khiển mô phỏng</summary><div class="nh-controls"><div class="nh-actions"><button class="primary" data-play>Ⅱ Tạm dừng</button><button data-reset>↺ Đặt lại</button><button data-view>Đổi góc nhìn</button></div><div class="nh-stages"></div><label class="nh-param"><span>'+D.param+'</span><output></output><input type="range" min="'+D.min+'" max="'+D.max+'" step="'+D.step+'" value="'+D.value+'"></label><div class="nh-readout"><small>'+D.stat+'</small><b data-stat></b></div><div><div class="nh-readout"><small data-stage-name></small><div class="nh-explain"></div></div></div><div class="nh-note">'+D.note+'</div></div></details></section>';
 const uiStage=root.querySelector(".nh-stage"),canvas=root.querySelector("canvas"),err=root.querySelector(".nh-error"),panel=root.querySelector(".nh-panel"),stageButtons=root.querySelector(".nh-stages"),slider=root.querySelector("input[type=range]"),value=root.querySelector(".nh-param output"),statValue=root.querySelector("[data-stat]"),stageName=root.querySelector("[data-stage-name]"),explain=root.querySelector(".nh-explain");
 D.stages.forEach((s,i)=>{const b=document.createElement("button");b.type="button";b.textContent=(i+1)+". "+s;b.dataset.mode=i;if(i===0)b.className="on";stageButtons.appendChild(b);});
 const compact=window.matchMedia("(max-width: 899px)");panel.open=!compact.matches;const syncDrawer=e=>{panel.open=!e.matches;};if(compact.addEventListener)compact.addEventListener("change",syncDrawer);else compact.addListener(syncDrawer);
 function resize(){if(!renderer||!camera)return;const w=Math.max(1,uiStage.clientWidth),h=Math.max(1,uiStage.clientHeight);renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,window.innerWidth<600?1.15:1.5));renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();updateLabels();}
 function setMode(m){mode=clamp(m,0,3);updateModel();}
 try{
  if(!T.WebGLRenderer)throw new Error("Thiết bị không hỗ trợ WebGL.");
  renderer=new T.WebGLRenderer({canvas:canvas,antialias:window.innerWidth>600,alpha:false,powerPreference:"low-power"});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.35));renderer.setClearColor(0x9bb8c4,1);
  if("outputColorSpace" in renderer&&T.SRGBColorSpace)renderer.outputColorSpace=T.SRGBColorSpace;
  scene=new T.Scene();scene.background=new T.Color(0x9bb8c4);scene.fog=new T.Fog(0x9bb8c4,24,62);
  camera=new T.PerspectiveCamera(43,1,.1,120);camera.position.set(17,15,22);
  if(T.OrbitControls){controls=new T.OrbitControls(camera,canvas);controls.enableDamping=true;controls.dampingFactor=.07;controls.minDistance=7;controls.maxDistance=55;controls.maxPolarAngle=Math.PI*.49;controls.target.set(0,1,0);}
  scene.add(new T.HemisphereLight(0xe3f2f4,0x53614d,1.45));const sun=new T.DirectionalLight(0xfff0d6,1.8);sun.position.set(-12,24,15);scene.add(sun);const fill=new T.DirectionalLight(0x91b9cf,.65);fill.position.set(14,8,-12);scene.add(fill);
  makeScene();resize();updateModel();
  resizeObs=window.ResizeObserver?new ResizeObserver(resize):null;if(resizeObs)resizeObs.observe(uiStage);
  resizeFn=resize;window.addEventListener("resize",resizeFn,{passive:true});window.addEventListener("orientationchange",resizeFn,{passive:true});
 }catch(e){err.hidden=false;err.textContent="Không thể khởi tạo mô hình 3D: "+e.message+" Hãy kiểm tra kết nối và khả năng hỗ trợ WebGL.";return{destroy:function(){dead=true;if(renderer)renderer.dispose();}};}
 stageButtons.addEventListener("click",e=>{const b=e.target.closest("button[data-mode]");if(b)setMode(Number(b.dataset.mode));});
 slider.addEventListener("input",updateModel);
 root.querySelector("[data-play]").addEventListener("click",e=>{playing=!playing;e.currentTarget.textContent=playing?"Ⅱ Tạm dừng":"▶ Tiếp tục";});
 root.querySelector("[data-reset]").addEventListener("click",()=>{elapsed=0;playing=false;mode=0;slider.value=D.value;camera.position.set(17,15,22);if(controls){controls.target.set(0,1,0);controls.update();}updateModel();root.querySelector("[data-play]").textContent="▶ Tiếp tục";});
 root.querySelector("[data-view]").addEventListener("click",()=>{camera.position.set(camera.position.z,camera.position.y,-camera.position.x);if(controls)controls.update();});
 function animate(now){if(dead)return;raf=requestAnimationFrame(animate);const dt=Math.min(.05,Math.max(0,(now-last)/1000||.016));last=now;if(playing){elapsed+=dt;
  if(objects.swirl)objects.swirl.rotation.y+=dt*(.12+Number(slider.value)/2200);
  if(objects.rain)objects.rain.forEach((r,i)=>{r.position.y-=dt*(3+(i%5));if(r.position.y<-.1)r.position.y=4.8+(i%4)*.3;});
  if(objects.flood){objects.flood.material.opacity=.48+.08*Math.sin(elapsed*2);objects.rain.forEach((r,i)=>{r.position.y-=dt*(2.4+i%4);if(r.position.y<-.2)r.position.y=4+(i%5)*.3;});}
  if(objects.mass&&mode===3){objects.mass.position.x=-.5-Number(slider.value)/100*3-.12*Math.sin(elapsed*2);}
  if(objects.flow)objects.flow.forEach((a,i)=>{a.position.x+=dt*.22;if(a.position.x>13)a.position.x=-13;});
  if(objects.sea)objects.sea.position.z=Math.sin(elapsed*.45)*.12;
  if(objects.wedge)objects.wedge.material.opacity=.58+.08*Math.sin(elapsed);
 }
 if(controls)controls.update();renderer.render(scene,camera);if(Math.floor(now/90)%2===0)updateLabels();}
 raf=requestAnimationFrame(animate);
 return{destroy:function(){if(dead)return;dead=true;if(raf)cancelAnimationFrame(raf);if(resizeObs)resizeObs.disconnect();if(resizeFn){window.removeEventListener("resize",resizeFn);window.removeEventListener("orientationchange",resizeFn);}if(compact.removeEventListener)compact.removeEventListener("change",syncDrawer);else compact.removeListener(syncDrawer);if(controls)controls.dispose();if(scene)scene.traverse(o=>{if(o.geometry&&!geos.includes(o.geometry))o.geometry.dispose();if(o.material&&!mats.includes(o.material)){const a=Array.isArray(o.material)?o.material:[o.material];a.forEach(m=>m.dispose());}});geos.forEach(g=>g.dispose());mats.forEach(m=>m.dispose());if(renderer){renderer.dispose();renderer.forceContextLoss();}root.classList.remove("natural-hazard");}};
}
window.simNaturalHazard=mount;
})();
