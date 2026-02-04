# Hướng dẫn Tự động Cập nhật (Auto-Update) cho Tool Live

Tài liệu này mô tả cách **thiết lập, phát hành và xác minh** auto-update cho ứng dụng **Tool Live** bằng **GitHub Releases** + `electron-updater`.

> Phạm vi: **Windows** (NSIS installer). macOS/Linux nằm ngoài phạm vi tài liệu này.

---

## 1) Quy trình hoạt động (end-to-end)

1. **Version**: Bạn tăng version trong `package.json` (ví dụ: `1.0.2`).
2. **Tag**: Bạn tạo tag `v1.0.2` và push lên GitHub.
3. **CI Build**: GitHub Actions build bản Windows và publish lên GitHub Releases.
4. **Release Assets**: Release chứa file cài đặt + `latest.yml`.
5. **Auto-Update**: App (đã cài bản cũ) tự kiểm tra update, tải về, và hiển thị nút **Restart & Install**.

---

## 2) Preflight Checklist (bắt buộc)

- **Version phải tăng dần (monotonic)**: Version mới **phải lớn hơn** version đã release trước đó. Nếu giảm version, auto-update sẽ **không bao giờ** cập nhật được.
- **Repo publish đúng**: `package.json > build.publish` phải trỏ đúng `owner/repo`.
- **Release assets đầy đủ**: Release phải có `latest.yml` (electron-updater dùng file này để kiểm tra).
- **Dùng NSIS installer**: Auto-update **chỉ hoạt động** với target **NSIS**. Bản `portable` **không hỗ trợ** auto-update.

---

## 3) Cấu hình trong codebase (đã có)

Các phần sau đã được tích hợp sẵn:

- `electron/main.ts` gọi `autoUpdater.checkForUpdatesAndNotify()` khi app chạy ở production.
- Lắng nghe `update-available` và `update-downloaded`, gửi IPC sang renderer.
- UI thông báo và nút **Restart & Install** nằm ở `src/components/UpdateNotification.tsx`.

---

## 4) Thiết lập GitHub Actions

### 4.1. Cấp quyền cho GITHUB_TOKEN (Khuyên dùng)

1. Vào **Settings** > **Actions** > **General**.
2. **Workflow permissions** → chọn **Read and write permissions**.
3. **Save**.

Token `secrets.GITHUB_TOKEN` sẽ tự động có sẵn trong workflow.

### 4.2. Khi nào cần PAT (GH_TOKEN)?

Chỉ cần PAT nếu bạn **publish sang repo khác** (ví dụ repo public riêng). Khi đó:
- Tạo PAT (Classic) với quyền `repo` + `workflow`.
- Lưu vào GitHub Secrets với tên `GH_TOKEN`.
- Dùng `GITHUB_TOKEN: ${{ secrets.GH_TOKEN }}` trong workflow.

---

## 5) Workflow release (GitHub Actions)

Tạo file: `.github/workflows/release.yml`

```yaml
name: Build/Release

on:
  push:
    tags:
      - 'v*'

jobs:
  release:
    runs-on: windows-latest

    steps:
      - name: Check out repository
        uses: actions/checkout@v4

      - name: Install Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build and Publish (Windows)
        run: npm run package:win
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

> Lưu ý: `electron-builder` sẽ publish lên GitHub Releases dựa vào cấu hình `build.publish` trong `package.json`.

---

## 6) Cách phát hành phiên bản mới

1. **Tăng version** trong `package.json` (ví dụ `1.0.2`).
2. **Commit** thay đổi:
   ```bash
   git add package.json
   git commit -m "chore: bump version 1.0.2"
   ```
3. **Tạo tag**:
   ```bash
   git tag v1.0.2
   ```
4. **Push**:
   ```bash
   git push origin main --tags
   ```

GitHub Actions sẽ tự build và publish release.

---

## 7) Xác minh auto-update trên Windows

1. Cài bản **cũ** (ví dụ `1.0.1`).
2. Release bản **mới** (ví dụ `1.0.2`).
3. Mở app cũ → hệ thống sẽ báo **New Version Available**.
4. Chờ download xong → nút **Restart & Install** xuất hiện.
5. App khởi động lại và cập nhật lên bản mới.

---

## 8) Troubleshooting

- **Không thấy update**:
  - Kiểm tra version đã **tăng** chưa.
  - Đảm bảo release có file `latest.yml`.
  - Đảm bảo bạn đang dùng bản **NSIS installer** (không phải portable).

- **Lỗi 404 / No release found**:
  - Repo release phải public hoặc dùng token/flow phù hợp.
  - Kiểm tra `build.publish` trỏ đúng `owner/repo`.

- **Không có workflow chạy**:
  - Chỉ chạy khi push tag `v*`.
  - Kiểm tra `.github/workflows/release.yml` có trong repo.

---

## 9) Ghi chú về macOS

Auto-update trên macOS yêu cầu **code signing** + **notarization**. Phần này nằm ngoài phạm vi hướng dẫn Windows-only hiện tại.
