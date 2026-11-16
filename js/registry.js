
function mountStandaloneHazard(root,id){
  const frame=document.createElement("iframe");
  frame.src="simulations/natural-hazards/"+id+"/index.html";
  frame.title="Mô phỏng "+id;
  frame.loading="eager";
  frame.referrerPolicy="strict-origin-when-cross-origin";
  frame.style.cssText="display:block;width:100%;height:calc(100vh - 190px);height:calc(100dvh - 190px);min-height:590px;border:0;border-radius:14px;background:#e9eff2";
  frame.setAttribute("allow","fullscreen");
  root.appendChild(frame);
  return {destroy(){frame.src="about:blank";frame.remove();}};
}

const SIMS = {
  lsdl: [
    {id:"kinh-vi-tuyen", icon:"🌐", title:"Quả Địa Cầu kinh tuyến – vĩ tuyến 3D", type:"TRƯNG BÀY"},
    {id:"toa-do-dia-li", icon:"📍", title:"Xác định tọa độ địa lí", type:"MÔ PHỎNG", mount:(root)=>simGeo01Coordinates(root)},
    {id:"qua-dia-cau-ban-do", icon:"🗺️", title:"Chuyển đổi quả Địa Cầu thành bản đồ", type:"MÔ PHỎNG", mount:(root)=>simGeo02GlobeMap(root)},
    {id:"la-ban-phuong-huong", icon:"🧭", title:"La bàn và phương hướng", type:"MÔ PHỎNG", mount:(root)=>simGeo03Compass(root)},
    {id:"ti-le-ban-do", icon:"📏", title:"Thay đổi tỉ lệ bản đồ", type:"MÔ PHỎNG", mount:(root)=>simGeo04MapScale(root)},
    {id:"do-khoang-cach", icon:"📐", title:"Đo khoảng cách thực tế", type:"MÔ PHỎNG", mount:(root)=>simGeo05Distance(root)},
    {id:"ki-hieu-chu-giai", icon:"🔎", title:"Hệ thống kí hiệu và chú giải bản đồ", type:"TRƯNG BÀY"},
    {id:"tim-duong-ban-do", icon:"🧭", title:"Tìm đường đi trên bản đồ", type:"MÔ PHỎNG", mount:(root)=>simGeoCatalog(root,"tim-duong-ban-do")},
    {id:"ban-do-tri-nho", icon:"🏫", title:"Bản đồ trí nhớ 3D", type:"KHÁM PHÁ ĐỊA PHƯƠNG"},
    {id:"he-mat-troi", icon:"☀️", title:"Hệ Mặt Trời 3D", type:"TRƯNG BÀY"},

    {
  id: "kham-pha-cac-hanh-tinh",
  icon: "🪐",
  title: "Khám phá các hành tinh",
  type: "MÔ PHỎNG",


  mount: (root) => simPlanetExplorer(root)
},
    {id:"traidat-tu-quay-quanh-truc", icon:"🌍", title:"Trái Đất tự quay quanh trục", type:"MÔ PHỎNG", mount:(root)=>simGeoCatalog(root,"traidat-tu-quay-quanh-truc")},
    
    {id:"ngay-va-dem", icon:"🌗", title:"Hiện tượng ngày và đêm", type:"MÔ PHỎNG", mount:(root)=>simGeoCatalog(root,"ngay-va-dem")},
    {id:"mui-gio-the-gioi", icon:"🕒", title:"Hệ thống múi giờ thế giới", type:"MÔ PHỎNG", mount:(root)=>simGeoCatalog(root,"mui-gio-the-gioi")},
    {id:"traidat-quanh-mattroi", icon:"☀️", title:"Trái Đất chuyển động quanh Mặt Trời", type:"MÔ PHỎNG", mount:(root)=>simGeoCatalog(root,"traidat-quanh-mattroi")},
    {id:"bon-mua", icon:"🌸", title:"Sự hình thành bốn mùa", type:"MÔ PHỎNG", mount:(root)=>simGeoCatalog(root,"bon-mua")},
    {id:"ngay-dem-dai-ngan-theo-mua", icon:"🌞", title:"Hiện tượng ngày đêm dài ngắn theo mùa", type:"MÔ PHỎNG", mount:(root)=>simGeoCatalog(root,"ngay-dem-dai-ngan-theo-mua")},
    {id:"la-ban-dien-tu-3d", icon:"🧭", title:"La bàn điện tử 3D", type:"TRƯNG BÀY"},
    {id:"dinh-huong-ngoai-thuc-dia", icon:"🧭", title:"Định hướng ngoài thực địa", type:"MÔ PHỎNG", mount:(root)=>simGeoCatalog(root,"dinh-huong-ngoai-thuc-dia")},
    {id:"cau-tao-ben-trong-trai-dat", icon:"🌎", title:"Cấu tạo bên trong Trái Đất 3D", lesson:"Bài 10. Cấu tạo của Trái Đất. Các mảng kiến tạo", type:"MÔ PHỎNG", mount:simInteriorEarth},
    {id:"chuyen-dong-mang-kien-tao", icon:"🌐", title:"Chuyển động các mảng kiến tạo", type:"MÔ PHỎNG", status:"new", statusAt:"2026-11-12T00:00:00+07:00", mount:simTectonics},
    {id:"hinh-thanh-nui-nen-ep", icon:"⛰️", title:"Mô hình hình thành núi do nén ép", type:"TRƯNG BÀY"},
    {id:"phong-hoa-xam-thuc-boi-tu", icon:"🏞️", title:"Phong hóa, xâm thực và bồi tụ", type:"MÔ PHỎNG", status:"new", statusAt:"2026-11-12T00:00:00+07:00", mount:simRiverProcess},
    {id:"cau-tao-nui-lua-3d", icon:"🌋", title:"Cấu tạo núi lửa 3D", type:"TRƯNG BÀY"},
    {id:"song-dia-chan", icon:"〰️", title:"Sóng địa chấn", type:"MÔ PHỎNG", mount:(root)=>simGeoCatalog(root,"song-dia-chan")},
    {id:"dut-gay-dia-chat", icon:"🪨", title:"Các dạng đứt gãy địa chất", type:"TRƯNG BÀY"},
    {id:"sa-ban-dia-hinh-3d", icon:"🏔️", title:"Sa bàn địa hình 3D", type:"TRƯNG BÀY"},
    {id:"lat-cat-dia-hinh", icon:"📐", title:"Lát cắt địa hình", type:"TRƯNG BÀY"},
    {id:"bo-suu-tap-khoang-san", icon:"💎", title:"Bộ sưu tập khoáng sản", type:"BẢO TÀNG"},
    {id:"dia-hinh-duong-dong-muc", icon:"🗺️", title:"Địa hình 3D và đường đồng mức", type:"MÔ PHỎNG", mount:(root)=>simGeoCatalog(root,"dia-hinh-duong-dong-muc")},
    {id:"luoc-do-lat-cat-dia-hinh", icon:"📊", title:"Chuyển lược đồ thành lát cắt địa hình", type:"MÔ PHỎNG", mount:(root)=>simGeoCatalog(root,"luoc-do-lat-cat-dia-hinh")},
    {id:"cac-tang-khi-quyen-3d", icon:"☁️", title:"Các tầng khí quyển 3D", type:"TRƯNG BÀY"},
    {id:"khi-ap-huong-gio", icon:"💨", title:"Khí áp và hướng gió", type:"MÔ PHỎNG", status:"new", statusAt:"2026-11-12T00:00:00+07:00", mount:simClimateRelief},
    {id:"dung-cu-do-nhiet-do", icon:"🌡️", title:"Bộ dụng cụ đo nhiệt độ không khí", type:"TRƯNG BÀY"},
    {id:"hinh-thanh-may-mua", icon:"🌧️", title:"Quá trình hình thành mây và mưa", type:"MÔ PHỎNG", mount:(root)=>simGeoCatalog(root,"hinh-thanh-may-mua")},
    {id:"ngung-tu-hoi-nuoc", icon:"💧", title:"Thí nghiệm ngưng tụ hơi nước", type:"MÔ PHỎNG", mount:(root)=>simGeoCatalog(root,"ngung-tu-hoi-nuoc")},
    {id:"tram-thoi-tiet-mini", icon:"🌤️", title:"Trạm thời tiết mini", type:"TRƯNG BÀY"},
    {id:"hieu-ung-nha-kinh-bien-doi-khi-hau", icon:"🌡️", title:"Hiệu ứng nhà kính và biến đổi khí hậu", type:"MÔ PHỎNG", mount:(root)=>simGeoCatalog(root,"hieu-ung-nha-kinh-bien-doi-khi-hau")},
    {id:"bieu-do-khi-hau-tuong-tac", icon:"📈", title:"Biểu đồ khí hậu tương tác", type:"MÔ PHỎNG", mount:(root)=>simGeoCatalog(root,"bieu-do-khi-hau-tuong-tac")},
    {id:"vong-tuan-hoan-nuoc", icon:"💧", title:"Vòng tuần hoàn nước tự động", type:"MÔ PHỎNG", status:"new", statusAt:"2026-11-12T00:00:00+07:00", mount:simWaterCycle},
    {id:"luu-vuc-song-3d", icon:"🏞️", title:"Mô hình lưu vực sông 3D", type:"TRƯNG BÀY"},
    {id:"nuoc-ngam-cat-lop", icon:"💦", title:"Mô hình nước ngầm cắt lớp", type:"TRƯNG BÀY"},
    {id:"hinh-thanh-van-dong-bang-ha", icon:"🧊", title:"Quá trình hình thành và vận động của băng hà", type:"MÔ PHỎNG", mount:(root)=>simGeoCatalog(root,"hinh-thanh-van-dong-bang-ha")},
    {id:"day-dai-duong-3d", icon:"🌊", title:"Địa hình đáy đại dương 3D", type:"TRƯNG BÀY"},
    {id:"song-thuy-trieu-dong-bien", icon:"🌊", title:"Sóng biển, thủy triều và dòng biển", type:"MÔ PHỎNG", status:"new", statusAt:"2026-11-12T00:00:00+07:00", mount:simCoastalLandforms},
    {id:"phau-dien-dat-3d", icon:"🟫", title:"Phẫu diện đất 3D", type:"TRƯNG BÀY"},
    {id:"hinh-thanh-thoai-hoa-dat", icon:"🌱", title:"Quá trình hình thành và thoái hóa đất", type:"MÔ PHỎNG", mount:(root)=>simGeoCatalog(root,"hinh-thanh-thoai-hoa-dat")},
    {id:"he-sinh-thai-3d", icon:"🌿", title:"Hệ sinh thái 3D", type:"TRƯNG BÀY"},
    {id:"chuoi-luoi-thuc-an", icon:"🕸️", title:"Chuỗi và lưới thức ăn", type:"MÔ PHỎNG", mount:(root)=>simGeoCatalog(root,"chuoi-luoi-thuc-an")},
    {id:"sa-ban-rung-nhiet-doi-3d", icon:"🌳", title:"Sa bàn rừng nhiệt đới 3D", type:"TRƯNG BÀY"},
    {id:"he-sinh-thai-rung-nhiet-doi", icon:"🌳", title:"Hệ sinh thái rừng nhiệt đới", type:"MÔ PHỎNG", mount:(root)=>simGeoCatalog(root,"he-sinh-thai-rung-nhiet-doi")},
    {id:"ban-do-doi-thien-nhien", icon:"🌍", title:"Bản đồ các đới thiên nhiên trên Trái Đất", type:"BẢN ĐỒ"},
    {id:"canh-quan-theo-vi-do", icon:"🌎", title:"Sự thay đổi cảnh quan theo vĩ độ", type:"MÔ PHỎNG", mount:(root)=>simGeoCatalog(root,"canh-quan-theo-vi-do")},
    {id:"sa-ban-moi-truong-tu-nhien-dia-phuong", icon:"🏞️", title:"Sa bàn môi trường tự nhiên địa phương 3D", type:"KHÁM PHÁ ĐỊA PHƯƠNG"},
    {id:"ban-do-moi-truong-dia-phuong", icon:"📍", title:"Bản đồ tương tác môi trường địa phương", type:"KHÁM PHÁ ĐỊA PHƯƠNG"},
    {id:"qua-dia-cau-mat-do-dan-so", icon:"👥", title:"Quả Địa Cầu mật độ dân số 3D", type:"BẢN ĐỒ"},
    {id:"phan-bo-dan-cu-the-gioi", icon:"👥", title:"Phân bố dân cư thế giới", type:"MÔ PHỎNG", mount:(root)=>simGeoCatalog(root,"phan-bo-dan-cu-the-gioi")},
    {id:"con-nguoi-thien-nhien", icon:"🌱", title:"Mô hình tương tác con người – thiên nhiên", type:"TRƯNG BÀY"},
    {id:"bien-doi-canh-quan-con-nguoi", icon:"🏙️", title:"Biến đổi cảnh quan do hoạt động con người", type:"MÔ PHỎNG", mount:(root)=>simGeoCatalog(root,"bien-doi-canh-quan-con-nguoi")},
    {id:"do-thi-sinh-thai-3d", icon:"🏙️", title:"Mô hình đô thị sinh thái 3D", type:"TRƯNG BÀY"},
    {id:"khai-thac-tai-nguyen-ben-vung", icon:"♻️", title:"Khai thác tài nguyên bền vững", type:"MÔ PHỎNG", mount:(root)=>simGeoCatalog(root,"khai-thac-tai-nguyen-ben-vung")},
    {id:"sa-ban-con-nguoi-thien-nhien-dia-phuong", icon:"🏡", title:"Sa bàn tương tác con người và thiên nhiên địa phương", type:"KHÁM PHÁ ĐỊA PHƯƠNG"},
    {id:"thay-doi-moi-truong-dia-phuong", icon:"🌳", title:"Mô phỏng thay đổi môi trường địa phương", type:"KHÁM PHÁ ĐỊA PHƯƠNG"},

    // Các mô phỏng đã có từ trước, giữ nguyên mô-đun triển khai.
    {id:"dongdat",
  icon:"🏚️",
  title:"Động đất",
  lesson:"Bài 12. Núi lửa và động đất",
  type:"MÔ PHỎNG",

  mount:simQuake},
    {id:"song-than",
  icon:"🌊",
  title:"Mô phỏng sóng thần 3D",
  lesson:"Bài 12. Núi lửa và động đất",
  type:"MÔ PHỎNG",

  status:"new-version", statusAt:"2026-11-12T00:00:00+07:00",
  mount:simTsunami},
    {id:"traidat",
  icon:"🌍",
  img:"assets/img/grade/g6.jpg",
  title:"Trái Đất tự quay",
  lesson:"Bài 7. Chuyển động tự quay quanh trục của Trái Đất và hệ quả",
  type:"MÔ PHỎNG",

  mount:simEarth},
    {id:"nuilua",
  icon:"🌋",
  title:"Núi lửa",
  lesson:"Bài 12. Núi lửa và động đất",
  type:"MÔ PHỎNG",

  status:"new-version", statusAt:"2026-11-12T00:00:00+07:00",
  mount:simVolcano},
    {id:"bao-nhiet-doi",icon:"🌀",title:"Bão nhiệt đới – cấu tạo và quá trình hình thành",type:"MÔ PHỎNG",status:"new",statusAt:"2026-11-13T00:00:00+07:00",mount:(root)=>mountStandaloneHazard(root,"bao-nhiet-doi")},
    {id:"lu-quet",icon:"🌧️",title:"Lũ quét – quá trình hình thành và tác động",type:"MÔ PHỎNG",status:"new",statusAt:"2026-11-13T00:00:00+07:00",mount:(root)=>mountStandaloneHazard(root,"lu-quet")},
    {id:"sat-lo-dat",icon:"⛰️",title:"Sạt lở đất – cơ chế mất ổn định sườn dốc",type:"MÔ PHỎNG",status:"new",statusAt:"2026-11-13T00:00:00+07:00",mount:(root)=>mountStandaloneHazard(root,"sat-lo-dat")},
    {id:"xam-nhap-man",icon:"🌊",title:"Xâm nhập mặn – sự lan truyền nước mặn",type:"MÔ PHỎNG",status:"new",statusAt:"2026-11-13T00:00:00+07:00",mount:(root)=>mountStandaloneHazard(root,"xam-nhap-man")},
    {id:"nuoc-bien-dang",icon:"🏝️",title:"Nước biển dâng – biến đổi đường bờ và ngập ven biển",type:"MÔ PHỎNG",status:"new",statusAt:"2026-11-13T00:00:00+07:00",mount:(root)=>mountStandaloneHazard(root,"nuoc-bien-dang")}
  ]
};

// Các đăng ký chưa có mô-đun mount được hiển thị trạng thái Coming Soon.
SIMS.lsdl.forEach(sim=>{
  if(typeof sim.mount!=="function"&&!sim.status) sim.status="coming-soon";
});
let curSim = null;
