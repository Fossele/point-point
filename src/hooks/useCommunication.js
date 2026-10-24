import { useCallback, useEffect, useState } from "react";
import { useSocket } from "../contexts/socketIOContext.jsx";
import { useNavigate } from "react-router-dom";
import { useGameStateContext } from "../contexts/GameStateContext.jsx";

export function useCommunication() {

    const { socket } = useSocket();
    const [messages, setMessages] = useState([]);
    const [moves, setMoves] = useState([]);

    const { gameState, setGameState } = useGameStateContext();
    const navigate = useNavigate();


    //  const events = {};

    const receiveMessage = useCallback((message) => {
        console.log("message received: ", message);
        setMessages((messages) => [...messages, message]);
    }, []);


    const receiveMove = useCallback(({ r, c, player, currentTurn, scores }) => {
        console.log("move received: ", { r, c, player, currentTurn, scores });
        setMoves((moves) => [...moves, { r, c, player, currentTurn, scores }]);
    }, []);

    const receiveGameState = useCallback(({ currentTurn, players, roomCode }) => {
        //current turn should be the player who is about to make a move, not the one who just made a move
        if (!socket) return;

        const myPlayer = players.find((p) => p.id === socket.id);
        setGameState(prev => {

            const nextState = {
                ...prev,
                status: 'playing',
                players,
                currentTurn,
                role: myPlayer ? myPlayer.role : 'spectator',
                roomCode
            }

            console.log("Game state applied instantly, new state:", nextState, "game starts in a moment.");

            return nextState;
        });


    }, [socket]);


    const receiveGameStateUpdates = useCallback(({ currentTurn, players }) => {
        //current turn should be the player who is about to make a move, not the one who just made a move

        const myPlayer = players.find((p) => p.id === socket.id);
        setGameState({
            status: 'playing',
            players,
            currentTurn,
            role: myPlayer ? myPlayer.role : 'spectator',
        });

        console.log('Game state updated:', { currentTurn });
    });



    const sendMessage = useCallback((event, message) => {
        if (!socket) {
            console.warn("Socket is not connected yet. Cannot send message.");
            return;
        }
        console.log("message sent");
        socket.emit(event, message);
    }, [socket]);


    const sendMove = useCallback(({ r, c, player }) => {
        if (!socket) {
            console.warn("Socket is not connected yet. Cannot send message.");
            return;
        }

        console.log("move sent by player:", player);
        socket.emit("make-move", { r, c, player });
    }, [socket]);




    const joinRoom = useCallback((roomCode) => {
        if (!socket) return;

        console.log(`Attempting to join room: ${roomCode}`);

        // Pass a callback function as the final argument to socket.emit
        socket.emit('join-room', roomCode, (response) => {

            if (response && response.success) {
                console.log(response);

                const { currentTurn, players, roomCode } = response.payload;



                const myPlayer = players.find((p) => p.id === socket.id);
                setGameState(prev => {

                    const nextState = {
                        ...prev,
                        status: 'playing',
                        players,
                        currentTurn,
                        role: myPlayer ? myPlayer.role : 'spectator',
                        roomCode
                    }



                    console.log("Game state applied instantly, new state:", nextState);

                    return nextState;
                });

                // Only navigate if the server confirmed the room exists
                console.log(`Successfully joined room: ${response.payload.roomCode}`);

            } else {

                console.warn("Could not join room:", response?.error);

                // If no error handler is provided, we can still log the error
                console.error("Join room error:", response?.error);
            }
        });
    }, [socket]);



    const createRoom = useCallback(() => {
        if (!socket) {
            console.warn("Socket is not connected yet. Cannot send message.");
            return;
        }

        socket.emit('create-room', (response) => {
            if (response.roomCode) {
                navigate(`/room/${response.roomCode}`);
            }
        });

    }, [socket, navigate])


    useEffect(() => {
        if (!socket) {
            console.warn("Socket is not connected yet. Cannot send message. 6");
            return;
        }

        socket.on("state-update", receiveMessage);

        socket.on('move-applied', receiveMove);

        socket.on('game-start', receiveGameState);

        /* socket.on('game-start', (payload) => {
             console.log("CLIENT RECEIVED GAME-START:", payload);
             console.log("My current socket ID is:", socket.id);
             console.log("Did I find myself in players array?", payload.players.find(p => p.id === socket.id));
            
         });*/

        return () => {
            socket.off("state-update", receiveMessage);
            socket.off('move-applied', receiveMove);
            socket.off('game-start', receiveGameState);
        } // clean up function
    }, [socket, receiveMessage, receiveMove, receiveGameState]);


    return { socket, messages, sendMessage, gameState, joinRoom, createRoom, sendMove, moves };

}


//handles communication with the backend, including sending and receiving messages, moves, and game state updates. It also manages the socket connection and provides functions to join or create a room.