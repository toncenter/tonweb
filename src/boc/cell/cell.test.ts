
import TonWeb from '__tonweb__';

const { Cell } = TonWeb.boc;


describe('Cell', () => {

    it(
        'cells with the same content ' +
        'should have equal hash', async () =>
        {
            const cell1 = new Cell();
            cell1.bits.writeString('Hello');

            const cell2 = new Cell();
            cell2.bits.writeString('Hello');

            expect(await cell1.hash())
                .toEqual(await cell2.hash())
            ;

        }
    );

});
