// Payout multipliers for different bet types
const PAYOUT_RATES = {
  'xien': {
    2: 550,      // Xiên 2: 1 ăn 550
    3: 550 * 3,  // Xiên 3: 1 ăn 550*3 = 1650
    4: 550 * 8   // Xiên 4: 1 ăn 550*8 = 4400
  },
  'bao-lo': {
    2: 75,     // Bao lô 2: 1 ăn 75
    3: 650     // Bao lô 3: 1 ăn 650
  },
  '7-lo': {
    2: 75,     // 7 lô 2 số cuối: 1 ăn 75
    3: 650     // 7 lô 3 số cuối: 1 ăn 650
  },
  'xiu-chu': {
    2: 75,     // Xỉu chủ 2 số cuối: 1 ăn 75
    3: 650     // Xỉu chủ 3 số cuối: 1 ăn 650
  },
  'da': 85         // Đá thẳng (lô): 1 ăn 85
};

// Station multipliers for xiên (multiple stations)
const STATION_MULTIPLIERS = {
  1: 1,      // 1 đài: x1
  2: 13.5,   // 2 đài: x13.5
  3: 27,     // 3 đài: x27 (tạm tính)
  4: 40.5    // 4 đài: x40.5 (tạm tính)
};

// Helper function to check if a number matches in lottery results
function checkNumberMatch(num, lotteryResults, isMultiStation) {
  const numStr = String(num).trim();
  
  // Normalize: pad single digit with 0
  let normalizedNum = numStr;
  if (numStr.length === 1) {
    normalizedNum = '0' + numStr;
  }
  
  if (normalizedNum.length === 2) {
    // 2-digit: check last 2 digits using allEndings
    const allEndings = extractAllEndings(lotteryResults, isMultiStation);
    return allEndings.includes(normalizedNum);
  } else if (normalizedNum.length === 3) {
    // 3-digit: check last 3 digits in full results
    return checkThreeDigitMatch(normalizedNum, lotteryResults, isMultiStation);
  }
  return false;
}

function checkThreeDigitMatch(numStr, lotteryResults, isMultiStation) {
  const last3 = numStr.slice(-3);
  
  if (isMultiStation) {
    // Check across all stations
    for (const stationData of Object.values(lotteryResults)) {
      if (checkInSingleStation(last3, stationData)) {
        return true;
      }
    }
    return false;
  } else {
    return checkInSingleStation(last3, lotteryResults);
  }
}

function checkInSingleStation(last3, data) {
  const allPrizes = [
    data.special,
    ...(Array.isArray(data.first) ? data.first : [data.first]),
    ...(Array.isArray(data.second) ? data.second : [data.second]),
    ...(Array.isArray(data.third) ? data.third : [data.third]),
    ...(Array.isArray(data.fourth) ? data.fourth : [data.fourth]),
    ...(Array.isArray(data.fifth) ? data.fifth : [data.fifth]),
    ...(Array.isArray(data.sixth) ? data.sixth : [data.sixth]),
    ...(Array.isArray(data.seventh) ? data.seventh : [data.seventh]),
    ...(Array.isArray(data.eighth) ? data.eighth : [data.eighth])
  ].filter(Boolean);

  return allPrizes.some(prizeNum => {
    if (!prizeNum) return false;
    const prizeStr = String(prizeNum).trim();
    return prizeStr.length >= 3 && prizeStr.slice(-3) === last3;
  });
}

function extractAllEndings(lotteryResults, isMultiStation) {
  if (isMultiStation) {
    const allEndings = new Set();
    Object.values(lotteryResults).forEach(stationData => {
      const endings = extractAllEndingsFromData(stationData);
      endings.forEach(e => allEndings.add(e));
    });
    return Array.from(allEndings);
  } else {
    return extractAllEndingsFromData(lotteryResults);
  }
}

