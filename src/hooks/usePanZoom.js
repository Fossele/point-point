import { useState, useRef, useCallback } from 'react';
import { CELL_SIZE, GRID_SIZE } from '../utils/constants.js';

export function usePanZoom() {
    const [zoomLevel, setZoomLevel] = useState(0.85);
    const [panOffset, setPanOffset] = useState({ x: 20, y: 20 });
    const [isPanning, setIsPanning] = useState(false);
    const startPanRef = useRef({ x: 0, y: 0 });
    const boardContainerRef = useRef(null);

    const boardPxSize = GRID_SIZE * CELL_SIZE;

    const resetView = useCallback(() => {
        setZoomLevel(0.85);
        if (boardContainerRef.current) {
            const rect = boardContainerRef.current.getBoundingClientRect();
            const boardTotalPx = GRID_SIZE * CELL_SIZE * 0.85;
            setPanOffset({
                x: Math.max(10, (rect.width - boardTotalPx) / 2),
                y: Math.max(10, (rect.height - boardTotalPx) / 2)
            });
        }
    }, []);

    const adjustZoom = (delta) => {
        setZoomLevel(prev => Math.min(Math.max(0.35, prev + delta), 2.5));
    };

    const handleWheel = (e) => {
        e.preventDefault();
        const zoomFactor = e.deltaY < 0 ? 1.12 : 0.88;
        setZoomLevel(prev => Math.min(Math.max(0.35, prev * zoomFactor), 2.5));
    };

    const handleMouseDown = (e) => {
        if (e.target.dataset.node || e.button === 2) return;
        setIsPanning(true);
        startPanRef.current = { x: e.clientX - panOffset.x, y: e.clientY - panOffset.y };
    };

    const handleMouseMove = (e) => {
        if (!isPanning) return;
        setPanOffset({
            x: e.clientX - startPanRef.current.x,
            y: e.clientY - startPanRef.current.y
        });
    };

    const handleMouseUp = () => setIsPanning(false);

    return {
        boardContainerRef,
        zoomLevel,
        panOffset,
        boardPxSize,
        resetView,
        adjustZoom,
        handleWheel,
        handleMouseDown,
        handleMouseMove,
        handleMouseUp
    };
}