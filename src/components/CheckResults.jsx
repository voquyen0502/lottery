import { motion } from 'framer-motion';

export default function CheckResults({ results }) {
  if (!results || results.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="card mb-6"
    >
      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
        <span className="mr-2">✅</span>
        Kết quả dò vé
      </h3>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">
                Số dò
              </th>
              <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">
                Giải trúng
              </th>
              <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">
                Kiểu trùng
              </th>
            </tr>
          </thead>
          <tbody>
            {results.map((result, idx) => (
              <tr
                key={idx}
                className={`${
                  idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                } ${result.matched ? 'border-l-4 border-green-500' : ''}`}
              >
                <td className="px-4 py-3 text-base font-bold text-gray-900">
                  {result.number}
                </td>
                <td
                  className={`px-4 py-3 text-sm font-medium ${
                    result.matched ? 'text-green-600' : 'text-gray-500'
                  }`}
                >
                  {result.prize}
                </td>
                <td className="px-4 py-3 text-sm">
                  {result.matched ? (
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-800 font-medium">
                      {result.matchType}
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-gray-100 text-gray-600">
                      {result.matchType}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">
            Tổng số dò:
          </span>
          <span className="text-lg font-bold text-gray-900">
            {results.length}
          </span>
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-sm font-medium text-gray-700">
            Số trúng:
          </span>
          <span className="text-lg font-bold text-green-600">
            {results.filter((r) => r.matched).length}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
