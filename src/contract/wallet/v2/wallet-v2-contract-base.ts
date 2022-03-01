
import { Cell } from '../../../boc/index';
import { WalletContract } from '../wallet-contract';


export class WalletV2ContractBase extends WalletContract {

    protected createSigningMessage(seqno?: number): Cell {
        seqno = seqno || 0;
        const message = new Cell();
        message.bits.writeUint(seqno, 32);
        if (seqno === 0) {
            // message.bits.writeInt(-1, 32);// todo: dont work
            for (let i = 0; i < 32; i++) {
                message.bits.writeBit(1);
            }
        } else {
            const date = new Date();
            const timestamp = Math.floor(date.getTime() / 1e3);
            message.bits.writeUint(timestamp + 60, 32);
        }
        return message;
    }

}
