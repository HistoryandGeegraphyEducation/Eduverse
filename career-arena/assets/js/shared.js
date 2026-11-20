(()=>{
 let ctx=null,enabled=true;
 function audio(){
  const AudioContextClass=window.AudioContext||window.webkitAudioContext;
  if(!AudioContextClass)return null;
  try{ctx=ctx||new AudioContextClass();if(ctx.state==='suspended')ctx.resume();return ctx}catch(e){return null}
 }
 function tone(freq=660,duration=.12,type='sine',volume=.12,when=0){
  if(!enabled)return;
  const ac=audio();if(!ac)return;
  try{
   const o=ac.createOscillator(),g=ac.createGain(),start=ac.currentTime+when;
   o.type=type;o.frequency.setValueAtTime(freq,start);
   g.gain.setValueAtTime(.0001,start);g.gain.exponentialRampToValueAtTime(volume,start+.025);g.gain.exponentialRampToValueAtTime(.0001,start+duration);
   o.connect(g);g.connect(ac.destination);o.start(start);o.stop(start+duration+.04);
  }catch(e){}
 }
 const roundTracks={
  'Khởi động':'assets/audio/Happy%2520Happy%2520Game%2520Show.mp3',
  'Phản xạ':'assets/audio/Creator%20Energy%202_1.mp3',
  'Liên kết':'assets/audio/Strategic%20Growth%201_1.mp3',
  'Bứt phá':'assets/audio/Cloud%20Dancer.mp3',
  'Luyện tập':'assets/audio/Sophisticated%20Groove%202_1.mp3',
  'Vận dụng':'assets/audio/Rise%20With%20Purpose%202_1.mp3'
 };
 let music=null,currentTrack='';
 function playRoundMusic(round='Khởi động'){
  if(!enabled)return;
  const track=roundTracks[round]||roundTracks['Khởi động'];
  if(!music){music=new Audio();music.preload='auto';music.loop=true;music.volume=.28;}
  if(currentTrack!==track){music.pause();music.src=track;music.currentTime=0;currentTrack=track;}
  if(music.paused){const attempt=music.play();if(attempt&&typeof attempt.catch==='function')attempt.catch(()=>{});}
 }
 function stopRoundMusic(){
  if(!music)return;
  music.pause();music.currentTime=0;currentTrack='';
 }
 function roundIntro(round='Khởi động'){playRoundMusic(round);}

window.GameSound={
  tap:()=>tone(520,.08),
  success:()=>{tone(660,.12);tone(880,.18,'sine',.12,.11)},
  wrong:()=>tone(190,.2,'triangle'),
  start:()=>{tone(440,.1);tone(660,.1,'sine',.12,.1);tone(880,.18,'sine',.12,.2)},
  roundIntro,
  stop:stopRoundMusic,
  toggle:()=>{enabled=!enabled;if(music){if(enabled&&currentTrack){const attempt=music.play();if(attempt&&typeof attempt.catch==='function')attempt.catch(()=>{});}else music.pause();}document.querySelectorAll('[data-sound]').forEach(b=>b.textContent=enabled?'♫ Âm thanh: Bật':'♪ Âm thanh: Tắt');return enabled},
  get enabled(){return enabled}
 };
 document.addEventListener('click',e=>{if(e.target.closest('button,a,.option'))tone(430,.045,'sine',.035)},true);
 document.querySelectorAll('[data-sound]').forEach(b=>b.addEventListener('click',()=>GameSound.toggle()));
 document.querySelectorAll('[data-year]').forEach(x=>x.textContent=new Date().getFullYear());
})();