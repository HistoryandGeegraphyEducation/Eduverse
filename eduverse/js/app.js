// ===== LƯU TRỮ (có try/catch) =====
const store = {
  get(k,d){
    try{
      const v=localStorage.getItem(k);
      return v?JSON.parse(v):d;
    }catch(e){return d;}
  },
  set(k,v){
    try{
      localStorage.setItem(k,JSON.stringify(v));
    }catch(e){}
  }
};
let user=store.get("ev_user",null);

const S={
  tab:"home",subj:null,grade:null,
  part:"Lịch Sử",csub:null,croom:null,csim:null
};
const $=s=>document.querySelector(s);
const main=$("#main");

const esc=s=>String(s??"").replace(
  /[&<>"]/g,
  c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c])
);
// ===== QUẢN LÝ TRẠNG THÁI =====
const STATUS_TAGS={
  "coming-soon":["Coming Soon","coming"],
  "open-test":["Open Test","test"],
  "new":["New","new"],
  "new-version":["New Version","version"]
};

const STATUS_DURATION={
  "open-test":12*60*60*1000,
  "new":7*24*60*60*1000,
  "new-version":72*60*60*1000
};

const statusTag=status=>{
  const tag=STATUS_TAGS[status];
  return tag
    ?`<span class="status-ribbon ${tag[1]}">${tag[0]}</span>`
    :"";
};
function getSimStatusTag(sim){
  const status=sim.status||"coming-soon";

  if(status==="coming-soon"){
    return statusTag(status);
  }

  const duration=STATUS_DURATION[status];
  const start=Date.parse(sim.statusAt||"");

  if(!duration||!Number.isFinite(start)){
    return "";
  }

  if(Date.now()>=start+duration){
    return "";
  }

  return statusTag(status);
}

function toast(t){
  const el=$("#toast");
  el.textContent=t;
  el.classList.add("show");
  clearTimeout(toast.t);
  toast.t=setTimeout(
    ()=>el.classList.remove("show"),1800
  );
}

const sName=id=>SUBJECTS.find(s=>s.id===id).n;
// ===== MÀN HÌNH =====
let prevDepth=0,hdObs=null;

function depthOf(){
  if(S.tab==="cat")
    return (S.csub?1:0)+(S.croom?1:0)+(S.csim?1:0);

  if(S.tab!=="home") return 0;
  if(S.subj==="lsdl"&&S.grade) return 2;
  if(S.subj==="lsdl") return 1;
  return 0;
}

function render(){
  if(curSim){
    curSim.destroy();
    curSim=null;
  }

  document.querySelectorAll("nav button")
    .forEach(b=>b.classList.toggle("on",b.dataset.t===S.tab));

  main.scrollTop=0;
  main.className="main";

  const d=depthOf();
  main.dataset.dir=d>prevDepth?"f":d<prevDepth?"b":"n";
  prevDepth=d;

  ({home:vHome,learn:vLearn,cat:vCat,
    practice:vPractice,me:vMe})[S.tab]();

  main.querySelectorAll(".subj,.gpill,.row,.box,.sec,.tool")
    .forEach((e,i)=>e.style.setProperty("--i",i));

  setHdh();
}
function setHdh(){
  if(hdObs){
    hdObs.disconnect();
    hdObs=null;
  }

  const hd=main.querySelector(".hd");
  if(!hd) return;

  const set=()=>{
    main.style.setProperty("--hdh",hd.offsetHeight+"px");
  };

  set();

  if(window.ResizeObserver){
    hdObs=new ResizeObserver(set);
    hdObs.observe(hd);
  }
}

function vHome(){
  if(S.subj==="lsdl"&&S.grade) return vLessons();
  if(S.subj==="lsdl") return vGrades();

  main.innerHTML=`<div class="subjects">`+
    SUBJECTS.map(s=>
      `<button class="subj ${s.live?"live":""}" data-s="${s.id}">`+
      `${statusTag(s.status||(s.live?"":"coming-soon"))}`+
      `<span class="e"><i>${s.e}</i>`+
      `<img src="assets/img/subject/${s.id}.png" alt="" `+
      `onload="this.previousElementSibling.style.display='none'" `+
      `onerror="this.remove()"></span><span>${s.n}</span></button>`
    ).join("")+`</div>`;

  // Logo động môn Lịch sử và Địa lí (js/history-logo.js)
  if(window.HistoryLogo) HistoryLogo.mountAll(main);
  if(window.ArtLogos) ArtLogos.mountAll(main);

  main.querySelectorAll("[data-s]").forEach(b=>
    b.onclick=()=>openSubject(b.dataset.s)
  );
}
function openSubject(id){
  if(id!=="lsdl"){
    toast(sName(id)+" – sắp ra mắt");
    return;
  }

  S.tab="home";
  S.subj=id;
  S.grade=null;
  render();
}

function crumb(text,onBack){
  return `<div class="crumb">`+
    `<button class="back" id="bk">← Quay lại</button>`+
    `<span>${text}</span></div>`;
}

function vGrades(){
  const ic=GRADE_ICONS[S.subj]||{};

  main.innerHTML=`<h1 class="title">${sName("lsdl")}</h1>`+
    `<div class="grades">`+
    GRADES.map(g=>
      `<button class="gpill" data-g="${g}">`+
      `<img class="gi l" alt="Lịch sử" src="${(ic[g]||["",""])[0]}">`+
      `<span class="gt">LỚP ${g}</span>`+
      `<img class="gi r" alt="Địa lí" src="${(ic[g]||["",""])[1]}">`+
      `</button>`
    ).join("")+`</div>`;
      main.querySelectorAll("[data-g]").forEach(b=>
    b.onclick=()=>{
      const g=+b.dataset.g;

      if(!CONTENT["lsdl-"+g]){
        return toast("Lớp "+g+" – sắp có");
      }

      S.grade=g;
      render();
    }
  );
}

