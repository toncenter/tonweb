
import BN from 'bn.js';

import { Cell } from '../../../boc/index';
import { WalletContract, WalletContractMethods, WalletContractOptions } from '../wallet-contract';


export interface WalletV4ContractOptions extends WalletContractOptions {
    walletId?: number;
}

export interface WalletV4ContractMethods extends WalletContractMethods {
    getPublicKey: () => Promise<BN>;
}


export class WalletV4ContractBase<
    WalletType extends WalletV4ContractOptions = WalletV4ContractOptions,
    MethodsType extends WalletV4ContractMethods = WalletV4ContractMethods

> extends WalletContract<WalletType, MethodsType> {

    public async getPublicKey(): Promise<BN> {
        const myAddress = await this.getAddress();
        return this.provider.call2(myAddress.toString(), 'get_public_key');
    }


    protected createSigningMessage(seqno?: number, withoutOp?: boolean): Cell {
        seqno = (seqno || 0);
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
        if (!withoutOp) {
            message.bits.writeUint(0, 8); // op
        }
        return message;
    }

    protected createDataCell(): Cell {
        const cell = new Cell();
        cell.bits.writeUint(0, 32); // seqno
        cell.bits.writeUint(this.options.walletId, 32);
        cell.bits.writeBytes(this.options.publicKey);
        cell.bits.writeUint(0, 1); // plugins dict empty
        return cell;
    }

}
