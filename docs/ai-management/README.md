# Quy tắc phối hợp AI và quản lý mã nguồn EDUVERSE

Áp dụng cho mọi AI, cộng tác viên và giai đoạn phát triển trong dự án EDUVERSE.

## 7 quy tắc

1. **`main` là phiên bản nền tảng đã được chấp nhận.** Chỉ đưa thay đổi vào `main` sau khi hoàn tất quy trình xem xét và hợp nhất.

2. **Không commit trực tiếp lên `main`.** Mọi thay đổi phải được thực hiện trên nhánh làm việc phù hợp.

3. **Mỗi giai đoạn có một AI phụ trách, một nhánh riêng và một người chịu trách nhiệm.** Phạm vi công việc và quyền sở hữu của từng giai đoạn phải được xác định rõ.

4. **Mọi thay đổi phải thông qua Pull Request.** Chủ dự án kiểm tra nội dung và là người quyết định hợp nhất Pull Request vào `main`.

5. **Tại một thời điểm, chỉ một AI được ghi mã nguồn vào nhánh của một giai đoạn.** Các AI khác không ghi đồng thời lên cùng nhánh đó.

6. **Trước khi dừng hoặc bàn giao công việc, phải cập nhật trạng thái giai đoạn và thông tin bàn giao.** Thông tin bàn giao phải ghi rõ commit SHA mới nhất để xác định chính xác phiên bản mã nguồn.

7. **Không tuyên bố thay đổi đã được lưu nếu commit chưa xuất hiện trên GitHub.** Khi báo cáo, phải phân biệt rõ thay đổi cục bộ, commit đã đẩy lên GitHub và thay đổi đã được hợp nhất.

