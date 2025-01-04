import React from 'react';

export default function QuestionBlock({ question, answers }) {
    return (
        <div>
            <h2>Question</h2>
            <p>{question}</p>
            <div>
                {answers.map((answer, index) => (
                    <div key={index}>
                        {answer.revealed ? `${answer.text} (${answer.points} points)` : '???'}
                    </div>
                ))}
            </div>
        </div>
    );
}