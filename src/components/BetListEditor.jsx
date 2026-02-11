import { useState, useEffect } from 'react';
import { getScheduleForDate } from '../utils/xoso';

const BET_TYPES = [
  { value: 'bao-lo', label: 'Bao lô' },
  { value: 'xien', label: 'Xiên' },
  { value: '7-lo', label: '7 lô' },
  { value: 'xiu-chu', label: 'Xỉu chủ' }
];

const REGIONS = [
  { value: 'mien-nam', label: 'Miền Nam' },
  { value: 'mien-trung', label: 'Miền Trung' },
  { value: 'mien-bac', label: 'Miền Bắc' }
];

function BetListEditor({ betList, onChange, selectedDate }) {
  const [editingBets, setEditingBets] = useState([]);
  const [availableStations, setAvailableStations] = useState({});
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize editing bets from props only once
  useEffect(() => {
    if (!isInitialized && betList && betList.length > 0) {
      setEditingBets(betList.map(bet => ({ ...bet, id: crypto.randomUUID() })));
      setIsInitialized(true);
    } else if (!isInitialized && (!betList || betList.length === 0)) {
      setEditingBets([]);
      setIsInitialized(true);
    }
  }, [betList, isInitialized]);

  // Load available stations when date changes
  useEffect(() => {
    if (selectedDate) {
      const schedule = getScheduleForDate(new Date(selectedDate));
      setAvailableStations(schedule);
    }
  }, [selectedDate]);

  // Add new bet
  const handleAddBet = () => {
    const newBet = {
      id: crypto.randomUUID(),
      station: [],
      region: 'mien-nam',
      type: 'bao-lo',
      numbers: [''],
      money: 10000,
      note: null
    };
    const updated = [...editingBets, newBet];
    setEditingBets(updated);
    notifyChange(updated);
  };

  // Remove bet
  const handleRemoveBet = (id) => {
    const updated = editingBets.filter(bet => bet.id !== id);
    setEditingBets(updated);
    notifyChange(updated);
  };

  // Update bet field
  const handleUpdateBet = (id, field, value) => {
    const updated = editingBets.map(bet => {
      if (bet.id === id) {
        const updatedBet = { ...bet, [field]: value };
        
        // When region changes, reset stations and load new ones
        if (field === 'region') {
          updatedBet.station = [];
        }
        
        return updatedBet;
      }
      return bet;
    });
    setEditingBets(updated);
    notifyChange(updated);
  };

  // Update numbers array
  const handleUpdateNumbers = (id, index, value) => {
    const updated = editingBets.map(bet => {
      if (bet.id === id) {
        const newNumbers = [...bet.numbers];
        newNumbers[index] = value;
        return { ...bet, numbers: newNumbers };
      }
      return bet;
    });
    setEditingBets(updated);
    notifyChange(updated);
  };

  // Add number to bet
  const handleAddNumber = (id) => {
    const updated = editingBets.map(bet => {
      if (bet.id === id) {
        return { ...bet, numbers: [...bet.numbers, ''] };
      }
      return bet;
    });
    setEditingBets(updated);
    notifyChange(updated);
  };

  // Remove number from bet
  const handleRemoveNumber = (id, index) => {
    const updated = editingBets.map(bet => {
      if (bet.id === id) {
        const newNumbers = bet.numbers.filter((_, i) => i !== index);
        return { ...bet, numbers: newNumbers.length > 0 ? newNumbers : [''] };
      }
      return bet;
    });
    setEditingBets(updated);
    notifyChange(updated);
  };

  // Toggle station selection
  const handleToggleStation = (id, stationKey) => {
    const updated = editingBets.map(bet => {
      if (bet.id === id) {
        const stations = bet.station || [];
        const newStations = stations.includes(stationKey)
          ? stations.filter(s => s !== stationKey)
          : [...stations, stationKey];
        return { ...bet, station: newStations };
      }
      return bet;
    });
    setEditingBets(updated);
    notifyChange(updated);
  };

  // Notify parent of changes
  const notifyChange = (bets) => {
    // Remove id field before sending to parent
    // eslint-disable-next-line no-unused-vars
    const cleanedBets = bets.map(({ id, ...bet }) => bet);
    onChange(cleanedBets);
  };

  // Get stations for a region
  const getStationsForRegion = (region) => {
    if (!availableStations[region]) return [];
    return availableStations[region];
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Chỉnh sửa danh sách cược</h2>
        <button
          onClick={handleAddBet}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
        >
          <span className="text-xl">+</span>
          Thêm cược
        </button>
      </div>

      {editingBets.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500 mb-4">Chưa có cược nào</p>
          <button
            onClick={handleAddBet}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Thêm cược đầu tiên
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {editingBets.map((bet, betIndex) => (
            <div
              key={bet.id}
              className="bg-white border-2 border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-700">Cược #{betIndex + 1}</h3>
                <button
                  onClick={() => handleRemoveBet(bet.id)}
                  className="text-red-600 hover:text-red-800 font-bold text-xl"
                  title="Xóa cược"
                >
                  ×
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Region Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vùng miền
                  </label>
                  <select
                    value={bet.region}
                    onChange={(e) => handleUpdateBet(bet.id, 'region', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {REGIONS.map(region => (
                      <option key={region.value} value={region.value}>
                        {region.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Bet Type Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Loại cược
                  </label>
                  <select
                    value={bet.type}
                    onChange={(e) => handleUpdateBet(bet.id, 'type', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {BET_TYPES.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Money Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tiền cược (VNĐ)
                  </label>
                  <input
                    type="number"
                    value={bet.money}
                    onChange={(e) => handleUpdateBet(bet.id, 'money', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="0"
                    step="1000"
                  />
                </div>

                {/* Note Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ghi chú (tùy chọn)
                  </label>
                  <input
                    type="text"
                    value={bet.note || ''}
                    onChange={(e) => handleUpdateBet(bet.id, 'note', e.target.value || null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Nhập ghi chú..."
                  />
                </div>
              </div>

              {/* Station Selection */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chọn đài (có thể chọn nhiều)
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {getStationsForRegion(bet.region).map(station => (
                    <button
                      key={station.key}
                      onClick={() => handleToggleStation(bet.id, station.key)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        (bet.station || []).includes(station.key)
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {station.name}
                    </button>
                  ))}
                </div>
                {getStationsForRegion(bet.region).length === 0 && (
                  <p className="text-sm text-gray-500 italic">
                    Không có đài nào trong vùng này vào ngày đã chọn
                  </p>
                )}
              </div>

              {/* Numbers Input */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Các số đánh
                </label>
                <div className="space-y-2">
                  {bet.numbers.map((number, idx) => (
                    <div key={idx} className="flex gap-2">
                      <input
                        type="text"
                        value={number}
                        onChange={(e) => handleUpdateNumbers(bet.id, idx, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Nhập số (VD: 01, 25, 123)"
                      />
                      {bet.numbers.length > 1 && (
                        <button
                          onClick={() => handleRemoveNumber(bet.id, idx)}
                          className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                          title="Xóa số"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={() => handleAddNumber(bet.id)}
                    className="w-full px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                  >
                    + Thêm số
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default BetListEditor;