function countBefore(part,ci){
  let c=0;
  const ch=CONTENT["lsdl-"+S.grade][part];

  for(let i=0;i<ci;i++){
    c+=ch[i][1].length;
  }

  return c;
}
function vLessons(){
  const key="lsdl-"+S.grade;
  const parts=CONTENT[key];

  main.className="main lessons";

  const sec=(part,label)=>{
    const list=parts[part].map(([title,ls],ci)=>
      `<details class="chap"><summary>${esc(title)}</summary>`+
      ls.map((l,li)=>{
        const no=part==="Lịch Sử"
          ?countBefore(part,ci)+li+1
          :countBefore(part,ci)+li;

        const text=title==="Bài mở đầu"
          ?l:`Bài ${no}. ${l}`;

        return `<button class="lesson" data-t="${esc(text)}">`+
          `${esc(text)}</button>`;
      }).join("")+
      `</details>`
    ).join("");
        return `<section class="sec">`+
      `<div class="labrow"><div class="lab">`+
      `<img src="assets/img/ui/banner-${part==="Lịch Sử"?"lichsu":"diali"}.jpg" `+
      `alt="${label}" onerror="this.replaceWith(document.createTextNode(this.alt))">`+
      `</div></div><div class="panel">${list}</div></section>`;
  };

  main.innerHTML=`<div class="hd">`+
    `<h1 class="t1">${sName("lsdl")}</h1>`+
    `<button class="t2" id="gr" aria-label="Chọn lớp khác">`+
    `LỚP ${S.grade}</button></div>`+
    sec("Lịch Sử","LỊCH SỬ")+
    sec("Địa Lí","ĐỊA LÍ");

  $("#gr").onclick=()=>{
    S.grade=null;
    render();
  };
    main.querySelectorAll(".lesson").forEach(b=>
    b.onclick=()=>toast("Nội dung bài học sắp có")
  );

  main.querySelectorAll("details.chap").forEach(d=>
    d.addEventListener("toggle",()=>{
      if(d.open){
        d.querySelectorAll(".lesson").forEach((l,i)=>
          l.style.setProperty("--j",Math.min(i,10))
        );
      }
    })
  );
}

function vLearn(){
  main.innerHTML=`<div class="crumb"><span>HỌC TẬP</span></div>`+
    `<div class="box">🏛️ LỊCH SỬ VÀ ĐỊA LÍ – LỚP 6`+
    `<p>Các bài Lịch sử và Địa lí lớp 6.</p>`+
    `<button class="cta" id="go">Vào học</button></div>`;

  $("#go").onclick=()=>{
    S.tab="home";
    S.subj="lsdl";
    S.grade=6;
    render();
  };
}
// ===== DANH SÁCH HỌC LIỆU THEO PHÒNG =====
function vSimList(){
  main.className="main lessons";

  const list=(SIMS[S.csub]||[])
    .filter(s=>s.type===S.croom);

  const roomNames={
    "MÔ PHỎNG":"PHÒNG MÔ PHỎNG",
    "TRƯNG BÀY":"PHÒNG TRƯNG BÀY",
    "BẢO TÀNG":"PHÒNG BẢO TÀNG",
    "BẢN ĐỒ":"PHÒNG BẢN ĐỒ",
    "DÒNG THỜI GIAN":"PHÒNG DÒNG THỜI GIAN",
    "KHÁM PHÁ ĐỊA PHƯƠNG":"PHÒNG KHÁM PHÁ ĐỊA PHƯƠNG"
  };

  const grades=[...new Set(list.map(s=>s.grade))]
    .sort((a,b)=>a-b);

  const title=roomNames[S.croom]||"DANH SÁCH HỌC LIỆU";
    main.innerHTML=`<div class="hd">`+
    `<h1 class="t1">${title}</h1>`+
    `<button class="back" id="rb">← Quay lại</button></div>`+
    (list.length
      ?grades.map(g=>
        `<div class="simhead">LỚP ${g}</div><div class="simlist">`+
        list.filter(s=>s.grade===g).map(s=>
          `<button class="simrow" data-id="${s.id}">`+
          `${getSimStatusTag(s)}`+
          `<span class="si"><i>${s.icon}</i>`+
          `${s.img?`<img src="${s.img}" alt="" onerror="this.remove()">`:""}`+
          `</span><span class="stx">`+
          `<b>${esc(s.title)}</b>`+
          `<small>${esc(s.type||s.lesson||"")}</small>`+
          `</span><span class="sc">›</span></button>`
        ).join("")+
        `</div>`
      ).join("")
      :`<div class="box">Phòng này chưa có học liệu được đăng ký.</div>`
    );
      $("#rb").onclick=()=>{
    S.croom=null;
    render();
  };

  main.querySelectorAll(".simrow").forEach(b=>
    b.onclick=()=>{
      S.csim=b.dataset.id;
      render();
    }
  );
}

function vSim(){
  main.className="main lessons";

  const sim=(SIMS[S.csub]||[])
    .find(x=>x.id===S.csim);

  if(!sim){
    S.csim=null;
    return vSimList();
  }
    main.innerHTML=`<div class="hd">`+
    `<h1 class="t1">${esc(sim.title.toUpperCase())}</h1>`+
    `<button class="back" id="rb">← Quay lại</button>`+
    `</div><div class="simroot" id="simroot"></div>`;

  $("#rb").onclick=()=>{
    S.csim=null;
    render();
  };

  curSim=typeof sim.mount==="function"
    ?sim.mount($("#simroot"))
    :null;
}

function vCat(){
  main.className="main lessons";

  if(S.csub){
    return S.csim?vSim():(
      S.croom?vSimList():vRooms()
    );
  }
    main.innerHTML=`<div class="hd">`+
    `<h1 class="t1">CÔNG CỤ DẠY HỌC</h1></div>`+
    `<div class="subjects csub">`+
    SUBJECTS.map(s=>
      `<button class="subj ${ROOMS[s.id]?"live":""}" data-s="${s.id}">`+
      `${statusTag(s.status||(s.live?"":"coming-soon"))}`+
      `<span class="e"><i>${s.e}</i>`+
      `<img src="assets/img/subject/${s.id}.png" alt="" `+
      `onload="this.previousElementSibling.style.display='none'" `+
      `onerror="this.remove()"></span>`+
      `<span>${s.n}</span></button>`
    ).join("")+
    `</div>`+
    // Nhóm THỰC HÀNH KỸ THUẬT – khu vực riêng, nằm dưới nhóm môn học
    `<section class="psec" aria-labelledby="ptitle">`+
    `<h2 class="ptitle" id="ptitle">THỰC HÀNH KỸ THUẬT</h2>`+
    `<div class="ptags">`+
    PRACTICE_TAGS.map(p=>
      `<button class="ptag" data-p="${esc(p.id)}">`+
      `${statusTag(p.status)}`+
      `<span class="e">${p.e}</span><span>${esc(p.n)}</span></button>`
    ).join("")+
    `</div></section>`;

  // Logo động môn Lịch sử và Địa lí (js/history-logo.js)
  if(window.HistoryLogo) HistoryLogo.mountAll(main);
  if(window.ArtLogos) ArtLogos.mountAll(main);

  main.querySelectorAll("[data-p]").forEach(b=>
    b.onclick=()=>{
      const p=PRACTICE_TAGS.find(x=>x.id===b.dataset.p);
      // Chưa có nội dung được triển khai cho nhóm này
      toast(p.n+" – sắp ra mắt");
    }
  );
      main.querySelectorAll("[data-s]").forEach(b=>
    b.onclick=()=>{
      const id=b.dataset.s;

      if(!ROOMS[id]){
        return toast(sName(id)+" – sắp ra mắt");
      }

      S.csub=id;
      render();
    }
  );
}

