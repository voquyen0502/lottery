# 🎰 Lottery Checker - Dò Vé Số Thông Minh

Ứng dụng web dò vé số hoàn toàn chạy phía client, tối ưu cho iOS (iPhone & iPad), sử dụng AI để phân tích tin nhắn và tự động dò số.

## ✨ Tính năng

- 🤖 **Phân tích tin nhắn với Gemini AI**: Tự động trích xuất đài xổ số và các số cần dò
- 📊 **Lấy kết quả từ xoso.me**: Hiển thị đầy đủ các giải thưởng
- ✅ **Dò số thông minh**: 
  - Trùng khớp toàn bộ
  - Trùng 2 số cuối
  - Trùng 3 số cuối
- 📜 **Lịch sử tìm kiếm**: Lưu 3 truy vấn gần nhất
- 📱 **Tối ưu cho mobile**: 
  - Touch-friendly buttons
  - Responsive design
  - Safari iOS optimized
- 🎨 **UI đẹp mắt**: 
  - TailwindCSS
  - Framer Motion animations
  - Card-based layout

## 🚀 Cài đặt

### Prerequisites

- Node.js 16+ và npm

### Bước 1: Clone hoặc tải về project

```bash
git clone <your-repo-url>
cd lottery-checker
```

### Bước 2: Cài đặt dependencies

```bash
npm install
```

### Bước 3: Cấu hình Gemini API Key

Mở file `src/utils/gemini.js` và thay thế API key:

```javascript
const API_KEY = 'YOUR_GEMINI_API_KEY_HERE';
```

**Lấy Gemini API key:**
1. Truy cập https://makersuite.google.com/app/apikey
2. Đăng nhập với Google account
3. Tạo API key mới
4. Copy và paste vào `gemini.js`

### Bước 4: Chạy development server

```bash
npm run dev
```

Mở trình duyệt tại `http://localhost:5173`

## 📦 Build cho production

```bash
npm run build
```

Thư mục `dist/` sẽ chứa các file tĩnh sẵn sàng deploy.

## 🌐 Deploy

### Deploy lên GitHub Pages

1. Cài đặt `gh-pages`:
```bash
npm install -D gh-pages
```

2. Thêm vào `package.json`:
```json
{
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  },
  "homepage": "https://<username>.github.io/<repo-name>"
}
```

3. Cập nhật `vite.config.js`:
```javascript
export default defineConfig({
  base: '/<repo-name>/',
  plugins: [react()],
})
```

4. Deploy:
```bash
npm run deploy
```

### Deploy lên Netlify

1. Build project:
```bash
npm run build
```

2. Kéo thả thư mục `dist/` vào https://app.netlify.com/drop

Hoặc dùng Netlify CLI:
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

## 🎯 Cách sử dụng

1. **Nhập tin nhắn** (VD: "Đài Đồng Nai, dò số 12345, 67890")
2. **Chọn ngày** quay số (mặc định: hôm nay)
3. **Phân tích với Gemini** để trích xuất thông tin
4. **Lấy kết quả & Dò** để xem kết quả xổ số và kiểm tra số
5. Xem **lịch sử** để load lại các truy vấn trước

## 🛠️ Tech Stack

- **React 19**: UI framework
- **TailwindCSS**: Styling
- **Framer Motion**: Animations
- **Vite**: Build tool
- **Google Generative AI SDK**: Gemini API
- **minhngoc.net.vn**: Lottery results source (via web scraping)
- **allorigins.win**: CORS proxy for client-side scraping

## 📱 Mobile Optimization

- Touch-friendly buttons với padding lớn
- `touch-manipulation` CSS cho response nhanh
- Viewport meta tags cho iOS Safari
- Apple web app capable
- Responsive breakpoints cho iPhone/iPad

## ⚠️ Lưu ý

- **API Key bảo mật**: Trong production, nên dùng backend proxy để ẩn API key
- **CORS Proxy**: App sử dụng allorigins.win để bypass CORS khi crawl minhngoc.net.vn
  - App tự động thử 3 proxy khác nhau nếu có lỗi
  - Xem [CORS_TROUBLESHOOTING.md](./CORS_TROUBLESHOOTING.md) nếu gặp vấn đề
- **Tên đài**: Phải đúng format (vd: `dong-nai`, `tp-hcm`, `da-nang`, `ha-noi`)
- **Web Scraping**: Kết quả crawl từ minhngoc.net.vn, có thể bị ảnh hưởng nếu site thay đổi cấu trúc
- **Danh sách đài hỗ trợ**: Xem [STATIONS.md](./STATIONS.md) để biết các đài có sẵn

## 📄 License

MIT

## 🤝 Contributing

Pull requests are welcome!

---

Made with ❤️ for Vietnamese lottery players

