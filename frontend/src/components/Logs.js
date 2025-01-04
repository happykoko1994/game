import React from 'react';

export default function Logs({ logs }) {
    return (
        <div style={styles.logsContainer}>
            <ul style={styles.logsList}>
                {logs.map((log, index) => (
                    <li key={index} style={styles.logItem}>{log}</li>
                ))}
            </ul>
        </div>
    );
}

const styles = {
    logsContainer: {
        padding: '15px',
        backgroundColor: '#f9f9f9',
        borderRadius: '8px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        height: '100%',
        overflowY: 'auto',
    },
    logsList: {
        listStyleType: 'none',
        padding: 0,
    },
    logItem: {
        padding: '10px',
        borderBottom: '1px solid #ddd',
        fontSize: '16px',
    }
};
