



export default function Rules({setShowRules, X, BookOpen}) {


  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl text-left relative">
        <button
          onClick={() => setShowRules(false)}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-2"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-cyan-500/20 text-cyan-400 rounded-xl">
            <BookOpen className="w-6 h-6" />
          </div>
          <h3 className="font-mono text-xl font-bold text-white">Point Point Rules (30x30)</h3>
        </div>

        <div className="space-y-3 text-sm text-slate-300 font-medium overflow-y-auto max-h-[60vh] pr-1">
          <p><strong>1. Viewport Navigation:</strong> Drag or swipe to pan around the 30x30 grid. Scroll mouse-wheel or use zoom buttons to scale the view.</p>
          <p><strong>2. Node Turns:</strong> Alternate placing node points on empty grid intersections.</p>
          <p><strong>3. Pure Box Ownership:</strong> When all 4 corners of a square match <span className="text-cyan-400 font-bold">ONLY your color</span>, you claim it for <strong>+1 Point</strong>!</p>
          <p><strong>4. Neutral Block:</strong> If all 4 corners are filled with a <span className="text-amber-400 font-bold">MIX of both players' colors</span>, the square is permanently locked/neutralized.</p>
          <p><strong>5. Extra Turns:</strong> Capturing 1 or more boxes gives you an <span className="text-emerald-400 font-bold">EXTRA TURN</span>!</p>
        </div>

        <button
          onClick={() => setShowRules(false)}
          className="w-full mt-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-mono font-bold text-sm rounded-xl transition"
        >
          GOT IT, LET'S PLAY!
        </button>
      </div>
    </div>
  )
}