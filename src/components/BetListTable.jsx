import { calculateActualBetAmount } from '../utils/checker';

export default function BetListTable({ betList }) {
  if (!betList || betList.length === 0) {
    return null;
  }

  const getBetTypeLabel = (type) => {
    const labels = {
      'xien': 'Xiên',
      'bao-lo': 'Bao lô',
      '7-lo': '7 lô',
      'xiu-chu': 'Xỉu chủ',
      'da': 'Đá thẳng'
    };
    return labels[type] || type;
  };

  const formatMoney = (amount) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
        <span className="text-2xl mr-2">📋</span>
        Danh Sách Cược ({betList.length} cược)
      </h2>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                #
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Đài
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Loại
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Số
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tiền cược
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tiền thu
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ghi chú
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {betList.map((bet, index) => (
              <tr key={index} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                  {index + 1}
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">
                  <div className="flex flex-wrap gap-1">
                    {bet.station.map((s, i) => (
                      <span 
                        key={i}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    {getBetTypeLabel(bet.type)}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  <div className="flex flex-wrap gap-1">
                    {bet.numbers.map((num, i) => (
                      <span 
                        key={i}
                        className="inline-flex items-center px-2 py-1 rounded bg-gray-100 text-gray-800 font-mono font-bold"
                      >
                        {num}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-right text-gray-600">
                  {formatMoney(bet.money)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-right text-green-600">
                  {formatMoney(calculateActualBetAmount(bet))}
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">
                  {bet.note || '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">
              Tổng tiền cược:
            </span>
            <span className="text-base font-semibold text-gray-600">
              {formatMoney(betList.reduce((sum, bet) => sum + bet.money, 0))}
            </span>
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-gray-300">
            <span className="text-base font-bold text-gray-800">
              Tổng tiền thu:
            </span>
            <span className="text-xl font-bold text-green-600">
              {formatMoney(betList.reduce((sum, bet) => sum + calculateActualBetAmount(bet), 0))}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
