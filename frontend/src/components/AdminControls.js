import React from 'react';
import styles from '../style/AdminControls.module.css';

export default function AdminControls({ onNextQuestion, onNewGame }) {
    return (
        <div className={styles.controlsContainer}>
            <button onClick={onNextQuestion} className={styles.button}>Следующий вопрос</button>
            <button onClick={onNewGame} className={styles.button}>Новая игра</button>
        </div>
    );
}
