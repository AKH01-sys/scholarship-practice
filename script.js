/**************************************************
 * 1) GLOBAL: Log and Manage Practice Stats
 **************************************************/
function logPractice(option, detail, scoreInfo) {
  const statsKey = 'practiceStats';
  let stats = JSON.parse(localStorage.getItem(statsKey)) || [];

  // For date filters, we store a 'timestamp' in ISO format
  const now = new Date();
  const record = {
    displayDate: now.toLocaleString(), // For user display
    timestamp: now.toISOString(),      // For date-based filtering
    option: option,                    // e.g. "Squares & Cubes" or "Unit Conversions"
    detail: detail,                    // e.g. "Time: 1 min", "Count: 5", etc.
    score: scoreInfo                   // e.g. "Score: 3/5"
  };

  // Insert at the beginning
  stats.unshift(record);

  // Keep last 50 or so if you want a limit (example):
  // if (stats.length > 50) stats.pop();

  localStorage.setItem(statsKey, JSON.stringify(stats));
}

function confirmClearStats() {
  return confirm("Are you sure you want to clear all stats? This cannot be undone.");
}

/**************************************************
 * 2) SQUARES & CUBES QUIZ LOGIC
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
  let timeMode = '1';  // default
  let questions = [];
  let currentQIndex = 0;
  let correctCount = 0;
  let quizCompleted = false;

  function generateQuestionsAll() {
    const sq = [];
    for (let i = 2; i <= 25; i++) {
      sq.push({ question: `${i}²`, answer: (i*i).toString() });
      sq.push({ question: `√${i*i}`, answer: i.toString() });
    }
    const cu = [];
    for (let i = 1; i <= 15; i++) {
      cu.push({ question: `${i}³`, answer: (i*i*i).toString() });
      cu.push({ question: `³√${i*i*i}`, answer: i.toString() });
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
    // Hide or disable start button & dropdown so it can’t be reused
    startBtn.disabled = true;
    startOptions.classList.add('hidden'); // Hides the entire start options group

    timeMode = timeSelect.value;
    questions = generateQuestionsAll();
    currentQIndex = 0;
    correctCount = 0;
    quizCompleted = false;

    feedbackEl.textContent = '';
    feedbackEl.classList.remove('correct', 'incorrect');

    quizArea.classList.remove('hidden');
    resultArea.classList.add('hidden');

    if (timeMode !== 'all') {
      const timeLimit = parseInt(timeMode, 10) * 60;
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
    if (timeMode === 'all' && currentQIndex >= questions.length) {
      endQuiz();
      return;
    }
    const qObj = questions[currentQIndex];
    questionEl.textContent = qObj.question;
    answerInput.value = '';
  }

  function checkAnswer() {
    if (quizCompleted) return;

    const userAns = answerInput.value.trim();
    const correctAns = questions[currentQIndex].answer;

    if (userAns === correctAns) {
      correctCount++;
      feedbackEl.textContent = 'Correct!';
      feedbackEl.classList.remove('incorrect');
      feedbackEl.classList.add('correct');
    } else {
      feedbackEl.textContent = `Incorrect! The correct answer was ${correctAns}.`;
      feedbackEl.classList.remove('correct');
      feedbackEl.classList.add('incorrect');
    }

    currentQIndex++;
    if (timeMode === 'all') {
      if (currentQIndex < questions.length) {
        showQuestion();
      } else {
        endQuiz();
      }
    } else {
      showQuestion(); // timed mode continues until time is up
    }
  }

  function endQuiz() {
    if (quizCompleted) return;
    quizCompleted = true;

    if (timer) {
      clearInterval(timer);
      timer = null;
    }
    quizArea.classList.add('hidden');
    resultArea.classList.remove('hidden');
    summaryEl.textContent = `You answered ${correctCount} questions correctly out of ${currentQIndex}.`;

    // Log the result
    const score = `Score: ${correctCount}/${currentQIndex}`;
    logPractice('Squares & Cubes', `Time Mode: ${timeMode}`, score);
  }

  startBtn.addEventListener('click', startQuiz);
  submitBtn.addEventListener('click', checkAnswer);
}

/**************************************************
 * 3) UNIT CONVERSIONS QUIZ LOGIC
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
  let quizCompleted = false;

  function startQuiz() {
    // Hide or disable to prevent multiple starts
    startBtn.disabled = true;
    startOptions.classList.add('hidden');

    totalQuestions = parseInt(questionCountSelect.value, 10);
    questions = generateConversionQuestions(totalQuestions);
    currentQIndex = 0;
    correctCount = 0;
    quizCompleted = false;

    feedbackEl.textContent = '';
    feedbackEl.classList.remove('correct', 'incorrect');

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

    // 50% chance for decimal vs whole
    const isDecimal = (Math.random() < 0.5);
    let baseValue;
    if (!isDecimal) {
      baseValue = Math.floor(Math.random() * 9999) + 1; // up to 4 digits
    } else {
      baseValue = generateDecimalWith3to4Digits();
    }

    const indexDiff = toIndex - fromIndex;
    const factor = Math.pow(10, indexDiff);
    const precise = (baseValue * factor).toFixed(5);
    const correctAnsNum = parseFloat(precise);

    return {
      question: `Convert ${baseValue} ${units[fromIndex]} to ${units[toIndex]}.`,
      answer: correctAnsNum
    };
  }

  function generateDecimalWith3to4Digits() {
    // e.g. total 3 or 4 numeric digits
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
    let qObj = questions[currentQIndex];
    questionEl.textContent = qObj.question;
    answerInput.value = '';
  }

  function checkAnswer() {
    if (quizCompleted) return;

    const userAns = parseFloat(answerInput.value.trim());
    const correctAns = questions[currentQIndex].answer;
    const tolerance = 0.000001;

    if (Math.abs(userAns - correctAns) < tolerance) {
      correctCount++;
      feedbackEl.textContent = 'Correct!';
      feedbackEl.classList.remove('incorrect');
      feedbackEl.classList.add('correct');
    } else {
      feedbackEl.textContent = `Incorrect! Correct answer was ${formatAnswer(correctAns)}.`;
      feedbackEl.classList.remove('correct');
      feedbackEl.classList.add('incorrect');
    }
    currentQIndex++;
    showQuestion();
  }

  function endQuiz() {
    if (quizCompleted) return;
    quizCompleted = true;

    quizArea.classList.add('hidden');
    resultArea.classList.remove('hidden');
    summaryEl.textContent = `You answered ${correctCount} out of ${questions.length} correctly.`;

    const scoreInfo = `Score: ${correctCount}/${questions.length}`;
    logPractice('Unit Conversions', `Count: ${totalQuestions}`, scoreInfo);
  }

  function formatAnswer(num) {
    if (Number.isInteger(num)) return num.toString();
    return parseFloat(num.toFixed(5)).toString();
  }

  startBtn.addEventListener('click', startQuiz);
  submitBtn.addEventListener('click', checkAnswer);
}

/**************************************************
 * 4) PRACTICE STATS PAGE (with Filters + Confirmation)
 **************************************************/
