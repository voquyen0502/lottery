export default function BetResultsTable({ results }) {
  console.log('BetResultsTable received results:', results);
  
  if (!results) {
    console.log('BetResultsTable: results is null or undefined');
    return null;
  }

  const { winningBets = [], losingBets = [], summary } = results;
  
  // Always show if we have summary
  if (!summary) {
    return null;
  }

  const formatMoney = (amount) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
  };

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

  return (
    <div className="space-y-6 mb-6">
      {/* Winning Bets - House Loss */}
      {winningBets && winningBets.length > 0 && (
        <div className="bg-red-50 rounded-lg shadow-lg p-6 border-2 border-red-200">
          <h2 className="text-xl font-bold text-red-800 mb-4 flex items-center">
            <span className="text-2xl mr-2">❌</span>
            Các Số Trúng - Nhà Cái Thua ({winningBets.length})
          </h2>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-red-200">
              <thead className="bg-red-100">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-red-800 uppercase">Đài</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-red-800 uppercase">Loại</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-red-800 uppercase">Số trúng</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-red-800 uppercase">Giải</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-red-800 uppercase">Tiền cược</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-red-800 uppercase">Tỷ lệ</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-red-800 uppercase">Phải trả</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-red-800 uppercase">Nhà cái thua</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-red-100">
                {winningBets.map((bet, index) => (
                  <tr key={index} className="hover:bg-red-50 transition-colors">
                    <td className="px-4 py-3 text-sm">
                      <div className="flex flex-wrap gap-1">
                        {bet.station.map((s, i) => (
                          <span key={i} className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                            {s}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs px-2 py-1 bg-purple-100 text-purple-800 rounded-full">
                        {getBetTypeLabel(bet.type)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {bet.numbers.map((num, i) => (
                          <span key={i} className="font-mono font-bold text-red-700 px-2 py-1 bg-red-100 rounded">
                            {num}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">{bet.prize}</td>
                    <td className="px-4 py-3 text-sm text-right font-semibold">{formatMoney(bet.betAmount)}</td>
                    <td className="px-4 py-3 text-sm text-right font-semibold text-orange-600">x{bet.multiplier}</td>
                    <td className="px-4 py-3 text-sm text-right font-bold text-red-600">{formatMoney(bet.payout)}</td>
                    <td className="px-4 py-3 text-sm text-right font-bold text-red-700">-{formatMoney(bet.profit)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Losing Bets - House Win */}
      {losingBets && losingBets.length > 0 && (
        <div className="bg-green-50 rounded-lg shadow-lg p-6 border-2 border-green-200">
          <h2 className="text-xl font-bold text-green-800 mb-4 flex items-center">
            <span className="text-2xl mr-2">✅</span>
            Các Số Trật - Nhà Cái Thắng ({losingBets.length})
          </h2>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-green-200">
              <thead className="bg-green-100">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-green-800 uppercase">Đài</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-green-800 uppercase">Loại</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-green-800 uppercase">Số</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-green-800 uppercase">Nhà cái ăn</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-green-100">
                {losingBets.map((bet, index) => (
                  <tr key={index} className="hover:bg-green-50 transition-colors">
                    <td className="px-4 py-3 text-sm">
                      <div className="flex flex-wrap gap-1">
                        {bet.station.map((s, i) => (
                          <span key={i} className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                            {s}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs px-2 py-1 bg-purple-100 text-purple-800 rounded-full">
                        {getBetTypeLabel(bet.type)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {bet.numbers.map((num, i) => (
                          <span key={i} className="font-mono font-bold text-gray-500 px-2 py-1 bg-gray-100 rounded line-through">
                            {num}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-bold text-green-600">+{formatMoney(bet.betAmount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Summary - House Perspective */}
      {summary && (
        <div className={`rounded-lg shadow-xl p-6 border-4 ${
          summary.houseProfit >= 0 ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-400' : 'bg-gradient-to-r from-red-50 to-rose-50 border-red-400'
        }`}>
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            📊 Tổng Kết Nhà Cái
          </h2>
          
          <div className="bg-white rounded-lg p-6 shadow-lg max-w-md mx-auto">
            <div className="space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                <span className="text-sm text-gray-600">Tổng tiền thu (cược):</span>
                <span className="font-bold text-green-600 text-lg">+{formatMoney(summary.totalBet)}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                <span className="text-sm text-gray-600">Tổng tiền chi (trả thưởng):</span>
                <span className="font-bold text-red-600 text-lg">-{formatMoney(summary.totalPayout)}</span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t-2 border-gray-400">
                <span className="text-base font-bold text-gray-800">Lãi/Lỗ Nhà Cái:</span>
                <span className={`font-bold text-2xl ${summary.houseProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {summary.houseProfit >= 0 ? '+' : ''}{formatMoney(summary.houseProfit)}
                </span>
              </div>
            </div>
          </div>

          {/* Overall Result - House View */}
          <div className="mt-6 pt-6 border-t-2 border-gray-300">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Kết quả</p>
              <p className={`text-3xl font-bold ${summary.houseProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {summary.houseProfit >= 0 ? '🎉 NHÀ CÁI THẮNG ' : '😢 NHÀ CÁI THUA '}
                {formatMoney(Math.abs(summary.houseProfit))}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                ({losingBets.length} cược thua / {winningBets.length} cược trúng)
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
