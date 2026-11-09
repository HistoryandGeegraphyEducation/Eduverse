# EDUVERSE THCS

Chạy bằng cách mở `index.html` (trong Spck Editor: mở thư mục này rồi xem trước `index.html`).

## Cấu trúc
- `index.html` – khung trang
- `css/style.css` – toàn bộ giao diện (điện thoại, máy tính bảng, máy tính)
- `js/data.js` – môn học, lớp, mục lục Lớp 6, các phòng của từng môn
- `js/sims/` – các mô phỏng: `quake.js` (động đất), `volcano.js` (núi lửa), `earth.js` (Trái Đất 3D), `common.js` (hàm dùng chung)
- `js/registry.js` – danh sách mô phỏng (thêm mô phỏng mới ở đây)
- `js/app.js` – điều hướng, màn hình, đăng nhập (tạm lưu cục bộ)

## Thay ảnh
Ảnh nằm trong `assets/img/`. Ghi đè file cùng tên là app dùng ảnh mới, không cần sửa code.
- `grade/` – ảnh nhỏ trên nút Lớp 6–9 (h = Lịch sử, g = Địa lí)
- `ui/` – biển hiệu Lịch Sử / Địa Lí
- `bg/sky.jpg` – nền trời
- `subject/` – ảnh PNG cho từng môn (xem `README.txt` trong thư mục)
- `earth.jpg` (tuỳ chọn) – bản đồ Trái Đất cho mô hình 3D. Nếu không có, app tải ảnh từ mạng, nếu không được thì dùng bản đồ tự vẽ.

## Lưu ý
- Mô hình Trái Đất 3D tải Three.js từ mạng nên cần Internet.
- Mở `index.html` trực tiếp trong khung xem trước của Claude sẽ không thấy ảnh, vì ảnh là file riêng. Hãy mở trong Spck hoặc trình duyệt.
