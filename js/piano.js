(function(){
"use strict";
const instruments=[
 {id:"piano",name:"Piano",en:"Piano",icon:"🎹",group:"Phím",desc:"Đàn phím 88 nốt"},
 {id:"guitar",name:"Guitar",en:"Guitar",icon:"🎸",group:"Dây",desc:"Đàn guitar dây gảy"},
 {id:"violin",name:"Violin",en:"Violin",icon:"🎻",group:"Dây",desc:"Đàn violin kéo"},
 {id:"harp",name:"Đàn hạc",en:"Harp",icon:"🪉",group:"Dây",desc:"Đàn hạc dây gảy"},
 {id:"banjo",name:"Banjo",en:"Banjo",icon:"🪕",group:"Dây",desc:"Đàn banjo dây gảy"},
 {id:"saxophone",name:"Saxophone",en:"Saxophone",icon:"🎷",group:"Hơi",desc:"Kèn saxophone"},
 {id:"trumpet",name:"Trumpet",en:"Trumpet",icon:"🎺",group:"Hơi",desc:"Kèn trumpet"},
 {id:"trombone",name:"Trombone",en:"Trombone",icon:"🎺",group:"Hơi",desc:"Kèn trombone"},
 {id:"flute",name:"Sáo flute",en:"Flute",icon:"🪈",group:"Hơi",desc:"Sáo flute"},
 {id:"accordion",name:"Accordion",en:"Accordion",icon:"🪗",group:"Phím",desc:"Đàn accordion"},
 {id:"drumkit",name:"Bộ trống",en:"Drum kit",icon:"🥁",group:"Gõ",desc:"Bộ nhạc cụ trống"},
 {id:"longdrum",name:"Trống dài",en:"Long drum",icon:"🪘",group:"Gõ",desc:"Nhạc cụ gõ thân trụ"},
 {id:"maracas",name:"Maracas",en:"Maracas",icon:"🪇",group:"Gõ",desc:"Nhạc cụ lắc"}
];
const sounds=[
 ["grand","Grand Piano"],["bright","Bright Piano"],["electric","Electric Piano"],
 ["honky","Honky-tonk"],["musicbox","Music Box"],["synth","Synth Piano"]
];
const genres=["Nhạc hiện đại","Nhạc cổ điển","Nhạc dân ca","Jazz","Rock","Nhạc phim"];
const esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
let audio=null,active=new Map(),selected="piano",sound="grand",genre=genres[0],octave=4,returnToHome=()=>{};
const midiName=n=>["C","C♯","D","D♯","E","F","F♯","G","G♯","A","A♯","B"][n%12]+(Math.floor(n/12)-1);
const isBlack=n=>[1,3,6,8,10].includes(n%12);
function context(){const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return null;if(!audio)audio=new AC();if(audio.state==="suspended")audio.resume();return audio;}
function tone(midi,id,velocity=.75){
 const ctx=context();if(!ctx)return;
 const now=ctx.currentTime,f=440*Math.pow(2,(midi-69)/12),osc=ctx.createOscillator(),gain=ctx.createGain(),filter=ctx.createBiquadFilter();
 const kind=id==="violin"||id==="accordion"?"sawtooth":id==="flute"||id==="saxophone"?"sine":id==="trumpet"||id==="trombone"?"square":id==="drumkit"||id==="longdrum"||id==="maracas"?"triangle":id==="piano"&&sound==="synth"?"sawtooth":id==="piano"&&sound==="electric"?"sine":"triangle";
 osc.type=kind;osc.frequency.setValueAtTime(f,now);
 if(id==="trombone")osc.frequency.exponentialRampToValueAtTime(f*.985,now+.12);
 filter.type="lowpass";filter.frequency.value=id==="piano"?(sound==="bright"?7200:3900):id==="flute"?2600:5200;
 gain.gain.setValueAtTime(.0001,now);gain.gain.exponentialRampToValueAtTime(Math.max(.025,velocity*.22),now+.012);
 const decay=id==="piano"?(sound==="musicbox"?1.7:sound==="electric"?1.1:2.2):id==="guitar"||id==="banjo"||id==="harp"?.9:id==="drumkit"||id==="maracas"?.22:1.6;
 gain.gain.exponentialRampToValueAtTime(.0001,now+decay);
 osc.connect(filter);filter.connect(gain);gain.connect(ctx.destination);osc.start(now);osc.stop(now+decay+.04);
 active.set(midi,{osc,gain});
 osc.onended=()=>{if(active.get(midi)?.osc===osc)active.delete(midi);};
}
function release(midi){const o=active.get(midi);if(!o)return;try{o.gain.gain.cancelScheduledValues(audio.currentTime);o.gain.gain.setTargetAtTime(.0001,audio.currentTime,.08);o.osc.stop(audio.currentTime+.35);}catch(e){}active.delete(midi);}
function keyMarkup(start,count){
 const notes=Array.from({length:count},(_,i)=>start+i),whites=notes.filter(n=>!isBlack(n)),whiteIndex=new Map();whites.forEach((n,i)=>whiteIndex.set(n,i));
 const white=whites.map(n=>'<button type="button" class="ev-key white" data-note="'+n+'" aria-label="'+midiName(n)+'"><span>'+((n%12===0)?midiName(n):"")+'</span></button>').join("");
 const black=notes.filter(isBlack).map(n=>{const prev=n-1,ix=whiteIndex.get(prev);return '<button type="button" class="ev-key black" data-note="'+n+'" style="left:calc('+((ix+1)*100/whites.length)+'% - 0.36%)" aria-label="'+midiName(n)+'"></button>';}).join("");
 return '<div class="ev-keybed" style="--white-count:'+whites.length+'">'+white+black+'</div>';
}
function bindKeys(root,id){
 root.querySelectorAll("[data-note]").forEach(k=>{
  const n=Number(k.dataset.note);
  const down=e=>{e.preventDefault();if(k.dataset.down)return;k.dataset.down="1";k.classList.add("pressed");tone(n,id);};
  const up=e=>{if(!k.dataset.down)return;delete k.dataset.down;k.classList.remove("pressed");release(n);};
  k.addEventListener("pointerdown",down);["pointerup","pointercancel","pointerleave"].forEach(ev=>k.addEventListener(ev,up));
 });
}
const keyMap={z:0,s:1,x:2,d:3,c:4,v:5,g:6,b:7,h:8,n:9,j:10,m:11,",":12,l:13,".":14,";":15,"/":16,q:12,"2":13,w:14,"3":15,e:16,r:17,"5":18,t:19,"6":20,y:21,"7":22,u:23,i:24};
function bindComputer(root,id){
 const down=e=>{if(e.repeat||e.ctrlKey||e.metaKey||e.altKey)return;const k=e.key.toLowerCase();if(!(k in keyMap))return;if(/input|select|textarea/i.test(e.target.tagName))return;const n=(id==="piano"?12*(octave+1):60)+keyMap[k];if(!active.has(n)){tone(n,id);const el=root.querySelector('[data-note="'+n+'"]');if(el)el.classList.add("pressed");}};
 const up=e=>{const k=e.key.toLowerCase();if(!(k in keyMap))return;const n=(id==="piano"?48:60)+keyMap[k];release(n);const el=root.querySelector('[data-note="'+n+'"]');if(el)el.classList.remove("pressed");};
 window.addEventListener("keydown",down);window.addEventListener("keyup",up);
 return()=>{window.removeEventListener("keydown",down);window.removeEventListener("keyup",up);};
}
function pianoView(root){
 root.innerHTML='<div class="ev-music-head"><button class="ev-back" type="button" data-back>←</button><div><div class="ev-eyebrow">EDUVERSE · ÂM NHẠC</div><h1>PIANO 88 KEYS</h1></div></div>'+
 '<section class="ev-piano-stage"><div class="ev-instrument-mark">🎹 <span>88 KEYS</span></div><div class="ev-key-scroll">'+keyMarkup(21,88)+'</div></section>'+
 '<section class="ev-controls"><div class="ev-control"><label for="ev-sound">Âm sắc</label><select id="ev-sound">'+sounds.map(([v,l])=>'<option value="'+v+'" '+(v===sound?"selected":"")+'>'+l+'</option>').join("")+'</select></div><div class="ev-control"><label for="ev-genre">Thể loại</label><select id="ev-genre">'+genres.map(g=>'<option '+(g===genre?"selected":"")+'>'+g+'</option>').join("")+'</select></div><div class="ev-control ev-octave"><label>Quãng phím máy tính</label><div><button type="button" data-oct="-1">−</button><span>'+octave+'</span><button type="button" data-oct="1">+</button></div></div></section>'+
 '<div class="ev-computer-note">Bàn phím máy tính: Z–M và Q–U</div>';
 root.querySelector("[data-back]").onclick=()=>{cleanup();selected="";listView(root,returnToHome);};
 root.querySelector("#ev-sound").onchange=e=>sound=e.target.value;
 root.querySelector("#ev-genre").onchange=e=>genre=e.target.value;
 root.querySelectorAll("[data-oct]").forEach(b=>b.onclick=()=>{octave=Math.max(1,Math.min(7,octave+Number(b.dataset.oct)));const label=root.querySelector(".ev-octave span");label.textContent=octave;});
 bindKeys(root,"piano");cleanup=bindComputer(root,"piano");
}
let cleanup=()=>{};
function instrumentView(root,id){
 const item=instruments.find(x=>x.id===id);if(!item)return;
 root.innerHTML='<div class="ev-music-head"><button class="ev-back" type="button" data-back>←</button><div><div class="ev-eyebrow">EDUVERSE · '+esc(item.group.toUpperCase())+'</div><h1>'+esc(item.name.toUpperCase())+'</h1></div></div>'+
 '<section class="ev-other-instrument"><div class="ev-big-icon">'+item.icon+'</div><div><h2>'+esc(item.name)+'</h2><p>'+esc(item.desc)+'</p></div></section>'+
 '<section class="ev-play-area"><div class="ev-key-scroll">'+keyMarkup(60,25)+'</div></section>'+
 '<section class="ev-controls"><div class="ev-control"><label for="ev-genre">Thể loại</label><select id="ev-genre">'+genres.map(g=>'<option '+(g===genre?"selected":"")+'>'+g+'</option>').join("")+'</select></div><div class="ev-control"><label>Quãng phím máy tính</label><span class="ev-control-static">C4–C6</span></div></section>';
 root.querySelector("[data-back]").onclick=()=>{cleanup();selected="";listView(root,returnToHome);};
 root.querySelector("#ev-genre").onchange=e=>genre=e.target.value;
 bindKeys(root,id);cleanup=bindComputer(root,id);
}
function listView(root,onBack){
 cleanup();cleanup=()=>{};
 const groups=["Phím","Dây","Hơi","Gõ"];
 root.innerHTML='<div class="ev-music-head"><button class="ev-back" type="button" data-exit>←</button><div><div class="ev-eyebrow">EDUVERSE · KHÔNG GIAN ÂM NHẠC</div><h1>NHẠC CỤ</h1></div></div>'+
 '<button class="ev-featured-piano" type="button" data-instrument="piano"><span class="ev-feature-icon">🎹</span><span><strong>PIANO 88 KEYS</strong><small>52 phím trắng · 36 phím đen</small></span><span class="ev-open-arrow">↗</span></button>'+
 groups.map(g=>'<section class="ev-instrument-group"><h2>'+g.toUpperCase()+'</h2><div class="ev-instrument-grid">'+instruments.filter(x=>x.group===g&&x.id!=="piano").map(x=>'<button class="ev-instrument-card" type="button" data-instrument="'+x.id+'"><span>'+x.icon+'</span><strong>'+esc(x.name)+'</strong><small>'+esc(x.en)+'</small></button>').join("")+'</div></section>').join("");
 root.querySelector("[data-exit]").onclick=()=>{cleanup();selected="";if(typeof onBack==="function")onBack();};\n root.querySelectorAll("[data-instrument]").forEach(b=>b.onclick=()=>{selected=b.dataset.instrument;if(selected==="piano")pianoView(root);else instrumentView(root,selected);});
}
window.renderMusicRoom=function(main,onBack){
 if(selected==="piano")return pianoView(main);
 if(selected&&selected!=="")return instrumentView(main,selected);
 listView(main,onBack);
};
})();