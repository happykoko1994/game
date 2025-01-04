import React from 'react';
import { Routes, Route } from 'react-router-dom';
import WelcomeScreen from './components/WelcomeScreen';
import GameRoom from './components/GameRoom';

export default function App() {
    return (
        <Routes>
            <Route path="/" element={<WelcomeScreen />} />
            <Route path="/room" element={<GameRoom />} />
        </Routes>
    );
}

