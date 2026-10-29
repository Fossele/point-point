import { Grid, User, Bot, VolumeX, Volume2, HelpCircle, Sparkles, Zap} from 'lucide-react';
import { useGameStateContext } from '../contexts/GameStateContext';



export default function Header({ setGameMode, gameMode, initBoard, soundMuted, toggleSound, scores, extraTurn, aiDifficulty , setShowRules}) {

    const {gameState} = useGameStateContext();

    return (
        <header className="w-full max-w-5xl flex flex-col items-center gap-2 z-20">
            <div className="w-full flex justify-between items-center bg-slate-900/90 p-2.5 sm:p-3 rounded-2xl border border-slate-800 backdrop-blur shadow-xl">
                <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-gradient-to-br from-cyan-500 to-pink-500 rounded-xl shadow-lg">
                        <Grid className="w-5 h-5 text-slate-950 font-bold" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="font-mono text-lg font-black tracking-wider text-emerald-400 sm:text-xl">
                                POINT POINT
                            </h1>
                            <span className="px-2 py-0.5 bg-cyan-950 text-cyan-400 border border-cyan-800/80 rounded-md font-mono text-[10px] font-bold">
                                30x30 MEGA
                            </span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-medium hidden sm:block">Tactical Viewport Engine • 961 Vertices</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {/* Game Mode Selector */}
                    <div className="flex items-center bg-slate-950/80 rounded-xl p-1 border border-slate-800">
                        <button
                            onClick={() => { setGameMode('pvp'); initBoard(); }}
                            className={`p-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${gameMode === 'pvp' ? 'bg-cyan-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'}`}
                            title="Pass & Play Mode"
                        >
                            <User className="w-4 h-4" />
                            <span className="hidden sm:inline">2P</span>
                        </button>
                        <button
                            onClick={() => { setGameMode('ai'); initBoard(); }}
                            className={`p-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${gameMode === 'ai' ? 'bg-pink-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'}`}
                            title="Vs AI Mode"
                        >
                            <Bot className="w-4 h-4" />
                            <span className="hidden sm:inline">AI</span>
                        </button>
                    </div>

                    {/* Mute Button */}
                    <button
                        onClick={toggleSound}
                        className="p-2 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 rounded-xl border border-slate-700 transition"
                        title="Toggle Sound Effects"
                    >
                        {soundMuted ? <VolumeX className="w-4 h-4 text-pink-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
                    </button>

                    {/* Help Button */}
                    <button
                        onClick={() => setShowRules(true)}
                        className="p-2 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 rounded-xl border border-slate-700 transition"
                        title="Game Rules"
                    >
                        <HelpCircle className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Score & Active Turn Bar */}
            <div className="w-full grid grid-cols-2 sm:grid-cols-3 gap-2">
                {/* P1 Score */}
                <div className={`bg-slate-900/90 rounded-xl p-2 sm:p-2.5 border-2 transition-all flex items-center justify-between ${gameState.currentTurn === 1 ? 'border-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.2)]' : 'border-slate-800 opacity-70'}`}>
                    <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#00f0ff]"></span>
                        <div>
                            <div className="font-mono text-xs font-bold text-cyan-400">PLAYER 1 {gameState.role === 1 && 'YOU'}</div>
                            <div className="hidden text-[10px] text-slate-400 sm:block">Neon Emerald</div>
                        </div>
                    </div>
                    <div className="font-mono text-2xl font-black text-cyan-400">{scores[1]}</div>
                </div>

                {/* P2 Score */}
                <div className={`bg-slate-900/90 rounded-xl p-2 sm:p-2.5 border-2 transition-all flex items-center justify-between ${gameState.currentTurn === 2 ? 'border-pink-500 shadow-[0_0_15px_rgba(255,0,127,0.2)]' : 'border-slate-800 opacity-70'}`}>
                    <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-pink-500 shadow-[0_0_8px_#ff007f]"></span>
                        <div>
                            <div className="font-mono text-xs font-bold text-pink-500">
                                {gameMode === 'ai' ? 'CYBER AI' : 'PLAYER 2'}
                                {gameState.role === 2 && 'YOU'}
                            </div>
                            <div className="text-[10px] text-slate-400 hidden sm:block">
                                {gameMode === 'ai' ? `Lvl: ${aiDifficulty.toUpperCase()}` : 'Pink Neon'}
                            </div>
                        </div>
                    </div>
                    <div className="font-mono text-2xl font-black text-pink-500">{isNaN(scores[2]) ? 0 : scores[2]}</div>
                </div>

                {/* Active Turn Banner */}
                <div className="col-span-2 sm:col-span-1 bg-slate-950/90 px-3 py-2 rounded-xl border border-slate-800 flex items-center justify-between">
                    <div className={`font-mono text-xs font-bold flex items-center gap-1.5 ${gameState.currentTurn === 1 ? 'text-cyan-400' : 'text-pink-500'}`}>
                        <Sparkles className="w-3.5 h-3.5 animate-spin" />
                        <span>
                            {gameState.currentTurn === 1 ? "P1 TURN" : (gameMode === 'ai' ? "AI THINKING" : "P2 TURN")}
                        </span>
                    </div>

                    {extraTurn && (
                        <div className="animate-pulse bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-mono text-[9px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 uppercase">
                            <Zap className="w-3 h-3 fill-slate-950" />
                            <span>+1 Turn</span>
                        </div>
                    )}
                </div>
            </div>
        </header>

    )
}