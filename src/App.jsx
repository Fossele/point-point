import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { 
  Trophy, 
  RotateCcw, 
  Undo2, 
  HelpCircle, 
  Volume2, 
  VolumeX, 
  Bot, 
  User, 
  Grid, 
  Lock, 
  X, 
  BookOpen, 
  Sparkles,
  Zap,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Compass,
  Move
} from 'lucide-react';

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  play(type, isP1 = true) {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);

      if (type === 'tap') {
        osc.type = 'sine';
        const baseFreq = isP1 ? 520 : 680;
        osc.frequency.setValueAtTime(baseFreq, now);
        osc.frequency.exponentialRampToValueAtTime(baseFreq / 2, now + 0.08);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
        osc.start(now);
        osc.stop(now + 0.08);
      } else if (type === 'claim') {
        const freqs = isP1 ? [440, 554.37, 659.25, 880] : [523.25, 659.25, 783.99, 1046.50];
        freqs.forEach((freq, idx) => {
          const subOsc = this.ctx.createOscillator();
          const subGain = this.ctx.createGain();
          subOsc.type = 'triangle';
          subOsc.frequency.value = freq;
          subOsc.connect(subGain);
          subGain.connect(this.ctx.destination);

          const startTime = now + (idx * 0.05);
          subGain.gain.setValueAtTime(0.2, startTime);
          subGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.22);
          subOsc.start(startTime);
          subOsc.stop(startTime + 0.22);
        });
      } else if (type === 'block') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(130, now);
        osc.frequency.linearRampToValueAtTime(50, now + 0.12);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
        osc.start(now);
        osc.stop(now + 0.12);
      } else if (type === 'win') {
        const fanFreqs = [523.25, 659.25, 783.99, 1046.50, 1318.51];
        fanFreqs.forEach((freq, idx) => {
          const subOsc = this.ctx.createOscillator();
          const subGain = this.ctx.createGain();
          subOsc.type = 'sine';
          subOsc.frequency.value = freq;
          subOsc.connect(subGain);
          subGain.connect(this.ctx.destination);

          const startTime = now + (idx * 0.08);
          const dur = idx === fanFreqs.length - 1 ? 0.6 : 0.2;
          subGain.gain.setValueAtTime(0.25, startTime);
          subGain.gain.exponentialRampToValueAtTime(0.001, startTime + dur);
          subOsc.start(startTime);
          subOsc.stop(startTime + dur);
        });
      }
    } catch (e) {
      console.warn("Audio Context error", e);
    }
  }
}

const audioEngine = new SoundEngine();

