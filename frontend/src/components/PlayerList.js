import React from 'react';

export default function PlayerList({ players }) {
    return (
        <div style={styles.playersContainer}>
            <ul style={styles.playersList}>
                {players.map((player, index) => (
                    <li key={index} style={{ ...styles.playerItem, color: player.answered ? 'green' : 'black' }}>
                        {player.name} - {player.score} баллов
                    </li>
                ))}
            </ul>
        </div>
    );
}

const styles = {
    playersContainer: {
        padding: '15px',
        backgroundColor: '#f9f9f9',
        borderRadius: '8px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        height: '100%',
        overflowY: 'auto',
    },
    playersList: {
        listStyleType: 'none',
        padding: 0,
    },
    playerItem: {
        padding: '10px',
        borderBottom: '1px solid #ddd',
        fontSize: '16px',
    }
};