function extractAllEndingsFromData(data) {
  const endings = new Set();
  
  const allPrizes = [
    data.special,
    ...(Array.isArray(data.first) ? data.first : [data.first]),
    ...(Array.isArray(data.second) ? data.second : [data.second]),
    ...(Array.isArray(data.third) ? data.third : [data.third]),
    ...(Array.isArray(data.fourth) ? data.fourth : [data.fourth]),
    ...(Array.isArray(data.fifth) ? data.fifth : [data.fifth]),
    ...(Array.isArray(data.sixth) ? data.sixth : [data.sixth]),
    ...(Array.isArray(data.seventh) ? data.seventh : [data.seventh]),
    ...(Array.isArray(data.eighth) ? data.eighth : [data.eighth])
  ].filter(Boolean);

  allPrizes.forEach(num => {
    if (num) {
      const numStr = String(num).trim();
      if (numStr.length >= 2) {
        endings.add(numStr.slice(-2));
      }
    }
  });

  return Array.from(endings);
}

// Count how many times a number matches (for bao-lo, 7-lo, xiu-chu)
// A number can match multiple times if it appears in different prizes
// betStations: array of station names that the player bet on (e.g., ["tp-hcm", "dong-thap"])
function countMatches(num, lotteryResults, isMultiStation, prizeFilter = null, betStations = null) {
  const numStr = String(num);
  let matchCount = 0;

  if (isMultiStation) {
    // Only count matches from stations that the player bet on
    Object.entries(lotteryResults).forEach(([stationKey, stationData]) => {
      // If betStations is provided, only check those stations
      if (!betStations || betStations.includes(stationKey)) {
        matchCount += countMatchesInStation(numStr, stationData, prizeFilter);
      }
    });
  } else {
    matchCount = countMatchesInStation(numStr, lotteryResults, prizeFilter);
  }

  return matchCount;
}

function countMatchesInStation(numStr, data, prizeFilter = null) {
  let count = 0;
  
  // Define which prizes to check
  let prizesToCheck = {
    special: data.special,
    first: data.first,
    second: data.second,
    third: data.third,
    fourth: data.fourth,
    fifth: data.fifth,
    sixth: data.sixth,
    seventh: data.seventh,
    eighth: data.eighth
  };

  // Apply prize filter if specified
  if (prizeFilter) {
    const filtered = {};
    prizeFilter.forEach(key => {
      if (prizesToCheck[key]) {
        filtered[key] = prizesToCheck[key];
      }
    });
    prizesToCheck = filtered;
  }

  // Flatten all prize numbers
  const allPrizes = [];
  Object.values(prizesToCheck).forEach(prize => {
    if (Array.isArray(prize)) {
      allPrizes.push(...prize);
    } else if (prize) {
      allPrizes.push(prize);
    }
  });

  // Count matches
  allPrizes.forEach(prizeNum => {
    if (!prizeNum) return;
    const prizeStr = String(prizeNum).trim();
    
    // Normalize numStr: pad with 0 if needed for 2-digit comparison
    let normalizedNum = numStr;
    if (numStr.length === 1) {
      // Single digit like "7" should be treated as "07" for 2-digit comparison
      normalizedNum = '0' + numStr;
    }
    
    if (normalizedNum.length === 2) {
      // 2-digit: check last 2 digits
      if (prizeStr.length >= 2 && prizeStr.slice(-2) === normalizedNum) {
        count++;
      }
    } else if (normalizedNum.length === 3) {
      // 3-digit: check last 3 digits
      if (prizeStr.length >= 3 && prizeStr.slice(-3) === normalizedNum) {
        count++;
      }
    }
  });

  return count;
}

