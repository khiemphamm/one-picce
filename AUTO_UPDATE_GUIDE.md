# Hướng dẫn Tự động Cập nhật & GitHub CI/CD

Hướng dẫn này giải thích cách thiết lập và quản lý các bản cập nhật tự động cho ứng dụng **Tool Live** bằng GitHub Releases.

## 🚀 Quy trình hoạt động
1.  **Code**: `electron-updater` sẽ kiểm tra GitHub để xem có phiên bản nào mới hơn phiên bản hiện tại trong `package.json` không.
2.  **Release**: Bạn push một "tag" phiên bản mới (ví dụ: `v1.0.1`) lên GitHub.
3.  **Build**: GitHub Actions sẽ tự động build ứng dụng cho Windows và macOS.
4.  **Deploy**: GitHub Actions tự động upload các bản cài đặt lên trang "Releases" của GitHub.
5.  **Update**: Người dùng đang chạy app sẽ nhận được thông báo và có thể cài đặt bản cập nhật ngay lập tức.

---

## � GITHUB_TOKEN lấy ở đâu?

Có hai cách để sử dụng token:

### Cách 1: Sử dụng Token tự động (Khuyên dùng)
GitHub Actions đã có sẵn một token gọi là `secrets.GITHUB_TOKEN`. Bạn không cần phải copy nó từ đâu cả. Tuy nhiên, bạn cần cấp quyền cho nó:
1.  Vào repository của bạn trên GitHub.
2.  Chọn **Settings** > **Actions** > **General**.
3.  Cuộn xuống phần **Workflow permissions**.
4.  Chọn **Read and write permissions** (Quyền đọc và ghi).
5.  Nhấn **Save**.
*Token này sẽ tự động được sử dụng trong file workflow mà tôi đã tạo.*

### Cách 2: Sử dụng Personal Access Token (PAT)
Nếu bạn muốn dùng token riêng cho nhiều việc khác:
1.  Vào [GitHub Settings > Tokens](https://github.com/settings/tokens).
2.  Chọn **Generate new token (classic)**.
3.  Chọn quyền `repo` và `workflow`.
4.  Copy token và dán vào **Settings > Secrets and variables > Actions > New repository secret** với tên là `GH_TOKEN`.

---

## 🤖 Thiết lập GitHub Actions

Tệp tin tại `.github/workflows/release.yml` đã được tôi tạo sẵn với nội dung:

```yaml
name: Build/Release

on:
  push:
    tags:
      - 'v*' # Chạy khi bạn push tag (ví dụ: v1.0.0)

jobs:
  release:
    runs-on: ${{ matrix.os }}

    strategy:
      matrix:
        os: [windows-latest, macos-latest]

    steps:
      - name: Check out git repository
        uses: actions/checkout@v4

      - name: Install Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build and Release
        run: npm run package
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

---

## 📦 Cách push bản cập nhật mới

Mỗi khi bạn muốn ra mắt phiên bản mới:

1.  **Cập nhật Version**: Đổi version trong `package.json` (ví dụ: `"version": "1.0.1"`).
2.  **Commit thay đổi**:
    ```bash
    git add .
    git commit -m "feat: cập nhật phiên bản 1.0.1"
    ```
3.  **Tạo Tag**:
    ```bash
    git tag v1.0.1
    ```
4.  **Push lên GitHub**:
    ```bash
    git push origin main --tags
    ```

GitHub Actions sẽ tự động làm phần việc còn lại!

---

## 💻 Lưu ý về macOS
Để tính năng tự động cập nhật hoạt động trên macOS, ứng dụng cần phải được **Code Signed** (Ký số) bằng chứng chỉ Apple Developer. Nếu không có chứng chỉ, người dùng macOS sẽ phải tải bản cài đặt mới thủ công từ GitHub.

---

## ❓ Xử lý lỗi
- **Lỗi: 404 No release found**: Kiểm tra xem Repo đã để ở chế độ Công khai (Public) chưa, hoặc Token đã được cấp quyền "Read and write" chưa.
- **Không thấy cập nhật**: Đảm bảo phiên bản trong `package.json` **cao hơn** phiên bản đang cài trên máy.
