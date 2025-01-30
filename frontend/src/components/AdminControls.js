import React from "react";
import { useState, useEffect } from "react";
import styles from "../style/AdminControls.module.css";
import { socket } from "../socket";

export default function AdminControls({ onNextQuestion, onNewGame }) {
  const [showAnswers, setShowAnswers] = useState(false);
  const [answers, setAnswers] = useState([]);

  useEffect(() => {
    // Слушаем событие для получения ответов на текущий вопрос
    socket.on("sendAnswers", (answersData) => {
      setAnswers(answersData);
    });

    // Очистка при размонтировании компонента
    return () => {
      socket.off("sendAnswers");
    };
  }, []);

  const handleShowAnswers = () => {
    setShowAnswers((prev) => !prev);

    // Отправляем запрос на сервер для записи лога
    socket.emit("logAnswers", "Ответы были показаны");
  };
  const handleNextQuestion = () => {
    setShowAnswers(false);
    onNextQuestion();
  };

  const handleNewGame = () => {
    setShowAnswers(false);
    onNewGame();
  };

  return (
    <div className={styles.controlsContainer}>
      <button onClick={handleNextQuestion} className={styles.button}>
        Следующий вопрос
      </button>
      <button onClick={handleNewGame} className={styles.button}>
        Новая игра
      </button>
      <div className={styles.container}>
        <button onClick={handleShowAnswers} className={styles.button}>
          {showAnswers ? "Скрыть ответы" : "Показать ответы"}
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