// Calculate actual collected amount based on bet type
export function calculateActualBetAmount(bet) {
  const betType = bet.type || 'da';
  const betAmount = bet.money || 0;
  const numStations = Array.isArray(bet.station) ? bet.station.length : 1;
  const numNumbers = bet.numbers ? bet.numbers.length : 0;

  switch (betType) {
    case 'xien': {
      // Xiên: số con đánh × số đài × số tiền cược × 13.5 × hệ_số
      // Hệ số dựa trên bảng:
      // 1 đài 2 con: ×1
      // 2 đài 2 con: ×1
      // 2 đài 3 con: ×2
      // 2 đài 4 con: ×3
      // 3 đài 2 con: ×2
      // 3 đài 3 con: ×4
      let xienMultiplier = 1;
      if (numStations === 2 && numNumbers === 3) xienMultiplier = 2;
      else if (numStations === 2 && numNumbers === 4) xienMultiplier = 3;
      else if (numStations === 3 && numNumbers === 2) xienMultiplier = 2;
      else if (numStations === 3 && numNumbers === 3) xienMultiplier = 4;
      
      return numNumbers * numStations * betAmount * 13.5 * xienMultiplier;
    }

    case 'bao-lo': {
      // Bao lô: số con đánh × số đài × số tiền cược × 13.5
      // VD: 2 số × 2 đài × 5000 × 13.5 = 270,000
      return numNumbers * numStations * betAmount * 13.5;
    }

    case '7-lo': {
      // 7 lô: số con đánh × số đài × 5.25
      // VD: 2 số × 2 đài × 3000 × 5.25 = 63,000
      return numNumbers * numStations * betAmount * 5.25;
    }

    case 'xiu-chu': {
      // Xỉu chủ: số con đánh × số đài × 1.5
      // VD: 2 số × 2 đài × 20000 × 1.5 = 120,000
      return numNumbers * numStations * betAmount * 1.5;
    }

    case 'da': 
    default: {
      // Đá thẳng (lô): tiền cược × số lượng số × số lượng đài
      // VD: 10000 × 2 số × 2 đài = 40,000
      return betAmount * numNumbers * numStations;
    }
  }
}

