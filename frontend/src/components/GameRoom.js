import React, { useState, useEffect } from 'react';
import { socket } from '../socket';
import PlayerList from './PlayerList';
import Logs from './Logs';
import QuestionBlock from './QuestionBlock';
import AdminControls from './AdminControls';

export default function GameRoom() {
    const [players, setPlayers] = useState([]);
    const [logs, setLogs] = useState([]);
    const [question, setQuestion] = useState('');
    const [answers, setAnswers] = useState([]);
    const [answer, setAnswer] = useState(''); // Состояние для текущего ответа

    useEffect(() => {
        // Слушаем события от сервера
        socket.on('updatePlayers', (updatedPlayers) => setPlayers(updatedPlayers));
        socket.on('log', (message) => setLogs((prevLogs) => [...prevLogs, message]));
        socket.on('question', ({ newQuestion, possibleAnswers }) => {
            setQuestion(newQuestion);
            setAnswers(possibleAnswers.map((answer) => ({ ...answer, revealed: false })));
        });
        socket.on('revealAnswer', (updatedAnswers) => setAnswers(updatedAnswers));

        return () => socket.off();
    }, []);

    // Отправка ответа на сервер
    const handleAnswerSubmit = () => {
        if (answer.trim()) {
            socket.emit('submitAnswer', answer);
            setAnswer(''); // Очищаем поле после отправки
        }
    };

    // Переход к следующему вопросу
    const handleNextQuestion = () => {
        socket.emit('nextQuestion');
    };

    // Начало новой игры
    const handleNewGame = () => {
        socket.emit('newGame');
    };

    return (
        <div>
            <h1>Game Room</h1>
            <div>
                <QuestionBlock question={question} answers={answers} />
                <PlayerList players={players} />
                <Logs logs={logs} />
            </div>

            <div>
                <input
                    type="text"
                    placeholder="Enter your answer"
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)} // Обновление состояния ответа
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') handleAnswerSubmit(); // Отправка при нажатии Enter
                    }}
                />
                <button onClick={handleAnswerSubmit}>Enter</button> {/* Кнопка для отправки ответа */}
            </div>

            <AdminControls
                onNextQuestion={handleNextQuestion}
                onNewGame={handleNewGame}
            />
        </div>
    );
}
