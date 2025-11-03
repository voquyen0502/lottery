import { useState } from 'react';
import InputSection from './components/InputSection';
import BetListTable from './components/BetListTable';
import BetResultsTable from './components/BetResultsTable';
import LotteryResults from './components/LotteryResults';
import LoadingSpinner from './components/LoadingSpinner';
import HistorySection from './components/HistorySection';
import StationList from './components/StationList';
import { parseMessageWithGemini } from './utils/gemini';
import { fetchLotteryResult } from './utils/xoso';
import { checkBetList } from './utils/checker';
import { saveToHistory } from './utils/storage';

function App() {
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [parsedData, setParsedData] = useState(null);
  const [lotteryResults, setLotteryResults] = useState(null);
  const [checkResults, setCheckResults] = useState(null);

  const handleAnalyze = async (message, date) => {
    setLoading(true);
    setLoadingMessage('Đang phân tích...');

    try {
      // Truyền cả message và date vào Gemini để xác định "2đ"
      const result = await parseMessageWithGemini(message, date);

      if (result.success) {
        setParsedData(result.data);
        
        // Save to history
        if (result.data.bet_list && result.data.bet_list.length > 0) {
          saveToHistory({
            bet_list: result.data.bet_list,
            date: date
          });
        }
      } else {
        alert(`Lỗi: ${result.error}`);
      }
    } catch (error) {
      alert(`Lỗi: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleFetch = async (date) => {
    if (!parsedData || !parsedData.bet_list) {
      alert('Vui lòng phân tích trước');
      return;
    }

    setLoading(true);
    setLoadingMessage('Đang lấy kết quả xổ số...');

    try {
      // Collect all unique stations from bet_list
      const stationsSet = new Set();
      const stationRegionMap = new Map();
      
      parsedData.bet_list.forEach(bet => {
        const stations = Array.isArray(bet.station) ? bet.station : [bet.station];
        stations.forEach(station => {
          if (station) {
            stationsSet.add(station);
            stationRegionMap.set(station, bet.region);
          }
        });
      });

      const uniqueStations = Array.from(stationsSet);
      console.log('Fetching results for stations:', uniqueStations);

      // Fetch results for all stations
      const allResults = {};
      let fetchedCount = 0;
      
      for (const station of uniqueStations) {
        fetchedCount++;
        setLoadingMessage(`Đang lấy kết quả ${fetchedCount}/${uniqueStations.length}: ${station}...`);
        
        const region = stationRegionMap.get(station);
        const result = await fetchLotteryResult(station, date, region || null);
        
        if (result.success) {
          allResults[station] = result.data;
          console.log(`✅ Fetched results for ${station}:`, result.data);
        } else {
          console.error(`❌ Failed to fetch ${station}:`, result.error);
          alert(`Lỗi lấy kết quả ${station}: ${result.error}`);
        }
      }

      if (Object.keys(allResults).length > 0) {
        console.log('All lottery results:', allResults);
        setLotteryResults(allResults);

        // Check bet list against lottery results
        const checked = checkBetList(parsedData.bet_list, allResults);
        console.log('Check results:', checked);
        setCheckResults(checked);
      } else {
        alert('Không lấy được kết quả xổ số nào');
      }
    } catch (error) {
      console.error('Error in handleFetch:', error);
      alert(`Lỗi: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setParsedData(null);
    setLotteryResults(null);
    setCheckResults(null);
  };

  const handleLoadHistory = (item) => {
    // Convert old format to new bet_list format if needed
    if (item.station && item.numbers) {
      setParsedData({
        bet_list: [{
          station: [item.station],
          type: 'da',
          numbers: item.numbers,
          money: 10000,
          note: 'Từ lịch sử'
        }]
      });
    } else {
      setParsedData(item);
    }
    setLotteryResults(null);
    setCheckResults(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-6 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🎰 Lottery Checker
          </h1>
          <p className="text-gray-600">
            Dò vé số thông minh với AI
          </p>
        </div>

        {/* Main content */}
        <InputSection
          onAnalyze={handleAnalyze}
          onFetch={handleFetch}
          onReset={handleReset}
          loading={loading}
        />

        {parsedData && parsedData.bet_list && (
          <BetListTable betList={parsedData.bet_list} />
        )}

        {checkResults && <BetResultsTable results={checkResults} />}

        {lotteryResults && (
          <LotteryResults 
            results={lotteryResults} 
            betList={parsedData?.bet_list || []}
          />
        )}

        <StationList />

        <HistorySection onLoadHistory={handleLoadHistory} />

        {/* Loading spinner */}
        {loading && <LoadingSpinner message={loadingMessage} />}

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p className="mt-1">Made with ❤️ for mobile</p>
        </div>
      </div>
    </div>
  );
}

export default App;

