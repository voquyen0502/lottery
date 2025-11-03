import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const STATIONS = {
  'Miền Nam': [
    { code: 'tp-hcm', name: 'TP. HCM' },
    { code: 'dong-nai', name: 'Đồng Nai' },
    { code: 'ca-mau', name: 'Cà Mau' },
    { code: 'ben-tre', name: 'Bến Tre' },
    { code: 'vung-tau', name: 'Vũng Tàu' },
    { code: 'bac-lieu', name: 'Bạc Liêu' },
    { code: 'dong-thap', name: 'Đồng Tháp' },
    { code: 'can-tho', name: 'Cần Thơ' },
    { code: 'soc-trang', name: 'Sóc Trăng' },
    { code: 'tay-ninh', name: 'Tây Ninh' },
    { code: 'an-giang', name: 'An Giang' },
    { code: 'binh-thuan', name: 'Bình Thuận' },
    { code: 'vinh-long', name: 'Vĩnh Long' },
    { code: 'binh-duong', name: 'Bình Dương' },
    { code: 'tra-vinh', name: 'Trà Vinh' },
    { code: 'long-an', name: 'Long An' },
    { code: 'binh-phuoc', name: 'Bình Phước' },
    { code: 'hau-giang', name: 'Hậu Giang' },
    { code: 'tien-giang', name: 'Tiền Giang' },
    { code: 'kien-giang', name: 'Kiên Giang' },
    { code: 'da-lat', name: 'Đà Lạt' },
  ],
  'Miền Trung': [
    { code: 'da-nang', name: 'Đà Nẵng' },
    { code: 'khanh-hoa', name: 'Khánh Hòa' },
    { code: 'binh-dinh', name: 'Bình Định' },
    { code: 'quang-tri', name: 'Quảng Trị' },
    { code: 'quang-binh', name: 'Quảng Bình' },
    { code: 'gia-lai', name: 'Gia Lai' },
    { code: 'ninh-thuan', name: 'Ninh Thuận' },
    { code: 'quang-nam', name: 'Quảng Nam' },
    { code: 'dak-lak', name: 'Đắk Lắk' },
    { code: 'quang-ngai', name: 'Quảng Ngãi' },
    { code: 'dak-nong', name: 'Đắk Nông' },
    { code: 'kon-tum', name: 'Kon Tum' },
    { code: 'thua-thien-hue', name: 'Thừa Thiên Huế' },
    { code: 'phu-yen', name: 'Phú Yên' },
  ],
  'Miền Bắc': [
    { code: 'ha-noi', name: 'Hà Nội' },
    { code: 'quang-ninh', name: 'Quảng Ninh' },
    { code: 'bac-ninh', name: 'Bắc Ninh' },
    { code: 'hai-phong', name: 'Hải Phòng' },
    { code: 'nam-dinh', name: 'Nam Định' },
    { code: 'thai-binh', name: 'Thái Bình' },
  ],
};

export default function StationList() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredStations = {};
  Object.keys(STATIONS).forEach(region => {
    const filtered = STATIONS[region].filter(station =>
      station.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      station.code.includes(searchTerm.toLowerCase())
    );
    if (filtered.length > 0) {
      filteredStations[region] = filtered;
    }
  });

  return (
    <div className="card mb-6 bg-gradient-to-r from-purple-50 to-blue-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-left"
      >
        <h3 className="text-lg font-bold text-gray-900 flex items-center">
          <span className="mr-2">📍</span>
          Danh sách đài được hỗ trợ
        </h3>
        <span className="text-2xl text-gray-600">
          {isOpen ? '−' : '+'}
        </span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="mt-4">
              <input
                type="text"
                placeholder="Tìm kiếm đài..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field mb-4"
              />

              <div className="space-y-4 max-h-96 overflow-y-auto">
                {Object.keys(filteredStations).map(region => (
                  <div key={region}>
                    <h4 className="font-bold text-primary-600 mb-2">
                      {region} ({filteredStations[region].length})
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      {filteredStations[region].map(station => (
                        <div
                          key={station.code}
                          className="bg-white rounded-lg p-2 text-sm border border-gray-200"
                        >
                          <div className="font-medium text-gray-900">
                            {station.name}
                          </div>
                          <div className="text-xs text-gray-500 font-mono">
                            {station.code}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {Object.keys(filteredStations).length === 0 && (
                <div className="text-center text-gray-500 py-4">
                  Không tìm thấy đài nào
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
