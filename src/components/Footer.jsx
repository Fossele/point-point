import { Undo2, RotateCcw } from 'lucide-react';



export default function Footer({ handleUndo, history, gameMode, currentPlayer, initBoard}) {
    return (
        <footer className="w-full max-w-5xl flex justify-between items-center gap-3 z-20">
            <button
                onClick={handleUndo}
                disabled={history.length === 0 || (gameMode === 'ai' && currentPlayer === 2)}
                className="flex-1 py-3 px-4 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 text-slate-300 font-mono text-xs font-semibold rounded-2xl border border-slate-800 flex items-center justify-center gap-2 transition shadow-lg"
            >
                <Undo2 className="w-4 h-4" />
                <span>UNDO MOVE</span>
            </button>

            <button
                onClick={() => initBoard()}
                className="flex-1 py-3 px-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 active:scale-95 text-white font-mono text-xs font-bold rounded-2xl border border-cyan-400/30 flex items-center justify-center gap-2 transition shadow-lg shadow-cyan-950/40"
            >
                <RotateCcw className="w-4 h-4" />
                <span>RESTART BOARD</span>
            </button>
        </footer>

    )
}