

import { Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';


import { SocketIOContextProvider } from './contexts/socketIOContext.jsx';
import { AuthContextProvider } from './contexts/authContext.jsx';
import { GameStateContextProvider } from './contexts/GameStateContextProvider.jsx';

import Signup from './pages/SignUp.jsx';
import Login from './pages/Login.jsx';
import HomePage from './pages/HomePage.jsx';
import GameRoomPage from './pages/GameRoomPage.jsx';
import Game from './components/Game.jsx';




export default function App() {
  return (
    <QueryClientProvider client={new QueryClient()}>

      <AuthContextProvider>
        <SocketIOContextProvider>
          <GameStateContextProvider>
            <Routes>

              {/* Home screen: Create room or join via input */}
              <Route path="/" element={<HomePage />} />
              {/* Room screen: Handles direct links like /room/XYZ-123 */}
              <Route path="/room/:roomCode" element={<GameRoomPage />} />
              <Route path="/game" element={<Game />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
            </Routes>
          </GameStateContextProvider>
        </SocketIOContextProvider>
      </AuthContextProvider>

    </QueryClientProvider>
  )
}