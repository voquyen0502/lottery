import { useState } from 'react';
import { getTodayDate } from '../utils/xoso';

export default function InputSection({ onAnalyze, onFetch, onReset, loading, hasData }) {
  const [message, setMessage] = useState('');
  const [date, setDate] = useState(getTodayDate());

  const handleAnalyze = () => {
    if (!message.trim()) {
      alert('Vui lòng nhập tin nhắn');
      return;
    }
    onAnalyze(message, date);
  };

  const handleFetch = () => {
    onFetch(date);
  };

  const handleReset = () => {
    setMessage('');
    setDate(getTodayDate());
    onReset();
  };

  return (
    <div className="card mb-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        🎰 Dò Vé Số
      </h2>

      <div className="space-y-4">
        {/* Message input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tin nhắn
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder='Ví dụ: "Đài Đồng Nai, dò số 12345, 67890"'
            rows={4}
            className="input-field resize-none"
            disabled={loading}
          />
        </div>

        {/* Date input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ngày quay
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="input-field"
            disabled={loading}
          />
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={handleAnalyze}
            disabled={loading || !message.trim()}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '⏳ Đang xử lý...' : '🤖 Phân tích'}
          </button>

          <button
            onClick={handleFetch}
            disabled={loading || (!message.trim() && !hasData)}
            className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '⏳ Đang lấy...' : '📊 Dò kết quả'}
          </button>

          <button
            onClick={handleReset}
            disabled={loading}
            className="btn-danger disabled:opacity-50 disabled:cursor-not-allowed"
          >
            🔄 Reset
          </button>
        </div>
      </div>
    </div>
  );
}
