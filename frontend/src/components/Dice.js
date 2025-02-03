import React, { useState, useEffect } from "react";
import styles from "../style/Dice.module.css";

const Dice = () => {
  const [dice, setDice] = useState([]);
  const [selectedDice, setSelectedDice] = useState([]);
  const [temporaryScore, setTemporaryScore] = useState(0);
  const [permanentScore, setPermanentScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [remainingDice, setRemainingDice] = useState(6);
  const [gamePhase, setGamePhase] = useState("start");
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);
  const [burnedScoreMessage, setBurnedScoreMessage] = useState("");

  useEffect(() => {
    const savedHighScore = localStorage.getItem("highScore");
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore, 10));
    }
  }, []);

  const updateHighScore = (score) => {
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem("highScore", score);
    }
  };
  const hasInvalidDice = (selectedValues) => {
    return selectedValues.some((value) => {
      const counts = selectedValues.filter(v => v === value).length;
      return (
        counts < 3 && value !== 1 && value !== 5 // Если не тройка, не 1 и не 5 — это "мусор"
      );
    });
  };
  

  const rollDice = (numDice) => {
    return Array(numDice)
      .fill(0)
      .map(() => Math.floor(Math.random() * 6) + 1);
  };

  const renderDots = (value) => {
    const dotPositions = {
      1: [[50, 50]],
      2: [
        [20, 20],
        [80, 80],
      ],
      3: [
        [20, 20],
        [50, 50],
        [80, 80],
      ],
      4: [
        [20, 20],
        [20, 80],
        [80, 20],
        [80, 80],
      ],
      5: [
        [20, 20],
        [20, 80],
        [50, 50],
        [80, 20],
        [80, 80],
      ],
      6: [
        [20, 20],
        [20, 50],
        [20, 80],
        [80, 20],
        [80, 50],
        [80, 80],
      ],
    };

    return dotPositions[value].map((pos, i) => (
      <span
        key={i}
        className={styles.dot}
        style={{ top: `${pos[1]}%`, left: `${pos[0]}%` }}
      ></span>
    ));
  };

  const calculateScore = (selectedValues) => {
    let score = 0;
    const counts = {};

    selectedValues.forEach((value) => {
      counts[value] = (counts[value] || 0) + 1;
    });

    for (const value in counts) {
      const count = counts[value];
      const numValue = parseInt(value, 10);

      if (count >= 3) {
        score +=
          numValue === 1
            ? 1000 * Math.floor(count / 3)
            : numValue * 100 * Math.floor(count / 3);
        if (count === 4) {
          score += numValue * 100;
        }
      }

      const remaining = count % 3;
      if (numValue === 1 && remaining > 0) score += 100 * remaining;
      if (numValue === 5 && remaining > 0) score += 50 * remaining;
    }

    const sortedValues = [...selectedValues].sort((a, b) => a - b).join("");
    if (sortedValues === "123456") score += 1500;
    if (sortedValues === "12345") score += 500;
    if (sortedValues === "23456") score += 750;

    return score;
  };

  const handleDiceClick = (index) => {
    setSelectedDice((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const hasScorableCombination = () => {
    const selectedValues = selectedDice.map((index) => dice[index]);
    return calculateScore(selectedValues) > 0;
  };

  const startNewTurn = () => {
    let newDice;
    do {
      newDice = rollDice(6);
    } while (calculateScore(newDice) === 0); // Перебрасываем, пока нет комбинации
  
    setDice(newDice);
    setSelectedDice([]);
    setTemporaryScore(0);
    setRemainingDice(6);
    setBurnedScoreMessage("");
    setGamePhase("continue");
  };

  const continueGame = () => {
    if (selectedDice.length === 0) {
      return alert("Вы не отложили кубики!");
    }
  
    const selectedValues = selectedDice.map((index) => dice[index]);
    const roundScore = calculateScore(selectedValues);
  
    // Проверяем, является ли выбранная комбинация корректной
    if (roundScore === 0 || hasInvalidDice(selectedValues)) {
      setBurnedScoreMessage("Неверная комбинация! Есть неподходящие кости.");
      return;
    }
  
    const remaining = remainingDice - selectedDice.length;
    const newDice = rollDice(remaining === 0 ? 6 : remaining);
  
    if (calculateScore(newDice) === 0) {
      setDice(newDice);
      setTemporaryScore(0);
      setPermanentScore(0);
      setBurnedScoreMessage("Нет комбинаций, очки сгорели!");
      updateHighScore(permanentScore);
      setGamePhase("start");
      setSelectedDice([]);
      return;
    }
  
    setDice(newDice);
    setBurnedScoreMessage("");
    setRemainingDice(remaining === 0 ? 6 : remaining);
    setTemporaryScore(temporaryScore + roundScore);
    setSelectedDice([]);
  };
  

  const endTurn = () => {
    if (temporaryScore === 0) {
      alert("Вы не можете завершить ход, так как у вас 0 временных очков!");
      return;
    }

    const selectedValues = selectedDice.map((index) => dice[index]);
    const roundScore = calculateScore(selectedValues);
  
    // Проверяем, является ли выбранная комбинация корректной
    if (roundScore === 0 || hasInvalidDice(selectedValues)) {
      setBurnedScoreMessage("Неверная комбинация! Есть неподходящие кости.");
      return;
    }
    const newPermanentScore =
      permanentScore + temporaryScore + roundScore;
    setPermanentScore(newPermanentScore);
    setTemporaryScore(0);
    setSelectedDice([]);
    setGamePhase("continue");

    // Обновляем рекорд, если новое значение permanentScore больше текущего рекорда
    updateHighScore(newPermanentScore);

    const newDice = rollDice(6);
    setDice(newDice);
    setRemainingDice(6);

    // Проверяем, есть ли среди новых кубиков комбинация, которая принесет очки
    if (calculateScore(newDice) === 0) {
      setGamePhase("start");
      setDice([]);
      setSelectedDice([]);
      setTemporaryScore(0);
      setPermanentScore(0);
      return;
    }
  };

  const resetGame = () => {
    setDice([]);
    setSelectedDice([]);
    setTemporaryScore(0);
    setPermanentScore(0);
    setRemainingDice(6);
    setGamePhase("start");
  };

  // Вычисление очков для выбранных костей
  const selectedDiceValues = selectedDice.map((index) => dice[index]);
  const selectedDiceScore = calculateScore(selectedDiceValues);

  return (
    <div className={styles.gameContainer}>
      <div className={styles.scoreboard}>
        <p>Рекорд: {highScore}</p>
        <p>Постоянные очки: {permanentScore}</p>
        <p>Временные очки: {temporaryScore}</p>
      </div>
      <div className={styles.diceContainer}>
        {dice.map((value, index) => (
          <div
            key={index}
            className={`${styles.dice} ${
              selectedDice.includes(index) ? styles.selected : ""
            }`}
            onClick={() => handleDiceClick(index)}
          >
            <div className={styles.diceFace} data-value={value}>
              {renderDots(value)}
            </div>
          </div>
        ))}
      </div>
      {/* Отображаем очки за выбранные кости */}
      {selectedDice.length > 0 && (
        <div className={styles.selectedScore}>
          Выбрано на {selectedDiceScore} очков
        </div>
      )}
      {burnedScoreMessage && (
        <div className={styles.burnedScoreMessage}>{burnedScoreMessage}</div>
      )}
      <div className={styles.tooltipContainer}>
        <span
          className={styles.tooltipIcon}
          onMouseEnter={() => setIsTooltipVisible(true)}
          onMouseLeave={() => setIsTooltipVisible(false)}
        >
          ?
        </span>
        {isTooltipVisible && (
          <div className={styles.tooltip}>
            Накопите очки, выбирая кости с нужными значениями, например:
            <ul>
              <li>
                <img src="./dices/diceone.svg" width={20} height={20} /> - 100
                очков
              </li>
              <li>
                <img src="./dices/dicefive.svg" width={20} height={20} /> - 50
                очков
              </li>
              <li>
                <img src="./dices/dicefive.svg" width={20} height={20} /> x 3 -
                500 очков
              </li>
              <li>
                <img src="./dices/dicetwo.svg" width={20} height={20} /> x 4 -
                800 очков
              </li>
              <li>
                <img src="./dices/diceone.svg" width={20} height={20} /> -&nbsp;
                <img src="./dices/dicefive.svg" width={20} height={20} /> - 500
                очков
              </li>
              <li>
                <img src="./dices/dicetwo.svg" width={20} height={20} /> -&nbsp;
                <img src="./dices/dicesix.svg" width={20} height={20} /> - 750
                очков
              </li>
              <li>
                <img src="./dices/diceone.svg" width={20} height={20} /> x 3 -
                1000 очков
              </li>
              <li>
                <img src="./dices/diceone.svg" width={20} height={20} /> -&nbsp;
                <img src="./dices/dicesix.svg" width={20} height={20} /> - 1500
                очков
              </li>
            </ul>
          </div>
        )}
      </div>

      <div className={styles.diceButtonContainer}>
        {gamePhase === "start" && (
          <button onClick={startNewTurn}>Бросить кости</button>
        )}
        {gamePhase === "continue" && (
          <>
            <button onClick={continueGame} disabled={selectedDice.length === 0}>
              {selectedDice.length === 0 ? "Выберите кости" : "Продолжить игру"}
            </button>
            {temporaryScore > 0 && hasScorableCombination() && (
              <button onClick={endTurn}>Завершить ход</button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Dice;
