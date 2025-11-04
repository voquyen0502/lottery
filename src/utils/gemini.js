import { GoogleGenAI } from '@google/genai';

// Get API key from environment variable
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

const ai = new GoogleGenAI({ apiKey: API_KEY });

export async function parseMessageWithGemini(message, date = null) {
  try {
    // Preprocess message: replace newlines with spaces
    const cleanedMessage = message.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
    
    // Format date for prompt
    const dateInfo = date ? new Date(date).toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'Không có thông tin ngày';
    console.log('Parsing message with Gemini:', cleanedMessage, 'Date:', dateInfo);
    const prompt = `Phân tích tin nhắn xổ số tiếng Việt và trích xuất thông tin chi tiết về các cược.
Trả về CHỈ một JSON object với format sau (không có markdown, không có giải thích):
{
  "bet_list": [
    {
      "station": ["tên-đài-1", "tên-đài-2"],
      "region": "mien-nam/mien-trung/mien-bac",
      "type": "xiu-chu/xien/bao-lo/7-lo/na",
      "numbers": ["số1", "số2"],
      "money": số_tiền,
      "note": "ghi chú nếu có"
    }
  ]
}

Tin nhắn: "${cleanedMessage}"
Ngày: ${dateInfo}

════════════════════════════════════════════════════════════════════
QUY TẮC PHÂN TÍCH MÃ CƯỢC:
════════════════════════════════════════════════════════════════════

1. MÃ ĐÀI (Station Codes):
   ├─ "BP" → "binh-phuoc"      ├─ "VT" → "vung-tau"        ├─ "HG" → "hau-giang"
   ├─ "CT" → "can-tho"          ├─ "DN" → "dong-nai"        ├─ "CM" → "ca-mau"
   ├─ "BT" → "ben-tre"          ├─ "TG" → "tien-giang"      ├─ "TP" → "tp-hcm"
   ├─ "BL" → "bac-lieu"         ├─ "ST" → "soc-trang"       ├─ "TN" → "tay-ninh"
   ├─ "AG" → "an-giang"         ├─ "BTH" → "binh-thuan"     ├─ "VL" → "vinh-long"
   ├─ "BD" → "binh-duong"       ├─ "TV" → "tra-vinh"        ├─ "LA" → "long-an"
   ├─ "KG" → "kien-giang"       ├─ "DL" → "da-lat"          ├─ "ĐT" → "dong-thap"
   ├─ "DN" (trung) → "da-nang"  ├─ "KH" → "khanh-hoa"      ├─ "BĐ" → "binh-dinh"
   ├─ "QT" → "quang-tri"        ├─ "QB" → "quang-binh"     ├─ "GL" → "gia-lai"
   ├─ "NT" → "ninh-thuan"       ├─ "QNM" → "quang-nam"     ├─ "ĐL" → "dak-lak"
   ├─ "QNG" → "quang-ngai"      ├─ "ĐNO" → "dak-nong"      ├─ "KT" → "kon-tum"
   ├─ "H" → "thua-thien-hue"    ├─ "PY" → "phu-yen"        
   ├─ "HN" → "ha-noi"           ├─ "QN" → "quang-ninh"     ├─ "BN" → "bac-ninh"
   └─ "HP" → "hai-phong"        └─ "NĐ" → "nam-dinh"       └─ "TB" → "thai-binh"

   * Nhiều đài: "BP+HG" → ["binh-phuoc", "hau-giang"], "2đ tpla" → ["tp-hcm", "long-an"]
   * Tên đầy đủ: "Hậu Giang" → ["hau-giang"]
   
   ★ ĐẶC BIỆT - "2đ", "3đ", "4đ"... KHÔNG CÓ TÊN ĐÀI:
   Nếu chỉ có số đài mà không chỉ rõ tên (VD: "2đ.399.b1n", "3đ mt"), sử dụng NGÀY và MIỀN 
   để xác định các đài đầu tiên:
   
   CÚ PHÁP MIỀN:
   ├─ Không có mã miền → MẶC ĐỊNH MIỀN NAM
   ├─ "mn" → miền nam
   ├─ "mt" → miền trung  
   └─ "mb" → miền bắc
   
   VD: "2đ" = 2 đài đầu miền nam
       "3đ mt" = 3 đài đầu miền trung
       "4đ mb" = 4 đài đầu miền bắc (nhưng miền bắc chỉ có 1 đài/ngày nên lấy 1)
   
   LỊCH XỔ SỐ MIỀN NAM (theo thứ trong tuần):
   ┌─────────────┬──────────────────────────────────────────────────┐
   │ Thứ Hai     │ TP.HCM, Đồng Tháp, Cà Mau                        │
   │ Thứ Ba      │ Bến Tre, Vũng Tàu, Bạc Liêu                      │
   │ Thứ Tư      │ Đồng Nai, Cần Thơ, Sóc Trăng                     │
   │ Thứ Năm     │ Tây Ninh, An Giang, Bình Thuận                   │
   │ Thứ Sáu     │ Vĩnh Long, Bình Dương, Trà Vinh                  │
   │ Thứ Bảy     │ TP.HCM, Long An, Bình Phước, Hậu Giang           │
   │ Chủ Nhật    │ Tiền Giang, Kiên Giang, Đà Lạt                   │
   └─────────────┴──────────────────────────────────────────────────┘
   
   LỊCH XỔ SỐ MIỀN TRUNG (theo thứ trong tuần):
   ┌─────────────┬──────────────────────────────────────────────────┐
   │ Thứ Hai     │ Thừa Thiên Huế, Phú Yên                          │
   │ Thứ Ba      │ Đắk Lắk, Quảng Nam                               │
   │ Thứ Tư      │ Đà Nẵng, Khánh Hòa                               │
   │ Thứ Năm     │ Bình Định, Quảng Trị, Quảng Bình                 │
   │ Thứ Sáu     │ Gia Lai, Ninh Thuận                              │
   │ Thứ Bảy     │ Đà Nẵng, Quảng Ngãi, Đắk Nông                    │
   │ Chủ Nhật    │ Khánh Hòa, Kon Tum, Thừa Thiên Huế               │
   └─────────────┴──────────────────────────────────────────────────┘
   
   LỊCH XỔ SỐ MIỀN BẮC:
   ┌─────────────┬──────────────────────────────────────────────────┐
   │ Mỗi ngày    │ Chỉ có 1 kết quả chung cho cả miền               │
   └─────────────┴──────────────────────────────────────────────────┘
   
   → "2đ" = 2 đài ĐẦU TIÊN của ngày đó (miền nam)
   → "3đ mt" = 3 đài đầu tiên miền trung của ngày đó
   → "mb" = miền bắc (chỉ 1 kết quả)
   
   VD: 
   - Thứ Bảy, "2đ" → ["tp-hcm", "long-an"] (miền nam)
   - Thứ Bảy, "3đ mt" → ["da-nang", "quang-ngai", "dak-nong"] (miền trung)
   - Thứ Hai, "3đ" → ["tp-hcm", "dong-thap", "ca-mau"] (miền nam - mặc định)

2. MÃ LOẠI CƯỢC (Bet Type Codes):
   ├─ "dx", "đx" hoặc "đa" → "xien" (đánh xiên 2-4 số)
   ├─ "b" → "bao-lo" (bao lô)
   ├─ "7lo" → "7-lo" (7 lô)
   └─ "xc" → "xiu-chu" (xỉu chủ)

3. MÃ SỐ TIỀN (Money Codes):
   ⚠️ BẢNG CHUYỂN ĐỔI (ĐỌC KỸ):
   ┌──────┬─────────┐
   │ "1n" │  1000   │ ← 1 ngàn = 1000
   │ "2n" │  2000   │
   │ "3n" │  3000   │
   │ "4n" │  4000   │
   │ "5n" │  5000   │
   │ "10n"│ 10000   │
   │ "20n"│ 20000   │
   └──────┴─────────┘
   
   Quy tắc:
   ├─ Số + "n" → x1000 (nhân 1000)
   ├─ Số + "k" → x1000 (VD: "5k" = 5000)
   ├─ Số thuần → giá trị gốc (VD: "20000" = 20000)
   └─ Mặc định: 10000 nếu không có

4. CẤU TRÚC CHUỖI CƯỢC:
   Format: "<đài>.<số> <số> <số>.<mã_loại><số_tiền>"
   
   ★ QUY TẮC NHÓM SỐ:
   - Các số TRƯỚC dấu chấm hoặc trước mã loại cược CÙNG THUỘC 1 NHÓM
   - VD: "39.24.b5n" → numbers: ["39", "24"] (2 số cùng nhóm)
   - VD: "52 92.b2n" → numbers: ["52", "92"] (2 số cùng nhóm)
   - VD: "52 24 56 b10n" → numbers: ["52", "24", "56"] (3 số cùng nhóm)
   - Mã loại cược ÁP DỤNG cho TẤT CẢ các số trong nhóm đó
   
   ★ QUY TẮC "2đ", "3đ":
   - "2đ" = LẤY 2 ĐÀI ĐẦU TIÊN (không phải 3 đài)
   - "3đ" = LẤY 3 ĐÀI ĐẦU TIÊN
   - "4đ" = LẤY 4 ĐÀI ĐẦU TIÊN
   
   VÍ DỤ PHÂN TÍCH:
   ┌─────────────────────────────────────────────────────────────┐
   │ "BP+HG.70 34.dx4n"                                          │
   │  ↓                                                          │
   │  station: ["binh-phuoc", "hau-giang"]                      │
   │  numbers: ["70", "34"]  ← 2 số cùng nhóm                   │
   │  type: "xien" (từ "dx")                                    │
   │  money: 4000 (từ "4n")                                     │
   └─────────────────────────────────────────────────────────────┘
   
   ┌─────────────────────────────────────────────────────────────┐
   │ "2đ.39.24.b5n.dx5n"                                        │
   │  ↓                                                          │
   │  Cược 1: station: 2 đài đầu (ví dụ ["tp-hcm", "dong-thap"])│
   │          numbers: ["39", "24"]  ← 2 số cùng nhóm           │
   │          type: "bao-lo", money: 5000                       │
   │  Cược 2: station: 2 đài đầu (ví dụ ["tp-hcm", "dong-thap"])│
   │          numbers: ["39", "24"]  ← CÙNG 2 số                │
   │          type: "xien", money: 5000                         │
   └─────────────────────────────────────────────────────────────┘
   
   ┌─────────────────────────────────────────────────────────────┐
   │ "BP.70.b5n.470.b1n.7lo3n.xc20n"                            │
   │  ↓  ↓   ↓   ↓    ↓    ↓     ↓                             │
   │  BP 70  b   470  b    7lo   xc (4 cược khác nhau)         │
   │                                                             │
   │  Cược 1: station: ["binh-phuoc"], numbers: ["70"],        │
   │          type: "bao-lo", money: 5000                       │
   │  Cược 2: station: ["binh-phuoc"], numbers: ["470"],       │
   │          type: "bao-lo", money: 1000                       │
   │  Cược 3: station: ["binh-phuoc"], numbers: ["470"],       │
   │          type: "7-lo", money: 3000                         │
   │  Cược 4: station: ["binh-phuoc"], numbers: ["470"],       │
   │          type: "xiu-chu", money: 20000                     │
   └─────────────────────────────────────────────────────────────┘
   
   ┌─────────────────────────────────────────────────────────────┐
   │ "25 75 56 66 dx1n" ← CHỈ có "dx", KHÔNG có "b"            │
   │  ↓                                                          │
   │  Cược 1: numbers: ["25", "75", "56", "66"]                │
   │          type: "xien", money: 1000                         │
   │                                                             │
   │  ⚠️ KHÔNG tạo bet bao-lo vì không có chữ "b" trong input! │
   └─────────────────────────────────────────────────────────────┘

5. VÙNG MIỀN (Region):
   ├─ "mien-nam": TP.HCM, Đồng Nai, Bình Phước, Hậu Giang, Cần Thơ, v.v.
   ├─ "mien-trung": Đà Nẵng, Khánh Hòa, Quảng Nam, Huế, Bình Định, v.v.
   └─ "mien-bac": Hà Nội, Hải Phòng, Quảng Ninh, Bắc Ninh, v.v.
   
   * Nếu region="mien-bac" và không chỉ rõ tỉnh → station có thể null

════════════════════════════════════════════════════════════════════
VÍ DỤ ĐẦY ĐỦ:
════════════════════════════════════════════════════════════════════

Input: "BP+Hậu Giang. 70 34.dx4n.BP.70.b5n.470.b1n.7lo3n xc20n.Hậu Giang. 34.b5n.834.b1n.7lo3n.xc20n."

Output:
{
  "bet_list": [
    {
      "station": ["binh-phuoc", "hau-giang"],
      "region": "mien-nam",
      "type": "xien",
      "numbers": ["70", "34"],
      "money": 4000,
      "note": "Xiên 2 số trên 2 đài"
    },
    {
      "station": ["binh-phuoc"],
      "region": "mien-nam",
      "type": "bao-lo",
      "numbers": ["70"],
      "money": 5000,
      "note": null
    },
    {
      "station": ["binh-phuoc"],
      "region": "mien-nam",
      "type": "bao-lo",
      "numbers": ["470"],
      "money": 1000,
      "note": null
    },
    {
      "station": ["binh-phuoc"],
      "region": "mien-nam",
      "type": "7-lo",
      "numbers": ["470"],
      "money": 3000,
      "note": null
    },
    {
      "station": ["binh-phuoc"],
      "region": "mien-nam",
      "type": "xiu-chu",
      "numbers": ["470"],
      "money": 20000,
      "note": null
    },
    {
      "station": ["hau-giang"],
      "region": "mien-nam",
      "type": "bao-lo",
      "numbers": ["34"],
      "money": 5000,
      "note": null
    },
    {
      "station": ["hau-giang"],
      "region": "mien-nam",
      "type": "bao-lo",
      "numbers": ["834"],
      "money": 1000,
      "note": null
    },
    {
      "station": ["hau-giang"],
      "region": "mien-nam",
      "type": "7-lo",
      "numbers": ["834"],
      "money": 3000,
      "note": null
    },
    {
      "station": ["hau-giang"],
      "region": "mien-nam",
      "type": "xiu-chu",
      "numbers": ["834"],
      "money": 20000,
      "note": null
    }
  ]
}

────────────────────────────────────────────────────────────────────

Input 2: "2đ tpla 777b5n 07 70 56 65 b10ndx2n 35 53b5ndx2n bphg 07 70 b5ndx1n 35 53b5ndx1n 56 65 b10ndx2n"

Phân tích:
┌─────────────────────────────────────────────────────────────────┐
│ "2đ tpla" → 2 đài: TP.HCM + Long An                            │
│ "777b5n" → số 777, bao lô, 5000đ                               │
│ "07 70 56 65 b10ndx2n" → 4 số (07,70,56,65), bao 10k + xiên 2k│
│ "35 53b5ndx2n" → 2 số (35,53), bao 5k + xiên 2k                │
│                                                                 │
│ "bphg" → chuyển sang 2 đài mới: Bình Phước + Hậu Giang        │
│ "07 70 b5ndx1n" → 2 số (07,70), bao 5k + xiên 1k              │
│ "35 53b5ndx1n" → 2 số (35,53), bao 5k + xiên 1k               │
│ "56 65 b10ndx2n" → 2 số (56,65), bao 10k + xiên 2k            │
└─────────────────────────────────────────────────────────────────┘

Output:
{
  "bet_list": [
    {
      "station": ["tp-hcm", "long-an"],
      "region": "mien-nam",
      "type": "bao-lo",
      "numbers": ["777"],
      "money": 5000,
      "note": "2 đài TP+LA"
    },
    {
      "station": ["tp-hcm", "long-an"],
      "region": "mien-nam",
      "type": "bao-lo",
      "numbers": ["07", "70", "56", "65"],
      "money": 10000,
      "note": null
    },
    {
      "station": ["tp-hcm", "long-an"],
      "region": "mien-nam",
      "type": "xien",
      "numbers": ["07", "70", "56", "65"],
      "money": 2000,
      "note": "Xiên 4 số"
    },
    {
      "station": ["tp-hcm", "long-an"],
      "region": "mien-nam",
      "type": "bao-lo",
      "numbers": ["35", "53"],
      "money": 5000,
      "note": null
    },
    {
      "station": ["tp-hcm", "long-an"],
      "region": "mien-nam",
      "type": "xien",
      "numbers": ["35", "53"],
      "money": 2000,
      "note": null
    },
    {
      "station": ["binh-phuoc", "hau-giang"],
      "region": "mien-nam",
      "type": "bao-lo",
      "numbers": ["07", "70"],
      "money": 5000,
      "note": null
    },
    {
      "station": ["binh-phuoc", "hau-giang"],
      "region": "mien-nam",
      "type": "xien",
      "numbers": ["07", "70"],
      "money": 1000,
      "note": null
    },
    {
      "station": ["binh-phuoc", "hau-giang"],
      "region": "mien-nam",
      "type": "bao-lo",
      "numbers": ["35", "53"],
      "money": 5000,
      "note": null
    },
    {
      "station": ["binh-phuoc", "hau-giang"],
      "region": "mien-nam",
      "type": "xien",
      "numbers": ["35", "53"],
      "money": 1000,
      "note": null
    },
    {
      "station": ["binh-phuoc", "hau-giang"],
      "region": "mien-nam",
      "type": "bao-lo",
      "numbers": ["56", "65"],
      "money": 10000,
      "note": null
    },
    {
      "station": ["binh-phuoc", "hau-giang"],
      "region": "mien-nam",
      "type": "xien",
      "numbers": ["56", "65"],
      "money": 2000,
      "note": null
    }
  ]
}

────────────────────────────────────────────────────────────────────

Input 3: "2đ.399.b1n"
Ngày: Thứ Bảy, 3 tháng 11 năm 2025

Phân tích:
┌─────────────────────────────────────────────────────────────────┐
│ "2đ" → Không có tên đài cụ thể, không có mã miền               │
│ → MẶC ĐỊNH: Miền Nam                                           │
│ → Tra lịch: Thứ Bảy miền Nam = TP.HCM, Long An, BP, Hậu Giang │
│ → Lấy 2 đài ĐẦU TIÊN: ["tp-hcm", "long-an"]                   │
│                                                                 │
│ "399" → số cần đánh                                            │
│ "b1n" → bao lô, 1000đ                                          │
└─────────────────────────────────────────────────────────────────┘

Output:
{
  "bet_list": [
    {
      "station": ["tp-hcm", "long-an"],
      "region": "mien-nam",
      "type": "bao-lo",
      "numbers": ["399"],
      "money": 1000,
      "note": "2 đài đầu tiên của Thứ Bảy (miền nam)"
    }
  ]
}

────────────────────────────────────────────────────────────────────

Input 4: "2đ.39.24.b5n.dx5n.52.92.b2n.dx2n"
Ngày: Thứ Hai (TP.HCM, Đồng Tháp, Cà Mau)

Phân tích:
┌─────────────────────────────────────────────────────────────────┐
│ "2đ" → 2 đài đầu tiên: ["tp-hcm", "dong-thap"]                │
│ "39.24.b5n" → 2 số (39, 24), bao lô, 5000đ                    │
│ "dx5n" → CÙNG 2 số (39, 24), xiên, 5000đ                      │
│ "52.92.b2n" → 2 số (52, 92), bao lô, 2000đ                    │
│ "dx2n" → CÙNG 2 số (52, 92), xiên, 2000đ                      │
└─────────────────────────────────────────────────────────────────┘

Output:
{
  "bet_list": [
    {
      "station": ["tp-hcm", "dong-thap"],
      "region": "mien-nam",
      "type": "bao-lo",
      "numbers": ["39", "24"],
      "money": 5000,
      "note": null
    },
    {
      "station": ["tp-hcm", "dong-thap"],
      "region": "mien-nam",
      "type": "xien",
      "numbers": ["39", "24"],
      "money": 5000,
      "note": null
    },
    {
      "station": ["tp-hcm", "dong-thap"],
      "region": "mien-nam",
      "type": "bao-lo",
      "numbers": ["52", "92"],
      "money": 2000,
      "note": null
    },
    {
      "station": ["tp-hcm", "dong-thap"],
      "region": "mien-nam",
      "type": "xien",
      "numbers": ["52", "92"],
      "money": 2000,
      "note": null
    }
  ]
}

────────────────────────────────────────────────────────────────────

Input 5: "Tp.01 41 81 21 61 b5n..ĐT.03 43 83 23 63 b5n"

Phân tích:
┌─────────────────────────────────────────────────────────────────┐
│ "Tp" → TP.HCM ["tp-hcm"]                                       │
│ "01 41 81 21 61" → 5 số (LƯU Ý: "01" giữ nguyên số 0)        │
│ "b5n" → bao lô, 5000đ                                          │
│                                                                 │
│ "ĐT" → Đồng Tháp ["dong-thap"]                                │
│ "03 43 83 23 63" → 5 số (LƯU Ý: "03" giữ nguyên số 0)        │
│ "b5n" → bao lô, 5000đ                                          │
└─────────────────────────────────────────────────────────────────┘

Output:
{
  "bet_list": [
    {
      "station": ["tp-hcm"],
      "region": "mien-nam",
      "type": "bao-lo",
      "numbers": ["01", "41", "81", "21", "61"],
      "money": 5000,
      "note": null
    },
    {
      "station": ["dong-thap"],
      "region": "mien-nam",
      "type": "bao-lo",
      "numbers": ["03", "43", "83", "23", "63"],
      "money": 5000,
      "note": null
    }
  ]
}

────────────────────────────────────────────────────────────────────

Input 5: "3đ mt.56 88.dx5n"
Ngày: Thứ Bảy, 3 tháng 11 năm 2025

Phân tích:
┌─────────────────────────────────────────────────────────────────┐
│ "3đ mt" → 3 đài, mã miền "mt" (miền trung)                     │
│ → Tra lịch: Thứ Bảy miền Trung = Đà Nẵng, Quảng Ngãi, Đắk Nông│
│ → Lấy 3 đài ĐẦU TIÊN: ["da-nang", "quang-ngai", "dak-nong"]   │
│                                                                 │
│ "56 88" → 2 số cần xiên                                        │
│ "dx5n" → đánh xiên, 5000đ                                      │
└─────────────────────────────────────────────────────────────────┘

Output:
{
  "bet_list": [
    {
      "station": ["da-nang", "quang-ngai", "dak-nong"],
      "region": "mien-trung",
      "type": "xien",
      "numbers": ["56", "88"],
      "money": 5000,
      "note": "3 đài đầu tiên của Thứ Bảy (miền trung)"
    }
  ]
}

────────────────────────────────────────────────────────────────────

Input 6: "2đ.39.24.b5n.dx5n.52.92.b2n.dx2n. 52 24 56 b10n dx3n 68.32.268.b5n.TP.97.b10n 397.839.b1n.7lo3n.xc10n."
Ngày: Thứ Hai, 3 tháng 11 năm 2025

Phân tích:
┌─────────────────────────────────────────────────────────────────┐
│ "2đ" → 2 đài đầu tiên: ["tp-hcm", "dong-thap"]                │
│ → MÃ ĐÀI TOÀN CỤC áp dụng cho TẤT CẢ các bet sau              │
│                                                                 │
│ "39.24.b5n" → station: ["tp-hcm", "dong-thap"]                │
│ "dx5n" → station: ["tp-hcm", "dong-thap"]                     │
│ "52.92.b2n" → station: ["tp-hcm", "dong-thap"]                │
│ "dx2n" → station: ["tp-hcm", "dong-thap"]                     │
│ "52 24 56 b10n" → station: ["tp-hcm", "dong-thap"]            │
│ "dx3n" → station: ["tp-hcm", "dong-thap"]                     │
│ "68.32.268.b5n" → station: ["tp-hcm", "dong-thap"]            │
│                                                                 │
│ "TP.97.b10n" → station: ["tp-hcm"] ← CHỈ bet này              │
│                                                                 │
│ "397.839.b1n" → station: ["tp-hcm", "dong-thap"] ← Quay lại 2đ│
│ "7lo3n" → station: ["tp-hcm", "dong-thap"]                    │
│ "xc10n" → station: ["tp-hcm", "dong-thap"]                    │
└─────────────────────────────────────────────────────────────────┘

Output:
{
  "bet_list": [
    {
      "station": ["tp-hcm", "dong-thap"],
      "region": "mien-nam",
      "type": "bao-lo",
      "numbers": ["39", "24"],
      "money": 5000,
      "note": null
    },
    {
      "station": ["tp-hcm", "dong-thap"],
      "region": "mien-nam",
      "type": "xien",
      "numbers": ["39", "24"],
      "money": 5000,
      "note": null
    },
    {
      "station": ["tp-hcm", "dong-thap"],
      "region": "mien-nam",
      "type": "bao-lo",
      "numbers": ["52", "92"],
      "money": 2000,
      "note": null
    },
    {
      "station": ["tp-hcm", "dong-thap"],
      "region": "mien-nam",
      "type": "xien",
      "numbers": ["52", "92"],
      "money": 2000,
      "note": null
    },
    {
      "station": ["tp-hcm", "dong-thap"],
      "region": "mien-nam",
      "type": "bao-lo",
      "numbers": ["52", "24", "56"],
      "money": 10000,
      "note": null
    },
    {
      "station": ["tp-hcm", "dong-thap"],
      "region": "mien-nam",
      "type": "xien",
      "numbers": ["52", "24", "56"],
      "money": 3000,
      "note": null
    },
    {
      "station": ["tp-hcm", "dong-thap"],
      "region": "mien-nam",
      "type": "bao-lo",
      "numbers": ["68", "32", "268"],
      "money": 5000,
      "note": null
    },
    {
      "station": ["tp-hcm"],
      "region": "mien-nam",
      "type": "bao-lo",
      "numbers": ["97"],
      "money": 10000,
      "note": "TP. thay đổi mã đài thành tp-hcm"
    },
    {
      "station": ["tp-hcm"],
      "region": "mien-nam",
      "type": "bao-lo",
      "numbers": ["397", "839"],
      "money": 1000,
      "note": "VẪN dùng tp-hcm (không có mã đài mới)"
    },
    {
      "station": ["tp-hcm"],
      "region": "mien-nam",
      "type": "7-lo",
      "numbers": ["397", "839"],
      "money": 3000,
      "note": "VẪN dùng tp-hcm"
    },
    {
      "station": ["tp-hcm"],
      "region": "mien-nam",
      "type": "xiu-chu",
      "numbers": ["397", "839"],
      "money": 10000,
      "note": null
    }
  ]
}

════════════════════════════════════════════════════════════════════
NGUYÊN TẮC QUAN TRỌNG:
════════════════════════════════════════════════════════════════════
✓ Tách từng cược thành 1 object riêng trong bet_list
✓ Số trong numbers phải là CHUỖI (string) để giữ số 0 đầu
  - "01" → "01" (KHÔNG phải 1)
  - "03" → "03" (KHÔNG phải 3)
  - "07" → "07" (KHÔNG phải 7)
  - "074" → "074" (KHÔNG phải 74)
  - "00" → "00" (KHÔNG phải 0)

★★★ QUY TẮC NHÓM SỐ (CỰC KỲ QUAN TRỌNG):
✓ Các số TRƯỚC mã loại cược thuộc CÙNG 1 NHÓM
✓ VD: "39.24.b5n" → numbers: ["39", "24"] (GOM LẠI, không tách riêng!)
✓ VD: "52 92.b2n" → numbers: ["52", "92"] (GOM LẠI!)
✓ VD: "52 24 56 b10n dx3n" → 
      - Cược 1: numbers: ["52", "24", "56"], type: "bao-lo"
      - Cược 2: numbers: ["52", "24", "56"], type: "xien" (CÙNG 3 số!)
✓ KHÔNG ĐƯỢC tách thành nhiều cược với từng số riêng lẻ!

★★★ QUY TẮC "2đ", "3đ", "4đ":
✓ "2đ" = LẤY ĐÚNG 2 ĐÀI ĐẦU TIÊN (không phải 3 đài!)
✓ "3đ" = LẤY ĐÚNG 3 ĐÀI ĐẦU TIÊN
✓ Thứ Hai miền Nam: TP.HCM, Đồng Tháp, Cà Mau
✓ "2đ" ngày Thứ Hai → ["tp-hcm", "dong-thap"] (chỉ 2 đài!)

✓ Money phải là số nguyên (VD: 4000, 5000, không phải "4n")
✓ Phân tích chính xác mã loại cược (dx→xien, b→bao-lo, 7lo→7-lo, xc→xiu-chu)
✓ Nếu không có mã loại cược, mặc định type="da"
✓ Station luôn là mảng, ngay cả khi chỉ có 1 đài
✓ Đọc kỹ cả dấu chấm (.) và khoảng trắng để phân tách giữa các phần
✓ Khi gặp mã đài mới (VD: "TP", "bphg"), các cược sau đó áp dụng cho đài mới

★ QUY TẮC VỀ "2đ", "3đ", "4đ"...:
✓ "2đ tpla" → Có tên đài: tách thành ["tp-hcm", "long-an"]
✓ "2đ", "3đ" KHÔNG CÓ TÊN → Tra LỊCH theo NGÀY và MIỀN
✓ Không có mã miền (mn/mt/mb) → MẶC ĐỊNH MIỀN NAM
✓ "3đ mt" → 3 đài đầu tiên miền trung
✓ "2đ mb" hoặc "mb" → Miền bắc (chỉ có 1 kết quả/ngày)
✓ Region phải khớp với miền của các đài được chọn
✓ Chỉ trả về JSON thuần túy, KHÔNG có markdown hay giải thích

⚠️ QUY TẮC TẠO BET (CỰC KỲ QUAN TRỌNG):
✓ CHỈ tạo bet cho TỪNG MÃ LOẠI CƯỢC có trong input
✓ VD: "b10ndx2n" → 2 bets (bao-lo 10k + xiên 2k) vì có CẢ "b" VÀ "dx"
✓ VD: "dx2n" → CHỈ 1 bet xiên 2k, KHÔNG tạo bao-lo vì không có "b"
✓ VD: "b5n" → CHỈ 1 bet bao-lo 5k, KHÔNG tạo xiên vì không có "dx"

★★★ QUY TẮC PHẠM VI ẢNH HƯỞNG CỦA MÃ ĐÀI (CỰC KỲ QUAN TRỌNG):
✓ MỖI mã đài (dù là "2đ", "3đ", "4đ", "TP", "BT", "ĐT"...) đều thiết lập đài cho TẤT CẢ các bet sau nó
✓ Mã đài CHỈ thay đổi khi gặp mã đài MỚI (có dấu chấm sau mã: "TP.", "BT.", "2đ.")
✓ Tất cả các bet KHÔNG có mã đài → tiếp tục dùng mã đài gần nhất

VÍ DỤ QUAN TRỌNG:
"2đ.39.24.b5n.52 24 56 b10n.TP.97.b10n.397.839.b1n.7lo3n"
┌─────────────────────────────────────────────────────────────────┐
│ "2đ." → Thiết lập 2 đài: ["tp-hcm", "dong-thap"]              │
│                                                                 │
│ "39.24.b5n" → station: ["tp-hcm", "dong-thap"] ← Dùng "2đ"   │
│ "52 24 56 b10n" → station: ["tp-hcm", "dong-thap"] ← Dùng "2đ"│
│                                                                 │
│ "TP." → Thay đổi thành: ["tp-hcm"]                            │
│                                                                 │
│ "97.b10n" → station: ["tp-hcm"] ← Dùng TP                     │
│ "397.839.b1n" → station: ["tp-hcm"] ← VẪN dùng TP             │
│ "397.839.7lo3n" → station: ["tp-hcm"] ← VẪN dùng TP           │
└─────────────────────────────────────────────────────────────────┘

QUAN TRỌNG: Mã đài có hiệu lực CHO ĐẾN KHI gặp mã đài mới:
- "2đ.39.b5n.52.b2n.97.b10n" → TẤT CẢ đều dùng 2 đài
- "2đ.39.b5n.TP.97.b10n.52.b2n" → 39 dùng 2 đài, 97 và 52 dùng TP
- Mã đài KHÔNG tự động reset sau mỗi bet!
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
      config: {
        temperature: 0
      }
    });

    const text = response.text;
    
    // Parse JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        success: true,
        data: parsed
      };
    }
    
    throw new Error('Không thể phân tích response từ Gemini');
  } catch (error) {
    console.error('Gemini API Error:', error);
    return {
      success: false,
      error: error.message || 'Lỗi khi gọi Gemini API'
    };
  }
}
