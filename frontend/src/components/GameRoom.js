import React, { useState, useEffect } from 'react';
import { socket } from '../socket';
import PlayerList from './PlayerList';
import Logs from './Logs';
import QuestionBlock from './QuestionBlock';
import AdminControls from './AdminControls';

export default function GameRoom() {
    const [players, setPlayers] = useState([]);
    const [logs, setLogs] = useState([]);
    const [isAdmin, setIsAdmin] = useState(false);
    const [question, setQuestion] = useState('');
    const [answers, setAnswers] = useState([]);

    useEffect(() => {
        // Слушаем событие для обновления списка игроков
        socket.on('updatePlayers', (updatedPlayers) => setPlayers(updatedPlayers));

        // Слушаем логи
        socket.on('log', (message) => setLogs((prevLogs) => [...prevLogs, message]));

        // Слушаем новое задание вопроса
        socket.on('question', ({ newQuestion, possibleAnswers }) => {
            setQuestion(newQuestion);
            setAnswers(possibleAnswers.map((answer) => ({ ...answer, revealed: false })));
        });

        // Слушаем обновление ответов
        socket.on('revealAnswer', (updatedAnswers) => setAnswers(updatedAnswers));

        // Слушаем событие, которое сообщает, является ли игрок администратором
        socket.on('admin', (isAdminStatus) => setIsAdmin(isAdminStatus));

        // Отписываемся от событий при размонтировании компонента
        return () => socket.off();
    }, []);

    const handleAnswerSubmit = (answer) => {
        socket.emit('submitAnswer', answer);
    };

    const handleNextQuestion = () => {
        if (isAdmin) socket.emit('nextQuestion');
    };

    const handleNewGame = () => {
        if (isAdmin) socket.emit('newGame');
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
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') handleAnswerSubmit(e.target.value);
                    }}
                />
            </div>

            <AdminControls
                isAdmin={isAdmin}
                onNextQuestion={handleNextQuestion}
                onNewGame={handleNewGame}
            />
        </div>
    );
}
