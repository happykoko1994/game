import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { socket } from '../socket';

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
        <div style={styles.container}>
            <h1 style={styles.title}>Добро пожаловать в игру "100 к 1"</h1>
            <div style={styles.inputContainer}>
                <input
                    type="text"
                    placeholder="Введите ваше имя"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={styles.input}
                />
                <button onClick={handleJoin} style={styles.button}>
                    Войти
                </button>
            </div>
        </div>
    );
}

const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: 'linear-gradient(to bottom, #f0f8ff, #e6e6fa)', // Плавный градиент
        fontFamily: "'Arial', sans-serif", // Шрифт
        textAlign: 'center',
    },
    title: {
        fontSize: '36px',
        fontWeight: 'bold',
        color: '#333',
        marginBottom: '20px',
    },
    inputContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '10px',
    },
    input: {
        width: '300px',
        padding: '10px',
        fontSize: '18px',
        borderRadius: '5px',
        border: '1px solid #ccc',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    },
    button: {
        width: '150px',
        padding: '10px',
        fontSize: '18px',
        color: '#fff',
        backgroundColor: '#4CAF50',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        transition: 'background-color 0.3s',
    },
    buttonHover: {
        backgroundColor: '#45a049',
    },
};
