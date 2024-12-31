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

  // Possible units array in order
  const units = ["kilo", "hecto", "deca", "unit", "deci", "centi", "mili"];
  // For convenience, let's define how each step changes the value by factor of 10
  // kilo -> hecto -> deca -> unit -> deci -> centi -> mili
  // indices differ by 1 => factor of 10
  // index difference of n => factor of 10^n

  let questions = [];
  let currentQIndex = 0;
  let correctCount = 0;
  let totalQuestions = 3;

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

  // Generate some random conversion questions
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
    // We want them to be different
    if (fromIndex === toIndex) {
      return generateOneConversion(); 
    }
    // Let's pick a random number up to 4 digits + up to 3 decimals
    const wholePart = Math.floor(Math.random() * 9999) + 1; // 1..9999
    const decimalPart = Math.floor(Math.random() * 1000); // 0..999
    let combinedValue;
    if (decimalPart === 0) {
      combinedValue = wholePart; // no decimal
    } else {
      // format up to 3 decimals
      combinedValue = parseFloat(wholePart + '.' + decimalPart);
    }

    // difference in indices => factor of 10^(difference)
    const indexDiff = toIndex - fromIndex; 
    // if indexDiff = 1 => factor 10
    // if indexDiff = -2 => factor 0.01, etc.

    const factor = Math.pow(10, indexDiff);
    const correctAns = combinedValue * factor;

    return {
      question: `Convert ${combinedValue} ${units[fromIndex]} to ${units[toIndex]}.`,
      answer: correctAns.toString()
    };
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
    let userAns = parseFloat(answerInput.value.trim());
    let correctAns = parseFloat(questions[currentQIndex].answer);

    // A little tolerance for floating point rounding could be considered,
    // but here we will require exact matches for simplicity.
    if (userAns === correctAns) {
      correctCount++;
      feedbackEl.textContent = 'Correct!';
      feedbackEl.style.color = 'green';
    } else {
      feedbackEl.textContent = `Incorrect! Correct answer was ${correctAns}.`;
      feedbackEl.style.color = 'red';
    }
    currentQIndex++;
    showQuestion();
  }

  function endQuiz() {
    quizArea.classList.add('hidden');
    resultArea.classList.remove('hidden');
    summaryEl.textContent = `You answered ${correctCount} out of ${questions.length} correctly.`;
  }

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
