# Triển khai chấm điểm – Vòng Bứt Phá

## Thành phần

- `supabase/migrations/202611150001_breakthrough_assessment.sql`: tạo bảng phòng và lưu từng phiên bản bài làm.
- `supabase/migrations/202611160001_breakthrough_assessment_review.sql`: thêm trạng thái chờ AI, điểm theo tiêu chí do giáo viên xác nhận và ràng buộc tổng điểm.
- `supabase/functions/_shared/breakthrough-rubrics.ts`: barem cố định riêng cho 8 tình huống; tổng trọng số của từng tình huống là 100.
- `supabase/functions/breakthrough-assess/index.ts`: xác thực mã phòng/token, kiểm tra đội trưởng, tình huống và thời hạn; lưu phiên bản trước khi gọi AI; trả lịch sử; nhận điểm tiêu chí do giáo viên xác nhận.
- `assets/js/team-room.js`: thành viên gửi đóng góp; đội trưởng tổng hợp và gửi nhiều phiên bản; giáo viên xem toàn bộ lịch sử, chỉnh điểm từng tiêu chí và xác nhận.

Supabase Realtime tiếp tục đồng bộ đóng góp thành viên, trạng thái vòng và điều khiển giữa các thiết bị. Supabase Database lưu bài làm, phiên bản, điểm đề xuất, phản hồi và điểm cuối. Edge Function là điểm duy nhất sử dụng service-role key và OpenAI API key.

## Cấu hình một lần tại Supabase

Chạy từ thư mục gốc repository bằng máy đã cài Supabase CLI:

```sh
supabase login
supabase link --project-ref tlfuzdyblzlpogqlatkw
supabase db push
```

Đặt khóa AI bằng CLI. Thay giá trị mẫu bằng API key của dự án; không đưa khóa vào GitHub, HTML, JavaScript phía trình duyệt hoặc tin nhắn gửi cho học sinh:

```sh
supabase secrets set OPENAI_API_KEY=YOUR_OPENAI_API_KEY
supabase secrets set OPENAI_MODEL=gpt-4.1-mini
```

Triển khai Edge Function:

```sh
supabase functions deploy breakthrough-assess --no-verify-jwt
```

Function tắt xác thực JWT mặc định vì mỗi phòng dùng token ngẫu nhiên 256-bit riêng; máy chủ chỉ lưu SHA-256 của token. `SUPABASE_URL` và `SUPABASE_SERVICE_ROLE_KEY` được cung cấp trong môi trường Edge Function của Supabase. Không sao chép service-role key vào `assets/js/supabase-config.js`.

Publishable key hiện có trong `assets/js/supabase-config.js` là khóa công khai dành cho trình duyệt. RLS chặn anon/authenticated truy cập trực tiếp hai bảng đánh giá; chỉ Edge Function dùng service role được đọc/ghi.

## Quy trình đánh giá

1. Giáo viên tạo phòng. Edge Function đăng ký mã phòng và lưu hash của token giáo viên.
2. Khi vòng Bứt Phá bắt đầu, máy chủ nhận danh sách đội trưởng, tình huống đã phân và một thời điểm kết thúc cố định. Việc đồng bộ được xếp hàng để tránh bản cập nhật cũ ghi đè trạng thái mới.
3. Thành viên gửi nội dung đóng góp cho đội qua Supabase Realtime. Đội trưởng tổng hợp thành bài làm chung và gửi.
4. Máy chủ xác thực đội trưởng, đội, tình huống và hạn gửi. Bản gửi được lưu thành phiên bản mới trước khi gọi AI.
5. AI đánh giá từng tiêu chí theo barem tương ứng. Máy chủ chỉ nhận điểm nguyên trong giới hạn của tiêu chí, kiểm tra trích dẫn phải là chuỗi con chính xác của bài làm và tự tính tổng từ điểm tiêu chí. Thiếu bằng chứng, cấu trúc sai hoặc nội dung chưa chắc chắn sẽ chuyển trạng thái cần giáo viên xem xét.
6. Mỗi lần gửi tiếp theo tạo phiên bản mới. Không lấy trung bình; chỉ phiên bản mới nhất hợp lệ trước hạn mới được xác nhận làm điểm cuối.
7. Sau khi hết giờ, giáo viên có thể sửa điểm từng tiêu chí và ghi chú. Edge Function kiểm tra đúng phiên bản cuối, kiểm tra từng điểm trong giới hạn barem và tự tính tổng. Cơ sở dữ liệu có trigger kiểm tra lại phép cộng trước khi lưu.

## Khi chưa có API key hoặc AI lỗi

Bản gửi vẫn được lưu với trạng thái `awaiting_ai`; hệ thống không tự tạo điểm hoặc phản hồi giả. Giáo viên có thể nhập điểm cho từng tiêu chí theo barem sau khi hết giờ. Khi đã cấu hình API key, giáo viên có thể yêu cầu đánh giá lại một bản đang chờ AI.

Nếu Edge Function hoặc migration chưa được triển khai, chức năng lưu phía máy chủ chưa hoạt động. Trạng thái này không thể được khắc phục chỉ bằng GitHub Pages. Sau khi triển khai xong, hãy tạo phòng mới để đăng ký token và kiểm tra một lượt gửi thử.

## Kiểm tra sau triển khai

- Tạo phòng và xác nhận trạng thái kết nối lưu trữ bài làm.
- Chọn đủ bốn tình huống; kiểm tra mỗi đội chỉ có một đội trưởng được gửi bài chung.
- Thành viên gửi đóng góp; đội trưởng tổng hợp và gửi bản đầu, sau đó gửi thêm bản sửa.
- Kiểm tra Database có version tăng tuần tự, không ghi đè bản cũ.
- Thử gửi sau thời điểm kết thúc: máy chủ phải từ chối.
- Thử xác nhận khi còn giờ hoặc xác nhận một phiên bản cũ: máy chủ phải từ chối.
- Sau khi hết giờ, điều chỉnh điểm một vài tiêu chí; kiểm tra tổng cuối bằng tổng các tiêu chí và nằm trong 0–100.
- Thử điểm âm, điểm lớn hơn mức tối đa, thiếu tiêu chí hoặc tổng không khớp: máy chủ/trigger phải từ chối.
- Kiểm tra thành viên không thể gọi trực tiếp thao tác giáo viên; chỉ trang giáo viên đang giữ token phòng mới đọc lịch sử và xác nhận.

## Giới hạn

- GitHub Pages chỉ cung cấp giao diện. Migration và Edge Function phải được triển khai riêng tại Supabase.
- Nếu chưa có `OPENAI_API_KEY`, bản gửi vẫn được lưu nhưng không có điểm AI.
- Token giáo viên chỉ được giữ trong bộ nhớ trang đang mở; tải lại hoặc đóng tab không khôi phục quyền điều khiển của phòng cũ. Các bản ghi vẫn còn trong Database nhưng giao diện hiện tại chưa có luồng khôi phục token để mở lại lịch sử đó.
- Trạng thái phòng, đóng góp Realtime và bảng điểm tổng của các vòng khác vẫn phụ thuộc trang giáo viên đang mở; cơ chế lưu bền vững trong tài liệu này áp dụng cho bài làm và kết quả đánh giá Bứt Phá.
