
// ===== DỮ LIỆU =====
const SUBJECTS = [
  {id:"lsdl", n:"LỊCH SỬ VÀ ĐỊA LÍ", e:"🏛️", live:true},
  {id:"khtn", n:"KHOA HỌC TỰ NHIÊN", e:"🔬"},
  {id:"gdcd", n:"GIÁO DỤC CÔNG DÂN", e:"⚖️"},
  {id:"toan", n:"TOÁN", e:"➗"},
  {id:"nv",   n:"NGỮ VĂN", e:"📖"},
  {id:"ta",   n:"TIẾNG ANH", e:"🔤"},
  {id:"gddp", n:"GDĐP", e:"📍"},
  {id:"hdtn", n:"HĐTN, HN", e:"🧭"},
  {id:"tin",  n:"TIN HỌC", e:"💻"},
  {id:"cn",   n:"CÔNG NGHỆ", e:"⚙️"},
  {id:"am",   n:"ÂM NHẠC", e:"🎵"},
  {id:"mt",   n:"MĨ THUẬT", e:"🎨"}
];
const GRADES = [6,7,8,9];
const CONTENT = {
  "lsdl-6": {
    "Lịch Sử": [
      ["Chương 1. Vì sao phải học Lịch sử?", ["Lịch sử và cuộc sống","Dựa vào đâu để biết và phục dựng lại lịch sử?","Thời gian trong lịch sử"]],
      ["Chương 2. Xã hội nguyên thủy", ["Nguồn gốc loài người","Xã hội nguyên thủy","Sự chuyển biến và phân hoá của xã hội nguyên thủy"]],
      ["Chương 3. Xã hội cổ đại", ["Ai Cập và Lưỡng Hà cổ đại","Ấn Độ cổ đại","Trung Quốc cổ đại","Hy Lạp và La Mã cổ đại"]],
      ["Chương 4. Đông Nam Á từ những thế kỉ tiếp giáp đầu Công nguyên đến thế kỉ X", ["Các quốc gia sơ kì ở Đông Nam Á","Sự hình thành và bước đầu phát triển của các vương quốc phong kiến ở Đông Nam Á (từ thế kỉ VII đến thế kỉ X)","Giao lưu văn hoá ở Đông Nam Á từ đầu Công nguyên đến thế kỉ X"]],
      ["Chương 5. Việt Nam từ khoảng thế kỉ VII trước Công nguyên đến đầu thế kỉ X", ["Nhà nước Văn Lang, Âu Lạc","Chính sách cai trị của các triều đại phong kiến phương Bắc và sự chuyển biến của xã hội Âu Lạc","Các cuộc khởi nghĩa tiêu biểu giành độc lập trước thế kỉ X","Cuộc đấu tranh bảo tồn và phát triển văn hoá dân tộc của người Việt","Bước ngoặt lịch sử đầu thế kỉ X","Vương quốc Chăm-pa từ thế kỉ II đến thế kỉ X","Vương quốc Phù Nam"]]
    ],
    "Địa Lí": [
      ["Bài mở đầu", ["Bài mở đầu"]],
      ["Chương 1. Bản đồ – phương tiện thể hiện bề mặt Trái Đất", ["Hệ thống kinh, vĩ tuyến. Tọa độ địa lí","Bản đồ. Một số lưới kinh, vĩ tuyến. Phương hướng trên bản đồ","Tỉ lệ bản đồ. Tính khoảng cách thực tế dựa vào tỉ lệ bản đồ","Kí hiệu và bảng chú giải bản đồ. Tìm đường đi trên bản đồ","Lược đồ trí nhớ"]],
      ["Chương 2. Trái Đất – hành tinh của Hệ Mặt Trời", ["Trái Đất trong hệ Mặt Trời","Chuyển động tự quay quanh trục của Trái Đất và hệ quả","Chuyển động của Trái Đất quanh Mặt Trời và hệ quả","Xác định phương hướng ngoài thực tế"]],
      ["Chương 3. Cấu tạo của Trái Đất. Vỏ Trái Đất", ["Cấu tạo của Trái Đất. Các mảng kiến tạo","Quá trình nội sinh và quá trình ngoại sinh. Hiện tượng tạo núi","Núi lửa và động đất","Các dạng địa hình chính trên Trái Đất. Khoáng sản","Thực hành: Đọc lược đồ địa hình tỉ lệ lớn và lát cắt địa hình đơn giản"]],
      ["Chương 4. Khí hậu và biến đổi khí hậu", ["Lớp vỏ khí của Trái Đất. Khí áp và gió","Nhiệt độ không khí. Mây và mưa","Thời tiết và khí hậu. Biến đổi khí hậu","Thực hành: Phân tích biểu đồ nhiệt độ, lượng mưa"]],
      ["Chương 5. Nước trên Trái Đất", ["Thủy quyển và vòng tuần hoàn lớn của nước","Sông và hồ. Nước ngầm và băng hà","Biển và đại dương"]],
      ["Chương 6. Đất và sinh vật trên Trái Đất", ["Lớp đất trên Trái Đất","Sự sống trên Trái Đất","Rừng nhiệt đới","Sự phân bố các đới thiên nhiên trên Trái Đất","Thực hành: Tìm hiểu môi trường tự nhiên địa phương"]],
      ["Chương 7. Con người và thiên nhiên", ["Dân số và sự phân bố dân cư trên thế giới","Mối quan hệ giữa con người và thiên nhiên","Bảo vệ tự nhiên và khai thác thông minh các tài nguyên thiên nhiên vì sự phát triển bền vững","Thực hành: Tìm hiểu mối quan hệ giữa con người và thiên nhiên ở địa phương"]]
    ]
  }
};

