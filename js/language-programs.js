
// ===== DỮ LIỆU PHÂN HỆ NGOẠI NGỮ =====
const LANGUAGE_PROGRAMS = [
  {
    id:"en",name:"TIẾNG ANH",nativeName:"English",flag:"🇬🇧",
    shortDescription:"Học tập và ôn chứng chỉ",
    description:"Lộ trình từ nền tảng đến các mục tiêu sử dụng và đánh giá năng lực tiếng Anh.",
    skills:[["📚","Từ vựng"],["🧩","Ngữ pháp"],["🎧","Nghe"],["🎙️","Nói"],["📖","Đọc"],["✍️","Viết"]].map(([icon,name])=>({icon,name})),
    features:["Từ điển","Bài học","AI Tutor","Giọng nói","Đánh giá","Video Studio","Kho học liệu"],
    tracks:[{id:"general",name:"Lộ trình nền tảng",summary:"Từ cơ bản đến nâng cao",stages:["A1","A2","B1","B2","C1"],description:"Lộ trình phát triển năng lực tiếng Anh theo các cấp độ tham chiếu CEFR."}],
    certificates:[
      {id:"ielts",name:"IELTS",short:"IELTS",summary:"Ôn tập bốn kỹ năng",stages:["Listening","Reading","Writing","Speaking"],description:"Khung ôn tập IELTS theo bốn kỹ năng và các dạng nhiệm vụ của bài thi."},
      {id:"vstep",name:"VSTEP",short:"VSTEP",summary:"Định hướng theo bậc năng lực",stages:["Nghe","Đọc","Viết","Nói"],description:"Khung ôn tập VSTEP theo bốn kỹ năng, gắn với mục tiêu bậc năng lực."}
    ]
  },
  {
    id:"zh",name:"TIẾNG TRUNG",nativeName:"中文 · Mandarin",flag:"🇨🇳",
    shortDescription:"Học chữ Hán và luyện HSK",
    description:"Lộ trình kết hợp phát âm, thanh điệu, chữ Hán, từ vựng và giao tiếp.",
    skills:[["🀄","Chữ Hán"],["🔊","Pinyin"],["📚","Từ vựng"],["🎧","Nghe"],["🎙️","Nói"],["✍️","Viết"]].map(([icon,name])=>({icon,name})),
    features:["Từ điển","Bài học","AI Tutor","Giọng nói","Đánh giá","Video Studio","Kho học liệu"],
    tracks:[{id:"foundation",name:"Lộ trình nền tảng",summary:"Làm quen đến sơ cấp",stages:["Phát âm","Từ vựng","Câu cơ bản","Giao tiếp"],description:"Lộ trình làm quen Pinyin, thanh điệu, chữ Hán và các cấu trúc giao tiếp cơ bản."}],
    certificates:[{id:"hsk",name:"HSK 1–3",short:"HSK",summary:"Ôn tập cấp độ sơ cấp",stages:["HSK 1","HSK 2","HSK 3"],description:"Khung ôn tập HSK 1–3 ở giai đoạn đầu của phân hệ tiếng Trung."}]
  },
  {
    id:"fr",name:"TIẾNG PHÁP",nativeName:"Français",flag:"🇫🇷",
    shortDescription:"Học nền tảng và DELF",
    description:"Lộ trình tiếng Pháp theo cấp độ, chú trọng phát âm, giống danh từ và chia động từ.",
    skills:[["📚","Từ vựng"],["🧩","Ngữ pháp"],["🎧","Nghe"],["🎙️","Nói"],["📖","Đọc"],["✍️","Viết"]].map(([icon,name])=>({icon,name})),
    features:["Từ điển","Bài học","AI Tutor","Giọng nói","Đánh giá","Video Studio","Kho học liệu"],
    tracks:[{id:"foundation",name:"Lộ trình nền tảng",summary:"A1 đến A2",stages:["A1","A2"],description:"Lộ trình tiếng Pháp nền tảng theo hai cấp độ A1 và A2."}],
    certificates:[{id:"delf",name:"DELF A1–A2",short:"DELF",summary:"Ôn tập cấp độ cơ bản",stages:["A1","A2"],description:"Khung ôn tập DELF A1–A2 theo các kỹ năng nghe, đọc, viết và nói."}]
  },
  {
    id:"es",name:"TIẾNG TÂY BAN NHA",nativeName:"Español",flag:"🇪🇸",
    shortDescription:"Học nền tảng và DELE",
    description:"Lộ trình tiếng Tây Ban Nha từ phát âm, từ vựng và cấu trúc câu cơ bản.",
    skills:[["📚","Từ vựng"],["🧩","Ngữ pháp"],["🎧","Nghe"],["🎙️","Nói"],["📖","Đọc"],["✍️","Viết"]].map(([icon,name])=>({icon,name})),
    features:["Từ điển","Bài học","AI Tutor","Giọng nói","Đánh giá","Video Studio","Kho học liệu"],
    tracks:[{id:"foundation",name:"Lộ trình nền tảng",summary:"A1 đến A2",stages:["A1","A2"],description:"Lộ trình tiếng Tây Ban Nha nền tảng theo hai cấp độ A1 và A2."}],
    certificates:[{id:"dele",name:"DELE A1–A2",short:"DELE",summary:"Ôn tập cấp độ cơ bản",stages:["A1","A2"],description:"Khung ôn tập DELE A1–A2 theo các kỹ năng nghe, đọc, viết và nói."}]
  },
  {
    id:"de",name:"TIẾNG ĐỨC",nativeName:"Deutsch",flag:"🇩🇪",
    shortDescription:"Học nền tảng và Goethe",
    description:"Lộ trình tiếng Đức với trọng tâm giống danh từ, cách (Kasus) và cấu trúc câu.",
    skills:[["📚","Từ vựng"],["🧩","Ngữ pháp"],["🎧","Nghe"],["🎙️","Nói"],["📖","Đọc"],["✍️","Viết"]].map(([icon,name])=>({icon,name})),
    features:["Từ điển","Bài học","AI Tutor","Giọng nói","Đánh giá","Video Studio","Kho học liệu"],
    tracks:[{id:"foundation",name:"Lộ trình nền tảng",summary:"A1 đến A2",stages:["A1","A2"],description:"Lộ trình tiếng Đức nền tảng theo hai cấp độ A1 và A2."}],
    certificates:[{id:"goethe",name:"Goethe-Zertifikat A1–A2",short:"GOETHE",summary:"Ôn tập cấp độ cơ bản",stages:["A1","A2"],description:"Khung ôn tập Goethe-Zertifikat A1–A2 theo các kỹ năng nghe, đọc, viết và nói."}]
  }
];
