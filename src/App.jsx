import { useState, useEffect, useRef, useCallback } from 'react';
import { CELL_SIZE, GRID_SIZE } from './utils/constants.js'; // Adjust path as needed
import { BookOpen, X } from 'lucide-react';

import Rules from './components/Rules.jsx';

import { checkGameOver } from './utils/gameOver.js';
import { launchConfetti } from './utils/launchConfettis';
import { SoundEngine } from './utils/soundEngine.js';
import Main from './components/Main.jsx';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import Winning from './components/Winning.jsx';


const audioEngine = new SoundEngine();


export default function App() {


  const [gameMode, setGameMode] = useState('pvp'); // 'pvp' or 'ai'
  const [aiDifficulty, setAiDifficulty] = useState('smart'); // 'easy', 'medium', 'smart'
  const [currentPlayer, setCurrentPlayer] = useState(1); // 1 or 2
  const [scores, setScores] = useState({ 1: 0, 2: 0 });
  const [extraTurn, setExtraTurn] = useState(false);
  const [soundMuted, setSoundMuted] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [winnerInfo, setWinnerInfo] = useState(null);

  // Vertices matrix: 31x31 -> 0: empty, 1: P1, 2: P2
  const [vertices, setVertices] = useState([]);
  // Squares matrix: 30x30 -> 0: unclaimed, 1: P1, 2: P2, -1: blocked
  const [squares, setSquares] = useState([]);

  // Active Played Vertices lookup set for ultra-fast candidate AI search
  const [claimedCountTotal, setClaimedCountTotal] = useState(0);

  // Pan & Zoom Viewport State
  const [zoomLevel, setZoomLevel] = useState(0.85); // 0.35 to 2.5
  const [panOffset, setPanOffset] = useState({ x: 20, y: 20 });
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });

  // Move History
  const [history, setHistory] = useState([]);

  const boardContainerRef = useRef(null);
  const confettiCanvasRef = useRef(null);

  const initBoard = useCallback(() => {
    const newVerts = Array.from({ length: GRID_SIZE + 1 }, () => Array(GRID_SIZE + 1).fill(0));
    const newSq = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(0));
    setVertices(newVerts);
    setSquares(newSq);
    setScores({ 1: 0, 2: 0 });
    setCurrentPlayer(1);
    setExtraTurn(false);
    setGameOver(false);
    setWinnerInfo(null);
    setHistory([]);
    setClaimedCountTotal(0);

    // Center viewport
    if (boardContainerRef.current) {
      const rect = boardContainerRef.current.getBoundingClientRect();
      const boardTotalPx = GRID_SIZE * CELL_SIZE * 0.85;
      setPanOffset({
        x: Math.max(10, (rect.width - boardTotalPx) / 2),
        y: Math.max(10, (rect.height - boardTotalPx) / 2)
      });
    }
  }, []);

  useEffect(() => {
    initBoard();
  }, [initBoard]);

  const handleWheel = (e) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.12 : 0.88;
    setZoomLevel(prev => Math.min(Math.max(0.35, prev * zoomFactor), 2.5));
  };

  const handleMouseDown = (e) => {
    // Only pan if dragging background or using middle click / shift
    if (e.target.dataset.node || e.button === 2) return;
    setIsPanning(true);
    setStartPan({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
  };

  const handleMouseMove = (e) => {
    if (!isPanning) return;
    setPanOffset({
      x: e.clientX - startPan.x,
      y: e.clientY - startPan.y
    });
  };

  const handleMouseUp = () => setIsPanning(false);

  // Zoom preset helper
  const adjustZoom = (delta) => {
    setZoomLevel(prev => Math.min(Math.max(0.35, prev + delta), 2.5));
  };

  const resetView = () => {
    setZoomLevel(0.85);
    if (boardContainerRef.current) {
      const rect = boardContainerRef.current.getBoundingClientRect();
      const boardTotalPx = GRID_SIZE * CELL_SIZE * 0.85;
      setPanOffset({
        x: Math.max(10, (rect.width - boardTotalPx) / 2),
        y: Math.max(10, (rect.height - boardTotalPx) / 2)
      });
    }
  };

  const evaluateAdjacentSquares = (vr, vc, currentVerts, currentSquares, player) => {
    let claimedCount = 0;
    let blockedCount = 0;

    const updatedSquares = currentSquares.map(row => [...row]);

    const candidates = [
      { r: vr - 1, c: vc - 1 },
      { r: vr - 1, c: vc },
      { r: vr, c: vc - 1 },
      { r: vr, c: vc }
    ];

    candidates.forEach(({ r, c }) => {
      if (r >= 0 && r < GRID_SIZE && c >= 0 && c < GRID_SIZE) {
        if (updatedSquares[r][c] === 0) {
          const c1 = currentVerts[r][c];
          const c2 = currentVerts[r][c + 1];
          const c3 = currentVerts[r + 1][c];
          const c4 = currentVerts[r + 1][c + 1];

          if (c1 !== 0 && c2 !== 0 && c3 !== 0 && c4 !== 0) {
            if (c1 === c2 && c2 === c3 && c3 === c4) {
              updatedSquares[r][c] = player;
              claimedCount++;
            } else {
              updatedSquares[r][c] = -1; // Blocked / Neutral
              blockedCount++;
            }
          }
        }
      }
    });

    return { updatedSquares, claimedCount, blockedCount };
  };



  const processMove = useCallback((r, c) => {
    if (gameOver || vertices[r][c] !== 0) return;

    // Record Undo Snapshot
    setHistory(prev => [
      ...prev,
      {
        vertices: vertices.map(row => [...row]),
        squares: squares.map(row => [...row]),
        currentPlayer,
        scores: { ...scores },
        extraTurn,
        claimedCountTotal
      }
    ]);

    const nextVerts = vertices.map(row => [...row]);
    nextVerts[r][c] = currentPlayer;

    const { updatedSquares, claimedCount, blockedCount } = evaluateAdjacentSquares(
      r,
      c,
      nextVerts,
      squares,
      currentPlayer
    );

    // Play Sound FX
    if (claimedCount > 0) {
      audioEngine.play('claim', currentPlayer === 1);
    } else if (blockedCount > 0) {
      audioEngine.play('block', currentPlayer === 1);
    } else {
      audioEngine.play('tap', currentPlayer === 1);
    }

    const newScores = {
      ...scores,
      [currentPlayer]: scores[currentPlayer] + claimedCount
    };

    const newTotalFilled = claimedCountTotal + 1;

    setVertices(nextVerts);
    setSquares(updatedSquares);
    setScores(newScores);
    setClaimedCountTotal(newTotalFilled);

    // Check Win Condition
    if (checkGameOver(newTotalFilled)) {
      setGameOver(true);
      setExtraTurn(false);
      audioEngine.play('win');

      let winner = 0;
      if (newScores[1] > newScores[2]) winner = 1;
      else if (newScores[2] > newScores[1]) winner = 2;

      setWinnerInfo({ winner, finalP1: newScores[1], finalP2: newScores[2] });
      setTimeout(() => launchConfetti(confettiCanvasRef.current), 100);
      return;
    }

    // Extra Turn Progression
    if (claimedCount > 0) {
      setExtraTurn(true);
    } else {
      setExtraTurn(false);
      setCurrentPlayer(prev => (prev === 1 ? 2 : 1));
    }
  }, [vertices, squares, currentPlayer, scores, gameOver, extraTurn, claimedCountTotal]);

  useEffect(() => {
    if (gameMode === 'ai' && currentPlayer === 2 && !gameOver) {
      const timer = setTimeout(() => {
        // Collect candidate empty nodes touching already occupied vertices to keep search extremely fast
        const candidateMap = new Set();
        const emptyNodes = [];

        for (let r = 0; r <= GRID_SIZE; r++) {
          for (let c = 0; c <= GRID_SIZE; c++) {
            if (vertices[r][c] === 0) {
              emptyNodes.push({ r, c });

              // Check if near active action
              let nearActive = false;
              for (let dr = -1; dr <= 1; dr++) {
                for (let dc = -1; dc <= 1; dc++) {
                  const nr = r + dr, nc = c + dc;
                  if (nr >= 0 && nr <= GRID_SIZE && nc >= 0 && nc <= GRID_SIZE) {
                    if (vertices[nr][nc] !== 0) {
                      nearActive = true;
                      break;
                    }
                  }
                }
                if (nearActive) break;
              }
              if (nearActive) candidateMap.add(`${r},${c}`);
            }
          }
        }

        if (emptyNodes.length === 0) return;

        let selectedMove = null;

        if (aiDifficulty === 'easy' || candidateMap.size === 0) {
          selectedMove = emptyNodes[Math.floor(Math.random() * emptyNodes.length)];
        } else {
          // Tactical search among active candidates
          const candidatesList = Array.from(candidateMap).map(str => {
            const [r, c] = str.split(',').map(Number);
            return { r, c };
          });

          let boxCompletingMove = null;
          let safeMove = null;

          for (const move of candidatesList) {
            const testVerts = vertices.map(row => [...row]);
            testVerts[move.r][move.c] = 2;

            const { claimedCount, blockedCount } = evaluateAdjacentSquares(
              move.r,
              move.c,
              testVerts,
              squares,
              2
            );

            if (claimedCount > 0) {
              boxCompletingMove = move;
              break; // Highest priority: Claim Box!
            }

            if (aiDifficulty === 'smart' && blockedCount === 0) {
              safeMove = move;
            }
          }

          if (boxCompletingMove) {
            selectedMove = boxCompletingMove;
          } else if (aiDifficulty === 'smart' && safeMove) {
            selectedMove = safeMove;
          } else {
            selectedMove = candidatesList[Math.floor(Math.random() * candidatesList.length)];
          }
        }

        if (selectedMove) {
          processMove(selectedMove.r, selectedMove.c);
        }
      }, 350);

      return () => clearTimeout(timer);
    }
  }, [currentPlayer, gameMode, gameOver, vertices, squares, aiDifficulty, processMove]);

  const handleUndo = () => {
    if (history.length === 0) return;
    const last = history[history.length - 1];
    setVertices(last.vertices);
    setSquares(last.squares);
    setCurrentPlayer(last.currentPlayer);
    setScores(last.scores);
    setExtraTurn(last.extraTurn);
    setClaimedCountTotal(last.claimedCountTotal);
    setGameOver(false);
    setWinnerInfo(null);
    setHistory(prev => prev.slice(0, prev.length - 1));
  };

  const toggleSound = () => {
    audioEngine.muted = !soundMuted;
    setSoundMuted(!soundMuted);
    console.log(`Sound ${!soundMuted ? 'muted' : 'unmuted'}`);
  };

  // Compute rendered board pixel size
  const boardPxSize = GRID_SIZE * CELL_SIZE;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between items-center p-2 sm:p-4 font-sans select-none overflow-hidden relative">

      {/* Header moduleBar */}
    
      <Header setGameMode={setGameMode} gameMode={gameMode} initBoard={initBoard} soundMuted={soundMuted} toggleSound={toggleSound} currentPlayer={currentPlayer} scores={scores} extraTurn={extraTurn} aiDifficulty={aiDifficulty} setShowRules={setShowRules} />


      {/* Main Interactive Zoomable Canvas Board Viewport */}
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
      />

      {/* Footer Controls */}
      <Footer handleUndo={handleUndo} history={history} gameMode={gameMode} currentPlayer={currentPlayer} initBoard={initBoard} />

      {/* Game Over Modal */}
      {gameOver && winnerInfo && (
        <Winning confettiCanvasRef={confettiCanvasRef} winnerInfo={winnerInfo} gameMode={gameMode} initBoard={initBoard} />
      )}

      {/* Rules Modal */}
      {showRules && (
        <Rules setShowRules={setShowRules} X={X} BookOpen={BookOpen} />
      )}

    </div>
  );
}