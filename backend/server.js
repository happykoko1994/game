const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["https://game-1-rb2y.onrender.com", "http://localhost:3000"],
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
    credentials: true,
  },
});

require("dotenv").config();
const cors = require("cors");

const PORT = process.env.PORT || 4000;

app.use(
  cors({
    origin: ["https://game-1-rb2y.onrender.com", "http://localhost:3000"],
    methods: ["GET", "POST"],
  })
);

const questions = require("./questions");
const isSimilar = require("./utils/levenshtein");

let players = [];
let currentQuestionIndex = 0;

const updateScores = () => {
  const scores = players.reduce((acc, player) => {
    acc[player.id] = player.score;
    return acc;
  }, {});
  io.emit("updateScores", scores);
};

// Массив эмодзи
const emojis = ["🦄", "🌵", "🦋", "🦉", "🪐", "🌈", "🐉", "🦄", "⚡", "🍄", "🎩", "🧩", "🌙", "🧸", "🪶"];

let timer = null;
let timeRemaining = 15 * 60;

io.on("connection", (socket) => {
  console.log("A user connected", socket.id);

  // Игрок присоединяется
  socket.on("join", (name, score = 0, answered = false) => {
    // Выбираем случайный эмодзи
    const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];

    // Добавляем эмодзи перед ником
    players.push({ id: socket.id, name: randomEmoji + " " + name, answered, score });
    io.emit("updatePlayers", players);

    if (players.length > 0 && !timer) {
      timer = setInterval(() => {
        if (timeRemaining > 0) {
          timeRemaining -= 60; // Уменьшаем на 1 минуту
          io.emit("log", `SERVER : <b>Осталось ${Math.floor(timeRemaining / 60)} мин</b>`);
        } else {
          clearInterval(timer);
          timer = null;
          io.emit("log", "SERVER : Время вышло!");
          // Можно завершить игру или выполнить другие действия
        }
      }, 60000); // Обновления раз в минуту
    }

    // Отправляем текущий вопрос с учётом открытых ответов
    if (currentQuestionIndex < questions.length) {
      const currentQuestion = questions[currentQuestionIndex];
      socket.emit("question", {
        newQuestion: currentQuestion.text,
        possibleAnswers: currentQuestion.answers,
      });
      socket.emit("revealAnswer", currentQuestion.answers);
    }
  });

  // Игрок отправляет ответ
  socket.on("submitAnswer", (answer) => {
    const player = players.find((p) => p.id === socket.id);
    if (player && !player.answered) {
      const question = questions[currentQuestionIndex];
      const matchedAnswer = question.answers.find(
        (a) => isSimilar(a.text, answer) && !a.revealed
      );

      // Логируем все ответы
      io.emit("log", `${player.name} : ${answer}`);

      // Если ответ правильный, обновляем счет
      if (matchedAnswer) {
        player.answered = true;
        player.score += matchedAnswer.points;
        matchedAnswer.revealed = true;

        // Логируем правильный ответ
        io.emit(
          "log",
          `${player.name} : за <strong>${matchedAnswer.text}</strong> получает (${matchedAnswer.points} баллов!)`
        );

        // Обновляем состояние ответов и игроков
        io.emit("revealAnswer", question.answers);
        io.emit("updatePlayers", players);

        updateScores();
      }
    }
  });

  // Переход к следующему вопросу
  socket.on("nextQuestion", () => {
    if (currentQuestionIndex + 1 < questions.length) {
      currentQuestionIndex++;
      const nextQuestion = questions[currentQuestionIndex];

      // Сбрасываем состояние игроков и ответов
      players.forEach((p) => (p.answered = false));
      nextQuestion.answers.forEach((a) => (a.revealed = false));

      io.emit("question", {
        newQuestion: nextQuestion.text,
        possibleAnswers: nextQuestion.answers,
      });
      io.emit("updatePlayers", players);
    } else {
      // Находим победителя
      const winner = players.reduce((max, player) =>
        player.score > (max?.score || 0) ? player : max,
        null
      );
      io.emit("endGame", { winner: winner?.name || "No winner" });
    }
  });

  // Начало новой игры
  socket.on("newGame", () => {
    currentQuestionIndex = 0;

    // Сбрасываем состояние вопросов и игроков
    questions.forEach((q) => q.answers.forEach((a) => (a.revealed = false)));
    players.forEach((p) => {
      p.answered = false;
      p.score = 0;
    });

    io.emit("updatePlayers", players);
    io.emit("log", "New game started!");

    if (questions.length > 0) {
      io.emit("question", {
        newQuestion: questions[0].text,
        possibleAnswers: questions[0].answers,
      });
    }
  });

  // Отключение игрока
  socket.on("disconnect", () => {
    players = players.filter((p) => p.id !== socket.id);

    // Сброс состояния, если лобби пустое
    if (players.length === 0) {
      currentQuestionIndex = 0;
      io.emit("log", "Lobby is empty. Data reset.");
    }

    io.emit("updatePlayers", players);
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
