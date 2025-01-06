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
      <h1 className={styles.title}>Представься и проходи, тебя уже ждут!</h1>
      <div className={styles.inputContainer}>
        <input
          type="text"
          placeholder="Назови себя"
          value={name}
          onChange={(e) => setNameInput(e.target.value)}
          className={styles.input}
        />
        <button onClick={handleJoin} className={styles.button}>
          Войти
        </button>
      </div>
    </div>
  );
}
