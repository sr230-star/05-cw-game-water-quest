// Each question has four answers, the zero-based correct answer index, and a fact for feedback.
const questions = [
  { question: "How many people lack access to safely managed drinking water at home?", answers: ["1 in 10", "1 in 4", "1 in 2", "Almost everyone"], correct: 1, fact: "Around 2.2 billion people do not have safely managed drinking water at home." },
  { question: "Which disease is commonly spread through unsafe water and poor sanitation?", answers: ["Cholera", "Asthma", "Diabetes", "Arthritis"], correct: 0, fact: "Cholera can spread through water or food contaminated with the bacterium Vibrio cholerae." },
  { question: "What is the safest way to make water microbiologically safer in an emergency?", answers: ["Add sugar", "Boil it", "Leave it in the shade", "Shake it"], correct: 1, fact: "Boiling water kills many disease-causing germs and is a key household water treatment method." },
  { question: "What does WASH stand for?", answers: ["Water, Sanitation and Hygiene", "Water And Safe Homes", "Wildlife And Shared Habitats", "Wellness And School Health"], correct: 0, fact: "WASH programs bring together clean water, sanitation facilities, and hygiene practices." },
  { question: "Which activity uses the most water globally?", answers: ["Agriculture", "Video games", "Making pencils", "Listening to music"], correct: 0, fact: "Agriculture accounts for roughly 70% of global freshwater withdrawals." },
  { question: "Why are clean toilets important for communities?", answers: ["They save electricity", "They prevent contamination and disease", "They make rain", "They increase sunlight"], correct: 1, fact: "Safe sanitation helps keep human waste out of water sources and reduces the spread of disease." },
  { question: "What is groundwater?", answers: ["Water stored beneath Earth's surface", "Water in clouds", "Salt in the ocean", "Water vapor in the air"], correct: 0, fact: "Groundwater is water held underground in soil and rock formations called aquifers." },
  { question: "Which simple habit helps prevent the spread of germs?", answers: ["Washing hands with soap", "Sharing a towel", "Leaving food uncovered", "Skipping breakfast"], correct: 0, fact: "Handwashing with soap is one of the most effective ways to prevent infections." },
  { question: "What is water scarcity?", answers: ["Not enough available water to meet needs", "Water that is always frozen", "A type of water bottle", "A heavy rainstorm"], correct: 0, fact: "Water scarcity happens when demand for water is greater than the available supply or access." },
  { question: "Why can collecting water be a barrier to education?", answers: ["It makes books heavy", "It can take hours away from school", "It changes the school calendar", "It makes classrooms colder"], correct: 1, fact: "In many places, children—especially girls—spend hours collecting water instead of attending school." }
];

const GAME_TIME = 60;
let gameActive = false;
let timerInterval;
let timeLeft = GAME_TIME;
let score = 0;
let questionIndex = 0;
let shuffledQuestions = [];
let celebrationTimeout;

const screens = document.querySelectorAll(".screen");
const timerElement = document.getElementById("timer");
const scoreElement = document.getElementById("score");
const answerButtons = document.getElementById("answer-buttons");
const confettiElement = document.getElementById("confetti");

// Celebrate a successful finish without adding an external dependency.
function celebrateWin() {
  window.clearTimeout(celebrationTimeout);
  const colors = ["var(--cw-yellow)", "var(--cw-navy)", "var(--cw-light-blue)", "var(--cw-rust)"];
  confettiElement.innerHTML = Array.from({ length: 48 }, (_, index) => {
    const piece = document.createElement("span");
    piece.style.setProperty("--confetti-color", colors[index % colors.length]);
    piece.style.setProperty("--confetti-left", `${Math.random() * 100}%`);
    piece.style.setProperty("--confetti-delay", `${Math.random() * 0.45}s`);
    piece.style.setProperty("--confetti-rotation", `${Math.random() * 360}deg`);
    return piece.outerHTML;
  }).join("");
  confettiElement.classList.add("active");
  celebrationTimeout = window.setTimeout(() => {
    confettiElement.classList.remove("active");
    confettiElement.innerHTML = "";
  }, 3200);
}

// Show one screen and hide all the others.
function showScreen(screenId) {
  screens.forEach((screen) => screen.classList.toggle("hidden", screen.id !== screenId));
}

// Randomize an array without changing the original question list.
function shuffle(items) {
  return [...items].sort(() => Math.random() - 0.5);
}

// Start a fresh game and begin the countdown.
function startGame() {
  if (gameActive) return;
  window.clearTimeout(celebrationTimeout);
  confettiElement.classList.remove("active");
  confettiElement.innerHTML = "";
  gameActive = true;
  timeLeft = GAME_TIME;
  score = 0;
  questionIndex = 0;
  shuffledQuestions = shuffle(questions);
  timerElement.textContent = timeLeft;
  scoreElement.textContent = score;
  showScreen("question-screen");
  loadQuestion();
  timerInterval = setInterval(updateTimer, 1000);
}

// Keep the timer running through the feedback screen.
function updateTimer() {
  timeLeft -= 1;
  timerElement.textContent = timeLeft;
  if (timeLeft <= 0) endGame();
}

// Stop the active game and display the final score.
function endGame() {
  if (!gameActive) return;
  gameActive = false;
  clearInterval(timerInterval);
  document.getElementById("final-score").textContent = score;
  const peopleHelped = score / 100;
  document.getElementById("impact-message").textContent = `You helped ${peopleHelped} people get clean water!`;
  showScreen("game-over-screen");
  if (score >= 20) celebrateWin();
}

// Put the next question and its four answers on the page.
function loadQuestion() {
  const currentQuestion = shuffledQuestions[questionIndex];
  document.getElementById("question-number").textContent = `Question ${questionIndex + 1} of ${shuffledQuestions.length}`;
  document.getElementById("question-text").textContent = currentQuestion.question;
  answerButtons.innerHTML = currentQuestion.answers.map((answer, index) => `
    <button class="answer-button" data-answer-index="${index}">${answer}</button>
  `).join("");
  answerButtons.querySelectorAll(".answer-button").forEach((button) => {
    button.addEventListener("click", () => chooseAnswer(Number(button.dataset.answerIndex)));
  });
}

// Score the selected answer and show a fact before moving on.
function chooseAnswer(answerIndex) {
  if (!gameActive) return;
  const currentQuestion = shuffledQuestions[questionIndex];
  const isCorrect = answerIndex === currentQuestion.correct;
  score = Math.max(0, score + (isCorrect ? 100 : -50));
  scoreElement.textContent = score;
  document.getElementById("feedback-points").textContent = isCorrect ? "+100" : "-50";
  document.getElementById("feedback-points").classList.toggle("wrong", !isCorrect);
  document.getElementById("feedback-screen").classList.toggle("wrong", !isCorrect);
  document.getElementById("feedback-title").textContent = isCorrect ? "Correct!" : "Not quite!";
  document.getElementById("feedback-message").textContent = currentQuestion.fact;
  showScreen("feedback-screen");
}

// Move forward, or finish once all ten questions have been answered.
function showNextQuestion() {
  questionIndex += 1;
  if (questionIndex >= shuffledQuestions.length) {
    endGame();
  } else {
    showScreen("question-screen");
    loadQuestion();
  }
}

document.getElementById("play-button").addEventListener("click", startGame);
document.getElementById("play-again-button").addEventListener("click", startGame);
document.getElementById("next-button").addEventListener("click", showNextQuestion);
document.getElementById("how-to-play-link").addEventListener("click", () => showScreen("how-to-play-screen"));
document.getElementById("got-it-button").addEventListener("click", () => showScreen("intro-screen"));
