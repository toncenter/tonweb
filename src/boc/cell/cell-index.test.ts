
import TonWeb from '__tonweb__';
import { Cell as CellType } from '__tonweb__';

import { $describe } from '../../test/globals';
import { indexCell } from './cell-index';

const { Cell } = TonWeb.boc;


// @todo add test with cycles (not DAG)

$describe.skipForPackage('indexCell()', () => {

    it('no duplicates', async () => {

        /**
         * [A]──[B]──[D]
         *  │    │
         *  │    └───[E]──[F]
         *  └───[C]
         */

        await testTopology({
            schema: [
                ['A', ['B', 'C']],
                ['B', ['D', 'E']],
                ['E', ['F']],
            ],
            expectedOrder: [
                'A', 'B', 'D', 'E', 'F', 'C',
            ],
        });

    });

    it('duplicate cells', async () => {

        /**
         * [A]──[B]──[D]
         *  │
         *  └───[C]──[D']
         *       │
         *       └───[E]
         */

        await testTopology({
            schema: [
                ['A', ['B', 'C']],
                ['B', ['D']],
                ['C', ['D', 'E']],
            ],
            expectedOrder: [
                'A', 'B', 'C', 'D', 'E',
            ],
        });

    });

    it('duplicate cells with children', async () => {

        /**
         * [A]──[B]──[D]──[G]
         *  │    │
         *  │    └───[E]
         *  │
         *  └───[C]──[F]──[B']
         *            │
         *            └───[H]
         */

        await testTopology({
            schema: [
                ['A', ['B', 'C']],
                ['B', ['D', 'E']],
                ['C', ['F']],
                ['D', ['G']],
                ['F', ['B', 'H']],
            ],
            expectedOrder: [
                'A', 'C', 'F', 'B', 'D', 'G', 'E', 'H',
            ],
        });

    });

    it('duplicate cells with children and same parent', async () => {

        /**
         * [A]──[B]──[D]
         *  │    │
         *  │    └───[E]
         *  │
         *  └───[C]
         *  │
         *  └───[B']
         */

        await testTopology({
            schema: [
                ['A', ['B', 'C', 'B']],
                ['B', ['D', 'E']],
            ],
            expectedOrder: [
                'A', 'B', 'D', 'E', 'C',
            ],
        });

    });

    it('cells with cycles', async () => {

        /**
         * [A]──[B]──[A]
         */

        const cells = createCells([
            ['A', ['B', 'A']],
        ]);

        await expect(indexCell(cells.A))
            .rejects.toThrow('Cycles are not allowed')
        ;

    });

});


//==============//
// TEST HELPERS //
//==============//

type CellsSchema = Array<
    [string, string[]]
>;

interface CellsIndex {
    [key: string]: CellType;
}

/**
 * Creates a nested structure of cells
 * according to the specified schema.
 */
function createCells(schema: CellsSchema): CellsIndex {

    const cells: CellsIndex = {};

    for (const [name, children] of schema) {
        getOrCreateCell(name, children);
    }

    function getOrCreateCell(
        name: string,
        children: string[] = []

    ): CellType {

        let cell: CellType;

        if (cells[name]) {
            cell = cells[name];
        } else {
            cell = new Cell();
            cell.bits.writeString(name);
            cells[name] = cell;
        }

        for (const childName of children) {
            cell.refs.push(
                getOrCreateCell(childName)
            );
        }

        return cell;

    }

    return cells;

}

function cellsToNames(
    cells: CellType[],
    cellsIndex: CellsIndex

): string[] {
    const list: string[] = [];
    for (const cell of cells) {
        const entry = Object.entries(cellsIndex)
            .find(([_, $cell]) => $cell === cell)
        ;
        if (entry) {
            const [name] = entry;
            list.push(name);
        } else {
            throw new Error(`Cell is not found in index`);
        }

    }
    return list;
}

async function testTopology(options: {
    schema: CellsSchema;
    expectedOrder: string[]
}) {

    const {
        schema,
        expectedOrder,

    } = options;

    const cells = createCells(schema);
    const cellsCount = Object.keys(cells).length;

    const {
        orderedCells: order,
        indexHashmap: hashmap,

    } = await indexCell(cells.A);

    // Checking if index length is equal
    // to the number of cells.
    expect(order).toHaveLength(cellsCount);
    expect(Object.keys(hashmap)).toHaveLength(cellsCount);

    // Checking if cells are in topological order
    expect(cellsToNames(order, cells))
        .toEqual(expectedOrder)
    ;

    // Checking if hash index is correct
    for (const cell of Object.values(cells)) {
        const cellHash = await cell.hashBase64();
        const topologicalIndex = order.indexOf(cell);
        expect(hashmap[cellHash]).toEqual(topologicalIndex);
    }

}
