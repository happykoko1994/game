import React, { useState, useEffect, useRef } from "react";
import styles from "../style/AdminControls.module.css";
import { socket } from "../socket";

export default function AdminControls({
  onNextQuestion,
  onPrevQuestion,
  onNewGame,
}) {
  const [showAnswers, setShowAnswers] = useState(false);
  const [showQuestionPopup, setShowQuestionPopup] = useState(false);
  const [answers, setAnswers] = useState([]);
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    // Слушаем событие для получения ответов на текущий вопрос
    socket.on("sendAnswers", (answersData) => {
      setAnswers(answersData);
    });

    // Слушаем событие для получения списка вопросов
    socket.on("questionsList", (questionsList) => {
      setQuestions(questionsList);
    });

    // Запрашиваем список вопросов при монтировании компонента
    socket.emit("getQuestions");

    // Очистка при размонтировании компонента
    return () => {
      socket.off("sendAnswers");
      socket.off("questionsList");
    };
  }, []);

  useEffect(() => {
    const handleUpdateGameState = (gameState) => {
      localStorage.setItem("gameState", JSON.stringify(gameState));
    };
  
    socket.on("updateGameState", handleUpdateGameState);
  
    return () => {
      socket.off("updateGameState", handleUpdateGameState);
    };
  }, []);
  

  const restoreGame = () => {
    const savedGameState = localStorage.getItem("gameState");
  
    if (savedGameState) {
      socket.emit("restoreGameState", JSON.parse(savedGameState));
    } else {
      alert("Нет сохранённой игры!");
    }
  };
  

  const handleShowAnswers = () => {
    setShowAnswers((prev) => !prev);

    // Отправляем запрос на сервер для записи лога
    socket.emit("logAnswers", "Ответы были показаны");
  };

  const handleNextQuestion = () => {
    setShowAnswers(false);
    onNextQuestion();
  };

  const handlePrevQuestion = () => {
    setShowAnswers(false);
    onPrevQuestion();
  };

  const handleNewGame = () => {
    setShowAnswers(false);
    onNewGame();
  };

  const handleToggleQuestionPopup = () => {
    setShowQuestionPopup((prev) => !prev); // Переключаем состояние всплывашки
  };

  const handleSelectQuestion = (questionId) => {
    // Отправляем на сервер команду перейти к выбранному вопросу
    socket.emit("goToQuestion", questionId);
    setShowQuestionPopup(false); // Закрываем всплывающее окно
  };

  return (
    <div className={styles.controlsContainer}>
      <div className={styles.container}>
        <button
          onClick={handleToggleQuestionPopup}
          className={`${styles.button} ${styles.listButton}`}
        >
          <span className={styles.text}>Перейти к вопросу</span>
          <img
            className={styles.icon}
            src="/list.svg"
            alt="Перейти к вопросу"
          />
        </button>

        {showQuestionPopup && (
          <div
            className={`${styles.questionPopup} ${styles.popup}`}
          >
            <ul>
              {questions.map((question) => (
                <li
                  key={question.id}
                  onClick={() => handleSelectQuestion(question.id)}
                >
                  {question.text}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <button onClick={handleNextQuestion} className={styles.button}>
        <span className={styles.text}>Следующий вопрос</span>
        <img className={styles.icon} src="/next.svg" alt="Следующий вопрос" />
      </button>
      <button
        onClick={handlePrevQuestion}
        className={`${styles.button} ${styles.prevButton}`}
      >
        <span className={styles.text}>Предыдущий вопрос</span>
        <img className={styles.icon} src="/prev.svg" alt="Предыдущий вопрос" />
      </button>
      <button
        onClick={handleNewGame}
        className={`${styles.button} ${styles.newGameButton}`}
      >
        <span className={styles.text}>Новая игра</span>
        <img className={styles.icon} src="/name.svg" alt="Перейти к вопросу" />
      </button>
      <button onClick={restoreGame} className={`${styles.button} ${styles.newGameButton}`}>
      <span className={styles.text}>К прошлой игре</span>
        <img className={styles.icon} src="/back.svg" alt="Предыдущая игра" />
        </button>
      <div className={styles.container}>
        <button onClick={handleShowAnswers} className={styles.button}>
          <span className={styles.text}>
            {showAnswers ? "Скрыть ответы" : "Показать ответы"}
          </span>
          <img
            className={styles.icon}
            src="/answer.svg"
            alt="Показать ответы"
          />
        </button>

        {showAnswers && (
          <div className={styles.popup}>
            <ul>
              {answers.map((answer, index) => (
                <li key={index}>
                  {answer.text} - {answer.points}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
