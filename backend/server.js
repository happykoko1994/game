const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const fs = require("fs");
const path = require("path");
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
const saveFilePath = path.join(__dirname, "gameState.json");

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


// Функция сохранения состояния (только текущий вопрос и открытые ответы)
const saveGameState = () => {
  if (currentQuestionIndex < questions.length) {
    const gameState = {
      currentQuestionIndex,
      revealedAnswers: questions[currentQuestionIndex].answers
        .filter((a) => a.revealed)
        .map((a) => a.text),
    };

    fs.writeFile(saveFilePath, JSON.stringify(gameState, null, 2), (err) => {
      if (err) {
        console.error("Ошибка сохранения состояния игры:", err);
      } else {
        console.log("Состояние игры сохранено.");
      }
    });
  }
};

// Функция загрузки состояния
const loadGameState = () => {
  if (fs.existsSync(saveFilePath)) {
    try {
      const data = fs.readFileSync(saveFilePath, "utf8");
      return JSON.parse(data);
    } catch (err) {
      console.error("Ошибка загрузки состояния игры:", err);
    }
  }
  return null;
};

const updateScores = () => {
  const scores = players.reduce((acc, player) => {
    acc[player.id] = player.score;
    return acc;
  }, {});
  io.emit("updateScores", scores);
};

const savedState = loadGameState();
if (savedState) {
  currentQuestionIndex = savedState.currentQuestionIndex;

  // Восстанавливаем открытые ответы
  if (currentQuestionIndex < questions.length) {
    questions[currentQuestionIndex].answers.forEach((a) => {
      a.revealed = savedState.revealedAnswers.includes(a.text);
    });
  }

  console.log("Состояние игры загружено.");
} else {
  console.log("Файл состояния отсутствует или поврежден, начинаем новую игру.");
}

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

        saveGameState();
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
      saveGameState();
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
