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

const saveGameState = () => {
  if (currentQuestionIndex < questions.length) {
    const gameState = {
      currentQuestionIndex,
      revealedAnswers: questions[currentQuestionIndex].answers
        .filter((a) => a.revealed)
        .map((a) => a.text)
    };

    // Отправляем всем клиентам обновленное состояние
    io.emit("updateGameState", gameState);
  }
};

const updateScores = () => {
  const scores = players.reduce((acc, player) => {
    acc[player.id] = player.score;
    return acc;
  }, {});
  io.emit("updateScores", scores);
};

io.on("connection", (socket) => {
  console.log("A user connected", socket.id);

  // Игрок присоединяется
  socket.on("join", (name, score = 0, answered = false) => {

    // Добавляем эмодзи перед ником
    players.push({ id: socket.id, name: name, answered, score });
    io.emit("updatePlayers", players);

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

        saveGameState()
        updateScores();
      }
    }
  });
  socket.on("logAnswers", () => {
    if (currentQuestionIndex < questions.length) {
      const currentQuestion = questions[currentQuestionIndex];
      
      // Отправляем список ответов на текущий вопрос
      io.emit("sendAnswers", currentQuestion.answers);
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
    saveGameState();
  });
  // Переход к предыдущему вопросу (или к последнему, если на первом)
socket.on("prevQuestion", () => {
  if (currentQuestionIndex > 0) {
    currentQuestionIndex--;
  } else {
    currentQuestionIndex = questions.length - 1; // Переход к последнему вопросу
  }

  const prevQuestion = questions[currentQuestionIndex];

  // Сбрасываем состояние игроков и ответов
  players.forEach((p) => (p.answered = false));
  prevQuestion.answers.forEach((a) => (a.revealed = false));

  io.emit("question", {
    newQuestion: prevQuestion.text,
    possibleAnswers: prevQuestion.answers,
  });
  io.emit("updatePlayers", players);
});

  socket.on("getQuestions", () => {
    io.emit("questionsList", questions.map((q, index) => ({
      id: index,
      text: q.text
    })));
  });
  // Слушаем событие перехода к выбранному вопросу
socket.on("goToQuestion", (questionId) => {
  if (questionId >= 0 && questionId < questions.length) {
    currentQuestionIndex = questionId;
    const selectedQuestion = questions[questionId];
    
    // Сбрасываем состояние игроков и ответов
    players.forEach((p) => (p.answered = false));
    selectedQuestion.answers.forEach((a) => (a.revealed = false));

    io.emit("question", {
      newQuestion: selectedQuestion.text,
      possibleAnswers: selectedQuestion.answers,
    });
    io.emit("updatePlayers", players);
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
    saveGameState();
  });

  socket.on("restoreGameState", (clientGameState) => {
    if (clientGameState) {
      currentQuestionIndex = clientGameState.currentQuestionIndex;
  
      // Восстанавливаем открытые ответы
      if (currentQuestionIndex < questions.length) {
        questions[currentQuestionIndex].answers.forEach((a) => {
          a.revealed = clientGameState.revealedAnswers.includes(a.text);
        });
      }
  
      console.log("Игра восстановлена от клиента.");
  
      // Обновляем всех клиентов
      saveGameState();
      io.emit("question", {
        newQuestion: questions[currentQuestionIndex].text,
        possibleAnswers: questions[currentQuestionIndex].answers,
      });

      // Явно отправляем открытые ответы
      io.emit("revealAnswer", questions[currentQuestionIndex].answers);
    }
});

  

  // Отключение игрока
  socket.on("disconnect", () => {
    players = players.filter((p) => p.id !== socket.id);

    // Сброс состояния, если лобби пустое
    if (players.length === 0) {
      io.emit("log", "Lobby is empty. Data reset.");
    }

    io.emit("updatePlayers", players);
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
