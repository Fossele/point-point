import { Trophy } from 'lucide-react';

export default function Winning({ winnerInfo, gameMode, initBoard, confettiCanvasRef}) {
    return (<div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
        <canvas ref={confettiCanvasRef} className="absolute inset-0 pointer-events-none z-10" />
        <div className="bg-slate-900 border-2 border-slate-700 rounded-3xl p-6 sm:p-8 max-w-md w-full text-center shadow-2xl relative z-20">
            <div className={`w-20 h-20 mx-auto rounded-3xl flex items-center justify-center mb-4 shadow-xl ${winnerInfo.winner === 1 ? 'bg-cyan-400 shadow-[0_0_25px_#00f0ff]' :
                    winnerInfo.winner === 2 ? 'bg-pink-500 shadow-[0_0_25px_#ff007f]' :
                        'bg-amber-400 shadow-[0_0_25px_#fbbf24]'
                }`}>
                <Trophy className="w-10 h-10 text-slate-950" />
            </div>

            <h2 className={`font-mono text-2xl sm:text-3xl font-black mb-2 tracking-wider ${winnerInfo.winner === 1 ? 'text-cyan-400 drop-shadow-[0_0_10px_#00f0ff]' :
                    winnerInfo.winner === 2 ? 'text-pink-500 drop-shadow-[0_0_10px_#ff007f]' :
                        'text-amber-400'
                }`}>
                {winnerInfo.winner === 1 ? 'PLAYER 1 WINS!' :
                    winnerInfo.winner === 2 ? (gameMode === 'ai' ? 'CYBER AI WINS!' : 'PLAYER 2 WINS!') :
                        "IT'S A DRAW!"}
            </h2>

            <p className="text-xs sm:text-sm text-slate-400 mb-6 font-semibold">
                Mastered the 30x30 mega grid node capture!
            </p>

            <div className="bg-slate-950/80 rounded-2xl p-4 mb-6 border border-slate-800 grid grid-cols-2 gap-4">
                <div className="text-center border-r border-slate-800 pr-2">
                    <div className="text-xs text-cyan-400 font-mono font-bold">P1 SCORE</div>
                    <div className="font-mono text-3xl font-black text-cyan-400">{winnerInfo.finalP1}</div>
                </div>
                <div className="text-center pl-2">
                    <div className="text-xs text-pink-500 font-mono font-bold">
                        {gameMode === 'ai' ? 'AI SCORE' : 'P2 SCORE'}
                    </div>
                    <div className="font-mono text-3xl font-black text-pink-500">{winnerInfo.finalP2}</div>
                </div>
            </div>

            <button
                onClick={() => initBoard()}
                className="w-full py-4 bg-gradient-to-r from-cyan-500 via-indigo-500 to-pink-500 hover:opacity-95 active:scale-95 text-slate-950 font-mono font-black text-base rounded-2xl shadow-xl transition tracking-wider"
            >
                PLAY AGAIN
            </button>
        </div>
    </div>)
}