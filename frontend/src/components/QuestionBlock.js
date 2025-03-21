import React from 'react';
import styles from '../style/QuestionBlock.module.css';

export default function QuestionBlock({ question, answers }) {
    return (
        <div className={styles.questionBlock}>
            <p className={styles.questionText}>{question}</p>
            <div className={styles.answersContainer}>
                {answers.map((answer, index) => (
                    <div
                        key={index}
                        className={`${styles.answerContainer} ${answer.revealed ? styles.revealed : ''}`}
                    >
                        <span>{answer.revealed ? `${answer.text} - ${answer.points}` : `- ${index + 1} -`}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

