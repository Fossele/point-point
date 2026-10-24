import { useState } from 'react';
import { Copy, Check, Play } from 'lucide-react';
import { useSocket } from '../contexts/socketIOContext.jsx';

export default function RoomLobby({ roomCode, players }) {
    const [copied, setCopied] = useState(false);

    // Generate the shareable URL based on current window location
    const shareableLink = `${window.location.origin}/room/${roomCode}`;

    const handleCopy = () => {
        navigator.clipboard.writeText(shareableLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="max-w-md mx-auto p-6 bg-slate-800 rounded-2xl shadow-xl text-white">
            <h2 className="text-xl font-bold mb-4 text-center">Private Room Lobby</h2>

            {/* Room Code Display */}
            <div className="mb-6 p-4 bg-slate-900 rounded-xl text-center">
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Room Code</p>
                <span className="text-3xl font-mono font-bold tracking-widest text-emerald-400">{roomCode}</span>
            </div>

            {/* Shareable Link Box */}
            <div className="mb-6">
                <label className="text-xs text-slate-400 mb-1 block">Shareable Invite Link</label>
                <div className="flex gap-2">
                    <input
                        type="text"
                        readOnly
                        value={shareableLink}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none"
                    />
                    <button
                        onClick={handleCopy}
                        className="bg-indigo-600 hover:bg-indigo-500 px-4 rounded-lg flex items-center justify-center transition-colors"
                    >
                        {copied ? <Check size={18} /> : <Copy size={18} />}
                    </button>
                </div>
            </div>

            {/* Start Game Button */}
            {players.length === 2 && (
                <div className="flex justify-center">
                    <button className="bg-emerald-500 hover:bg-emerald-400 px-6 py-2 rounded-lg flex items-center gap-2 transition-colors">
                        <Play size={18} />
                        <span>Start Game</span>
                    </button>
                </div>
            )}

            {/* Waiting Status */}
            <div className="text-center text-slate-400 text-sm animate-pulse">
                {players.length < 2 ? "Waiting for opponent to join..." : "Opponent connected! Starting game..."}
            </div>
        </div>
    );
}