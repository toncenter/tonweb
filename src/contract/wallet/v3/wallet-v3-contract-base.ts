
import { Cell } from '../../../boc/cell';
import { WalletContract, WalletContractOptions } from '../wallet-contract';


export interface WalletV3ContractOptions extends WalletContractOptions {
    walletId?: number;
}


export class WalletV3ContractBase extends WalletContract<
    WalletV3ContractOptions
> {

    protected createSigningMessage(seqno?: number): Cell {
        seqno = seqno || 0;
        const message = new Cell();
        message.bits.writeUint(this.options.walletId, 32);
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
        message.bits.writeUint(seqno, 32);
        return message;
    }

    protected createDataCell(): Cell {
        const cell = new Cell();
        cell.bits.writeUint(0, 32);
        cell.bits.writeUint(this.options.walletId, 32);
        cell.bits.writeBytes(this.options.publicKey);
        return cell;
    }

}
