

import { Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';


import { SocketIOContextProvider } from './contexts/socketIOContext.jsx';
import { AuthContextProvider } from './contexts/authContext.jsx';
import { GameStateContextProvider } from './contexts/GameStateContextProvider.jsx';

import Signup from './pages/SignUp.jsx';
import Login from './pages/Login.jsx';
import HomePage from './pages/HomePage.jsx';
import GameRoomPage from './pages/GameRoomPage.jsx';
import NotFound from './pages/NotFound.jsx';
import Game from './components/Game.jsx';
import { ProtectedRoute } from './components/ProtectedRoute.jsx';




export default function App() {
  return (
    <QueryClientProvider client={new QueryClient()}>

      <AuthContextProvider>
        <SocketIOContextProvider>
          <GameStateContextProvider>
            <Routes>

              {/* Home screen: Create room or join via input */}
              <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
              {/* Room screen: Handles direct links like /room/XYZ-123 */}
              <Route path="/room/:roomCode" element={ <ProtectedRoute><GameRoomPage /></ProtectedRoute> } />
              <Route path="/game" element={<ProtectedRoute><Game /></ProtectedRoute>} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </GameStateContextProvider>
        </SocketIOContextProvider>
      </AuthContextProvider>

    </QueryClientProvider>
  )
}