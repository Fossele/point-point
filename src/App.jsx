import { useState, useRef } from 'react';
import { BookOpen, X } from 'lucide-react';

import Rules from './components/Rules.jsx';
import Main from './components/Main.jsx';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import Winning from './components/Winning.jsx';

import { usePanZoom } from './hooks/usePanZoom.js';
import { useSoundEngine } from './hooks/useSoundEngine.js';
import { useGameState } from './hooks/useGameState.js';
import { useAIPlayer } from './hooks/useAIPlayer.js';
import { launchConfetti } from './utils/launchConfettis';
import { SocketIOContextProvider } from './context/socketIOContext.js';
import { AuthContextProvider } from './context/authContext.js';

export default function App() {
  const [showRules, setShowRules] = useState(false);
  const confettiCanvasRef = useRef(null);

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




  const { audioEngine, soundMuted, toggleSound } = useSoundEngine();

  const {
    boardContainerRef,
    zoomLevel,
    panOffset,
    boardPxSize,
    resetView,
    adjustZoom,
    handleWheel,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp
  } = usePanZoom();

  const {
    gameMode, setGameMode,
    aiDifficulty, setAiDifficulty,
    currentPlayer,
    scores,
    extraTurn,
    gameOver,
    winnerInfo,
    vertices,
    squares,
    history,
    initBoard,
    processMove,
    handleUndo,
    evaluateAdjacentSquares,
    captureOrderMap
  } = useGameState(audioEngine, () => {
    setTimeout(() => launchConfetti(confettiCanvasRef.current), 100);
  });

  useAIPlayer({
    gameMode,
    currentPlayer,
    gameOver,
    aiDifficulty,
    vertices,
    squares,
    processMove,
    evaluateAdjacentSquares
  });

  return (
    <AuthContextProvider>
      <SocketIOContextProvider>
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between items-center p-2 sm:p-4 font-sans select-none overflow-hidden relative">
          <Header
            setGameMode={setGameMode}
            gameMode={gameMode}
            initBoard={initBoard}
            soundMuted={soundMuted}
            toggleSound={toggleSound}
            currentPlayer={currentPlayer}
            scores={scores}
            extraTurn={extraTurn}
            aiDifficulty={aiDifficulty}
            setShowRules={setShowRules}
          />

          <Main
            boardContainerRef={boardContainerRef}
            handleWheel={handleWheel}
            handleMouseDown={handleMouseDown}
            handleMouseMove={handleMouseMove}
            handleMouseUp={handleMouseUp}
            boardPxSize={boardPxSize}
            zoomLevel={zoomLevel}
            panOffset={panOffset}
            squares={squares}
            vertices={vertices}
            processMove={processMove}
            adjustZoom={adjustZoom}
            resetView={resetView}
            gameMode={gameMode}
            currentPlayer={currentPlayer}
            scores={scores}
            captureOrderMap={captureOrderMap}
          />

          <Footer handleUndo={handleUndo} history={history} gameMode={gameMode} currentPlayer={currentPlayer} initBoard={initBoard} />

          {gameOver && winnerInfo && (
            <Winning confettiCanvasRef={confettiCanvasRef} winnerInfo={winnerInfo} gameMode={gameMode} initBoard={initBoard} />
          )}

          {showRules && (
            <Rules setShowRules={setShowRules} X={X} BookOpen={BookOpen} />
          )}
        </div>
      </SocketIOContextProvider>
    </AuthContextProvider>
  );
}