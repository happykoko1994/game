import React from "react";
import styles from "../style/PlayerList.module.css";

export default function PlayerList({ players }) {
  return (
<div className={styles.playersContainer}>
<ul className={styles.playersList}>
  {players
    .slice()
    .sort((a, b) => b.score - a.score)
    .map((player, index) => (
      <li
        key={index}
        className={styles.playerItem}
        style={{ color: player.answered ? "green" : "black" }}
      >
        <div className={styles.playerDetails}>
          <div className={styles.medal}>
            {index === 0 && "🥇"}
            {index === 1 && "🥈"}
            {index === 2 && "🥉"}
            {index >= 3 && index + 1}
          </div>
          {/* Ник игрока */}
          <span className={styles.playerName}>{player.name}</span>
          {/* Очки игрока */}
          <span className={styles.playerScore}>{player.score}</span>
        </div>
      </li>
    ))}
</ul>
</div>

  );
}
