import React, { useState } from "react";
import styles from "../style/WelcomeScreen.module.css";

export default function WelcomeScreen({ setName }) {
  const [name, setNameInput] = useState("");

  const handleJoin = () => {
    if (name.trim()) {
      setName(name.trim());
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Представься и проходи, тебя уже ждут! 👻</h1>
      <div className={styles.answerSection}>
  <input
    type="text"
    placeholder="Назови себя"
    value={name}
    onChange={(e) => setNameInput(e.target.value)}
    onKeyDown={(e) => {
      if (e.key === "Enter") handleJoin();
    }}
    className={styles.input}
    maxLength={15}
  />
  <button
    onClick={handleJoin}
    className={styles.submitButton}
  >
    Войти
  </button>
</div>

    </div>
  );
}
