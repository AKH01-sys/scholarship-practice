/**************************************************
 * Global Helper: Log practice stats in localStorage
 **************************************************/
function logPractice(option, detail) {
  // 'option' can be "Squares & Cubes" or "Unit Conversions"
  // 'detail' can be the time chosen, number of questions, etc.
  const statsKey = 'practiceStats';
  let stats = JSON.parse(localStorage.getItem(statsKey)) || [];
  
  // Store a simple record
  const record = {
    date: new Date().toLocaleString(),
    option: option,
    detail: detail
  };
  
  stats.unshift(record); // add to beginning
  // limit logs to e.g. 50 entries to prevent infinite growth
  if (stats.length > 50) stats.pop();
  
  localStorage.setItem(statsKey, JSON.stringify(stats));
}

/**************************************************
 * Squares & Cubes Logic
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

  let timer = null;
  let timeMode = '1'; // default
  let questions = [];
  let currentQIndex = 0;
  let correctCount = 0;
  
  // Generate squares/cubes question set
  // squares: 2..25
  // cubes: 1..15
  // also include roots
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
    
    // combine and shuffle
    const combined = sq.concat(cu);
    return shuffleArray(combined);
  }

  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  function startQuiz() {
    timeMode = timeSelect.value;
    logPractice('Squares & Cubes', `Time: ${timeMode}`);
    
    questions = generateQuestionsAll();
    currentQIndex = 0;
    correctCount = 0;
    feedbackEl.textContent = '';
    quizArea.classList.remove('hidden');
    resultArea.classList.add('hidden');
    
    if (timeMode === 'all') {
      // no timer, we'll just ask all questions
    } else {
      const timeLimit = parseInt(timeMode, 10) * 60; // minutes to seconds
      if (timer) clearInterval(timer);
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
    if (timeMode === 'all') {
      // if we've run out of questions
      if (currentQIndex >= questions.length) {
        endQuiz();
        return;
      }
    }
    // If there's a timer mode, we can keep going until time is up
    let qObj = questions[currentQIndex];
    questionEl.textContent = qObj.question;
    answerInput.value = '';
  }

  function checkAnswer() {
    let userAns = answerInput.value.trim();
    let correctAns = questions[currentQIndex].answer;
    if (userAns === correctAns) {
      correctCount++;
      feedbackEl.textContent = 'Correct!';
      feedbackEl.style.color = 'green';
    } else {
      feedbackEl.textContent = `Incorrect! The correct answer was ${correctAns}.`;
      feedbackEl.style.color = 'red';
    }
    
    currentQIndex++;
    if (timeMode === 'all') {
      // move to next question if any
      if (currentQIndex < questions.length) {
        showQuestion();
      } else {
        endQuiz();
      }
    } else {
      // in timed mode, keep going until time runs out
      showQuestion();
    }
  }

  function endQuiz() {
    // clear timer if any
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
    quizArea.classList.add('hidden');
    resultArea.classList.remove('hidden');
    summaryEl.textContent = `You answered ${correctCount} questions correctly out of ${currentQIndex}.`;
  }

  startBtn.addEventListener('click', startQuiz);
  submitBtn.addEventListener('click', checkAnswer);
}

/**************************************************
 * Unit Conversions Logic
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

  // Possible units in order
  const units = ["kilo", "hecto", "deca", "unit", "deci", "centi", "mili"];
  // index difference of n => factor of 10^n

  let questions = [];
  let currentQIndex = 0;
  let correctCount = 0;
  let totalQuestions = 3;

  /**
   * Start Quiz
   */
  function startQuiz() {
    totalQuestions = parseInt(questionCountSelect.value, 10);
    logPractice('Unit Conversions', `Count: ${totalQuestions}`);
    
    questions = generateConversionQuestions(totalQuestions);
    currentQIndex = 0;
    correctCount = 0;
    
    quizArea.classList.remove('hidden');
    resultArea.classList.add('hidden');
    feedbackEl.textContent = '';

    showQuestion();
  }

  /**
   * Generate an array of random conversion questions
   */
  function generateConversionQuestions(count) {
    let qs = [];
    for (let i = 0; i < count; i++) {
      qs.push(generateOneConversion());
    }
    return qs;
  }

  /**
   * Generate one random conversion question
   * - If whole number: 1..9999 (up to 4 digits)
   * - If decimal: total digits (integer + fractional) = 3..4
   *   e.g. 999.9 (4 digits total), 9.99 (3 digits total), etc.
   */
  function generateOneConversion() {
    const fromIndex = Math.floor(Math.random() * units.length);
    const toIndex = Math.floor(Math.random() * units.length);
    // If fromIndex === toIndex, regenerate
    if (fromIndex === toIndex) {
      return generateOneConversion();
    }

    // Decide if we want a whole number or a decimal
    const isDecimal = Math.random() < 0.5;  // 50% chance
    
    let combinedValue = 0;
    if (!isDecimal) {
      // Whole number up to 4 digits
      combinedValue = Math.floor(Math.random() * 9999) + 1; // 1..9999
    } else {
      // Decimal with total digit length of 3 or 4
      combinedValue = generateDecimalWith3to4Digits();
    }

    // Calculate the factor for conversion
    const indexDiff = toIndex - fromIndex;
    // 10^(indexDiff)
    const factor = Math.pow(10, indexDiff);

    // Multiply and round the result to avoid floating point artifacts
    // We'll store up to 5 decimal places to keep it precise enough.
    const preciseResult = (combinedValue * factor).toFixed(5);
    // Then parse as float to strip trailing zeros
    const correctAnsNum = parseFloat(preciseResult);

    return {
      question: `Convert ${combinedValue} ${units[fromIndex]} to ${units[toIndex]}.`,
      // Store as a float so we can do a tolerance check
      answer: correctAnsNum
    };
  }

  /**
   * Generate a random decimal with total length 3 or 4 digits (integer + fractional).
   * Examples:
   *  - 9.99  (3 digits total: '9', '.', '9', '9' => 3 numeric digits)
   *  - 99.9  (3 numeric digits if we count only digits, 4 if counting the dot)
   *  - 1.23  (3 numeric digits)
   *  - 999.9 (4 numeric digits)
   * This function picks random patterns to keep it simple.
   */
  function generateDecimalWith3to4Digits() {
    // We'll pick either 3 or 4 total digits (integer + fraction).
    // Then we randomize how they get distributed.
    const totalDigits = Math.random() < 0.5 ? 3 : 4; // 50% chance for 3 or 4 numeric digits
    // We ensure at least 1 digit before decimal and at least 1 digit after decimal

    // For example, if totalDigits=3: possible combos for integer+fraction -> (1+2), (2+1)
    // If totalDigits=4: possible combos -> (1+3), (2+2), (3+1)
    
    let integerDigits, fractionDigits;
    
    if (totalDigits === 3) {
      // random pick either 1+2 or 2+1
      if (Math.random() < 0.5) {
        integerDigits = 1; fractionDigits = 2;
      } else {
        integerDigits = 2; fractionDigits = 1;
      }
    } else { // totalDigits === 4
      const rand = Math.random();
      if (rand < 0.33) {
        integerDigits = 1; fractionDigits = 3;
      } else if (rand < 0.66) {
        integerDigits = 2; fractionDigits = 2;
      } else {
        integerDigits = 3; fractionDigits = 1;
      }
    }

    // Generate the integer part: ensure it doesn't start with 0
    const intMin = Math.pow(10, integerDigits - 1);   // e.g., if integerDigits=2 => intMin=10
    const intMax = Math.pow(10, integerDigits) - 1;   // e.g., if integerDigits=2 => intMax=99
    const intPart = Math.floor(Math.random() * (intMax - intMin + 1)) + intMin;

    // Generate the fractional part
    // e.g., if fractionDigits=2 => 0..99 => format with 2 digits
    const fracMax = Math.pow(10, fractionDigits) - 1;
    const fracPartInt = Math.floor(Math.random() * (fracMax + 1));
    // zero-pad if needed
    const fracPartStr = fracPartInt.toString().padStart(fractionDigits, '0');

    // Combine
    const finalStr = `${intPart}.${fracPartStr}`;
    return parseFloat(finalStr); // e.g. "12.34" => 12.34
  }

  /**
   * Show question
   */
  function showQuestion() {
    if (currentQIndex >= questions.length) {
      endQuiz();
      return;
    }
    let qObj = questions[currentQIndex];
    questionEl.textContent = qObj.question;
    answerInput.value = '';
  }

  /**
   * Check the user's answer against the correct answer
   * - We'll allow a small tolerance to account for potential rounding.
   */
  function checkAnswer() {
    let userAns = parseFloat(answerInput.value.trim());
    let correctAns = questions[currentQIndex].answer;

    // Tolerance for floating point comparison
    const tolerance = 0.000001;
    if (Math.abs(userAns - correctAns) < tolerance) {
      correctCount++;
      feedbackEl.textContent = 'Correct!';
      feedbackEl.style.color = 'green';
    } else {
      // Format the correct answer to at most 5 decimal places
      // or remove trailing zeros if it's effectively an integer.
      let correctAnsStr = formatAnswer(correctAns);
      
      feedbackEl.textContent = `Incorrect! Correct answer was ${correctAnsStr}.`;
      feedbackEl.style.color = 'red';
    }

    currentQIndex++;
    showQuestion();
  }

  /**
   * End the quiz
   */
  function endQuiz() {
    quizArea.classList.add('hidden');
    resultArea.classList.remove('hidden');
    summaryEl.textContent = `You answered ${correctCount} out of ${questions.length} correctly.`;
  }

  /**
   * Utility: format numeric answers neatly (avoid 10.00000, etc.)
   */
  function formatAnswer(num) {
    // Try to see if it's effectively an integer
    if (Number.isInteger(num)) {
      return num.toString();
    }
    // Otherwise, show up to 5 decimals, then trim trailing zeros
    return parseFloat(num.toFixed(5)).toString();
  }

  // Event listeners
  startBtn.addEventListener('click', startQuiz);
  submitBtn.addEventListener('click', checkAnswer);
}

/**************************************************
 * Practice Stats Page Logic
 **************************************************/
if (document.getElementById('stats-logs')) {
  const statsLogsDiv = document.getElementById('stats-logs');
  
  function loadStats() {
    const statsKey = 'practiceStats';
    let stats = JSON.parse(localStorage.getItem(statsKey)) || [];
    
    if (stats.length === 0) {
      statsLogsDiv.innerHTML = "<p>No recent practice found.</p>";
      return;
    }
    
    let htmlStr = "<ul>";
    stats.forEach(record => {
      htmlStr += `<li>
        <strong>${record.date}</strong><br/>
        Practice: ${record.option}<br/>
        Detail: ${record.detail}
      </li>`;
    });
    htmlStr += "</ul>";
    statsLogsDiv.innerHTML = htmlStr;
  }

  window.clearStats = function() {
    localStorage.removeItem('practiceStats');
    loadStats();
  };

  // Load stats on page load
  loadStats();
}
