# Đấu trường nghề nghiệp – Chủ đề 8

Website trò chơi học tập theo tài liệu Word CHỦ ĐỀ 8: Khám phá thế giới nghề nghiệp.

## Cấu trúc
- `index.html`: Trang chủ
- `pages/khoi-dong.html`: Hoạt động khởi động
- `pages/phan-xa.html`: Vòng 1 – Phản xạ
- `pages/lien-ket.html`: Vòng 2 – Liên kết
- `pages/but-pha.html`: Vòng 3 – Bứt phá
- `pages/luyen-tap.html`: Đúng nghề – Đúng cách
- `pages/van-dung.html`: Phiếu vận dụng
- `assets/css/`: CSS chung và CSS riêng từng trang
- `assets/js/`: JavaScript chung và logic riêng từng trang
- `assets/images/`: hình nền lấy từ bộ Bo_tai_nguyen_slide_Chu_de_8

## Chạy thử
Mở `index.html` hoặc bật GitHub Pages từ Settings → Pages → Deploy from a branch → `main` / root.

## Lưu ý chức năng
Điểm các vòng ngoài Bứt Phá vẫn do giáo viên điều phối trong phiên phòng. Riêng vòng Bứt Phá, từng phiên bản bài làm được lưu vào Supabase; AI chỉ đưa điểm đề xuất theo barem cố định, còn giáo viên điều chỉnh điểm từng tiêu chí và xác nhận điểm cuối. Cần áp dụng migration và triển khai Edge Function theo `supabase/README-BREAKTHROUGH.md` trước khi dùng chức năng này.


## Phòng chơi theo đội qua mã QR
- Mở `room.html` trên thiết bị giáo viên và chọn **Tạo phòng và sinh mã QR**.
- Thành viên quét mã QR, nhập tên, chọn đội và gửi câu trả lời từ điện thoại.
- Giáo viên theo dõi thành viên, câu trả lời và bảng điểm; cộng 1, 2 hoặc 5 điểm cho từng lượt gửi. Mỗi lượt chỉ được chấm một lần.
- Phòng sử dụng PeerJS để kết nối trực tiếp giữa các trình duyệt. Thiết bị giáo viên phải giữ trang phòng mở và có kết nối Internet trong suốt hoạt động. Nếu tải lại hoặc đóng trang, phòng cũ kết thúc và cần tạo mã mới.
- Mã QR là đường dẫn tham gia phòng. Chỉ chia sẻ mã cho người trong lớp; hiện chưa có mật khẩu hoặc xác thực tài khoản.
- Các thư viện PeerJS và QRCode được tải từ CDN nên thiết bị cần truy cập Internet. GitHub Pages chỉ lưu trữ giao diện. Supabase lưu các phiên bản bài làm, phản hồi và điểm xác nhận của vòng Bứt Phá sau khi đã triển khai cấu hình; trạng thái phòng và bảng điểm tổng của các vòng khác vẫn nằm trong phiên trình duyệt.
