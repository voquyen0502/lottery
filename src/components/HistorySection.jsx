import { motion } from 'framer-motion';
import { getHistory } from '../utils/storage';

export default function HistorySection({ onLoadHistory }) {
  const history = getHistory();

  if (history.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="card"
    >
      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
        <span className="mr-2">📜</span>
        Lịch sử tìm kiếm
      </h3>

      <div className="space-y-3">
        {history.map((item, idx) => (
          <div
            key={idx}
            className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-primary-300 transition-colors cursor-pointer"
            onClick={() => onLoadHistory(item)}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                {item.station || 'Không rõ đài'}
              </span>
              <span className="text-xs text-gray-500">
                {new Date(item.timestamp).toLocaleDateString('vi-VN')}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {item.numbers && item.numbers.slice(0, 3).map((num, numIdx) => (
                <span
                  key={numIdx}
                  className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded"
                >
                  {num}
                </span>
              ))}
              {item.numbers && item.numbers.length > 3 && (
                <span className="text-xs text-gray-500">
                  +{item.numbers.length - 3} số khác
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
