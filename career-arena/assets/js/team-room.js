(() => {
'use strict';
const $=id=>document.getElementById(id),params=new URLSearchParams(location.search),hostId=params.get('join'),controllerHost=params.get('control');
let connection=null,timer=null,liveBoardRevealTimer=null,pendingRoundCelebration='',controllerConnected=false,lastControllerState=null,selfName='',selfTeamIndex=null,breakthroughTeacherToken='',breakthroughRoomCode='',breakthroughAssessments=[null,null,null,null],breakthroughHistory=[[],[],[],[]],breakthroughDeadline=0,breakthroughFinalAssignments={},breakthroughSyncQueue=Promise.resolve(),breakthroughNotes={},breakthroughFinalDrafts={},breakthroughConfirmed=new Set(),breakthroughAssessing=new Set(),seconds=300,careerPoints=[0,0,0,0],captainRevealUntil=0,reflex={active:false,index:-1,startedAt:0,selectionEndsAt:0,completed:{}},reflexVotes=[{},{},{},{}],reflexTeamPhases=Array.from({length:4},()=>({phase:'select',selectionEndsAt:0,captainEndsAt:0})),reflexClockTimer=null,reflexAutoNextTimer=null,reflexCaptainTimers=[null,null,null,null],reflexElapsed=[0,0,0,0],reflexPoints=[0,0,0,0],reflexRoundResults=[],approvalMode='auto',currentQuestion='',questionType='both',questionOptions=[],teamVotes=[{}, {}, {}, {}],teamTexts=[[],[],[],[]],teamFinals=[null,null,null,null],captainElection={open:false,endsAt:0,closed:false},captainElectionTimer=null,captainVotes=[{},{},{},{}],captains=[null,null,null,null],raceOrder=[],raceAwarded=new Set(),linkRound={active:false,workStarted:false,order:[],turn:0,turnEndsAt:0,assigned:{},currentCard:null,cardVotes:{},lastAutoPick:null,selectionClosed:false},linkTurnTimer=null,linkTurnTicker=null,linkSelections=[{},{},{},{}],linkNotes=[[],[],[],[]],linkSummaries=[null,null,null,null],breakthroughRound={active:false,order:[],turn:0,turnEndsAt:0,assigned:{},lastAutoPick:null,closed:false,responses:[{},{},{},{}]},breakthroughTurnTimer=null,breakthroughTurnTicker=null,breakthroughDrafts={},teams=['Đội 1','Đội 2','Đội 3','Đội 4'].map(name=>({name,avatar:'🌟',color:'cyan',slogan:'',score:0,members:[]})),connections=new Map(),controllerConnections=new Map(),pendingRequests=new Map(),submissions=[],currentRound='Khởi động',awarded=new Set(),liveBoardVisible=true,roundStarted=false,roundMusicActive=false,winnerCelebration={id:0,round:'',team:'',endsAt:0},roundIntro={id:0,round:'',startedAt:0,endsAt:0},roundIntroTimer=null,roundPoints={'Khởi động':[0,0,0,0],'Phản xạ':[0,0,0,0],'Liên kết':[0,0,0,0],'Bứt phá':[0,0,0,0],'Luyện tập':[0,0,0,0],'Vận dụng':[0,0,0,0]},bootReview=[null,null,null,null];
const SUPABASE_CONFIG=window.CAREER_ARENA_SUPABASE||{};
let supabaseClient=null,controllerChannel=null,studentChannel=null;
const AVATAR_OPTIONS=['🌸','🌺','🌻','🌷','🪷','🌼','🌹','🐼','🦊','🐱','🐶','🐰','🦋','🐬','🦉','🐢','🦄','🐯','⭐','🌙','🔥','⚡','🍀','🌈'];
const TEAM_COLORS=[{id:'cyan',label:'Xanh biển',value:'#43d9ff'},{id:'violet',label:'Tím',value:'#b38aff'},{id:'rose',label:'Hồng',value:'#ff83b7'},{id:'gold',label:'Vàng',value:'#ffd36b'},{id:'green',label:'Xanh lá',value:'#79e5a5'},{id:'orange',label:'Cam',value:'#ffad70'}];
const PROFILE_FRAMES=[{id:'basic',label:'Cơ bản',minXp:0},{id:'neon',label:'Neon',minXp:30},{id:'gold',label:'Vàng',minXp:60},{id:'legend',label:'Huyền thoại',minXp:100}];
const validAvatar=value=>AVATAR_OPTIONS.includes(value),validColor=value=>TEAM_COLORS.some(x=>x.id===value),validFrame=value=>PROFILE_FRAMES.some(x=>x.id===value);
const teamProfileStorage='career-arena-team-profiles-v2';
function readLocal(key,fallback){try{const value=JSON.parse(localStorage.getItem(key)||'null');return value??fallback}catch(e){return fallback}}
function saveLocal(key,value){try{localStorage.setItem(key,JSON.stringify(value))}catch(e){}}
function restoreTeamProfiles(){const saved=readLocal(teamProfileStorage,[]);if(!Array.isArray(saved))return;teams.forEach((team,i)=>{const item=saved[i];if(!item)return;if(typeof item.name==='string'&&item.name.trim())team.name=item.name.slice(0,24);if(validAvatar(item.avatar))team.avatar=item.avatar;if(validColor(item.color))team.color=item.color;if(typeof item.slogan==='string')team.slogan=item.slogan.slice(0,60)})}
function persistTeamProfiles(){saveLocal(teamProfileStorage,teams.map(t=>({name:t.name,avatar:t.avatar,color:t.color,slogan:t.slogan||''})))}
function memberPreferenceKey(name){return 'career-arena-member-profile:'+String(name||'').trim().toLocaleLowerCase('vi')}
function readMemberProfile(name){const item=readLocal(memberPreferenceKey(name),{});return{avatar:validAvatar(item.avatar)?item.avatar:'🙂',frame:validFrame(item.frame)?item.frame:'basic',xp:Math.max(0,Math.min(5000,Number(item.xp)||0))}}
function saveMemberProfile(name,profile){saveLocal(memberPreferenceKey(name),profile)}
function memberBadges(member){const n=Number(member?.contributions)||0;return n>=10?['Người kiến tạo','Đồng đội tin cậy','Thành viên tích cực']:n>=5?['Đồng đội tin cậy','Thành viên tích cực']:n>=1?['Thành viên tích cực']:[]}
function teamBadges(team){const score=Number(team?.score)||0;return score>=150?['Dẫn đầu','Bứt phá','Khởi sắc']:score>=75?['Bứt phá','Khởi sắc']:score>=25?['Khởi sắc']:[]}
function renderAvatarPicker(rootId,selected,onPick){const root=$(rootId);if(!root)return;root.replaceChildren();AVATAR_OPTIONS.forEach(icon=>{const button=document.createElement('button');button.type='button';button.className='avatar-choice'+(icon===selected?' selected':'');button.textContent=icon;button.setAttribute('aria-label','Chọn '+icon);button.addEventListener('click',()=>onPick(icon));root.append(button)})}
function renderFramePicker(rootId,selected,xp,onPick){const root=$(rootId);if(!root)return;root.replaceChildren();PROFILE_FRAMES.forEach(frame=>{const unlocked=(Number(xp)||0)>=frame.minXp,button=document.createElement('button');button.type='button';button.className='frame-choice frame-'+frame.id+(frame.id===selected?' selected':'');button.disabled=!unlocked;button.textContent=unlocked?frame.label:frame.label+' · '+frame.minXp+' XP';button.addEventListener('click',()=>onPick(frame.id));root.append(button)})}
function awardMemberXp(conn,activity){if(!Number.isInteger(conn.__team))return;const member=teams[conn.__team].members.find(m=>m.id===conn.peer);if(!member)return;member.xp=Number(member.xp)||0;member.contributions=Number(member.contributions)||0;member.xpEvents=Array.isArray(member.xpEvents)?member.xpEvents:[];const key=currentRound+':'+activity;if(member.xpEvents.includes(key))return;member.xpEvents.push(key);member.xp+=10;member.contributions++;conn.__xp=member.xp}
function getSupabaseClient(){
 if(supabaseClient)return supabaseClient;
 if(!SUPABASE_CONFIG.url||!SUPABASE_CONFIG.publishableKey||!window.supabase?.createClient)return null;
 supabaseClient=window.supabase.createClient(SUPABASE_CONFIG.url,SUPABASE_CONFIG.publishableKey);
 return supabaseClient;
}
function controllerTopic(code){return 'career-arena-control:'+String(code||'').trim().replace(/\s+/g,'').toUpperCase()}
function studentTopic(code){return 'career-arena-students:'+String(code||'').trim().replace(/\s+/g,'').toUpperCase()}
function removeStudentChannel(){
 if(supabaseClient&&studentChannel){supabaseClient.removeChannel(studentChannel).catch(()=>{});}
 studentChannel=null;
}
function openHostStudentChannel(code,onReady,onError){
 const client=getSupabaseClient();if(!client){onError('Thiếu cấu hình Supabase.');return}
 studentChannel=client.channel(studentTopic(code),{config:{broadcast:{self:false,ack:true},private:false}});
 studentChannel.on('broadcast',{event:'student-message'},({payload})=>{
  const message=payload||{},clientId=String(message.clientId||'');
  if(!clientId||!message.data)return;
  if(message.data.type==='student-leave'){
   const existing=connections.get(clientId);
   if(existing){connections.delete(clientId);pendingRequests.delete(clientId);teams.forEach(t=>t.members=t.members.filter(m=>m.id!==clientId));renderPending();broadcast()}
   return;
  }
  let conn=connections.get(clientId);
  if(!conn){
   conn={peer:clientId,open:true,__realtime:true,send(data){
    if(!studentChannel)return Promise.resolve('error');
    return studentChannel.send({type:'broadcast',event:'host-message',payload:{target:clientId,data}});
   },close(){
    this.open=false;connections.delete(clientId);pendingRequests.delete(clientId);
    teams.forEach(t=>t.members=t.members.filter(m=>m.id!==clientId));renderPending();broadcast();
   }};
   connections.set(clientId,conn);
  }
  onMessage(conn,message.data);
 });
 let settled=false;
 const timeout=setTimeout(()=>{if(!settled){settled=true;onError('Hết thời gian mở kênh học sinh trên Supabase Realtime.')}},20000);
 studentChannel.subscribe((status,error)=>{
  if(status==='SUBSCRIBED'&&!settled){settled=true;clearTimeout(timeout);onReady()}
  else if((status==='CHANNEL_ERROR'||status==='TIMED_OUT')&&!settled){settled=true;clearTimeout(timeout);onError('Supabase Realtime trả về '+status+(error?.message?' · '+error.message:''))}
 });
}
function publishControllerMessage(payload){
 if(!controllerChannel)return;
 controllerChannel.send({type:'broadcast',event:'controller-message',payload}).catch(()=>{});
}
function removeControllerChannel(){
 if(supabaseClient&&controllerChannel){supabaseClient.removeChannel(controllerChannel).catch(()=>{});}
 controllerChannel=null;controllerConnected=false;
}
function openHostControllerChannel(code,onReady,onError){
 const client=getSupabaseClient();if(!client){onError('Không tải được Supabase JS hoặc thiếu URL/Publishable Key.');return}
 controllerChannel=client.channel(controllerTopic(code),{config:{broadcast:{self:false},private:false}});
 controllerChannel.on('broadcast',{event:'controller-message'},({payload})=>{
  const data=payload||{};
  if(data.type==='controller-hello'){
   publishControllerMessage({type:'controller-ready',state:state(),pending:[...pendingRequests].map(([id,r])=>({id,name:r.name,team:r.team}))});
   if($('controllerLinkStatus'))$('controllerLinkStatus').textContent='Điện thoại điều khiển: đã kết nối';
   return;
  }
  if(data.type==='control-action')onMessage({__controller:true},data);
 });
 let settled=false;
 const timeout=setTimeout(()=>{if(!settled){settled=true;onError('Hết thời gian kết nối Supabase Realtime. Kiểm tra Realtime đã được bật trong dự án.')}},20000);
 controllerChannel.subscribe((status,error)=>{
  if(status==='SUBSCRIBED'&&!settled){settled=true;clearTimeout(timeout);onReady()}
  else if((status==='CHANNEL_ERROR'||status==='TIMED_OUT')&&!settled){settled=true;clearTimeout(timeout);onError('Supabase Realtime trả về '+status+(error?.message?' · '+error.message:''))}
 });
}
const state=()=>({type:'state',roundStarted,roundMusicActive,winnerCelebration,roundIntro,breakthroughAssessments,careerPoints,captainRevealUntil,reflex,reflexVotes,reflexTeamPhases,reflexElapsed,teams,submissions,currentRound,seconds,approvalMode,question:{text:currentQuestion,type:questionType,options:questionOptions},teamVotes,teamTexts,teamFinals,captainElection,captainVotes,captains,raceOrder,linkRound,linkSelections,linkNotes,linkSummaries,breakthroughRound,liveBoardVisible,roundPoints,bootReview,reflexRoundResults});
const send=(c,d)=>{try{if(c&&c.open)c.send(d)}catch(e){}};
let reflexNoticeAudio=null;
function unlockReflexNoticeAudio(){
 const AudioContextClass=window.AudioContext||window.webkitAudioContext;
 if(!AudioContextClass)return;
 try{if(!reflexNoticeAudio)reflexNoticeAudio=new AudioContextClass();if(reflexNoticeAudio.state==='suspended')reflexNoticeAudio.resume()}catch(e){}
}
function playReflexCaptainNotice(){
 const ctx=reflexNoticeAudio;
 if(!ctx)return;
 try{
  if(ctx.state==='suspended')ctx.resume();
  const now=ctx.currentTime;
  [880,1174.66].forEach((frequency,index)=>{
   const oscillator=ctx.createOscillator(),gain=ctx.createGain(),start=now+index*.14;
   oscillator.type='sine';oscillator.frequency.value=frequency;
   gain.gain.setValueAtTime(.0001,start);gain.gain.exponentialRampToValueAtTime(.16,start+.02);gain.gain.exponentialRampToValueAtTime(.0001,start+.12);
   oscillator.connect(gain);gain.connect(ctx.destination);oscillator.start(start);oscillator.stop(start+.13);
  });
 }catch(e){}
}
function addRoundPoints(round,team,points){if(!roundPoints[round])roundPoints[round]=[0,0,0,0];roundPoints[round][team]=(roundPoints[round][team]||0)+points}
function roundRows(data,round){const values=data.roundPoints?.[round]||[0,0,0,0];return (data.teams||[]).map((team,i)=>({team:team.name,points:values[i]||0,index:i})).sort((a,b)=>b.points-a.points||a.index-b.index)}
function setRoundWinnerCelebration(round){const rows=roundRows(state(),round);if(!rows.length)return;const hasWinner=rows[0].points>0;winnerCelebration={id:Date.now()+'-'+Math.random().toString(36).slice(2,7),round,team:hasWinner?rows[0].team:'Các đội',title:hasWinner?'CHÚC MỪNG ĐỘI CHIẾN THẮNG':'CHÚC MỪNG CÁC ĐỘI',endsAt:Date.now()+4200};liveBoardVisible=false;if(liveBoardRevealTimer)clearTimeout(liveBoardRevealTimer);const celebrationId=winnerCelebration.id;liveBoardRevealTimer=setTimeout(()=>{if(winnerCelebration.id!==celebrationId)return;liveBoardRevealTimer=null;liveBoardVisible=true;broadcast()},Math.max(0,winnerCelebration.endsAt-Date.now()))}
function renderRoundWinnerCelebration(data){const overlay=$('linkFireworks'),item=data?.winnerCelebration;if(!overlay)return;if(!item?.id||item.endsAt<=Date.now()){overlay.classList.add('hidden');return}if(overlay.dataset.celebrationId===String(item.id))return;overlay.dataset.celebrationId=String(item.id);$('linkFireworksTitle').textContent=(item.title||'CHÚC MỪNG ĐỘI CHIẾN THẮNG')+' VÒNG '+String(item.round||'').toUpperCase();$('linkFireworksWinner').textContent=item.team||'';$('linkFireworksNext').textContent='VÒNG '+String(item.round||'').toUpperCase()+' HOÀN THÀNH';overlay.classList.remove('hidden');setTimeout(()=>{if(overlay.dataset.celebrationId===String(item.id))overlay.classList.add('hidden')},Math.max(0,item.endsAt-Date.now()))}
function stateForStudent(teamIndex){const s=state(),own=Number.isInteger(teamIndex)?s.breakthroughAssessments?.[teamIndex]||null:null;s.breakthroughAssessments=[null,null,null,null];if(Number.isInteger(teamIndex))s.breakthroughAssessments[teamIndex]=own;if(s.breakthroughRound?.responses){const responses=[{},{},{},{}];if(Number.isInteger(teamIndex))responses[teamIndex]=s.breakthroughRound.responses[teamIndex]||{};s.breakthroughRound={...s.breakthroughRound,responses}}return s}
const broadcast=()=>{const s=state();connections.forEach(c=>send(c,stateForStudent(c.__team)));publishControllerMessage({type:'control-state',state:s,pending:[...pendingRequests].map(([id,r])=>({id,name:r.name,team:r.team}))});renderTeacher()};
const show=id=>$(id).classList.remove('hidden'),hide=id=>$(id).classList.add('hidden');
function renderPending(){
 const root=$('pendingRequests'),count=$('pendingCount');
 if(!root||!count)return;
 const connected=teams.reduce((n,t)=>n+t.members.length,0);
 count.textContent=connected+' thành viên';
 root.replaceChildren();
 if(!connected){const p=document.createElement('p');p.className='muted';p.textContent='Chưa có học sinh kết nối.';root.append(p);return}
 teams.forEach(team=>{
  team.members.forEach(member=>{
   const row=document.createElement('article');row.className='pending-card';
   const info=document.createElement('div');info.className='pending-info';
   const avatar=document.createElement('span');avatar.className='member-list-avatar frame-'+(member.frame||'basic');avatar.textContent=member.avatar||'🙂';const name=document.createElement('strong');name.textContent=member.name;
   const detail=document.createElement('span');detail.textContent=team.avatar+' '+team.name+' · '+(Number(member.xp)||0)+' XP';const progress=document.createElement('small');progress.className='member-progress-line';progress.textContent=memberBadges(member).join(' · ');
   info.append(avatar,name,detail,progress);row.append(info);root.append(row);
  });
 });
}
function approveJoin(id){
 const request=pendingRequests.get(id);if(!request)return;
 const {conn,team,name}=request;
 if(!conn.open){pendingRequests.delete(id);renderPending();return}
 if(!teams[team]||teams[team].members.filter(m=>m.id!==id).length>=13){
  pendingRequests.delete(id);
  send(conn,{type:'join-error',message:'Đội đã đủ 13 thành viên. Hãy chọn đội khác còn chỗ.'});
  renderPending();broadcast();return;
 }
 teams.forEach(t=>t.members=t.members.filter(m=>m.id!==id));
 teams[team].members.push({id,name,avatar:'🙂',frame:'basic',xp:0,contributions:0,xpEvents:[]});conn.__team=team;conn.__name=name;
 pendingRequests.delete(id);
 send(conn,{type:'joined',state:stateForStudent(team),team,name});
 broadcast();renderPending();
}
function rejectJoin(id){
 const request=pendingRequests.get(id);if(!request)return;
 pendingRequests.delete(id);renderPending();broadcast();
 send(request.conn,{type:'join-error',message:'Giáo viên chưa chấp nhận yêu cầu tham gia phòng. Hãy liên hệ giáo viên.'});
 setTimeout(()=>{try{request.conn.close()}catch(e){}},250);
}
function renderConsensus(){
 const root=$('teamConsensus');if(!root)return;root.replaceChildren();
 if(!currentQuestion){const p=document.createElement('p');p.className='muted';p.textContent='Chưa có câu hỏi thảo luận.';root.append(p);return}
 teams.forEach((team,index)=>{
  const card=document.createElement('article');card.className='consensus-card';
  const head=document.createElement('div');head.className='consensus-head';
  const title=document.createElement('h3');title.textContent=team.name;
  const count=document.createElement('span');count.className='pill';count.textContent=team.members.length+' thành viên';
  head.append(title,count);card.append(head);
  const ballots=teamVotes[index]||{},tally={};Object.values(ballots).forEach(v=>{tally[String(v)]=(tally[String(v)]||0)+1});
  const total=Object.keys(ballots).length;
  if(questionType!=='text'&&questionOptions.length){
   const box=document.createElement('div');box.className='consensus-options';
   questionOptions.forEach((option,i)=>{const line=document.createElement('div');line.className='consensus-option';const label=document.createElement('span');label.textContent=option;const number=document.createElement('strong');number.textContent=(tally[String(i)]||0)+' phiếu';line.append(label,number);box.append(line)});card.append(box);
  }
  const texts=teamTexts[index]||[];
  if(texts.length){const list=document.createElement('div');list.className='consensus-texts';const label=document.createElement('strong');label.textContent='Ý kiến văn bản ('+texts.length+')';list.append(label);texts.slice(-5).forEach(item=>{const p=document.createElement('p');p.textContent=item.name+': '+item.text;list.append(p)});card.append(list)}
  const captain=captains[index],captainMember=team.members.find(m=>m.id===captain);
  const cap=document.createElement('p');cap.className='captain-identity';cap.textContent=captainMember?'Đội trưởng: '+captainMember.name:'Chưa bầu đội trưởng';card.append(cap);
  const final=teamFinals[index];if(final){const result=document.createElement('p');result.className='consensus-final';result.textContent='ĐÃ GỬI · Hạng '+final.rank+' · '+final.points+' điểm: '+final.answer;card.append(result)}
  const foot=document.createElement('small');foot.className='muted';foot.textContent='Lượt lựa chọn: '+total+' / '+team.members.length;card.append(foot);root.append(card);
 });
}
function closeCaptainElection(){if(captainElectionTimer){clearInterval(captainElectionTimer);captainElectionTimer=null}if(!captainElection.open)return;captainElection.open=false;captainElection.closed=true;captainRevealUntil=Date.now()+5000;teams.forEach((team,i)=>{const counts={};Object.entries(captainVotes[i]).forEach(([voter,v])=>{const x=counts[v.candidate]||(counts[v.candidate]={n:0,first:Infinity});x.n++;x.first=Math.min(x.first,v.time)});const win=Object.entries(counts).sort((a,b)=>b[1].n-a[1].n||a[1].first-b[1].first)[0];captains[i]=win?win[0]:null});syncBreakthroughCaptains();$('captainVoteStatus').textContent='Đã kết thúc bầu chọn.';renderCaptainRoster();broadcast()}
function openCaptainElection(){captainVotes=[{},{},{},{}];captains=[null,null,null,null];captainRevealUntil=0;captainElection={open:true,startedAt:Date.now(),endsAt:Date.now()+15000,closed:false};$('captainVoteStatus').textContent='Đang bầu chọn.';renderCaptainRoster();broadcast();if(captainElectionTimer)clearInterval(captainElectionTimer);captainElectionTimer=setInterval(()=>{if(!captainElection.open){clearInterval(captainElectionTimer);captainElectionTimer=null;return}if(Date.now()>=captainElection.endsAt){closeCaptainElection();return}broadcast()},250)}
function renderCaptainRoster(){const root=$('captainRoster');if(!root)return;root.replaceChildren();teams.forEach((team,i)=>{const line=document.createElement('p');const captain=team.members.find(m=>m.id===captains[i]);line.textContent=team.name+': '+(captain?captain.name:'Chưa có đội trưởng');root.append(line)})}

const reflexJobs=[["Kiến trúc sư","assets/images/phan-xa/PHAN_XA_01_Kien_truc_su.jpg",["Kiến trúc sư","Kỹ sư xây dựng","Nhà địa chất","Kỹ sư hàng không"],0],["Bác sĩ thú y","assets/images/phan-xa/PHAN_XA_02_Bac_si_thu_y.jpg",["Bác sĩ","Bác sĩ thú y","Dược sĩ","Nha sĩ"],1],["Nha sĩ","assets/images/phan-xa/PHAN_XA_03_Nha_si.jpg",["Dược sĩ","Bác sĩ thú y","Nha sĩ","Bác sĩ"],2],["Dược sĩ","assets/images/phan-xa/PHAN_XA_04_Duoc_si.jpg",["Dược sĩ","Nha sĩ","Điều dưỡng","Bác sĩ thú y"],0],["Thợ làm bánh","assets/images/phan-xa/PHAN_XA_05_Tho_lam_banh.jpg",["Đầu bếp","Thợ làm bánh","Thợ may","Nhân viên phục vụ"],1],["Thợ may","assets/images/phan-xa/PHAN_XA_06_Tho_may.jpg",["Thợ mộc","Thợ may","Thợ hàn","Thợ làm bánh"],1],["Kỹ thuật viên điện lạnh","assets/images/phan-xa/PHAN_XA_07_Ky_thuat_vien_dien_lanh.jpg",["Thợ điện","Kỹ thuật viên điện lạnh","Thợ sửa ô tô","Thợ hàn"],1],["Thợ sửa ô tô","assets/images/phan-xa/PHAN_XA_08_Tho_sua_o_to.jpg",["Kỹ thuật viên điện lạnh","Thợ mộc","Thợ sửa ô tô","Thợ hàn"],2],["Thợ mộc","assets/images/phan-xa/PHAN_XA_09_Tho_moc.jpg",["Thợ hàn","Thợ mộc","Thợ sửa ô tô","Thợ may"],1],["Thợ hàn","assets/images/phan-xa/PHAN_XA_10_Tho_han.jpg",["Thợ điện","Thợ mộc","Thợ hàn","Kỹ thuật viên điện lạnh"],2],["Kiểm lâm","assets/images/phan-xa/PHAN_XA_11_Kiem_lam.jpg",["Nhà địa chất","Kiểm lâm","Nhà khí tượng học","Hướng dẫn viên bảo tàng"],1],["Nhà khí tượng học","assets/images/phan-xa/PHAN_XA_12_Nha_khi_tuong_hoc.jpg",["Nhà khí tượng học","Nhà địa chất","Kiểm lâm","Kỹ sư hàng không"],0],["Nhà địa chất","assets/images/phan-xa/PHAN_XA_13_Nha_dia_chat.jpg",["Kiểm lâm","Nhà khí tượng học","Nhà địa chất","Kiến trúc sư"],2],["Kỹ sư hàng không","assets/images/phan-xa/PHAN_XA_14_Ky_su_hang_khong.jpg",["Phi công","Kỹ sư hàng không","Nhà địa chất","Kỹ thuật viên điện lạnh"],1],["Thủ thư","assets/images/phan-xa/PHAN_XA_15_Thu_thu.jpg",["Biên tập viên","Thủ thư","Hướng dẫn viên bảo tàng","Diễn viên"],1],["Biên tập viên","assets/images/phan-xa/PHAN_XA_16_Bien_tap_vien.jpg",["Nhiếp ảnh gia","Biên tập viên","Thủ thư","Diễn viên"],1],["Nhiếp ảnh gia","assets/images/phan-xa/PHAN_XA_17_Nhiep_anh_gia.jpg",["Nhiếp ảnh gia","Diễn viên","Biên tập viên","Hướng dẫn viên bảo tàng"],0],["Diễn viên","assets/images/phan-xa/PHAN_XA_18_Dien_vien.jpg",["Vận động viên","Diễn viên","Nhiếp ảnh gia","Biên tập viên"],1],["Vận động viên","assets/images/phan-xa/PHAN_XA_19_Van_dong_vien.jpg",["Diễn viên","Vận động viên","Hướng dẫn viên bảo tàng","Nhiếp ảnh gia"],1],["Hướng dẫn viên bảo tàng","assets/images/phan-xa/PHAN_XA_20_Huong_dan_vien_bao_tang.jpg",["Thủ thư","Biên tập viên","Hướng dẫn viên bảo tàng","Nhà khảo cổ học"],2]];
 function clearReflexTimers(){if(reflexClockTimer){clearInterval(reflexClockTimer);reflexClockTimer=null}if(reflexAutoNextTimer){clearTimeout(reflexAutoNextTimer);reflexAutoNextTimer=null}reflexCaptainTimers.forEach((t,i)=>{if(t)clearTimeout(t);reflexCaptainTimers[i]=null})}
 function startReflexCaptainWindow(team){if(!reflex.active||reflex.completed[team]||reflexTeamPhases[team].phase!=='select')return;const selectionDeadline=reflexTeamPhases[team].selectionEndsAt||reflex.selectionEndsAt,allSubmittedEarly=Date.now()<selectionDeadline;reflexTeamPhases[team]={...reflexTeamPhases[team],phase:'captain',captainEndsAt:Date.now()+5000};if(reflexCaptainTimers[team])clearTimeout(reflexCaptainTimers[team]);reflexCaptainTimers[team]=setTimeout(()=>finalizeReflexTeam(team),5000);teams[team].members.forEach(m=>{const c=connections.get(m.id);if(c)send(c,{type:'reflex-feedback',message:allSubmittedEarly?'Các thành viên đã gửi xong. Đội trưởng có tối đa 5 giây để chốt đáp án.':'Đã hết thời gian chọn. Đội trưởng có tối đa 5 giây để chốt đáp án.'})});broadcast()}
 function finalizeReflexTeam(team){if(!reflex.active||reflex.completed[team])return;const votes=Object.entries(reflexVotes[team]||{});if(!votes.length){reflexTeamPhases[team]={...reflexTeamPhases[team],phase:'closed',captainEndsAt:0};broadcast();return}const counts={};votes.forEach(([member,v])=>{const x=counts[v.option]||(counts[v.option]={count:0,last:0});x.count++;x.last=Math.max(x.last,v.time||0)});const chosen=Object.entries(counts).sort((a,b)=>b[1].count-a[1].count||b[1].last-a[1].last)[0];const option=Number(chosen[0]),job=reflexJobs[reflex.index];if(reflexCaptainTimers[team]){clearTimeout(reflexCaptainTimers[team]);reflexCaptainTimers[team]=null}if(option!==job[3]){reflexVotes[team]={};const deadline=reflexTeamPhases[team].selectionEndsAt||reflex.selectionEndsAt;reflexTeamPhases[team]={phase:Date.now()<deadline?'select':'closed',selectionEndsAt:deadline,captainEndsAt:0};teams[team].members.forEach(m=>{const c=connections.get(m.id);if(c)send(c,{type:'reflex-feedback',message:'Đáp án đa số chưa chính xác. Đội có thể chọn lại nếu còn thời gian.'})});broadcast();return}const elapsed=Date.now()-reflex.startedAt,rank=Object.keys(reflex.completed).length,points=[10,7,5,3][rank]||0;reflex.completed[team]={time:elapsed,points,option,votes:votes.length};reflexElapsed[team]+=elapsed;reflexPoints[team]+=points;teams[team].score+=points;addRoundPoints('Phản xạ',team,points);careerPoints[team]+=[10,7,5,3][rank]||0;reflexRoundResults.push({team,question:reflex.index,time:elapsed,points,careerPoints:[10,7,5,3][rank]||0});reflexTeamPhases[team]={...reflexTeamPhases[team],phase:'done',captainEndsAt:0};teams[team].members.forEach(m=>{const c=connections.get(m.id);if(c)send(c,{type:'reflex-feedback',message:'Đáp án đa số chính xác. Đội nhận '+points+' điểm.'})});broadcast()}
 function startReflexQuestion(index){
 clearReflexTimers();
 if(index>=reflexJobs.length){
  reflex.active=false;reflex.index=-1;
  $('reflexStatus').textContent='Đã hoàn thành '+reflexJobs.length+' hình ảnh.';
  $('reflexNext').disabled=true;broadcast();return;
 }
 const now=Date.now(),selectionStartsAt=now+3000,selectionEndsAt=selectionStartsAt+15000;
 roundStarted=true;
 reflex={active:true,index,startedAt:now,selectionStartsAt,selectionEndsAt,completed:{}};
 reflexVotes=[{},{},{},{}];
 reflexTeamPhases=Array.from({length:4},()=>({phase:'countdown',selectionStartsAt,selectionEndsAt,captainEndsAt:0}));
 $('reflexStatus').textContent='Câu '+(index+1)+' / '+reflexJobs.length;
 $('reflexNext').disabled=false;
 reflexClockTimer=setInterval(()=>{
  if(!reflex.active){clearReflexTimers();return}
  for(let i=0;i<4;i++){
   const phase=reflexTeamPhases[i];
   if(phase.phase==='countdown'&&Date.now()>=phase.selectionStartsAt){
    reflexTeamPhases[i]={...phase,phase:'select'};
   }
   if(reflexTeamPhases[i].phase==='select'&&Date.now()>=reflexTeamPhases[i].selectionEndsAt)startReflexCaptainWindow(i);
  }
  broadcast();
 },1000);
 reflexAutoNextTimer=setTimeout(()=>{
  if(!reflex.active||reflex.index!==index)return;
  for(let team=0;team<4;team++){
   if(reflexTeamPhases[team].phase==='captain')finalizeReflexTeam(team);
   else if(reflexTeamPhases[team].phase==='select'||reflexTeamPhases[team].phase==='countdown')startReflexCaptainWindow(team);
  }
  startReflexQuestion(index+1);
 },23000);
 broadcast();
}
function renderReflexTeacher(){const live=$('reflexLiveBoard'),board=$('reflexAchievements');if(!live||!board)return;const rows=teams.map((t,i)=>({name:t.name,done:!!reflex.completed?.[i],points:reflexPoints[i],time:reflexElapsed[i]})).sort((a,b)=>(b.points-a.points)||(a.time-b.time));live.replaceChildren();rows.forEach(r=>{const row=document.createElement('div');row.className='reflex-live-row';const name=document.createElement('strong');name.textContent=r.name;const track=document.createElement('div');track.className='reflex-track';const fill=document.createElement('span');fill.style.width=Math.max(4,Math.min(100,r.points*2))+'%';track.append(fill);const label=document.createElement('small');label.textContent=r.done?'Đã trả lời':'Đang thực hiện';row.append(name,track,label);live.append(row)});board.replaceChildren();}
 function renderReflexStudent(data){
  const panel=$('reflexStudentPanel');if(!panel)return;
  const r=data.reflex||{},selected=data.currentRound==='Phản xạ';
  panel.classList.toggle('hidden',!selected);
  const legacy=document.querySelector('.student-discussion');
  if(legacy)legacy.classList.toggle('hidden',data.currentRound!=='Khởi động');
  if(!selected||!r.active){$('reflexImageStage').classList.add('hidden');$('reflexCountdown').classList.add('hidden');return}
  const job=reflexJobs[r.index];if(!job)return;
  const teamIndex=Number.isInteger(selfTeamIndex)?selfTeamIndex:Number($('studentTeam').value);
  const isCaptain=data.captains?.[teamIndex]===connection?.peer;
  const phase=data.reflexTeamPhases?.[teamIndex]||{phase:'countdown'};
  const votes=data.reflexVotes?.[teamIndex]||{};
  const myVote=votes[connection?.peer];
  const done=!!r.completed?.[teamIndex];
  const voteCount=Object.keys(votes).length;
  const revealAt=Number(r.selectionStartsAt)||Number(r.startedAt)+3000;
  const revealKey=String(r.startedAt)+':'+String(r.index);
  $('reflexQuestionNumber').textContent='CÂU '+(r.index+1)+' / '+reflexJobs.length;
  $('reflexImage').src=job[1];
  $('reflexLeaderControls').classList.toggle('hidden',!isCaptain);
  $('reflexMemberQuiz').classList.toggle('hidden',isCaptain);
  if(window.__reflexShownKey!==revealKey){
   window.__reflexShownKey=revealKey;
   clearInterval(window.__reflexCountdownInterval);
   clearTimeout(window.__reflexRevealTimer);
   $('reflexImageStage').classList.add('hidden');
   const count=$('reflexCountdown');
   count.classList.remove('hidden');
   const updateCountdown=()=>{
    const left=Math.max(0,Math.ceil((revealAt-Date.now())/1000));
    count.textContent=String(left);
    if(left<=0){
     clearInterval(window.__reflexCountdownInterval);
     count.classList.add('hidden');
     $('reflexImageStage').classList.remove('hidden');
    }
   };
   updateCountdown();
   window.__reflexCountdownInterval=setInterval(updateCountdown,150);
   window.__reflexRevealTimer=setTimeout(updateCountdown,Math.max(0,revealAt-Date.now()));
  }else if(Date.now()>=revealAt){
   $('reflexCountdown').classList.add('hidden');
   $('reflexImageStage').classList.remove('hidden');
  }
  const options=$('reflexOptions');
  const draftKey=revealKey+':'+String(connection?.peer||'');
  if(window.__reflexDraftKey!==draftKey){
   window.__reflexDraftKey=draftKey;
   window.__reflexDraftOption=myVote?myVote.option:null;
  }
  if(myVote&&window.__reflexDraftOption===null)window.__reflexDraftOption=myVote.option;
  const canSelect=!isCaptain&&!done&&phase.phase==='select'&&Date.now()<Number(phase.selectionEndsAt||r.selectionEndsAt);
  options.replaceChildren();
  job[2].forEach((label,i)=>{
   const b=document.createElement('button');
   b.type='button';
   b.className='reflex-option'+(window.__reflexDraftOption!==null&&Number(window.__reflexDraftOption)===i?' selected':'');
   b.textContent=String.fromCharCode(65+i)+'. '+label;
   b.disabled=!canSelect;
   b.setAttribute('aria-pressed',String(window.__reflexDraftOption!==null&&Number(window.__reflexDraftOption)===i));
   b.onclick=()=>{
    window.__reflexDraftOption=i;
    options.querySelectorAll('.reflex-option').forEach((node,index)=>{
     node.classList.toggle('selected',index===i);
     node.setAttribute('aria-pressed',String(index===i));
    });
    $('reflexMemberSubmit').disabled=false;
    $('reflexMemberFeedback').textContent='Đã chọn phương án '+String.fromCharCode(65+i)+'. Nhấn GỬI ĐÁP ÁN để chuyển lựa chọn cho đội trưởng.';
   };
   options.append(b);
  });
  const memberSubmit=$('reflexMemberSubmit');
  if(memberSubmit){
   memberSubmit.classList.toggle('hidden',isCaptain);
   memberSubmit.disabled=!canSelect||window.__reflexDraftOption===null||window.__reflexDraftOption===undefined;
   memberSubmit.textContent=myVote&&myVote.option===window.__reflexDraftOption?'GỬI LẠI LỰA CHỌN':'GỬI ĐÁP ÁN CHO ĐỘI TRƯỞNG';
   memberSubmit.onclick=()=>{
    if(!canSelect||!Number.isInteger(Number(window.__reflexDraftOption)))return;
    send(connection,{type:'reflex-choice',question:r.index,option:Number(window.__reflexDraftOption)});
    memberSubmit.disabled=true;
    $('reflexMemberFeedback').textContent='Đang gửi đáp án cho đội trưởng…';
   };
  }
  const remain=Math.max(0,Math.ceil(((phase.phase==='captain'?phase.captainEndsAt:phase.selectionEndsAt)-Date.now())/1000));
  const tally=job[2].map((label,i)=>({label,count:Object.values(votes).filter(v=>v.option===i).length}));
  const lead=tally.slice().sort((a,b)=>b.count-a.count)[0];
  const tallyText=tally.filter(x=>x.count).map((x)=>x.label+': '+x.count).join(' · ');
  const feedbackText=done
   ?'Đội đã chốt đáp án và nhận '+r.completed[teamIndex].points+' điểm.'
   :isCaptain
    ?'Đã nhận '+voteCount+' lượt gửi từ thành viên.'+(tallyText?' '+tallyText:' Đang chờ thành viên gửi đáp án.')
    :phase.phase==='countdown'
     ?'Ảnh sẽ xuất hiện sau '+Math.max(0,Math.ceil((revealAt-Date.now())/1000))+' giây.'
     :myVote
      ?'Đã gửi: '+job[2][myVote.option]+'. Bạn có thể gửi lại lựa chọn trong thời gian còn lại.'
      :'Chọn một phương án, sau đó nhấn nút gửi đáp án.';
  $('reflexMemberFeedback').textContent=feedbackText;
  $('reflexCaptainFeedback').textContent=feedbackText;
  const phaseText=phase.phase==='countdown'
   ?'Chuẩn bị quan sát · '+Math.max(0,Math.ceil((revealAt-Date.now())/1000))+' giây'
   :phase.phase==='select'
    ?'Thành viên gửi đáp án trong: '+remain+' giây'
    :phase.phase==='captain'
     ?'Đội trưởng chốt trong: '+remain+' giây'
     :phase.phase==='done'?'Đã chốt đáp án':'Đã hết thời gian';
  $('reflexPhaseStatus').textContent=phaseText;
  $('reflexPhaseStatusMember').textContent=phaseText;
  $('reflexHurry').classList.add('hidden');
  $('reflexSubmitNow').textContent=phase.phase==='captain'?'CHỐT ĐÁP ÁN':'CHỜ HẾT 15 GIÂY';
  $('reflexSubmitNow').disabled=done||phase.phase!=='captain'||voteCount===0;
  $('reflexSubmitNow').onclick=()=>send(connection,{type:'reflex-captain-action',action:'submit'});
  $('reflexSubmitNow').classList.toggle('hidden',!isCaptain);
 }

const linkCats=[['work','CÔNG VIỆC'],['tools','CÔNG CỤ – THIẾT BỊ'],['skills','NĂNG LỰC – PHẨM CHẤT'],['conditions','ĐIỀU KIỆN LÀM VIỆC'],['challenges','THÁCH THỨC NGHỀ NGHIỆP']];
const linkDragAssignments={};let linkSelectedCard=null;
const linkExtra={
"Nhà hải dương học":["Tàu nghiên cứu; cảm biến biển; thiết bị đo nhiệt độ và độ mặn; máy lấy mẫu nước; GPS; phần mềm phân tích.","Phòng thí nghiệm, trung tâm nghiên cứu hoặc tàu ngoài biển; có đợt khảo sát dài ngày."],
"Kỹ sư IoT":["Cảm biến; vi điều khiển; bo mạch điện tử; máy tính; đồng hồ vạn năng; máy hiện sóng; phần mềm lập trình.","Văn phòng kỹ thuật, phòng thí nghiệm, nhà máy hoặc nơi lắp đặt thiết bị."],
"Phi công":["Máy bay; hệ thống điều khiển buồng lái; thiết bị định vị; vô tuyến; bản đồ hàng không; mô phỏng bay.","Buồng lái và sân bay; lịch bay theo ca, có thể bay đêm hoặc lưu trú xa nhà."],
"Thiết kế đồ họa":["Máy tính; bảng vẽ điện tử; màn hình đồ họa; máy ảnh; phần mềm thiết kế; thiết bị in thử.","Văn phòng, studio hoặc làm việc từ xa; thường phối hợp với khách hàng và nhóm truyền thông."],
"Đầu bếp":["Dao; thớt; nồi; chảo; bếp; lò nướng; tủ lạnh; nhiệt kế thực phẩm; dụng cụ bảo hộ.","Bếp nhà hàng, khách sạn hoặc bếp ăn; môi trường nóng, đứng lâu, làm theo ca."],
"Kế toán":["Máy tính; máy tính cầm tay; phần mềm kế toán; bảng tính; chứng từ; hệ thống lưu trữ dữ liệu.","Văn phòng hoặc bộ phận tài chính; làm việc với chứng từ, dữ liệu và thời hạn báo cáo."],
"Luật sư":["Bộ luật; hồ sơ vụ việc; máy tính; cơ sở dữ liệu pháp lý; công cụ soạn thảo văn bản.","Văn phòng luật, doanh nghiệp hoặc cơ quan tố tụng; bảo mật hồ sơ và có thể di chuyển gặp khách hàng."],
"Ngư dân":["Tàu hoặc thuyền; lưới và ngư cụ; máy định vị; thiết bị liên lạc; áo phao; dụng cụ bảo quản thủy sản.","Tàu thuyền, vùng nuôi trồng hoặc ven biển; phụ thuộc thời tiết, mùa vụ và yêu cầu an toàn trên nước."],
"Công an":["Phương tiện công vụ; thiết bị liên lạc; máy tính; phương tiện ghi nhận thông tin; trang bị bảo hộ theo nhiệm vụ.","Đơn vị công tác hoặc địa bàn được phân công; có thể trực và làm việc theo ca."],
"Thợ điện":["Kìm cách điện; tua vít cách điện; đồng hồ vạn năng; bút thử điện; thiết bị đo; phương tiện bảo hộ.","Công trình, nhà ở, nhà máy hoặc cơ sở bảo trì; có thể làm trên cao và phải tuân thủ an toàn điện."],
"Bác sĩ":["Ống nghe; máy đo huyết áp; nhiệt kế; thiết bị chẩn đoán; hồ sơ bệnh án; phương tiện bảo hộ y tế.","Bệnh viện, phòng khám hoặc cơ sở y tế; có thể trực đêm và tuân thủ quy trình kiểm soát nhiễm khuẩn."],
"Kỹ sư xây dựng":["Bản vẽ kỹ thuật; máy tính; phần mềm thiết kế; thiết bị đo đạc; dụng cụ kiểm tra vật liệu; trang bị bảo hộ.","Văn phòng thiết kế và công trường; di chuyển giữa các địa điểm, chịu ảnh hưởng thời tiết và quy định an toàn."],
"Nhân viên marketing":["Máy tính; phần mềm thiết kế; công cụ phân tích dữ liệu; nền tảng quảng cáo; thiết bị ghi hình.","Doanh nghiệp, công ty truyền thông hoặc làm từ xa; phối hợp nhiều bộ phận và theo tiến độ chiến dịch."],
"Nông dân":["Cuốc; xẻng; máy làm đất; hệ thống tưới; dụng cụ thu hoạch; thiết bị theo dõi thời tiết.","Đồng ruộng, trang trại hoặc nhà kính; hoạt động ngoài trời, phụ thuộc mùa vụ và thời tiết."],
"Giáo viên":["Sách giáo khoa; giáo án; bảng; máy tính; máy chiếu; học liệu số; thiết bị dạy học.","Trường học hoặc cơ sở giáo dục; giảng dạy theo thời khóa biểu, chuẩn bị bài và phối hợp với học sinh."],
"Lập trình viên":["Máy tính; phần mềm soạn thảo mã; trình biên dịch; hệ thống quản lý phiên bản; công cụ kiểm thử.","Văn phòng hoặc làm từ xa; sử dụng máy tính thời gian dài và làm việc theo tiến độ dự án."],
"Phi hành gia":["Bộ đồ du hành vũ trụ; hệ thống hỗ trợ sự sống; thiết bị liên lạc; bảng điều khiển; dụng cụ thí nghiệm.","Trung tâm huấn luyện và môi trường không gian có kiểm soát; yêu cầu tuyển chọn, sức khỏe và kỷ luật nghiêm ngặt."],
"Chuyên gia nghiên cứu núi lửa":["Thiết bị đo địa chấn; máy đo khí; camera nhiệt; GPS; dụng cụ lấy mẫu đá; đồ bảo hộ.","Viện nghiên cứu, phòng thí nghiệm và khu vực thực địa; có nơi địa hình khó, khí độc hoặc nguy cơ phun trào."],
"Hướng dẫn viên":["Micro; loa; bản đồ; thiết bị định vị; điện thoại; tài liệu thuyết minh; phương tiện liên lạc.","Điểm du lịch, phương tiện di chuyển và ngoài trời; lịch trình linh hoạt, thường phải đi lại."],
"Nhà khảo cổ học":["Bản đồ khảo sát; GPS; máy ảnh; thước đo; bay và chổi khai quật; túi mẫu; sổ ghi chép.","Viện nghiên cứu, bảo tàng, phòng thí nghiệm và khu khai quật; thực địa kéo dài và chịu ảnh hưởng thời tiết."]
};
function linkP(name){const p=(window.PROFESSIONS||[]).find(x=>x.name===name)||{},x=linkExtra[name]||[];return{name,work:p.work||'',tools:x[0]||'Thiết bị và dụng cụ chuyên môn phù hợp với nghề.',skills:p.skills||'',conditions:x[1]||'Làm việc tại cơ sở chuyên môn hoặc địa điểm thực hiện nhiệm vụ.',challenges:p.challenges||'',benefits:p.value||''}}
function linkParts(v){return String(v||'').split(/;|(?<=[.!?])\s+/).map(x=>x.trim()).filter(Boolean)}
function linkOrder(){return teams.map((t,i)=>i).sort((a,b)=>(teams[b].score-teams[a].score)||(reflexPoints[b]-reflexPoints[a])||(reflexElapsed[a]-reflexElapsed[b])||a-b)}
function beginLinkWork(){if(!linkRound.active||linkRound.workStarted||linkRound.order.some(t=>!linkRound.assigned[t]))return;if(linkTurnTicker){clearInterval(linkTurnTicker);linkTurnTicker=null}linkRound.workStarted=true;linkRound.turnEndsAt=0;if(!timer)startRoundCountdown();$('linkRoundStatus').textContent='Cả bốn đội đã chọn nghề. Thành viên bắt đầu phân loại thẻ.';setClock();broadcast()}
function startLinkRound(){if(linkRound.active)return;roundStarted=true;currentRound='Liên kết';seconds=roundDuration(currentRound);$('currentRound').value=currentRound;linkRound={active:true,workStarted:false,order:linkOrder(),turn:0,turnEndsAt:0,assigned:{},currentCard:null,cardVotes:{},lastAutoPick:null,selectionClosed:false};linkSelections=[{},{},{},{}];linkNotes=[[],[],[],[]];linkSummaries=[null,null,null,null];$('linkRoundStatus').textContent='';startRoundCountdown();startLinkTurn();setClock();broadcast()}
function drawLinkCardForTeam(t){if(!linkRound.active||linkRound.workStarted||linkRound.selectionClosed||linkRound.assigned[t]||linkRound.order[linkRound.turn]!==t||linkRound.currentCard)return false;const all=(window.PROFESSIONS||[]).map(p=>p.name),used=Object.values(linkRound.assigned),available=all.filter(n=>!used.includes(n));if(!available.length)return false;const name=available[Math.floor(Math.random()*available.length)];linkRound.currentCard={team:t,name,profile:linkP(name)};linkRound.cardVotes[t]={};return true}
function assignLinkCard(t,automatic=false){if(!linkRound.active||linkRound.workStarted||linkRound.selectionClosed||linkRound.order[linkRound.turn]!==t||linkRound.assigned[t])return false;if(!linkRound.currentCard||linkRound.currentCard.team!==t){if(!drawLinkCardForTeam(t))return false}const name=linkRound.currentCard.name;linkRound.assigned[t]=name;linkRound.lastAutoPick=automatic?{team:t,name}:null;linkRound.currentCard=null;linkRound.cardVotes[t]={};linkRound.turn++;linkRound.turnEndsAt=0;if(linkRound.turn>=linkRound.order.length)beginLinkWork();else startLinkTurn();broadcast();return true}
function startLinkTurn(){if(linkTurnTimer){clearTimeout(linkTurnTimer);linkTurnTimer=null}if(linkTurnTicker){clearInterval(linkTurnTicker);linkTurnTicker=null}if(!linkRound.active||linkRound.workStarted||linkRound.selectionClosed)return;if(linkRound.turn>=linkRound.order.length){beginLinkWork();return}const team=linkRound.order[linkRound.turn];linkRound.turnEndsAt=Date.now()+20000;linkTurnTicker=setInterval(()=>{if(!linkRound.active||linkRound.workStarted||linkRound.selectionClosed||linkRound.order[linkRound.turn]!==team){clearInterval(linkTurnTicker);linkTurnTicker=null;return}broadcast()},1000);linkTurnTimer=setTimeout(()=>{linkTurnTimer=null;if(linkTurnTicker){clearInterval(linkTurnTicker);linkTurnTicker=null}if(linkRound.active&&!linkRound.workStarted&&!linkRound.selectionClosed&&linkRound.order[linkRound.turn]===team&&!linkRound.assigned[team])assignLinkCard(team,true)},20000);broadcast()}
function requestLinkDraw(conn){const t=conn.__team;if(!linkRound.active||linkRound.workStarted||linkRound.selectionClosed||linkRound.assigned[t]||captains[t]!==conn.peer)return;if(linkRound.order[linkRound.turn]!==t){send(conn,{type:'link-card-feedback',message:'Hãy chờ đến lượt theo thứ hạng điểm số.'});return}if(linkRound.currentCard?.team===t)return;if(drawLinkCardForTeam(t))broadcast()}
function recordLinkCardVote(conn,choice){const t=conn.__team;if(linkRound.workStarted||linkRound.order[linkRound.turn]!==t||linkRound.currentCard?.team!==t||!['accept','reject'].includes(choice))return;linkRound.cardVotes[t]=linkRound.cardVotes[t]||{};linkRound.cardVotes[t][conn.peer]={choice};send(conn,{type:'link-card-feedback',message:'Đã ghi nhận lựa chọn.'});broadcast()}
function lockLinkCard(conn){const t=conn.__team;if(captains[t]!==conn.peer||linkRound.order[linkRound.turn]!==t||linkRound.currentCard?.team!==t||linkRound.assigned[t]||linkRound.workStarted)return;const v=Object.values(linkRound.cardVotes[t]||{}),yes=v.filter(x=>x.choice==='accept').length,no=v.filter(x=>x.choice==='reject').length;if(v.length&&no>=yes){send(conn,{type:'link-card-feedback',message:'Đa số muốn bỏ thẻ. Hãy bốc thẻ khác trong thời gian còn lại.'});return}assignLinkCard(t,false)}
function saveLinkMemberSubmission(conn,d){const t=conn.__team;if(!linkRound.active||!linkRound.workStarted||linkRound.selectionClosed||!linkRound.assigned[t])return;const selections={};linkCats.forEach(([k])=>{const a=linkParts(linkP(linkRound.assigned[t])[k]),raw=d.selections?.[k],values=Array.isArray(raw)?raw:[raw];selections[k]=[...new Set(values.map(Number).filter(n=>Number.isInteger(n)&&n>=0&&n<a.length))]});linkSelections[t][conn.peer]={name:conn.__name,selections};const note=String(d.note||'').trim().slice(0,1200);linkNotes[t]=linkNotes[t].filter(x=>x.id!==conn.peer);if(note)linkNotes[t].push({id:conn.peer,name:conn.__name,text:note});send(conn,{type:'link-member-result',message:'Đã gửi hộp thẻ về Đội trưởng.'});broadcast()}
function closeLinkSelections(){if(!linkRound.active||linkRound.selectionClosed)return;if(linkTurnTimer){clearTimeout(linkTurnTimer);linkTurnTimer=null}if(linkTurnTicker){clearInterval(linkTurnTicker);linkTurnTicker=null}linkRound.turnEndsAt=0;linkRound.selectionClosed=true;linkSummaries=teams.map((t,i)=>{const p=linkP(linkRound.assigned[i]||''),categories={};linkCats.forEach(([k,label])=>{const tally={};Object.values(linkSelections[i]||{}).forEach(v=>{(Array.isArray(v.selections?.[k])?v.selections[k]:[v.selections?.[k]]).forEach(n=>{const text=linkParts(p[k])[n];if(Number.isInteger(n)&&text)tally[text]=(tally[text]||0)+1})});categories[k]={label,items:Object.entries(tally).sort((a,b)=>b[1]-a[1]).map(([text,count])=>({text,count}))}});return{categories,notes:linkNotes[i]}});broadcast()}

const breakthroughChoices=[['duties','focus','📋','Nhiệm vụ công việc','Công việc chính và trách nhiệm hằng ngày'],['requirements','focus','🎓','Yêu cầu chuyên môn','Kiến thức, trình độ và chứng chỉ cần có'],['skills','focus','🧠','Năng lực và phẩm chất','Kỹ năng chuyên môn, giao tiếp, tư duy và thái độ'],['conditions','focus','🏢','Điều kiện làm việc','Địa điểm, thời gian và môi trường làm việc'],['challenges','focus','⚠️','Khó khăn và rủi ro','Áp lực, nguy cơ và trở ngại trong nghề'],['tools','focus','🧰','Công cụ, thiết bị','Máy móc, phần mềm và phương tiện chuyên dụng'],['changes','focus','🔄','Sự thay đổi của nghề','Nhiệm vụ thay đổi khi công nghệ phát triển'],['newskills','focus','🚀','Kỹ năng cần bổ sung','Năng lực mới để thích ứng với yêu cầu tương lai'],['official','source','🏛️','Trang thông tin chính thức','Cơ quan quản lý, tổ chức nghề nghiệp hoặc đơn vị tuyển dụng'],['research','source','📚','Tài liệu chuyên môn','Sách, báo cáo, nghiên cứu và tài liệu hướng nghiệp'],['interview','source','🎙️','Phỏng vấn người trong nghề','Trao đổi với người có kinh nghiệm thực tế'],['observe','source','🔍','Quan sát thực tế','Tìm hiểu nơi làm việc và cách công việc được thực hiện'],['survey','source','📝','Khảo sát, bảng hỏi','Thu thập ý kiến từ người làm nghề'],['jobpost','source','💼','Thông tin tuyển dụng','Đối chiếu mô tả công việc và yêu cầu tuyển dụng'],['expert','source','👥','Chuyên gia, cơ sở đào tạo','Trao đổi với chuyên gia hoặc cơ sở đào tạo'],['crosscheck','verify','🔗','Đối chiếu nhiều nguồn','So sánh thông tin từ ít nhất hai nguồn độc lập'],['author','verify','✍️','Kiểm tra tác giả và đơn vị','Xác định người viết và tổ chức chịu trách nhiệm'],['date','verify','🗓️','Kiểm tra thời điểm cập nhật','Xem ngày đăng, ngày cập nhật và tính phù hợp'],['evidence','verify','📊','Kiểm tra bằng chứng','Tìm số liệu, tài liệu gốc hoặc dẫn chứng xác minh']].map(([id,group,icon,title,detail])=>({id,group,icon,title,detail}));
const breakthroughGroups=[['focus','NỘI DUNG CẦN TÌM HIỂU'],['source','NGUỒN VÀ CÁCH TÌM HIỂU'],['verify','KIỂM CHỨNG THÔNG TIN']];
function beginBreakthroughWork(){if(!breakthroughRound.active||breakthroughRound.workStarted||breakthroughRound.order.some(t=>!Number.isInteger(breakthroughRound.assigned[t])))return;if(breakthroughTurnTicker){clearInterval(breakthroughTurnTicker);breakthroughTurnTicker=null}breakthroughRound.workStarted=true;breakthroughRound.turnEndsAt=0;if(!timer)startRoundCountdown();syncBreakthroughRound();setClock();broadcast()}
function startBreakthroughRound(){if(breakthroughRound.active)return;roundStarted=true;currentRound='Bứt phá';seconds=roundDuration(currentRound);breakthroughDeadline=Date.now()+seconds*1000;breakthroughFinalAssignments={};$('currentRound').value=currentRound;breakthroughRound={active:true,workStarted:false,order:linkOrder(),turn:0,turnEndsAt:0,assigned:{},lastAutoPick:null,closed:false,responses:[{},{},{},{}]};breakthroughAssessments=[null,null,null,null];breakthroughConfirmed.clear();Object.keys(breakthroughDrafts).forEach(k=>delete breakthroughDrafts[k]);startRoundCountdown();syncBreakthroughRound();startBreakthroughTurn();setClock();broadcast()}
function startBreakthroughTurn(){if(breakthroughTurnTimer)clearTimeout(breakthroughTurnTimer);breakthroughTurnTimer=null;if(breakthroughTurnTicker){clearInterval(breakthroughTurnTicker);breakthroughTurnTicker=null}if(!breakthroughRound.active||breakthroughRound.closed||breakthroughRound.workStarted)return;if(breakthroughRound.turn>=breakthroughRound.order.length){beginBreakthroughWork();return}const t=breakthroughRound.order[breakthroughRound.turn];breakthroughRound.turnEndsAt=Date.now()+20000;breakthroughTurnTicker=setInterval(()=>{if(!breakthroughRound.active||breakthroughRound.closed||breakthroughRound.workStarted||breakthroughRound.order[breakthroughRound.turn]!==t){clearInterval(breakthroughTurnTicker);breakthroughTurnTicker=null;return}broadcast()},1000);breakthroughTurnTimer=setTimeout(()=>{breakthroughTurnTimer=null;if(breakthroughTurnTicker){clearInterval(breakthroughTurnTicker);breakthroughTurnTicker=null}if(breakthroughRound.active&&!breakthroughRound.closed&&!breakthroughRound.workStarted&&breakthroughRound.order[breakthroughRound.turn]===t&&breakthroughRound.assigned[t]===undefined)drawBreakthroughScenario(t,true)},20000);broadcast()}
function drawBreakthroughScenario(t,automatic=false){if(!breakthroughRound.active||breakthroughRound.closed||breakthroughRound.workStarted||breakthroughRound.assigned[t]!==undefined||breakthroughRound.order[breakthroughRound.turn]!==t)return false;const pool=(window.SCENARIOS||[]).map((s,i)=>i).filter(i=>!Object.values(breakthroughRound.assigned).includes(i));if(!pool.length)return false;if(breakthroughTurnTimer)clearTimeout(breakthroughTurnTimer);breakthroughTurnTimer=null;if(breakthroughTurnTicker){clearInterval(breakthroughTurnTicker);breakthroughTurnTicker=null}const index=pool[Math.floor(Math.random()*pool.length)];breakthroughRound.assigned[t]=index;breakthroughFinalAssignments={...breakthroughRound.assigned};breakthroughRound.lastAutoPick=automatic?{team:t,index}:null;syncBreakthroughRound();breakthroughRound.turn++;breakthroughRound.turnEndsAt=0;if(breakthroughRound.turn>=breakthroughRound.order.length)beginBreakthroughWork();else startBreakthroughTurn();broadcast();return true}
function closeBreakthroughRound(){if(!breakthroughRound.active||breakthroughRound.closed)return;if(breakthroughTurnTimer)clearTimeout(breakthroughTurnTimer);breakthroughTurnTimer=null;if(breakthroughTurnTicker){clearInterval(breakthroughTurnTicker);breakthroughTurnTicker=null}breakthroughRound.turnEndsAt=0;breakthroughRound.closed=true;breakthroughFinalAssignments={...breakthroughRound.assigned};breakthroughDeadline=Math.min(breakthroughDeadline||Date.now(),Date.now());syncBreakthroughRound();broadcast()}
function saveBreakthroughSubmission(conn,ids,note=''){const t=conn.__team;if(!breakthroughRound.active||!breakthroughRound.workStarted||breakthroughRound.closed||!Number.isInteger(breakthroughRound.assigned[t]))return;const valid=new Set(breakthroughChoices.map(x=>x.id)),selected=[...new Set((Array.isArray(ids)?ids:[]).filter(x=>valid.has(x)))],cleanNote=String(note||'').trim().slice(0,1200);if(!selected.length&&!cleanNote){send(conn,{type:'breakthrough-feedback',message:'Hãy chọn nội dung hoặc ghi ý kiến đóng góp trước khi gửi.'});return}breakthroughRound.responses[t][conn.peer]={name:conn.__name,ids:selected,note:cleanNote,time:Date.now()};send(conn,{type:'breakthrough-feedback',message:'Đã ghi nhận đóng góp của bạn cho đội.'});broadcast()}
function renderBreakthroughAdmin(data,id){const root=$(id);if(!root)return;root.replaceChildren();const br=data?.breakthroughRound;if(!br?.active){root.textContent='Chưa bắt đầu vòng Bứt phá.';return}(br.order||[]).forEach(t=>{const row=document.createElement('div');row.className='breakthrough-admin-row';const name=document.createElement('strong'),num=document.createElement('span');name.textContent=data.teams?.[t]?.name||('Đội '+(t+1));num.textContent=br.assigned?.[t]!==undefined?'Tình huống số '+String(br.assigned[t]+1).padStart(2,'0'):'Đang chờ bốc thăm';row.append(name,num);root.append(row)})}
function renderBreakthroughStudent(data){
 const stage=$('breakthroughStudentStage'),br=data.breakthroughRound||{},selected=data.currentRound==='Bứt phá';stage.classList.toggle('hidden',!selected);if(!selected)return;
 const t=Number(selfTeamIndex),captain=data.captains?.[t]===connection?.peer,idx=br.assigned?.[t],active=br.order?.[br.turn],status=$('breakthroughStageStatus'),draw=$('breakthroughDraw'),scenario=$('breakthroughScenario'),area=$('breakthroughSelectionArea'),summary=$('breakthroughCaptainSummary');
 draw.onclick=()=>send(connection,{type:'breakthrough-draw-request'});
 status.textContent=!br.active?'Chờ giáo viên bắt đầu vòng Bứt phá.':br.closed?'Đã kết thúc thời gian giải quyết.':!br.workStarted&&idx!==undefined?'Đã nhận tình huống · Chờ các đội còn lại chọn xong.':br.workStarted?'Đang trong thời gian giải quyết tình huống.':active===t?'Đến lượt đội bạn · '+Math.max(0,Math.ceil((br.turnEndsAt-Date.now())/1000))+' giây để RANDOM SELECTION':active!==undefined?'Đang chờ '+(data.teams?.[active]?.name||'đội trước')+' chọn tình huống':'Các đội đã nhận tình huống.';
 if(br.lastAutoPick?.team===t&&idx===br.lastAutoPick.index)status.textContent='Hết 20 giây, hệ thống tự chọn tình huống số '+String(idx+1).padStart(2,'0');
 draw.textContent='RANDOM SELECTION';draw.classList.toggle('hidden',!br.active||br.workStarted||!captain||idx!==undefined||br.closed||active!==t);draw.disabled=!captain||br.closed||br.workStarted||active!==t;scenario.classList.toggle('hidden',idx===undefined);area.classList.toggle('hidden',!br.workStarted||idx===undefined||captain||br.closed);summary.classList.toggle('hidden',!br.workStarted||idx===undefined||!captain);if(idx===undefined)return;
 let tarot=$('breakthroughTarotCard');if(!tarot){tarot=document.createElement('div');tarot.id='breakthroughTarotCard';tarot.className='breakthrough-tarot-card';const front=document.createElement('div'),back=document.createElement('div');front.className='breakthrough-tarot-face breakthrough-tarot-front';back.className='breakthrough-tarot-face breakthrough-tarot-back';front.innerHTML='<span class="tarot-ornament">✦</span><strong>BỨT PHÁ</strong><small>CHỌN VẬN MAY</small><span class="tarot-question">?</span>';back.innerHTML='<span class="tarot-ornament">✦</span><strong>TÌNH HUỐNG ĐÃ CHỐT</strong><small class="tarot-number"></small><span class="tarot-seal">✧</span>';tarot.append(front,back);scenario.insertBefore(tarot,scenario.firstChild);void tarot.offsetWidth}tarot.querySelector('.tarot-number').textContent='SỐ '+String(idx+1).padStart(2,'0');tarot.classList.add('is-flipped');
 const item=(window.SCENARIOS||[])[idx];if(!item)return;$('breakthroughScenarioNumber').textContent='TÌNH HUỐNG SỐ '+String(idx+1).padStart(2,'0');$('breakthroughScenarioTitle').textContent=item.title||'Tình huống nghề nghiệp';$('breakthroughScenarioContext').textContent=item.context||'';$('breakthroughScenarioTask').textContent=item.task||'';
 if(!captain&&!br.closed){const key=t+':'+connection.peer,submitted=br.responses?.[t]?.[connection.peer],draft=breakthroughDrafts[key]||(breakthroughDrafts[key]=new Set(submitted?.ids||[])),pool=$('breakthroughChoicePool');pool.replaceChildren();breakthroughGroups.forEach(([group,label])=>{const sec=document.createElement('section');sec.className='breakthrough-choice-group';const hd=document.createElement('h3');hd.textContent=label;const grid=document.createElement('div');grid.className='breakthrough-choice-grid';breakthroughChoices.filter(x=>x.group===group).forEach(choice=>{const btn=document.createElement('button');btn.type='button';btn.className='breakthrough-choice-card';btn.classList.toggle('is-selected',draft.has(choice.id));const icon=document.createElement('span'),copy=document.createElement('span'),title=document.createElement('strong'),detail=document.createElement('small');icon.className='breakthrough-choice-icon';icon.textContent=choice.icon;title.textContent=choice.title;detail.textContent=choice.detail;copy.append(title,detail);btn.append(icon,copy);btn.addEventListener('click',()=>{if(draft.has(choice.id))draft.delete(choice.id);else draft.add(choice.id);btn.classList.toggle('is-selected',draft.has(choice.id));$('breakthroughSelectedCount').textContent=draft.size+' nội dung đã chọn'});grid.append(btn)});sec.append(hd,grid);pool.append(sec)});$('breakthroughSelectedCount').textContent=draft.size+' nội dung đã chọn';let note=$('breakthroughMemberNote');if(!note){note=document.createElement('textarea');note.id='breakthroughMemberNote';note.rows=3;note.maxLength=1200;note.placeholder='Ghi thêm ý kiến hoặc giải thích để đội trưởng tổng hợp…';note.className='breakthrough-member-note';area.insertBefore(note,$('breakthroughSubmit'))}note.value=note.value||submitted?.note||breakthroughNotes[key]||'';note.oninput=()=>{breakthroughNotes[key]=note.value};note.disabled=!!br.closed;$('breakthroughSubmit').disabled=!!br.closed;$('breakthroughSubmitStatus').textContent=submitted?'Đã ghi nhận đóng góp. Bạn có thể cập nhật trước khi hết giờ.':'Chọn thẻ hoặc ghi ý kiến rồi gửi cho đội trưởng.';$('breakthroughSubmit').onclick=()=>send(connection,{type:'breakthrough-submit',ids:[...draft],note:note.value})}

 const teamResult=data.breakthroughAssessments?.[t];if(!captain&&teamResult){let box=$('breakthroughMemberFeedback');if(!box){box=document.createElement('section');box.id='breakthroughMemberFeedback';box.className='breakthrough-student-feedback';stage.append(box)}box.replaceChildren();const title=document.createElement('h3'),message=document.createElement('p');title.textContent='PHẢN HỒI CỦA ĐỘI · '+(Number.isInteger(teamResult.total_score)?teamResult.total_score+'/100':'ĐANG CHỜ ĐÁNH GIÁ');message.textContent=teamResult.feedback?.overall_message||'Đội đã nhận được kết quả đánh giá.';box.append(title,message);(teamResult.criteria||[]).forEach(c=>{const p=document.createElement('p');p.textContent=c.label+': '+(Number.isInteger(c.score)?c.score+'/'+c.max:'Chờ giáo viên xem xét')+'. '+(c.strengths?'Điểm phù hợp: '+c.strengths+'. ':'')+(c.evidence?'Dẫn chứng: “'+c.evidence+'”. ':'')+(c.issue?'Cần hoàn thiện: '+c.issue+'. ':'')+(c.explanation||'')+(c.question?' Câu hỏi gợi mở: '+c.question:'')+(c.suggestion?' Gợi ý: '+c.suggestion:'');box.append(p)})}else if(!captain)$('breakthroughMemberFeedback')?.remove();

 if(captain){const previous=$('breakthroughTeamAnswer')?.value||breakthroughFinalDrafts[t]||'';summary.replaceChildren();const hd=document.createElement('h3');hd.textContent='TỔNG HỢP ĐÓNG GÓP CỦA THÀNH VIÊN';summary.append(hd);const responses=br.responses?.[t]||{},members=Object.values(responses),count=document.createElement('p');count.textContent=members.length+' / '+(data.teams?.[t]?.members?.length||0)+' thành viên đã đóng góp';summary.append(count);members.forEach(m=>{const p=document.createElement('p'),titles=(m.ids||[]).map(id=>breakthroughChoices.find(x=>x.id===id)?.title).filter(Boolean);p.textContent=m.name+': '+titles.join(', ')+(m.note?' · '+m.note:'');summary.append(p)});breakthroughGroups.forEach(([group,label])=>{const sec=document.createElement('section'),h=document.createElement('h4');h.textContent=label;sec.append(h);const tally={};members.forEach(m=>(m.ids||[]).forEach(id=>{if(breakthroughChoices.find(x=>x.id===id)?.group===group)tally[id]=(tally[id]||0)+1}));const sorted=Object.entries(tally).sort((a,b)=>b[1]-a[1]);if(!sorted.length){const p=document.createElement('p');p.textContent='Chưa có lựa chọn.';sec.append(p)}sorted.forEach(([id,n])=>{const x=breakthroughChoices.find(x=>x.id===id),p=document.createElement('p');p.textContent=x.icon+' '+x.title+' · '+n+' lượt';sec.append(p)});summary.append(sec)});const label=document.createElement('label');label.className='field';const span=document.createElement('span');span.textContent='CÂU TRẢ LỜI CHUNG CỦA ĐỘI';const answer=document.createElement('textarea');answer.id='breakthroughTeamAnswer';answer.rows=7;answer.maxLength=8000;answer.placeholder='Tổng hợp phương án giải quyết tình huống, nguồn và phương pháp tìm hiểu, lý do lựa chọn…';answer.value=previous;const currentResult=data.breakthroughAssessments?.[t];answer.disabled=!!br.closed||currentResult?.status==='confirmed';answer.addEventListener('input',()=>{breakthroughFinalDrafts[t]=answer.value});label.append(span,answer);summary.append(label);const submit=document.createElement('button');submit.type='button';submit.className='btn';submit.textContent='GỬI BÀI LÀM CHUNG ĐỂ ĐÁNH GIÁ';submit.disabled=!!br.closed||currentResult?.status==='confirmed';submit.addEventListener('click',()=>send(connection,{type:'breakthrough-team-submit',answer:answer.value}));summary.append(submit);const result=data.breakthroughAssessments?.[t];if(result){const box=document.createElement('section');box.className='breakthrough-student-feedback';const title=document.createElement('h3'),message=document.createElement('p');title.textContent='PHẢN HỒI ĐÁNH GIÁ · '+result.total_score+'/100';message.textContent=result.feedback?.overall_message||'Đội đã nhận được kết quả đánh giá.';box.append(title,message);(result.criteria||[]).forEach(c=>{const p=document.createElement('p');p.textContent=c.label+': '+(Number.isInteger(c.score)?c.score+'/'+c.max:'Chờ giáo viên xem xét')+'. '+(c.strengths?'Điểm phù hợp: '+c.strengths+'. ':'')+(c.evidence?'Dẫn chứng: “'+c.evidence+'”. ':'')+(c.issue?'Cần hoàn thiện: '+c.issue+'. ':'')+(c.explanation||'')+(c.question?' Câu hỏi gợi mở: '+c.question:'')+(c.suggestion?' Gợi ý: '+c.suggestion:'');box.append(p)});summary.append(box)}}
}
const linkProfessionImages={"Nhà hải dương học":"assets/images/lien-ket/LIEN_KET_01 – Nhà hải dương học.jpg","Kỹ sư IoT":"assets/images/lien-ket/LIEN_KET_02 – Kỹ sư IoT.jpg","Phi công":"assets/images/lien-ket/LIEN_KET_03 – Phi công.jpg","Thiết kế đồ họa":"assets/images/lien-ket/LIEN_KET_04 – Nhà thiết kế đồ họa.jpg","Đầu bếp":"assets/images/lien-ket/LIEN_KET_05 – Đầu bếp.jpg","Kế toán":"assets/images/lien-ket/LIEN_KET_06 – Kế toán.jpg","Luật sư":"assets/images/lien-ket/LIEN_KET_07 – Luật sư.jpg","Ngư dân":"assets/images/lien-ket/LIEN_KET_08 – Ngư dân.jpg","Công an":"assets/images/lien-ket/LIEN_KET_09 – Cảnh sát.jpg","Thợ điện":"assets/images/lien-ket/LIEN_KET_10 – Thợ điện.jpg","Bác sĩ":"assets/images/lien-ket/LIEN_KET_11 – Bác sĩ.jpg","Kỹ sư xây dựng":"assets/images/lien-ket/LIEN_KET_12 – Kỹ sư xây dựng.jpg","Nhân viên marketing":"assets/images/lien-ket/LIEN_KET_13 – Nhân viên marketing.jpg","Nông dân":"assets/images/lien-ket/LIEN_KET_14 – Nông dân.jpg","Giáo viên":"assets/images/lien-ket/LIEN_KET_15 – Giáo viên.jpg","Lập trình viên":"assets/images/lien-ket/LIEN_KET_16 – Lập trình viên.jpg","Phi hành gia":"assets/images/lien-ket/LIEN_KET_17 – Phi hành gia.jpg","Chuyên gia nghiên cứu núi lửa":"assets/images/lien-ket/LIEN_KET_18 – Nhà nghiên cứu núi lửa.jpg","Hướng dẫn viên":"assets/images/lien-ket/LIEN_KET_19 – Hướng dẫn viên du lịch.jpg","Nhà khảo cổ học":"assets/images/lien-ket/LIEN_KET_20 – Nhà khảo cổ học.jpg"};
function professionPhoto(name){return linkProfessionImages[name]||''}
function professionEmoji(name){if(/hải dương|ngư dân|nông dân/.test(name.toLowerCase()))return'🌊';if(/phi công|phi hành gia/.test(name.toLowerCase()))return'✈️';if(/đầu bếp/.test(name.toLowerCase()))return'👨‍🍳';if(/bác sĩ/.test(name.toLowerCase()))return'🩺';if(/giáo viên|khảo cổ|luật sư/.test(name.toLowerCase()))return'📚';if(/công an|cảnh sát/.test(name.toLowerCase()))return'🛡️';if(/lập trình|iot|kỹ sư/.test(name.toLowerCase()))return'💻';return'🧰'}
function renderLinkStudent(d){
 const stage=$('linkStudentStage'),lr=d.linkRound||{},selected=d.currentRound==='Liên kết';stage.classList.toggle('hidden',!selected);if(!selected)return;if(!lr.active){$('linkStageStatus').textContent='Giáo viên đã chọn vòng Liên Kết. Chờ bắt đầu hoạt động.';['linkDrawCard','linkDrawActions','linkReviewButton','linkReviewCard','linkSelectionArea','linkCaptainSummary'].forEach(id=>$(id).classList.add('hidden'));return}
 const t=Number(selfTeamIndex),captain=d.captains?.[t]===connection?.peer,assigned=lr.assigned?.[t],card=lr.currentCard;
 const activeTurn=lr.order?.[lr.turn],turnRemaining=activeTurn===t&&lr.turnEndsAt?Math.max(0,Math.ceil((lr.turnEndsAt-Date.now())/1000)):0;$('linkStageStatus').textContent=lr.selectionClosed?'Đã hết thời gian.':lr.workStarted?'Cả bốn đội đã chọn nghề · Thành viên bắt đầu phân loại thẻ.':assigned?'Đội đã chọn: '+assigned+' · Chờ các đội còn lại.':activeTurn===t?'Đến lượt đội bạn · '+turnRemaining+' giây để RANDOM SELECTION':activeTurn!==undefined?'Đang chờ '+(d.teams?.[activeTurn]?.name||'đội trước')+' chọn thẻ':'Đang chờ các đội chọn nghề';if(lr.lastAutoPick?.team===t&&assigned===lr.lastAutoPick.name)$('linkStageStatus').textContent='Hết 20 giây, hệ thống tự chọn nghề: '+assigned;
 const draw=$('linkDrawCard'),actions=$('linkDrawActions');draw.classList.toggle('hidden',!card||card.team!==t);
 const canDraw=!!captain&&!assigned&&!lr.selectionClosed&&!lr.workStarted&&lr.order?.[lr.turn]===t;actions.classList.toggle('hidden',!(canDraw||(!!card&&card.team===t)));
 if(card?.team===t){draw.replaceChildren();const title=document.createElement('h3');title.textContent=card.name;draw.append(title);const layout=document.createElement('div');layout.className='profession-card-layout';const visual=document.createElement('div');visual.className='profession-card-visual';const photo=professionPhoto(card.name);if(photo){const img=document.createElement('img');img.src=photo;img.alt='Hình ảnh nghề '+card.name;visual.append(img)}else{const icon=document.createElement('span');icon.textContent=professionEmoji(card.name);visual.append(icon)}const details=document.createElement('div');details.className='profession-card-details';
  [['work','MÔ TẢ NGHỀ NGHIỆP'],['conditions','ĐIỀU KIỆN ĐÁP ỨNG CÔNG VIỆC'],['challenges','KHÓ KHĂN'],['benefits','LỢI ÍCH']].forEach(([key,label])=>{const article=document.createElement('article'),heading=document.createElement('b'),p=document.createElement('p');heading.textContent=label;p.textContent=card.profile?.[key]||'';article.append(heading,p);details.append(article)});layout.append(visual,details);draw.append(layout);
  const v=Object.values(lr.cardVotes?.[t]||{});$('linkCardVoteStatus').textContent='Lấy: '+v.filter(x=>x.choice==='accept').length+' · Bỏ: '+v.filter(x=>x.choice==='reject').length}
 $('linkRandomSelection').classList.toggle('hidden',!canDraw||!!card);$('linkRandomSelection').disabled=!canDraw||!!card;
 $('linkAcceptCard').classList.toggle('hidden',captain||!card||card.team!==t);$('linkRejectCard').classList.toggle('hidden',captain||!card||card.team!==t);$('linkCaptainLock').classList.toggle('hidden',!captain||!card||card.team!==t);$('linkCaptainDrawNext').classList.toggle('hidden',!captain||!card||card.team!==t);
 $('linkCaptainDrawNext').disabled=!canDraw||!card;$('linkCaptainLock').disabled=!canDraw||!card||card.team!==t;
 const review=$('linkReviewButton'),reviewCard=$('linkReviewCard');review.classList.toggle('hidden',!assigned);
 review.onclick=()=>{const opening=reviewCard.classList.contains('hidden');reviewCard.classList.toggle('hidden',!opening);review.textContent=opening?'ĐÓNG THẺ NGHỀ':'XEM LẠI THẺ NGHỀ';if(opening){const p=linkP(assigned);reviewCard.replaceChildren();const h=document.createElement('h3');h.textContent=assigned;reviewCard.append(h);const layout=document.createElement('div');layout.className='profession-card-layout';const visual=document.createElement('div');visual.className='profession-card-visual';const photo=professionPhoto(assigned);if(photo){const img=document.createElement('img');img.src=photo;img.alt='Hình ảnh nghề '+assigned;visual.append(img)}else{const icon=document.createElement('span');icon.textContent=professionEmoji(assigned);visual.append(icon)}const details=document.createElement('div');details.className='profession-card-details';
  [['work','MÔ TẢ NGHỀ NGHIỆP'],['conditions','ĐIỀU KIỆN ĐÁP ỨNG CÔNG VIỆC'],['challenges','KHÓ KHĂN'],['benefits','LỢI ÍCH']].forEach(([k,l])=>{const sec=document.createElement('section'),b=document.createElement('b'),v=document.createElement('p');b.textContent=l;v.textContent=p[k]||'';sec.append(b,v);details.append(sec)});layout.append(visual,details);reviewCard.append(layout)}};
 const area=$('linkSelectionArea'),sum=$('linkCaptainSummary');area.classList.toggle('hidden',!lr.workStarted||!assigned||lr.selectionClosed||captain);sum.classList.toggle('hidden',!lr.workStarted||!captain);review.classList.toggle('hidden',!lr.workStarted||!assigned);
 if(assigned&&!captain&&!lr.selectionClosed){const p=linkP(assigned),pool=$('linkCardPool'),root=$('linkMemberBoxes'),key=t+':'+connection.peer;
  if(!linkDragAssignments[key]){const cards=[];linkCats.forEach(([k,label])=>linkParts(p[k]).forEach((value,i)=>cards.push({id:k+'-'+i,category:k,label,value})));for(let i=cards.length-1;i>0;i--){const n=Math.floor(Math.random()*(i+1));[cards[i],cards[n]]=[cards[n],cards[i]]}linkDragAssignments[key]={cards,placed:{}}}
  const saved=linkDragAssignments[key];pool.replaceChildren();root.replaceChildren();
  const addCard=(parent,item)=>{const el=document.createElement('button');el.type='button';el.className='link-draggable-card';el.draggable=true;el.dataset.cardId=item.id;el.textContent=item.value;el.addEventListener('dragstart',e=>{linkSelectedCard=item.id;e.dataTransfer.setData('text/plain',item.id)});el.addEventListener('click',()=>{linkSelectedCard=item.id;document.querySelectorAll('.link-draggable-card').forEach(x=>x.classList.toggle('is-selected',x.dataset.cardId===item.id))});parent.append(el)};
  saved.cards.forEach(item=>{if(!saved.placed[item.id])addCard(pool,item)});
  linkCats.forEach(([k,label])=>{const box=document.createElement('section');box.className='link-member-box link-drop-box';box.dataset.linkCategory=k;const h=document.createElement('h3'),contents=document.createElement('div');h.textContent=label;contents.className='link-drop-content';box.append(h,contents);
   const place=id=>{const item=saved.cards.find(x=>x.id===id);if(!item)return;saved.placed[id]=k;linkSelectedCard=null;renderLinkStudent(d)};
   box.addEventListener('dragover',e=>e.preventDefault());box.addEventListener('drop',e=>{e.preventDefault();place(e.dataTransfer.getData('text/plain')||linkSelectedCard)});box.addEventListener('click',()=>{if(linkSelectedCard)place(linkSelectedCard)});
   saved.cards.filter(x=>saved.placed[x.id]===k).forEach(item=>addCard(contents,item));root.append(box)});
  $('linkSubmitSelections').disabled=!!d.linkSelections?.[t]?.[connection.peer];
 }
 if(captain){sum.replaceChildren();const h=document.createElement('h3');h.textContent='TỔNG HỢP HỘP THẺ';sum.append(h);
  linkCats.forEach(([k,label])=>{const sec=document.createElement('section'),hd=document.createElement('h4');hd.textContent=label;sec.append(hd);const result=lr.selectionClosed?d.linkSummaries?.[t]?.categories?.[k]?.items:[];(result||[]).forEach(x=>{const p=document.createElement('p');p.textContent=x.text+' · '+x.count+' lượt';sec.append(p)});if(!result?.length){const p=document.createElement('p');p.textContent='Chưa có dữ liệu.';sec.append(p)}sum.append(sec)});
  (lr.selectionClosed?d.linkSummaries?.[t]?.notes||[]:[]).forEach(n=>{const p=document.createElement('p');p.textContent=n.name+': '+n.text;sum.append(p)})}
}

function renderTeacher(){
 renderRoundWinnerCelebration(state());renderRoundControls(currentRound,'teacher');renderReflexTeacher();renderBreakthroughAdmin(state(),'teacherBreakthroughStatus');renderBreakthroughAssessments();$('liveBoardToggle').textContent='MỞ BẢNG ĐIỀU PHỐI';$('liveBoardToggle').classList.toggle('hidden',!roundStarted||liveBoardVisible||winnerCelebration.endsAt>Date.now());renderLiveBoard(state(),'teacherLiveBoard');renderRoundRanking(state(),'achievementRoundSelect','reflexAchievements');renderBootReview(state(),'teacher');
 $('memberCount').textContent=teams.reduce((n,t)=>n+t.members.length,0)+' thành viên';$('scoreboard').replaceChildren();
 teams.forEach(t=>{const card=document.createElement('article');card.className='score-card';const h=document.createElement('h3');h.className='team-brand-line';const swatch=document.createElement('span');swatch.className='team-swatch';swatch.style.setProperty('--team-accent',TEAM_COLORS.find(x=>x.id===t.color)?.value||'#43d9ff');const symbol=document.createElement('span');symbol.className='team-symbol';symbol.textContent=t.avatar||'🌟';const teamName=document.createElement('span');teamName.textContent=t.name;h.append(swatch,symbol,teamName);card.style.setProperty('--team-accent',TEAM_COLORS.find(x=>x.id===t.color)?.value||'#43d9ff');const score=document.createElement('div');score.className='score';score.textContent=t.score+' điểm';const members=document.createElement('small');members.textContent=t.members.length+' thành viên đang kết nối · '+(careerPoints[teams.indexOf(t)]||0)+' điểm nghề nghiệp';card.append(h,score,members);if(t.slogan){const slogan=document.createElement('small');slogan.className='team-slogan';slogan.textContent=t.slogan;card.append(slogan)}const badges=teamBadges(t);if(badges.length){const row=document.createElement('div');row.className='team-badges';badges.forEach(label=>{const b=document.createElement('span');b.className='team-achievement-badge';b.textContent=label;row.append(b)});card.append(row)}$('scoreboard').append(card)});
 renderConsensus();renderCaptainRoster();const race=$('raceResults');if(race){race.replaceChildren();raceOrder.forEach(x=>{const row=document.createElement('div');row.className='race-result';row.textContent=(teams[x.team].name)+' · Hạng '+x.rank+' · '+x.points+' điểm · '+x.answer;race.append(row)})}
}
function applyRoundTheme(round){const themes={'Khởi động':'warmup','Phản xạ':'reflex','Liên kết':'link','Bứt phá':'breakthrough','Luyện tập':'practice','Vận dụng':'application'};document.body.dataset.roundTheme=themes[round]||'warmup'}
 function playIntroFromState(data){if(data?.roundMusicActive===false){window.GameSound?.stop?.();return}const intro=data?.roundIntro;if(!intro?.id||window.__playedRoundIntroId===intro.id)return;window.__playedRoundIntroId=intro.id;window.GameSound?.roundIntro?.(intro.round)}
 function renderRoundControls(round,scope){applyRoundTheme(round);const ids=scope==='controller'?['controllerWarmupControls','controllerReflexControls','controllerLinkControls','controllerBreakthroughControls','controllerFutureRoundControls']:['warmupControls','reflexControls','linkControls','breakthroughControls','futureRoundControls'];const [warmId,reflexId,linkId,breakthroughId,futureId]=ids,warm=$(warmId),reflex=$(reflexId),link=$(linkId),breakthrough=$(breakthroughId),future=$(futureId);if(!warm||!reflex||!link||!breakthrough||!future)return;warm.classList.toggle('hidden',round!=='Khởi động');reflex.classList.toggle('hidden',round!=='Phản xạ');link.classList.toggle('hidden',round!=='Liên kết');breakthrough.classList.toggle('hidden',round!=='Bứt phá');future.classList.toggle('hidden',['Khởi động','Phản xạ','Liên kết','Bứt phá'].includes(round))}
function renderRoundRanking(data,selectId,rootId){
 const select=$(selectId),root=$(rootId);if(!root||!data)return;const round=select?.value||data.currentRound||'Khởi động',rows=roundRows(data,round);root.replaceChildren();
 rows.forEach((r,i)=>{const row=document.createElement('div');row.className='reflex-achievement-row';const rank=document.createElement('b');rank.textContent=String(i+1).padStart(2,'0');const name=document.createElement('strong');name.textContent=r.team;const points=document.createElement('span');points.textContent=r.points+' điểm';const status=document.createElement('b');status.textContent=i===0&&r.points>0?'Dẫn đầu':' ';row.append(rank,name,points,status);root.append(row)});
}
function renderBootReview(data,scope='teacher'){
 if(!data)return;const prefix=scope==='controller'?'controller':'boot',select=$(prefix==='boot'?'bootReviewTeam':'controllerBootReviewTeam'),answer=$(prefix==='boot'?'bootReviewAnswer':'controllerBootReviewAnswer'),status=$(prefix==='boot'?'bootReviewStatus':'controllerBootReviewStatus');
 if(!select||!answer||!status)return;const idx=Number(select.value||0),final=data.teamFinals?.[idx],review=data.bootReview?.[idx];
 answer.textContent=final?.answer||'Đội chưa gửi đáp án.';status.textContent=review==='correct'?'Đã xác nhận: chính xác.':review==='wrong'?'Đã xác nhận: chưa chính xác.':!final?'Chưa nhận được đáp án.':(data.seconds>120?'Đã nhận đáp án · còn thời gian gửi.':'Đã khóa gửi đáp án · chờ giáo viên đánh giá.');
}
function renderLiveBoard(data,rootId){
 const root=$(rootId);if(!root||!data)return;const electionClosed=!!data.captainElection?.closed,celebrationActive=Number(data.winnerCelebration?.endsAt)>Date.now(),visible=(!!data.roundStarted||electionClosed)&&data.liveBoardVisible!==false&&!celebrationActive;root.classList.toggle('hidden',!visible);if(!visible){root.replaceChildren();return}
 root.classList.remove('live-round-reflex');root.replaceChildren();const round=data.currentRound||'Khởi động';
 const header=document.createElement('div');header.className='live-board-header';const title=document.createElement('h3'),clock=document.createElement('strong'),ranking=document.createElement('div'),close=document.createElement('button');title.textContent=round;clock.className='live-board-clock';clock.textContent=String(Math.floor((data.seconds||0)/60)).padStart(2,'0')+':'+String((data.seconds||0)%60).padStart(2,'0');ranking.className='live-board-mini-ranking';ranking.setAttribute('aria-label','Xếp hạng các đội');roundRows(data,round).forEach((r,i)=>{const row=document.createElement('div');row.className='live-board-mini-row';const rank=document.createElement('b'),name=document.createElement('span'),score=document.createElement('strong');rank.textContent=String(i+1).padStart(2,'0');name.textContent=r.team;score.textContent=r.points+' điểm';row.append(rank,name,score);ranking.append(row)});close.type='button';close.className='live-board-close';close.textContent='ĐÓNG';close.setAttribute('aria-label','Đóng bảng điều phối');close.addEventListener('click',()=>{liveBoardVisible=false;broadcast()});const left=document.createElement('div');left.className='live-board-heading';left.append(title,clock);header.append(left,ranking,close);root.append(header);
 if(electionClosed){const roster=document.createElement('section');roster.className='live-captain-roster';const heading=document.createElement('h3');heading.textContent='CÁC ĐỘI TRƯỞNG SAU BẦU CHỌN';roster.append(heading);(data.teams||[]).forEach((team,i)=>{const member=(team.members||[]).find(m=>m.id===data.captains?.[i]);const row=document.createElement('p');row.textContent=team.name+' · '+(member?member.name:'Chưa có đội trưởng');roster.append(row)});root.append(roster)}
 if(round==='Khởi động'){
  (data.teams||[]).forEach((team,i)=>{const row=document.createElement('article');row.className='live-board-row';const h=document.createElement('strong'),p=document.createElement('p'),s=document.createElement('small');h.textContent=team.name;p.textContent=data.teamFinals?.[i]?.answer||'Chưa gửi đáp án';s.textContent=data.bootReview?.[i]==='correct'?'Đã xác nhận đúng':data.bootReview?.[i]==='wrong'?'Đã xác nhận chưa đúng':'Chờ giáo viên đánh giá';row.append(h,p,s);root.append(row)});
 }else if(round==='Phản xạ'){
  root.classList.add('live-round-reflex');const index=data.reflex?.index;if(index>=0&&typeof reflexJobs!=='undefined'&&reflexJobs[index]){const img=document.createElement('img');img.className='live-board-image';img.src=reflexJobs[index][1];img.alt='Hình ảnh câu hỏi Phản xạ';root.append(img)}
  roundRows(data,'Phản xạ').forEach((r,i)=>{const row=document.createElement('div');row.className='live-board-row';row.textContent=(i+1)+'. '+r.team+' · '+r.points+' điểm';root.append(row)});
 }else if(round==='Bứt phá'){
  const br=data.breakthroughRound||{};(br.order||[]).forEach(t=>{const row=document.createElement('article');row.className='live-board-row breakthrough-live-row';const name=document.createElement('strong'),num=document.createElement('p');name.textContent=data.teams?.[t]?.name||('Đội '+(t+1));num.textContent=br.assigned?.[t]!==undefined?'Tình huống số '+String(br.assigned[t]+1).padStart(2,'0'):'Đang chờ bốc thăm';row.append(name,num);root.append(row)});
 }else if(round==='Liên kết'){
  const order=data.linkRound?.order||[0,1,2,3];order.forEach(i=>{const row=document.createElement('article');row.className='live-board-row live-profession-row';const h=document.createElement('strong'),p=document.createElement('p'),visual=document.createElement('div');h.textContent=(i+1)+'. '+(data.teams?.[i]?.name||'Đội');const profession=data.linkRound?.assigned?.[i];p.textContent=profession||'Chưa chọn thẻ nghề';visual.className='profession-card-visual live-profession-visual';const photo=profession?professionPhoto(profession):'';if(photo){const img=document.createElement('img');img.src=photo;img.alt='Hình ảnh nghề '+profession;visual.append(img)}else{const icon=document.createElement('span');icon.textContent=profession?professionEmoji(profession):'…';visual.append(icon)}row.append(visual,h,p);root.append(row)});
 }else{
  roundRows(data,round).forEach((r,i)=>{const row=document.createElement('div');row.className='live-board-row';row.textContent=(i+1)+'. '+r.team+' · '+r.points+' điểm';root.append(row)});
 }
 if(data.seconds===0&&round!=='Bứt phá'||data.linkRound?.selectionClosed||round==='Phản xạ'&&data.reflex?.active===false&&(data.reflexRoundResults?.length||0)>=reflexJobs.length){
  const podium=document.createElement('section');podium.className='live-board-podium';const h=document.createElement('h3');h.textContent='BẢNG VINH DANH';podium.append(h);roundRows(data,round).slice(0,3).forEach((r,i)=>{const p=document.createElement('p');p.textContent=['🥇','🥈','🥉'][i]+' '+r.team+' · '+r.points+' điểm';podium.append(p)});root.append(podium)
 }
}

function award(id,points){if(awarded.has(id))return;const item=submissions.find(s=>s.id===id);if(!item)return;teams[item.team].score+=points;addRoundPoints(item.round||currentRound,item.team,points);awarded.add(id);broadcast()}
function onMessage(conn,data){
 if(!data||typeof data!=='object')return;
 if(conn.__controller&&data.type==='control-action'){
  const a=data.action||{};
  if(a.type==='timer-start'){startRoundWithIntro();return}if(a.type==='finish-round'){finishCurrentRound();return}
  if(a.type==='timer-reset'){resetRoundClock();return}
  if(a.type==='set-round'&&typeof a.value==='string'){if(roundStarted&&!pendingRoundCelebration&&currentRound!==a.value)pendingRoundCelebration=currentRound;currentRound=a.value;$('currentRound').value=a.value;resetRoundClock();applyRoundTheme(currentRound);return}
  if(a.type==='publish-question'){publishQuestionData(a.question,a.questionType,a.options,'controllerQuestionStatus');return} if(a.type==='reflex-next'){startReflexQuestion(reflex.index+1);return} if(a.type==='captain-vote'){openCaptainElection();return} if(a.type==='live-board-toggle'){liveBoardVisible=!liveBoardVisible;broadcast();return} if(a.type==='boot-review'&&Number.isInteger(a.team)&&a.team>=0&&a.team<4&&['correct','wrong'].includes(a.value)){bootReview[a.team]=a.value;broadcast();return}
  if(a.type==='approval-mode'){approvalMode='auto';renderPending();broadcast();return}
  if(a.type==='approve'){approveJoin(String(a.id));return}
  if(a.type==='reject'){rejectJoin(String(a.id));return}
  return;
 }
 if(data.type==='member-profile'&&Number.isInteger(conn.__team)){const member=teams[conn.__team].members.find(m=>m.id===conn.peer);if(member){if(validAvatar(data.avatar))member.avatar=data.avatar;if(Number.isFinite(Number(data.xp)))member.xp=Math.max(0,Math.min(5000,Number(data.xp)));if(validFrame(data.frame)&&(Number(member.xp)||0)>=PROFILE_FRAMES.find(x=>x.id===data.frame).minXp)member.frame=data.frame;broadcast()}return}
 if(data.type==='team-customize'&&Number.isInteger(conn.__team)){const t=conn.__team;if(captains[t]!==conn.peer)return;const name=String(data.name||'').trim().replace(/\s+/g,' ').slice(0,24);const avatar=validAvatar(data.avatar)?data.avatar:teams[t].avatar;const color=validColor(data.color)?data.color:teams[t].color;const slogan=String(data.slogan??teams[t].slogan??'').trim().replace(/\s+/g,' ').slice(0,60);if(name.length<2){send(conn,{type:'profile-feedback',message:'Tên đội cần có ít nhất 2 ký tự.'});return}if(teams.some((team,i)=>i!==t&&team.name.toLocaleLowerCase()===name.toLocaleLowerCase())){send(conn,{type:'profile-feedback',message:'Tên đội này đã được sử dụng.'});return}teams[t].name=name;teams[t].avatar=avatar;teams[t].color=color;teams[t].slogan=slogan;persistTeamProfiles();send(conn,{type:'profile-feedback',message:'Đã lưu tên, biểu tượng, màu sắc và khẩu hiệu đội.'});broadcast();return}
 if(data.type==='join'){
  const i=Number(data.team),name=String(data.name||'Thành viên').trim().slice(0,32)||'Thành viên';
  if(!Number.isInteger(i)||!teams[i]){send(conn,{type:'join-error',message:'Đội được chọn không hợp lệ. Hãy tải lại trang và chọn đội khác.'});return}
  if(teams.some(t=>t.members.some(m=>m.id===conn.peer))){send(conn,{type:'joined',state:state(),team:teams.findIndex(t=>t.members.some(m=>m.id===conn.peer)),name});return}
  if(pendingRequests.has(conn.peer)){
   const existing=pendingRequests.get(conn.peer);existing.team=i;existing.name=name;renderPending();
   send(conn,{type:'join-error',message:'Kết nối đang được xử lý. Hãy thử lại sau vài giây.'});return;
  }
  pendingRequests.set(conn.peer,{conn,team:i,name,requestedAt:Date.now()});
  approveJoin(conn.peer);return;
 }
  if(data.type==='reflex-choice'&&Number.isInteger(conn.__team)&&reflex.active&&data.question===reflex.index){
  const t=conn.__team,phase=reflexTeamPhases[t],deadline=phase.selectionEndsAt||reflex.selectionEndsAt;
  if(captains[t]===conn.peer){send(conn,{type:'reflex-feedback',message:'Đội trưởng theo dõi lựa chọn và chốt đáp án ở giai đoạn 5 giây cuối.'});return}
  if(reflex.completed[t]||phase.phase!=='select'||Date.now()>deadline){send(conn,{type:'reflex-feedback',message:'Đã hết thời gian gửi hoặc thay đổi đáp án.'});return}
  if(!Number.isInteger(data.option)||!reflexJobs[reflex.index][2][data.option])return;
  awardMemberXp(conn,'Phản xạ');reflexVotes[t][conn.peer]={option:data.option,time:Date.now(),name:conn.__name};
  send(conn,{type:'reflex-feedback',message:'Đã gửi đáp án cho đội trưởng.'});
  const captainId=captains[t],captainConnection=connections.get(captainId);
  if(captainId&&captainConnection)send(captainConnection,{type:'reflex-member-submitted',memberName:conn.__name,option:data.option,question:reflex.index});
  const eligibleMembers=(teams[t].members||[]).filter(member=>member.id!==captainId);
  if(eligibleMembers.length>0&&eligibleMembers.every(member=>Object.prototype.hasOwnProperty.call(reflexVotes[t],member.id)))startReflexCaptainWindow(t);
  broadcast();return
}
  if(data.type==='reflex-captain-action'&&Number.isInteger(conn.__team)&&reflex.active){const t=conn.__team;if(captains[t]!==conn.peer){send(conn,{type:'reflex-feedback',message:'Chỉ đội trưởng mới được điều khiển câu trả lời.'});return}if(data.action==='hurry'){if(reflexTeamPhases[t].phase!=='select')return;reflexTeamPhases[t].selectionEndsAt=Date.now()+5000;teams[t].members.forEach(m=>{const c=connections.get(m.id);if(c)send(c,{type:'reflex-feedback',message:'Đội trưởng đang hối thúc. Hãy chốt hoặc điều chỉnh đáp án trong 5 giây tới.'})});broadcast();return}if(data.action==='submit'){if(!Object.keys(reflexVotes[t]||{}).length){send(conn,{type:'reflex-feedback',message:'Chưa có thành viên nào chọn đáp án.'});return}finalizeReflexTeam(t);return}}
 if(data.type==='breakthrough-draw-request'&&Number.isInteger(conn.__team)){const t=conn.__team;if(captains[t]!==conn.peer){send(conn,{type:'breakthrough-feedback',message:'Chỉ Đội trưởng mới được bốc thăm.'});return}if(!drawBreakthroughScenario(t,false))send(conn,{type:'breakthrough-feedback',message:'Chưa đến lượt đội bạn hoặc không còn tình huống.'});return}if(data.type==='breakthrough-submit'&&Number.isInteger(conn.__team)){if(captains[conn.__team]===conn.peer){send(conn,{type:'breakthrough-feedback',message:'Đội trưởng có thể tổng hợp và gửi bài làm chung ở phần bên dưới.'});return}awardMemberXp(conn,'Bứt phá');saveBreakthroughSubmission(conn,data.ids,data.note);return}if(data.type==='breakthrough-team-submit'&&Number.isInteger(conn.__team)){submitBreakthroughTeamAnswer(conn,data.answer);return}if(data.type==='link-draw-request'&&Number.isInteger(conn.__team)){requestLinkDraw(conn);return} if(data.type==='link-card-redraw'&&Number.isInteger(conn.__team)){if(captains[conn.__team]===conn.peer&&linkRound.currentCard?.team===conn.__team){linkRound.currentCard=null;linkRound.cardVotes[conn.__team]={};requestLinkDraw(conn)}return} if(data.type==='link-card-vote'&&Number.isInteger(conn.__team)){recordLinkCardVote(conn,data.choice);return} if(data.type==='link-card-lock'&&Number.isInteger(conn.__team)){lockLinkCard(conn);return} if(data.type==='link-member-submit'&&Number.isInteger(conn.__team)){awardMemberXp(conn,'Liên kết');saveLinkMemberSubmission(conn,data);return} if(data.type==='captain-vote'&&Number.isInteger(conn.__team)&&captainElection.open&&!captainElection.closed){
  const t=conn.__team;if(captainVotes[t][conn.peer]){send(conn,{type:'captain-vote-result',message:'Bạn đã bỏ phiếu và không thể vote lại.'});return}
  if(Date.now()>captainElection.endsAt){closeCaptainElection();return}
  if(!teams[t].members.some(m=>m.id===data.candidate))return;
  captainVotes[t][conn.peer]={candidate:data.candidate,time:Date.now()};send(conn,{type:'captain-vote-result',message:'Đã ghi nhận phiếu bầu.'});broadcast();return
 }
 if(data.type==='captain-submit'&&Number.isInteger(conn.__team)){
  if(currentRound==='Khởi động'&&seconds<=120){send(conn,{type:'captain-submit-result',message:'Đã hết thời gian gửi đáp án của vòng Khởi động.'});return}
  const t=conn.__team;if(captains[t]!==conn.peer){send(conn,{type:'captain-submit-result',message:'Chỉ đội trưởng mới được gửi đáp án.'});return}
  if(raceAwarded.has(t))return;const answer=String(data.answer||'').trim().slice(0,2000);if(!answer)return;
  const rank=raceOrder.length,points=[10,7,5,3][rank]||0,careerAward=currentRound.includes('Liên kết')?([160,120,80,40][rank]||0):0,stamp=Date.now();raceAwarded.add(t);raceOrder.push({team:t,answer,time:stamp,points,rank:rank+1});teams[t].score+=points;addRoundPoints(currentRound,t,points);careerPoints[t]+=careerAward;teamFinals[t]={answer,time:stamp,points,careerPoints:careerAward,rank:rank+1};
  submissions.push({id:'race-'+t+'-'+stamp,team:t,name:'Đội trưởng · '+conn.__name,round:currentRound,text:answer,time:stamp,final:true,points,rank:rank+1});send(conn,{type:'captain-submit-result',message:'Đã gửi. Đội nhận '+points+' điểm.'});broadcast();return
 }
 if(data.type==='captain-skip'&&Number.isInteger(conn.__team)){if(captains[conn.__team]===conn.peer)send(conn,{type:'captain-submit-result',message:'Đội đã bỏ qua câu hỏi.'});return}
 if(data.type==='team-response'&&Number.isInteger(conn.__team)){
  if(currentRound==='Khởi động'&&seconds<=120){send(conn,{type:'response-locked',message:'Đã hết 3 phút gửi đáp án của vòng Khởi động.'});return}
  const team=conn.__team;if(raceAwarded.has(team)){send(conn,{type:'response-locked',message:'Đội đã gửi đáp án.'});return}
  if(data.kind==='choice'&&questionType!=='text'&&Number.isInteger(data.option)&&questionOptions[data.option]){awardMemberXp(conn,'Khởi động');teamVotes[team][conn.peer]=data.option;teamTexts[team]=teamTexts[team].filter(x=>x.memberId!==conn.peer);teamTexts[team].push({name:conn.__name,text:questionOptions[data.option],memberId:conn.peer,time:Date.now(),kind:'choice'});send(conn,{type:'response-received',message:'Đã ghi nhận lựa chọn.'});broadcast();return}
  if(data.kind==='text'&&questionType!=='choice'&&typeof data.text==='string'&&data.text.trim()){awardMemberXp(conn,'Khởi động');teamTexts[team]=teamTexts[team].filter(x=>x.memberId!==conn.peer);teamTexts[team].push({name:conn.__name,text:data.text.trim().slice(0,2000),memberId:conn.peer,time:Date.now(),kind:'text'});send(conn,{type:'response-received',message:'Đã gửi ý kiến vào phòng đội.'});broadcast();return}
 }
 if(data.type==='answer'&&Number.isInteger(conn.__team)&&typeof data.text==='string'&&data.text.trim()){submissions.push({id:Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,8),team:conn.__team,name:conn.__name,round:currentRound,text:data.text.trim().slice(0,2000),time:Date.now()});broadcast()}
}
function makeRoomCode(){const alphabet='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';const bytes=crypto.getRandomValues(new Uint8Array(8));return Array.from(bytes,b=>alphabet[b%alphabet.length]).join('')}function makeSecretToken(){return Array.from(crypto.getRandomValues(new Uint8Array(32)),b=>b.toString(16).padStart(2,'0')).join('')}
async function callBreakthroughEdge(action,payload={}){if(!SUPABASE_CONFIG.url||!SUPABASE_CONFIG.publishableKey||!breakthroughTeacherToken||!breakthroughRoomCode)throw new Error('Phòng chưa đăng ký dịch vụ chấm điểm.');const response=await fetch(SUPABASE_CONFIG.url.replace(/\/$/,'')+'/functions/v1/breakthrough-assess',{method:'POST',headers:{'Content-Type':'application/json','apikey':SUPABASE_CONFIG.publishableKey,'Authorization':'Bearer '+SUPABASE_CONFIG.publishableKey},body:JSON.stringify({action,roomCode:breakthroughRoomCode,teacherToken:breakthroughTeacherToken,...payload})});const data=await response.json().catch(()=>({}));if(!response.ok)throw new Error(data.error||'Không thể kết nối dịch vụ đánh giá.');return data}
function syncBreakthroughCaptains(){if(!breakthroughTeacherToken)return;const payload={captains:Object.fromEntries(captains.map((id,i)=>[i,id||'']))};breakthroughSyncQueue=breakthroughSyncQueue.then(()=>callBreakthroughEdge('sync-captains',payload)).catch(()=>{})}
function syncBreakthroughRound(){if(!breakthroughTeacherToken)return;const payload={assigned:breakthroughRound.assigned||{},closesAt:breakthroughRound.active&&breakthroughDeadline?new Date(breakthroughDeadline).toISOString():null};breakthroughSyncQueue=breakthroughSyncQueue.then(()=>callBreakthroughEdge('sync-round',payload)).catch(()=>{})}
function storeBreakthroughResult(item){if(!item||!Number.isInteger(Number(item.team_index)))return;const team=Number(item.team_index);if(team<0||team>3)return;const history=breakthroughHistory[team]||(breakthroughHistory[team]=[]),index=history.findIndex(entry=>entry.id===item.id);if(index>=0)history[index]=item;else history.push(item);history.sort((a,b)=>a.version-b.version);breakthroughAssessments[team]=history[history.length-1]||null}
async function refreshBreakthroughResults(){const data=await callBreakthroughEdge('results');breakthroughHistory=[[],[],[],[]];breakthroughAssessments=[null,null,null,null];(data.results||[]).forEach(storeBreakthroughResult);renderBreakthroughAssessments();broadcast()}
async function assessBreakthroughSubmission(team,id){if(breakthroughAssessing.has(team))return;breakthroughAssessing.add(team);try{const data=await callBreakthroughEdge('assess',{submissionId:id});storeBreakthroughResult(data.result);renderBreakthroughAssessments();broadcast()}catch(error){const root=$('breakthroughAssessmentTeacher');if(root){const note=document.createElement('p');note.className='error-text';note.textContent=error.message||'Chưa thể đánh giá lại bài làm.';root.prepend(note)}}finally{breakthroughAssessing.delete(team)}}
async function submitBreakthroughTeamAnswer(conn,answer){const t=conn.__team,clean=String(answer||'').trim().slice(0,8000);if(breakthroughAssessing.has(t)){send(conn,{type:'breakthrough-team-result',message:'Bài làm đang được xử lý. Vui lòng chờ trong giây lát.'});return}if(captains[t]!==conn.peer){send(conn,{type:'breakthrough-team-result',message:'Chỉ đội trưởng mới gửi được phương án chung.'});return}if(!breakthroughRound.active||!breakthroughRound.workStarted||breakthroughRound.closed||!Number.isInteger(breakthroughRound.assigned[t])){send(conn,{type:'breakthrough-team-result',message:'Đội chưa bắt đầu giai đoạn giải quyết tình huống hoặc đã hết giờ.'});return}if(clean.length<10){send(conn,{type:'breakthrough-team-result',message:'Đội hãy bổ sung câu trả lời rõ ràng hơn trước khi gửi.'});return}breakthroughFinalDrafts[t]=clean;breakthroughAssessing.add(t);try{const data=await callBreakthroughEdge('submit',{teamIndex:t,scenarioIndex:breakthroughRound.assigned[t],captainPeer:conn.peer,answer:clean});storeBreakthroughResult(data.result);const message=data.result.status==='awaiting_ai'?'Bài làm đã được lưu. Hiện chưa có kết quả AI; giáo viên có thể xem xét hoặc đánh giá lại sau.':'Đã lưu phiên bản '+data.result.version+' và nhận phản hồi đánh giá. Đội có thể tiếp tục chỉnh sửa, gửi phiên bản mới trước khi hết giờ.';teams[t].members.forEach(m=>{const c=connections.get(m.id);if(c)send(c,{type:'breakthrough-team-result',message,result:data.result})});renderBreakthroughAssessments();broadcast()}catch(error){send(conn,{type:'breakthrough-team-result',message:error.message||'Chưa thể lưu bài làm. Hãy kiểm tra kết nối và thử lại.'})}finally{breakthroughAssessing.delete(t)}}
async function confirmBreakthroughScore(team,id,criteriaScores,note){try{const current=breakthroughHistory[team].find(item=>item.id===id),oldScore=Number(current?.teacher_score)||0,wasConfirmed=current?.status==='confirmed';const data=await callBreakthroughEdge('confirm',{submissionId:id,criteriaScores,teacherNote:note});storeBreakthroughResult(data.result);const newScore=Number(data.result.teacher_score)||0,delta=wasConfirmed?newScore-oldScore:newScore;if(delta){teams[team].score+=delta;addRoundPoints('Bứt phá',team,delta)}renderBreakthroughAssessments();broadcast()}catch(error){$('teacherBreakthroughStatus').textContent=error.message||'Không thể xác nhận điểm.'}}
function renderBreakthroughAssessments(){
 const root=$('breakthroughAssessmentTeacher');if(!root)return;root.replaceChildren();
 const entries=[];breakthroughHistory.forEach((history,team)=>history.forEach(item=>entries.push({team,item})));
 if(!entries.length){const empty=document.createElement('p');empty.className='muted';empty.textContent=breakthroughTeacherToken?'Chưa có bài làm được lưu cho vòng Bứt Phá.':'Lịch sử đánh giá sẽ xuất hiện sau khi phòng được đăng ký với Supabase.';root.append(empty);return}
 const isClosed=breakthroughRound.closed||(breakthroughDeadline>0&&Date.now()>=breakthroughDeadline);
 entries.sort((a,b)=>a.team-b.team||b.item.version-a.item.version).forEach(({team,item})=>{
  const history=breakthroughHistory[team]||[],latestVersion=Math.max(...history.map(entry=>entry.version)),isLatest=item.version===latestVersion,isCurrentScenario=Number(breakthroughFinalAssignments[team])===Number(item.scenario_index);
  const card=document.createElement('article');card.className='breakthrough-assessment-card';card.classList.toggle('is-superseded',!isLatest||!isCurrentScenario);
  const heading=document.createElement('h4'),score=document.createElement('p');
  heading.textContent=teams[team].name+' · Tình huống '+(item.scenario_index+1)+' · Phiên bản '+item.version+(isLatest&&isCurrentScenario?' · BẢN GỬI CUỐI':' · BẢN LỊCH SỬ');
  const hasAiScore=Number.isInteger(item.total_score);
  score.textContent='AI đề xuất: '+(hasAiScore?item.total_score+'/100':'Chưa có điểm')+' · '+(item.status==='awaiting_ai'?'Chờ AI đánh giá':item.status==='manual_review'?'Cần giáo viên xem xét':item.status==='confirmed'?'Đã xác nhận điểm cuối':'Chờ giáo viên xác nhận');
  card.append(heading,score);
  if(Number.isInteger(item.teacher_score)){const final=document.createElement('p');final.className='breakthrough-final-score';final.textContent='Điểm cuối do giáo viên xác nhận: '+item.teacher_score+'/100';card.append(final)}
  if(item.answer){const details=document.createElement('details'),summary=document.createElement('summary'),answer=document.createElement('p');summary.textContent='Xem bài làm phiên bản '+item.version;answer.textContent=item.answer;details.append(summary,answer);card.append(details)}
  if(item.feedback?.overall_message){const p=document.createElement('p');p.textContent=item.feedback.overall_message;card.append(p)}
  if(item.feedback?.needs_teacher_review){const review=document.createElement('p');review.className='breakthrough-review-note';review.textContent='Cần giáo viên kiểm tra các nhận xét/tiêu chí chưa có dẫn chứng nguyên văn đủ để xác minh.';card.append(review)}
  if(item.assessment_error){const error=document.createElement('p');error.className='breakthrough-assessment-error';error.textContent=item.assessment_error;card.append(error)}
  const rubricCriteria=item.rubric?.criteria||[],aiCriteria=item.criteria||[],teacherCriteria=item.teacher_criteria||[];
  const aiById=new Map(aiCriteria.map(c=>[c.id,c])),teacherById=new Map(teacherCriteria.map(c=>[c.id,c]));
  const scoreInputs=[];
  rubricCriteria.forEach(base=>{
   const ai=aiById.get(base.id),teacher=teacherById.get(base.id),row=document.createElement('section'),title=document.createElement('strong'),detail=document.createElement('div');
   title.textContent=base.label+' · '+(Number.isInteger(ai?.score)?'AI '+ai.score+'/'+base.max:'Chưa có điểm AI');
   detail.className='breakthrough-criterion-detail';
   if(ai?.strengths){const strengths=document.createElement('p');strengths.textContent='Điểm phù hợp: '+ai.strengths;detail.append(strengths)}
   if(ai?.evidence){const evidence=document.createElement('p');evidence.textContent='Dẫn chứng: “'+ai.evidence+'”.';detail.append(evidence)}
   if(ai?.issue){const issue=document.createElement('p');issue.textContent='Điểm cần hoàn thiện: '+ai.issue;detail.append(issue)}
   if(ai?.explanation){const explanation=document.createElement('p');explanation.textContent='Giải thích: '+ai.explanation;detail.append(explanation)}
   if(ai?.question){const question=document.createElement('p');question.textContent='Câu hỏi gợi mở: '+ai.question;detail.append(question)}
   if(ai?.suggestion){const suggestion=document.createElement('p');suggestion.textContent='Gợi ý: '+ai.suggestion;detail.append(suggestion)}
   if(!ai?.evidence&&ai){const missing=document.createElement('p');missing.className='breakthrough-review-note';missing.textContent='Chưa có trích dẫn nguyên văn được xác minh cho tiêu chí này.';detail.append(missing)}
   const label=document.createElement('label'),caption=document.createElement('span'),input=document.createElement('input');
   label.className='breakthrough-criterion-score';caption.textContent='Điểm giáo viên';input.type='number';input.min='0';input.max=String(base.max);input.step='1';input.dataset.criterionId=base.id;input.value=Number.isInteger(teacher?.score)?String(teacher.score):Number.isInteger(ai?.score)?String(ai.score):'';input.disabled=!isLatest||!isCurrentScenario||!isClosed;input.setAttribute('aria-label','Điểm giáo viên cho '+base.label);label.append(caption,input);detail.append(label);row.append(title,detail);card.append(row);scoreInputs.push(input);
  });
  if(item.status==='awaiting_ai'&&isLatest&&isCurrentScenario){const retry=document.createElement('button');retry.type='button';retry.className='btn ghost';retry.textContent='THỬ ĐÁNH GIÁ LẠI BẰNG AI';retry.addEventListener('click',()=>assessBreakthroughSubmission(team,item.id));card.append(retry)}
  if(isLatest&&isCurrentScenario){
   const note=document.createElement('input');note.type='text';note.className='breakthrough-teacher-note';note.maxLength=1000;note.placeholder='Ghi chú của giáo viên (không bắt buộc)';note.value=item.teacher_note||'';note.disabled=!isClosed;card.append(note);
   if(!isClosed){const wait=document.createElement('p');wait.className='muted';wait.textContent='Bản gửi cuối được xác định khi hết giờ. Giáo viên có thể điều chỉnh và xác nhận điểm sau đó.';card.append(wait)}
   const button=document.createElement('button');button.type='button';button.className='btn';button.textContent=item.status==='confirmed'?'CẬP NHẬT ĐIỂM ĐÃ XÁC NHẬN':'XÁC NHẬN ĐIỂM CUỐI';button.disabled=!isClosed;
   button.addEventListener('click',()=>{const scores={};let valid=true;scoreInputs.forEach(input=>{if(input.value.trim()===''){valid=false;return}scores[input.dataset.criterionId]=Number(input.value)});if(!valid){const message=document.createElement('p');message.className='error-text';message.textContent='Hãy nhập điểm cho tất cả tiêu chí trước khi xác nhận.';card.append(message);return}confirmBreakthroughScore(team,item.id,scores,note.value)});
   card.append(button);
  }else{const old=document.createElement('p');old.className='muted';old.textContent='Phiên bản này được lưu trong lịch sử nhưng không dùng làm điểm cuối vì không phải bản gửi cuối của tình huống đang chấm.';card.append(old)}
  root.append(card);
 });
}
function startTeacher(){
 restoreTeamProfiles();updateTeams();
 if(!getSupabaseClient()){$('connectionStatus').textContent='Thiếu cấu hình Supabase Realtime';return}
 $('createRoom').disabled=true;$('connectionStatus').textContent='Đang mở các kênh kết nối…';
 const studentCode=makeRoomCode(),teacherCode=makeRoomCode();breakthroughRoomCode=studentCode;breakthroughTeacherToken=makeSecretToken();breakthroughHistory=[[],[],[],[]];breakthroughAssessments=[null,null,null,null];breakthroughDeadline=0;breakthroughFinalAssignments={};breakthroughSyncQueue=Promise.resolve();breakthroughConfirmed.clear();
 let studentReady=false,controllerReady=false,failed=false;
 const fail=message=>{
  if(failed)return;failed=true;
  $('connectionStatus').textContent=message;
  $('createRoom').disabled=false;$('closeRoom').disabled=true;
  removeStudentChannel();removeControllerChannel();
 };
 const finishSetup=async()=>{
  if(failed||!studentReady||!controllerReady)return;
  $('roomCode').textContent=studentCode;$('teacherRoomCodeDisplay').textContent=teacherCode;
  show('roomShare');$('createRoom').disabled=false;$('closeRoom').disabled=false;
  try{await callBreakthroughEdge('register-room');$('connectionStatus').textContent='Phòng đang mở · Đã kết nối lưu trữ bài làm';await refreshBreakthroughResults()}catch(error){$('connectionStatus').textContent='Phòng đang mở · Chấm điểm chưa sẵn sàng: '+error.message;renderBreakthroughAssessments()}
  broadcast();
 };
 openHostStudentChannel(studentCode,()=>{studentReady=true;finishSetup()},message=>fail('Không thể mở kênh học sinh: '+message));
 openHostControllerChannel(teacherCode,()=>{controllerReady=true;finishSetup()},message=>fail('Không thể mở kênh điều khiển: '+message));
}
function closeTeacher(){if(breakthroughRound.active&&!breakthroughRound.closed)closeBreakthroughRound();controllerConnections.clear();if(timer)clearInterval(timer);timer=null;if(linkTurnTimer)clearTimeout(linkTurnTimer);linkTurnTimer=null;if(linkTurnTicker){clearInterval(linkTurnTicker);linkTurnTicker=null}if(breakthroughTurnTimer)clearTimeout(breakthroughTurnTimer);breakthroughTurnTimer=null;if(breakthroughTurnTicker){clearInterval(breakthroughTurnTicker);breakthroughTurnTicker=null}removeStudentChannel();removeControllerChannel();connections.clear();pendingRequests.clear();renderPending();teams.forEach(t=>t.members=[]);$('connectionStatus').textContent='Đã đóng phòng';$('createRoom').disabled=false;$('closeRoom').disabled=true;hide('roomShare');renderTeacher()}
function startStudent(){
 show('studentView');if(!hostId){hide('studentView');show('unsupported');return}
 let joining=false,clientId=null,joinTimer=null;
 const client=getSupabaseClient();
 const failJoin=message=>{
  if(joinTimer){clearTimeout(joinTimer);joinTimer=null}
  joining=false;
  if(connection){try{connection.close()}catch(e){}connection=null}
  $('joinError').textContent=message;$('joinRoom').disabled=false;
  $('studentStatus').textContent='Chưa kết nối';$('studentStatus').style.background='';
 };
 const receiveHostMessage=data=>{
  if(data&&data.type==='profile-feedback'){$('teamProfileStatus').textContent=data.message||'';return}if(data&&data.type==='link-member-result'){$('linkMemberSubmitStatus').textContent=data.message||'Đã gửi.';return} if(data&&data.type==='link-card-feedback'){$('linkCardVoteStatus').textContent=data.message||'';return} if(data&&data.type==='link-member-result'){$('linkMemberSubmitStatus').textContent=data.message||'Đã gửi.';return}if(data&&data.type==='link-card-feedback'){$('linkCardVoteStatus').textContent=data.message||'';return}if(data&&data.type==='reflex-member-submitted'){playReflexCaptainNotice();$('reflexCaptainFeedback').textContent='Thành viên '+String(data.memberName||'')+' vừa gửi đáp án.';return}if(data&&data.type==='reflex-feedback'){$('reflexMemberFeedback').textContent=data.message;return}if(data&&data.type==='breakthrough-feedback'){$('breakthroughSubmitStatus').textContent=data.message||'';return}if(data&&data.type==='breakthrough-team-result'){let node=$('breakthroughTeamSubmitStatus');if(!node){node=document.createElement('p');node.id='breakthroughTeamSubmitStatus';$('breakthroughCaptainSummary')?.append(node)}node.textContent=data.message||'';return}
  if(data&&data.type==='captain-vote-result'){$('captainVoteMessage').textContent=data.message;return}
  if(data&&data.type==='captain-submit-result'){$('captainSubmitStatus').textContent=data.message;return}
  if(data&&data.type==='response-received'){$('sendStatus').textContent=data.message||'Đã ghi nhận.';return}
  if(data&&data.type==='response-locked'){$('sendStatus').textContent=data.message||'Đội đã chốt.';$('sendAnswer').disabled=true;return}
  if(data&&data.type==='joined'){
   if(joinTimer){clearTimeout(joinTimer);joinTimer=null}
   joining=false;selfName=String(data.name||$('studentName').value||'Học sinh');
   selfTeamIndex=Number(data.team);const savedProfile=readMemberProfile(selfName);send(connection,{type:'member-profile',avatar:savedProfile.avatar,frame:savedProfile.frame,xp:savedProfile.xp});
   hide('joinForm');show('studentPlay');
   $('studentTeamName').textContent=data.state?.teams?.[data.team]?.name||$('studentTeam').selectedOptions[0].textContent;
   $('studentStatus').textContent='Đã vào phòng';$('studentStatus').style.background='#0c633d';
   $('joinError').textContent='';
   if(data.state)renderStudentState(data.state);
   return;
  }
  if(data&&data.type==='join-error'){failJoin(data.message||'Không thể tham gia phòng.');return}
  renderStudentState(data);
 };
 $('memberAvatarButton').addEventListener('click',()=>{$('memberAvatarPicker').classList.toggle('hidden');if(!$('memberAvatarPicker').classList.contains('hidden'))renderAvatarPicker('memberAvatarPicker',$('memberAvatarButton').textContent,avatar=>{const profile=readMemberProfile(selfName);profile.avatar=avatar;profile.xp=Number(connection?.__xp)||profile.xp;saveMemberProfile(selfName,profile);send(connection,{type:'member-profile',avatar,frame:profile.frame,xp:profile.xp});$('memberAvatarButton').textContent=avatar;$('memberAvatarPicker').classList.add('hidden')})});
 $('memberFrameToggle').addEventListener('click',()=>{$('memberFramePicker').classList.toggle('hidden');if(!$('memberFramePicker').classList.contains('hidden')){const profile=readMemberProfile(selfName),xp=Number(connection?.__xp)||0;renderFramePicker('memberFramePicker',profile.frame,xp,frame=>{profile.frame=frame;profile.xp=xp;saveMemberProfile(selfName,profile);send(connection,{type:'member-profile',avatar:profile.avatar,frame,xp:profile.xp});$('memberAvatarButton').className='student-identity-avatar frame-'+frame;$('memberFramePicker').classList.add('hidden')})}});
 $('teamAvatarToggle').addEventListener('click',()=>{$('teamAvatarPicker').classList.toggle('hidden');if(!$('teamAvatarPicker').classList.contains('hidden'))renderAvatarPicker('teamAvatarPicker',$('studentTeamAvatar').textContent,avatar=>{send(connection,{type:'team-customize',name:$('teamNameEdit').value,avatar,color:$('teamColorSelect').value,slogan:$('teamSloganEdit').value});$('studentTeamAvatar').textContent=avatar;$('teamAvatarPicker').classList.add('hidden')})});
 $('saveTeamCustomization').addEventListener('click',()=>send(connection,{type:'team-customize',name:$('teamNameEdit').value,avatar:$('studentTeamAvatar').textContent,color:$('teamColorSelect').value,slogan:$('teamSloganEdit').value}));
 $('joinRoom').addEventListener('click',()=>{
  unlockReflexNoticeAudio();
  if(joining)return;
  const name=$('studentName').value.trim(),team=Number($('studentTeam').value);
  if(!name){$('joinError').textContent='Hãy nhập tên thành viên.';return}
  if(!client){$('joinError').textContent='Không tải được Supabase. Hãy tải lại trang.';return}
  joining=true;$('joinRoom').disabled=true;
  joinTimer=setTimeout(()=>failJoin('Không nhận được phản hồi từ laptop. Kiểm tra mã phòng và bảo đảm giáo viên vẫn đang mở phòng.'),15000);
  $('joinError').textContent='Đang mở kết nối tới phòng…';
  $('studentStatus').textContent='Đang kết nối';$('studentStatus').style.background='';
  try{
   removeStudentChannel();
   clientId=Array.from(crypto.getRandomValues(new Uint8Array(16)),b=>b.toString(16).padStart(2,'0')).join('');
   connection={
    peer:clientId,open:false,onData:null,
    send(data){
     if(!studentChannel||!this.open)return Promise.resolve('error');
     return studentChannel.send({type:'broadcast',event:'student-message',payload:{clientId,data}});
    },
    on(event,handler){if(event==='data')this.onData=handler;return this},
    close(){
     this.open=false;
     if(studentChannel){
      studentChannel.send({type:'broadcast',event:'student-message',payload:{clientId,data:{type:'student-leave'}}}).catch(()=>{});
      removeStudentChannel();
     }
    }
   };
   studentChannel=client.channel(studentTopic(hostId),{config:{broadcast:{self:false,ack:true},private:false}});
   studentChannel.on('broadcast',{event:'host-message'},({payload})=>{
    const item=payload||{};
    if(item.target!==clientId||!item.data)return;
    if(typeof connection?.onData==='function')connection.onData(item.data);
   });
   connection.on('data',receiveHostMessage);
   studentChannel.subscribe(async status=>{
    if(status==='SUBSCRIBED'&&joining){
     connection.open=true;
     $('joinError').textContent='Đã kết nối máy chủ. Đang gửi thông tin tham gia…';
     const result=await connection.send({type:'join',name,team});
     if(result!=='ok'&&joining)failJoin('Không gửi được yêu cầu vào phòng ('+result+').');
    }else if((status==='CHANNEL_ERROR'||status==='TIMED_OUT'||status==='CLOSED')&&joining){
     failJoin('Kết nối tới phòng bị gián đoạn ('+status+')'+(error?.message?': '+error.message:'')+'. Hãy kiểm tra mã phòng và thử lại.');
    }
   });
   window.addEventListener('beforeunload',()=>{if(connection)connection.close()},{once:true});
  }catch(e){failJoin('Không thể kết nối tới phòng: '+(e?.message||'lỗi không xác định'))}
 });
 $('linkRandomSelection').addEventListener('click',()=>send(connection,{type:'link-draw-request'}));$('linkAcceptCard').addEventListener('click',()=>send(connection,{type:'link-card-vote',choice:'accept'}));$('linkRejectCard').addEventListener('click',()=>send(connection,{type:'link-card-vote',choice:'reject'}));$('linkCaptainLock').addEventListener('click',()=>send(connection,{type:'link-card-lock'}));$('linkCaptainDrawNext').addEventListener('click',()=>send(connection,{type:'link-card-redraw'}));$('linkSubmitSelections').onclick=()=>{const key=Number(selfTeamIndex)+':'+connection.peer,saved=linkDragAssignments[key],selections={};linkCats.forEach(([k])=>{selections[k]=saved?saved.cards.filter(x=>saved.placed[x.id]===k).map(x=>Number(x.id.slice(x.id.lastIndexOf('-')+1))):[]});send(connection,{type:'link-member-submit',selections,note:$('linkMemberNote').value});$('linkMemberSubmitStatus').textContent='Đang gửi…'};$('linkAcceptCard').addEventListener('click',()=>send(connection,{type:'link-card-vote',choice:'accept'}));$('linkRejectCard').addEventListener('click',()=>send(connection,{type:'link-card-vote',choice:'reject'}));$('linkCaptainLock').addEventListener('click',()=>send(connection,{type:'link-card-lock'}));$('linkCaptainDrawNext').addEventListener('click',()=>send(connection,{type:'link-card-redraw'}));$('linkSubmitSelections').onclick=()=>{const key=Number(selfTeamIndex)+':'+connection.peer,saved=linkDragAssignments[key],selections={};linkCats.forEach(([k])=>{selections[k]=saved?saved.cards.filter(x=>saved.placed[x.id]===k).map(x=>Number(x.id.slice(x.id.lastIndexOf('-')+1))):[]});send(connection,{type:'link-member-submit',selections,note:$('linkMemberNote').value});$('linkMemberSubmitStatus').textContent='Đang gửi…'};$('voteCaptain').addEventListener('click',()=>{const c=document.querySelector('input[name="captainCandidate"]:checked');if(!c){$('captainVoteMessage').textContent='Hãy chọn một thành viên.';return}send(connection,{type:'captain-vote',candidate:c.value})});
 $('captainAnswerSelect').addEventListener('change',()=>{const item=teamTexts[Number($('studentTeam').value)]?.[Number($('captainAnswerSelect').value)];if(item)$('captainFinalAnswer').value=item.text});
 $('captainSend').addEventListener('click',()=>send(connection,{type:'captain-submit',answer:$('captainFinalAnswer').value}));
 $('captainSkip').addEventListener('click',()=>send(connection,{type:'captain-skip'}));
 $('sendAnswer').addEventListener('click',()=>{
  if(!connection||!connection.open){$('sendStatus').textContent='Chưa kết nối với phòng đội.';return}
  const choice=document.querySelector('input[name="teamChoice"]:checked'),text=$('studentAnswer').value.trim();
  if(!$('studentTextWrap').classList.contains('hidden')&&text){send(connection,{type:'team-response',kind:'text',text});$('studentAnswer').value='';$('sendStatus').textContent='Đang gửi ý kiến…';return}
  if(choice){send(connection,{type:'team-response',kind:'choice',option:Number(choice.value)});$('sendStatus').textContent='Đang gửi lựa chọn…';return}
  $('sendStatus').textContent='Hãy chọn một phương án hoặc nhập ý kiến trước khi gửi.';
 })
}

function startController(){
 document.body.classList.add('is-mobile-controller');show('controllerView');
 const client=getSupabaseClient();
 if(!controllerHost||!client){$('controllerStatus').textContent='Thiếu mã giáo viên hoặc cấu hình Supabase';return}
 const topic=controllerTopic(controllerHost);
 controllerChannel=client.channel(topic,{config:{broadcast:{self:false},private:false}});
 controllerChannel.on('broadcast',{event:'controller-message'},({payload})=>{
  const data=payload||{};
  if(data.type==='controller-ready'||data.type==='control-state'){
   lastControllerState={state:data.state,pending:data.pending||[]};
   renderController(data.state,data.pending||[]);
   setControllerStatus('Đã đồng bộ với máy tính',true);
  }
 });
 const setControllerStatus=(message,connected=false)=>{controllerConnected=connected;$('controllerStatus').textContent=message;$('controllerView').classList.toggle('controller-offline',!connected)};
 const act=action=>{
  if(!controllerConnected||!controllerChannel){setControllerStatus('Chưa kết nối · Lệnh chưa được gửi',false);return}
  controllerChannel.send({type:'broadcast',event:'controller-message',payload:{type:'control-action',action}}).then(status=>{
   if(status!=='ok')setControllerStatus('Không gửi được lệnh điều khiển ('+status+')',false);
  }).catch(()=>setControllerStatus('Mất kết nối · Lệnh chưa được gửi',false));
 };
 setControllerStatus('Đang kết nối kênh điều khiển…',false);
 controllerChannel.subscribe(status=>{
  if(status==='SUBSCRIBED'){
   setControllerStatus('Đã kết nối kênh · Đang đồng bộ…',true);
   controllerChannel.send({type:'broadcast',event:'controller-message',payload:{type:'controller-hello'}});
  }else if(status==='CHANNEL_ERROR'||status==='TIMED_OUT'||status==='CLOSED'){
   setControllerStatus('Kết nối Supabase Realtime bị gián đoạn ('+status+')',false);
  }
 });
 $('controllerTimerStart').addEventListener('click',()=>act({type:'timer-start'}));$('controllerFinishRound').addEventListener('click',()=>act({type:'finish-round'}));
 $('controllerTimerReset').addEventListener('click',()=>act({type:'timer-reset'}));
 $('controllerRound').addEventListener('change',()=>act({type:'set-round',value:$('controllerRound').value}));
 $('controllerCaptainVote').addEventListener('click',()=>act({type:'captain-vote'}));$('controllerPublishQuestion').addEventListener('click',()=>act({type:'publish-question',question:$('controllerDiscussionQuestion').value,questionType:$('controllerDiscussionType').value,options:$('controllerDiscussionOptions').value.split(/\r?\n/)}));$('controllerReflexNext').addEventListener('click',()=>act({type:'reflex-next'}));$('controllerLiveBoardToggle').addEventListener('click',()=>act({type:'live-board-toggle'}));$('controllerBootReviewTeam').addEventListener('change',()=>renderBootReview(lastControllerState?.state,'controller'));$('controllerBootMarkCorrect').addEventListener('click',()=>act({type:'boot-review',team:Number($('controllerBootReviewTeam').value),value:'correct'}));$('controllerBootMarkWrong').addEventListener('click',()=>act({type:'boot-review',team:Number($('controllerBootReviewTeam').value),value:'wrong'}));$('controllerAchievementRound').addEventListener('change',()=>renderRoundRanking(lastControllerState?.state,'controllerAchievementRound','controllerRoundAchievements'));
 const approvalMode=$('controllerApprovalMode');if(approvalMode){approvalMode.value='auto';approvalMode.disabled=true}
 window.addEventListener('beforeunload',()=>{if(client&&controllerChannel)client.removeChannel(controllerChannel);controllerChannel=null});
}
function renderController(s,pending){
 if(!s)return;renderRoundWinnerCelebration(s);playIntroFromState(s);renderRoundControls(s.currentRound,'controller');renderBreakthroughAdmin(s,'controllerBreakthroughStatus');renderLiveBoard(s,'controllerLiveBoard');renderRoundRanking(s,'controllerAchievementRound','controllerRoundAchievements');renderBootReview(s,'controller');
 $('controllerLiveBoardToggle').textContent='MỞ BẢNG ĐIỀU PHỐI';$('controllerLiveBoardToggle').classList.toggle('hidden',!s.roundStarted||s.liveBoardVisible!==false||Number(s.winnerCelebration?.endsAt)>Date.now());
 $('controllerClock').textContent=String(Math.floor(s.seconds/60)).padStart(2,'0')+':'+String(s.seconds%60).padStart(2,'0');
 const round=$('controllerRound');if(round)round.value=s.currentRound;
 $('controllerScoreboard').replaceChildren();
 (s.teams||[]).forEach(t=>{const card=document.createElement('article');card.className='score-card';const h=document.createElement('h3');h.className='team-brand-line';const swatch=document.createElement('span');swatch.className='team-swatch';const symbol=document.createElement('span');symbol.className='team-symbol';symbol.textContent=t.avatar||'🌟';const teamName=document.createElement('span');teamName.textContent=t.name;h.append(swatch,symbol,teamName);card.style.setProperty('--team-accent',TEAM_COLORS.find(x=>x.id===t.color)?.value||'#43d9ff');const score=document.createElement('div');score.className='score';score.textContent=t.score+' điểm';const members=document.createElement('small');members.textContent=t.members.length+' thành viên · '+(s.careerPoints?.[s.teams.indexOf(t)]||0)+' điểm nghề nghiệp';card.append(h,score,members);if(t.slogan){const slogan=document.createElement('small');slogan.className='team-slogan';slogan.textContent=t.slogan;card.append(slogan)}const badges=teamBadges(t);if(badges.length){const row=document.createElement('div');row.className='team-badges';badges.forEach(label=>{const b=document.createElement('span');b.className='team-achievement-badge';b.textContent=label;row.append(b)});card.append(row)}$('controllerScoreboard').append(card)});
 const joined=(s.teams||[]).reduce((n,t)=>n+(t.members||[]).length,0);
 $('controllerPendingCount').textContent=joined+' thành viên';
 $('controllerPending').replaceChildren();
 if(!joined){const p=document.createElement('p');p.className='muted';p.textContent='Học sinh sẽ xuất hiện tại đây ngay sau khi nhập mã phòng và kết nối.';$('controllerPending').append(p);return}
 (s.teams||[]).forEach(team=>(team.members||[]).forEach(member=>{
  const row=document.createElement('article');row.className='pending-card';
  const info=document.createElement('div');info.className='pending-info';
  const avatar=document.createElement('span');avatar.className='member-list-avatar frame-'+(member.frame||'basic');avatar.textContent=member.avatar||'🙂';const name=document.createElement('strong');name.textContent=member.name;
  const detail=document.createElement('span');detail.textContent=team.avatar+' '+team.name+' · '+(Number(member.xp)||0)+' XP';const progress=document.createElement('small');progress.className='member-progress-line';progress.textContent=memberBadges(member).join(' · ');
  info.append(avatar,name,detail,progress);row.append(info);$('controllerPending').append(row);
 }));
}
function renderStudentState(data){if(!data||data.type!=='state')return;renderRoundWinnerCelebration(data);playIntroFromState(data);applyRoundTheme(data.currentRound);renderLinkStudent(data);renderReflexStudent(data);renderBreakthroughStudent(data);const teamIndex=Number.isInteger(selfTeamIndex)?selfTeamIndex:Number($('studentTeam').value);const team=data.teams?.[teamIndex];const ownMember=(team?.members||[]).find(m=>m.id===connection?.peer);const isCaptain=data.captains?.[teamIndex]===connection?.peer;if(ownMember)selfName=ownMember.name;$('studentIdentityName').textContent=selfName||$('studentName').value||'Học sinh';$('memberAvatarButton').textContent=ownMember?.avatar||'🙂';$('memberAvatarButton').className='student-identity-avatar frame-'+(ownMember?.frame||'basic');const xp=Number(ownMember?.xp)||0,badges=memberBadges(ownMember);if(connection)connection.__xp=xp;const savedProfile=readMemberProfile(selfName);saveMemberProfile(selfName,{...savedProfile,avatar:ownMember?.avatar||savedProfile.avatar,frame:ownMember?.frame||savedProfile.frame,xp});$('memberProgress').textContent=xp+' XP · '+(badges.length?badges.join(' · '):'Chưa có huy hiệu');$('studentTeamAvatar').textContent=team?.avatar||'🌟';$('studentTeamSlogan').textContent=team?.slogan||'';$('studentTeamSlogan').classList.toggle('hidden',!team?.slogan);$('studentTeamBadges').replaceChildren();teamBadges(team).forEach(label=>{const badge=document.createElement('span');badge.className='team-achievement-badge';badge.textContent=label;$('studentTeamBadges').append(badge)});$('teamCaptainTools').classList.toggle('hidden',!isCaptain);if(document.activeElement!==$('teamNameEdit'))$('teamNameEdit').value=team?.name||'';if(document.activeElement!==$('teamSloganEdit'))$('teamSloganEdit').value=team?.slogan||'';$('teamColorSelect').value=team?.color||'cyan';$('studentTeamAvatar').style.borderColor=TEAM_COLORS.find(x=>x.id===team?.color)?.value||'#43d9ff';$('careerSkillToggle').classList.toggle('hidden',!isCaptain);if(!isCaptain){$('careerSkillShop').classList.add('hidden');$('careerSkillToggle').setAttribute('aria-expanded','false')}$('careerSkillToggle').onclick=()=>{if(!isCaptain)return;const open=$('careerSkillShop').classList.contains('hidden');$('careerSkillShop').classList.toggle('hidden',!open);$('careerSkillToggle').setAttribute('aria-expanded',String(open))};$('studentPlay').classList.toggle('is-captain',isCaptain);$('studentPlay').classList.toggle('is-member',!isCaptain);$('studentRoleBadge').textContent=isCaptain?'ĐỘI TRƯỞNG':'THÀNH VIÊN';$('studentIdentityBar').classList.toggle('captain-identity-bar',isCaptain);if(team){$('studentTeamName').textContent=team.name;$('studentScore').textContent=team.score;$('careerPointBalance').textContent=String(data.careerPoints?.[teamIndex]||0)}$('studentRound').textContent=data.currentRound||'Chưa chọn hoạt động';const discussion=document.querySelector('.student-discussion');if(discussion)discussion.classList.toggle('hidden',data.currentRound!=='Khởi động');let future=$('studentFutureRoundStage');if(future)future.classList.toggle('hidden',['Bứt phá','Luyện tập','Vận dụng'].includes(data.currentRound)===false);if(future){const heading=future.querySelector('h3');if(heading)heading.textContent='VÒNG '+data.currentRound.toUpperCase()}$('studentTimer').textContent=data.seconds>0?'Thời gian còn lại: '+String(Math.floor(data.seconds/60)).padStart(2,'0')+':'+String(data.seconds%60).padStart(2,'0'):'Theo hướng dẫn của giáo viên.';
 const publicRoster=$('publicCaptainRoster');if(publicRoster){const until=Number(data.captainRevealUntil)||0,visible=until>Date.now();publicRoster.classList.toggle('hidden',!visible);if(visible){publicRoster.replaceChildren();(data.teams||[]).forEach((t,i)=>{const line=document.createElement('p');const leader=t.members.find(m=>m.id===data.captains?.[i]);line.textContent=t.name+': '+(leader?leader.name:'Chưa có đội trưởng');publicRoster.append(line)});if(window.__captainRosterUntil!==until){window.__captainRosterUntil=until;clearTimeout(window.__captainRosterTimer);window.__captainRosterTimer=setTimeout(()=>{if(Date.now()>=until)publicRoster.classList.add('hidden')},Math.max(0,until-Date.now()))}}}const celebrationId=Number(data.captainRevealUntil)||0;if(isCaptain&&celebrationId>Date.now()&&window.__captainCelebrationUntil!==celebrationId){window.__captainCelebrationUntil=celebrationId;document.getElementById('captainElectionCelebration')?.remove();const celebration=document.createElement('div');celebration.id='captainElectionCelebration';celebration.className='captain-election-celebration';celebration.setAttribute('aria-live','polite');const burst=document.createElement('div');burst.className='captain-celebration-burst';burst.textContent='✦';const title=document.createElement('h2');title.textContent='CHÚC MỪNG ĐỘI TRƯỞNG!';const message=document.createElement('p');message.textContent='Bạn đã được các thành viên tín nhiệm bầu chọn.';celebration.append(burst,title,message);$('studentPlay').append(celebration);setTimeout(()=>celebration.remove(),Math.max(0,celebrationId-Date.now()))}const q=data.question||{};$('studentQuestion').textContent=q.text||'Đang chờ giáo viên gửi câu hỏi…'; const election=data.captainElection||{};$('captainElection').classList.toggle('hidden',!election.open);
 const candidates=$('captainCandidates'),candidateMembers=data.teams?.[teamIndex]?.members||[],electionId=String(election.startedAt||election.endsAt||''),candidateKey=electionId+':'+candidateMembers.map(m=>m.id+':'+m.name).join('|');if(election.open&&candidates.dataset.electionKey!==candidateKey){const previous=candidates.dataset.electionId===electionId?candidates.querySelector('input[name="captainCandidate"]:checked')?.value:null;candidates.replaceChildren();candidateMembers.forEach(m=>{const label=document.createElement('label');label.className='student-choice';const r=document.createElement('input');r.type='radio';r.name='captainCandidate';r.value=m.id;r.checked=m.id===(previous||'');const span=document.createElement('span');span.textContent=m.name;label.append(r,span);candidates.append(label)});candidates.dataset.electionId=electionId;candidates.dataset.electionKey=candidateKey}
 $('captainCountdown').textContent=election.open?'Còn '+Math.max(0,Math.ceil((election.endsAt-Date.now())/1000))+' giây':'';
 const voted=!!data.captainVotes?.[teamIndex]?.[connection?.peer];$('voteCaptain').disabled=!election.open||voted;
 const captain=data.captains?.[teamIndex];
 $('captainIdentity').textContent=isCaptain?'Bạn là ĐỘI TRƯỞNG.':(captain?'Đội trưởng: '+(team?.members||[]).find(m=>m.id===captain)?.name:'Đội chưa có đội trưởng.');
 $('captainSubmitPanel').classList.toggle('hidden',!isCaptain||!!data.teamFinals?.[teamIndex]);
 const select=$('captainAnswerSelect'),old=select.value;select.replaceChildren();const empty=document.createElement('option');empty.value='';empty.textContent='Chọn ý kiến của thành viên';select.append(empty);
 (data.teamTexts?.[teamIndex]||[]).forEach((v,i)=>{const o=document.createElement('option');o.value=String(i);o.textContent=v.name+': '+v.text;select.append(o)});select.value=old;
 $('captainSend').disabled=!isCaptain||!!data.teamFinals?.[teamIndex];$('captainSkip').disabled=!isCaptain||!!data.teamFinals?.[teamIndex];

 const list=$('studentChoiceList'),previousChoice=document.querySelector('input[name="teamChoice"]:checked')?.value;list.replaceChildren();
 if(q.type!=='text'&&Array.isArray(q.options))q.options.forEach((option,i)=>{const label=document.createElement('label');label.className='student-choice';const radio=document.createElement('input');radio.type='radio';radio.name='teamChoice';radio.value=String(i);radio.checked=previousChoice===String(i);const span=document.createElement('span');span.textContent=option;label.append(radio,span);list.append(label)});
 $('studentChoiceList').classList.toggle('hidden',isCaptain||q.type==='text'||!q.options?.length);$('studentTextWrap').classList.toggle('hidden',isCaptain||q.type==='choice');
 const final=data.teamFinals?.[teamIndex];$('sendAnswer').disabled=!!final||!q.text;$('sendAnswer').textContent=final?'ĐỘI ĐÃ CHỐT ĐÁP ÁN':'GỬI Ý KIẾN VÀO PHÒNG ĐỘI';
 const tally=data.teamVotes?.[teamIndex]||{},ballotCount=Object.keys(tally).length,teamMessages=data.teamTexts?.[teamIndex]||[];
 const recent=teamMessages.slice(-4).map(item=>item.name+': '+item.text).join(' | ');
 $('studentTeamTally').textContent='Phòng đội: '+ballotCount+' thành viên đã chọn phương án.'+(recent?' Ý kiến mới: '+recent:'')+(final?' Đáp án chung: '+final.answer:' Giáo viên sẽ quyết định đáp án cuối cùng.');
}
function updateTeams(){for(let i=0;i<4;i++)$('teamName'+i).value=teams[i].name}
function publishQuestionData(q,type,options,statusId='questionStatus'){q=String(q||'').trim();if(!q){$(statusId).textContent='Hãy nhập nội dung câu hỏi.';return false}type=type||'both';options=(options||[]).map(x=>String(x).trim()).filter(Boolean).slice(0,8);if(type!=='text'&&options.length<2){$(statusId).textContent='Hãy nhập ít nhất hai phương án, mỗi phương án một dòng.';return false}currentQuestion=q;questionType=type;questionOptions=options;teamVotes=[{}, {}, {}, {}];teamTexts=[[],[],[],[]];teamFinals=[null,null,null,null];raceOrder=[];raceAwarded.clear();bootReview=[null,null,null,null];$(statusId).textContent='Đã gửi câu hỏi đến các phòng đội.';broadcast();return true}
function publishQuestion(){publishQuestionData($('discussionQuestion').value,$('discussionType').value,$('discussionOptions').value.split(/\r?\n/))}
function setClock(){$('roomClock').textContent=String(Math.floor(seconds/60)).padStart(2,'0')+':'+String(seconds%60).padStart(2,'0')}
const roundDurations={'Khởi động':300,'Phản xạ':600,'Liên kết':600,'Bứt phá':600,'Luyện tập':300,'Vận dụng':300};
function roundDuration(name){return roundDurations[name]||300}
function resetRoundClock(){if(liveBoardRevealTimer){clearTimeout(liveBoardRevealTimer);liveBoardRevealTimer=null}liveBoardVisible=true;roundMusicActive=false;window.GameSound?.stop?.();if(roundIntroTimer){clearTimeout(roundIntroTimer);roundIntroTimer=null}roundIntro={id:0,round:'',startedAt:0,endsAt:0};if(linkTurnTimer)clearTimeout(linkTurnTimer);linkTurnTimer=null;if(linkTurnTicker){clearInterval(linkTurnTicker);linkTurnTicker=null}linkRound={active:false,workStarted:false,order:[],turn:0,turnEndsAt:0,assigned:{},currentCard:null,cardVotes:{},lastAutoPick:null,selectionClosed:false};if(breakthroughRound.active&&!breakthroughRound.closed){breakthroughRound.closed=true;syncBreakthroughRound()}if(timer)clearInterval(timer);timer=null;if(breakthroughTurnTimer)clearTimeout(breakthroughTurnTimer);breakthroughTurnTimer=null;if(breakthroughTurnTicker){clearInterval(breakthroughTurnTicker);breakthroughTurnTicker=null}breakthroughRound={active:false,workStarted:false,order:[],turn:0,turnEndsAt:0,assigned:{},lastAutoPick:null,closed:false,responses:[{},{},{},{}]};Object.keys(breakthroughDrafts).forEach(k=>delete breakthroughDrafts[k]);roundStarted=false;seconds=roundDuration(currentRound);setClock();broadcast()}
function startRoundCountdown(){if(timer)return;timer=setInterval(()=>{if(seconds>0)seconds--;if(seconds<=0){seconds=0;clearInterval(timer);timer=null;if(currentRound==='Liên kết')closeLinkSelections();else if(currentRound==='Bứt phá')closeBreakthroughRound()}setClock();broadcast()},1000)}
 function startRoundWithIntro(){
  if(timer||roundIntroTimer||roundStarted)return;
  if(pendingRoundCelebration){setRoundWinnerCelebration(pendingRoundCelebration);pendingRoundCelebration='';}
  const now=Date.now(),id=now+'-'+Math.random().toString(36).slice(2,7);
  roundIntro={id,round:currentRound,startedAt:now,endsAt:now+6300};
  roundMusicActive=true;
  window.GameSound?.roundIntro?.(currentRound);
  roundStarted=true;
  if(currentRound==='Liên kết'&&!linkRound.active)startLinkRound();
  else if(currentRound==='Bứt phá'&&!breakthroughRound.active)startBreakthroughRound();
  else{
   if(currentRound==='Phản xạ'&&!reflex.active)startReflexQuestion(0);
   startRoundCountdown();
  }
  broadcast();
  roundIntroTimer=setTimeout(()=>{
   roundIntroTimer=null;
   if(roundIntro.id!==id)return;
   roundIntro={...roundIntro,endsAt:0};
   broadcast();
  },6300);
 }
 function finishCurrentRound(){
  roundMusicActive=false;window.GameSound?.stop?.();
  if(roundIntroTimer){clearTimeout(roundIntroTimer);roundIntroTimer=null}
  if(roundIntro.id)roundIntro={...roundIntro,endsAt:0};
  if(timer){clearInterval(timer);timer=null}
  if(reflex.active){clearReflexTimers();reflex.active=false;reflex.index=-1;reflexTeamPhases=reflexTeamPhases.map(p=>({...p,phase:p.phase==='done'?'done':'closed',captainEndsAt:0}));$('reflexStatus').textContent='Giáo viên đã kết thúc vòng Phản xạ.'}
  if(linkRound.active)closeLinkSelections();
  if(breakthroughRound.active)closeBreakthroughRound();
  seconds=0;roundStarted=true;setClock();window.GameSound?.success?.();broadcast();
 }
if(controllerHost)startController();else if(hostId)startStudent();else{show('teacherView');renderTeacher();renderPending();$('createRoom').addEventListener('click',startTeacher);$('closeRoom').addEventListener('click',closeTeacher);$('currentRound').addEventListener('change',()=>{const nextRound=$('currentRound').value;if(roundStarted&&!pendingRoundCelebration&&currentRound!==nextRound)pendingRoundCelebration=currentRound;currentRound=nextRound;resetRoundClock();applyRoundTheme(currentRound)});$('startCaptainVote').addEventListener('click',openCaptainElection);$('publishQuestionButton').addEventListener('click',publishQuestion);$('liveBoardToggle').addEventListener('click',()=>{liveBoardVisible=!liveBoardVisible;broadcast()});$('bootReviewTeam').addEventListener('change',()=>renderBootReview(state()));$('bootMarkCorrect').addEventListener('click',()=>{bootReview[Number($('bootReviewTeam').value)]='correct';broadcast()});$('bootMarkWrong').addEventListener('click',()=>{bootReview[Number($('bootReviewTeam').value)]='wrong';broadcast()});$('achievementRoundSelect').addEventListener('change',()=>renderRoundRanking(state(),'achievementRoundSelect','reflexAchievements'));$('timerStart').addEventListener('click',startRoundWithIntro);$('timerReset').addEventListener('click',resetRoundClock);$('finishRound').addEventListener('click',finishCurrentRound);setClock();$('reflexNext').addEventListener('click',()=>startReflexQuestion(reflex.index+1));window.addEventListener('beforeunload',()=>{removeStudentChannel();removeControllerChannel()})}
})();