import { useState, useRef } from 'react';

import Rules from './Rules.jsx';
import Main from './Main.jsx';
import Header from './Header.jsx';
import Footer from './Footer.jsx';
import Winning from './Winning.jsx';

import { usePanZoom } from '../hooks/usePanZoom.js';
import { useSoundEngine } from '../hooks/useSoundEngine.js';
import { useGameState } from '../hooks/useGameState.js';
import { useAIPlayer } from '../hooks/useAIPlayer.js';
import { launchConfetti } from '../utils/launchConfettis';





export default function Game() {
    const [showRules, setShowRules] = useState(false);
    const confettiCanvasRef = useRef(null);



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
        aiDifficulty,
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
        captureOrderMap,
        processEveryMovesfromAdversary,
        moves
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
                processEveryMovesfromAdversary={processEveryMovesfromAdversary}
                moves={moves}
            />

            <Footer handleUndo={handleUndo} history={history} gameMode={gameMode} currentPlayer={currentPlayer} initBoard={initBoard} />

            {gameOver && winnerInfo && (
                <Winning confettiCanvasRef={confettiCanvasRef} winnerInfo={winnerInfo} gameMode={gameMode} initBoard={initBoard} />
            )}

            {showRules && (
                <Rules setShowRules={setShowRules} />
            )}
        </div>

    );
}
