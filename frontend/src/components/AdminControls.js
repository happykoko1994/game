import React from 'react';

export default function AdminControls({ onNextQuestion, onNewGame }) {
    return (
        <div style={styles.controlsContainer}>
            <button onClick={onNextQuestion} style={styles.button}>Следующий вопрос</button>
            <button onClick={onNewGame} style={styles.button}>Новая игра</button>
        </div>
    );
}

const styles = {
    controlsContainer: {
        display: 'flex',
        justifyContent: 'center',
        gap: '10px',
        marginTop: '20px',
    },
    button: {
        padding: '10px 20px',
        backgroundColor: '#4CAF50',
        color: '#fff',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '16px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    }
};
