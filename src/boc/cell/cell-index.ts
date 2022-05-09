
import { Cell, CellHashBase64 } from './cell';


export interface IndexCellResult {
    orderedCells: TopologicalOrder;
    indexHashmap: IndexHashmap;
}

export type IndexHashmap = Record<CellHashBase64, CellIndex>;
export type TopologicalOrder = Cell[];
export type CellIndex = number;


/**
 * Recursively iterates tree of the specified cell and
 * creates optimized topological index of all the sub-cells.
 */
export async function indexCell(
    cell: Cell

): Promise<IndexCellResult> {

    const orderedCells: TopologicalOrder = [];
    const indexHashmap: IndexHashmap = {};

    // Starting the iteration from
    // the specified root cell
    await iterateSubTree(cell);

    return {
        orderedCells,
        indexHashmap,
    };


    /**
     * Recursive function that iterates graph of cells
     * in the topological order in a depth-first manner.
     */
    async function iterateSubTree(
        cell: Cell,
        parentCellHash?: CellHashBase64

    ): Promise<void> {

        const cellHash = await cell.hashBase64();

        // console.log(`iterateCell() (${cell.name}, ${cellHash})`);

        // Checking if cell was already indexed
        // (i.e. treating cells with duplicate content)
        if (cellHash in indexHashmap) {

            const parentCellIndex = indexHashmap[parentCellHash];
            const existingCellIndex = indexHashmap[cellHash];

            // If duplicate cells has the same parent,
            // then we don't need to move them
            if (parentCellIndex > existingCellIndex) {
                await moveCellToTheEnd(cellHash);
            }

            // Cell was already processed, so we don't need
            // to add it to the index or to process its children
            return;

        }

        // Adding this cell to the index
        indexHashmap[cellHash] = orderedCells.length;
        orderedCells.push(cell);

        // Recursive call for each cell (depth-first)
        for (let subCell of cell.refs) {
            await iterateSubTree(subCell, cellHash);
        }

    }

    async function moveCellToTheEnd(
        targetHash: CellHashBase64
    ) {
        const targetIndex = indexHashmap[targetHash];
        for (let hash in indexHashmap) {
            const index = indexHashmap[hash];
            if (index > targetIndex) {
                indexHashmap[hash] = (index - 1);
            }
        }

        // Making hash to point to the last
        // element of topological array
        const lastIndex = (orderedCells.length - 1);
        indexHashmap[targetHash] = lastIndex;

        const cell = orderedCells[targetIndex];

        // Deleting original element from the topological array
        orderedCells.splice(targetIndex, 1);

        // Adding element to the end of topological array
        orderedCells.push(cell);

        for (const subCell of cell.refs) {
            const subCellHash = await subCell.hashBase64();
            await moveCellToTheEnd(
                subCellHash
            );
        }

    }

}
