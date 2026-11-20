export const RUBRICS = [
  { scenario: 1, title: "Ca cấp cứu bất ngờ", context: "Một người bị ngất giữa đường. Em muốn tìm hiểu nghề bác sĩ cấp cứu và điều dưỡng.", task: "Xác định thông tin cần tìm hiểu về nhiệm vụ, yêu cầu chuyên môn và môi trường làm việc. Chọn cách thu thập thông tin và giải thích vì sao.", criteria: [
    { id: "information", label: "Xác định thông tin cần tìm hiểu", max: 25, guide: "Nêu được nhiệm vụ và nội dung cần tìm hiểu của bác sĩ cấp cứu, điều dưỡng." },
    { id: "competencies", label: "Kiến thức, kỹ năng và phẩm chất", max: 20, guide: "Xác định yêu cầu chuyên môn và phẩm chất phù hợp." },
    { id: "sources_methods", label: "Nguồn và phương pháp thu thập", max: 20, guide: "Chọn nguồn/phương pháp như bệnh viện, cơ sở đào tạo, tài liệu chuyên ngành, phỏng vấn." },
    { id: "reasoning", label: "Giải thích lựa chọn", max: 20, guide: "Giải thích sự phù hợp của nguồn và phương pháp với thông tin cần tìm." },
    { id: "distinction", label: "Phân biệt hai nghề", max: 15, guide: "Phân biệt vai trò chuyên môn của bác sĩ cấp cứu và điều dưỡng." }
  ]},
  { scenario: 2, title: "Công trình gặp sự cố", context: "Một cây cầu đang xây dựng xuất hiện vết nứt bất thường.", task: "Chọn ít nhất hai cách tìm hiểu nghề kỹ sư xây dựng và kỹ sư kiểm định; xác định thông tin về năng lực, phẩm chất và điều kiện làm việc.", criteria: [
    { id: "methods", label: "Ít nhất hai phương pháp tìm hiểu", max: 25, guide: "Đề xuất tối thiểu hai phương pháp tìm hiểu phù hợp." },
    { id: "competencies", label: "Năng lực chuyên môn", max: 20, guide: "Nêu năng lực cần thiết của kỹ sư xây dựng và kỹ sư kiểm định." },
    { id: "qualities", label: "Phẩm chất nghề nghiệp", max: 15, guide: "Nêu phẩm chất phù hợp với công việc và trách nhiệm an toàn." },
    { id: "conditions", label: "Điều kiện làm việc", max: 20, guide: "Mô tả môi trường và điều kiện làm việc." },
    { id: "distinction", label: "Phân biệt hai nghề", max: 20, guide: "Phân biệt nhiệm vụ xây dựng/thi công với kiểm tra, đánh giá công trình." }
  ]},
  { scenario: 3, title: "Mùa màng thất bát", context: "Sâu bệnh phá hoại mùa màng; em muốn tìm hiểu nghề kỹ sư nông nghiệp.", task: "Nêu nguồn tìm kiếm và cách kiểm chứng thông tin về công việc, kiến thức chuyên môn và khó khăn thực tế.", criteria: [
    { id: "sources", label: "Nguồn tìm kiếm", max: 20, guide: "Chọn nguồn phù hợp như viện nghiên cứu, trường, cơ quan chuyên môn, khuyến nông, người sản xuất." },
    { id: "tasks", label: "Công việc thực tế", max: 25, guide: "Nêu nhiệm vụ của kỹ sư nông nghiệp." },
    { id: "knowledge", label: "Kiến thức và chuyên môn", max: 20, guide: "Nêu kiến thức, kỹ năng chuyên môn phù hợp." },
    { id: "challenges", label: "Khó khăn thực tế", max: 15, guide: "Nêu thách thức như thời tiết, sâu bệnh, điều kiện sản xuất, chi phí." },
    { id: "verification", label: "Kiểm chứng thông tin", max: 20, guide: "Đối chiếu nhiều nguồn, xem đơn vị công bố, thời điểm và tính phù hợp." }
  ]},
  { scenario: 4, title: "Tin giả trên mạng", context: "Thông tin sai lệch về một sự cố lan truyền; em quan tâm nghề phóng viên và biên tập viên.", task: "Chọn cách tìm hiểu nghề và tiêu chí đánh giá độ tin cậy của thông tin về nhiệm vụ, kỹ năng, trách nhiệm.", criteria: [
    { id: "methods", label: "Phương pháp tìm hiểu nghề", max: 20, guide: "Chọn phương pháp phù hợp để tìm hiểu phóng viên và biên tập viên." },
    { id: "tasks", label: "Nhiệm vụ từng nghề", max: 20, guide: "Nêu nhiệm vụ của phóng viên và biên tập viên." },
    { id: "skills", label: "Kỹ năng cần thiết", max: 20, guide: "Nêu kỹ năng nghiệp vụ phù hợp." },
    { id: "responsibility", label: "Trách nhiệm nghề nghiệp", max: 20, guide: "Làm rõ trách nhiệm xác minh, biên tập và truyền tải thông tin chính xác." },
    { id: "reliability", label: "Đánh giá độ tin cậy", max: 20, guide: "Nêu tiêu chí về tác giả, cơ quan, bằng chứng, thời điểm và đối chiếu nguồn." }
  ]},
  { scenario: 5, title: "Ô nhiễm vùng biển", context: "Vùng biển có rác thải nhựa và cá chết bất thường.", task: "Đề xuất phương án tìm hiểu nghề kỹ sư môi trường hoặc nhà nghiên cứu biển; kết hợp cách tìm hiểu để biết công cụ, môi trường, chuyên môn, thách thức.", criteria: [
    { id: "career", label: "Lựa chọn nghề và hướng tìm hiểu", max: 15, guide: "Chọn kỹ sư môi trường hoặc nhà nghiên cứu biển và xác định hướng tìm hiểu." },
    { id: "methods", label: "Kết hợp phương pháp tìm hiểu", max: 20, guide: "Kết hợp tài liệu, phỏng vấn, video khảo sát, tham quan hoặc quan sát." },
    { id: "expertise", label: "Kiến thức chuyên môn", max: 20, guide: "Nêu kiến thức chuyên môn liên quan môi trường hoặc khoa học biển." },
    { id: "tools", label: "Công cụ và thiết bị", max: 15, guide: "Nêu công cụ phù hợp như thiết bị lấy mẫu, đo chất lượng nước, thiết bị phân tích." },
    { id: "conditions", label: "Môi trường làm việc", max: 15, guide: "Mô tả môi trường làm việc và điều kiện khảo sát/nghiên cứu." },
    { id: "challenges", label: "Thách thức thực tế", max: 15, guide: "Nêu thách thức phù hợp với đặc thù nghề." }
  ]},
  { scenario: 6, title: "Chuyến bay bị gián đoạn", context: "Chuyến bay tạm dừng do thời tiết xấu; em quan tâm phi công, kiểm soát viên không lưu, nhân viên điều hành bay.", task: "Chọn một nghề để tìm hiểu sâu; nêu thông tin cần thu thập và nguồn đáng tin cậy.", criteria: [
    { id: "career", label: "Lựa chọn một nghề cụ thể", max: 15, guide: "Chọn một trong các nghề được nêu và giải thích lựa chọn." },
    { id: "tasks", label: "Nhiệm vụ và trách nhiệm", max: 25, guide: "Nêu nhiệm vụ và trách nhiệm của nghề đã chọn." },
    { id: "competencies", label: "Kiến thức, kỹ năng và phẩm chất", max: 20, guide: "Nêu yêu cầu năng lực và phẩm chất." },
    { id: "conditions", label: "Điều kiện làm việc", max: 15, guide: "Nêu môi trường, ca kíp và đặc điểm điều kiện làm việc." },
    { id: "sources", label: "Nguồn thông tin đáng tin cậy", max: 15, guide: "Chọn nguồn chính thức như hãng hàng không, cơ sở đào tạo, cơ quan quản lý." },
    { id: "fit", label: "Giải thích sự phù hợp của nguồn", max: 10, guide: "Giải thích vì sao nguồn phù hợp với nội dung cần tìm hiểu." }
  ]},
  { scenario: 7, title: "Di tích trước nguy cơ biến mất", context: "Một di tích lịch sử xuống cấp nghiêm trọng.", task: "Xác định nội dung, nguồn thông tin và phương pháp tìm hiểu nghề kiến trúc sư bảo tồn hoặc chuyên gia bảo tồn di tích.", criteria: [
    { id: "content", label: "Nội dung cần tìm hiểu", max: 20, guide: "Xác định nội dung tìm hiểu về kiến trúc sư bảo tồn hoặc chuyên gia bảo tồn di tích." },
    { id: "role", label: "Nhiệm vụ và vai trò bảo tồn", max: 25, guide: "Nêu vai trò, nhiệm vụ liên quan khảo sát, nghiên cứu, bảo quản hoặc tu bổ." },
    { id: "competencies", label: "Kiến thức, kỹ năng và phẩm chất", max: 20, guide: "Nêu yêu cầu chuyên môn và phẩm chất phù hợp." },
    { id: "sources", label: "Nguồn thông tin", max: 15, guide: "Chọn cơ quan quản lý di sản, bảo tàng, trung tâm bảo tồn, cơ sở đào tạo, nghiên cứu." },
    { id: "methods", label: "Phương pháp tìm hiểu", max: 20, guide: "Chọn phương pháp như nghiên cứu hồ sơ, phỏng vấn, khảo sát, tư liệu lịch sử." }
  ]},
  { scenario: 8, title: "AI thay đổi công việc", context: "Doanh nghiệp dùng AI thực hiện một số công việc trước đây do con người đảm nhiệm.", task: "Chọn cách tìm hiểu sự thay đổi của một nghề; đối chiếu yêu cầu năng lực mới, kỹ năng cần bổ sung và khả năng thích ứng.", criteria: [
    { id: "career", label: "Lựa chọn nghề cụ thể", max: 15, guide: "Chọn một nghề để tìm hiểu." },
    { id: "changes", label: "Thay đổi khi ứng dụng AI", max: 25, guide: "Nêu nhiệm vụ được hỗ trợ, tự động hóa hoặc thay đổi; không mặc định nghề biến mất." },
    { id: "comparison", label: "Đối chiếu yêu cầu năng lực", max: 20, guide: "So sánh yêu cầu năng lực trước và sau khi ứng dụng AI." },
    { id: "skills", label: "Kỹ năng cần bổ sung", max: 20, guide: "Nêu kỹ năng phù hợp để thích ứng." },
    { id: "research", label: "Cách tìm hiểu có căn cứ", max: 10, guide: "Đề xuất cách tìm hiểu và đánh giá thông tin đáng tin cậy." },
    { id: "adaptation", label: "Khả năng thích ứng", max: 10, guide: "Thể hiện cách thích ứng trước thay đổi của nghề." }
  ]}
] as const;
