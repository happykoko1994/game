import React, { useState, useEffect } from "react";
import { socket } from "../socket";
import PlayerList from "./PlayerList";
import Logs from "./Logs";
import QuestionBlock from "./QuestionBlock";
import AdminControls from "./AdminControls";

export default function GameRoom() {
  const [players, setPlayers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [question, setQuestion] = useState("");
  const [answers, setAnswers] = useState([]);
  const [answer, setAnswer] = useState("");
  const [currentPlayer, setCurrentPlayer] = useState(null); // Текущий игрок

  useEffect(() => {
    socket.on("updatePlayers", (updatedPlayers) => {
      setPlayers(updatedPlayers);
      const player = updatedPlayers.find((p) => p.id === socket.id);
      setCurrentPlayer(player || null);
    });

    socket.on("log", (message) =>
      setLogs((prevLogs) => [...prevLogs, message])
    );

    socket.on("question", ({ newQuestion, possibleAnswers }) => {
      setQuestion(newQuestion);
      setAnswers(
        possibleAnswers.map((answer) => ({ ...answer, revealed: false }))
      );
    });

    socket.on("revealAnswer", (updatedAnswers) => setAnswers(updatedAnswers));

    return () => socket.off();
  }, []);

  const handleAnswerSubmit = () => {
    if (answer.trim()) {
      socket.emit("submitAnswer", answer);
      setAnswer("");
    }
  };

  const handleNextQuestion = () => {
    socket.emit("nextQuestion");
  };

  const handleNewGame = () => {
    socket.emit("newGame");
  };

  return (
    <div style={styles.container}>
      <div style={styles.mainGameSection}>
        <div style={styles.leftColumn}>
          <PlayerList players={players} />
        </div>

        <div style={styles.centerColumn}>
          <QuestionBlock question={question} answers={answers} />
        </div>

        <div style={styles.rightColumn}>
          <Logs logs={logs} />
        </div>
      </div>

      <div style={styles.answerSection}>
        <input
          type="text"
          placeholder={
            currentPlayer?.answered
              ? "Вы уже ответили!"
              : "Введите ваш ответ"
          }
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !currentPlayer?.answered)
              handleAnswerSubmit();
          }}
          style={{
            ...styles.input,
            backgroundColor: currentPlayer?.answered ? "#e0e0e0" : "#f9f9f9",
            cursor: currentPlayer?.answered ? "not-allowed" : "text",
          }}
          disabled={currentPlayer?.answered}
        />
        <button
          onClick={handleAnswerSubmit}
          style={{
            ...styles.submitButton,
            backgroundColor: currentPlayer?.answered ? "#ccc" : "#4CAF50",
            cursor: currentPlayer?.answered ? "not-allowed" : "pointer",
          }}
          disabled={currentPlayer?.answered}
        >
          Отправить
        </button>
      </div>

      <div style={styles.adminControlsWrapper}>
        <AdminControls
          onNextQuestion={handleNextQuestion}
          onNewGame={handleNewGame}
        />
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    margin: "0 auto",
    fontFamily: "'Arial', sans-serif",
  },
  mainGameSection: {
    display: "flex",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: "20px",
    marginTop: "10%",
  },
  leftColumn: {
    flex: 1,
    marginRight: "20px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    backgroundColor: "#ffffff",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    maxHeight: "300px",
  },
  centerColumn: {
    padding: "20px",
    flex: 2,
    textAlign: "center",
    border: "1px solid #ddd",
    borderRadius: "8px",
    backgroundColor: "#ffffff",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    maxHeight: "500px",
  },
  rightColumn: {
    flex: 1,
    marginLeft: "20px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    backgroundColor: "#ffffff",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    maxHeight: "300px",
  },
  answerSection: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "20px",
  },
  input: {
    flex: 2,
    padding: "10px",
    fontSize: "18px",
    borderRadius: "4px",
    border: "1px solid #ccc",
    marginRight: "10px",
    color: "#333",
  },
  submitButton: {
    padding: "10px 20px",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
  },
  adminControlsWrapper: {
    width: "100%",
    position: "absolute",
    bottom: "20px",
    left: "50%",
    transform: "translateX(-50%)",
  },
};
