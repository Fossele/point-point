import { useContext, createContext, useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { io } from 'socket.io-client'
import { useAuth } from './authContext.jsx'



export const SocketIOContext = createContext({
    socket: null,
    status: 'waiting',
    error: null,
})

export const SocketIOContextProvider = ({ children }) => {

    const [status, setStatus] = useState('waiting');
    const [error, setError] = useState(null);
    const [token] = useAuth();

    const socketRef = useRef(null);

    useEffect(() => {
        if (token) {
            const socket = io("http://localhost:4000", {
                query: window.location.search.substring(1),
                auth: { token },
            })

            socketRef.current = socket;

            socket.on('connect', () => {
                setStatus('connected')
                console.log('Connected to server via Socket.IO');
                setError(null)
            })
            socket.on('connect_error', (err) => {
                setStatus('error')
                setError(err)
            })
            socket.on('disconnect', () => {
                setStatus('disconnected');
                socketRef.current = null;
            });


            return () => {
                socket.disconnect();
                socketRef.current = null;
            };

        }
    }, [token, setStatus, setError]);

    return (
        <SocketIOContext.Provider value={{ socket: socketRef.current, status, error }}>
            {children}
        </SocketIOContext.Provider>
    )
}

SocketIOContextProvider.propTypes = {
    children: PropTypes.element.isRequired,
}

export function useSocket() {
    return useContext(SocketIOContext);
}