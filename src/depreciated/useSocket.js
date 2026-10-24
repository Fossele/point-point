import { createContext, useState, useContext, useEffect } from 'react';
import { io } from 'socket.io-client';
import PropTypes from 'prop-types';


export const useSocket = () => {

    const socket = io(import.meta.env.VITE_SOCKET_HOST, {
        query: window.location.search.substring(1),
        auth: {
            token: window.localStorage.getItem('token'),
        },
    });



    socket.on('connect', async () => {
        console.log('connected to socket.io as', socket.id);
        socket.emit("chat.message", "Hello, you are connected");
        const userInfo = await socket.emitWithAck('user.info', socket.id)
        console.log('user info', userInfo)
    });

    socket.on('connect_error', (err) => {
        console.error('socket.io connect error:',
            err)
    });
}  