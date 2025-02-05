import React, { useState, useEffect } from "react";
import { socket } from "../socket";
import PlayerList from "./PlayerList";
import Logs from "./Logs";
import QuestionBlock from "./QuestionBlock";
import AdminControls from "./AdminControls";
import WinnerPopup from "./WinnerPopup";
import Dice from "./Dice";
import styles from "../style/GameRoom.module.css";

export default function GameRoom() {
  const [players, setPlayers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [question, setQuestion] = useState("");
  const [answers, setAnswers] = useState([]);
  const [answer, setAnswer] = useState("");
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [showWinnerPopup, setShowWinnerPopup] = useState(false);
  const [showAdminControls, setShowAdminControls] = useState(false);
  const [showDice, setShowDice] = useState(false);
  const [winner, setWinner] = useState(null);
  const [isConnected, setIsConnected] = useState(true);
  const [serverReady, setServerReady] = useState(false);
  const [dots, setDots] = useState(".");

  useEffect(() => {

      const handleUpdatePlayers = (updatedPlayers) => {
        setPlayers(updatedPlayers);
        const player = updatedPlayers.find((p) => p.id === socket.id);
        setCurrentPlayer(player || null);
        setServerReady(true); // Сервер проснулся
      };
      const handleQuestion = ({ newQuestion, possibleAnswers }) => {
        setQuestion(newQuestion);
        setAnswers(
          possibleAnswers.map((answer) => ({ ...answer, revealed: false }))
        );
        setLogs([]);
        setServerReady(true); // Сервер проснулся
      };

      socket.on('updatePlayers', handleUpdatePlayers);
      socket.on('question', handleQuestion);
      socket.on('log', (message) =>
        setLogs((prevLogs) => [...prevLogs, message])
      );
      socket.on('revealAnswer', (updatedAnswers) => setAnswers(updatedAnswers));
      socket.on('endGame', ({ winner }) => {
        setWinner(winner);
        setShowWinnerPopup(true);
      });

      // Очистка при размонтировании компонента
      return () => {
        socket.off('updatePlayers', handleUpdatePlayers);
        socket.off('question', handleQuestion);
        socket.off('log');
        socket.off('revealAnswer');
        socket.off('endGame');
      };
    
  }, []); // useEffect сработает, когда isConnected изменится

  useEffect(() => {
    socket.on("revealAnswer", (updatedAnswers) => {
      setAnswers(updatedAnswers);

      // Проверяем, есть ли среди обновленных ответов тот, который только что был открыт
      const correctAnswerRevealed = updatedAnswers.some((ans) => ans.revealed);
      if (correctAnswerRevealed) {
        const audio = new Audio("/sound.mp3");
        audio.volume = 0.3;
        audio
          .play()
          .catch((err) => console.error("Ошибка воспроизведения звука:", err));
      }
    });

    return () => {
      socket.off("revealAnswer");
    };
  }, []);

  useEffect(() => {
    if (currentPlayer) {
      localStorage.setItem("playerScore", JSON.stringify(currentPlayer.score));
      localStorage.setItem(
        "playerAnswered",
        JSON.stringify(currentPlayer.answered)
      );
    }
  }, [currentPlayer]);

  const handleAnswerSubmit = () => {
    if (answer.trim()) {
      socket.emit("submitAnswer", answer);
      setAnswer("");
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length < 3 ? prev + "." : "."));
    }, 500);

    return () => clearInterval(interval);
  }, []);

  const handleExit = () => {
    if (
      window.confirm(
        "Вы уверены, что хотите выйти и зайти нормально? Ваши баллы сохранятся."
      )
    ) {
      localStorage.removeItem("playerName");
      window.location.reload();
    }
  };

  const handleDice = () => {
    setShowDice((prev) => !prev);
  };

  const handleNextQuestion = () => {
    socket.emit("nextQuestion");
  };
  const handlePrevQuestion = () => {
    socket.emit("prevQuestion");
  };

  const handleNewGame = () => {
    socket.emit("newGame");
    setShowWinnerPopup(false);
    setWinner(null);
  };

  const handleClosePopup = () => {
    setShowWinnerPopup(false);
    setWinner(null);
  };

  const handleToggleAdminControls = () => {
    setShowAdminControls(!showAdminControls);
  };

  if (!serverReady) {
    return (
      <div className={styles.loader}>
        <p className={styles.outlinedText}>
          Сервер пробуждается, пожалуйста, подождите{dots} 😴
        </p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {showWinnerPopup && (
        <WinnerPopup winner={winner} onClose={handleClosePopup} />
      )}

      <div className={styles.mainGameSection}>
        <div className={styles.leftColumn}>
          <PlayerList players={players} />
        </div>

        <div className={styles.centerColumn}>
          <QuestionBlock question={question} answers={answers} />
        </div>

        <div className={styles.rightColumn}>
          <Logs logs={logs} />
          <div className={styles.diceContainer}>{showDice && <Dice />}</div>
        </div>
      </div>

      <div className={styles.answerSection}>
        <input
          type="text"
          placeholder={
            currentPlayer?.answered ? "Вы уже ответили!" : "Введите ваш ответ"
          }
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !currentPlayer?.answered)
              handleAnswerSubmit();
          }}
          className={styles.input}
          style={{
            backgroundColor: currentPlayer?.answered ? "#e0e0e0" : "#f9f9f9",
            cursor: currentPlayer?.answered ? "not-allowed" : "text",
          }}
          disabled={currentPlayer?.answered}
        />
        <button
          onClick={handleAnswerSubmit}
          className={styles.submitButton}
          disabled={currentPlayer?.answered}
        >
          <img
            className={styles.arrow}
            src="/arrow.svg"
            alt="Отправить"
            width={24}
            height={24}
          />
        </button>
      </div>

      <div className={styles.buttonContainer}>
        <button
          onClick={handleToggleAdminControls}
          className={styles.toggleAdminButton}
        >
          <img
            src="/list.svg"
            alt="Панель управления"
            className={styles.icon}
          />
          {showAdminControls ? "Скрыть панель" : "Панель управления"}
        </button>
        <button onClick={handleExit} className={styles.nameButton}>
          <img className={styles.icon} src="/name.svg" alt="Сменить имя" />
          Сменить имя
        </button>
        <button onClick={handleDice} className={styles.diceButton}>
          <img className={styles.icon} src="./dices/dice.svg" alt="Игра в кости" />
          {showDice ? "Закрыть игру" : "Игра в кости"}
        </button>
      </div>
      {showAdminControls && (
        <div className={styles.adminControlsWrapper}>
          <AdminControls
            onNextQuestion={handleNextQuestion}
            onPrevQuestion={handlePrevQuestion}
            onNewGame={handleNewGame}
          />
        </div>
      )}
    </div>
  );
}
