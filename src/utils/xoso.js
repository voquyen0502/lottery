// Map tên đài từ format input sang format minhngoc.net.vn
const STATION_MAP = {
  // Miền Nam
  'tp-hcm': { url: 'tp-hcm', region: 'mien-nam', name: 'TP. HCM' },
  'dong-nai': { url: 'dong-nai', region: 'mien-nam', name: 'Đồng Nai' },
  'ca-mau': { url: 'ca-mau', region: 'mien-nam', name: 'Cà Mau' },
  'ben-tre': { url: 'ben-tre', region: 'mien-nam', name: 'Bến Tre' },
  'vung-tau': { url: 'vung-tau', region: 'mien-nam', name: 'Vũng Tàu' },
  'bac-lieu': { url: 'bac-lieu', region: 'mien-nam', name: 'Bạc Liêu' },
  'dong-thap': { url: 'dong-thap', region: 'mien-nam', name: 'Đồng Tháp' },
  'can-tho': { url: 'can-tho', region: 'mien-nam', name: 'Cần Thơ' },
  'soc-trang': { url: 'soc-trang', region: 'mien-nam', name: 'Sóc Trăng' },
  'tay-ninh': { url: 'tay-ninh', region: 'mien-nam', name: 'Tây Ninh' },
  'an-giang': { url: 'an-giang', region: 'mien-nam', name: 'An Giang' },
  'binh-thuan': { url: 'binh-thuan', region: 'mien-nam', name: 'Bình Thuận' },
  'vinh-long': { url: 'vinh-long', region: 'mien-nam', name: 'Vĩnh Long' },
  'binh-duong': { url: 'binh-duong', region: 'mien-nam', name: 'Bình Dương' },
  'tra-vinh': { url: 'tra-vinh', region: 'mien-nam', name: 'Trà Vinh' },
  'long-an': { url: 'long-an', region: 'mien-nam', name: 'Long An' },
  'binh-phuoc': { url: 'binh-phuoc', region: 'mien-nam', name: 'Bình Phước' },
  'hau-giang': { url: 'hau-giang', region: 'mien-nam', name: 'Hậu Giang' },
  'tien-giang': { url: 'tien-giang', region: 'mien-nam', name: 'Tiền Giang' },
  'kien-giang': { url: 'kien-giang', region: 'mien-nam', name: 'Kiên Giang' },
  'da-lat': { url: 'da-lat', region: 'mien-nam', name: 'Đà Lạt' },
  
  // Miền Trung
  'da-nang': { url: 'da-nang', region: 'mien-trung', name: 'Đà Nẵng' },
  'khanh-hoa': { url: 'khanh-hoa', region: 'mien-trung', name: 'Khánh Hòa' },
  'binh-dinh': { url: 'binh-dinh', region: 'mien-trung', name: 'Bình Định' },
  'quang-tri': { url: 'quang-tri', region: 'mien-trung', name: 'Quảng Trị' },
  'quang-binh': { url: 'quang-binh', region: 'mien-trung', name: 'Quảng Bình' },
  'gia-lai': { url: 'gia-lai', region: 'mien-trung', name: 'Gia Lai' },
  'ninh-thuan': { url: 'ninh-thuan', region: 'mien-trung', name: 'Ninh Thuận' },
  'quang-nam': { url: 'quang-nam', region: 'mien-trung', name: 'Quảng Nam' },
  'dak-lak': { url: 'dak-lak', region: 'mien-trung', name: 'Đắk Lắk' },
  'quang-ngai': { url: 'quang-ngai', region: 'mien-trung', name: 'Quảng Ngãi' },
  'dak-nong': { url: 'dak-nong', region: 'mien-trung', name: 'Đắk Nông' },
  'kon-tum': { url: 'kon-tum', region: 'mien-trung', name: 'Kon Tum' },
  'thua-thien-hue': { url: 'thua-thien-hue', region: 'mien-trung', name: 'Thừa Thiên Huế' },
  'phu-yen': { url: 'phu-yen', region: 'mien-trung', name: 'Phú Yên' },
  
  // Miền Bắc
  'ha-noi': { url: 'ha-noi', region: 'mien-bac', name: 'Hà Nội' },
  'quang-ninh': { url: 'quang-ninh', region: 'mien-bac', name: 'Quảng Ninh' },
  'bac-ninh': { url: 'bac-ninh', region: 'mien-bac', name: 'Bắc Ninh' },
  'hai-phong': { url: 'hai-phong', region: 'mien-bac', name: 'Hải Phòng' },
  'nam-dinh': { url: 'nam-dinh', region: 'mien-bac', name: 'Nam Định' },
  'thai-binh': { url: 'thai-binh', region: 'mien-bac', name: 'Thái Bình' },
};

