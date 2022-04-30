
import { jest } from '@jest/globals';

import { Cell } from '../../../boc/cell/cell';
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