function launchConfetti(canvas) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const particles = [];
  const colors = ['#00f0ff', '#ff007f', '#38bdf8', '#f472b6', '#fbbf24', '#ffffff'];

  for (let i = 0; i < 160; i++) {
    particles.push({
      x: canvas.width / 2,
      y: canvas.height / 2,
      vx: (Math.random() - 0.5) * 22,
      vy: (Math.random() - 0.7) * 22,
      size: Math.random() * 8 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      life: 1,
      decay: Math.random() * 0.015 + 0.008
    });
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let alive = false;

    particles.forEach(p => {
      if (p.life > 0) {
        alive = true;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.25;
        p.life -= p.decay;

        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    if (alive) {
      requestAnimationFrame(animate);
    }
  }

  animate();
}

export default function App() {
  const GRID_SIZE = 30; // 30x30 squares = 31x31 vertices = 961 nodes
  const CELL_SIZE = 36; // Base size of each cell in viewport pixels at scale 1.0

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
  }, [GRID_SIZE, CELL_SIZE]);

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

  const checkGameOver = (totalFilled) => {
    return totalFilled >= (GRID_SIZE + 1) * (GRID_SIZE + 1);
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
  };

  // Compute rendered board pixel size
  const boardPxSize = GRID_SIZE * CELL_SIZE;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between items-center p-2 sm:p-4 font-sans select-none overflow-hidden relative">
      
      {/* Header Bar */}
      <header className="w-full max-w-5xl flex flex-col items-center gap-2 z-20">
        <div className="w-full flex justify-between items-center bg-slate-900/90 p-2.5 sm:p-3 rounded-2xl border border-slate-800 backdrop-blur shadow-xl">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-gradient-to-br from-cyan-500 to-pink-500 rounded-xl shadow-lg">
              <Grid className="w-5 h-5 text-slate-950 font-bold" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-mono text-lg sm:text-xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-500">
                  POINT POINT
                </h1>
                <span className="px-2 py-0.5 bg-cyan-950 text-cyan-400 border border-cyan-800/80 rounded-md font-mono text-[10px] font-bold">
                  30x30 MEGA
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium hidden sm:block">Tactical Viewport Engine • 961 Vertices</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Game Mode Selector */}
            <div className="flex items-center bg-slate-950/80 rounded-xl p-1 border border-slate-800">
              <button 
                onClick={() => { setGameMode('pvp'); initBoard(); }}
                className={`p-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${gameMode === 'pvp' ? 'bg-cyan-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'}`}
                title="Pass & Play Mode"
              >
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">2P</span>
              </button>
              <button 
                onClick={() => { setGameMode('ai'); initBoard(); }}
                className={`p-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${gameMode === 'ai' ? 'bg-pink-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'}`}
                title="Vs AI Mode"
              >
                <Bot className="w-4 h-4" />
                <span className="hidden sm:inline">AI</span>
              </button>
            </div>

            {/* Mute Button */}
            <button 
              onClick={toggleSound} 
              className="p-2 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 rounded-xl border border-slate-700 transition"
              title="Toggle Sound Effects"
            >
              {soundMuted ? <VolumeX className="w-4 h-4 text-pink-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
            </button>

            {/* Help Button */}
            <button 
              onClick={() => setShowRules(true)} 
              className="p-2 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 rounded-xl border border-slate-700 transition"
              title="Game Rules"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Score & Active Turn Bar */}
        <div className="w-full grid grid-cols-2 sm:grid-cols-3 gap-2">
          {/* P1 Score */}
          <div className={`bg-slate-900/90 rounded-xl p-2 sm:p-2.5 border-2 transition-all flex items-center justify-between ${currentPlayer === 1 ? 'border-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.2)]' : 'border-slate-800 opacity-70'}`}>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#00f0ff]"></span>
              <div>
                <div className="font-mono text-xs font-bold text-cyan-400">PLAYER 1</div>
                <div className="text-[10px] text-slate-400 hidden sm:block">Cyan Neon</div>
              </div>
            </div>
            <div className="font-mono text-2xl font-black text-cyan-400">{scores[1]}</div>
          </div>

          {/* P2 Score */}
          <div className={`bg-slate-900/90 rounded-xl p-2 sm:p-2.5 border-2 transition-all flex items-center justify-between ${currentPlayer === 2 ? 'border-pink-500 shadow-[0_0_15px_rgba(255,0,127,0.2)]' : 'border-slate-800 opacity-70'}`}>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-pink-500 shadow-[0_0_8px_#ff007f]"></span>
              <div>
                <div className="font-mono text-xs font-bold text-pink-500">
                  {gameMode === 'ai' ? 'CYBER AI' : 'PLAYER 2'}
                </div>
                <div className="text-[10px] text-slate-400 hidden sm:block">
                  {gameMode === 'ai' ? `Lvl: ${aiDifficulty.toUpperCase()}` : 'Pink Neon'}
                </div>
              </div>
            </div>
            <div className="font-mono text-2xl font-black text-pink-500">{scores[2]}</div>
          </div>

          {/* Active Turn Banner */}
          <div className="col-span-2 sm:col-span-1 bg-slate-950/90 px-3 py-2 rounded-xl border border-slate-800 flex items-center justify-between">
            <div className={`font-mono text-xs font-bold flex items-center gap-1.5 ${currentPlayer === 1 ? 'text-cyan-400' : 'text-pink-500'}`}>
              <Sparkles className="w-3.5 h-3.5 animate-spin" />
              <span>
                {currentPlayer === 1 ? "P1 TURN" : (gameMode === 'ai' ? "AI THINKING" : "P2 TURN")}
              </span>
            </div>

            {extraTurn && (
              <div className="animate-pulse bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-mono text-[9px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 uppercase">
                <Zap className="w-3 h-3 fill-slate-950" />
                <span>+1 Turn</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Interactive Zoomable Canvas Board Viewport */}
      <main 
        ref={boardContainerRef}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="relative w-full max-w-5xl h-[58vh] sm:h-[64vh] my-2 bg-slate-950 border border-slate-800/80 rounded-3xl overflow-hidden cursor-grab active:cursor-grabbing shadow-2xl flex items-center justify-center"
      >
        {/* Floating Zoom & Pan Controls Bar */}
        <div className="absolute top-3 left-3 z-30 flex items-center gap-1 bg-slate-900/90 backdrop-blur border border-slate-800 p-1.5 rounded-2xl shadow-xl">
          <button 
            onClick={() => adjustZoom(0.15)} 
            className="p-1.5 hover:bg-slate-800 rounded-xl text-slate-300 transition active:scale-95" 
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button 
            onClick={() => adjustZoom(-0.15)} 
            className="p-1.5 hover:bg-slate-800 rounded-xl text-slate-300 transition active:scale-95" 
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button 
            onClick={resetView} 
            className="p-1.5 hover:bg-slate-800 rounded-xl text-slate-300 transition active:scale-95" 
            title="Reset View"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
          <span className="text-[10px] font-mono text-slate-400 px-2 border-l border-slate-800 font-bold">
            {Math.round(zoomLevel * 100)}%
          </span>
        </div>

        {/* Floating Interactive 30x30 Minimap */}
        <div className="absolute top-3 right-3 z-30 bg-slate-900/90 backdrop-blur border border-slate-800 p-2 rounded-2xl shadow-xl flex flex-col items-center">
          <div className="flex items-center justify-between w-full mb-1">
            <div className="flex items-center gap-1 text-[9px] font-mono font-bold text-slate-400">
              <Compass className="w-3 h-3 text-cyan-400" />
              <span>RADAR</span>
            </div>
            <span className="text-[9px] font-mono text-slate-500">30x30</span>
          </div>
          <div className="relative w-20 h-20 bg-slate-950 border border-slate-800 rounded-lg overflow-hidden">
            {/* Render Mini Grid Canvas preview */}
            <div className="absolute inset-0 grid grid-cols-30 grid-rows-30 opacity-40">
              {squares.map((rowArr, r) =>
                rowArr.map((st, c) => (
                  <div
                    key={`m-${r}-${c}`}
                    className={
                      st === 1 ? 'bg-cyan-400' :
                      st === 2 ? 'bg-pink-500' :
                      st === -1 ? 'bg-slate-700' : 'bg-transparent'
                    }
                  />
                ))
              )}
            </div>
            {/* Viewport Box overlay */}
            <div 
              className="absolute border border-amber-400 bg-amber-400/10 pointer-events-none rounded-xs"
              style={{
                left: `${Math.max(0, Math.min(70, (-panOffset.x / (boardPxSize * zoomLevel)) * 80))}%`,
                top: `${Math.max(0, Math.min(70, (-panOffset.y / (boardPxSize * zoomLevel)) * 80))}%`,
                width: '40%',
                height: '40%'
              }}
            />
          </div>
        </div>

        {/* Viewport Transform Area */}
        <div 
          className="absolute transition-transform duration-75 origin-top-left"
          style={{
            transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
            width: `${boardPxSize}px`,
            height: `${boardPxSize}px`
          }}
        >
          {/* SVG Vector Layer for Grid & Filled Squares */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {/* Cell Fill Colors */}
            {squares.map((rowArr, r) =>
              rowArr.map((sqState, c) => {
                if (sqState === 0) return null;
                return (
                  <rect
                    key={`rect-${r}-${c}`}
                    x={c * CELL_SIZE}
                    y={r * CELL_SIZE}
                    width={CELL_SIZE}
                    height={CELL_SIZE}
                    fill={
                      sqState === 1 ? 'rgba(6, 182, 212, 0.25)' :
                      sqState === 2 ? 'rgba(236, 72, 153, 0.25)' :
                      '#1e293b'
                    }
                    stroke={
                      sqState === 1 ? 'rgba(6, 182, 212, 0.6)' :
                      sqState === 2 ? 'rgba(236, 72, 153, 0.6)' :
                      '#334155'
                    }
                    strokeWidth="1"
                  />
                );
              })
            )}

            {/* Dash Grid Lines */}
            {Array.from({ length: GRID_SIZE + 1 }).map((_, idx) => (
              <React.Fragment key={`grid-${idx}`}>
                <line
                  x1={idx * CELL_SIZE}
                  y1={0}
                  x2={idx * CELL_SIZE}
                  y2={boardPxSize}
                  stroke="#334155"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                />
                <line
                  x1={0}
                  y1={idx * CELL_SIZE}
                  x2={boardPxSize}
                  y2={idx * CELL_SIZE}
                  stroke="#334155"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                />
              </React.Fragment>
            ))}
          </svg>

          {/* Interactive Vertex Node Network */}
          {vertices.map((rowArr, vr) =>
            rowArr.map((owner, vc) => (
              <button
                key={`v-${vr}-${vc}`}
                data-node="true"
                onClick={() => processMove(vr, vc)}
                disabled={owner !== 0 || (gameMode === 'ai' && currentPlayer === 2)}
                className={`absolute rounded-full transform -translate-x-1/2 -translate-y-1/2 transition-all duration-150 focus:outline-none ${
                  owner === 0
                    ? 'bg-slate-800 border border-slate-600 hover:scale-150 hover:bg-white hover:border-white hover:shadow-[0_0_12px_#ffffff] cursor-pointer'
                    : owner === 1
                    ? 'bg-cyan-400 border-2 border-white shadow-[0_0_12px_#00f0ff] scale-110 z-10'
                    : 'bg-pink-500 border-2 border-white shadow-[0_0_12px_#ff007f] scale-110 z-10'
                }`}
                style={{
                  left: `${vc * CELL_SIZE}px`,
                  top: `${vr * CELL_SIZE}px`,
                  width: `${Math.max(8, CELL_SIZE * 0.35)}px`,
                  height: `${Math.max(8, CELL_SIZE * 0.35)}px`
                }}
              />
            ))
          )}
        </div>
      </main>

      {/* Footer Controls */}
      <footer className="w-full max-w-5xl flex justify-between items-center gap-3 z-20">
        <button
          onClick={handleUndo}
          disabled={history.length === 0 || (gameMode === 'ai' && currentPlayer === 2)}
          className="flex-1 py-3 px-4 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 text-slate-300 font-mono text-xs font-semibold rounded-2xl border border-slate-800 flex items-center justify-center gap-2 transition shadow-lg"
        >
          <Undo2 className="w-4 h-4" />
          <span>UNDO MOVE</span>
        </button>

        <button
          onClick={() => initBoard()}
          className="flex-1 py-3 px-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 active:scale-95 text-white font-mono text-xs font-bold rounded-2xl border border-cyan-400/30 flex items-center justify-center gap-2 transition shadow-lg shadow-cyan-950/40"
        >
          <RotateCcw className="w-4 h-4" />
          <span>RESTART BOARD</span>
        </button>
      </footer>

      {/* Game Over Modal */}
      {gameOver && winnerInfo && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <canvas ref={confettiCanvasRef} className="absolute inset-0 pointer-events-none z-10" />
          <div className="bg-slate-900 border-2 border-slate-700 rounded-3xl p-6 sm:p-8 max-w-md w-full text-center shadow-2xl relative z-20">
            <div className={`w-20 h-20 mx-auto rounded-3xl flex items-center justify-center mb-4 shadow-xl ${
              winnerInfo.winner === 1 ? 'bg-cyan-400 shadow-[0_0_25px_#00f0ff]' :
              winnerInfo.winner === 2 ? 'bg-pink-500 shadow-[0_0_25px_#ff007f]' :
              'bg-amber-400 shadow-[0_0_25px_#fbbf24]'
            }`}>
              <Trophy className="w-10 h-10 text-slate-950" />
            </div>

            <h2 className={`font-mono text-2xl sm:text-3xl font-black mb-2 tracking-wider ${
              winnerInfo.winner === 1 ? 'text-cyan-400 drop-shadow-[0_0_10px_#00f0ff]' :
              winnerInfo.winner === 2 ? 'text-pink-500 drop-shadow-[0_0_10px_#ff007f]' :
              'text-amber-400'
            }`}>
              {winnerInfo.winner === 1 ? 'PLAYER 1 WINS!' :
               winnerInfo.winner === 2 ? (gameMode === 'ai' ? 'CYBER AI WINS!' : 'PLAYER 2 WINS!') :
               "IT'S A DRAW!"}
            </h2>

            <p className="text-xs sm:text-sm text-slate-400 mb-6 font-semibold">
              Mastered the 30x30 mega grid node capture!
            </p>

            <div className="bg-slate-950/80 rounded-2xl p-4 mb-6 border border-slate-800 grid grid-cols-2 gap-4">
              <div className="text-center border-r border-slate-800 pr-2">
                <div className="text-xs text-cyan-400 font-mono font-bold">P1 SCORE</div>
                <div className="font-mono text-3xl font-black text-cyan-400">{winnerInfo.finalP1}</div>
              </div>
              <div className="text-center pl-2">
                <div className="text-xs text-pink-500 font-mono font-bold">
                  {gameMode === 'ai' ? 'AI SCORE' : 'P2 SCORE'}
                </div>
                <div className="font-mono text-3xl font-black text-pink-500">{winnerInfo.finalP2}</div>
              </div>
            </div>

            <button
              onClick={() => initBoard()}
              className="w-full py-4 bg-gradient-to-r from-cyan-500 via-indigo-500 to-pink-500 hover:opacity-95 active:scale-95 text-slate-950 font-mono font-black text-base rounded-2xl shadow-xl transition tracking-wider"
            >
              PLAY AGAIN
            </button>
          </div>
        </div>
      )}

      {/* Rules Modal */}
      {showRules && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl text-left relative">
            <button 
              onClick={() => setShowRules(false)} 
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-2"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-cyan-500/20 text-cyan-400 rounded-xl">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="font-mono text-xl font-bold text-white">Point Point Rules (30x30)</h3>
            </div>

            <div className="space-y-3 text-sm text-slate-300 font-medium overflow-y-auto max-h-[60vh] pr-1">
              <p><strong>1. Viewport Navigation:</strong> Drag or swipe to pan around the 30x30 grid. Scroll mouse-wheel or use zoom buttons to scale the view.</p>
              <p><strong>2. Node Turns:</strong> Alternate placing node points on empty grid intersections.</p>
              <p><strong>3. Pure Box Ownership:</strong> When all 4 corners of a square match <span className="text-cyan-400 font-bold">ONLY your color</span>, you claim it for <strong>+1 Point</strong>!</p>
              <p><strong>4. Neutral Block:</strong> If all 4 corners are filled with a <span className="text-amber-400 font-bold">MIX of both players' colors</span>, the square is permanently locked/neutralized.</p>
              <p><strong>5. Extra Turns:</strong> Capturing 1 or more boxes gives you an <span className="text-emerald-400 font-bold">EXTRA TURN</span>!</p>
            </div>

            <button
              onClick={() => setShowRules(false)}
              className="w-full mt-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-mono font-bold text-sm rounded-xl transition"
            >
              GOT IT, LET'S PLAY!
            </button>
          </div>
        </div>
      )}

    </div>
  );
}