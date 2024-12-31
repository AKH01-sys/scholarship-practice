/**************************************************
 * GLOBAL: Log practice stats in localStorage
 **************************************************/
function logPractice(option, detail, scoreInfo) {
  // detail might be "Time: 1 minute" or "Count: 10 questions", etc.
  // scoreInfo might say "Score: X/Y"
  const statsKey = 'practiceStats';
  let stats = JSON.parse(localStorage.getItem(statsKey)) || [];

  // We'll store an ISO timestamp for better date filtering
  const nowIso = new Date().toISOString();
  
  const record = {
    // Old logs used 'date' with locale string. We still keep a 'displayDate' for UI, but also store 'timestamp'.
    displayDate: new Date().toLocaleString(),
    timestamp: nowIso,
    option: option,
    detail: detail,
    score: scoreInfo
  };
  
  // Add to the beginning
  stats.unshift(record);

  // You can limit the total logs if you want:
  // if (stats.length > 50) stats.pop();

  localStorage.setItem(statsKey, JSON.stringify(stats));
}

/**************************************************
 * SQUARES & CUBES
 **************************************************/
if (document.getElementById('sc-start-btn')) {
  const startBtn = document.getElementById('sc-start-btn');
  const timeSelect = document.getElementById('sc-time-select');
  const quizArea = document.getElementById('sc-quiz-area');
  const questionEl = document.getElementById('sc-question');
  const answerInput = document.getElementById('sc-answer');
  const submitBtn = document.getElementById('sc-submit-btn');
  const feedbackEl = document.getElementById('sc-feedback');
  const resultArea = document.getElementById('sc-result-area');
  const summaryEl = document.getElementById('sc-summary');
  const startOptions = document.getElementById('sc-start-options');

  let timer = null;
  let timeMode = '1';
  let questions = [];
  let currentQIndex = 0;
  let correctCount = 0;

  // squares: 2..25 / cubes: 1..15
  // plus square roots / cube roots
  function generateQuestionsAll() {
    const sq = [];
    for (let i = 2; i <= 25; i++) {
      sq.push({question: `${i}²`, answer: (i*i).toString()});
      sq.push({question: `√${i*i}`, answer: i.toString()});
    }
    const cu = [];
    for (let i = 1; i <= 15; i++) {
      cu.push({question: `${i}³`, answer: (i*i*i).toString()});
      cu.push({question: `³√${i*i*i}`, answer: i.toString()});
    }
    
    return shuffleArray(sq.concat(cu));
  }

  function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function startQuiz() {
    timeMode = timeSelect.value;
    
    // Hide the start options once quiz begins
    startOptions.classList.add('hidden');
    
    questions = generateQuestionsAll();
    currentQIndex = 0;
    correctCount = 0;
    feedbackEl.textContent = '';
    quizArea.classList.remove('hidden');
    resultArea.classList.add('hidden');

    if (timeMode === 'all') {
      // no timer
    } else {
      const timeLimit = parseInt(timeMode, 10) * 60; // convert minutes to seconds
      let countdown = timeLimit;
      timer = setInterval(() => {
        countdown--;
        if (countdown <= 0) {
          endQuiz();
        }
      }, 1000);
    }
    
    showQuestion();
  }

  function showQuestion() {
    // If "all" mode and we run out of questions
    if (timeMode === 'all' && currentQIndex >= questions.length) {
      endQuiz();
      return;
    }
    // If timed mode, keep going until time runs out
    const qObj = questions[currentQIndex];
    questionEl.textContent = qObj.question;
    answerInput.value = '';
  }

  function checkAnswer() {
    const userAns = answerInput.value.trim();
    const correctAns = questions[currentQIndex].answer;
    
    if (userAns === correctAns) {
      correctCount++;
      feedbackEl.textContent = 'Correct!';
      feedbackEl.style.color = 'green';
    } else {
      feedbackEl.textContent = `Incorrect! Correct answer was ${correctAns}.`;
      feedbackEl.style.color = 'red';
    }
    
    currentQIndex++;
    if (timeMode === 'all') {
      if (currentQIndex < questions.length) {
        showQuestion();
      } else {
        endQuiz();
      }
    } else {
      // timed mode, keep going until time up
      showQuestion();
    }
  }

  function endQuiz() {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
    quizArea.classList.add('hidden');
    resultArea.classList.remove('hidden');
    summaryEl.textContent = `You answered ${correctCount} questions correctly out of ${currentQIndex}.`;

    // Log the completed practice with score
    const scoreInfo = `Score: ${correctCount}/${currentQIndex}`;
    logPractice('Squares & Cubes', `Time Mode: ${timeMode}`, scoreInfo);
  }

  startBtn.addEventListener('click', startQuiz);
  submitBtn.addEventListener('click', checkAnswer);
}

