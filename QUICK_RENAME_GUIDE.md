# Quick Guide: Đổi tên & Icon app

## 1️⃣ Đổi tên app

Mở `package.json`, tìm và sửa:

```json
{
  "build": {
    "productName": "Tool Live"  // ← Đổi thành tên bạn muốn
  },
  "scripts": {
    "package:win-portable": "... electron-packager . \"Tool Live\" ..."
                                                     // ↑ Đổi tên ở đây nữa
  }
}
```

## 2️⃣ Thêm icon

1. Tạo icon (.ico) - kích thước 256x256
   - Dùng tool online: https://convertio.co/png-ico/
   
2. Đặt vào thư mục `build/icon.ico`

3. Build lại:
```bash
npm run package:win-portable
```

## ✅ Done!
App mới sẽ ở: `release/[Tên Mới]-win32-x64/[Tên Mới].exe`