// CORS Proxies (sẽ thử lần lượt nếu proxy trước thất bại)
const CORS_PROXIES = [
  (url) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
];

// Crawl từ minhngoc.net.vn
export async function fetchLotteryResult(station, date, region = null) {
  console.log('=== BẮT ĐẦU CRAWL ===');
  console.log('Station:', station);
  console.log('Date:', date);
  console.log('Region:', region);
  
  try {
    // Xử lý trường hợp miền Bắc (station có thể rỗng)
    let stationInfo;
    let targetRegion;
    
    if (region === 'mien-bac' && (!station || station.trim() === '')) {
      console.log('🎯 Miền Bắc - không cần chỉ định đài cụ thể');
      stationInfo = null;
      targetRegion = 'mien-bac';
    } else {
      stationInfo = STATION_MAP[station.toLowerCase()];
      if (!stationInfo) {
        throw new Error(`Không tìm thấy đài: ${station}. Vui lòng kiểm tra tên đài.`);
      }
      targetRegion = stationInfo.region;
      console.log('Station Info:', stationInfo);
    }

    // Format date as dd-mm-yyyy for minhngoc
    const dateStr = typeof date === 'string' ? formatDateForMinhNgoc(date) : formatDateForMinhNgoc(formatDate(date));
    console.log('Date formatted:', dateStr);
    
    const url = `https://www.minhngoc.net.vn/ket-qua-xo-so/${targetRegion}/${dateStr}.html`;
    console.log('Target URL:', url);
    
    // Try each proxy until one works
    let html = null;
    let lastError = null;
    
    for (let i = 0; i < CORS_PROXIES.length; i++) {
      try {
        const proxyUrl = CORS_PROXIES[i](url);
        console.log(`\n🔄 Đang thử proxy ${i + 1}/${CORS_PROXIES.length}...`);
        console.log('Proxy URL:', proxyUrl);
        
        const response = await fetch(proxyUrl, {
          method: 'GET',
          headers: {
            'Accept': 'text/html,application/xhtml+xml,application/xml',
          },
          signal: AbortSignal.timeout(10000), // 10 second timeout
        });
        
        console.log('Response status:', response.status);
        console.log('Response headers:', Object.fromEntries(response.headers.entries()));
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        
        html = await response.text();
        console.log('✅ Proxy thành công!');
        console.log('HTML length:', html.length);
        console.log('HTML preview (first 500 chars):', html.substring(0, 500));
        break;
      } catch (error) {
        console.warn(`❌ Proxy ${i + 1} thất bại:`, error.message);
        lastError = error;
        continue;
      }
    }
    
    if (!html) {
      throw new Error(`Không thể kết nối đến minhngoc.net.vn. Vui lòng thử lại sau. (${lastError?.message})`);
    }
    
    console.log('\n📄 Bắt đầu parse HTML...');
    
    // Parse HTML using DOMParser (works in browser)
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    console.log('Document parsed successfully');
    console.log('Document title:', doc.title);
    
    // Extract lottery results
    // Đối với miền Bắc, không cần tên đài cụ thể
    const stationName = stationInfo ? stationInfo.name : null;
    const results = parseMinhNgocHTML(doc, stationName, targetRegion);
    
    console.log('\n📊 Kết quả parse:', results);
    
    if (!results) {
      const errorMsg = stationInfo 
        ? `Không tìm thấy kết quả cho đài ${stationInfo.name} ngày ${dateStr}`
        : `Không tìm thấy kết quả miền Bắc ngày ${dateStr}`;
      throw new Error(errorMsg);
    }
    
    const finalData = {
      province: stationInfo ? stationInfo.name : 'Miền Bắc',
      date: dateStr,
      ...results
    };
    
    console.log('\n✅ KẾT QUẢ CUỐI CÙNG:', finalData);
    console.log('=== HOÀN THÀNH ===\n');
    
    return {
      success: true,
      data: finalData
    };
  } catch (error) {
    console.error('❌ LỖI:', error);
    console.error('Stack trace:', error.stack);
    return {
      success: false,
      error: error.message || 'Lỗi khi lấy kết quả xổ số'
    };
  }
}

