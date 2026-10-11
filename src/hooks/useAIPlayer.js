import { useEffect } from 'react';
import { GRID_SIZE } from '../utils/constants.js';

export function useAIPlayer({
    gameMode,
    currentPlayer,
    gameOver,
    aiDifficulty,
    vertices,
    squares,
    processMove,
    evaluateAdjacentSquares
}) {
    useEffect(() => {
        if (gameMode === 'ai' && currentPlayer === 2 && !gameOver) {
            const timer = setTimeout(() => {
                const candidateMap = new Set();
                const emptyNodes = [];

                for (let r = 0; r <= GRID_SIZE; r++) {
                    for (let c = 0; c <= GRID_SIZE; c++) {
                        if (vertices[r][c] === 0) {
                            emptyNodes.push({ r, c });

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
                            break;
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
    }, [currentPlayer, gameMode, gameOver, vertices, squares, aiDifficulty, processMove, evaluateAdjacentSquares]);
}