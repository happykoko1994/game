import React from 'react';
import styles from '../style/PlayerList.module.css';

export default function PlayerList({ players }) {
    return (
        <div className={styles.playersContainer}>
            <ul className={styles.playersList}>
                {players
                    .slice()
                    .sort((a, b) => b.score - a.score)
                    .map((player, index) => (
                        <li
                            key={index}
                            className={styles.playerItem}
                            style={{ color: player.answered ? 'green' : 'black' }}
                        >
                            {player.name} - <b>{player.score}</b>
                        </li>
                    ))}
            </ul>
        </div>
    );
}
