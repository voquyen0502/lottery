import { motion } from 'framer-motion';

export default function LotteryResults({ results, betList = [] }) {
  console.log('LotteryResults received:', results, betList);
  
  if (!results) return null;

  // Check if results is a map of multiple stations or single station
  const isMultiStation = typeof results === 'object' && 
                         !results.special && 
                         !results.first;

  // Check if a number matches any bet for a specific station
  const isWinningNumber = (num, stationName) => {
    if (!num) return false;
    const numStr = String(num).trim();
    
    // Normalize single digit with leading zero
    let normalizedNum = numStr;
    if (numStr.length === 1) {
      normalizedNum = '0' + numStr;
    }
    
    if (normalizedNum.length < 2) return false;
    const last2 = normalizedNum.slice(-2);
    const last3 = normalizedNum.length >= 3 ? normalizedNum.slice(-3) : null;
    
    // Check if any bet matches this number AND this station
    return betList.some(bet => {
      // Check if this bet includes the current station
      const betStations = Array.isArray(bet.station) ? bet.station : [bet.station];
      const stationMatch = betStations.includes(stationName);
      
      if (!stationMatch) return false;
      
      // Check if any number in this bet matches
      if (bet.numbers && Array.isArray(bet.numbers)) {
        return bet.numbers.some(betNum => {
          const betNumStr = String(betNum).trim();
          let normalizedBetNum = betNumStr;
          if (betNumStr.length === 1) {
            normalizedBetNum = '0' + betNumStr;
          }
          
          // Match based on length
          if (normalizedBetNum.length === 2) {
            return last2 === normalizedBetNum;
          } else if (normalizedBetNum.length === 3 && last3) {
            return last3 === normalizedBetNum;
          }
          return false;
        });
      }
      return false;
    });
  };

  // Prize order from 8th to special with font sizes
  const prizeOrder = [
    { key: 'eighth', name: 'Giải 8', fontSize: 'text-2xl' },      // Giải 8: gấp đôi
    { key: 'seventh', name: 'Giải 7', fontSize: 'text-base' },
    { key: 'sixth', name: 'Giải 6', fontSize: 'text-base' },
    { key: 'fifth', name: 'Giải 5', fontSize: 'text-base' },
    { key: 'fourth', name: 'Giải 4', fontSize: 'text-base' },
    { key: 'third', name: 'Giải 3', fontSize: 'text-base' },
    { key: 'second', name: 'Giải 2', fontSize: 'text-base' },
    { key: 'first', name: 'Giải 1', fontSize: 'text-base' },
    { key: 'special', name: 'ĐB', fontSize: 'text-xl' }           // Giải ĐB: gấp 1.5
  ];

  const formatNumber = (num) => {
    if (!num) return '-';
    return Array.isArray(num) ? num.join(', ') : num;
  };

  if (isMultiStation) {
    // Multiple stations - render as table with columns
    const stations = Object.keys(results);
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-lg shadow-lg p-6 mb-6 border-2 border-blue-200"
      >
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <span className="mr-2">🎲</span>
          Kết quả xổ số
        </h2>

        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="bg-gradient-to-r from-blue-100 to-blue-50">
                <th className="px-3 py-3 text-left text-xs font-bold text-gray-700 border-b-2 border-blue-300 sticky left-0 bg-blue-100">
                  Giải
                </th>
                {stations.map(station => (
                  <th key={station} className="px-3 py-3 text-center text-xs font-bold text-gray-700 border-b-2 border-blue-300 min-w-[120px]">
                    <div className="flex flex-col items-center">
                      <span className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm font-semibold">
                        {results[station].province || station.toUpperCase()}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {prizeOrder.map((prize, idx) => {
                const isSpecial = prize.key === 'special';
                return (
                  <tr key={prize.key} className={isSpecial ? 'bg-red-50' : (idx % 2 === 0 ? 'bg-white' : 'bg-gray-50')}>
                    <td className={`px-3 py-3 text-sm font-bold border-b sticky left-0 bg-inherit whitespace-nowrap ${
                      isSpecial ? 'text-red-700 text-base border-red-300' : 'text-gray-900 border-gray-200'
                    }`}>
                      {prize.name}
                    </td>
                    {stations.map(station => {
                      const stationData = results[station];
                      const value = stationData[prize.key];
                      const formatted = formatNumber(value);
                      
                      return (
                        <td key={station} className={`px-3 py-3 text-center ${
                          isSpecial ? 'border-b border-red-300' : 'border-b border-gray-200'
                        }`} style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
                          {formatted === '-' ? (
                            <span className="text-gray-400">-</span>
                          ) : (
                            <div className="font-bold whitespace-pre-line">
                              {formatted.split(', ').map((num, i) => {
                                const isWon = isWinningNumber(num, station);
                                return (
                                  <div 
                                    key={i}
                                    className={`inline-block px-1 rounded ${
                                      isWon 
                                        ? 'bg-yellow-300 text-yellow-900 ring-2 ring-yellow-500 shadow-md' 
                                        : (isSpecial ? 'text-red-600' : 'text-blue-700')
                                    } ${prize.fontSize || 'text-base'}`}
                                  >
                                    {num}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Date info */}
        {stations.length > 0 && results[stations[0]].date && (
          <div className="mt-4 text-sm text-gray-600 text-center">
            <span className="font-medium">Ngày:</span> {results[stations[0]].date}
          </div>
        )}
      </motion.div>
    );
  }

  // Single station - render as simple 2-column table
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-lg shadow-lg p-6 mb-6 border-2 border-blue-200"
    >
      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
        <span className="mr-2">🎲</span>
        Kết quả xổ số
        {results.province && (
          <span className="ml-3 text-sm font-normal text-gray-600">
            {results.province}
          </span>
        )}
      </h3>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-blue-100">
              <th className="px-4 py-3 text-left text-sm font-bold text-gray-700 border-b-2 border-blue-300">
                Giải
              </th>
              <th className="px-4 py-3 text-center text-sm font-bold text-gray-700 border-b-2 border-blue-300">
                Số trúng
              </th>
            </tr>
          </thead>
          <tbody>
            {prizeOrder.map((prize, idx) => {
              const value = results[prize.key];
              const formatted = formatNumber(value);
              const isSpecial = prize.key === 'special';
              
              return (
                <tr key={prize.key} className={isSpecial ? 'bg-red-50' : (idx % 2 === 0 ? 'bg-white' : 'bg-gray-50')}>
                  <td className={`px-4 py-3 text-sm font-bold border-b ${
                    isSpecial ? 'text-red-700 text-base border-red-300' : 'text-gray-900 border-gray-200'
                  }`}>
                    {prize.name}
                  </td>
                  <td className={`px-4 py-3 text-center ${
                    isSpecial ? 'border-b border-red-300' : 'border-b border-gray-200'
                  }`} style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
                    {formatted === '-' ? (
                      <span className="text-gray-400">-</span>
                    ) : (
                      <div className="font-bold whitespace-pre-line">
                        {formatted.split(', ').map((num, i) => {
                          // For single station, use the station name from results
                          const stationName = results.station || results.province || '';
                          const isWon = isWinningNumber(num, stationName);
                          return (
                            <div 
                              key={i}
                              className={`inline-block px-2 py-1 rounded ${
                                isWon 
                                  ? 'bg-yellow-300 text-yellow-900 ring-2 ring-yellow-500 shadow-lg' 
                                  : (isSpecial ? 'text-red-600' : 'text-blue-700')
                              } ${prize.fontSize || 'text-base'}`}
                            >
                              {num}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {results.date && (
        <div className="mt-4 text-sm text-gray-600 text-center">
          <span className="font-medium">Ngày:</span> {results.date}
        </div>
      )}
    </motion.div>
  );
}
