import React from 'react';

export default function PlayerList({ players }) {
    return (
        <div>
            <h2>Players</h2>
            <ul>
                {players.map((player, index) => (
                    <li key={index} style={{ color: player.answered ? 'green' : 'black' }}>
                        {player.name} - {player.score} points {/* Отображаем баллы */}
                    </li>
                ))}
            </ul>
        </div>
    );
}
