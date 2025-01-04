import React from 'react';

export default function Logs({ logs }) {
    return (
        <div>
            <h2>Logs</h2>
            <ul>
                {logs.map((log, index) => (
                    <li key={index}>{log}</li>
                ))}
            </ul>
        </div>
    );
}
