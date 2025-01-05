import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { socket } from '../socket';
import styles from '../style/WelcomeScreen.module.css';

export default function WelcomeScreen() {
    const [name, setName] = useState('');
    const navigate = useNavigate();

    const handleJoin = () => {
        if (name.trim()) {
            socket.emit('join', name);
            navigate('/room');
        }
    };

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Представься и проходи, тебя уже ждут!</h1>
            <div className={styles.inputContainer}>
                <input
                    type="text"
                    placeholder="Назови себя"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={styles.input}
                />
                <button onClick={handleJoin} className={styles.button}>
                    Войти
                </button>
            </div>
        </div>
    );
}
