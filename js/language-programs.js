// ===== CHƯƠNG TRÌNH HỌC THEO NGÔN NGỮ =====
const LANGUAGE_PROGRAMS = [
  {
    id:"en",name:"TIẾNG ANH",nativeName:"English",flag:"🇬🇧",
    skills:[
      {icon:"📚",name:"TỪ VỰNG",topics:["Bản thân và gia đình","Nhà ở và đời sống hằng ngày","Trường học và giáo dục","Công việc và nghề nghiệp","Đồ ăn và sức khỏe","Du lịch và giao thông","Môi trường và khí hậu","Khoa học và công nghệ","Văn hóa và xã hội","Thành ngữ và cụm động từ"]},
      {icon:"🧩",name:"NGỮ PHÁP",topics:["Danh từ, mạo từ và từ hạn định","Đại từ và tính từ","Các thì hiện tại","Các thì quá khứ","Các thì tương lai","Động từ khuyết thiếu","Câu bị động","Câu điều kiện","Mệnh đề quan hệ","Câu tường thuật","So sánh và liên từ"]},
      {icon:"📕",name:"TỪ ĐIỂN",topics:["Tra từ Anh–Việt và Việt–Anh","Phiên âm IPA","Từ loại và biến thể từ","Nghĩa theo ngữ cảnh","Ví dụ và kết hợp từ","Từ đồng nghĩa và trái nghĩa"]},
      {icon:"🎧",name:"NGHE",topics:["Nhận diện âm và từ","Hội thoại đời sống","Thông báo và chỉ dẫn","Độc thoại và phỏng vấn","Bài nghe học thuật","Nghe ý chính và chi tiết"]},
      {icon:"🎙️",name:"NÓI",topics:["Giới thiệu bản thân","Hỏi và trả lời thông tin","Mô tả người và sự vật","Kể chuyện và trải nghiệm","Trình bày quan điểm","Thảo luận và phản biện"]},
      {icon:"📖",name:"ĐỌC",topics:["Đọc câu và đoạn ngắn","Thư và tin nhắn","Văn bản thông tin","Bài báo phổ thông","Văn bản học thuật","Đọc tìm ý chính và suy luận"]},
      {icon:"✍️",name:"VIẾT",topics:["Viết câu đúng cấu trúc","Đoạn văn mô tả","Thư và email","Kể lại trải nghiệm","Bài luận nêu quan điểm","Tóm tắt và lập luận"]},
      {icon:"💬",name:"HỘI THOẠI",topics:["Chào hỏi và làm quen","Mua sắm và dịch vụ","Ăn uống và đặt chỗ","Hỏi đường và đi lại","Học tập và công việc","Tình huống giao tiếp xã hội"]},
      {icon:"🔊",name:"PHÁT ÂM",topics:["Bảng phiên âm IPA","Nguyên âm và phụ âm","Âm cuối và cụm phụ âm","Trọng âm từ","Trọng âm câu","Nối âm, dạng yếu và ngữ điệu"]}
    ],
    rooms:["PHÒNG HỌC","PHÒNG TỰ HỌC","PHÒNG LUYỆN NGHE","PHÒNG LUYỆN NÓI","PHÒNG ĐỌC","PHÒNG LUYỆN VIẾT","PHÒNG NGỮ PHÁP","PHÒNG TỪ VỰNG","PHÒNG TỪ ĐIỂN","ÔN THI CHỨNG CHỈ","KIỂM TRA","ĐÁNH GIÁ","AI TUTOR","VIDEO STUDIO","THƯ VIỆN HỌC LIỆU"],
    features:["AI TUTOR","GIỌNG NÓI","ĐÁNH GIÁ","VIDEO STUDIO","THƯ VIỆN HỌC LIỆU"],
    tracks:[{id:"general",name:"LỘ TRÌNH A1–C1",stages:["A1","A2","B1","B2","C1"]}],
    certificates:[
      {id:"ielts",name:"IELTS",short:"IELTS",stages:["LISTENING","READING","WRITING","SPEAKING"]},
      {id:"vstep",name:"VSTEP",short:"VSTEP",stages:["NGHE","ĐỌC","VIẾT","NÓI"]},
      {id:"toeic",name:"TOEIC",short:"TOEIC",stages:["LISTENING","READING"]},
      {id:"aptis",name:"APTIS",short:"APTIS",stages:["GRAMMAR & VOCABULARY","LISTENING","READING","SPEAKING","WRITING"]}
    ]
  },
  {
    id:"fr",name:"TIẾNG PHÁP",nativeName:"Français",flag:"🇫🇷",
    skills:[
      {icon:"📚",name:"TỪ VỰNG",topics:["Identité et famille – Bản thân và gia đình","Vie quotidienne – Đời sống hằng ngày","École et travail – Học tập và công việc","Alimentation et santé – Ăn uống và sức khỏe","Voyages et transports – Du lịch và giao thông","Culture et société – Văn hóa và xã hội","Environnement – Môi trường","Expressions idiomatiques – Thành ngữ"]},
      {icon:"🧩",name:"NGỮ PHÁP",topics:["Giống và số của danh từ","Mạo từ xác định, không xác định và bộ phận","Đại từ chủ ngữ và bổ ngữ","Chia động từ nhóm -er, -ir, -re","Présent, passé composé và imparfait","Futur proche và futur simple","Phủ định và nghi vấn","Tính từ và trạng từ","Đại từ quan hệ","Subjonctif và câu điều kiện"]},
      {icon:"📕",name:"TỪ ĐIỂN",topics:["Tra Pháp–Việt và Việt–Pháp","Giống danh từ và dạng số nhiều","Phiên âm và phát âm","Chia động từ","Nghĩa và ví dụ theo ngữ cảnh","Cụm từ cố định"]},
      {icon:"🎧",name:"NGHE",topics:["Phân biệt âm tiếng Pháp","Hội thoại chậm trình độ A1–A2","Thông báo công cộng","Hội thoại tự nhiên B1–B2","Phỏng vấn và bản tin","Nghe ý chính và chi tiết"]},
      {icon:"🎙️",name:"NÓI",topics:["Se présenter – Giới thiệu bản thân","Poser des questions – Đặt câu hỏi","Décrire – Miêu tả","Raconter – Kể chuyện","Exprimer son opinion – Nêu ý kiến","Débattre – Thảo luận"]},
      {icon:"📖",name:"ĐỌC",topics:["Thông báo và biển chỉ dẫn","Tin nhắn và thư cá nhân","Văn bản đời sống","Bài báo ngắn","Văn bản lập luận","Đọc hiểu theo dạng DELF"]},
      {icon:"✍️",name:"VIẾT",topics:["Viết câu cơ bản","Điền biểu mẫu","Tin nhắn và thư ngắn","Thư trang trọng","Kể lại sự kiện","Bài trình bày quan điểm"]},
      {icon:"💬",name:"HỘI THOẠI",topics:["Saluer et faire connaissance – Chào hỏi","Au café et au restaurant – Ăn uống","Faire des achats – Mua sắm","Demander son chemin – Hỏi đường","À l’école et au travail – Học tập, công việc","Voyager – Du lịch"]},
      {icon:"🔊",name:"PHÁT ÂM",topics:["Bảng chữ cái và tên chữ","Nguyên âm miệng và nguyên âm mũi","Phụ âm và bán nguyên âm","Liaison và enchaînement","Âm câm và âm cuối","Ngữ điệu câu"]}
    ],
    rooms:["PHÒNG HỌC","PHÒNG TỰ HỌC","PHÒNG LUYỆN NGHE","PHÒNG LUYỆN NÓI","PHÒNG ĐỌC","PHÒNG LUYỆN VIẾT","PHÒNG NGỮ PHÁP","PHÒNG TỪ VỰNG","PHÒNG TỪ ĐIỂN","ÔN THI CHỨNG CHỈ","KIỂM TRA","ĐÁNH GIÁ","AI TUTOR","VIDEO STUDIO","THƯ VIỆN HỌC LIỆU"],
    features:["AI TUTOR","GIỌNG NÓI","ĐÁNH GIÁ","VIDEO STUDIO","THƯ VIỆN HỌC LIỆU"],
    tracks:[{id:"foundation",name:"LỘ TRÌNH A1–B2",stages:["A1","A2","B1","B2"]}],
    certificates:[{id:"delf",name:"DELF",short:"DELF",stages:["A1","A2","B1","B2"]}]
  },
  {
    id:"de",name:"TIẾNG ĐỨC",nativeName:"Deutsch",flag:"🇩🇪",
    skills:[
      {icon:"📚",name:"TỪ VỰNG",topics:["Person und Familie – Bản thân và gia đình","Wohnen – Nhà ở","Alltag und Freizeit – Sinh hoạt và giải trí","Schule und Beruf – Trường học và nghề nghiệp","Essen und Gesundheit – Ăn uống và sức khỏe","Reisen und Verkehr – Du lịch và giao thông","Natur und Umwelt – Tự nhiên và môi trường","Kultur und Gesellschaft – Văn hóa và xã hội"]},
      {icon:"🧩",name:"NGỮ PHÁP",topics:["Danh từ, giống và số","Quán từ xác định và không xác định","Nominativ, Akkusativ, Dativ, Genitiv","Đại từ nhân xưng và sở hữu","Chia động từ hiện tại","Động từ tách và không tách","Perfekt, Präteritum và Plusquamperfekt","Động từ khuyết thiếu","Mệnh đề phụ và trật tự từ","Konjunktiv II và câu bị động"]},
      {icon:"📕",name:"TỪ ĐIỂN",topics:["Tra Đức–Việt và Việt–Đức","Giống danh từ và dạng số nhiều","Phiên âm và trọng âm","Chia động từ bất quy tắc","Nghĩa theo ngữ cảnh","Cụm động từ đi với giới từ"]},
      {icon:"🎧",name:"NGHE",topics:["Nhận diện âm tiếng Đức","Hội thoại trình độ A1–A2","Thông báo và chỉ dẫn","Hội thoại đời sống B1–B2","Phỏng vấn và bản tin","Nghe ý chính và chi tiết"]},
      {icon:"🎙️",name:"NÓI",topics:["Sich vorstellen – Giới thiệu","Fragen stellen – Đặt câu hỏi","Beschreiben – Miêu tả","Erzählen – Kể chuyện","Meinung äußern – Nêu quan điểm","Diskutieren – Thảo luận"]},
      {icon:"📖",name:"ĐỌC",topics:["Biển báo và thông báo","Email và thư cá nhân","Văn bản đời sống","Bài báo ngắn","Văn bản thông tin","Đọc hiểu theo dạng Goethe"]},
      {icon:"✍️",name:"VIẾT",topics:["Viết câu và đoạn cơ bản","Điền biểu mẫu","Email thân mật","Email trang trọng","Kể lại trải nghiệm","Trình bày quan điểm"]},
      {icon:"💬",name:"HỘI THOẠI",topics:["Begrüßung – Chào hỏi","Einkaufen – Mua sắm","Im Restaurant – Nhà hàng","Nach dem Weg fragen – Hỏi đường","Arbeit und Studium – Công việc và học tập","Reisen – Du lịch"]},
      {icon:"🔊",name:"PHÁT ÂM",topics:["Bảng chữ cái và tên chữ","Nguyên âm dài và ngắn","Umlaut ä, ö, ü","Phụ âm ch, sch, sp, st","Trọng âm từ và từ ghép","Ngữ điệu câu"]}
    ],
    rooms:["PHÒNG HỌC","PHÒNG TỰ HỌC","PHÒNG LUYỆN NGHE","PHÒNG LUYỆN NÓI","PHÒNG ĐỌC","PHÒNG LUYỆN VIẾT","PHÒNG NGỮ PHÁP","PHÒNG TỪ VỰNG","PHÒNG TỪ ĐIỂN","ÔN THI CHỨNG CHỈ","KIỂM TRA","ĐÁNH GIÁ","AI TUTOR","VIDEO STUDIO","THƯ VIỆN HỌC LIỆU"],
    features:["AI TUTOR","GIỌNG NÓI","ĐÁNH GIÁ","VIDEO STUDIO","THƯ VIỆN HỌC LIỆU"],
    tracks:[{id:"foundation",name:"LỘ TRÌNH A1–C1",stages:["A1","A2","B1","B2","C1"]}],
    certificates:[{id:"goethe",name:"GOETHE-ZERTIFIKAT",short:"GOETHE",stages:["A1","A2","B1","B2","C1","C2"]}]
  },
  {
    id:"zh",name:"TIẾNG TRUNG",nativeName:"中文",flag:"🇨🇳",
    skills:[
      {icon:"📚",name:"TỪ VỰNG",topics:["Chào hỏi và giới thiệu","Gia đình và quan hệ","Số đếm, ngày tháng và thời gian","Trường học và công việc","Ăn uống và mua sắm","Giao thông và du lịch","Sức khỏe và đời sống","Văn hóa và xã hội"]},
      {icon:"🧩",name:"NGỮ PHÁP",topics:["Trật tự từ trong câu","Câu vị ngữ tính từ"," 是 và 有"," 的, 得 và 地","Trợ từ 了, 过, 着","Câu hỏi với 吗 và từ nghi vấn","Giới từ và giới từ kết cấu","Bổ ngữ kết quả, khả năng, xu hướng","Câu 把 và 被","Liên từ và câu phức"]},
      {icon:"📕",name:"TỪ ĐIỂN",topics:["Tra Trung–Việt và Việt–Trung","Tra chữ Hán giản thể và phồn thể","Pinyin và thanh điệu","Bộ thủ và cấu tạo chữ","Nghĩa và từ ghép","Ví dụ theo ngữ cảnh"]},
      {icon:"🎧",name:"NGHE",topics:["Nhận diện bốn thanh điệu","Từ và câu ngắn","Hội thoại theo chủ đề","Thông báo và chỉ dẫn","Hội thoại tốc độ tự nhiên","Nghe hiểu theo cấp độ HSK"]},
      {icon:"🎙️",name:"NÓI",topics:["Phát âm âm đầu và vận mẫu","Luyện thanh điệu","Giới thiệu và hỏi đáp","Miêu tả và kể chuyện","Trình bày ý kiến","Phản xạ hội thoại"]},
      {icon:"📖",name:"ĐỌC",topics:["Nhận diện chữ Hán cơ bản","Câu và đoạn ngắn có Pinyin","Đoạn văn theo chủ đề","Thông báo và thư từ","Văn bản thông tin","Đọc hiểu theo cấp độ HSK"]},
      {icon:"✍️",name:"VIẾT",topics:["Thứ tự nét cơ bản","Viết chữ theo bộ thủ","Viết từ và câu","Sắp xếp từ thành câu","Viết đoạn theo chủ đề","Viết bài trình bày ý kiến"]},
      {icon:"🀄",name:"CHỮ HÁN",topics:["Tám nét cơ bản","Quy tắc thứ tự nét","Bộ thủ thường gặp","Cấu tạo chữ tượng hình và hình thanh","Chữ giản thể và phồn thể","Tra cứu và ghi nhớ chữ"]},
      {icon:"拼",name:"PINYIN",topics:["Thanh mẫu","Vận mẫu đơn và kép","Bốn thanh điệu và thanh nhẹ","Quy tắc biến điệu","Âm tiết và ghép âm","Luyện đọc Pinyin"]}
    ],
    rooms:["PHÒNG HỌC","PHÒNG TỰ HỌC","PHÒNG LUYỆN NGHE","PHÒNG LUYỆN NÓI","PHÒNG ĐỌC","PHÒNG LUYỆN VIẾT","PHÒNG NGỮ PHÁP","PHÒNG TỪ VỰNG","PHÒNG TỪ ĐIỂN","CHỮ HÁN","PINYIN","ÔN THI CHỨNG CHỈ","KIỂM TRA","ĐÁNH GIÁ","AI TUTOR","VIDEO STUDIO","THƯ VIỆN HỌC LIỆU"],
    features:["AI TUTOR","GIỌNG NÓI","ĐÁNH GIÁ","VIDEO STUDIO","THƯ VIỆN HỌC LIỆU"],
    tracks:[{id:"foundation",name:"LỘ TRÌNH HSK 1–6",stages:["HSK 1","HSK 2","HSK 3","HSK 4","HSK 5","HSK 6"]}],
    certificates:[{id:"hsk",name:"HSK",short:"HSK",stages:["HSK 1","HSK 2","HSK 3","HSK 4","HSK 5","HSK 6"]}]
  },
  {
    id:"es",name:"TIẾNG TÂY BAN NHA",nativeName:"Español",flag:"🇪🇸",
    skills:[
      {icon:"📚",name:"TỪ VỰNG",topics:["Identidad y familia – Bản thân và gia đình","Vida cotidiana – Sinh hoạt hằng ngày","Estudios y trabajo – Học tập và công việc","Comida y salud – Ăn uống và sức khỏe","Viajes y transporte – Du lịch và giao thông","Cultura y sociedad – Văn hóa và xã hội","Naturaleza y medio ambiente – Tự nhiên và môi trường"]},
      {icon:"🧩",name:"NGỮ PHÁP",topics:["Giống và số của danh từ","Mạo từ xác định và không xác định","Đại từ nhân xưng và sở hữu","Ser, estar và hay","Chia động từ hiện tại","Pretérito perfecto và indefinido","Imperfecto và futuro","Đại từ bổ ngữ","Subjuntivo","Câu điều kiện và câu bị động"]},
      {icon:"📕",name:"TỪ ĐIỂN",topics:["Tra Tây Ban Nha–Việt và Việt–Tây Ban Nha","Giống danh từ và dạng số nhiều","Phiên âm và trọng âm","Chia động từ","Nghĩa theo ngữ cảnh","Cụm từ thông dụng"]},
      {icon:"🎧",name:"NGHE",topics:["Nhận diện âm tiếng Tây Ban Nha","Hội thoại cơ bản","Thông báo và chỉ dẫn","Hội thoại đời sống","Phỏng vấn và bản tin","Nghe hiểu theo cấp độ DELE"]},
      {icon:"🎙️",name:"NÓI",topics:["Presentarse – Giới thiệu","Hacer preguntas – Đặt câu hỏi","Describir – Miêu tả","Contar experiencias – Kể trải nghiệm","Dar opiniones – Nêu ý kiến","Conversar – Hội thoại"]},
      {icon:"📖",name:"ĐỌC",topics:["Biển báo và thông báo","Tin nhắn và thư","Văn bản đời sống","Bài báo ngắn","Văn bản thông tin","Đọc hiểu theo dạng DELE"]},
      {icon:"✍️",name:"VIẾT",topics:["Viết câu cơ bản","Điền biểu mẫu","Tin nhắn và thư cá nhân","Email trang trọng","Kể lại trải nghiệm","Bài luận nêu quan điểm"]},
      {icon:"💬",name:"HỘI THOẠI",topics:["Saludos – Chào hỏi","En el restaurante – Nhà hàng","De compras – Mua sắm","Pedir indicaciones – Hỏi đường","Estudios y trabajo – Học tập, công việc","Viajar – Du lịch"]},
      {icon:"🔊",name:"PHÁT ÂM",topics:["Bảng chữ cái","Nguyên âm","Phụ âm b, v, c, z, j, g","Âm rung r và rr","Trọng âm và dấu nhấn","Ngữ điệu câu"]}
    ],
    rooms:["PHÒNG HỌC","PHÒNG TỰ HỌC","PHÒNG LUYỆN NGHE","PHÒNG LUYỆN NÓI","PHÒNG ĐỌC","PHÒNG LUYỆN VIẾT","PHÒNG NGỮ PHÁP","PHÒNG TỪ VỰNG","PHÒNG TỪ ĐIỂN","ÔN THI CHỨNG CHỈ","KIỂM TRA","ĐÁNH GIÁ","AI TUTOR","VIDEO STUDIO","THƯ VIỆN HỌC LIỆU"],
    features:["AI TUTOR","GIỌNG NÓI","ĐÁNH GIÁ","VIDEO STUDIO","THƯ VIỆN HỌC LIỆU"],
    tracks:[{id:"foundation",name:"LỘ TRÌNH A1–C2",stages:["A1","A2","B1","B2","C1","C2"]}],
    certificates:[{id:"dele",name:"DELE",short:"DELE",stages:["A1","A2","B1","B2","C1","C2"]}]
  },
  {
    id:"ru",name:"TIẾNG NGA",nativeName:"Русский",flag:"🇷🇺",
    skills:[
      {icon:"📚",name:"TỪ VỰNG",topics:["Знакомство – Làm quen và giới thiệu","Семья – Gia đình","Дом и быт – Nhà ở và sinh hoạt","Учёба и работа – Học tập và công việc","Еда и здоровье – Ăn uống và sức khỏe","Город и транспорт – Thành phố và giao thông","Путешествия – Du lịch","Культура и общество – Văn hóa và xã hội"]},
      {icon:"🧩",name:"NGỮ PHÁP",topics:["Giống và số của danh từ","Sáu cách danh từ","Đại từ nhân xưng và sở hữu","Chia động từ hiện tại","Động từ chuyển động","Thể hoàn thành và chưa hoàn thành","Thì quá khứ và tương lai","Tính từ và trạng từ","Câu phức và liên từ"]},
      {icon:"📕",name:"TỪ ĐIỂN",topics:["Tra Nga–Việt và Việt–Nga","Trọng âm từ","Biến cách danh từ","Thể và cách dùng động từ","Nghĩa theo ngữ cảnh","Cụm từ cố định"]},
      {icon:"🎧",name:"NGHE",topics:["Nhận diện âm tiếng Nga","Từ và câu ngắn","Hội thoại cơ bản","Thông báo và chỉ dẫn","Hội thoại tự nhiên","Nghe hiểu theo chủ đề"]},
      {icon:"🎙️",name:"NÓI",topics:["Giới thiệu bản thân","Hỏi đáp thông tin","Miêu tả người và địa điểm","Kể lại sự việc","Trình bày ý kiến","Hội thoại theo tình huống"]},
      {icon:"📖",name:"ĐỌC",topics:["Bảng chữ cái và âm","Từ và câu đơn","Đoạn văn ngắn","Thư và thông báo","Văn bản thông tin","Đọc hiểu theo chủ đề"]},
      {icon:"✍️",name:"VIẾT",topics:["Viết chữ Cyrillic","Chính tả và dấu mềm, dấu cứng","Viết câu đơn","Thư và tin nhắn","Kể lại sự kiện","Đoạn văn nêu quan điểm"]},
      {icon:"АБ",name:"BẢNG CHỮ CÁI CYRILLIC",topics:["33 chữ cái Cyrillic","Chữ in và chữ viết","Nguyên âm và phụ âm","Âm hữu thanh và vô thanh","Dấu mềm ь và dấu cứng ъ","Đọc ghép âm và từ"]},
      {icon:"🔊",name:"PHÁT ÂM",topics:["Nguyên âm và độ giảm âm","Phụ âm cứng và mềm","Hữu thanh và vô thanh","Trọng âm từ","Nối âm trong lời nói","Ngữ điệu câu"]}
    ],
    rooms:["PHÒNG HỌC","PHÒNG TỰ HỌC","PHÒNG LUYỆN NGHE","PHÒNG LUYỆN NÓI","PHÒNG ĐỌC","PHÒNG LUYỆN VIẾT","PHÒNG NGỮ PHÁP","PHÒNG TỪ VỰNG","PHÒNG TỪ ĐIỂN","BẢNG CHỮ CÁI","ÔN TẬP","KIỂM TRA","ĐÁNH GIÁ","AI TUTOR","VIDEO STUDIO","THƯ VIỆN HỌC LIỆU"],
    features:["AI TUTOR","GIỌNG NÓI","ĐÁNH GIÁ","VIDEO STUDIO","THƯ VIỆN HỌC LIỆU"],
    tracks:[{id:"foundation",name:"LỘ TRÌNH NỀN TẢNG",stages:["BẢNG CHỮ CÁI","A1","A2","B1","B2"]}],
    certificates:[]
  },
  {
    id:"vi",name:"TIẾNG VIỆT",nativeName:"Tiếng Việt",flag:"🇻🇳",
    skills:[
      {icon:"📚",name:"TIẾNG VIỆT HIỆN ĐẠI",topics:["Lịch sử hình thành và phát triển tiếng Việt","Hệ thống chữ Quốc ngữ","Từ ngữ trong giao tiếp hiện đại","Biến thể vùng miền và phong cách ngôn ngữ","Tiếng Việt trong môi trường số"]},
      {icon:"漢",name:"HÁN VIỆT",topics:["Nguồn gốc và quá trình tiếp nhận","Âm Hán Việt và quy luật đọc","Yếu tố Hán Việt thường gặp","Từ ghép Hán Việt","Phân biệt từ Hán Việt và từ thuần Việt","Tra cứu và giải nghĩa từ Hán Việt"]},
      {icon:"𡨸",name:"CHỮ NÔM",topics:["Sự hình thành và lịch sử chữ Nôm","Cấu tạo chữ Nôm","Các bộ phận biểu âm và biểu ý","Đọc chữ Nôm trong văn bản","Phương pháp tra cứu chữ Nôm","Thực hành phiên âm văn bản"]},
      {icon:"文",name:"HÁN TỰ",topics:["Bộ thủ và nét cơ bản","Lục thư và cấu tạo chữ","Âm đọc và nghĩa chữ","Chữ Hán trong văn bản Việt Nam","Tra cứu từ điển Hán tự","Đối chiếu chữ Hán và chữ Nôm"]},
      {icon:"📜",name:"VĂN HỌC",topics:["Văn học dân gian","Văn học trung đại","Văn học cận đại","Văn học hiện đại","Thể loại và thi pháp","Tác giả, tác phẩm và bối cảnh"]},
      {icon:"📖",name:"VĂN BẢN CỔ",topics:["Văn bản Hán Nôm","Văn bản chữ Quốc ngữ giai đoạn đầu","Niên đại và văn cảnh","Phiên âm và phiên dịch","Chú giải từ ngữ cổ","Đọc hiểu văn bản cổ"]},
      {icon:"🔤",name:"NGỮ ÂM",topics:["Hệ thống âm vị tiếng Việt","Thanh điệu","Âm đầu và âm cuối","Âm đệm và âm chính","Cấu trúc âm tiết","Đặc điểm phát âm vùng miền"]},
      {icon:"✍️",name:"CHÍNH TẢ",topics:["Quy tắc viết hoa","Quy tắc i/y","Phân biệt phụ âm đầu dễ nhầm","Phân biệt vần và âm cuối","Dấu câu và trình bày văn bản","Lỗi chính tả thường gặp"]},
      {icon:"🧩",name:"NGỮ PHÁP",topics:["Từ loại tiếng Việt","Cụm từ và thành phần câu","Câu đơn và câu ghép","Liên kết câu và đoạn văn","Phong cách chức năng","Biện pháp tu từ và hiệu quả biểu đạt"]},
      {icon:"📚",name:"TỪ VỰNG",topics:["Từ đơn và từ phức","Từ ghép và từ láy","Từ đồng nghĩa và trái nghĩa","Từ nhiều nghĩa và đồng âm","Thành ngữ và tục ngữ","Từ vay mượn và thuật ngữ"]},
      {icon:"📘",name:"ĐỌC HIỂU",topics:["Đọc hiểu văn bản thông tin","Đọc hiểu văn bản nghị luận","Đọc hiểu văn bản văn học","Xác định chủ đề và thông điệp","Phân tích hình thức và nội dung","Đọc hiểu văn bản đa phương thức"]},
      {icon:"🖋️",name:"VIẾT",topics:["Viết câu đúng ngữ pháp","Viết đoạn văn","Văn bản thuyết minh","Văn bản tự sự và miêu tả","Văn bản nghị luận","Biên tập và sửa lỗi diễn đạt"]}
    ],
    rooms:["TIẾNG VIỆT HIỆN ĐẠI","HÁN VIỆT","CHỮ NÔM","HÁN TỰ","VĂN HỌC","VĂN BẢN CỔ","NGỮ ÂM","CHÍNH TẢ","NGỮ PHÁP","TỪ VỰNG","ĐỌC HIỂU","VIẾT","KIỂM TRA","ĐÁNH GIÁ","THƯ VIỆN VĂN BẢN"],
    features:["TỪ ĐIỂN HÁN VIỆT","TỪ ĐIỂN NÔM","THƯ VIỆN VĂN BẢN","AI TUTOR","THƯ VIỆN HỌC LIỆU"],
    tracks:[],
    certificates:[]
  }
];
