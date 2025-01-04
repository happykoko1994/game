import React, { useState, useEffect } from "react";

export default function WinnerPopup({ winner, onClose }) {
  if (!winner) return null;

  const winnerPhrases = [
    "Ты победил! Как настоящий герой из WoW, сражавшийся за эльфийское пиво! 🍺",
    "Поздравляем! Ты стал мастером пивных боёв! Настоящий воин пива! 🍻",
    "Как истинный воин, ты завоевал победу и право на стакан холодного пива! 🍺⚔️",
    "В твоих венах течет пиво, как в героях WoW! Ты победил! 🏆🍻",
    "Как могучий воин аниме, ты пробил путь к победе и заслуженно получаешь пиво! 🍺💥",
    "Ты победил, как главный герой аниме, всегда на пике силы, с бокалом пива в руке! 🍻🎌",
    "Ты словно великий воин WoW, победивший в эпической битве и заслуживший своё пиво! 🍺⚔️",
    "Поздравляем, ты стал победителем, и теперь твое пиво – это твой самый ценный трофей! 🏅🍻",
    "Как настоящий аниме-герой, ты победил, и теперь твоя награда – это волшебное пиво! 🍺✨",
    "Ты победил, как истинный чемпион! Пора насладиться заслуженной порцией пива, как в лучших аниме! 🍻🔥",
  ];

  const randomPhrase =
    winnerPhrases[Math.floor(Math.random() * winnerPhrases.length)];

  return (
    <div style={styles.popupOverlay}>
      <div style={styles.popupContent}>
        <h2>{randomPhrase}</h2>
        <p>Выпьем за {winner}, друзья!</p>
        <button onClick={onClose} style={styles.closeButton}>
          Закрыть
        </button>
      </div>
    </div>
  );
}

const styles = {
  popupOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  popupContent: {
    backgroundColor: "#fff",
    borderRadius: "8px",
    padding: "20px",
    textAlign: "center",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
  },
  closeButton: {
    marginTop: "10px",
    padding: "10px 20px",
    backgroundColor: "#4CAF50",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
};