// Parse HTML từ minhngoc.net.vn
function parseMinhNgocHTML(doc, stationName, region) {
  console.log('\n🔍 Bắt đầu parse HTML');
  console.log('  - Đài:', stationName || 'Không chỉ định (miền Bắc)');
  console.log('  - Vùng:', region);
  
  // Chỉ lấy box đầu tiên (ngày hiện tại)
  const box = doc.querySelector('.box_kqxs');
  
  if (!box) {
    console.warn('⚠️ Không tìm thấy .box_kqxs trong HTML');
    console.log('Các div có class chứa "box":', doc.querySelectorAll('div[class*="box"]').length);
    console.log('Tất cả các table:', doc.querySelectorAll('table').length);
    return null;
  }
  
  console.log('📦 Đã tìm thấy box kết quả');
  
  // Tìm table chứa kết quả cho đài cụ thể (table.rightcl)
  // Mỗi đài có 1 table.rightcl riêng trong box
  const allTables = box.querySelectorAll('table.rightcl');
  console.log('Số table.rightcl tìm thấy:', allTables.length);
  
  let resultTable = null;
  
  // Đối với miền Bắc, chỉ có 1 kết quả nên lấy table đầu tiên
  if (region === 'mien-bac' && (!stationName || stationName.trim() === '')) {
    console.log('🎯 Miền Bắc - lấy table đầu tiên');
    resultTable = allTables[0];
    if (resultTable) {
      const tinhElem = resultTable.querySelector('.tinh a');
      if (tinhElem) {
        console.log('  ✅ Đài:', tinhElem.textContent.trim());
      }
    }
  } else {
    // Tìm table có tên đài khớp
    for (const table of allTables) {
      const tinhElem = table.querySelector('.tinh a');
      if (!tinhElem) {
        continue;
      }
      
      const dai = tinhElem.textContent.trim();
      console.log(`  📍 Đài trong table: "${dai}"`);
      
      const isMatch = dai.includes(stationName) || stationName.includes(dai);
      if (isMatch) {
        console.log(`  ✅ Tìm thấy đài phù hợp: "${dai}"`);
        resultTable = table;
        break;
      }
    }
  }
  
  if (!resultTable) {
    console.warn(`⚠️ Không tìm thấy table cho đài: ${stationName || 'không xác định'}`);
    return null;
  }
  
  console.log('  📋 Bắt đầu parse giải...');
  
  const result = {};
  
  // Parse theo cấu trúc mới: tìm <td> với class giải
  const prizeMapping = [
    { selector: '.giaidb', name: 'special', label: 'Giải ĐB' },
    { selector: '.giai1', name: 'first', label: 'Giải nhất' },
    { selector: '.giai2', name: 'second', label: 'Giải nhì' },
    { selector: '.giai3', name: 'third', label: 'Giải ba' },
    { selector: '.giai4', name: 'fourth', label: 'Giải tư' },
    { selector: '.giai5', name: 'fifth', label: 'Giải năm' },
    { selector: '.giai6', name: 'sixth', label: 'Giải sáu' },
    { selector: '.giai7', name: 'seventh', label: 'Giải bảy' },
    { selector: '.giai8', name: 'eighth', label: 'Giải tám' },
  ];
  
  for (const prize of prizeMapping) {
    const tdElem = resultTable.querySelector(prize.selector);
    
    if (!tdElem) {
      console.log(`  ⚠️ Không tìm thấy ${prize.label} (${prize.selector})`);
      continue;
    }
    
    console.log(`  🎁 ${prize.label}:`);
    
    // Lấy tất cả các <div> bên trong <td>
    const divs = tdElem.querySelectorAll('div');
    const numbers = Array.from(divs)
      .map(div => div.textContent.trim())
      .filter(text => text.length > 0 && /^\d+$/.test(text)); // Chỉ lấy số
    
    console.log(`    📊 Số div: ${divs.length}`);
    console.log(`    🔢 Số trúng:`, numbers);
    
    if (numbers.length === 1) {
      result[prize.name] = numbers[0];
    } else if (numbers.length > 1) {
      result[prize.name] = numbers;
    }
  }
  
  console.log('\n  ✅ Parse xong! Kết quả:', result);
  return result;
}

// Convert yyyy-mm-dd to dd-mm-yyyy
function formatDateForMinhNgoc(dateStr) {
  console.log('Format date input:', dateStr);
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const formatted = `${parts[2]}-${parts[1]}-${parts[0]}`; // dd-mm-yyyy
    console.log('Format date output:', formatted);
    return formatted;
  }
  console.log('Format date unchanged:', dateStr);
  return dateStr;
}

export function formatDate(date) {
  if (!date) {
    date = new Date();
  }
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

export function getTodayDate() {
  return formatDate(new Date());
}
