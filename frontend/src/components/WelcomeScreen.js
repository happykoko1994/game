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
        <div>
            <h1>Welcome to "100 to 1"</h1>
            <input
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
            />
            <button onClick={handleJoin}>Join</button>
        </div>
    );
}