/**************************************************
 * UNIT CONVERSIONS
 **************************************************/
if (document.getElementById('uc-start-btn')) {
  const startBtn = document.getElementById('uc-start-btn');
  const questionCountSelect = document.getElementById('uc-question-count');
  const quizArea = document.getElementById('uc-quiz-area');
  const questionEl = document.getElementById('uc-question');
  const answerInput = document.getElementById('uc-answer');
  const submitBtn = document.getElementById('uc-submit-btn');
  const feedbackEl = document.getElementById('uc-feedback');
  const resultArea = document.getElementById('uc-result-area');
  const summaryEl = document.getElementById('uc-summary');
  const startOptions = document.getElementById('uc-start-options');

  const units = ["kilo", "hecto", "deca", "unit", "deci", "centi", "mili"];

  let questions = [];
  let currentQIndex = 0;
  let correctCount = 0;
  let totalQuestions = 3;

  function startQuiz() {
    totalQuestions = parseInt(questionCountSelect.value, 10);

    // Hide the start options
    startOptions.classList.add('hidden');

    questions = generateConversionQuestions(totalQuestions);
    currentQIndex = 0;
    correctCount = 0;
    feedbackEl.textContent = '';
    
    quizArea.classList.remove('hidden');
    resultArea.classList.add('hidden');

    showQuestion();
  }

  function generateConversionQuestions(count) {
    let qs = [];
    for (let i = 0; i < count; i++) {
      qs.push(generateOneConversion());
    }
    return qs;
  }

  function generateOneConversion() {
    const fromIndex = Math.floor(Math.random() * units.length);
    const toIndex = Math.floor(Math.random() * units.length);
    if (fromIndex === toIndex) return generateOneConversion();

    // Decide if we want a whole number or a decimal
    const isDecimal = Math.random() < 0.5;
    
    let combinedValue;
    if (!isDecimal) {
      // Whole number up to 4 digits
      combinedValue = Math.floor(Math.random() * 9999) + 1; // 1..9999
    } else {
      combinedValue = generateDecimalWith3to4Digits();
    }

    const indexDiff = toIndex - fromIndex; 
    const factor = Math.pow(10, indexDiff);
    
    // Multiply & round to avoid floating point artifacts
    const preciseResult = (combinedValue * factor).toFixed(5);
    const correctAnsNum = parseFloat(preciseResult);

    return {
      question: `Convert ${combinedValue} ${units[fromIndex]} to ${units[toIndex]}.`,
      answer: correctAnsNum
    };
  }

  // Helper for decimal of total 3..4 digits (integer+fractional)
  function generateDecimalWith3to4Digits() {
    const totalDigits = Math.random() < 0.5 ? 3 : 4;
    let integerDigits, fractionDigits;

    if (totalDigits === 3) {
      if (Math.random() < 0.5) {
        integerDigits = 1; fractionDigits = 2;
      } else {
        integerDigits = 2; fractionDigits = 1;
      }
    } else {
      const rand = Math.random();
      if (rand < 0.33) {
        integerDigits = 1; fractionDigits = 3;
      } else if (rand < 0.66) {
        integerDigits = 2; fractionDigits = 2;
      } else {
        integerDigits = 3; fractionDigits = 1;
      }
    }

    const intMin = Math.pow(10, integerDigits - 1);
    const intMax = Math.pow(10, integerDigits) - 1;
    const intPart = Math.floor(Math.random() * (intMax - intMin + 1)) + intMin;

    const fracMax = Math.pow(10, fractionDigits) - 1;
    const fracPartInt = Math.floor(Math.random() * (fracMax + 1));
    const fracPartStr = fracPartInt.toString().padStart(fractionDigits, '0');

    return parseFloat(`${intPart}.${fracPartStr}`);
  }

  function showQuestion() {
    if (currentQIndex >= questions.length) {
      endQuiz();
      return;
    }
    const qObj = questions[currentQIndex];
    questionEl.textContent = qObj.question;
    answerInput.value = '';
  }

  function checkAnswer() {
    const userAns = parseFloat(answerInput.value.trim());
    const correctAns = questions[currentQIndex].answer;

    // Tolerance
    const tolerance = 0.000001;
    if (Math.abs(userAns - correctAns) < tolerance) {
      correctCount++;
      feedbackEl.textContent = 'Correct!';
      feedbackEl.style.color = 'green';
    } else {
      feedbackEl.textContent = `Incorrect! Correct answer was ${formatAnswer(correctAns)}.`;
      feedbackEl.style.color = 'red';
    }
    currentQIndex++;
    showQuestion();
  }

  function endQuiz() {
    quizArea.classList.add('hidden');
    resultArea.classList.remove('hidden');
    summaryEl.textContent = `You answered ${correctCount} out of ${questions.length} correctly.`;

    // Log the completed practice
    const scoreInfo = `Score: ${correctCount}/${questions.length}`;
    logPractice('Unit Conversions', `Count: ${totalQuestions}`, scoreInfo);
  }

  // Format numeric answers to remove trailing zeros
  function formatAnswer(num) {
    if (Number.isInteger(num)) return num.toString();
    return parseFloat(num.toFixed(5)).toString();
  }

  startBtn.addEventListener('click', startQuiz);
  submitBtn.addEventListener('click', checkAnswer);
}

