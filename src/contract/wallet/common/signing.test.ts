
import TonWeb from '__tonweb__';

import { jest } from '@jest/globals';

const { Cell } = TonWeb.boc;

import { writeTimestampToSigningMessage } from './signing';


describe('writeTimestampToSigningMessage()', () => {

    it('seqno = 0', () => {
        const cell = new Cell();
        writeTimestampToSigningMessage(cell, 0);
        expect(cell.bits.toString()).toEqual('FFFFFFFF');
    });

    it('seqno > 0', () => {
        const cell = new Cell();
        writeTimestampToSigningMessage(cell, 1);
        expect(cell.bits.toString()).toEqual('0000003C');
    });

    it('seqno > 0, custom time', () => {
        (jest.useFakeTimers()
            .setSystemTime(new Date('1989-08-16T17:00:00Z'))
        );
        const cell = new Cell();
        writeTimestampToSigningMessage(cell, 1);
        expect(cell.bits.toString()).toEqual('24E99DCC');
    });

});
