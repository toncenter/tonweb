
import { Cell } from './cell';
import { indexCell } from './cell-index';


// @todo: add test with cycles (not DAG)


describe('indexCell()', () => {

    it('no duplicates', async () => {

        const cellA = new Cell();
        cellA.name = 'A';
        cellA.bits.writeString('A');

        const cellB = new Cell();
        cellB.name = 'B';
        cellB.bits.writeString('B');

        const cellC = new Cell();
        cellC.name = 'C';
        cellC.bits.writeString('C');

        const cellD = new Cell();
        cellD.name = 'D';
        cellD.bits.writeString('D');

        const cellE = new Cell();
        cellE.name = 'E';
        cellE.bits.writeString('E');

        const cellF = new Cell();
        cellF.name = 'F';
        cellF.bits.writeString('F');

        const cells = [
            cellA,
            cellB,
            cellC,
            cellD,
            cellE,
            cellF,
        ];

        /**
         * Cells topology:
         *
         * [A]──[B]──[D]
         *  │    │
         *  │    └───[E]──[F]
         *  └───[C]
         */

        cellA.refs = [cellB, cellC];
        cellB.refs = [cellD, cellE];
        cellE.refs = [cellF];

        // Depth-first topological order
        const topologicalOrder: Cell[] = [
            cellA,
            cellB,
            cellD,
            cellE,
            cellF,
            cellC,
        ];

        const {
            orderedCells: order,
            indexHashmap: hashmap,

        } = await indexCell(cellA);

        // Checking if index length is equal
        // to the number of cells.
        expect(order).toHaveLength(cells.length);
        expect(Object.keys(hashmap)).toHaveLength(cells.length);

        // Checking if cells are in topological order
        expect(order).toEqual(topologicalOrder);

        // Checking if hash index is correct
        for (const cell of cells) {
            const cellHash = await cell.hashBase64();
            const topologicalIndex = order.indexOf(cell);
            expect(hashmap[cellHash]).toEqual(topologicalIndex);
        }

    });

    it('duplicate cells', async () => {

        const cellA = new Cell();
        cellA.name = 'A';
        cellA.bits.writeString('A');

        const cellB = new Cell();
        cellB.name = 'B';
        cellB.bits.writeString('B');

        const cellC = new Cell();
        cellC.name = 'C';
        cellC.bits.writeString('C');

        const cellD = new Cell();
        cellD.name = 'D';
        cellD.bits.writeString('D');

        const cellDDupe = new Cell();
        cellDDupe.name = 'DDupe';
        cellDDupe.bits.writeString('D');

        const cellE = new Cell();
        cellE.name = 'E';
        cellE.bits.writeString('E');

        const uniqueCells = [
            cellA,
            cellB,
            cellC,
            cellD,
            cellE,
        ];

        /**
         * Cells topology:
         *
         * [A]──[B]──[D]
         *  │
         *  └───[C]──[D']
         *       │
         *       └───[E]
         */

        cellA.refs = [cellB, cellC];
        cellB.refs = [cellD];
        cellC.refs = [cellDDupe, cellE];

        // Depth-first topological order
        const topologicalOrder: Cell[] = [
            cellA,
            cellB,
            cellC,
            cellD,
            cellE,
        ];

        const {
            orderedCells: order,
            indexHashmap: hashmap,

        } = await indexCell(cellA);

        // Checking if cells are in topological order
        expect(order).toEqual(topologicalOrder);

        // Checking if hash index is correct
        // -----

        expect(Object.keys(hashmap)).toHaveLength(
            uniqueCells.length
        );

        for (const cell of uniqueCells) {
            const cellHash = await cell.hashBase64();
            const topologicalIndex = order.indexOf(cell);
            expect(hashmap[cellHash]).toEqual(topologicalIndex);
        }

    });

    it('duplicate cells with children', async () => {

        const cellA = new Cell();
        cellA.name = 'A';
        cellA.bits.writeString('A');

        const cellB = new Cell();
        cellB.name = 'B';
        cellB.bits.writeString('B');

        const cellC = new Cell();
        cellC.name = 'C';
        cellC.bits.writeString('C');

        const cellD = new Cell();
        cellD.name = 'D';
        cellD.bits.writeString('D');

        const cellE = new Cell();
        cellE.name = 'E';
        cellE.bits.writeString('E');

        const cellF = new Cell();
        cellF.name = 'F';
        cellF.bits.writeString('F');

        const cellG = new Cell();
        cellG.name = 'G';
        cellG.bits.writeString('G');

        const cellH = new Cell();
        cellG.name = 'H';
        cellG.bits.writeString('H');

        const uniqueCells = [
            cellA,
            cellB,
            cellC,
            cellD,
            cellE,
            cellF,
            cellG,
            cellH,
        ];

        /**
         * Cells topology:
         *
         * [A]──[B]──[D]──[G]
         *  │    │
         *  │    └───[E]
         *  │
         *  └───[C]──[F]──[B']
         *            │
         *            └───[H]
         */

        cellA.refs = [cellB, cellC];
        cellB.refs = [cellD, cellE];
        cellD.refs = [cellG];
        cellC.refs = [cellF];
        cellF.refs = [cellB, cellH];

        // Depth-first topological order
        const topologicalOrder: Cell[] = [
            cellA,
            cellC,
            cellF,
            cellB,
            cellD,
            cellG,
            cellE,
            cellH,
        ];

        const {
            orderedCells: order,
            indexHashmap: hashmap,

        } = await indexCell(cellA);

        // Checking if cells are in topological order
        expect(order).toEqual(topologicalOrder);

        // Checking if hash index is correct
        // -----

        expect(Object.keys(hashmap)).toHaveLength(
            uniqueCells.length
        );

        for (const cell of uniqueCells) {
            const cellHash = await cell.hashBase64();
            const topologicalIndex = order.indexOf(cell);
            expect(hashmap[cellHash]).toEqual(topologicalIndex);
        }

    });

    it('duplicate cells with children and same parent', async () => {

        const cellA = new Cell();
        cellA.name = 'A';
        cellA.bits.writeString('A');

        const cellB = new Cell();
        cellB.name = 'B';
        cellB.bits.writeString('B');

        const cellC = new Cell();
        cellC.name = 'C';
        cellC.bits.writeString('C');

        const cellD = new Cell();
        cellD.name = 'D';
        cellD.bits.writeString('D');

        const cellE = new Cell();
        cellE.name = 'E';
        cellE.bits.writeString('E');

        const uniqueCells = [
            cellA,
            cellB,
            cellC,
            cellD,
            cellE,
        ];

        /**
         * Cells topology:
         *
         * [A]──[B]──[D]
         *  │    │
         *  │    └───[E]
         *  │
         *  └───[C]
         *  │
         *  └───[B']
         */

        cellA.refs = [cellB, cellC, cellB];
        cellB.refs = [cellD, cellE];

        // Depth-first topological order
        const topologicalOrder: Cell[] = [
            cellA,
            cellB,
            cellD,
            cellE,
            cellC,
        ];

        const {
            orderedCells: order,
            indexHashmap: hashmap,

        } = await indexCell(cellA);

        // Checking if cells are in topological order
        expect(order).toEqual(topologicalOrder);

        // Checking if hash index is correct
        // -----

        expect(Object.keys(hashmap)).toHaveLength(
            uniqueCells.length
        );

        for (const cell of uniqueCells) {
            const cellHash = await cell.hashBase64();
            const topologicalIndex = order.indexOf(cell);
            expect(hashmap[cellHash]).toEqual(topologicalIndex);
        }

    });

});
