const HISTORY_KEY = 'lottery_checker_history';
const MAX_HISTORY = 3;

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
