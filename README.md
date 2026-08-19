<p align="center">
  <img src="assets/leafbook-icon.png" width="128" alt="LeafBook panda icon">
</p>

<h1 align="center">LeafBook Plugins</h1>

<p align="center">
  Một repository, một catalog, nhiều plugin dành cho LeafBook.
</p>

## Plugin hiện có

- **Open Library Fiction** — khám phá sách phổ biến từ Open Library, có phân trang và ảnh bìa.
- **VnExpress RSS** — chạm bài để đọc ngay, có nội dung và ảnh trong chính trình đọc sách của LeafBook.

Mỗi plugin là một script độc lập triển khai contract `leafbook-source-v1`. Catalog khai báo URL tương đối
và SHA-256 riêng cho từng script.

## Cài đặt

1. Mở **LeafBook → Mở rộng → Cài đặt plugin**.
2. Dán duy nhất URL repository:

   ```text
   https://github.com/hongducdev/hongducdev-leafbook-plugin
   ```

3. Chọn **Kiểm tra kho**, thêm kho rồi cài từng plugin mong muốn.

LeafBook tự tìm `leafbook-plugins.json`, hiển thị toàn bộ plugin và xác minh SHA-256 trước khi cài.
Các lần sau, dùng **Kiểm tra cập nhật plugin** để tải lại catalog và cập nhật plugin có phiên bản mới.

## Phát triển

```powershell
git clone git@github.com:hongducdev/hongducdev-leafbook-plugin.git
cd hongducdev-leafbook-plugin
node tests/openlibrary.test.js
node tests/vnexpress.test.js
```

Sau khi sửa hoặc thêm script, cập nhật toàn bộ hash:

```powershell
node update-hash.js
```

## Cấu trúc

```text
leafbook-plugin/
├── assets/
│   └── leafbook-icon.png
├── plugins/
│   ├── openlibrary.js
│   └── vnexpress.js
├── tests/
│   ├── openlibrary.test.js
│   └── vnexpress.test.js
├── leafbook-plugins.json
├── update-hash.js
├── LICENSE
└── README.md
```

## Giấy phép

Phát hành theo [MIT License](LICENSE).