// Check bet list and calculate results
export function checkBetList(betList, lotteryResults) {
  console.log('checkBetList called with:', { betList, lotteryResults });
  
  if (!betList || !Array.isArray(betList) || betList.length === 0) {
    console.log('checkBetList: invalid betList');
    return null;
  }

  if (!lotteryResults) {
    console.log('checkBetList: no lottery results');
    return null;
  }

  const winningBets = [];
  const losingBets = [];
  let totalBet = 0;
  let totalPayout = 0;

  // Check if lotteryResults is a map of multiple stations or single station data
  const isMultiStation = typeof lotteryResults === 'object' && 
                         !lotteryResults.special && 
                         !lotteryResults.first;
  
  console.log('Is multi-station results:', isMultiStation);

  // Extract all endings from all stations
  const getAllEndings = () => {
    if (isMultiStation) {
      const allEndings = new Set();
      Object.values(lotteryResults).forEach(stationData => {
        const endings = extractAllEndings(stationData);
        endings.forEach(e => allEndings.add(e));
      });
      return Array.from(allEndings);
    } else {
      return extractAllEndings(lotteryResults);
    }
  };

  const allEndings = getAllEndings();
  console.log('All endings from all stations:', allEndings);

  betList.forEach((bet) => {
    const betType = bet.type || 'da';
    const numbers = bet.numbers || [];
    const betAmount = bet.money || 0;
    const numStations = Array.isArray(bet.station) ? bet.station.length : 1;
    
    // Calculate actual collected amount
    const actualTotalBet = calculateActualBetAmount(bet);
    totalBet += actualTotalBet;

    console.log(`Bet: ${betType}, ${numbers.length} số, ${numStations} đài, betAmount=${betAmount}, actualBet=${actualTotalBet}`);

    if (betType === 'xien') {
      // Xiên: cần ít nhất 2 số trúng thì mới trúng
      const matchedNumbers = numbers.filter(num => {
        return checkNumberMatch(num, lotteryResults, isMultiStation);
      });

      if (matchedNumbers.length >= 2) {
        // Payout dựa trên số lượng số trúng
        // 2 số trúng: 550 × tiền cược
        // 3 số trúng: 550 × 3 × tiền cược = 1650 × tiền cược
        // 4 số trúng: 550 × 8 × tiền cược = 4400 × tiền cược
        const multiplier = PAYOUT_RATES.xien[matchedNumbers.length] || PAYOUT_RATES.xien[2];
        const payout = betAmount * multiplier;
        const profit = payout - actualTotalBet;

        winningBets.push({
          station: bet.station || [],
          type: bet.type,
          numbers: matchedNumbers,
          prize: `Xiên ${matchedNumbers.length}/${numbers.length} trúng (${numStations} đài)`,
          betAmount: actualTotalBet,
          multiplier: multiplier,
          payout: payout,
          profit: profit
        });

        totalPayout += payout;
      } else {
        losingBets.push({
          station: bet.station || [],
          type: bet.type,
          numbers: numbers,
          betAmount: actualTotalBet
        });
      }
    } else if (betType === 'bao-lo') {
      // Bao lô: chỉ cần 1 số trúng là ăn, 1 số có thể trúng nhiều lần
      let totalMatchCount = 0;
      const matchedNumbers = [];

      numbers.forEach(num => {
        // Count matches for this number (only in stations the player bet on)
        const matchCount = countMatches(num, lotteryResults, isMultiStation, null, bet.station);
        
        if (matchCount > 0) {
          matchedNumbers.push({ num, matchCount });
          totalMatchCount += matchCount;
        }
      });

      if (totalMatchCount > 0) {
        // Get the number of digits from the first number (normalized)
        const firstNum = String(numbers[0]).trim();
        const normalizedNum = firstNum.length === 1 ? '0' + firstNum : firstNum;
        const numDigits = normalizedNum.length;
        const multiplier = PAYOUT_RATES['bao-lo'][numDigits] || PAYOUT_RATES['bao-lo'][2];
        
        // Payout = số con trúng (có thể trùng nhiều lần) × multiplier × tiền cược
        const payout = totalMatchCount * multiplier * betAmount;
        const profit = payout - actualTotalBet;

        winningBets.push({
          station: bet.station || [],
          type: bet.type,
          numbers: matchedNumbers.map(m => `${m.num}(×${m.matchCount})`),
          prize: `Bao lô ${numDigits} số (${totalMatchCount} lần trúng, ${numStations} đài)`,
          betAmount: actualTotalBet,
          multiplier: multiplier,
          payout: payout,
          profit: profit
        });

        totalPayout += payout;
      } else {
        losingBets.push({
          station: bet.station || [],
          type: bet.type,
          numbers: numbers,
          betAmount: actualTotalBet
        });
      }
    } else if (betType === '7-lo') {
      // 7 lô: giống bao lô nhưng chỉ nhìn vào các giải 8, 7, 6, 5, ĐB
      // Nếu cược 3 số cuối thì không có giải 8
      const firstNum = String(numbers[0]).trim();
      const normalizedNum = firstNum.length === 1 ? '0' + firstNum : firstNum;
      const numDigits = normalizedNum.length;
      const prizeFilter = numDigits === 3 
        ? ['seventh', 'sixth', 'fifth', 'special']  // Không có giải 8
        : ['eighth', 'seventh', 'sixth', 'fifth', 'special'];

      let totalMatchCount = 0;
      const matchedNumbers = [];

      numbers.forEach(num => {
        const matchCount = countMatches(num, lotteryResults, isMultiStation, prizeFilter, bet.station);
        
        if (matchCount > 0) {
          matchedNumbers.push({ num, matchCount });
          totalMatchCount += matchCount;
        }
      });

      if (totalMatchCount > 0) {
        const multiplier = PAYOUT_RATES['7-lo'][numDigits] || PAYOUT_RATES['7-lo'][2];
        const payout = totalMatchCount * multiplier * betAmount;
        const profit = payout - actualTotalBet;

        winningBets.push({
          station: bet.station || [],
          type: bet.type,
          numbers: matchedNumbers.map(m => `${m.num}(×${m.matchCount})`),
          prize: `7 lô ${numDigits} số (${totalMatchCount} lần trúng, ${numStations} đài)`,
          betAmount: actualTotalBet,
          multiplier: multiplier,
          payout: payout,
          profit: profit
        });

        totalPayout += payout;
      } else {
        losingBets.push({
          station: bet.station || [],
          type: bet.type,
          numbers: numbers,
          betAmount: actualTotalBet
        });
      }
    } else if (betType === 'xiu-chu') {
      // Xỉu chủ: giống bao lô
      // Nếu cược 2 số cuối: chỉ nhìn giải 8 và ĐB
      // Nếu cược 3 số cuối: chỉ nhìn giải 7 và ĐB
      const firstNum = String(numbers[0]).trim();
      const normalizedNum = firstNum.length === 1 ? '0' + firstNum : firstNum;
      const numDigits = normalizedNum.length;
      const prizeFilter = numDigits === 2 
        ? ['eighth', 'special']  // 2 số cuối: giải 8 và ĐB
        : ['seventh', 'special']; // 3 số cuối: giải 7 và ĐB

      let totalMatchCount = 0;
      const matchedNumbers = [];

      numbers.forEach(num => {
        const matchCount = countMatches(num, lotteryResults, isMultiStation, prizeFilter, bet.station);
        
        if (matchCount > 0) {
          matchedNumbers.push({ num, matchCount });
          totalMatchCount += matchCount;
        }
      });

      if (totalMatchCount > 0) {
        const multiplier = PAYOUT_RATES['xiu-chu'][numDigits] || PAYOUT_RATES['xiu-chu'][2];
        const payout = totalMatchCount * multiplier * betAmount;
        const profit = payout - actualTotalBet;

        winningBets.push({
          station: bet.station || [],
          type: bet.type,
          numbers: matchedNumbers.map(m => `${m.num}(×${m.matchCount})`),
          prize: `Xỉu chủ ${numDigits} số (${totalMatchCount} lần trúng, ${numStations} đài)`,
          betAmount: actualTotalBet,
          multiplier: multiplier,
          payout: payout,
          profit: profit
        });

        totalPayout += payout;
      } else {
        losingBets.push({
          station: bet.station || [],
          type: bet.type,
          numbers: numbers,
          betAmount: actualTotalBet
        });
      }
    } else {
      // Đá thẳng (lô): từng số riêng biệt
      numbers.forEach(num => {
        if (checkNumberMatch(num, lotteryResults, isMultiStation)) {
          const multiplier = PAYOUT_RATES['da'];
          const singleBetAmount = betAmount * numStations; // Thu từ 1 số trên nhiều đài
          const payout = betAmount * multiplier; // Trả thưởng
          const profit = payout - singleBetAmount;

          winningBets.push({
            station: bet.station || [],
            type: bet.type,
            numbers: [num],
            prize: `Đá thẳng (${numStations} đài)`,
            betAmount: singleBetAmount,
            multiplier: multiplier,
            payout: payout,
            profit: profit
          });

          totalPayout += payout;
        } else {
          const singleBetAmount = betAmount * numStations;
          losingBets.push({
            station: bet.station || [],
            type: bet.type,
            numbers: [num],
            betAmount: singleBetAmount
          });
        }
      });
    }
  });

  const netProfit = totalPayout - totalBet;
  const houseProfit = totalBet - totalPayout;

  return {
    winningBets,
    losingBets,
    summary: {
      totalBet,
      totalPayout,
      netProfit,
      houseProfit
    }
  };
}

