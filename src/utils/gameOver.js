export const checkGameOver = (totalFilled) => {
    const GRID_SIZE = 30; // 30x30 squares = 31x31 vertices = 961 nodes
    //const CELL_SIZE = 36; // Base size of each cell in viewport pixels at scale 1.0

    return totalFilled >= (GRID_SIZE + 1) * (GRID_SIZE + 1);
};