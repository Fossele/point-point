import {
    ZoomIn,
    ZoomOut,
    Maximize2,
    Compass,
    X
} from 'lucide-react';

import { CELL_SIZE, GRID_SIZE } from '../utils/constants.js';

import React from "react";


export default function Main({ boardContainerRef, handleWheel, handleMouseDown, handleMouseMove, handleMouseUp, boardPxSize, zoomLevel, panOffset, squares, vertices, processMove, adjustZoom, resetView, gameMode, currentPlayer, scores, captureOrderMap }) {
   

    return (
        <main
            ref={boardContainerRef}
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            className="relative w-full max-w-5xl h-[58vh] sm:h-[64vh] my-2 bg-slate-950 border border-slate-800/80 rounded-3xl overflow-hidden cursor-grab active:cursor-grabbing shadow-2xl flex items-center justify-center"
        >
            {/* Floating Zoom & Pan Controls Bar */}
            <div className="absolute top-3 left-3 z-30 flex items-center gap-1 bg-slate-900/90 backdrop-blur border border-slate-800 p-1.5 rounded-2xl shadow-xl">
                <button
                    onClick={() => adjustZoom(0.15)}
                    className="p-1.5 hover:bg-slate-800 rounded-xl text-slate-300 transition active:scale-95"
                    title="Zoom In"
                >
                    <ZoomIn className="w-4 h-4" />
                </button>
                <button
                    onClick={() => adjustZoom(-0.15)}
                    className="p-1.5 hover:bg-slate-800 rounded-xl text-slate-300 transition active:scale-95"
                    title="Zoom Out"
                >
                    <ZoomOut className="w-4 h-4" />
                </button>
                <button
                    onClick={resetView}
                    className="p-1.5 hover:bg-slate-800 rounded-xl text-slate-300 transition active:scale-95"
                    title="Reset View"
                >
                    <Maximize2 className="w-4 h-4" />
                </button>
                <span className="text-[10px] font-mono text-slate-400 px-2 border-l border-slate-800 font-bold">
                    {Math.round(zoomLevel * 100)}%
                </span>
            </div>

            {/* Floating Interactive 30x30 Minimap */}
            <div className="absolute top-3 right-3 z-30 bg-slate-900/90 backdrop-blur border border-slate-800 p-2 rounded-2xl shadow-xl flex flex-col items-center">
                <div className="flex items-center justify-between w-full mb-1">
                    <div className="flex items-center gap-1 text-[9px] font-mono font-bold text-slate-400">
                        <Compass className="w-3 h-3 text-cyan-400" />
                        <span>RADAR</span>
                    </div>
                    <span className="text-[9px] font-mono text-slate-500">30x30</span>
                </div>
                <div className="relative w-20 h-20 bg-slate-950 border border-slate-800 rounded-lg overflow-hidden">
                    {/* Render Mini Grid Canvas preview */}
                    <div className="absolute inset-0 grid grid-cols-30 grid-rows-30 opacity-40">
                        {squares.map((rowArr, r) =>
                            rowArr.map((st, c) => (
                                <div
                                    key={`m-${r}-${c}`}
                                    className={
                                        st === 1 ? 'bg-cyan-400' :
                                            st === 2 ? 'bg-pink-500' :
                                                st === -1 ? 'bg-slate-700' : 'bg-transparent'
                                    }
                                />
                            ))
                        )}
                    </div>
                    {/* Viewport Box overlay */}
                    <div
                        className="absolute border border-amber-400 bg-amber-400/10 pointer-events-none rounded-xs"
                        style={{
                            left: `${Math.max(0, Math.min(70, (-panOffset.x / (boardPxSize * zoomLevel)) * 80))}%`,
                            top: `${Math.max(0, Math.min(70, (-panOffset.y / (boardPxSize * zoomLevel)) * 80))}%`,
                            width: '40%',
                            height: '40%'
                        }}
                    />
                </div>
            </div>

            {/* Viewport Transform Area */}
            <div
                className="absolute transition-transform duration-75 origin-top-left"
                style={{
                    transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
                    width: `${boardPxSize}px`,
                    height: `${boardPxSize}px`
                }}
            >
                {/* SVG Vector Layer for Grid & Filled Squares */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                    {/* Cell Fill Colors */}
                    {squares.map((rowArr, r) =>
                        rowArr.map((sqState, c) => {

                            
                            if (sqState === 0) return null;

                            const boxKey = `${r}-${c}`;
                            const boxData = captureOrderMap[boxKey];
                            return (
                                <g key={`box-${r}-${c}`}>
                                    <rect
                                        x={c * CELL_SIZE}
                                        y={r * CELL_SIZE}
                                        width={CELL_SIZE}
                                        height={CELL_SIZE}
                                        fill={
                                            sqState === 1 ? 'rgba(6, 182, 212, 0.25)' :
                                                sqState === 2 ? 'rgba(236, 72, 153, 0.25)' :
                                                    '#1e293b'
                                        }
                                        stroke={
                                            sqState === 1 ? 'rgba(6, 182, 212, 0.6)' :
                                                sqState === 2 ? 'rgba(236, 72, 153, 0.6)' :
                                                    '#334155'
                                        }
                                        strokeWidth="1"
                                    />

                                    {/* Display player indicator inside the claimed box */}
                                    {(sqState === 1 || sqState === 2) && (
                                        <text
                                            x={c * CELL_SIZE + CELL_SIZE / 2}
                                            y={r * CELL_SIZE + CELL_SIZE / 2}
                                            dominantBaseline="middle"
                                            textAnchor="middle"
                                            fill={boxData.player === 1 ? '#06b6d4' : '#ec4899'}
                                            fontSize="12"
                                            fontWeight="bold"
                                        >
                                            {boxData.score + 1}
                                        </text>
                                    )}
                                </g>
                            );
                        })
                    )}

                    {/* Dash Grid Lines */}
                    {Array.from({ length: GRID_SIZE + 1 }).map((_, idx) => (
                        <React.Fragment key={`grid-${idx}`}>
                            <line
                                x1={idx * CELL_SIZE}
                                y1={0}
                                x2={idx * CELL_SIZE}
                                y2={boardPxSize}
                                stroke="#334155"
                                strokeWidth="1"
                                strokeDasharray="3 3"
                            />
                            <line
                                x1={0}
                                y1={idx * CELL_SIZE}
                                x2={boardPxSize}
                                y2={idx * CELL_SIZE}
                                stroke="#334155"
                                strokeWidth="1"
                                strokeDasharray="3 3"
                            />
                        </React.Fragment>
                    ))}
                </svg>

                {/* Interactive Vertex Node Network */}
                {vertices.map((rowArr, vr) =>
                    rowArr.map((owner, vc) => (
                        <button
                            key={`v-${vr}-${vc}`}
                            data-node="true"
                            onClick={() => processMove(vr, vc)}
                            disabled={owner !== 0 || (gameMode === 'ai' && currentPlayer === 2)}
                            className={`absolute rounded-full transform -translate-x-1/2 -translate-y-1/2 transition-all duration-150 focus:outline-none ${owner === 0
                                ? 'bg-slate-800 border border-slate-600 hover:scale-150 hover:bg-white hover:border-white hover:shadow-[0_0_12px_#ffffff] cursor-pointer'
                                : owner === 1
                                    ? 'bg-cyan-400 border-2 border-white shadow-[0_0_12px_#00f0ff] scale-110 z-10'
                                    : 'bg-pink-500 border-2 border-white shadow-[0_0_12px_#ff007f] scale-110 z-10'
                                }`}
                            style={{
                                left: `${vc * CELL_SIZE}px`,
                                top: `${vr * CELL_SIZE}px`,
                                width: `${Math.max(8, CELL_SIZE * 0.35)}px`,
                                height: `${Math.max(8, CELL_SIZE * 0.35)}px`
                            }}
                        />
                    ))
                )}
            </div>
        </main>
    )
}