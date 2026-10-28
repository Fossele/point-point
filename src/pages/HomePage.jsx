import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../contexts/socketIOContext.jsx';
import { useGameStateContext } from '../contexts/GameStateContext.jsx';
import { Grid2X2, ArrowRight, Plus } from 'lucide-react';


export default function HomePage() {
    const [inputCode, setInputCode] = useState('');
    const navigate = useNavigate();
    const { socket } = useSocket();
    // const { joinRoom } = useCommunication();
    const { gameState, setGameState } = useGameStateContext();

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
                        roomCode,
                        extraTurn: prev.extraTurn // Preserve the extraTurn state
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


    const handleCreateRoom = () => {
        // Tell backend to create a room, then navigate to the returned room code
        try {
            if (!socket) {
                alert('Socket connection not established. Please try again later.');
                return;
            }


            socket.emit('create-room', (response) => {
                if (response.roomCode) {

                    navigate(`/room/${response.roomCode}`);

                }
            });

        } catch (error) {
            console.error('Error creating room:', error);
        }

    };

    const handleJoinRoom = (e) => {
        e.preventDefault();
        console.log("trying to join");
        let roomCode = inputCode.trim().toUpperCase();
        if (roomCode) {
            joinRoom(roomCode);
        }

    };


    useEffect(() => {
        if (gameState.status === "playing") {
            navigate(`/game`);
            console.log("moved due to the effect function :!");
        }


    }, [gameState]);

    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-4">
            <div className="mb-8 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-400/30 bg-emerald-400/10 text-emerald-400 shadow-[0_0_30px_rgba(52,211,153,0.18)]">
                    <Grid2X2 className="h-7 w-7" />
                </div>
                <h1 className="text-4xl font-black tracking-[0.2em] text-emerald-400 drop-shadow-[0_0_18px_rgba(52,211,153,0.45)]">POINT POINT</h1>
                <p className="mt-2 text-sm font-medium text-slate-400">Fast, real-time Dots &amp; Boxes</p>
            </div>

            <div className="flex w-full max-w-sm flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl shadow-slate-950/60">
                {/* Create Room Button (Player 1) */}
                <button
                    onClick={handleCreateRoom}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-500 py-3 font-bold text-white transition hover:scale-[1.02] hover:bg-indigo-400 active:scale-[0.99]">
                    <Plus className="h-4 w-4" />
                    Create Private Room
                </button>

                <div className="flex items-center my-2">
                    <div className="flex-grow border-t border-slate-800"></div>
                    <span className="px-3 text-xs text-slate-500 uppercase">or join game</span>
                    <div className="flex-grow border-t border-slate-800"></div>
                </div>

                {/* Join via Code Form (Player 2) */}
                <form onSubmit={handleJoinRoom} className="flex flex-col gap-3">
                    <input
                        type="text"
                        placeholder="Enter Room Code (e.g. XYZ-123)"
                        value={inputCode}
                        onChange={(e) => setInputCode(e.target.value)}
                        maxLength={7}
                        className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-center font-mono uppercase tracking-[0.25em] text-slate-200 placeholder:tracking-normal placeholder:text-slate-600 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50" />
                    <button
                        type="submit"
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-800 py-3 font-bold text-slate-100 transition hover:bg-slate-700 active:scale-[0.99]">
                        Join Room
                        <ArrowRight className="h-4 w-4 text-emerald-400" />
                    </button>
                </form>
            </div>
            </main>
       
    );
}