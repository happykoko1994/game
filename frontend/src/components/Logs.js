import React, { useEffect, useRef } from "react";
import styles from "../style/Logs.module.css";

export default function Logs({ logs }) {
  const logsEndRef = useRef(null);

  useEffect(() => {
    // Прокручиваем вниз, как только обновляются логи
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs]); // Зависимость от изменения логов

  return (
    <div className={styles.logsContainer}>
      <ul className={styles.logsList}>
        {logs.map((log, index) => (
          <li key={index} className={styles.logItem}>
            <span dangerouslySetInnerHTML={{ __html: log }} />
          </li>
        ))}
        <div ref={logsEndRef} /> {/* Сюда будет прокручиваться */}
      </ul>
    </div>
  );
}
