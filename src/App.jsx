import { useState } from 'react';
import InputSection from './components/InputSection';
import BetListTable from './components/BetListTable';
import BetListEditor from './components/BetListEditor';
import BetResultsTable from './components/BetResultsTable';
import LotteryResults from './components/LotteryResults';
import LoadingSpinner from './components/LoadingSpinner';
import StationList from './components/StationList';
import { parseMessageWithGemini } from './utils/gemini';
import { fetchLotteryResult } from './utils/xoso';
import { checkBetList } from './utils/checker';
import { getCachedLotteryResult, saveLotteryResult } from './utils/storage';

function App() {
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [parsedData, setParsedData] = useState(null);
  const [lotteryResults, setLotteryResults] = useState(null);
  const [checkResults, setCheckResults] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const handleAnalyze = async (message, date) => {
    setLoading(true);
    setLoadingMessage('Đang phân tích...');
    setSelectedDate(date); // Save selected date for editor

    try {
      // Truyền cả message và date vào Gemini để xác định "2đ"
      const result = await parseMessageWithGemini(message, date);

      if (result.success) {
        setParsedData(result.data);
      } else {
        alert(`Lỗi: ${result.error}`);
      }
    } catch (error) {
      alert(`Lỗi: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleBetListChange = (updatedBetList) => {
    setParsedData({
      ...parsedData,
      bet_list: updatedBetList
    });
    // Clear check results when bet list changes
    setCheckResults(null);
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
      let cachedCount = 0;
      
      for (const station of uniqueStations) {
        fetchedCount++;
        
        // Check cache first
        const cached = getCachedLotteryResult(station, date);
        if (cached) {
          cachedCount++;
          allResults[station] = cached;
          console.log(`📦 Using cached results for ${station}`);
          setLoadingMessage(`Đang lấy kết quả ${fetchedCount}/${uniqueStations.length}: ${station} (từ cache)...`);
          continue;
        }
        
        // Fetch from server if not cached
        setLoadingMessage(`Đang lấy kết quả ${fetchedCount}/${uniqueStations.length}: ${station}...`);
        
        const region = stationRegionMap.get(station);
        const result = await fetchLotteryResult(station, date, region || null);
        
        if (result.success) {
          allResults[station] = result.data;
          // Save to cache
          saveLotteryResult(station, date, result.data);
          console.log(`✅ Fetched and cached results for ${station}:`, result.data);
        } else {
          console.error(`❌ Failed to fetch ${station}:`, result.error);
          alert(`Lỗi lấy kết quả ${station}: ${result.error}`);
        }
      }

      if (Object.keys(allResults).length > 0) {
        console.log(`All lottery results (${cachedCount} từ cache, ${fetchedCount - cachedCount} mới):`, allResults);
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

  // Open manual editor: create empty bet_list if none exists
  const handleOpenManualEditor = (date) => {
    if (!parsedData) {
      setParsedData({ bet_list: [] });
    }
    if (date) setSelectedDate(date);
    setIsEditing(true);
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
          hasData={parsedData && parsedData.bet_list && parsedData.bet_list.length > 0}
        />

        {/* Quick action: allow manual bet list editing even without parsing */}
        <div className="flex justify-end mb-4">
          <button
            onClick={() => handleOpenManualEditor(selectedDate)}
            className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
          >
            ➕ Thêm thủ công
          </button>
        </div>

        {parsedData && parsedData.bet_list && (
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Danh sách cược</h2>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  isEditing
                    ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {isEditing ? '📋 Xem bảng' : '✏️ Chỉnh sửa'}
              </button>
            </div>
            
            {isEditing ? (
              <BetListEditor
                betList={parsedData.bet_list}
                onChange={handleBetListChange}
                selectedDate={selectedDate}
              />
            ) : (
              <BetListTable betList={parsedData.bet_list} />
            )}
          </div>
        )}

        {checkResults && <BetResultsTable results={checkResults} />}

        {lotteryResults && (
          <LotteryResults 
            results={lotteryResults} 
            betList={parsedData?.bet_list || []}
          />
        )}

        <StationList />

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