// Ảnh nhỏ trên nút lớp: bên trái = Lịch sử, bên phải = Địa lí (thay ảnh bằng cách ghi đè file trong assets/img/grade/)
const GRADE_ICONS = { lsdl: {
  6:["assets/img/grade/h6.jpg","assets/img/grade/g6.jpg"],
  7:["assets/img/grade/h7.jpg","assets/img/grade/g7.jpg"],
  8:["assets/img/grade/h8.jpg","assets/img/grade/g8.jpg"],
  9:["assets/img/grade/h9.jpg","assets/img/grade/g9.jpg"] } };

// Các phòng của từng môn
const PAL = [["#7c6cff","#4a3fe0"],["#ff9a6c","#e8593a"],["#4cd6a0","#1c9c6e"],["#f2c14e","#c98a12"],["#4cc3ff","#1f7fd8"],["#ff7a94","#d93d63"],["#b987ff","#7a45d6"],["#ffb347","#e07b00"],["#5ad1d1","#1d9a9a"],["#7bd86b","#3ea02f"]];
const mk = list => list.map(([n,e],i)=>({n,e,c:PAL[i%PAL.length]}));
const ROOMS = {
  lsdl: [
    {n:"Phòng mô phỏng", e:"🎛️", c:["#7c6cff","#4a3fe0"], img:"assets/img/grade/g6.jpg"},
    {n:"Phòng trưng bày", e:"🖼️", c:["#ff9a6c","#e8593a"], img:"assets/img/grade/h7.jpg"},
    {n:"Phòng bản đồ", e:"🗺️", c:["#4cd6a0","#1c9c6e"], img:"assets/img/grade/g7.jpg"},
    {n:"Phòng bảo tàng", e:"🏛️", c:["#f2c14e","#c98a12"], img:"assets/img/grade/h6.jpg"},
    {n:"Phòng dòng thời gian", e:"⏳", c:["#ffb347","#e07b00"], img:"assets/img/grade/h8.jpg"},
    {n:"Phòng khám phá địa phương", e:"🧭", c:["#5ad1d1","#1d9a9a"], img:"assets/img/grade/g8.jpg"}
  ],
  khtn: mk([["Phòng thí nghiệm","🧪"],["Phòng mô phỏng","🎛️"],["Phòng hiển vi","🔬"],["Phòng bảng tuần hoàn","⚛️"]]),
  toan: mk([["Phòng số và phép tính","➗"],["Phòng hình học","📐"],["Phòng đồ thị","📈"],["Phòng thống kê và xác suất","🎲"]]),
  nv:   mk([["Phòng tác giả và tác phẩm","✍️"],["Phòng sân khấu","🎭"],["Phòng viết","📝"],["Phòng từ ngữ","💬"]]),
  ta:   mk([["Phòng hội thoại","💬"],["Phòng phát âm","🎤"],["Phòng từ vựng bằng hình","🖼️"],["Phòng ngữ pháp","📖"],["Phòng văn hoá thế giới","🌐"]]),
  gdcd: mk([["Phòng tình huống","🤝"],["Phòng tấm gương","🌟"],["Phòng pháp luật","⚖️"]]),
  gddp: mk([["Phòng bản đồ địa phương","📍"],["Phòng di sản","🏯"],["Phòng nhân vật địa phương","👤"],["Phòng khám phá địa phương","🧭"]]),
  hdtn: mk([["Phòng khám phá bản thân","🔍"],["Phòng kĩ năng sống","🌱"],["Phòng dự án","📋"],["Phòng nghề nghiệp","👷"]]),
  tin:  mk([["Phòng lập trình kéo thả","🧩"],["Phòng bảng tính","📊"],["Phòng an toàn mạng","🛡️"],["Phòng thuật toán","🔀"]]),
  cn:   mk([["Phòng đời sống","🏠"],["Phòng nông nghiệp","🌾"],["Phòng bản vẽ và cơ khí","🔧"],["Phòng mạch điện","💡"]]),
  am:   mk([["Phòng nhạc cụ","🎹"],["Phòng đọc nhạc","🎼"],["Phòng luyện hát","🎙️"],["Phòng nhạc sĩ và tác phẩm","🎻"],["Phòng thưởng thức","🎧"]]),
  mt:   mk([["Phòng vẽ","🖌️"],["Phòng màu sắc","🌈"],["Phòng danh hoạ","🖼️"],["Phòng tạo hình thủ công","✂️"]])
};

// Nhóm THỰC HÀNH KỸ THUẬT (tách riêng khỏi SUBJECTS – không phải môn học)
// Mỗi tag: {id, n, e}. Khi có nội dung, thêm status/live theo cấu trúc hiện có
// và đăng ký mô-đun tương ứng; chưa có nội dung thì bấm sẽ báo "sắp ra mắt".
const PRACTICE_TAGS = [
  {id:"ngoaitroi", n:"THỰC HÀNH NGOÀI TRỜI", e:"🌳"},
  {id:"thucdia",   n:"KHẢO SÁT THỰC ĐỊA",    e:"🧭"},
  {id:"quantrac",  n:"ĐO ĐẠC VÀ QUAN TRẮC",  e:"📏"},
  {id:"thinghiem", n:"THÍ NGHIỆM THỰC HÀNH", e:"🧪"},
  {id:"laprap",    n:"LẮP RÁP MÔ HÌNH",      e:"🧩"},
  {id:"chetao",    n:"CHẾ TẠO SẢN PHẨM",     e:"🛠️"},
  {id:"sinhton",   n:"KỸ NĂNG SINH TỒN",     e:"⛺"},
  {id:"stem",      n:"THỰC HÀNH STEM",       e:"🚀"},
  {id:"trainghiem",n:"HOẠT ĐỘNG TRẢI NGHIỆM",e:"🎒"}
];
