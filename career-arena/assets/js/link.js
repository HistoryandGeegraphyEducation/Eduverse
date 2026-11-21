const select=document.getElementById('profession'),profile=document.getElementById('profile');
const careerMedia={
"Nhà hải dương học":{image:"../assets/images/lien-ket/LIEN_KET_01 – Nhà hải dương học.jpg"},
"Kỹ sư IoT":{image:"../assets/images/lien-ket/LIEN_KET_02 – Kỹ sư IoT.jpg"},
"Phi công":{image:"../assets/images/lien-ket/LIEN_KET_03 – Phi công.jpg"},
"Thiết kế đồ họa":{image:"../assets/images/lien-ket/LIEN_KET_04 – Nhà thiết kế đồ họa.jpg"},
"Đầu bếp":{image:"../assets/images/lien-ket/LIEN_KET_05 – Đầu bếp.jpg"},
"Kế toán":{image:"../assets/images/lien-ket/LIEN_KET_06 – Kế toán.jpg"},
"Luật sư":{image:"../assets/images/lien-ket/LIEN_KET_07 – Luật sư.jpg"},
"Ngư dân":{image:"../assets/images/lien-ket/LIEN_KET_08 – Ngư dân.jpg"},
"Công an":{image:"../assets/images/lien-ket/LIEN_KET_09 – Cảnh sát.jpg"},
"Thợ điện":{image:"../assets/images/lien-ket/LIEN_KET_10 – Thợ điện.jpg"},
"Bác sĩ":{image:"../assets/images/lien-ket/LIEN_KET_11 – Bác sĩ.jpg"},
"Kỹ sư xây dựng":{image:"../assets/images/lien-ket/LIEN_KET_12 – Kỹ sư xây dựng.jpg"},
"Nhân viên marketing":{image:"../assets/images/lien-ket/LIEN_KET_13 – Nhân viên marketing.jpg"},
"Nông dân":{image:"../assets/images/lien-ket/LIEN_KET_14 – Nông dân.jpg"},
"Giáo viên":{image:"../assets/images/lien-ket/LIEN_KET_15 – Giáo viên.jpg"},
"Lập trình viên":{image:"../assets/images/lien-ket/LIEN_KET_16 – Lập trình viên.jpg"},
"Phi hành gia":{image:"../assets/images/lien-ket/LIEN_KET_17 – Phi hành gia.jpg"},
"Chuyên gia nghiên cứu núi lửa":{image:"../assets/images/lien-ket/LIEN_KET_18 – Nhà nghiên cứu núi lửa.jpg"},
"Hướng dẫn viên":{image:"../assets/images/lien-ket/LIEN_KET_19 – Hướng dẫn viên du lịch.jpg"},
"Nhà khảo cổ học":{image:"../assets/images/lien-ket/LIEN_KET_20 – Nhà khảo cổ học.jpg"}
};
const careerTools={
"Nhà hải dương học":"Tàu nghiên cứu, thiết bị đo nhiệt độ và độ mặn, máy lấy mẫu nước, cảm biến biển, GPS, máy tính và phần mềm phân tích dữ liệu.",
"Kỹ sư IoT":"Cảm biến, vi điều khiển, bo mạch điện tử, máy tính, đồng hồ vạn năng, máy hiện sóng, bộ định tuyến và phần mềm lập trình.",
"Phi công":"Máy bay, hệ thống điều khiển buồng lái, thiết bị định vị – dẫn đường, vô tuyến liên lạc, bản đồ hàng không và thiết bị mô phỏng bay.",
"Thiết kế đồ họa":"Máy tính, bảng vẽ điện tử, màn hình đồ họa, máy ảnh, phần mềm thiết kế và thiết bị in thử.",
"Đầu bếp":"Dao, thớt, nồi, chảo, bếp, lò nướng, tủ lạnh, máy xay, nhiệt kế thực phẩm và dụng cụ bảo hộ.",
"Kế toán":"Máy tính, máy tính cầm tay, phần mềm kế toán, bảng tính, chứng từ và hệ thống lưu trữ dữ liệu.",
"Luật sư":"Bộ luật và văn bản pháp luật, hồ sơ vụ việc, máy tính, cơ sở dữ liệu pháp lý và công cụ soạn thảo văn bản.",
"Ngư dân":"Tàu hoặc thuyền, lưới và ngư cụ, máy định vị, thiết bị liên lạc, áo phao và dụng cụ bảo quản thủy sản.",
"Công an":"Phương tiện công vụ, thiết bị liên lạc, máy tính, phương tiện ghi nhận thông tin và trang bị bảo hộ theo nhiệm vụ.",
"Thợ điện":"Kìm cách điện, tua vít cách điện, đồng hồ vạn năng, bút thử điện, thiết bị đo và phương tiện bảo hộ.",
"Bác sĩ":"Ống nghe, máy đo huyết áp, nhiệt kế, thiết bị chẩn đoán, hồ sơ bệnh án và phương tiện bảo hộ y tế.",
"Kỹ sư xây dựng":"Bản vẽ kỹ thuật, máy tính, phần mềm thiết kế, thiết bị đo đạc, dụng cụ kiểm tra vật liệu và trang bị bảo hộ công trường.",
"Nhân viên marketing":"Máy tính, phần mềm thiết kế và phân tích dữ liệu, công cụ quản lý nội dung, nền tảng quảng cáo và thiết bị ghi hình.",
"Nông dân":"Cuốc, xẻng, máy làm đất, hệ thống tưới, dụng cụ thu hoạch, thiết bị theo dõi thời tiết và phương tiện bảo hộ.",
"Giáo viên":"Sách giáo khoa, giáo án, bảng, máy tính, máy chiếu, học liệu số và thiết bị dạy học.",
"Lập trình viên":"Máy tính, phần mềm soạn thảo mã, trình biên dịch, hệ thống quản lý phiên bản, công cụ kiểm thử và tài liệu kỹ thuật.",
"Phi hành gia":"Bộ đồ du hành vũ trụ, hệ thống hỗ trợ sự sống, thiết bị liên lạc, bảng điều khiển, dụng cụ thí nghiệm và thiết bị mô phỏng.",
"Chuyên gia nghiên cứu núi lửa":"Thiết bị đo địa chấn, máy đo khí, camera nhiệt, GPS, dụng cụ lấy mẫu đá và thiết bị bảo hộ chuyên dụng.",
"Hướng dẫn viên":"Micro, loa, bản đồ, thiết bị định vị, điện thoại, tài liệu thuyết minh và phương tiện liên lạc.",
"Nhà khảo cổ học":"Bản đồ khảo sát, GPS, máy ảnh, thước đo, bay và chổi khai quật, túi đựng mẫu, sổ ghi chép và thiết bị phân tích."
};
const careerConditions={
"Nhà hải dương học":"Làm việc tại phòng thí nghiệm, trung tâm nghiên cứu hoặc trên tàu ngoài biển; có đợt khảo sát dài ngày và phải tuân thủ quy định an toàn hàng hải.",
"Kỹ sư IoT":"Làm tại văn phòng kỹ thuật, phòng thí nghiệm, cơ sở sản xuất hoặc địa điểm lắp đặt; kết hợp thiết kế trên máy tính với thử nghiệm thiết bị.",
"Phi công":"Làm việc trong buồng lái và tại sân bay; lịch bay theo ca, có thể bay đêm, lưu trú xa nhà và phải đáp ứng tiêu chuẩn sức khỏe, huấn luyện.",
"Thiết kế đồ họa":"Thường làm tại văn phòng, studio hoặc làm việc từ xa; sử dụng máy tính nhiều và phối hợp với khách hàng, nhóm truyền thông.",
"Đầu bếp":"Làm tại bếp nhà hàng, khách sạn hoặc bếp ăn; môi trường nóng, đứng lâu và làm theo ca, kể cả cuối tuần hoặc ngày lễ.",
"Kế toán":"Chủ yếu làm tại văn phòng hoặc bộ phận tài chính; thường làm việc với chứng từ, dữ liệu và thời hạn báo cáo.",
"Luật sư":"Làm tại văn phòng luật, doanh nghiệp, cơ quan hoặc tham gia hoạt động tố tụng; cần bảo mật hồ sơ và có thể di chuyển để gặp khách hàng, tham dự phiên tòa.",
"Ngư dân":"Làm trên tàu thuyền, vùng nuôi trồng hoặc ven biển; phụ thuộc thời tiết, mùa vụ và yêu cầu nghiêm ngặt về an toàn trên nước.",
"Công an":"Làm tại đơn vị công tác hoặc địa bàn được phân công; có thể trực, làm việc theo ca và thực hiện nhiệm vụ ngoài giờ.",
"Thợ điện":"Làm tại công trình, nhà ở, nhà máy hoặc cơ sở bảo trì; có thể làm trên cao, trong không gian hẹp và phải tuân thủ quy trình an toàn điện.",
"Bác sĩ":"Làm tại bệnh viện, phòng khám hoặc cơ sở y tế; có thể trực đêm, tiếp xúc người bệnh và tuân thủ quy trình kiểm soát nhiễm khuẩn.",
"Kỹ sư xây dựng":"Làm tại văn phòng thiết kế và công trường; thường di chuyển giữa các địa điểm, chịu ảnh hưởng của thời tiết và quy định an toàn lao động.",
"Nhân viên marketing":"Làm tại doanh nghiệp, công ty truyền thông hoặc từ xa; phối hợp nhiều bộ phận, có thời hạn triển khai chiến dịch.",
"Nông dân":"Làm tại đồng ruộng, trang trại hoặc nhà kính; hoạt động ngoài trời, phụ thuộc mùa vụ và điều kiện thời tiết.",
"Giáo viên":"Làm tại trường học hoặc cơ sở giáo dục; giảng dạy theo thời khóa biểu, chuẩn bị bài và phối hợp với học sinh, phụ huynh.",
"Lập trình viên":"Thường làm tại văn phòng hoặc từ xa; sử dụng máy tính trong thời gian dài, làm việc theo nhóm và theo tiến độ dự án.",
"Phi hành gia":"Huấn luyện tại trung tâm chuyên môn và thực hiện nhiệm vụ trong môi trường không gian có kiểm soát; yêu cầu tuyển chọn, sức khỏe và kỷ luật nghiêm ngặt.",
"Chuyên gia nghiên cứu núi lửa":"Làm tại viện nghiên cứu, phòng thí nghiệm và khu vực thực địa; một số điểm khảo sát có địa hình khó, khí độc hoặc nguy cơ phun trào.",
"Hướng dẫn viên":"Làm việc tại điểm du lịch, trên phương tiện di chuyển và ngoài trời; lịch trình linh hoạt, thường phải đi lại và làm vào ngày nghỉ.",
"Nhà khảo cổ học":"Làm tại viện nghiên cứu, bảo tàng, phòng thí nghiệm và khu khai quật; công việc thực địa có thể kéo dài và chịu ảnh hưởng thời tiết."
};
PROFESSIONS.forEach((p,i)=>select.add(new Option(p.name,i)));
function show(i){
 if(i==='')return;
 const p=PROFESSIONS[+i],media=careerMedia[p.name]||{};
 document.getElementById('pname').textContent=p.name;
 const sections=[
  ['Công việc',p.work],
  ['Công cụ – thiết bị',careerTools[p.name]||'Tùy lĩnh vực và vị trí công tác.'],
  ['Năng lực – phẩm chất',p.skills],
  ['Điều kiện làm việc',careerConditions[p.name]||'Tùy đơn vị công tác và nhiệm vụ được phân công.'],
  ['Thách thức nghề nghiệp',p.challenges]
 ];
 document.getElementById('details').innerHTML=sections.map(([h,t],n)=>'<article class="detail"><span class="detail-index">0'+(n+1)+'</span><h3>'+h+'</h3><p>'+t+'</p></article>').join('');
 const photo=document.getElementById('professionPhoto');
 photo.innerHTML=media.image?'<img src="'+media.image+'" alt="Hình ảnh nghề '+p.name+'" loading="lazy" referrerpolicy="no-referrer" onerror="this.closest(\'.profile-photo\').classList.add(\'image-error\')">':'';
 profile.classList.remove('hidden');
 GameSound.success();
}
select.onchange=()=>show(select.value);
document.getElementById('draw').onclick=()=>{const i=Math.floor(Math.random()*PROFESSIONS.length);select.value=i;show(i)};
document.getElementById('saveNotes').onclick=()=>{document.getElementById('saved').textContent=document.getElementById('groupNotes').value.trim()?'Đã lưu phiếu thảo luận trong phiên trình duyệt.':'Nhóm hãy nhập nội dung trước khi lưu.';GameSound.success()};
