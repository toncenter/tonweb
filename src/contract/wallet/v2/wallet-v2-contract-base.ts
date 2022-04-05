
import { Cell } from '../../../boc/cell/cell';
import { writeTimestampToSigningMessage } from '../common/signing';
import { WalletContract } from '../wallet-contract';


export class WalletV2ContractBase extends WalletContract {

    protected createSigningMessage(seqno?: number): Cell {
        seqno = (seqno || 0);
        const message = new Cell();
        message.bits.writeUint(seqno, 32);
        writeTimestampToSigningMessage(message, seqno);
        return message;
    }

}
