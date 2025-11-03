# 🔧 Hướng dẫn xử lý lỗi CORS

## Vấn đề
Khi crawl dữ liệu từ minhngoc.net.vn, có thể gặp lỗi:
- `408 Request Timeout` 
- `CORS policy` errors
- Proxy không phản hồi

## Giải pháp

### 1. App tự động thử 3 proxy khác nhau
App sẽ tự động thử lần lượt các proxy:
1. corsproxy.io (nhanh nhất)
2. allorigins.win (ổn định)
3. codetabs.com (backup)

Thời gian timeout: **10 giây** cho mỗi proxy.

### 2. Nếu tất cả proxy đều fail

#### Option A: Sử dụng Extension Browser
Cài đặt extension để bypass CORS:
- **Chrome/Edge**: [CORS Unblock](https://chrome.google.com/webstore/detail/cors-unblock)
- **Firefox**: [CORS Everywhere](https://addons.mozilla.org/en-US/firefox/addon/cors-everywhere/)

#### Option B: Chạy local CORS proxy (Khuyến nghị cho dev)

1. Cài đặt cors-anywhere:
```bash
npm install -g cors-anywhere
```

2. Chạy proxy local:
```bash
cors-anywhere
```

3. Cập nhật `src/utils/xoso.js`:
```javascript
const CORS_PROXIES = [
  (url) => `http://localhost:8080/${url}`, // Local proxy
  (url) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
  // ... other proxies
];
```

#### Option C: Deploy proxy riêng (Production)

Deploy CORS proxy của riêng bạn lên:
- Heroku
- Vercel
- Railway

Code mẫu: https://github.com/Rob--W/cors-anywhere

### 3. Thay đổi proxy trong code

Mở `src/utils/xoso.js` và thêm proxy mới vào array:

```javascript
const CORS_PROXIES = [
  (url) => `https://your-proxy.com/?url=${encodeURIComponent(url)}`,
  // ... existing proxies
];
```

### 4. Tăng timeout

Nếu mạng chậm, tăng timeout trong `xoso.js`:

```javascript
signal: AbortSignal.timeout(20000), // 20 giây thay vì 10
```

## Tips
- ✅ Proxy 1 (corsproxy.io) thường nhanh nhất
- ✅ Thử lại sau vài phút nếu fail
- ✅ Kiểm tra internet connection
- ✅ Thử browser khác (Chrome/Firefox)
- ✅ Disable adblocker tạm thời

## Danh sách proxy alternatives
```
https://corsproxy.io/?URL
https://api.allorigins.win/raw?url=URL
https://api.codetabs.com/v1/proxy?quest=URL
https://cors-anywhere.herokuapp.com/URL (cần request access)
https://thingproxy.freeboard.io/fetch/URL
```

Thay `URL` bằng URL thực tế (encoded).
