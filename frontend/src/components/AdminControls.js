import React, { useState, useEffect } from "react";
import styles from "../style/AdminControls.module.css";
import { socket } from "../socket";

export default function AdminControls({ onNextQuestion, onNewGame }) {
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
        <button onClick={handleToggleQuestionPopup} className={styles.button}>
          Перейти к вопросу
        </button>

        {showQuestionPopup && (
          <div className={`${styles.questionPopup} ${styles.popup}`}>
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
