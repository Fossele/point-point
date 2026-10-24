import { useState, useCallback } from 'react';
import { GRID_SIZE } from '../utils/constants.js';
import { checkGameOver } from '../utils/gameOver.js';
import { useCaptureOrder } from './useCaptureOrder.js';
import { useCommunication } from './useCommunication.js';
//import { Columns } from 'lucide-react';

export function useGameState(audioEngine, onGameOver) {
    const [gameMode, setGameMode] = useState('pvp'); // 'pvp' or 'ai'
    const [aiDifficulty, setAiDifficulty] = useState('smart'); // 'easy', 'medium', 'smart'
    const [currentPlayer, setCurrentPlayer] = useState(null);

    const [extraTurn, setExtraTurn] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const [winnerInfo, setWinnerInfo] = useState(null);

    const [vertices, setVertices] = useState([]);
    const [squares, setSquares] = useState([]);
    const [claimedCountTotal, setClaimedCountTotal] = useState(0);
    const [history, setHistory] = useState([]);
    const [moveHistory, setMoveHistory] = useState([]);
    



    const { scores, setScores, captureOrderMap, handleBoxCaptured } = useCaptureOrder();
    const { sendMove, gameState, moves } = useCommunication();

    const initBoard = useCallback(() => {
        const newVerts = Array.from({ length: GRID_SIZE + 1 }, () => Array(GRID_SIZE + 1).fill(0));
        const newSq = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(0));
        setVertices(newVerts);
        setSquares(newSq);
        setScores({ 1: 0, 2: 0 });
        setCurrentPlayer(gameState.currentTurn);
        setExtraTurn(false);
        setGameOver(false);
        setWinnerInfo(null);
        setHistory([]);
        setClaimedCountTotal(0);
    }, []);

    const evaluateAdjacentSquares = (vr, vc, currentVerts, currentSquares, player) => {
        // This function evaluates the squares adjacent to a given vertex and determines if any are claimed or blocked.

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
                            handleBoxCaptured(r, c, player);
                        } else {
                            updatedSquares[r][c] = -1;
                            blockedCount++;
                        }
                    }
                }
            }
        });

        return { updatedSquares, claimedCount, blockedCount };
    };

    const processMove = useCallback((r, c) => {
        console.log(gameState);

      if (gameState.currentTurn !==  gameState.role) {
            //block unauthorized moves
            //audioEngine.play('block', currentPlayer === 1);
            console.log("Not your turn!");
            return;
        }

        if (gameState.role == null){
            console.log("seems like you have no role.");
            return;
        }

        console.log(`Move ${r}-${c} played by ${currentPlayer}`);

        if (gameOver || vertices[r][c] !== 0) return;

        let move = { row: r, column: c, player: currentPlayer, extraTurn: extraTurn }

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

        setMoveHistory(prev => [...prev, move]);

        /* sendMessage("", {
             vertices: vertices.map(row => [...row]),
             squares: squares.map(row => [...row]),
             currentPlayer,
             scores: { ...scores },
             extraTurn,
             claimedCountTotal
         });*/

        sendMove({ roomCode: gameState.roomCode , r, c, player: currentPlayer });

        const nextVerts = vertices.map(row => [...row]);
        nextVerts[r][c] = currentPlayer;

        const { updatedSquares, claimedCount, blockedCount } = evaluateAdjacentSquares(
            r,
            c,
            nextVerts,
            squares,
            currentPlayer
        );

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

        if (checkGameOver(newTotalFilled)) {
            setGameOver(true);
            setExtraTurn(false);
            audioEngine.play('win');

            let winner = 0;
            if (newScores[1] > newScores[2]) winner = 1;
            else if (newScores[2] > newScores[1]) winner = 2;

            const info = { winner, finalP1: newScores[1], finalP2: newScores[2] };
            setWinnerInfo(info);
            if (onGameOver) onGameOver(info);
            return;
        }

        if (claimedCount > 0) {
            setExtraTurn(true);
        } else {
            setExtraTurn(false);
            setCurrentPlayer(gameState.currentTurn);

        }
    }, [vertices, squares, currentPlayer, scores, gameOver, extraTurn, claimedCountTotal, audioEngine, onGameOver]);


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



    return {
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
        captureOrderMap,
        moves
    };
}

// This hook manages the game state, including the board, players, scores, and game logic. It also accesses communication with the backend through the useCommunication hook.