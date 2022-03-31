
import BN from 'bn.js';

import { Cell } from '../../boc/cell';
import { HttpProvider } from '../../http-provider/http-provider';
import { base64ToBytes } from '../../utils/base64';
import { expectArray, expectBN } from '../../utils/type-guards';
import { writeTimestampToSigningMessage } from '../wallet/common/signing';
import { WalletContract, WalletContractMethods, WalletContractOptions } from '../wallet/wallet-contract';


export interface LockupWalletV1Options extends WalletContractOptions {
    walletId?: number;
    config?: LockupWalletV1Config;
}

export interface LockupWalletV1Methods extends WalletContractMethods {
    getPublicKey: () => Promise<BN>;
    getWalletId: () => Promise<number>;
    getLiquidBalance: () => Promise<BN>;
    getNominalRestrictedBalance: () => Promise<BN>;
    getNominalLockedBalance: () => Promise<BN>;
}

export interface LockupWalletV1Config {

    wallet_type: 'lockup-0.1';

    /**
     * BASE64-encoded public key.
     */
    config_public_key: string;

    /**
     * Dictionary with allowed address destinations
     * as BASE64-encoded string, where key is address
     * and the value must be empty.
     */
    allowed_destinations: string;

}


const walletIdBase = 698983191;


export class LockupWalletV1 extends WalletContract<
    LockupWalletV1Options,
    LockupWalletV1Methods
> {

    constructor(provider: HttpProvider, options) {

        options.code = Cell.oneFromBoc(
            'B5EE9C7241021E01000261000114FF00F4A413F4BCF2C80B010201200203020148040501F2F28308D71820D31FD31FD31F802403F823BB13F2F2F003802251A9BA1AF2F4802351B7BA1BF2F4801F0BF9015410C5F9101AF2F4F8005057F823F0065098F823F0062071289320D74A8E8BD30731D4511BDB3C12B001E8309229A0DF72FB02069320D74A96D307D402FB00E8D103A4476814154330F004ED541D0202CD0607020120131402012008090201200F100201200A0B002D5ED44D0D31FD31FD3FFD3FFF404FA00F404FA00F404D1803F7007434C0C05C6C2497C0F83E900C0871C02497C0F80074C7C87040A497C1383C00D46D3C00608420BABE7114AC2F6C2497C338200A208420BABE7106EE86BCBD20084AE0840EE6B2802FBCBD01E0C235C62008087E4055040DBE4404BCBD34C7E00A60840DCEAA7D04EE84BCBD34C034C7CC0078C3C412040DD78CA00C0D0E00130875D27D2A1BE95B0C60000C1039480AF00500161037410AF0050810575056001010244300F004ED540201201112004548E1E228020F4966FA520933023BB9131E2209835FA00D113A14013926C21E2B3E6308003502323287C5F287C572FFC4F2FFFD00007E80BD00007E80BD00326000431448A814C4E0083D039BE865BE803444E800A44C38B21400FE809004E0083D10C06002012015160015BDE9F780188242F847800C02012017180201481B1C002DB5187E006D88868A82609E00C6207E00C63F04EDE20B30020158191A0017ADCE76A268699F98EB85FFC00017AC78F6A268698F98EB858FC00011B325FB513435C2C7E00017B1D1BE08E0804230FB50F620002801D0D3030178B0925B7FE0FA4031FA403001F001A80EDAA4'
        );

        super(provider, options);

        if (!this.options.walletId) {
            this.options.walletId = (walletIdBase + this.options.wc);
        }

        this.methods.getPublicKey = (
            () => this.getPublicKey()
        );
        this.methods.getWalletId = (
            () => this.getWalletId()
        );
        this.methods.getLiquidBalance = (
            () => this.getLiquidBalance()
        );
        this.methods.getNominalRestrictedBalance = (
            () => this.getNominalRestrictedBalance()
        );
        this.methods.getNominalLockedBalance = (
            () => this.getNominalLockedBalance()
        );

    }

    public getName(): string {
        return 'lockup-0.1';
    }

    public async getPublicKey(): Promise<BN> {
        const myAddress = await this.getAddress();
        const result = await this.provider.call2(
            myAddress.toString(),
            'get_public_key'
        );
        return expectBN(result);
    }

    public async getWalletId(): Promise<number> {
        const myAddress = await this.getAddress();
        const id = await this.provider.call2(
            myAddress.toString(),
            'get_subwallet_id'
        );
        return expectBN(id).toNumber();
    }

    /**
     * Returns amount of nanograms that can be spent immediately.
     */
    public async getLiquidBalance(): Promise<BN> {
        const [total, restricted, locked] = await this.getBalances();
        return total.sub(restricted).sub(locked);
    }

    /**
     * Returns amount of nanograms that can be spent after
     * the timelock OR to the whitelisted addresses.
     */
    public async getNominalRestrictedBalance(): Promise<BN> {
        return (await this.getBalances())[1];
    }

    /**
     * Returns amount of nanograms that can be spent after
     * the timelock only (whitelisted addresses not used).
     */
    public async getNominalLockedBalance(): Promise<BN> {
        return (await this.getBalances())[2];
    }

    /**
     * Returns total amount of nanograms on the contract,
     * nominal restricted value and nominal locked value.
     */
    public async getBalances(): Promise<[BN, BN, BN]> {
        const myAddress = await this.getAddress();
        const result = await this.provider.call2(
            myAddress.toString(),
            'get_balances'
        );
        const numbers = expectArray<BN>(result);
        return [
            expectBN(numbers[0]),
            expectBN(numbers[1]),
            expectBN(numbers[2]),
        ];
    }


    /**
     * Returns cell that contains wallet data.
     */
    protected createDataCell() {

        // from restricted.fc:
        // .store_int(seqno, 32)
        // .store_int(subwallet_id, 32)
        // .store_uint(public_key, 256)
        // .store_uint(config_public_key, 256)
        // .store_dict(allowed_destinations)
        // .store_grams(total_locked_value)
        // .store_dict(locked)
        // .store_grams(total_restricted_value)
        // .store_dict(restricted).end_cell();

        const cell = new Cell();

        cell.bits.writeUint(0, 32); // seqno
        cell.bits.writeUint(this.options.walletId, 32);
        cell.bits.writeBytes(this.options.publicKey);

        // @todo: write config.config_public_key
        //        (need to sort out encoding - the params come in base64),

        // @todo: write the dict of allowed destinations
        //        (address is a key to an empty value).

        cell.bits.writeBytes(base64ToBytes(this.options.config.config_public_key));
        if (this.options.config.allowed_destinations) {
            cell.bits.writeUint(1, 1);
            cell.refs.push(Cell.oneFromBoc(base64ToBytes(this.options.config.allowed_destinations)));
        } else {
            cell.bits.writeUint(0, 1);
        }

        cell.bits.writeGrams(0);   // .store_grams(total_locked_value)
        cell.bits.writeUint(0, 1); // empty locked dict
        cell.bits.writeGrams(0);   // .store_grams(total_restricted_value)
        cell.bits.writeUint(0, 1); // empty locked dict

        return cell;

    }

    protected createSigningMessage(
        seqno?: number,
        withoutOp?: boolean

    ): Cell {

        seqno = (seqno || 0);
        const message = new Cell();
        message.bits.writeUint(this.options.walletId, 32);
        writeTimestampToSigningMessage(message, seqno);
        message.bits.writeUint(seqno, 32);

        return message;

    }

}
