/* EDUVERSE GAMES — four independent activity spaces */
(function(){
"use strict";
const $=(root,s)=>root.querySelector(s);
const esc=s=>String(s??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const quiz={
 "Địa lí":[
  ["Đường vĩ tuyến gốc có giá trị bao nhiêu?",["0°","90°","180°"],0],
  ["Lớp vỏ Trái Đất nằm ở đâu?",["Trong cùng","Ngoài cùng","Giữa nhân và manti"],1],
  ["Dụng cụ xác định phương hướng trên bản đồ?",["La bàn","Nhiệt kế","Áp kế"],0],
  ["Hiện tượng nào hình thành do sự dịch chuyển đột ngột của vỏ Trái Đất?",["Thủy triều","Động đất","Gió mùa"],1],
  ["Đại dương lớn nhất thế giới là?",["Ấn Độ Dương","Đại Tây Dương","Thái Bình Dương"],2]
 ],
 "Lịch sử":[
  ["Tư liệu hiện vật là loại tư liệu nào?",["Truyền thuyết","Di tích, đồ vật","Lời kể"],1],
  ["Người tối cổ đã biết sử dụng công cụ chủ yếu làm từ?",["Đá","Sắt","Đồng"],0],
  ["Văn Lang gắn với các vua nào?",["Hùng Vương","An Dương Vương","Ngô Quyền"],0],
  ["Chiến thắng Bạch Đằng năm 938 gắn với ai?",["Lê Hoàn","Ngô Quyền","Trần Hưng Đạo"],1],
  ["Một thế kỉ có bao nhiêu năm?",["10","100","1.000"],1]
 ],
 "Khoa học tự nhiên":[
  ["Đơn vị đo lực là?",["Niutơn","Jun","Oát"],0],
  ["Nước tinh khiết sôi ở nhiệt độ bao nhiêu tại áp suất chuẩn?",["0°C","50°C","100°C"],2],
  ["Cơ quan nào thực hiện quang hợp ở thực vật?",["Rễ","Lá","Hoa"],1],
  ["Hạt mang điện tích âm là?",["Proton","Neutron","Electron"],2],
  ["Chất nào là khí ở điều kiện thường?",["Oxygen","Sắt","Muối ăn"],0]
 ],
 "Toán học":[
  ["Tổng ba góc trong một tam giác bằng?",["90°","180°","360°"],1],
  ["Số nguyên tố nhỏ nhất là?",["1","2","3"],1],
  ["25% của 200 bằng?",["25","50","75"],1],
  ["Diện tích hình chữ nhật được tính bằng?",["Dài + rộng","Dài × rộng","2 × (dài + rộng)"],1],
  ["Giá trị của 3² + 4² là?",["12","25","49"],1]
 ],
 "Ngữ văn":[
  ["Từ nào là từ láy?",["Long lanh","Nhà cửa","Xe đạp"],0],
  ["Biện pháp tu từ so sánh thường dùng từ nào?",["Như","Nhưng","Vì"],0],
  ["Thành phần chính của câu gồm?",["Chủ ngữ và vị ngữ","Trạng ngữ và phụ chú","Khởi ngữ và tình thái"],0],
  ["Từ đồng nghĩa là những từ có nghĩa?",["Trái ngược","Gần giống nhau","Hoàn toàn khác nhau"],1],
  ["Văn bản tự sự chủ yếu kể về?",["Sự việc","Đặc điểm","Cảm xúc"],0]
 ],
 "Ngoại ngữ":[
  ["Choose the correct plural: one child, two …",["childs","children","childes"],1],
  ["Bonjour means …",["Good morning / hello","Good night","Goodbye"],0],
  ["The opposite of 'ancient' is …",["Modern","Old","Historic"],0],
  ["Choose the correct form: She … to school.",["go","goes","going"],1],
  ["'Merci' is used to say …",["Please","Sorry","Thank you"],2]
 ]
};
const techniques=[
 ["ĐỘNG NÃO","brainstorm"],["TRẠM","stations"],["MẢNH GHÉP","jigsaw"],["TRANH LUẬN PHẢN BIỆN","debate"],["PHÒNG TRANH","gallery"]
];
let root=null,view="home",group="",room=null,channel=null,role="",presence={},qIndex=0,score=0,answers=[],quizMode="",memory=[],flipped=[],matched=[],moves=0,brainIdeas=[],stations=[],jigsaw=[],claims=[],gallery=[],activeTechnique="";
function shell(title,body,back=true){
 root.innerHTML='<div class="games-head">'+(back?'<button class="games-back" data-back>‹</button>':'')+'<h1>'+title+'</h1></div>'+body;
 const b=$ (root,"[data-back]"); if(b)b.onclick=()=>{if(view==="play"){view=group==="Trò chơi giải trí"?"entertain":"list";}else if(view==="career"){view="rooms";}else if(view==="list"||view==="entertain"||view==="techniques"||view==="rooms"){view="home";}else if(view==="room"){leaveRoom();view="rooms";}else{view="home";}render();};
}
function card(name,icon,action){return '<button class="games-card" data-open="'+esc(action)+'"><span class="games-icon">'+icon+'</span><b>'+name+'</b></button>';}
function mount(el){root=el;view="home";group="";render();}
function render(){
 if(!root)return;
 if(view==="home"){
  shell("TRÒ CHƠI",'<div class="games-grid">'+card("TRÒ CHƠI MÔN HỌC","▤","subject")+card("TRÒ CHƠI TƯƠNG TÁC","♟","interactive")+card("TRÒ CHƠI GIẢI TRÍ","◇","entertain")+card("KỸ THUẬT DẠY HỌC","▦","techniques")+'</div>',false);
  root.querySelectorAll("[data-open]").forEach(b=>b.onclick=()=>{view=b.dataset.open==="subject"?"list":b.dataset.open==="interactive"?"rooms":b.dataset.open==="entertain"?"entertain":"techniques";render();});
  return;
 }
 if(view==="list"){
  shell("TRÒ CHƠI MÔN HỌC",'<div class="games-grid">'+Object.keys(quiz).map((n,i)=>card(n,["◎","◷","⚗","∑","文","A"][i],n)).join("")+'</div>');
  root.querySelectorAll("[data-open]").forEach(b=>b.onclick=()=>startQuiz(b.dataset.open,"subject"));
  return;
 }
 if(view==="rooms"){
  shell("TRÒ CHƠI TƯƠNG TÁC",'<div class="games-panel"><div class="games-actions"><button class="games-primary" id="createRoom">TẠO PHÒNG</button></div><div class="games-field"><label>MÃ PHÒNG</label><input id="roomCode" inputmode="numeric" maxlength="6"></div><button class="games-secondary" id="joinRoom">THAM GIA</button></div><div class="games-grid">'+card("CAREER ARENA","★","career")+card("ĐẤU TRƯỜNG KIẾN THỨC","✦","quick")+card("THỬ THÁCH ĐỒNG ĐỘI","♟","quick")+card("PHÒNG THOÁT HIỂM","⌑","quick")+card("NHẬP VAI TÌNH HUỐNG","◉","quick")+'</div>');
  const create=$ (root,"#createRoom"),join=$ (root,"#joinRoom");
  create.onclick=()=>connectRoom(true);
  join.onclick=()=>connectRoom(false);
  root.querySelectorAll('[data-open="quick"]').forEach(b=>b.onclick=()=>connectRoom(true));
  root.querySelectorAll('[data-open="career"]').forEach(b=>b.onclick=()=>{view="career";render();});
  return;
 }
 if(view==="room"){renderRoom();return;}
 if(view==="career"){shell("CAREER ARENA",'<div class="career-arena-frame"><iframe title="Career Arena – Đấu trường nghề nghiệp" src="https://historyandgeegraphyeducation.github.io/Career-Arena/room.html?embed=eduverse" loading="lazy" allow="autoplay; fullscreen" allowfullscreen></iframe></div>');return;}
 if(view==="entertain"){
  shell("TRÒ CHƠI GIẢI TRÍ",'<div class="games-grid">'+card("TRÍ NHỚ","▦","memory")+card("SUDOKU","▥","sudoku")+card("GHÉP HÌNH","▧","jigsaw")+card("MÊ CUNG","⌁","maze")+card("QUAN SÁT","◉","observe")+card("PHẢN XẠ","ϟ","reaction")+'</div>');
  root.querySelectorAll("[data-open]").forEach(b=>b.onclick=()=>startEntertainment(b.dataset.open));
  return;
 }
 if(view==="memory"){renderMemory();return;}
 if(view==="sudoku"||view==="maze"||view==="observe"||view==="reaction"||view==="jigsaw"){renderCasual();return;}
 if(view==="techniques"){
  shell("KỸ THUẬT DẠY HỌC",'<div class="games-grid">'+techniques.map((t,i)=>card(t[0],["✳","▤","◫","⚖","▧"][i],t[1])).join("")+'</div>');
  root.querySelectorAll("[data-open]").forEach(b=>b.onclick=()=>{activeTechnique=b.dataset.open;view="technique";renderTechnique();});
  return;
 }
 if(view==="technique"){renderTechnique();return;}
 if(view==="play"){renderQuiz();return;}
}
function startQuiz(subject,mode){
 group=subject;quizMode=mode;qIndex=0;score=0;answers=[];view="play";render();
}
function renderQuiz(){
 const list=quiz[group]||quiz["Địa lí"],q=list[qIndex];
 if(!q){shell(group,'<div class="games-result"><strong>'+score+'/'+list.length+'</strong><h2>KẾT QUẢ</h2><button class="games-primary" id="again">CHƠI LẠI</button></div>');$("#",root);$ (root,"#again").onclick=()=>startQuiz(group,quizMode);return;}
 shell(group,'<div class="games-progress"><span>'+String(qIndex+1).padStart(2,"0")+'</span><span>'+list.length+'</span></div><div class="games-question">'+esc(q[0])+'</div><div class="games-options">'+q[1].map((x,i)=>'<button data-answer="'+i+'">'+esc(x)+'</button>').join("")+'</div><div class="games-score">'+score+'</div>');
 root.querySelectorAll("[data-answer]").forEach(b=>b.onclick=()=>{if(answers[qIndex]!==undefined)return;const v=Number(b.dataset.answer);answers[qIndex]=v;if(v===q[2])score++;root.querySelectorAll("[data-answer]").forEach((x,i)=>{x.disabled=true;x.classList.toggle("correct",i===q[2]);x.classList.toggle("wrong",i===v&&v!==q[2]);});setTimeout(()=>{qIndex++;renderQuiz();},650);});
}
function startEntertainment(type){view=type;if(type==="memory"){memory=[1,1,2,2,3,3,4,4,5,5,6,6].sort(()=>Math.random()-.5);flipped=[];matched=[];moves=0;renderMemory();}else renderCasual();}
function renderMemory(){
 shell("TRÍ NHỚ",'<div class="memory-meta"><span>'+moves+'</span><span>'+matched.length+'/6</span></div><div class="memory-grid">'+memory.map((v,i)=>'<button class="memory-card '+(flipped.includes(i)||matched.includes(i)?"revealed":"")+'" data-card="'+i+'">'+(flipped.includes(i)||matched.includes(i)?["","●","◆","▲","■","★","✚"][v]:"")+'</button>').join("")+'</div><button class="games-secondary" id="resetMemory">CHƠI LẠI</button>');
 root.querySelectorAll("[data-card]").forEach(b=>b.onclick=()=>{const i=+b.dataset.card;if(flipped.includes(i)||matched.includes(i)||flipped.length===2)return;flipped.push(i);renderMemory();if(flipped.length===2){moves++;if(memory[flipped[0]]===memory[flipped[1]]){matched.push(...flipped);flipped=[];renderMemory();}else setTimeout(()=>{flipped=[];renderMemory();},700);}});
 $("#",root);$ (root,"#resetMemory").onclick=()=>startEntertainment("memory");
}
function renderCasual(){
 const title={sudoku:"SUDOKU",maze:"MÊ CUNG",observe:"QUAN SÁT",reaction:"PHẢN XẠ",jigsaw:"GHÉP HÌNH"}[view]||"TRÒ CHƠI";
 let body="";
 if(view==="sudoku"){const nums=[1,2,3,4,3,4,1,2,2,1,4,3,4,3,2,1];body='<div class="sudoku-grid">'+nums.map((n,i)=>'<button data-sudoku="'+i+'">'+n+'</button>').join("")+'</div>';}
 if(view==="maze"){body='<div class="maze-grid">'+Array.from({length:25},(_,i)=>'<button data-maze="'+i+'">'+(i===0?"●":i===24?"◆":"")+'</button>').join("")+'</div>';}
 if(view==="observe"){body='<div class="observe-row"><span>▲</span><span>●</span><span>■</span><span>◆</span><span>▲</span><span>●</span></div><div class="games-options"><button data-observe="▲">▲</button><button data-observe="●">●</button><button data-observe="■">■</button><button data-observe="◆">◆</button></div>';}
 if(view==="reaction"){body='<button class="reaction-target" id="reaction">BẮT ĐẦU</button><div id="reactionScore" class="games-score">0</div>';}
 if(view==="jigsaw"){body='<div class="puzzle-grid">'+["1","2","3","4","5","6","7","8",""].map((n,i)=>'<button data-puzzle="'+i+'">'+n+'</button>').join("")+'</div><button class="games-secondary" id="shufflePuzzle">TRỘN</button>';}
 shell(title,body);
 if(view==="sudoku")root.querySelectorAll("[data-sudoku]").forEach(b=>b.onclick=()=>{b.textContent=(+b.textContent%4)+1;});
 if(view==="maze"){let pos=0;root.querySelectorAll("[data-maze]").forEach(b=>b.onclick=()=>{const i=+b.dataset.maze;if(i===pos+1||i===pos+5){pos=i;b.textContent=i===24?"◆":"●";if(i===24)b.classList.add("correct");}});}
 if(view==="observe")root.querySelectorAll("[data-observe]").forEach(b=>b.onclick=()=>{b.classList.toggle("correct",b.dataset.observe==="▲");});
 if(view==="reaction"){let t=0;const b=$ (root,"#reaction");b.onclick=()=>{if(!t){t=Date.now();b.textContent="NHẤN LẠI";}else{$ (root,"#reactionScore").textContent=(Date.now()-t)+" ms";t=0;b.textContent="BẮT ĐẦU";}};}
 if(view==="jigsaw")$ (root,"#shufflePuzzle").onclick=()=>{const arr=[1,2,3,4,5,6,7,8,""];arr.sort(()=>Math.random()-.5);root.querySelectorAll("[data-puzzle]").forEach((b,i)=>b.textContent=arr[i]);};
}
function renderTechnique(){
 const data={
 brainstorm:["ĐỘNG NÃO",'<div class="games-field"><label>CHỦ ĐỀ</label><input id="topic"></div><div class="games-field"><label>Ý TƯỞNG</label><textarea id="idea"></textarea></div><button class="games-primary" id="addIdea">THÊM Ý TƯỞNG</button><div class="idea-board">'+brainIdeas.map(x=>'<div class="idea-card">'+esc(x)+'</div>').join("")+'</div>'],
 stations:["TRẠM",'<div class="games-field"><label>TÊN TRẠM</label><input id="stationName"></div><div class="games-field"><label>NHIỆM VỤ</label><textarea id="stationTask"></textarea></div><button class="games-primary" id="addStation">THÊM TRẠM</button><div class="station-list">'+stations.map((x,i)=>'<div class="station-card"><b>'+esc(x.name)+'</b><p>'+esc(x.task)+'</p><button data-done="'+i+'">HOÀN THÀNH</button></div>').join("")+'</div>'],
 jigsaw:["MẢNH GHÉP",'<div class="games-field"><label>CHỦ ĐỀ CHUNG</label><input id="jigsawTopic"></div><div class="games-field"><label>NHÓM CHUYÊN GIA</label><textarea id="expertGroups"></textarea></div><div class="games-field"><label>NHÓM GHÉP</label><textarea id="homeGroups"></textarea></div><button class="games-primary" id="saveJigsaw">LƯU PHÂN NHÓM</button><div class="idea-board">'+jigsaw.map(x=>'<div class="idea-card">'+esc(x)+'</div>').join("")+'</div>'],
 debate:["TRANH LUẬN PHẢN BIỆN",'<div class="games-field"><label>VẤN ĐỀ TRANH LUẬN</label><input id="debateTopic"></div><div class="games-field"><label>LUẬN ĐIỂM</label><textarea id="claim"></textarea></div><div class="games-field"><label>BẰNG CHỨNG</label><textarea id="evidence"></textarea></div><button class="games-primary" id="addClaim">THÊM LUẬN ĐIỂM</button><div class="idea-board">'+claims.map(x=>'<div class="idea-card">'+esc(x)+'</div>').join("")+'</div>'],
 gallery:["PHÒNG TRANH",'<div class="games-field"><label>TÊN SẢN PHẨM</label><input id="posterTitle"></div><div class="games-field"><label>NỘI DUNG / LIÊN KẾT</label><textarea id="posterBody"></textarea></div><button class="games-primary" id="addPoster">TRƯNG BÀY</button><div class="gallery-board">'+gallery.map(x=>'<article class="gallery-card"><h3>'+esc(x.title)+'</h3><p>'+esc(x.body)+'</p><textarea placeholder="Nhận xét"></textarea></article>').join("")+'</div>']
 };
 const d=data[activeTechnique];shell(d[0],'<div class="games-panel">'+d[1]+'</div>');
 const bind=(id,fn)=>{const e=$ (root,"#"+id);if(e)e.onclick=fn;};
 bind("addIdea",()=>{const v=$ (root,"#idea").value.trim();if(v){brainIdeas.push(v);renderTechnique();}});
 bind("addStation",()=>{const name=$ (root,"#stationName").value.trim(),task=$ (root,"#stationTask").value.trim();if(name){stations.push({name,task,done:false});renderTechnique();}});
 root.querySelectorAll("[data-done]").forEach(b=>b.onclick=()=>{stations[+b.dataset.done].done=!stations[+b.dataset.done].done;b.classList.toggle("correct",stations[+b.dataset.done].done);});
 bind("saveJigsaw",()=>{jigsaw.push("CHỦ ĐỀ: "+$ (root,"#jigsawTopic").value+" | CHUYÊN GIA: "+$ (root,"#expertGroups").value+" | NHÓM GHÉP: "+$ (root,"#homeGroups").value);renderTechnique();});
 bind("addClaim",()=>{claims.push($ (root,"#debateTopic").value+" — "+$ (root,"#claim").value+" | "+$ (root,"#evidence").value);renderTechnique();});
 bind("addPoster",()=>{gallery.push({title:$ (root,"#posterTitle").value,body:$ (root,"#posterBody").value});renderTechnique();});
}
async function connectRoom(host){
 const auth=window.EduverseAuth;
 if(!auth||!auth.getRealtimeClient){alert("Không thể kết nối Supabase.");return;}
 const code=host?String(Math.floor(100000+Math.random()*900000)):$ (root,"#roomCode").value.trim();
 if(!/^\d{6}$/.test(code)){alert("Mã phòng gồm 6 chữ số.");return;}
 if(channel){try{await auth.getRealtimeClient().removeChannel(channel);}catch(e){}}
 const client=auth.getRealtimeClient();role=host?"host":"player";room={code,players:[],question:0,score:0,subject:"Địa lí"};
 channel=client.channel("eduverse-game-"+code,{config:{broadcast:{self:false},presence:{key:Math.random().toString(36).slice(2)}}});
 channel.on("presence",{event:"sync"},()=>{presence=channel.presenceState();renderRoom();});
 channel.on("broadcast",{event:"start"},({payload})=>{group=payload.subject||"Địa lí";qIndex=0;score=0;view="room";renderRoom();});
 channel.on("broadcast",{event:"question"},({payload})=>{qIndex=payload.index;group=payload.subject;renderRoom();});
 channel.on("broadcast",{event:"answer"},({payload})=>{if(role==="host"){room.players.push(payload);renderRoom();}});
 channel.subscribe(async status=>{if(status==="SUBSCRIBED"){await channel.track({role,joined_at:new Date().toISOString()});view="room";renderRoom();}});
}
function renderRoom(){
 if(!room)return;
 const people=Object.values(presence).flat();
 const list=quiz[group]||quiz["Địa lí"],q=list[qIndex];
 let body='<div class="room-code">'+room.code+'</div><div class="room-people">'+people.length+'</div><button class="games-secondary" id="exitRoom">RỜI PHÒNG</button>';
 if(role==="host"){
  body+='<button class="games-primary" id="startRoom">BẮT ĐẦU</button><button class="games-secondary" id="nextRoom">CÂU TIẾP</button><div class="room-scores">'+room.players.map(p=>'<p>'+esc(p.name||"Người chơi")+' · '+p.score+'</p>').join("")+'</div>';
 }else if(q){
  body+='<div class="games-question">'+esc(q[0])+'</div><div class="games-options">'+q[1].map((x,i)=>'<button data-room-answer="'+i+'">'+esc(x)+'</button>').join("")+'</div>';
 }else body+='<div class="games-result">ĐANG CHỜ GIÁO VIÊN</div>';
 shell("PHÒNG "+room.code,body,false);
 const exit=$ (root,"#exitRoom");if(exit)exit.onclick=async()=>{await leaveRoom();view="rooms";render();};
 const start=$ (root,"#startRoom");if(start)start.onclick=async()=>{group=room.subject; qIndex=0;await channel.send({type:"broadcast",event:"start",payload:{subject:group}});await channel.send({type:"broadcast",event:"question",payload:{subject:group,index:0}});renderRoom();};
 const next=$ (root,"#nextRoom");if(next)next.onclick=async()=>{qIndex=(qIndex+1)%list.length;await channel.send({type:"broadcast",event:"question",payload:{subject:group,index:qIndex}});renderRoom();};
 root.querySelectorAll("[data-room-answer]").forEach(b=>b.onclick=async()=>{const v=+b.dataset.roomAnswer;await channel.send({type:"broadcast",event:"answer",payload:{name:"Người chơi",score:v===q[2]?1:0}});root.querySelectorAll("[data-room-answer]").forEach(x=>x.disabled=true);});
}
async function leaveRoom(){if(channel){try{await window.EduverseAuth.getRealtimeClient().removeChannel(channel);}catch(e){}channel=null;}room=null;presence={};}
window.EduverseGames={mount};
})();