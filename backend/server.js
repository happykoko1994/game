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

// Роуты и обработчики для вашего приложения
app.use(
  cors({
    origin: ["https://game-1-rb2y.onrender.com", "http://localhost:3000"], // Разрешить только фронтенд домен
    methods: ["GET", "POST"],
  })
);

// Separate file for questions (questions.js)
const questions = require("./questions");

let players = [];
let adminId = null;
let currentQuestionIndex = 0;

io.on("connection", (socket) => {
  console.log("A user connected", socket.id);

  // Игрок присоединился
  socket.on("join", (name) => {
    players.push({ id: socket.id, name, answered: false, score: 0 }); // Добавляем поле для баллов
    io.emit("updatePlayers", players);

    // Если нет админа, то назначаем первого игрока администратором
    if (!adminId) adminId = socket.id;
    io.to(adminId).emit("admin", true);

    // Отправляем первый вопрос
    if (currentQuestionIndex < questions.length) {
      io.emit("question", {
        newQuestion: questions[currentQuestionIndex].text,
        possibleAnswers: questions[currentQuestionIndex].answers,
      });
    }
  });

  // Игрок отправил свой ответ
  socket.on("submitAnswer", (answer) => {
    const player = players.find((p) => p.id === socket.id);
    if (player && !player.answered) {
      const question = questions[currentQuestionIndex];
      const matchedAnswer = question.answers.find(
        (a) => a.text.toLowerCase() === answer.toLowerCase()
      );
      if (matchedAnswer) {
        player.answered = true;
        player.score += matchedAnswer.points; // Добавляем баллы
        io.emit(
          "log",
          `${player.name} guessed: ${matchedAnswer.text} (${matchedAnswer.points} points)`
        );
        question.answers = question.answers.map((a) =>
          a.text === matchedAnswer.text ? { ...a, revealed: true } : a
        );
        io.emit("revealAnswer", question.answers);
      }
      io.emit("updatePlayers", players);
    }
  });

  // Переход к следующему вопросу
  socket.on("nextQuestion", () => {
    if (currentQuestionIndex + 1 < questions.length) {
      currentQuestionIndex++;
      const nextQuestion = questions[currentQuestionIndex];
      players.forEach((p) => (p.answered = false));
      io.emit("question", {
        newQuestion: nextQuestion.text,
        possibleAnswers: nextQuestion.answers,
      });
      io.emit("updatePlayers", players);
    }
  });

  // Начало новой игры
  socket.on("newGame", () => {
    currentQuestionIndex = 0;
    players.forEach((p) => {
      p.answered = false;
      p.score = 0; // Сбрасываем баллы
    });
    if (questions.length > 0) {
      io.emit("question", {
        newQuestion: questions[0].text,
        possibleAnswers: questions[0].answers,
      });
    }
    io.emit("updatePlayers", players);
    io.emit("log", "New game started!");
  });

  socket.on("disconnect", () => {
    players = players.filter((p) => p.id !== socket.id);
    if (socket.id === adminId && players.length > 0) {
      adminId = players[0].id;
      io.to(adminId).emit("admin", true);
    }
    io.emit("updatePlayers", players);
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
