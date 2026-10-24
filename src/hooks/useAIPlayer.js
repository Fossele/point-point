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

                let selectedMove = null; // Declared once here

                if (aiDifficulty === 'easy' || candidateMap.size === 0) {
                    selectedMove = emptyNodes[Math.floor(Math.random() * emptyNodes.length)];
                } else {
                    const candidatesList = Array.from(candidateMap).map(str => {
                        const [r, c] = str.split(',').map(Number);
                        return { r, c };
                    });

                    let boxCompletingMoves = [];
                    let safeMoves = [];
                    let riskyMoves = [];

                    candidatesList.forEach(move => {
                        const testVerts = vertices.map(row => [...row]);
                        testVerts[move.r][move.c] = 2; // AI is player 2

                        const { claimedCount } = evaluateAdjacentSquares(
                            move.r,
                            move.c,
                            testVerts,
                            squares,
                            2
                        );

                        // Check if this move sets up a 3-corner trap for the opponent
                        let createsDangerSquare = false;
                        const adjacentSquaresToCheck = [
                            { r: move.r - 1, c: move.c - 1 },
                            { r: move.r - 1, c: move.c },
                            { r: move.r, c: move.c - 1 },
                            { r: move.r, c: move.c }
                        ];

                        adjacentSquaresToCheck.forEach(({ r: sr, c: sc }) => {
                            if (sr >= 0 && sr < GRID_SIZE && sc >= 0 && sc < GRID_SIZE) {
                                if (squares[sr][sc] === 0) {
                                    // Count how many vertices are filled in this square
                                    const c1 = testVerts[sr][sc];
                                    const c2 = testVerts[sr][sc + 1];
                                    const c3 = testVerts[sr + 1][sc];
                                    const c4 = testVerts[sr + 1][sc + 1];
                                    const filledCount = [c1, c2, c3, c4].filter(v => v !== 0).length;

                                    if (filledCount === 3) {
                                        createsDangerSquare = true; // This move gives the opponent a box!
                                    }
                                }
                            }
                        });

                        // Categorize the move
                        if (claimedCount > 0) {
                            boxCompletingMoves.push(move);
                        } else if (!createsDangerSquare) {
                            safeMoves.push(move);
                        } else {
                            riskyMoves.push(move);
                        }
                    });

                    // Selection Hierarchy (assigned to the existing variable, no 'let')
                    if (boxCompletingMoves.length > 0) {
                        selectedMove = boxCompletingMoves[Math.floor(Math.random() * boxCompletingMoves.length)];
                    } else if (safeMoves.length > 0 && aiDifficulty === 'smart') {
                        selectedMove = safeMoves[Math.floor(Math.random() * safeMoves.length)];
                    } else if (candidatesList.length > 0) {
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

//handles the AI player's turn in the game, making decisions based on the current game state and difficulty level.