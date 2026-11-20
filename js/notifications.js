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
    `,
    "13/11": `
      <section class="route-section">
        <h3>Điều chỉnh phạm vi thử nghiệm</h3>
        <p>Để tập trung nguồn lực và bảo đảm chất lượng trong quá trình phát triển, EDUVERSE sẽ thu hẹp phạm vi thử nghiệm ban đầu.</p>
        <p><strong>Đối tượng thử nghiệm:</strong> Phạm vi được điều chỉnh từ sinh viên khóa 23 thành sinh viên khóa 2023–2027.</p>
        <p><strong>Lĩnh vực triển khai:</strong> EDUVERSE tạm thời không triển khai các lĩnh vực Khoa học tự nhiên, Ngữ văn, Công nghệ, Giáo dục địa phương, Hoạt động trải nghiệm – hướng nghiệp và Giáo dục công dân (phần Kinh tế).</p>
      </section>
      <section class="route-section">
        <h3>Kế hoạch thử nghiệm</h3>
        <p><strong>Giai đoạn 1</strong></p>
        <ul>
          <li>00:00 ngày 01/12: Alpha Test.</li>
          <li>00:00 ngày 02/12: Close Test.</li>
        </ul>
        <p><strong>Giai đoạn 2</strong></p>
        <ul>
          <li>00:00 ngày 28/01: Open Beta.</li>
          <li>12:00 ngày 28/01: Close Beta.</li>
        </ul>
        <p><strong>Giai đoạn 3 – Dự kiến</strong></p>
        <ul>
          <li>Tháng 04: Beta Test V2.</li>
          <li>Tháng 06: Beta Test V3.</li>
        </ul>
        <p>Các mốc thử nghiệm sẽ là cơ sở để nhóm đánh giá hệ thống, tiếp nhận phản hồi và điều chỉnh những nội dung cần thiết trước các giai đoạn tiếp theo.</p>
      </section>
      <section class="route-section">
        <h3>Kế hoạch ra mắt và thời hạn hoạt động</h3>
        <p>EDUVERSE dự kiến chính thức ra mắt vào tháng 09/2027. Thời gian hoạt động của phiên bản này dự kiến kết thúc vào tháng 09/2028.</p>
        <p>Việc xác định thời hạn ngay từ đầu nhằm giúp nhóm chủ động xây dựng kế hoạch phát triển phù hợp với định hướng chương trình giáo dục và những thay đổi có thể diễn ra trong tương lai.</p>
      </section>
      <section class="route-section">
        <h3>Định hướng phát triển tiếp theo</h3>
        <p>Việc kết thúc hoạt động của EDUVERSE vào tháng 09/2028 không đồng nghĩa với việc toàn bộ dự án sẽ chấm dứt. Nhóm phát triển đưa ra mốc thời gian này dựa trên định hướng nghiên cứu chương trình và dự thảo của Bộ Giáo dục về chương trình sách giáo khoa mới. Khi có những thay đổi phù hợp, EDUVERSE có thể được xây dựng lại trong một phiên bản khác, với nội dung và cấu trúc được điều chỉnh tương ứng.</p>
        <p>Ở giai đoạn phát triển thứ năm, nhóm dự kiến mở rộng dự án ra ngoài phạm vi mô phỏng kiến thức trong sách giáo khoa. Hiện tại, dự án đã nhận được sự quan tâm từ một số du học sinh tại Đức, Hà Lan, Pháp và Trung Quốc. Nhóm mong muốn có cơ hội hợp tác với các bạn để trao đổi kiến thức, chia sẻ kinh nghiệm và cùng hoàn thiện những sản phẩm giáo dục.</p>
        <p>Bên cạnh các mô hình số, EDUVERSE cũng định hướng nghiên cứu và thử nghiệm những phương thức trình diễn, thực hành mới như hologram, hình ảnh lập thể, công nghệ 3D và các sản phẩm STEM quy mô lớn.</p>
        <p>Mục tiêu của định hướng này là mở rộng khả năng học tập từ việc tiếp nhận kiến thức đến tư duy, khám phá và thực hành. Nội dung phát triển sẽ dựa trên những chủ đề mà người học muốn tìm hiểu, những vấn đề các em quan tâm và những sản phẩm các em mong muốn tự tay thực hiện.</p>
      </section>
      <section class="route-section">
        <p>Những nội dung trên là lộ trình phát triển được nhóm xác định ở thời điểm hiện tại. Trong quá trình triển khai, các mốc thời gian và kế hoạch có thể được điều chỉnh tùy theo kết quả thử nghiệm và điều kiện thực tế.</p>
        <p>Cảm ơn các bạn đã quan tâm, theo dõi và đồng hành cùng EDUVERSE.</p>
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
