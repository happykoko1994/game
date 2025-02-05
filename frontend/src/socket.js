import { io } from 'socket.io-client';

export const socket = io('https://game-h3gc.onrender.com' , {
    reconnectionAttempts: 5, 
    reconnectionDelay: 2000
});
// export const socket = io('http://localhost:4000', {
//     reconnectionAttempts: 5, 
//     reconnectionDelay: 2000
// });
socket.on('connect', () => {
    console.log('✅ Успешное подключение:', socket.id);
});
socket.on('disconnect', (reason) => {
    console.log('⚠️ Отключение:', reason);
    
    if (reason === 'io server disconnect') {
        socket.connect(); // Пробуем вручную переподключиться
    }
});
socket.on('reconnect_attempt', (attempt) => {
    console.log(`🔄 Попытка реконнекта #${attempt}`);
});

socket.on('reconnect', (attempt) => {
    console.log(`✅ Успешное переподключение на попытке #${attempt}`);
});

socket.on('reconnect_failed', () => {
    console.log('❌ Реконнект не удался, пробуем через 2 секунды...');
    setTimeout(() => socket.connect(), 2000);
});
