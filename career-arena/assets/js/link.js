const select=document.getElementById('profession'),profile=document.getElementById('profile');
const careerMedia={
"Nhà hải dương học":{image:"https://www.trajektoire.be/metiers/images/oceanographe-oceanologue_20250905_142111.png",source:"https://www.trajektoire.be/metiers/oceanographe-oceanologue"},
"Kỹ sư IoT":{image:"https://static.wixstatic.com/media/11062b_7571544f82ca45c890bdf0114853cd89~mv2.jpg/v1/fill/w_640%2Ch_446%2Cal_c%2Cq_80%2Cusm_0.66_1.00_0.01%2Cenc_avif%2Cquality_auto/11062b_7571544f82ca45c890bdf0114853cd89~mv2.jpg",source:"https://www.sensiedge.com/"},
"Phi công":{image:"https://i.insider.com/5400dda369bedd470518db8d?format=jpeg&width=1200",source:"https://www.businessinsider.com/high-paying-jobs-without-much-desk-time-2014-9"},
"Thiết kế đồ họa":{image:"https://static.wixstatic.com/media/caaff2_79bbf139b4d84a50937b9b2bbf5fbcee~mv2.png/v1/fill/w_980%2Ch_599%2Cal_c%2Cq_90%2Cusm_0.66_1.00_0.01%2Cenc_avif%2Cquality_auto/caaff2_79bbf139b4d84a50937b9b2bbf5fbcee~mv2.png",source:"https://www.safiracopy.com/post/top-15-servi%C3%A7os-oferecidos-por-uma-gr%C3%A1fica-r%C3%A1pida-ou-online-tudo-o-que-sua-empresa-precisa"},
"Đầu bếp":{image:"https://obrprofi.ru/assets/cache_image/blog/blog-povar-hero_960x0_b05.webp",source:"https://obrprofi.ru/blog/professiya-povar.html"},
"Kế toán":{image:"https://cdn.prod.website-files.com/639ff8596ae419fae300b099/6421429a7a8a67bf327fe2d6_accounting%20internship%20in%20australia.jpg",source:"https://www.premiumgraduate.com.au/resources/what-do-companies-look-for-in-an-accounting-intern"},
"Luật sư":{image:"https://lyonsabssolicitors.com/abs/img/about.jpg",source:"https://lyonsabssolicitors.com/abs/about.html"},
"Ngư dân":{image:"https://static.scientificamerican.com/sciam/cache/file/FADFA3D9-061E-4D22-9A8AFCCF88FD6B80_source.jpg?w=1200",source:"https://www.scientificamerican.com/article/activists-open-an-online-window-onto-the-global-fishing-fleet/"},
"Công an":{image:"https://www.lowyinstitute.org/sites/default/files/33353018698_d2b0bcdd53_o.jpg",source:"https://www.lowyinstitute.org/the-interpreter/policing-vietnam-how-australia-could-help"},
"Thợ điện":{image:"https://ecif.pt/sites/default/files/un-electricista-trabajando-0.jpeg",source:"https://ecif.pt/content/product/t-cnico-instalador-eletricista"},
"Bác sĩ":{image:"https://pimwp.s3-accelerate.amazonaws.com/2025/02/Transnational-Student-at-SGU-3-scaled-e1739901566339.jpg",source:"https://www.passionateinmarketing.com/st-georges-university-helping-shape-the-future-of-medical-education-through-transnational-education/"},
"Kỹ sư xây dựng":{image:"https://static.wixstatic.com/media/bba8a8_e51d9e428d42442881ca4b49627c78f9~mv2.jpg/v1/fill/w_980%2Ch_535%2Cal_c%2Cq_85%2Cusm_0.66_1.00_0.01%2Cenc_avif%2Cquality_auto/bba8a8_e51d9e428d42442881ca4b49627c78f9~mv2.jpg",source:"https://www.corestudiobim.com/post/5-mitos-sobre-estudiar-ingenier%C3%ADa-civil"},
"Nhân viên marketing":{image:"https://thynktales.com/images/1775808266.webp",source:"https://thynktales.com/post/understanding-your-target-audience-clearly"},
"Nông dân":{image:"https://www.nycfoodpolicy.org/wp-content/uploads/2023/04/shutterstock_497587918.jpg",source:"https://www.nycfoodpolicy.org/food-policy-snapshot-vietnam-taskforce-on-rice/"},
"Giáo viên":{image:"https://teachbeyond.org/data/FileManager/thumbnails/Files/Article/images/Teacher%20Teaching%20-%20shutterstock_309239084%20-%20RESIZED_1705443602_750x500.jpg",source:"https://teachbeyond.org/article/cultivating-a-culture-of-encouragement-and-trust"},
"Lập trình viên":{image:"https://public.readdy.ai/ai/img_res/589888ada3344022d0ac172572d52315.jpg",source:"https://letsgotocanada.com/"},
"Phi hành gia":{image:"https://storage.liranews.info/articles/November2021/X4Bs2s3OOJWCW9Yq07aA.jpg",source:"https://liranews.info/articles/300"},
"Chuyên gia nghiên cứu núi lửa":{image:"https://research.hawaii.edu/noelo/wp-content/uploads/sites/10/2025/08/PhD-Student-Mahinaokalani-Robbins-taking-measurements-of-Kilauea-eruption-parameters_Feb-2025credit-USGS-scaled.jpg",source:"https://research.hawaii.edu/noelo/tracing-the-roots-of-fire/"},
"Hướng dẫn viên":{image:"https://turcotravel.com/images/destinasyonlar/1422luxury-ephesus-tour-from-kusadasi-cruise-port.webp",source:"https://turcotravel.com/"},
"Nhà khảo cổ học":{image:"https://www.newsinfo.ru/image/preview/article/4/8/1/953481_amp.jpeg",source:"https://www.newsinfo.ru/articles/anglo-saxon-jewellery-8sp/953481/"}
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
 const source=document.getElementById('photoSource');
 source.href=media.source||'#';source.hidden=!media.source;
 profile.classList.remove('hidden');
 GameSound.success();
}
select.onchange=()=>show(select.value);
document.getElementById('draw').onclick=()=>{const i=Math.floor(Math.random()*PROFESSIONS.length);select.value=i;show(i)};
document.getElementById('saveNotes').onclick=()=>{document.getElementById('saved').textContent=document.getElementById('groupNotes').value.trim()?'Đã lưu phiếu thảo luận trong phiên trình duyệt.':'Nhóm hãy nhập nội dung trước khi lưu.';GameSound.success()};
