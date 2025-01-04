import React from 'react';

export default function AdminControls({ onNextQuestion, onNewGame }) {
    return (
        <div>
            <button onClick={onNextQuestion}>Next Question</button>
            <button onClick={onNewGame}>New Game</button>
        </div>
    );
}