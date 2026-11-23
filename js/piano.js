(function(){
"use strict";
const CDN="https://cdn.jsdelivr.net/npm/soundfont-player@0.12.0/dist/soundfont-player.min.js";
const VOICES=[["Grand Piano","Đại dương cầm","acoustic_grand_piano"],["Bright Piano","Âm sáng","bright_acoustic_piano"],["Mellow Piano","Âm ấm","electric_piano_2"],["Electric Piano","Piano điện","electric_piano_1"],["Honky-tonk Piano","Honky-tonk","honkytonk_piano"],["Stage Piano","Sân khấu","electric_grand_piano"]];
const GENRES=[["Nhạc hiện đại",100],["Nhạc cổ điển",88],["Nhạc dân ca",92],["Nhạc Jazz",116],["Nhạc phim",76],["Nhạc thiếu nhi",108]];
const N=["C","C♯","D","D♯","E","F","F♯","G","G♯","A","A♯","B"];
let libPromise=null;
function library(){if(window.Soundfont)return Promise.resolve(window.Soundfont);if(libPromise)return libPromise;libPromise=new Promise((ok,no)=>{const s=document.createElement("script");s.src=CDN;s.async=true;s.onload=()=>window.Soundfont?ok(window.Soundfont):no(Error("Soundfont missing"));s.onerror=()=>no(Error("Soundfont load failed"));document.head.appendChild(s);});return libPromise;}
function mount(root,onBack){
 let dead=false,ctx=null,inst=null,voiceIndex=0,volume=.78,sustain=false,transpose=0,octave=0;
 const held=new Map(),computer=new Map();
 const name=m=>N[m%12]+(Math.floor(m/12)-1),black=m=>[1,3,6,8,10].includes(m%12);
 function whiteBefore(m){let n=0;for(let i=21;i<m;i++)if(!black(i))n++;return n;}
 function keys(){let whites=[],blacks=[];for(let m=21;m<=108;m++)(black(m)?blacks:whites).push(m);
  return '<div class="piano-keyboard-scroll" id="pianoScroll"><div class="piano-keyboard"><div class="piano-white-keys">'+whites.map(m=>'<button class="piano-key white" data-midi="'+m+'" aria-label="'+name(m)+'"></button>').join("")+'</div><div class="piano-black-keys">'+blacks.map(m=>'<button class="piano-key black" data-midi="'+m+'" aria-label="'+name(m)+'" style="left:'+(whiteBefore(m)*32-10)+'px"></button>').join("")+'</div></div></div>';}
 function render(){root.innerHTML=
 '<header class="piano-head"><button class="piano-back" id="back">← DANH MỤC</button><div class="piano-heading"><span>PIANO</span><small>88 KEYS</small></div><div class="piano-current"><i></i><span id="voiceName">Grand Piano</span></div></header>'+
 '<section class="piano-section"><div class="piano-section-title">ÂM SẮC PIANO</div><div class="piano-voice-grid">'+VOICES.map((v,i)=>'<button class="piano-voice '+(!i?'active':'')+'" data-voice="'+i+'"><b>'+v[0]+'</b><small>'+v[1]+'</small></button>').join("")+'</div></section>'+
 '<section class="piano-section"><div class="piano-section-title">THỂ LOẠI ÂM NHẠC</div><div class="piano-genre-grid">'+GENRES.map((g,i)=>'<button class="piano-genre '+(!i?'active':'')+'" data-genre="'+i+'">'+g[0]+'</button>').join("")+'</div></section>'+
 '<section class="piano-key-area"><div class="piano-key-caption"><span>BÀN PHÍM</span><span>A0 — C8 · 88 PHÍM</span></div>'+keys()+'<div class="piano-range"><span>THẤP</span><input id="range" type="range" min="0" max="6" value="0"><span>CAO</span></div></section>'+
 '<section class="piano-controls"><div class="piano-control"><label>ÂM LƯỢNG <output id="volValue">78%</output></label><input id="volume" type="range" min="0" max="100" value="78"></div>'+
 '<button class="piano-toggle" id="sustain" aria-pressed="false">SUSTAIN <b>TẮT</b></button>'+
 '<div class="piano-stepper"><span>OCTAVE</span><div><button id="od">−</button><b id="ov">0</b><button id="ou">+</button></div></div>'+
 '<div class="piano-stepper"><span>TRANSPOSE</span><div><button id="td">−</button><b id="tv">0</b><button id="tu">+</button></div></div>'+
 '<div class="piano-keymap"><span>PHÍM MÁY TÍNH</span><b>A W S E D F T G Y H U J K</b></div></section><div class="piano-message" id="message">Đang tải bộ âm thanh Piano…</div>';
  bind();loadVoice(0);}
 function audio(){if(!ctx){const A=window.AudioContext||window.webkitAudioContext;if(!A)throw Error("Trình duyệt không hỗ trợ Web Audio API");ctx=new A();}if(ctx.state==="suspended")ctx.resume();return ctx;}
 async function loadVoice(i){voiceIndex=i;inst=null;root.querySelectorAll("[data-voice]").forEach(b=>b.classList.toggle("active",+b.dataset.voice===i));root.querySelector("#voiceName").textContent=VOICES[i][0];const msg=root.querySelector("#message");msg.textContent="Đang tải "+VOICES[i][0]+"…";
  try{const sf=await library();if(dead)return;const ac=audio();const next=await sf.instrument(ac,VOICES[i][2],{soundfont:"FluidR3_GM",format:"mp3"});if(dead||voiceIndex!==i)return;inst=next;msg.textContent="Sẵn sàng · "+VOICES[i][0];}catch(e){msg.textContent="Không tải được âm sắc. Kiểm tra kết nối mạng và chọn lại.";}
 }
 function press(m){if(dead||held.has(m))return;let ac;try{ac=audio();}catch(e){root.querySelector("#message").textContent=e.message;return;}const note=m+transpose+octave*12;held.set(m,note);const el=root.querySelector('[data-midi="'+m+'"]');if(el)el.classList.add("pressed");if(inst)try{inst.play(note,ac.currentTime,{gain:volume});}catch(e){}}
 function release(m){if(!held.has(m))return;const note=held.get(m);held.delete(m);const el=root.querySelector('[data-midi="'+m+'"]');if(el)el.classList.remove("pressed");if(!sustain&&inst&&inst.stop&&ctx)try{inst.stop(note,ctx.currentTime);}catch(e){}}
 function releaseAll(){Array.from(held.keys()).forEach(release);computer.clear();}
 function bind(){
  root.querySelector("#back").onclick=()=>{destroy();onBack();};
  root.querySelectorAll("[data-voice]").forEach(b=>b.onclick=()=>loadVoice(+b.dataset.voice));
  root.querySelectorAll("[data-genre]").forEach(b=>b.onclick=()=>{root.querySelectorAll("[data-genre]").forEach(x=>x.classList.toggle("active",x===b));const g=GENRES[+b.dataset.genre];root.querySelector("#message").textContent="Thể loại: "+g[0]+" · Nhịp gợi ý "+g[1]+" BPM";});
  root.querySelectorAll("[data-midi]").forEach(b=>{const m=+b.dataset.midi;b.addEventListener("pointerdown",e=>{e.preventDefault();try{b.setPointerCapture(e.pointerId);}catch(_){}press(m);});b.addEventListener("pointerup",()=>release(m));b.addEventListener("pointercancel",()=>release(m));b.addEventListener("lostpointercapture",()=>release(m));b.addEventListener("contextmenu",e=>e.preventDefault());});
  root.querySelector("#volume").oninput=e=>{volume=+e.target.value/100;root.querySelector("#volValue").textContent=e.target.value+"%";};
  root.querySelector("#sustain").onclick=e=>{sustain=!sustain;e.currentTarget.setAttribute("aria-pressed",String(sustain));e.currentTarget.classList.toggle("active",sustain);e.currentTarget.querySelector("b").textContent=sustain?"BẬT":"TẮT";if(!sustain)releaseAll();};
  const step=(id,fn)=>root.querySelector(id).onclick=fn;
  step("#od",()=>{octave=Math.max(-3,octave-1);root.querySelector("#ov").textContent=octave;});step("#ou",()=>{octave=Math.min(3,octave+1);root.querySelector("#ov").textContent=octave;});
  step("#td",()=>{transpose=Math.max(-12,transpose-1);root.querySelector("#tv").textContent=transpose;});step("#tu",()=>{transpose=Math.min(12,transpose+1);root.querySelector("#tv").textContent=transpose;});
  root.querySelector("#range").oninput=e=>root.querySelector("#pianoScroll").scrollTo({left:+e.target.value*7*32,behavior:"smooth"});
  const map={a:0,w:1,s:2,e:3,d:4,f:5,t:6,g:7,y:8,h:9,u:10,j:11,k:12,o:13,l:14,p:15,";":16,"'":17};
  const down=e=>{if(e.repeat||e.ctrlKey||e.metaKey||e.altKey||/INPUT|TEXTAREA|SELECT/.test(e.target.tagName))return;const k=e.key.toLowerCase();if(map[k]===undefined||computer.has(k))return;computer.set(k,60+map[k]);press(60+map[k]);};
  const up=e=>{const k=e.key.toLowerCase();if(computer.has(k)){release(computer.get(k));computer.delete(k);}};
  window.addEventListener("keydown",down);window.addEventListener("keyup",up);window.addEventListener("blur",releaseAll);root._pianoDown=down;root._pianoUp=up;
 }
 function destroy(){if(dead)return;dead=true;releaseAll();window.removeEventListener("keydown",root._pianoDown);window.removeEventListener("keyup",root._pianoUp);window.removeEventListener("blur",releaseAll);inst=null;}
 render();return {destroy};
}
window.EduversePiano={mount};
})();