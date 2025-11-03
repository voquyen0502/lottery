# 🚀 Quick Start Guide

## 1. Cài đặt dependencies
```bash
npm install
```

## 2. Cấu hình Gemini API Key

**QUAN TRỌNG:** Bạn cần API key từ Google để sử dụng tính năng phân tích với AI.

### Lấy API Key:
1. Truy cập: https://makersuite.google.com/app/apikey
2. Đăng nhập với Google account
3. Click "Create API key"
4. Copy API key

### Cấu hình:
Mở file `src/utils/gemini.js` và thay thế dòng:
```javascript
const API_KEY = 'YOUR_GEMINI_API_KEY_HERE';
```

Thành:
```javascript
const API_KEY = 'your_actual_api_key_here';
```

## 3. Chạy app
```bash
npm run dev
```

Mở trình duyệt tại: http://localhost:5173

## 4. Sử dụng

### Cách 1: Phân tích với Gemini (Khuyến nghị)
1. Nhập tin nhắn tiếng Việt, ví dụ:
   ```
   Đài Đồng Nai, dò số 12345, 67890
   ```
2. Chọn ngày (mặc định: hôm nay)
3. Click "🤖 Phân tích với Gemini"
4. Click "📊 Lấy kết quả & Dò"

### Cách 2: Nhập thủ công
1. Nhập đúng format đài (vd: dong-nai, tp-hcm, da-nang)
2. Nhập các số cần dò
3. Click "📊 Lấy kết quả & Dò"

## 5. Tính năng

✅ Phân tích tin nhắn tự động với AI  
✅ Lấy kết quả xổ số real-time  
✅ Dò số với 3 kiểu trùng:
   - Trùng khớp toàn bộ
   - Trùng 3 số cuối
   - Trùng 2 số cuối  
✅ Lịch sử 3 truy vấn gần nhất  
✅ Mobile-first, tối ưu cho iOS

## 🏗️ Build cho production

```bash
npm run build
```

File output sẽ ở thư mục `dist/`

## 📱 Test trên mobile

1. Tìm IP của máy tính:
   ```bash
   ipconfig
   ```
2. Chạy dev server:
   ```bash
   npm run dev -- --host
   ```
3. Trên điện thoại, mở: `http://YOUR_IP:5173`

## ⚠️ Troubleshooting

### Lỗi Gemini API
- Kiểm tra API key đã đúng chưa
- Kiểm tra có internet không
- API key có bị giới hạn usage không

### Lỗi xoso.me API
- Kiểm tra tên đài đúng format (viết thường, có dấu gạch ngang)
- Ví dụ: `dong-nai`, `tp-hcm`, `da-nang`, `ha-noi`
- Kiểm tra ngày có hợp lệ không
- App hiện crawl từ minhngoc.net.vn thông qua CORS proxy

### Lỗi CORS
- App sử dụng allorigins.win làm CORS proxy miễn phí
- Nếu proxy chậm hoặc lỗi, có thể thay bằng proxy khác trong `src/utils/xoso.js`
- Proxy alternatives: `https://corsproxy.io/?`, `https://cors-anywhere.herokuapp.com/`

## 📞 Support

Nếu gặp vấn đề, tạo issue trên GitHub repo.

---

Happy lottery checking! 🎰
