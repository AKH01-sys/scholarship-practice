/**************************************************
 * GLOBAL: Log practice stats in localStorage
 **************************************************/
function logPractice(option, detail, scoreInfo) {
  const statsKey = 'practiceStats';
  let stats = JSON.parse(localStorage.getItem(statsKey)) || [];

  // Create a record with date, option, detail, and score
  const record = {
    date: new Date().toLocaleString(),
    option: option,
    detail: detail,
    score: scoreInfo
  };
  
  // Add to the beginning
  stats.unshift(record);

  // Only keep the last 5 records
  if (stats.length > 5) stats = stats.slice(0, 5);

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
    // Disable the Start button to prevent multiple clicks
    startBtn.disabled = true;
    
    timeMode = timeSelect.value;
    questions = generateQuestionsAll();
    currentQIndex = 0;
    correctCount = 0;
    quizCompleted = false;
    feedbackEl.textContent = '';
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
    if (quizCompleted) return; // Prevent further submissions after completion
    
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
      // In timed mode, continue until time is up
      showQuestion();
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

    // Log the attempt
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
  let quizCompleted = false;

  function startQuiz() {
    // Disable the Start button to prevent multiple clicks
    startBtn.disabled = true;

    totalQuestions = parseInt(questionCountSelect.value, 10);
    questions = generateConversionQuestions(totalQuestions);
    currentQIndex = 0;
    correctCount = 0;
    quizCompleted = false;
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
    if (fromIndex === toIndex) {
      return generateOneConversion();
    }

    const isDecimal = Math.random() < 0.5;
    let combinedValue;
    if (!isDecimal) {
      combinedValue = Math.floor(Math.random() * 9999) + 1; 
    } else {
      combinedValue = generateDecimalWith3to4Digits();
    }

    const indexDiff = toIndex - fromIndex;
    const factor = Math.pow(10, indexDiff);
    const preciseResult = (combinedValue * factor).toFixed(5);
    const correctAnsNum = parseFloat(preciseResult);

    return {
      question: `Convert ${combinedValue} ${units[fromIndex]} to ${units[toIndex]}.`,
      answer: correctAnsNum
    };
  }

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
    if (quizCompleted) return;

    const userAns = parseFloat(answerInput.value.trim());
    const correctAns = questions[currentQIndex].answer;
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
    if (quizCompleted) return;
    quizCompleted = true;

    quizArea.classList.add('hidden');
    resultArea.classList.remove('hidden');
    summaryEl.textContent = `You answered ${correctCount} out of ${questions.length} correctly.`;

    const scoreInfo = `Score: ${correctCount}/${questions.length}`;
    logPractice('Unit Conversions', `Number of Questions: ${totalQuestions}`, scoreInfo);
  }

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

  function loadStats() {
    const statsKey = 'practiceStats';
    let stats = JSON.parse(localStorage.getItem(statsKey)) || [];
    
    if (stats.length === 0) {
      statsLogsDiv.innerHTML = "<p>No practice records found.</p>";
      return;
    }
    
    let htmlStr = "<ul>";
    stats.forEach(record => {
      const dateStr = record.date || "Unknown date";
      const detailStr = record.detail || "";
      const scoreStr = record.score ? ` (${record.score})` : "";
      htmlStr += `<li>
        <strong>${dateStr}</strong><br/>
        Practice: ${record.option}${scoreStr}<br/>
        Detail: ${detailStr}
      </li>`;
    });
    htmlStr += "</ul>";
    statsLogsDiv.innerHTML = htmlStr;
  }

  window.clearStats = function() {
    localStorage.removeItem('practiceStats');
    loadStats();
  };

  loadStats();
}