export function checkNumbers(userNumbers, lotteryResults) {
  if (!userNumbers || !lotteryResults) {
    return [];
  }

  const results = [];
  
  // Extract all prize numbers from lottery results
  const prizes = [];
  const data = lotteryResults.data || lotteryResults;
  
  // Special prize (Giải đặc biệt)
  if (data.special) {
    prizes.push({ name: 'Giải đặc biệt', numbers: [data.special] });
  }
  
  // First prize (Giải nhất)
  if (data.first) {
    const numbers = Array.isArray(data.first) ? data.first : [data.first];
    prizes.push({ name: 'Giải nhất', numbers });
  }
  
  // Second prize (Giải nhì)
  if (data.second) {
    const numbers = Array.isArray(data.second) ? data.second : [data.second];
    prizes.push({ name: 'Giải nhì', numbers });
  }
  
  // Third prize (Giải ba)
  if (data.third) {
    const numbers = Array.isArray(data.third) ? data.third : [data.third];
    prizes.push({ name: 'Giải ba', numbers });
  }
  
  // Fourth prize (Giải tư)
  if (data.fourth) {
    const numbers = Array.isArray(data.fourth) ? data.fourth : [data.fourth];
    prizes.push({ name: 'Giải tư', numbers });
  }
  
  // Fifth prize (Giải năm)
  if (data.fifth) {
    const numbers = Array.isArray(data.fifth) ? data.fifth : [data.fifth];
    prizes.push({ name: 'Giải năm', numbers });
  }
  
  // Sixth prize (Giải sáu)
  if (data.sixth) {
    const numbers = Array.isArray(data.sixth) ? data.sixth : [data.sixth];
    prizes.push({ name: 'Giải sáu', numbers });
  }
  
  // Seventh prize (Giải bảy)
  if (data.seventh) {
    const numbers = Array.isArray(data.seventh) ? data.seventh : [data.seventh];
    prizes.push({ name: 'Giải bảy', numbers });
  }
  
  // Eighth prize (Giải tám)
  if (data.eighth) {
    const numbers = Array.isArray(data.eighth) ? data.eighth : [data.eighth];
    prizes.push({ name: 'Giải tám', numbers });
  }

  // Check each user number against all prizes
  userNumbers.forEach(userNum => {
    const userNumStr = String(userNum).trim();
    let matched = false;
    
    for (const prize of prizes) {
      for (const prizeNum of prize.numbers) {
        const prizeNumStr = String(prizeNum).trim();
        
        // Full match
        if (userNumStr === prizeNumStr) {
          results.push({
            number: userNumStr,
            prize: prize.name,
            matchType: 'Trùng khớp toàn bộ',
            prizeNumber: prizeNumStr,
            matched: true
          });
          matched = true;
          break;
        }
        
        // Suffix match (last 3 digits)
        if (userNumStr.length >= 3 && prizeNumStr.length >= 3) {
          const userSuffix3 = userNumStr.slice(-3);
          const prizeSuffix3 = prizeNumStr.slice(-3);
          
          if (userSuffix3 === prizeSuffix3) {
            results.push({
              number: userNumStr,
              prize: prize.name,
              matchType: 'Trùng 3 số cuối',
              prizeNumber: prizeNumStr,
              matched: true
            });
            matched = true;
            break;
          }
        }
        
        // Suffix match (last 2 digits)
        if (userNumStr.length >= 2 && prizeNumStr.length >= 2) {
          const userSuffix2 = userNumStr.slice(-2);
          const prizeSuffix2 = prizeNumStr.slice(-2);
          
          if (userSuffix2 === prizeSuffix2) {
            results.push({
              number: userNumStr,
              prize: prize.name,
              matchType: 'Trùng 2 số cuối',
              prizeNumber: prizeNumStr,
              matched: true
            });
            matched = true;
            break;
          }
        }
      }
      
      if (matched) break;
    }
    
    // If no match found
    if (!matched) {
      results.push({
        number: userNumStr,
        prize: '-',
        matchType: 'Không trúng',
        prizeNumber: '-',
        matched: false
      });
    }
  });
  
  return results;
}

export function formatPrizes(lotteryResults) {
  if (!lotteryResults) {
    return [];
  }
  
  const data = lotteryResults.data || lotteryResults;
  const formatted = [];
  
  const prizeMapping = [
    { key: 'special', name: 'Giải đặc biệt' },
    { key: 'first', name: 'Giải nhất' },
    { key: 'second', name: 'Giải nhì' },
    { key: 'third', name: 'Giải ba' },
    { key: 'fourth', name: 'Giải tư' },
    { key: 'fifth', name: 'Giải năm' },
    { key: 'sixth', name: 'Giải sáu' },
    { key: 'seventh', name: 'Giải bảy' },
    { key: 'eighth', name: 'Giải tám' },
  ];
  
  prizeMapping.forEach(({ key, name }) => {
    if (data[key]) {
      const numbers = Array.isArray(data[key]) ? data[key] : [data[key]];
      formatted.push({
        name,
        numbers: numbers.join(', ')
      });
    }
  });
  
  return formatted;
}
