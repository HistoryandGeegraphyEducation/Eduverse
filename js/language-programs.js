// ===== DỮ LIỆU PHÂN HỆ NGÔN NGỮ =====
const LANGUAGE_PROGRAMS = [
  {
    id:"en",name:"TIẾNG ANH",nativeName:"English",flag:"🇬🇧",
    skills:[["📚","TỪ VỰNG"],["🧩","NGỮ PHÁP"],["📕","TỪ ĐIỂN"],["🎧","NGHE"],["🎙️","NÓI"],["📖","ĐỌC"],["✍️","VIẾT"]].map(([icon,name])=>({icon,name})),
    rooms:["PHÒNG HỌC","PHÒNG TỰ HỌC","TỪ VỰNG","NGỮ PHÁP","TỪ ĐIỂN","NGHE","NÓI","ĐỌC","VIẾT","HỘI THOẠI","PHÁT ÂM"],
    features:["AI TUTOR","GIỌNG NÓI","ĐÁNH GIÁ","VIDEO STUDIO","THƯ VIỆN HỌC LIỆU"],
    tracks:[{id:"general",name:"LỘ TRÌNH A1–C1",stages:["A1","A2","B1","B2","C1"],description:""}],
    certificates:[
      {id:"ielts",name:"IELTS",short:"IELTS",stages:["LISTENING","READING","WRITING","SPEAKING"],description:""},
      {id:"vstep",name:"VSTEP",short:"VSTEP",stages:["NGHE","ĐỌC","VIẾT","NÓI"],description:""},
      {id:"toeic",name:"TOEIC",short:"TOEIC",stages:["LISTENING","READING"],description:""},
      {id:"aptis",name:"APTIS",short:"APTIS",stages:["GRAMMAR & VOCABULARY","LISTENING","READING","SPEAKING","WRITING"],description:""}
    ]
  },
  {
    id:"fr",name:"TIẾNG PHÁP",nativeName:"Français",flag:"🇫🇷",
    skills:[["📚","TỪ VỰNG"],["🧩","NGỮ PHÁP"],["📕","TỪ ĐIỂN"],["🎧","NGHE"],["🎙️","NÓI"],["📖","ĐỌC"],["✍️","VIẾT"]].map(([icon,name])=>({icon,name})),
    rooms:["PHÒNG HỌC","PHÒNG TỰ HỌC","TỪ VỰNG","NGỮ PHÁP","TỪ ĐIỂN","NGHE","NÓI","ĐỌC","VIẾT","HỘI THOẠI","PHÁT ÂM"],
    features:["AI TUTOR","GIỌNG NÓI","ĐÁNH GIÁ","VIDEO STUDIO","THƯ VIỆN HỌC LIỆU"],
    tracks:[{id:"foundation",name:"LỘ TRÌNH A1–A2",stages:["A1","A2"],description:""}],
    certificates:[{id:"delf",name:"DELF",short:"DELF",stages:["A1","A2"],description:""}]
  },
  {
    id:"de",name:"TIẾNG ĐỨC",nativeName:"Deutsch",flag:"🇩🇪",
    skills:[["📚","TỪ VỰNG"],["🧩","NGỮ PHÁP"],["📕","TỪ ĐIỂN"],["🎧","NGHE"],["🎙️","NÓI"],["📖","ĐỌC"],["✍️","VIẾT"]].map(([icon,name])=>({icon,name})),
    rooms:["PHÒNG HỌC","PHÒNG TỰ HỌC","TỪ VỰNG","NGỮ PHÁP","TỪ ĐIỂN","NGHE","NÓI","ĐỌC","VIẾT","HỘI THOẠI","PHÁT ÂM"],
    features:["AI TUTOR","GIỌNG NÓI","ĐÁNH GIÁ","VIDEO STUDIO","THƯ VIỆN HỌC LIỆU"],
    tracks:[{id:"foundation",name:"LỘ TRÌNH A1–A2",stages:["A1","A2"],description:""}],
    certificates:[{id:"goethe",name:"GOETHE-ZERTIFIKAT",short:"GOETHE",stages:["A1","A2"],description:""}]
  },
  {
    id:"zh",name:"TIẾNG TRUNG",nativeName:"中文",flag:"🇨🇳",
    skills:[["📚","TỪ VỰNG"],["🧩","NGỮ PHÁP"],["📕","TỪ ĐIỂN"],["🎧","NGHE"],["🎙️","NÓI"],["📖","ĐỌC"],["✍️","VIẾT"],["🀄","CHỮ HÁN"],["拼","PINYIN"]].map(([icon,name])=>({icon,name})),
    rooms:["PHÒNG HỌC","PHÒNG TỰ HỌC","TỪ VỰNG","NGỮ PHÁP","TỪ ĐIỂN","NGHE","NÓI","ĐỌC","VIẾT","CHỮ HÁN","PINYIN","HỘI THOẠI"],
    features:["AI TUTOR","GIỌNG NÓI","ĐÁNH GIÁ","VIDEO STUDIO","THƯ VIỆN HỌC LIỆU"],
    tracks:[{id:"foundation",name:"LỘ TRÌNH NỀN TẢNG",stages:["PHÁT ÂM","TỪ VỰNG","CÂU CƠ BẢN","GIAO TIẾP"],description:""}],
    certificates:[{id:"hsk",name:"HSK",short:"HSK",stages:["HSK 1","HSK 2","HSK 3"],description:""}]
  },
  {
    id:"es",name:"TIẾNG TÂY BAN NHA",nativeName:"Español",flag:"🇪🇸",
    skills:[["📚","TỪ VỰNG"],["🧩","NGỮ PHÁP"],["📕","TỪ ĐIỂN"],["🎧","NGHE"],["🎙️","NÓI"],["📖","ĐỌC"],["✍️","VIẾT"]].map(([icon,name])=>({icon,name})),
    rooms:["PHÒNG HỌC","PHÒNG TỰ HỌC","TỪ VỰNG","NGỮ PHÁP","TỪ ĐIỂN","NGHE","NÓI","ĐỌC","VIẾT","HỘI THOẠI","PHÁT ÂM"],
    features:["AI TUTOR","GIỌNG NÓI","ĐÁNH GIÁ","VIDEO STUDIO","THƯ VIỆN HỌC LIỆU"],
    tracks:[{id:"foundation",name:"LỘ TRÌNH A1–A2",stages:["A1","A2"],description:""}],
    certificates:[{id:"dele",name:"DELE",short:"DELE",stages:["A1","A2"],description:""}]
  },
  {
    id:"ru",name:"TIẾNG NGA",nativeName:"Русский",flag:"🇷🇺",
    skills:[["📚","TỪ VỰNG"],["🧩","NGỮ PHÁP"],["📕","TỪ ĐIỂN"],["🎧","NGHE"],["🎙️","NÓI"],["📖","ĐỌC"],["✍️","VIẾT"],["АБ","BẢNG CHỮ CÁI CYRILLIC"]].map(([icon,name])=>({icon,name})),
    rooms:["PHÒNG HỌC","PHÒNG TỰ HỌC","TỪ VỰNG","NGỮ PHÁP","TỪ ĐIỂN","NGHE","NÓI","ĐỌC","VIẾT","BẢNG CHỮ CÁI","HỘI THOẠI","PHÁT ÂM"],
    features:["AI TUTOR","GIỌNG NÓI","ĐÁNH GIÁ","VIDEO STUDIO","THƯ VIỆN HỌC LIỆU"],
    tracks:[{id:"foundation",name:"LỘ TRÌNH NỀN TẢNG",stages:["BẢNG CHỮ CÁI","PHÁT ÂM","TỪ VỰNG","GIAO TIẾP"],description:""}],
    certificates:[]
  },
  {
    id:"vi",name:"TIẾNG VIỆT",nativeName:"Tiếng Việt",flag:"🇻🇳",
    skills:[["📚","TIẾNG VIỆT HIỆN ĐẠI"],["漢","HÁN VIỆT"],["𡨸","CHỮ NÔM"],["文","HÁN TỰ"],["📜","VĂN HỌC"],["📖","VĂN BẢN CỔ"],["🔤","NGỮ ÂM"],["✍️","CHÍNH TẢ"],["🧩","NGỮ PHÁP"],["📚","TỪ VỰNG"],["📘","ĐỌC HIỂU"],["🖋️","VIẾT"]].map(([icon,name])=>({icon,name})),
    rooms:["TIẾNG VIỆT HIỆN ĐẠI","HÁN VIỆT","CHỮ NÔM","HÁN TỰ","VĂN HỌC","VĂN BẢN CỔ","NGỮ ÂM","CHÍNH TẢ","NGỮ PHÁP","TỪ VỰNG","ĐỌC HIỂU","VIẾT"],
    features:["TỪ ĐIỂN HÁN VIỆT","TỪ ĐIỂN NÔM","THƯ VIỆN VĂN BẢN","AI TUTOR","THƯ VIỆN HỌC LIỆU"],
    tracks:[],
    certificates:[]
  }
];
