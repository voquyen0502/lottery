const HISTORY_KEY = 'lottery_checker_history';
const LOTTERY_RESULTS_KEY = 'lottery_results_cache';
const MAX_HISTORY = 3;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export function saveToHistory(query) {
  try {
    const history = getHistory();
    
    // Add new query to the beginning
    const newHistory = [
      {
        ...query,
        timestamp: new Date().toISOString()
      },
      ...history
    ];
    
    // Keep only the last MAX_HISTORY items
    const trimmedHistory = newHistory.slice(0, MAX_HISTORY);
    
    localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmedHistory));
    
    return trimmedHistory;
  } catch (error) {
    console.error('Error saving to localStorage:', error);
    return [];
  }
}

export function getHistory() {
  try {
    const stored = localStorage.getItem(HISTORY_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return [];
  }
}

export function clearHistory() {
  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch (error) {
    console.error('Error clearing localStorage:', error);
  }
}

// Cache lottery results by station + date
export function saveLotteryResult(station, date, results) {
  try {
    const cache = getLotteryResultsCache();
    const key = `${station}_${date}`;
    
    cache[key] = {
      results,
      timestamp: new Date().toISOString()
    };
    
    localStorage.setItem(LOTTERY_RESULTS_KEY, JSON.stringify(cache));
  } catch (error) {
    console.error('Error saving lottery results to cache:', error);
  }
}

export function getCachedLotteryResult(station, date) {
  try {
    const cache = getLotteryResultsCache();
    const key = `${station}_${date}`;
    const cached = cache[key];
    
    if (!cached) return null;
    
    // Check if cache is still valid (within CACHE_DURATION)
    const cacheAge = new Date() - new Date(cached.timestamp);
    if (cacheAge > CACHE_DURATION) {
      // Cache expired, remove it
      delete cache[key];
      localStorage.setItem(LOTTERY_RESULTS_KEY, JSON.stringify(cache));
      return null;
    }
    
    return cached.results;
  } catch (error) {
    console.error('Error reading lottery results from cache:', error);
    return null;
  }
}

function getLotteryResultsCache() {
  try {
    const stored = localStorage.getItem(LOTTERY_RESULTS_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error('Error reading lottery cache:', error);
    return {};
  }
}

export function clearLotteryCache() {
  try {
    localStorage.removeItem(LOTTERY_RESULTS_KEY);
  } catch (error) {
    console.error('Error clearing lottery cache:', error);
  }
}
