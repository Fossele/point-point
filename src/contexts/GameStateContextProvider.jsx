import { createContext, useState } from 'react';
import PropTypes from 'prop-types';
import { GameStateContext } from './GameStateContext.jsx';




export const GameStateContextProvider = ({ children }) => {

    const [gameState, setGameState] = useState({
        status: 'lobby', // 'lobby' turns into 'playing' when both are connected
        players: [],
        currentTurn: null,
        role: null,
        roomCode: null, 
        myPlayer: null
    });

    return (
        <GameStateContext.Provider value={{ gameState, setGameState }}>
            {children}
        </GameStateContext.Provider>
    );
}
GameStateContextProvider.propTypes = {
    children: PropTypes.element.isRequired,
}