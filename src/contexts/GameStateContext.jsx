import { createContext, useContext } from "react";


export const GameStateContext = createContext({
    gameState: {
        status: 'lobby', // 'lobby' turns into 'playing' when both are connected
        players: [],
        currentTurn: null,
        role: null,
        roomCode: null,
        myPlayer: null,
        extraTurn: false
    },
    setGameState: () => { },
});

export function useGameStateContext() {
    const { gameState, setGameState } = useContext(GameStateContext);
    return {gameState, setGameState};
}