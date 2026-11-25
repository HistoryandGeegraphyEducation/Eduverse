(function(){
"use strict";
function renderDashboard(root,actions){
 if(!root)return;
 const date=new Intl.DateTimeFormat("vi-VN",{weekday:"long",day:"2-digit",month:"long",year:"numeric"}).format(new Date());
 root.className="main dashboard-page";
 root.innerHTML=`<section class="dashboard" aria-label="Tổng quan học tập">
 <header class="dashboard-head"><div><p class="dashboard-kicker">EDUVERSE / LEARNING SPACE</p><h1 class="dashboard-title">Không gian học tập</h1><p class="dashboard-subtitle">Truy cập các khu vực học liệu và hoạt động đang có trong EDUVERSE.</p></div><time class="dashboard-date">${date}</time></header>
 <section class="dashboard-hero"><div class="dashboard-hero-copy"><h2>Mở rộng hành trình khám phá</h2><p>Chọn một không gian để bắt đầu học tập, quan sát mô phỏng hoặc tham gia hoạt động tương tác.</p><div class="dashboard-hero-actions"><button class="dashboard-action" type="button" data-action="category">Khám phá học liệu</button><button class="dashboard-action secondary" type="button" data-action="home">Về trang chủ</button></div></div><div class="dashboard-orbit" aria-hidden="true"><span class="dashboard-moon one">✧</span><span class="dashboard-moon two">◌</span><span class="dashboard-moon three">✦</span><span class="dashboard-planet">✦</span></div></section>
 <section class="dashboard-section"><div class="dashboard-section-head"><div><h2>Không gian khám phá</h2><p>Vuốt hoặc dùng nút mũi tên để xem các khu vực.</p></div><div class="dashboard-carousel-controls"><button class="dashboard-arrow" type="button" data-scroll="-1" aria-label="Xem khu vực trước">‹</button><button class="dashboard-arrow" type="button" data-scroll="1" aria-label="Xem khu vực tiếp theo">›</button></div></div>
 <div class="dashboard-carousel" id="dashboardCarousel" tabindex="0" aria-label="Danh sách không gian học tập">
 <button class="dashboard-card" type="button" data-action="category"><span class="dashboard-card-icon">🌍</span><span><strong>Lịch Sử và Địa Lí</strong><small>Học liệu, bản đồ và mô phỏng</small></span><span class="dashboard-card-go" aria-hidden="true">↗</span></button>
 <button class="dashboard-card" type="button" data-action="music"><span class="dashboard-card-icon">♫</span><span><strong>Âm nhạc</strong><small>Phòng nhạc cụ và công cụ tương tác</small></span><span class="dashboard-card-go" aria-hidden="true">↗</span></button>
 <button class="dashboard-card" type="button" data-action="practice"><span class="dashboard-card-icon">◈</span><span><strong>Trò chơi học tập</strong><small>Các hoạt động và thử thách</small></span><span class="dashboard-card-go" aria-hidden="true">↗</span></button>
 <button class="dashboard-card" type="button" data-action="home"><span class="dashboard-card-icon">⌂</span><span><strong>Trang chủ</strong><small>Các môn học trong hệ sinh thái</small></span><span class="dashboard-card-go" aria-hidden="true">↗</span></button></div></section>
 <section class="dashboard-lower"><div class="dashboard-panel"><h3>Truy cập nhanh</h3>
 <button class="dashboard-link" type="button" data-action="category"><span class="dashboard-link-icon">🌐</span><span><strong>Kho học liệu Lịch Sử và Địa Lí</strong><small>Mô phỏng, trưng bày, bảo tàng và bản đồ</small></span><span class="dashboard-chevron">›</span></button>
 <button class="dashboard-link" type="button" data-action="music"><span class="dashboard-link-icon">♫</span><span><strong>Phòng nhạc cụ</strong><small>Piano và các nhạc cụ tương tác</small></span><span class="dashboard-chevron">›</span></button>
 <button class="dashboard-link" type="button" data-action="practice"><span class="dashboard-link-icon">◈</span><span><strong>Trò chơi học tập</strong><small>Mở khu vực hoạt động</small></span><span class="dashboard-chevron">›</span></button></div>
 <aside class="dashboard-panel"><h3>Tiến độ học tập</h3><p class="dashboard-note">Khu vực tổng hợp tiến độ sẽ hiển thị khi hệ thống lưu trữ kết quả học tập được kết nối. Hiện tại EDUVERSE chưa ghi nhận số liệu tiến độ tại màn hình này.</p></aside></section></section>`;
 root.querySelectorAll("[data-action]").forEach(b=>b.addEventListener("click",()=>{
  const a=b.dataset.action;
  if(a==="category")actions?.openCategory?.("lsdl");
  if(a==="music")actions?.openCategory?.("am");
  if(a==="practice")actions?.openPractice?.();
  if(a==="home")actions?.openHome?.();
 }));
 const carousel=root.querySelector("#dashboardCarousel");
 root.querySelectorAll("[data-scroll]").forEach(b=>b.addEventListener("click",()=>{
  const card=carousel.querySelector(".dashboard-card");
  carousel.scrollBy({left:(Number(b.dataset.scroll)||1)*(card?card.getBoundingClientRect().width+14:260),behavior:"smooth"});
 }));
}
window.renderDashboard=renderDashboard;
})();