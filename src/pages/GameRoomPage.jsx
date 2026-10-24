import { useParams, useNavigate } from 'react-router-dom';

import { useSocket } from '../contexts/socketIOContext.jsx';
import RoomLobby from '../components/RoomLobby'; // The component with copy link & waiting status
import Game from '../components/Game.jsx';
import { useCommunication } from '../hooks/useCommunication.js';
import { useEffect } from 'react';
import { useGameStateContext } from '../contexts/GameStateContext.jsx';
import { Socket } from 'socket.io-client';

export default function GameRoomPage() {
    const { roomCode } = useParams();
    const navigate = useNavigate();
    const { socket } = useSocket();

    const { gameState, setGameState } = useGameStateContext();


    /*  useEffect(() => {
          if (!socket) return;
  
          // 1. Join room on mount
  
          // 2. Listen for room updates (e.g., someone joined)
          socket.on('room_update', ({ players }) => {
              setGameState((prev) => ({ ...prev, players }));
          });
  
          // 3. Listen for game start trigger from backend
      
          // 4. Handle errors (invalid code, room full)
          socket.on('room_error', ({ message }) => {
              alert(message);
              navigate('/');
          });
  
          return () => {
              socket.off('room_update');
            
              socket.off('room_error');
          };
      }, [roomCode, navigate, socket, setGameState]);
  
      */
    // Render View A: Waiting in Lobby

    useEffect(() => {
        if (gameState.status === "playing") {
            navigate(`/game`);
            console.log("moved due to the effect function :!nnn");
        }

        socket.on("game-start", ({ currentTurn, players, roomCode }) => {
            if (!socket) return;

            const myPlayer = players.find((p) => p.id === socket.id);
            setGameState(prev => {

                const nextState = {
                    ...prev,
                    status: 'playing',
                    players,
                    currentTurn,
                    role: myPlayer ? myPlayer.role : 'spectator',
                    roomCode: roomCode
                }

                console.log("Game state applied instantly, new state:", nextState, "game starts in a moment.");
                navigate(`/game`);
                return nextState;
            })



        })
    }, [gameState, socket]);


    return (
        <div className="flex items-center justify-center min-h-screen p-4">
            <RoomLobby roomCode={roomCode} players={gameState.players} />
        </div>
    );
}



// Render View B: Active Game Board (Once game-start fires)
/*  return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
          <h1 className="text-xl font-bold mb-4 text-emerald-400">Match in Progress!</h1>
          <p className="text-slate-400 mb-6">You are playing as: <span className="text-white uppercase font-bold">{gameState.role}</span></p>

          <Game />
      </div>
  );
 
}*/