if (document.getElementById('stats-logs')) {
  const statsLogsDiv = document.getElementById('stats-logs');
  const filterSelect = document.getElementById('stats-filter');

  function loadStats() {
    const statsKey = 'practiceStats';
    let stats = JSON.parse(localStorage.getItem(statsKey)) || [];

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

  function applyFilter(stats, filter) {
    if (filter === 'last5') {
      // newest 5
      return stats.slice(0, 5);
    }
    if (filter === 'all') {
      return stats;
    }

    // For date-based filters, need 'timestamp'
    const now = new Date();
    return stats.filter(record => {
      if (!record.timestamp) {
        // old logs without timestamps won't be included in date-based filters
        return false;
      }
      const recordDate = new Date(record.timestamp);

      if (filter === 'today') {
        return isSameDay(recordDate, now);
      }
      if (filter === 'yesterday') {
        let yest = new Date(now);
        yest.setDate(now.getDate() - 1);
        return isSameDay(recordDate, yest);
      }
      if (filter === 'last30') {
        let diffDays = (now - recordDate) / (1000 * 60 * 60 * 24);
        return diffDays <= 30;
      }
      return false;
    });
  }

  function isSameDay(d1, d2) {
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  }

  window.clearStats = function() {
    if (!confirmClearStats()) return;
    localStorage.removeItem('practiceStats');
    loadStats();
  };

  // Listen to filter changes
  filterSelect.addEventListener('change', loadStats);

  // On page load
  loadStats();
}
