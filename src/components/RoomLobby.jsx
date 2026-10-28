import { useState } from 'react';
import { Copy, Check, Link2, Radio } from 'lucide-react';

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
        <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 text-white shadow-2xl shadow-slate-950/60">
            <div className="mb-6 text-center">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Private room</p>
                <h2 className="mt-1 text-xl font-bold">Invite a challenger</h2>
            </div>

            {/* Room Code Display */}
            <div className="mb-6 rounded-xl border border-slate-800 bg-slate-950 p-5 text-center">
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Room Code</p>
                <span className="font-mono text-3xl font-bold tracking-[0.3em] text-emerald-400">{roomCode}</span>
            </div>

            {/* Shareable Link Box */}
            <div className="mb-6">
                <label className="mb-1 flex items-center gap-1 text-xs text-slate-400"><Link2 className="h-3 w-3" /> Shareable invite link</label>
                <div className="flex gap-2">
                    <input
                        type="text"
                        readOnly
                        value={shareableLink}
                        className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-300 focus:outline-none"
                    />
                    <button
                        onClick={handleCopy}
                        aria-label="Copy invite link"
                        className="flex items-center justify-center rounded-lg bg-indigo-500 px-4 transition-colors hover:bg-indigo-400"
                    >
                        {copied ? <Check size={18} /> : <Copy size={18} />}
                    </button>
                </div>
            </div>

            {/* Waiting Status */}
            <div className="flex items-center justify-center gap-2 text-center text-sm text-slate-400">
                <Radio className="radar-pulse h-4 w-4 rounded-full text-emerald-400" />
                {players.length < 2 ? "Waiting for opponent to join..." : "Opponent connected! Starting game..."}
            </div>
        </div>
    );
}