// ===== PHÂN PHÒNG THEO TAG HỌC LIỆU =====
function vRooms(){
  const roomTypes={
    "Phòng mô phỏng":"MÔ PHỎNG",
    "Phòng trưng bày":"TRƯNG BÀY",
    "Phòng bảo tàng":"BẢO TÀNG",
    "Phòng bản đồ":"BẢN ĐỒ",
    "Phòng dòng thời gian":"DÒNG THỜI GIAN",
    "Phòng khám phá địa phương":"KHÁM PHÁ ĐỊA PHƯƠNG"
  };

  const sims=SIMS[S.csub]||[];
    main.innerHTML=`<div class="hd">`+
    `<h1 class="t1">${sName(S.csub)}</h1>`+
    `<button class="back" id="rb">← Quay lại</button>`+
    `</div><div class="tools">`+
    ROOMS[S.csub].map(t=>{
      const type=roomTypes[t.n];
      const count=type
        ?sims.filter(s=>s.type===type).length
        :0;

      return `<button class="tool" data-type="${esc(type||"")}" `+
        `${count?"":"disabled"}>`+
        `${statusTag(t.status||(count?"":"coming-soon"))}`+
        (t.img
          ?`<span class="timg" style="background:linear-gradient(160deg,${t.c[0]},${t.c[1]})"><i>${t.e}</i><img src="${t.img}" alt="" onerror="this.remove()"></span>`
          :`<span class="ti" style="background:linear-gradient(160deg,${t.c[0]},${t.c[1]})">${t.e}</span>`
        )+
        `<b>${esc(t.n)}</b>`+
        (count?`<em class="on">${count} học liệu</em>`:`<em>Sắp có</em>`) +
        `</button>`;
    }).join("")+
    `</div>`;
      $("#rb").onclick=()=>{
    S.csub=null;
    render();
  };

  main.querySelectorAll(".tool:not(:disabled)").forEach(b=>
    b.onclick=()=>{
      S.croom=b.dataset.type;
      S.csim=null;
      render();
    }
  );
}

function vPractice(){
  main.innerHTML=`<div class="crumb"><span>LUYỆN TẬP</span></div>`+
    `<div class="box">🎮 Trò chơi ôn tập`+
    `<p>Câu đố, ô chữ và thi đấu kiến thức sẽ có ở bản cập nhật tiếp theo.</p>`+
    `</div>`;
}
function vMe(){
  if(user){
    main.innerHTML=`<div class="crumb"><span>CÁ NHÂN</span></div>`+
      `<div class="box">👤 ${esc(user)}`+
      `<button class="cta" id="out">Đăng xuất</button></div>`;

    $("#out").onclick=()=>{
      user=null;
      store.set("ev_user",null);
      toast("Đã đăng xuất");
      vMe();
    };
  }else{
    main.innerHTML=`<div class="crumb"><span>CÁ NHÂN</span></div>`+
      `<div class="box">Bạn chưa đăng nhập`+
      `<p>Đăng nhập để dùng đầy đủ tính năng.</p>`+
      `<button class="cta" id="in">Đăng nhập</button></div>`;

    $("#in").onclick=()=>auth("login");
  }
}
// ===== ĐĂNG NHẬP / ĐĂNG KÝ =====
function auth(mode){
  const reg=mode==="reg";

  $("#sheet").innerHTML=
    `<h2>${reg?"ĐĂNG KÝ":"ĐĂNG NHẬP"}</h2>`+
    (reg?`<input id="fn" placeholder="Họ và tên" autocomplete="name">`:"")+
    `<input id="fe" placeholder="Email hoặc tên đăng nhập" autocomplete="username">`+
    `<input id="fp" type="password" placeholder="Mật khẩu" `+
    `autocomplete="${reg?"new-password":"current-password"}">`+
    `<div class="btns">`+
    `<button class="no" id="c">Huỷ</button>`+
    `<button class="ok" id="s">${reg?"Tạo tài khoản":"Vào học"}</button>`+
    `</div>`;

  $("#modal").classList.add("show");
    $("#c").onclick=()=>{
    $("#modal").classList.remove("show");
  };

  $("#s").onclick=()=>{
    const e=$("#fe").value.trim();
    const p=$("#fp").value;
    const n=reg?$("#fn").value.trim():"";

    if(!e||p.length<6){
      return toast("Nhập tên đăng nhập và mật khẩu từ 6 ký tự");
    }

    user=n||e;
    store.set("ev_user",user);

    $("#modal").classList.remove("show");
    toast("Xin chào, "+user+"!");

    if(S.tab==="me") vMe();
  };
}

$("#bLogin").onclick=()=>auth("login");
$("#bReg").onclick=()=>auth("reg");

