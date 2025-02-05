import { io } from 'socket.io-client';

export const socket = io('https://game-h3gc.onrender.com' , {
    reconnectionAttempts: 5, 
    reconnectionDelay: 2000
});
// export const socket = io('http://localhost:4000', {
//     reconnectionAttempts: 5, 
//     reconnectionDelay: 2000
// });
