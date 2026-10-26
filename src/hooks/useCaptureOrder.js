import { useState } from 'react';


export const useCaptureOrder = () => {
    // Track the global counter and the dictionary map in your state 
    const [scores, setScores] = useState({ 1: 0, 2: 0 });
 
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
    

        console.log(r, c , "point for box");
    };

    return { scores, setScores, captureOrderMap, handleBoxCaptured };
}

//handles the order in which boxes are captured by players, maintaining a score for each player and a mapping of captured boxes to their respective players and scores.