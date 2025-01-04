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
        socket.on('updatePlayers', (updatedPlayers) => setPlayers(updatedPlayers));
        socket.on('log', (message) => setLogs((prevLogs) => [...prevLogs, message]));
        socket.on('question', ({ newQuestion, possibleAnswers }) => {
            setQuestion(newQuestion);
            setAnswers(possibleAnswers.map((answer) => ({ ...answer, revealed: false })));
        });
        socket.on('revealAnswer', (updatedAnswers) => setAnswers(updatedAnswers));
        socket.on('admin', (isAdminStatus) => setIsAdmin(isAdminStatus));

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
