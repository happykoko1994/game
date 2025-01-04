import React from 'react';

export default function QuestionBlock({ question, answers }) {
    return (
        <div style={styles.questionBlock}>
            <p style={styles.questionText}>{question}</p>
            <div style={styles.answersContainer}>
                {answers.map((answer, index) => (
                    <div key={index} style={styles.answerContainer}>
                        {answer.revealed ? `${answer.text} (${answer.points} очков)` : '???'}
                    </div>
                ))}
            </div>
        </div>
    );
}

const styles = {
    questionBlock: {
        marginBottom: '20px',
    },
    questionText: {
        fontSize: '28px',
        fontWeight: 'bold',
        color: '#333',
        marginBottom: '20px',
    },
    answersContainer: {
        display: 'flex',
        flexDirection: 'column', // Изменено на столбик
        gap: '10px',
    },
    answerContainer: {
        padding: '15px',
        backgroundColor: '#f2f2f2',
        borderRadius: '8px',
        textAlign: 'center',
        fontSize: '18px',
        fontWeight: 'bold',
    },
};