/**************************************************
 * PRACTICE STATS
 **************************************************/
if (document.getElementById('stats-logs')) {
  const statsLogsDiv = document.getElementById('stats-logs');
  const filterSelect = document.getElementById('stats-filter');

  function loadStats() {
    const statsKey = 'practiceStats';
    let stats = JSON.parse(localStorage.getItem(statsKey)) || [];
    
    // Filter
    const filter = filterSelect.value;
    let filteredStats = applyFilter(stats, filter);

    if (filteredStats.length === 0) {
      statsLogsDiv.innerHTML = "<p>No practice records found for this filter.</p>";
      return;
    }

    let htmlStr = "<ul>";
    filteredStats.forEach(record => {
      const dateToShow = record.displayDate || "Unknown date";
      const detail = record.detail || "";
      const score = record.score ? ` (${record.score})` : "";
      htmlStr += `<li>
        <strong>${dateToShow}</strong><br/>
        Practice: ${record.option}${score}<br/>
        Detail: ${detail}
      </li>`;
    });
    htmlStr += "</ul>";
    statsLogsDiv.innerHTML = htmlStr;
  }

  /**
   * Apply filter to the array of stats
   * - last5: show last 5 records only
   * - all: show all
   * - today: show only records from today's date
   * - yesterday: only from the previous day
   * - last30: records from the last 30 days
   */
  function applyFilter(stats, filter) {
    if (filter === 'last5') {
      // just return the first 5 (the newest 5)
      return stats.slice(0, 5);
    }
    if (filter === 'all') {
      return stats;
    }
    
    // For date-based filtering, we need a timestamp
    const now = new Date();
    return stats.filter(record => {
      if (!record.timestamp) {
        // older record with no timestamp -> show if filter is 'all' only
        return false;
      }
      const recordDate = new Date(record.timestamp);
      
      // Compare dates
      if (filter === 'today') {
        return isSameDay(recordDate, now);
      } else if (filter === 'yesterday') {
        let yest = new Date(now);
        yest.setDate(now.getDate() - 1);
        return isSameDay(recordDate, yest);
      } else if (filter === 'last30') {
        let diffDays = (now - recordDate) / (1000 * 60 * 60 * 24);
        return diffDays <= 30;
      }
      return false;
    });
  }

  // Check if two dates are the same day (ignoring time)
  function isSameDay(d1, d2) {
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  }

  window.clearStats = function() {
    localStorage.removeItem('practiceStats');
    loadStats();
  };

  // Listen to filter change
  filterSelect.addEventListener('change', loadStats);

  // Load stats on page load
  loadStats();
}