$("#modal").onclick=e=>{
  if(e.target.id==="modal"){
    $("#modal").classList.remove("show");
  }
};
// ===== HIỆU ỨNG CHẠM =====
document.addEventListener("pointerdown",e=>{
  const t=e.target.closest("button, summary");
  if(!t) return;

  try{
    if(navigator.vibrate) navigator.vibrate(8);
  }catch(_){}

  const r=t.getBoundingClientRect();
  const size=Math.max(r.width,r.height)*2;

  const el=document.createElement("span");
  el.className="ripple";

  el.style.cssText=
    `width:${size}px;height:${size}px;`+
    `left:${e.clientX-r.left-size/2}px;`+
    `top:${e.clientY-r.top-size/2}px`;

  t.appendChild(el);
  setTimeout(()=>el.remove(),650);
},{passive:true});
// ===== THANH ĐIỀU HƯỚNG DƯỚI =====
document.querySelectorAll("nav button").forEach(b=>
  b.onclick=()=>{
    if(b.dataset.t==="home"){
      S.subj=null;
      S.grade=null;
    }

    if(b.dataset.t==="cat"){
      S.csub=null;
      S.croom=null;
      S.csim=null;
    }

    S.tab=b.dataset.t;
    render();
  }
);
// ===== MENU TRÒN CHO THANH ĐIỀU HƯỚNG (kiểu Magic Indicator) =====
// Giữ nguyên 5 nút data-t và hàm điều hướng ở trên; chỉ gom chúng vào đĩa tròn
// mở ra từ nút "+". Chấm xanh trượt tới mục đang chỉ/chọn, nghỉ ở tab hiện tại.
(function(){
  const nav=$("#nav");
  if(!nav) return;

  const items=[...nav.querySelectorAll(":scope > button[data-t]")];
  if(!items.length) return;

  const R=78,N=items.length;
  const top=Math.max(0,items.findIndex(b=>b.dataset.t==="home"));
  const mk=(tag,cls,html)=>{
    const e=document.createElement(tag);
    e.className=cls;
    if(html) e.innerHTML=html;
    return e;
  };

  const menu=mk("div","rmenu");
  menu.id="rmenu";
  menu.setAttribute("role","group");
  menu.setAttribute("aria-label","Menu điều hướng");

  const ind=mk("span","rind");
  ind.setAttribute("aria-hidden","true");
  menu.appendChild(ind);

  items.forEach((b,i)=>{
    const a=(-90+(i-top)*360/N)*Math.PI/180;
    b._x=Math.round(R*Math.cos(a));
    b._y=Math.round(R*Math.sin(a));
    b.classList.add("ri");
    b.style.setProperty("--x",b._x+"px");
    b.style.setProperty("--y",b._y+"px");
    b.style.setProperty("--k",i);
    menu.appendChild(b);
  });

  const close=mk("button","rclose",
    `<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>`);
  close.type="button";
  close.setAttribute("aria-label","Đóng menu");
  menu.appendChild(close);

  const tog=mk("button","rtoggle",
    `<svg viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2.2" stroke-linecap="round"><path d="M12 4.5v15M4.5 12h15"/></svg>`);
  tog.type="button";
  tog.setAttribute("aria-label","Mở menu");
  tog.setAttribute("aria-expanded","false");
  tog.setAttribute("aria-controls","rmenu");

  nav.appendChild(menu);
  nav.appendChild(tog);

  const place=b=>{
    if(b) ind.style.transform=`translate(${b._x}px,${b._y}px)`;
  };
  const rest=()=>place(
    items.find(b=>b.classList.contains("on"))||items[top]
  );
  const setOpen=o=>{
    menu.classList.toggle("open",o);
    nav.classList.toggle("ropen",o);
    tog.setAttribute("aria-expanded",String(o));
    if(o) rest();
  };

  tog.addEventListener("click",()=>setOpen(true));
  close.addEventListener("click",()=>{
    setOpen(false);
    tog.focus({preventScroll:true});
  });

  items.forEach(b=>{
    b.addEventListener("pointerenter",()=>place(b));
    b.addEventListener("pointerdown",()=>place(b),{passive:true});
    b.addEventListener("focus",()=>place(b));
    // Chạy sau hàm điều hướng đã gắn ở trên; đóng menu sau khi chấm xanh trượt tới
    b.addEventListener("click",()=>{
      place(b);
      setTimeout(()=>setOpen(false),280);
    });
  });
  menu.addEventListener("pointerleave",rest);

  document.addEventListener("pointerdown",e=>{
    if(menu.classList.contains("open")&&!nav.contains(e.target)){
      setOpen(false);
    }
  });
  document.addEventListener("keydown",e=>{
    if(e.key==="Escape"&&menu.classList.contains("open")){
      setOpen(false);
      tog.focus({preventScroll:true});
    }
  });
})();
// ===== TRÁI ĐẤT QUAY TRONG LOGO (xem mô tả bên dưới) =====
/* =====================================================================
   Logo EDUVERSE – Trái Đất quay (phép chiếu trực giao).
   - Quay từ TRÁI sang PHẢI (Tây → Đông), chu kỳ ~30 giây.
   - Bờ biển giản lược tự dựng từ toạ độ kinh–vĩ độ (đủ nhận ra ở cỡ nhỏ).
   - Đánh dấu Hoàng Sa, Trường Sa (Việt Nam) bằng các điểm nhỏ ở Biển Đông.
   Chỉ điều khiển các phần tử #elLand, #elLake, #elIce, #elCloud, #elDots
   trong <svg class="logo"> (index.html); không đụng module nào khác.
   ===================================================================== */
