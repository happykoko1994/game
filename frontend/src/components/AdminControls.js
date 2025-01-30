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

  const questionPopupRef = useRef(null);
  const answersPopupRef = useRef(null);

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
    const handleClickOutside = (event) => {
      // Проверяем, был ли клик вне всплывашки
      if (
        questionPopupRef.current &&
        !questionPopupRef.current.contains(event.target)
      ) {
        setShowQuestionPopup(false);
      }
      if (
        answersPopupRef.current &&
        !answersPopupRef.current.contains(event.target)
      ) {
        setShowAnswers(false);
      }
    };

    // Добавляем обработчик события
    document.addEventListener("mousedown", handleClickOutside);

    // Убираем обработчик при размонтировании компонента
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
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
          <img
            className={styles.icon}
            src="/list.svg"
            alt="Перейти к вопросу"
          />
          <span className={styles.text}>Перейти к вопросу</span>
        </button>

        {showQuestionPopup && (
          <div
            ref={questionPopupRef}
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
        <img className={styles.icon} src="/next.svg" alt="Следующий вопрос" />
        <span className={styles.text}>Следующий вопрос</span>
      </button>
      <button
        onClick={handlePrevQuestion}
        className={`${styles.button} ${styles.prevButton}`}
      >
        <img className={styles.icon} src="/prev.svg" alt="Предыдущий вопрос" />
        <span className={styles.text}>Предыдущий вопрос</span>
      </button>
      <button
        onClick={handleNewGame}
        className={`${styles.button} ${styles.newGameButton}`}
      >
        <img className={styles.icon} src="/name.svg" alt="Перейти к вопросу" />
        <span className={styles.text}>Новая игра</span>
      </button>
      <div className={styles.container}>
        <button onClick={handleShowAnswers} className={styles.button}>
          <img
            className={styles.icon}
            src="/answer.svg"
            alt="Показать ответы"
          />
          <span className={styles.text}>
            {showAnswers ? "Скрыть ответы" : "Показать ответы"}
          </span>
        </button>

        {showAnswers && (
          <div ref={answersPopupRef} className={styles.popup}>
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
