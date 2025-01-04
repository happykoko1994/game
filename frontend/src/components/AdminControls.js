import React from 'react';

export default function AdminControls({ isAdmin, onNextQuestion, onNewGame }) {
    if (!isAdmin) return null;
    return (
        <div>
            <button onClick={onNextQuestion}>Next Question</button>
            <button onClick={onNewGame}>New Game</button>
        </div>
    );
}
