import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../contexts/socketIOContext.jsx';
import { useCommunication } from '../hooks/useCommunication.js';
import { useGameStateContext } from '../contexts/GameStateContext.jsx';


export default function HomePage() {
    const [inputCode, setInputCode] = useState('');
    const navigate = useNavigate();
    const { socket } = useSocket();
    const { joinRoom } = useCommunication();
    const { gameState } = useGameStateContext();


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
            joinRoom(inputCode);
        }
        
    };


    useEffect(() => {
        if (gameState.status === "playing") {
            navigate(`/game`);
            console.log("moved due to the effect function :!");
        }

        
    }, [gameState]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
            <h1 className="text-4xl font-black mb-8 text-emerald-400 tracking-wider">POINT POINT</h1>

            <div className="w-full max-w-sm bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl flex flex-col gap-4">
                {/* Create Room Button (Player 1) */}
                <button
                    onClick={handleCreateRoom}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 font-bold rounded-xl transition-colors">
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
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-center uppercase tracking-widest text-slate-200 focus:outline-none focus:border-emerald-500" />
                    <button
                        type="submit"
                        className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 font-bold rounded-xl transition-colors">
                        Join Room
                    </button>
                </form>
            </div>
        </div>
    );
}