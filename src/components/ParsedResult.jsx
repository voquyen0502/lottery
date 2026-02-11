import { motion } from 'framer-motion';

export default function ParsedResult({ data }) {
  if (!data) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="card mb-6 bg-blue-50 border-2 border-blue-200"
    >
      <h3 className="text-lg font-bold text-blue-900 mb-3 flex items-center">
        <span className="mr-2">🤖</span>
        Kết quả phân tích từ Gemini
      </h3>

      <div className="bg-white rounded-lg p-4 space-y-3">
        <div>
          <span className="text-sm font-medium text-gray-600">Đài:</span>
          <p className="text-lg font-bold text-gray-900 mt-1">
            {data.station || 'Không xác định'}
          </p>
        </div>

        <div>
          <span className="text-sm font-medium text-gray-600">Các số dò:</span>
          <div className="flex flex-wrap gap-2 mt-2">
            {data.numbers && data.numbers.length > 0 ? (
              data.numbers.map((num, idx) => (
                <span
                  key={idx}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-lg"
                >
                  {num}
                </span>
              ))
            ) : (
              <span className="text-gray-500">Không có số</span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
