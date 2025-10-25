# 📝 Hướng dẫn đổi tên và icon app

## 🎯 Mục tiêu
- Đổi tên app hiển thị khi chạy
- Đổi icon app trên Windows
- Build lại app với tên và icon mới

---

## 📋 Các bước thực hiện

### **Bước 1: Đổi tên app**

Mở file `package.json` và thay đổi các giá trị sau:

```json
{
  "name": "tool-live",           // ← Tên package (không dấu, lowercase)
  "description": "...",           // ← Mô tả app
  "build": {
    "appId": "com.tool-live.app", // ← App ID (format: com.yourname.appname)
    "productName": "Tool Live"    // ← Tên hiển thị (có thể có dấu cách)
  }
}
```

**Ví dụ đổi tên:**

```json
{
  "name": "youtube-viewer-bot",
  "description": "YouTube Livestream Viewer Management Tool",
  "build": {
    "appId": "com.khiempham.ytviewer",
    "productName": "YT Viewer Pro"
  }
}
```

### **Bước 2: Đổi tên trong script package**

Trong `package.json`, tìm dòng:

```json
"package:win-portable": "npm run build && electron-packager . \"Tool Live\" ..."
```

Thay `"Tool Live"` thành tên mới của bạn:

```json
"package:win-portable": "npm run build && electron-packager . \"YT Viewer Pro\" ..."
```

---

### **Bước 3: Tạo icon cho app**

#### **3.1. Thiết kế icon**

- Kích thước khuyến nghị: **256x256 pixels**
- Format: PNG hoặc JPG trước, sau đó convert sang `.ico`
- Thiết kế đơn giản, dễ nhìn ở kích thước nhỏ

**Tools thiết kế miễn phí:**
- Canva: https://www.canva.com
- Figma: https://www.figma.com
- Photopea (online Photoshop): https://www.photopea.com

#### **3.2. Convert sang .ico**

Sau khi có file PNG, convert sang `.ico` tại:
- https://convertio.co/png-ico/
- https://icoconvert.com/
- https://cloudconvert.com/png-to-ico

**Cấu hình convert:**
- Chọn "Include multiple sizes": ✅
- Sizes: 16, 32, 48, 64, 128, 256

#### **3.3. Đặt file icon vào project**

Đổi tên file thành `icon.ico` và copy vào thư mục:
```
tool-live/
  └── build/
      └── icon.ico  ← Đặt file vào đây
```

**PowerShell command:**
```powershell
# Giả sử file icon của bạn ở Desktop
Copy-Item "$env:USERPROFILE\Desktop\my-icon.ico" "c:\Users\Public\Code working\tool-live\build\icon.ico"
```

---

### **Bước 4: Build app với tên và icon mới**

Chạy lệnh build:

```powershell
npm run build
npm run package:win-portable
```

**Output:**
```
release/
  └── [Tên App Mới]-win32-x64/
      └── [Tên App Mới].exe  ← App của bạn với icon mới
```

---

## 🎨 Ví dụ hoàn chỉnh

### Đổi tên từ "Tool Live" → "Stream Booster"

**1. Sửa package.json:**

```json
{
  "name": "stream-booster",
  "productName": "Stream Booster",
  "description": "Professional YouTube Stream Viewer Manager",
  "build": {
    "appId": "com.khiempham.streambooster",
    "productName": "Stream Booster"
  },
  "scripts": {
    "package:win-portable": "npm run build && electron-packager . \"Stream Booster\" --platform=win32 --arch=x64 --out=release --overwrite --icon=build/icon.ico"
  }
}
```

**2. Đặt icon:**
```
build/icon.ico  ← File icon của bạn
```

**3. Build:**
```powershell
npm run package:win-portable
```

**4. Kết quả:**
```
release/Stream Booster-win32-x64/Stream Booster.exe
```

---

## ✅ Checklist

- [ ] Đổi `name` trong package.json
- [ ] Đổi `productName` trong package.json
- [ ] Đổi `appId` trong package.json
- [ ] Đổi tên trong script `package:win-portable`
- [ ] Tạo file icon.ico (256x256)
- [ ] Đặt icon.ico vào thư mục `build/`
- [ ] Chạy `npm run build`
- [ ] Chạy `npm run package:win-portable`
- [ ] Test app mới

---

## 🔧 Troubleshooting

### Icon không hiển thị?
- Kiểm tra file `build/icon.ico` có tồn tại không
- Xóa thư mục `release/` và build lại
- Icon cần có multiple sizes (16, 32, 48, 64, 128, 256)

### Tên app không đổi?
- Kiểm tra đã sửa cả `productName` và script `package:win-portable`
- Xóa cache: `npm run clean` (nếu có)
- Build lại từ đầu

### App không chạy sau khi build?
- Kiểm tra không có lỗi trong terminal khi build
- Chạy `npm run dev` trước để test code
- Kiểm tra file `main.js` trong `dist/electron/`

---

## 📞 Support

Nếu gặp vấn đề, kiểm tra:
1. Console log khi build
2. File `package.json` có đúng format JSON không
3. Đường dẫn file icon có đúng không

Made by Khiem Pham ❤️
