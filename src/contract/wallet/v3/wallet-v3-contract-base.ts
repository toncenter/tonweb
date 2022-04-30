
import { Cell } from '../../../boc/cell/cell';
import { writeTimestampToSigningMessage } from '../common/signing';
import { WalletContract, WalletContractOptions } from '../wallet-contract';


export interface WalletV3ContractOptions extends WalletContractOptions {
    walletId?: number;
}


export class WalletV3ContractBase extends WalletContract<
    WalletV3ContractOptions
> {

    protected createSigningMessage(seqno?: number): Cell {
        seqno = (seqno || 0);
        const message = new Cell();
        message.bits.writeUint(this.options.walletId, 32);
        writeTimestampToSigningMessage(message, seqno);
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
