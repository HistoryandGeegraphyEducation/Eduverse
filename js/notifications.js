(() => {
  const bell = document.getElementById("notificationBell");
  const panel = document.getElementById("notificationPanel");
  const viewer = document.getElementById("notificationViewer");
  const title = document.getElementById("notificationDocumentTitle");
  const body = document.getElementById("notificationDocumentContent");
  const closeButton = document.getElementById("notificationDocumentClose");
  if (!bell || !panel || !viewer || !title || !body || !closeButton) return;

  const routeContent = {
    "06/11": `
      <section class="route-section">
        <h3>Định hướng dự án</h3>
        <p>EDUVERSE_JUNIOR-HIGH-SCHOOL là hệ sinh thái học tập số dành cho học sinh THCS, tập trung phát triển mô hình mô phỏng, không gian khám phá và phòng thực hành (Labs). Dự án hướng đến việc giúp học sinh quan sát, tương tác và thử nghiệm kiến thức; đồng thời hỗ trợ sinh viên Sư phạm chuẩn bị bài giảng và thực hành phương pháp dạy học.</p>
      </section>
      <section class="route-section">
        <h3>Phạm vi phát triển</h3>
        <p>Giai đoạn đầu tập trung vào chương trình THCS từ lớp 6 đến lớp 9, với định hướng mở rộng lên THPT trong tương lai. Dự án bắt đầu từ hơn 100 ý tưởng mô phỏng môn Địa lí, sau đó từng bước phát triển thêm nội dung cho Lịch sử, Toán học, Vật lí, Hóa học, Sinh học, Tin học và các lĩnh vực liên quan.</p>
      </section>
      <section class="route-section">
        <h3>Ứng dụng công nghệ</h3>
        <p>Dự án định hướng ứng dụng công nghệ trí tuệ nhân tạo (AIT) để hỗ trợ trình diễn, thử nghiệm, điều chỉnh mô hình, tìm kiếm giải pháp và phát triển mã nguồn. Các sản phẩm được xây dựng theo hướng có thể tiếp tục hoàn thiện và mở rộng.</p>
      </section>
      <section class="route-section">
        <h3>Đối tượng tham gia</h3>
        <p>Dự án dự kiến ưu tiên công bố phiên bản hoàn chỉnh hoặc phiên bản đạt mục tiêu ban đầu cho những người đáp ứng đồng thời ba tiêu chí:</p>
        <ol>
          <li>Là sinh viên ngành Sư phạm.</li>
          <li>Có định hướng hoặc tham gia hoạt động giáo dục cấp THCS.</li>
          <li>Là sinh viên khóa 23.</li>
        </ol>
      </section>
      <section class="route-section">
        <h3>Định hướng cộng tác</h3>
        <p>Dự án mong muốn kết nối sinh viên Sư phạm khóa 23 thuộc nhiều chuyên ngành. Người tham gia có thể đóng góp kiến thức chuyên môn, ý tưởng mô phỏng, tư liệu giảng dạy, thiết kế mô hình, xây dựng phòng thực hành hoặc đề xuất phương pháp ứng dụng công nghệ vào bài học. Không bắt buộc phải có kiến thức lập trình.</p>
      </section>
      <section class="route-section">
        <h3>Mục tiêu chung</h3>
        <p>Cùng xây dựng và thử nghiệm những học liệu số có thể ứng dụng vào quá trình học tập, giảng dạy và chuẩn bị thực tập tốt nghiệp.</p>
      </section>
    `
  };

  let previousFocus = null;

  const closePanel = () => {
    panel.hidden = true;
    bell.setAttribute("aria-expanded", "false");
  };

  const closeViewer = () => {
    if (viewer.hidden) return;
    viewer.hidden = true;
    document.body.classList.remove("notification-viewer-open");
    if (previousFocus && typeof previousFocus.focus === "function") previousFocus.focus();
  };

  bell.addEventListener("click", (event) => {
    event.stopPropagation();
    const willOpen = panel.hidden;
    panel.hidden = !willOpen;
    bell.setAttribute("aria-expanded", String(willOpen));
  });

  panel.addEventListener("click", (event) => event.stopPropagation());
  panel.querySelectorAll(".notification-option").forEach((option) => {
    option.addEventListener("click", () => {
      previousFocus = option;
      const date = (option.dataset.noticeTitle || "").match(/06\/11|13\/11|20\/11/)?.[0] || "";
      title.textContent = option.dataset.noticeTitle || "Lộ trình";
      body.innerHTML = routeContent[date] || "";
      closePanel();
      viewer.hidden = false;
      document.body.classList.add("notification-viewer-open");
      closeButton.focus();
    });
  });

  closeButton.addEventListener("click", closeViewer);
  viewer.querySelector("[data-close-notice]").addEventListener("click", closeViewer);
  document.addEventListener("click", closePanel);
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      if (!viewer.hidden) closeViewer();
      else closePanel();
    }
  });
})();
