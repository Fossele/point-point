import { useState } from 'react';

export const useCaptureOrder = (scores, setScores) => {
    // Track the global counter and the dictionary map in your state
    const [captureOrderMap, setCaptureOrderMap] = useState({});


    // Call this function whenever a box at (r, c) is completed:
    const handleBoxCaptured = (r, c, currentPlayer) => {
        setCaptureOrderMap(prev => ({
            ...prev,
            [`${r}-${c}`]: {
                player: currentPlayer, // Stores 1 or 2
                score: scores[currentPlayer]   // Stores 1, 2, 3...
            }
        }));
        setScores(prevScores => ({
            ...prevScores,
            [currentPlayer]: prevScores[currentPlayer] + 1
        }));
    
    };

    return { captureOrderMap, handleBoxCaptured };
}

