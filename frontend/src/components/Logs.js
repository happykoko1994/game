import React, { useEffect, useRef } from 'react';

export default function Logs({ logs }) {
    const logsEndRef = useRef(null);

    useEffect(() => {
        // Прокручиваем вниз, как только обновляются логи
        if (logsEndRef.current) {
            logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [logs]); // Зависимость от изменения логов

    return (
        <div style={styles.logsContainer}>
            <ul style={styles.logsList}>
                {logs.map((log, index) => (
                    <li key={index} style={styles.logItem}>
                        <span dangerouslySetInnerHTML={{ __html: log }} />
                    </li>
                ))}
            </ul>
            <div ref={logsEndRef} /> {/* Сюда будет прокручиваться */}
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