(function(){
  "use strict";
  var svg=document.querySelector("svg.logo");
  if(!svg) return;
  var elLand=svg.querySelector("#elLand"),elLake=svg.querySelector("#elLake"),
      elIce=svg.querySelector("#elIce"),elCloud=svg.querySelector("#elCloud"),
      elDots=svg.querySelector("#elDots");
  if(!elLand||!elLake||!elIce||!elCloud||!elDots) return;

  var D=Math.PI/180,CX=32,CY=36,R=21;     // tâm và bán kính quả địa cầu trong SVG
  var TILT=18*D;                          // nhìn từ vĩ độ 18°B để thấy rõ Đông Nam Á
  var PERIOD=30;                          // giây / vòng quay
  var START=128;                          // kinh độ ở giữa khi mở trang (Việt Nam hiện từ bên trái)
  var STILL=108;                          // kinh độ khi tắt chuyển động (Việt Nam ở giữa)

  /* ---- Dữ liệu: [kinh độ, vĩ độ, ...] ---- */
  var LAND=[
  [-9,37,-8.9,41.5,-9.3,43.1,-1.8,43.4,-1.2,46.2,-4.7,48.4,-1.5,48.7,-1.3,49.7,1.6,50.9,4.5,52.3,7,53.5,8.6,54,8.2,55.5,8.2,57,10.5,57.7,10.6,56,10,54.5,14,54,19,54.4,21,55.3,21,57,23.5,57.2,24.3,58.4,28,59.5,30,60,26,60.4,22.5,60,21.5,61.5,21.5,63,25,65.2,24.5,65.8,21.4,65,17.7,62.4,17.2,60.7,18.8,59.7,16.7,57.6,16,56.1,14.2,55.4,12.8,55.9,11.7,58.2,11.1,59.2,10.6,59.7,8,58.1,5.7,58.9,5,60.5,5.2,62,8,63.4,10.5,64.6,12.5,66,14.5,68.2,17.5,69.5,21,70.2,25,71,28.5,71,31,70.3,33,69.4,41,67.8,44,68.5,53,68.5,59,69,66,69.5,68,71,73,73,80,72.5,87,74.5,98,76,104,77.7,113,73.7,129,71.5,140,72.5,150,71.5,160,69.7,170,70,180,68.8,190,66,186,64.5,178,64.5,172,60.5,164,60,162,57.5,160,54,158.7,52.8,156.7,51.1,155.7,54.5,156,57,158,59.5,160,61.3,155,59.3,148,59.2,143,59.3,138,56,137.5,54.5,140.5,53.3,140.5,48.5,139,46,135.5,43.5,133,42.8,131,42.5,129.7,40.9,128.5,38.5,129.4,36.8,129.4,35.2,128,34.7,126.4,34.5,126.5,36.7,126.5,37.7,125.2,38.8,124.5,39.8,122,39.2,121.5,40.9,119.5,39.8,118,39.2,117.7,38.6,118.8,37.5,119.2,37.2,120.7,37.8,122.6,37.4,121,36.7,120.3,36,119.2,34.8,120.4,34.5,121,32.5,121.9,31.1,121.9,29.8,121.5,28.2,120.5,27,119.8,25.8,118.8,24.5,117.2,23.5,115,22.7,113.8,22.2,112,21.8,111.5,21.5,110.4,21.2,110.2,20.3,109.9,21.3,109.3,21.5,108.2,21.6,107.4,21,106.8,20.7,106.3,20.2,105.9,19.4,105.7,18.8,106.3,17.9,106.6,17.5,107.6,16.5,108.2,16.1,108.9,15.1,109.1,13.9,109.4,12.9,109.2,11.9,109,11.4,108.1,10.9,107.1,10.4,106.5,9.8,105.9,9.4,105.1,8.7,104.8,8.6,104.8,9.5,105.1,10,104.5,10.4,103.5,10.6,103.5,11.2,102.9,11.7,102.3,12.2,101.4,12.6,100.9,13.4,100.4,13.5,100,13.4,99.9,12.6,99.6,11.3,99.2,10.4,99.3,9.2,100,8.4,100.4,7.2,101.3,6.9,102.1,6.2,102.8,5.4,103.4,4.4,103.4,3.4,103.5,2.7,104.2,1.5,103.5,1.3,102.5,2.2,101.8,2.5,101.3,3,100.6,4.2,100.3,5.5,100.3,6.4,99.9,7.2,98.5,8.2,98.3,9.5,98.7,10.9,98.6,11.7,98.2,13.5,97.7,16.2,97.6,16.5,96.2,16.8,95.4,15.8,94.5,15.9,94.3,16.8,94.3,18.3,93.6,19.5,93,20,92.3,21,91.8,22.3,90.5,22.1,89,21.7,87.5,21.6,86.8,20.7,85.8,19.7,84.5,18.7,83,17.3,81.8,16.4,80.3,15.5,80.2,13.5,79.9,11.6,79.8,10.3,78.9,9.3,78,8.8,77.5,8.1,76.5,9,75.6,11.4,74.7,13,74,15,73.2,17.5,72.8,19,72.9,20.7,72.6,21.5,72,21,70.5,20.8,69,22.4,70.2,22.9,68.3,23.6,67.2,24.1,66.6,25.4,64.6,25.2,61.6,25.2,59.5,25.4,57.3,25.7,56.3,27.1,54.5,26.5,52.5,27.5,51.5,27.9,50.5,29.3,49.5,30.2,48.7,30.1,48,29.4,48.7,28.1,49.5,26.9,50.2,26.2,50.5,25.2,51.5,25.9,51.2,24.6,52,24,54,24.2,55.2,25.2,56.1,26.3,56.5,25.6,57.2,23.9,58.8,23.5,59.8,22.4,58.6,20.4,57.8,19,55.8,17.8,52.5,16.3,49.5,14.8,46.5,13.2,43.7,12.7,43.1,13.5,42.7,15.7,42.7,17.5,41.5,19.3,39.5,21.2,38.4,23.5,37.2,25.2,35.7,27.5,35,28.5,34.9,29.5,34.5,31.3,35,33,35.9,34.6,36.1,36,35.5,36.7,34.6,36.8,33,36.1,31,36.8,29.5,36.2,28,36.7,27.4,37.1,26.5,38.2,26.2,39.5,26.5,40.4,25,40.9,23.8,40.5,23,40,22.9,39.2,24,38.2,23.9,37.9,23,38,22.9,36.4,22.4,36.5,21.7,36.8,21.1,37.8,21.4,38.3,20.8,39.2,19.8,39.9,19.4,41,19.5,42,18.5,42.4,16.4,43.3,15.3,44.1,14.5,45.2,13.6,45.1,12.3,45.3,12.5,44.1,13.6,43.5,14.2,42.2,15.9,41.9,16.2,41.9,17.2,40.7,18.5,40.1,17.1,39.5,16.6,39.3,17.1,39,16.1,38,15.7,37.9,16,39.2,15.7,40,14.9,40.2,14,40.8,13.5,41.3,12.3,41.8,11,42.7,10.2,43.9,9,44.4,8,43.8,7.3,43.7,6,43.1,4.5,43.5,3.2,43.2,3.1,42.2,2.5,41.5,0.9,41,0.2,40,-0.3,39.2,0.2,38.7,-0.7,37.6,-2.1,36.8,-4.4,36.7,-5.6,36,-6.3,36.6,-7.4,37.2],
  [-5.9,35.8,-2,35.1,1,36.5,5,36.8,10,37.2,11,35,10.2,33.5,15,32.3,19,30.3,20,32,25,31.8,29,30.9,32.3,31.3,34.3,31.3,34.9,29.5,34.1,27.9,35,26,36.5,22.5,37.3,18.5,38.8,16,40,15,41,14,43,12.5,43.3,11.6,44.5,10.4,51.2,11.8,51,10,49,6,48,5,44,1.5,41,-1.6,39.4,-4.8,40.5,-10.5,40.5,-15,35,-20,35.5,-24,32.9,-26,32.8,-28,30.8,-30,27,-33.7,20,-34.8,18.4,-34,17,-29,14.5,-22.5,11.8,-17,13.7,-12,12.3,-6,9.5,-1,9.8,3.5,8.5,4.5,5.5,4.4,2,6.3,-4,5.2,-7.5,4.4,-13,8,-17,14.7,-16.5,19.5,-16,24,-13,27.6,-9.8,30,-9.6,32.5,-6.5,34.5],
  [-168,65.6,-162,70.3,-156.5,71.3,-141,69.7,-128,70,-115,68,-108,68.5,-95,71,-85,69.7,-83,68,-87,66.5,-90,64,-94.2,60,-92.5,57,-88,56.2,-85,55.2,-82.4,55,-82.2,52.6,-79.5,51.3,-78.9,54.3,-78.9,57,-77.4,59.5,-77.7,62.2,-73,62.4,-70,61.2,-65,60.3,-62,57.5,-60,55,-57,52,-56,51.5,-60,50.2,-66,50.2,-64.5,48.8,-64.5,46,-61,45.5,-66,43.7,-70,43.7,-70.5,41.8,-74,40.5,-75.5,38,-76,36.8,-75.5,35.3,-78,33.8,-81,31.5,-80,26.8,-80.3,25.2,-81.5,25.9,-82.8,28,-83.7,29.9,-85.3,29.7,-88,30.3,-89.5,29.3,-91.5,29.5,-94,29.5,-97.2,27.5,-97.4,25,-97.7,22.5,-96,19,-94.5,18.2,-91,18.7,-90.5,21,-87,21.5,-87.5,18.5,-88,16.2,-84,15.8,-83.2,14.9,-83.7,10.9,-82.5,9.5,-79.5,9.5,-77.4,8.6,-77.5,8,-80,7.3,-82,8,-85.7,10,-87.7,13,-91.5,14,-94,16,-97.5,15.8,-101.5,17.5,-105.5,19.7,-105.5,22.8,-109,26,-112.8,31.3,-114.8,31.8,-114.7,30,-112.8,28,-110.3,24,-109.5,23,-112,25,-115,28.5,-117.1,32.5,-118.5,34,-120.6,34.5,-122.5,37.5,-124,40.3,-124.5,43,-124,46.2,-124.7,48.3,-123,48.5,-123.5,49.5,-127,50.8,-130,54.5,-134,57,-139,59.5,-144,60,-148,60.2,-152,59,-154,57.5,-158,56.5,-162,55,-165,54.7,-163,55.7,-158,58.5,-162,58.7,-165,60.5,-165,62.5,-161,64.5,-166,64.6],
  [-77.4,8.6,-77.9,7.2,-77.5,4,-79,2,-80.2,-1.5,-81,-4.5,-79.8,-7,-78.2,-9.5,-76.8,-12.5,-75,-15.5,-71.5,-17.7,-70.3,-18.5,-70.3,-23,-70.6,-26,-71.5,-30.5,-71.7,-33.5,-73.5,-37,-73.5,-41.5,-74,-46,-75.5,-48.5,-75.5,-50.5,-74,-52.5,-71.5,-53.8,-68.3,-55,-67.3,-55.9,-65,-54.8,-68.4,-52.4,-67.5,-46.5,-65.5,-45,-65.3,-41.5,-62.3,-39.2,-57.5,-38,-57.5,-36,-55,-35,-54,-34.5,-52,-32,-49,-28.5,-48.5,-26,-46,-24,-43.2,-22.9,-41,-22,-40,-19.5,-38.9,-15.5,-37,-12,-34.9,-8,-35.2,-5.7,-38,-3.7,-41,-2.9,-44.5,-2.6,-48,-1,-50,0.2,-51,4,-52.5,5,-55,5.8,-58,6.8,-60,8.5,-62,10.5,-64,10.6,-66.5,10.6,-68.3,11.5,-71.4,11,-72,12,-74.8,11,-75.6,9.7,-76.9,8.6],
  [-73,78,-60,82,-30,83.5,-20,81.5,-18,77,-21,72,-22,70.5,-32,68,-40,65,-43,60,-49,61,-53,66,-55,69.5,-60,76],
  [-80,73.5,-72,71.5,-65,67,-62,66.2,-67,62.5,-73,64.5,-78,64.5,-78,68.5,-88,70],
  [-90,77,-75,79,-62,82.2,-76,83,-90,81,-92,77.5],
  [-117,69.3,-114,73,-105,73,-101,69.5,-108,68.8],
  [-125,71.5,-120,74.2,-116,73,-121,71],
  [-84.9,21.9,-82,23.1,-79,22.5,-75.5,21,-74.2,20.2,-77.5,19.9,-79.5,21.5,-82.5,22.2],
  [-74.4,18.5,-72.8,19.9,-70,19.7,-68.4,18.6,-70.5,18.2,-72.8,18.1],
  [-24,65.5,-22,66.4,-16,66.5,-14,65,-18,63.4,-22,63.8],
  [-5.7,50,1.3,51.2,1.7,52.7,0,53.5,-1.5,55,-2.2,56.2,-1.8,57.6,-3.5,58.6,-5,58.5,-6,57.2,-5.5,55.5,-3,54.8,-3.2,53.4,-4.8,52.2,-5.2,51.7,-3,51.4],
  [-6,52,-6,54.5,-8.5,55,-10,54,-9.5,52,-6.5,52],
  [12.4,37.8,15.6,38.2,15.1,36.7,13,37.3],
  [8.2,41,9.7,41.1,9.7,39.1,8.4,39],
  [23.5,35.5,26.3,35.2,26,35,24,35.1],
  [49.3,-12,50.5,-15.5,49.8,-17,48.5,-20.5,47.2,-25,44.5,-25,43.3,-22.5,44.2,-19.5,44.4,-16,47,-15,48.2,-13.5],
  [79.8,9.8,81.9,7.5,81.2,6.2,80,6,79.7,7.5],
  [142,46,143.2,49.2,143.2,53.3,142.1,54.3,142.2,50,141.9,47],
  [141.5,41.3,142,39,141,37.5,140.8,35.7,139.8,35,138.8,34.7,137,34.6,135.8,33.5,135,34.6,132.5,34.2,131,34,130.9,34.5,132.6,35.5,135.5,35.7,137,37.3,139.5,38.2,140,40],
  [130,33.8,131.8,33.3,131.5,31.4,130.7,31,129.8,32.5],
  [132.5,33.8,134,34.2,134.6,33.5,133,32.8],
  [140,41.5,141,43.2,142.5,44.5,145.2,43.5,144,42.9,143.2,42,141.5,42.5,140.2,41.8],
  [121,25.2,122,25,121.6,23.5,120.8,22,120.1,23.2,120.3,24.7],
  [108.7,19.2,109.6,20,110.7,20.1,111,19.7,110.5,18.8,109.6,18.2,108.7,18.5],
  [120.4,18.4,122.2,18.5,122.3,16.5,121.5,15,121.9,14.2,124.2,13,123.2,13.6,122,13.7,120.8,14,120,15,119.8,16.4],
  [122,7,123,8.5,125.3,9.7,126.4,8.3,126.2,6.3,125.4,5.6,124.2,6.4,123.5,7.7,122.3,6.8],
  [124.3,12.4,125.7,12.3,125.8,10.8,125,9.8,124.5,10.3,124.9,11.5],
  [121.9,11.8,123.1,11.5,123.1,10.7,122.3,10.4,121.9,11],
  [122.4,10.9,123.3,10.5,123.2,9.1,122.4,9.4],
  [123.4,11.2,124,10.5,123.4,9.5,123.3,10.5],
  [117.2,8.4,119.4,10.4,119.6,11.4,118.9,10.2,117.3,8.9],
  [109,1.8,109.6,2,111.2,1.7,113,3.2,115,5,116.5,6.9,118,5.8,119.3,5.2,118,4.5,117.7,3.2,118.8,1.2,117.5,-0.9,116.5,-2.5,116,-3.9,114.5,-4.1,112.5,-3.3,110.3,-3,110,-1.8,109,-0.7],
  [95.3,5.6,97.5,5.2,98.7,3.7,100.5,2.3,101.5,2.1,103.5,0.3,104.5,-1.8,106,-3,105.8,-5.8,104.6,-5.9,102.3,-4,101,-2.5,99.2,0.2,97.5,2.5,95.5,4.5],
  [105.2,-6.8,106.2,-5.9,108.5,-6.5,110.4,-6.9,112.6,-6.8,114.4,-7.8,114.5,-8.7,112,-8.4,108.5,-7.8,106.4,-7.4,105.3,-6.9],
  [119.4,-3.5,118.9,-2.5,119.8,0.7,122,1,124.8,1.6,124,0.3,121.6,0.4,120.3,-1.1,121.7,-1.9,123,-0.9,121.5,-2.8,122.6,-4.5,121.4,-4.8,120.9,-3.2,120.4,-5.5,119.4,-5.4],
  [114.5,-8.2,119,-8.3,123,-8.3,123,-8.9,119,-9,115,-8.9],
  [123.5,-10.3,125.5,-9.3,127,-8.4,124.5,-8.4],
  [127.5,2,128.4,1.5,128,-0.7,127.5,0.5],
  [128,-3,130.8,-3,130.5,-3.8,128.3,-3.6],
  [131,-0.8,134,-0.9,135.5,-3.3,139,-2.9,141,-2.6,144.5,-3.9,146,-5.5,147.5,-6.2,147.8,-8,150.5,-10.3,147.5,-10.1,145.5,-8,143.5,-8.5,141.2,-9.2,138,-8.2,137.8,-5.3,135,-4.5,133.5,-4,132.5,-2.7,131,-1.5],
  [113.5,-22,114,-26,115,-34,118,-35,123.5,-34,127,-32,131,-31.5,134,-32.8,135.5,-34.8,138.5,-35,139.5,-36.5,140,-38,143.5,-38.8,146,-39,147,-38,150,-37.5,151,-34,153,-31,153.5,-28,153,-25,150.8,-22.5,148.5,-20,146,-18.5,145.3,-15,143.8,-14.3,142.5,-10.7,141.5,-13,141,-17,139.5,-17.5,136.7,-15.5,135.5,-14.7,136.7,-12.2,132.5,-11.5,130,-12.2,129.5,-14.9,127.5,-14,125.5,-14.5,122.5,-17.5,121,-19.6,118.5,-20.5,116.5,-21,114.5,-21.8],
  [144.7,-40.7,148.3,-40.9,148,-43,146.2,-43.6,145.2,-42.3],
  [172.7,-34.4,174.5,-36.5,175.8,-36.8,177.5,-37.9,178.5,-37.7,177,-39.2,175.3,-41.6,174.7,-41.2,174.8,-39.9,173.8,-39.2,174.5,-37.2],
  [172.7,-40.5,174,-41.2,174.3,-41.7,173.2,-43.5,171.2,-44.3,170.7,-45.9,169,-46.6,166.7,-46,168,-44,170.3,-43,172,-41.6]
];
  var LAKES=[
  [27.8,42.5,28.7,44.2,30.2,45.3,31.5,46.6,33,46,32.5,45.3,33.6,44.5,35.5,45.3,36.6,45.2,38,44.3,39.7,43.5,41.5,42,41.5,41.5,39,41,36.5,41.3,35,42,33,42,31,41.1,29.1,41.2,28.2,41.9],
  [47,44.5,47.3,45.8,49,46.4,51.5,47,53,46.5,53.2,45.3,51,44.4,51.3,43.2,52.7,42,53,41,53.8,39.6,53.9,38.5,53.5,37.2,51.5,36.7,49.3,37.5,48.9,38.6,49.5,40.3,48.5,41.8,47.5,43]
];
  var ICE=[
  [-180,82,-150,82,-120,82,-90,82,-60,82,-30,82,0,82,30,82,60,82,90,82,120,82,150,82,180,82,180,90,-180,90],
  [-180,-78,-160,-77,-150,-75,-120,-74,-100,-73.5,-80,-73,-72,-70,-68,-66,-63,-64.5,-58,-63.5,-62,-65.5,-60,-69,-60,-75,-45,-78,-30,-78,-15,-72,0,-70,20,-69.5,40,-68,60,-67,70,-69,90,-66,110,-66,130,-66,145,-67.5,165,-70,170,-77,180,-78,180,-90,-180,-90]
];
  var HOANGSA=[111.2,15.8,111.5,16.5,112.3,16.8,112.7,16.1];      // Quần đảo Hoàng Sa
  var TRUONGSA=[111.9,8.7,112.9,9.6,114.3,11.4,113.9,8.6,115,10,116,8.6,114.4,10.1];     // Quần đảo Trường Sa
  var CLOUDS=[95,18,7,120,5,6,150,-10,8,20,10,8,-30,45,9,-70,15,7,-110,38,8,60,-25,9,175,35,7,10,-30,7,-150,0,8,100,45,7];     // kinh độ, vĩ độ, bán kính (độ)

  function vec(lon,lat){
    var a=lon*D,b=lat*D,c=Math.cos(b);
    return [c*Math.cos(a),c*Math.sin(a),Math.sin(b)];
  }
  // Chuẩn hoá: quay ngược chiều kim đồng hồ (nhìn từ ngoài), chia nhỏ cạnh theo cung lớn
  function prep(flat,step){
    var p=[],i,n=flat.length/2,area=0;
    for(i=0;i<n;i++) p.push([flat[2*i],flat[2*i+1]]);
    for(i=0;i<n;i++){
      var q=p[(i+1)%n];
      area+=p[i][0]*q[1]-q[0]*p[i][1];
    }
    if(area<0) p.reverse();
    var v=p.map(function(t){return vec(t[0],t[1]);}),out=[];
    for(i=0;i<n;i++){
      var a=v[i],b=v[(i+1)%n];
      out.push(a);
      if(!step) continue;
      var dot=Math.max(-1,Math.min(1,a[0]*b[0]+a[1]*b[1]+a[2]*b[2]));
      var ang=Math.acos(dot),k=Math.ceil(ang/(step*D));
      if(k>1&&ang>1e-6){
        var s=Math.sin(ang);
        for(var j=1;j<k;j++){
          var t=j/k,wa=Math.sin((1-t)*ang)/s,wb=Math.sin(t*ang)/s;
          out.push([wa*a[0]+wb*b[0],wa*a[1]+wb*b[1],wa*a[2]+wb*b[2]]);
        }
      }
    }
    return out;
  }
  function prepAll(list,step){return list.map(function(f){return prep(f,step);});}
  function blob(lon,lat,r){            // đám mây: hình elip nhỏ
    var f=[];
    for(var i=0;i<12;i++){
      var t=i/12*2*Math.PI;
      f.push(lon+r*1.7*Math.cos(t),lat+r*0.8*Math.sin(t));
    }
    return f;
  }

  var pLand=prepAll(LAND,5),pLake=prepAll(LAKES,5),pIce=prepAll(ICE,5),pCloud=[],pHS=[],pTS=[],i;
  for(i=0;i<CLOUDS.length;i+=3) pCloud.push(prep(blob(CLOUDS[i],CLOUDS[i+1],CLOUDS[i+2]),0));
  for(i=0;i<HOANGSA.length;i+=2) pHS.push(vec(HOANGSA[i],HOANGSA[i+1]));
  for(i=0;i<TRUONGSA.length;i+=2) pTS.push(vec(TRUONGSA[i],TRUONGSA[i+1]));

  /* ---- Các chấm Hoàng Sa / Trường Sa ---- */
  var SVGNS="http://www.w3.org/2000/svg",dots=[];
  pHS.concat(pTS).forEach(function(v,idx){
    var c=document.createElementNS(SVGNS,"circle");
    c.setAttribute("r","0.25");
    c.setAttribute("data-k",idx<pHS.length?"hoang-sa":"truong-sa");
    elDots.appendChild(c);
    dots.push({v:v,c:c});
  });

  /* ---- Phép chiếu ---- */
  var sp=Math.sin(TILT),cp=Math.cos(TILT);
  function basis(lon){                   // hệ trục nhìn: đông, bắc, hướng tới người xem
    var s=Math.sin(lon*D),c=Math.cos(lon*D);
    return {ex:-s,ey:c,nx:-sp*c,ny:-sp*s,nz:cp,cx:cp*c,cy:cp*s,cz:sp};
  }
  function f2(x){return x.toFixed(2);}

  // Cắt đa giác theo bán cầu nhìn thấy. Mỗi đoạn nhìn thấy (từ điểm vào đến điểm ra)
  // được nối dọc mép đĩa, theo chiều ngược kim đồng hồ, tới điểm vào kế tiếp theo góc.
  function pathOf(polys,B){
    var d="";
    polys.forEach(function(P){
      var n=P.length,px=new Array(n),py=new Array(n),pz=new Array(n),i0=-1,k,nv=0;
      for(k=0;k<n;k++){
        var v=P[k];
        px[k]=B.ex*v[0]+B.ey*v[1];
        py[k]=B.nx*v[0]+B.ny*v[1]+B.nz*v[2];
        pz[k]=B.cx*v[0]+B.cy*v[1]+B.cz*v[2];
        if(pz[k]>=0) nv++; else if(i0<0) i0=k;
      }
      if(nv===0) return;                 // nằm hết ở mặt sau
      var rings=[];
      if(i0<0){                          // nằm hết ở mặt trước
        var all=[];
        for(k=0;k<n;k++) all.push([px[k],py[k]]);
        rings.push(all);
      }else{
        var chains=[],cur=null;
        for(k=0;k<n;k++){
          var i=(i0+k)%n,j=(i+1)%n,vi=pz[i]>=0,vj=pz[j]>=0;
          if(vi&&cur) cur.pts.push([px[i],py[i]]);
          if(vi!==vj){
            var t=pz[i]/(pz[i]-pz[j]),ix=px[i]+t*(px[j]-px[i]),iy=py[i]+t*(py[j]-py[i]);
            var h=Math.hypot(ix,iy)||1;ix/=h;iy/=h;
            if(vj){cur={pts:[[ix,iy]],a0:Math.atan2(iy,ix),a1:0,used:false};chains.push(cur);}
            else if(cur){cur.pts.push([ix,iy]);cur.a1=Math.atan2(iy,ix);cur=null;}
          }
        }
        chains.forEach(function(c0){
          if(c0.used) return;
          var ring=[],c=c0,guard=0;
          while(c&&!c.used&&guard++<64){
            c.used=true;
            ring=ring.concat(c.pts);
            var best=null,bd=1e9;
            chains.forEach(function(q){
              var dd=(q.a0-c.a1)%(2*Math.PI);
              if(dd<0) dd+=2*Math.PI;
              if(dd<bd){bd=dd;best=q;}
            });
            var m=Math.ceil(bd/(12*D));
            for(var s=1;s<m;s++){
              var a=c.a1+bd*s/m;
              ring.push([Math.cos(a),Math.sin(a)]);
            }
            c=best;
          }
          rings.push(ring);
        });
      }
      rings.forEach(function(r){
        if(r.length<3) return;
        for(k=0;k<r.length;k++){
          d+=(k?"L":"M")+f2(CX+R*r[k][0])+" "+f2(CY-R*r[k][1]);
        }
        d+="Z";
      });
    });
    return d;
  }

  function draw(lon){
    var B=basis(lon),Bc=basis(lon-0.12*(START-lon)); // mây trôi hơi nhanh hơn mặt đất
    elLand.setAttribute("d",pathOf(pLand,B));
    elLake.setAttribute("d",pathOf(pLake,B));
    elIce.setAttribute("d",pathOf(pIce,B));
    elCloud.setAttribute("d",pathOf(pCloud,Bc));
    dots.forEach(function(o){
      var v=o.v,z=B.cx*v[0]+B.cy*v[1]+B.cz*v[2];
      if(z<0.08){o.c.setAttribute("visibility","hidden");return;}
      o.c.setAttribute("visibility","visible");
      o.c.setAttribute("cx",f2(CX+R*(B.ex*v[0]+B.ey*v[1])));
      o.c.setAttribute("cy",f2(CY-R*(B.nx*v[0]+B.ny*v[1]+B.nz*v[2])));
    });
  }

  var still=false;
  try{still=window.matchMedia("(prefers-reduced-motion: reduce)").matches;}catch(e){}
  if(still||!window.requestAnimationFrame){draw(STILL);return;}

  var t0=null,last=-1e9;
  function frame(now){
    if(t0===null) t0=now;
    if(now-last>=32){                     // ~30 khung/giây là đủ cho logo nhỏ
      last=now;
      draw(START-360*((now-t0)/1000)/PERIOD);   // kinh độ ở giữa giảm dần → mặt đất trôi từ trái sang phải
    }
    requestAnimationFrame(frame);
  }
  draw(START);
  requestAnimationFrame(frame);
})();

// ===== SAO LẤP LÁNH Ở THANH TRÊN =====
(function(){
  const L=document.getElementById("stars");
  if(!L) return;

  let h="";

  for(let i=0;i<14;i++){
    const size=6+Math.random()*11;
    const x=Math.random()*97;
    const y=Math.random()*88;

    h+=`<svg class="star" style="left:${x}%;top:${y}%;`+
      `width:${size}px;height:${size}px;`+
      `animation-delay:${(-Math.random()*10).toFixed(2)}s">`+
      `<use href="#st"/></svg>`;
  }

  L.insertAdjacentHTML("afterbegin",h);
    // Tôn trọng thiết lập giảm chuyển động
  try{
    if(window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches){
      const lg=document.querySelector(".logo");

      if(lg&&typeof lg.pauseAnimations==="function"){
        lg.pauseAnimations();
      }
    }
  }catch(e){}
})();

// Khởi chạy ứng dụng
render();