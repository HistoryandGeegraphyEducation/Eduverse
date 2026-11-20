document.querySelectorAll('.card').forEach((c,i)=>c.style.animationDelay=(i*.07)+'s');
const studentForm=document.getElementById('studentRoomForm');
const teacherForm=document.getElementById('teacherRoomForm');
const teacherToggle=document.getElementById('teacherEntryToggle');
const entryMessage=document.getElementById('roomEntryMessage');
const cleanRoomCode=value=>value.trim().toUpperCase().replace(/[^A-Z0-9_-]/g,'');
if(studentForm)studentForm.addEventListener('submit',event=>{event.preventDefault();const code=cleanRoomCode(document.getElementById('studentRoomCode').value);if(!code){entryMessage.textContent='Hãy nhập mã phòng do giáo viên cung cấp.';return}location.href='room.html?join='+encodeURIComponent(code)});
if(teacherToggle&&teacherForm)teacherToggle.addEventListener('click',()=>{const opening=teacherForm.classList.contains('hidden');teacherForm.classList.toggle('hidden',!opening);teacherToggle.setAttribute('aria-expanded',String(opening));if(opening)document.getElementById('teacherRoomCode').focus();entryMessage.textContent=''});
if(teacherForm)teacherForm.addEventListener('submit',event=>{event.preventDefault();const code=cleanRoomCode(document.getElementById('teacherRoomCode').value);if(!code){entryMessage.textContent='Hãy nhập mã truy cập giáo viên.';return}location.href='room.html?control='+encodeURIComponent(code)});
