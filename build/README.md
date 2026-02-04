# Build Assets

## Icons Required

Đặt icon của bạn vào thư mục này với các format sau:

### Windows
- `icon.ico` - 256x256px hoặc 512x512px
- `installerHeader.bmp` - 150x57px (optional)
- `installerSidebar.bmp` - 164x314px (optional)

### macOS
- `icon.icns` - Multi-resolution icon file
- `entitlements.mac.plist` - Entitlements for code signing

### Linux
- `icons/` folder with multiple PNG sizes (16x16, 32x32, 48x48, 64x64, 128x128, 256x256, 512x512)

## Tools để Tạo Icon

### Online Tools
- [ICO Converter](https://www.icoconverter.com/) - Tạo .ico từ PNG
- [CloudConvert](https://cloudconvert.com/png-to-icns) - Tạo .icns cho macOS

### Command Line
```bash
# Tạo icon.ico từ PNG (cần ImageMagick)
magick convert icon.png -define icon:auto-resize=256,128,96,64,48,32,16 icon.ico

# Tạo icon.icns cho macOS (trên macOS)
mkdir icon.iconset
sips -z 16 16     icon.png --out icon.iconset/icon_16x16.png
sips -z 32 32     icon.png --out icon.iconset/icon_16x16@2x.png
sips -z 32 32     icon.png --out icon.iconset/icon_32x32.png
sips -z 64 64     icon.png --out icon.iconset/icon_32x32@2x.png
sips -z 128 128   icon.png --out icon.iconset/icon_128x128.png
sips -z 256 256   icon.png --out icon.iconset/icon_128x128@2x.png
sips -z 256 256   icon.png --out icon.iconset/icon_256x256.png
sips -z 512 512   icon.png --out icon.iconset/icon_256x256@2x.png
sips -z 512 512   icon.png --out icon.iconset/icon_512x512.png
sips -z 1024 1024 icon.png --out icon.iconset/icon_512x512@2x.png
iconutil -c icns icon.iconset
```

## Lưu Ý

- Nếu không có icon, electron-builder sẽ dùng icon mặc định của Electron
- Để bỏ qua icon trong build, xóa dòng `icon:` trong `electron-builder.yml`
- Icon nên là hình vuông với nền trong suốt (PNG/SVG)
