const {Cell} = require("../../boc");
const {
    Address,
    BN,
    base64ToBytes
} = require("../../utils");
const {WalletContract} = require("../wallet/WalletContract");

const WALLET_ID_BASE = 698983191;

class LockupWalletV1 extends WalletContract {

    /**
     * @param provider    {HttpProvider}
     * @param options {{publicKey?: Uint8Array, address?: Address | string, wc?: number, config: any}}
     *
     * Config json is {config}
     */
    constructor(provider, options) {
        // options.config:
        // {
        //     wallet_type: "lockup-0.1",
        //     config_pubkey: <base64-encoded pubkey>,
        //     allowed_destinations: [ "addr1", "addr2", ... ]
        // }

        options.code = Cell.oneFromBoc("B5EE9C7241021E01000261000114FF00F4A413F4BCF2C80B010201200203020148040501F2F28308D71820D31FD31FD31F802403F823BB13F2F2F003802251A9BA1AF2F4802351B7BA1BF2F4801F0BF9015410C5F9101AF2F4F8005057F823F0065098F823F0062071289320D74A8E8BD30731D4511BDB3C12B001E8309229A0DF72FB02069320D74A96D307D402FB00E8D103A4476814154330F004ED541D0202CD0607020120131402012008090201200F100201200A0B002D5ED44D0D31FD31FD3FFD3FFF404FA00F404FA00F404D1803F7007434C0C05C6C2497C0F83E900C0871C02497C0F80074C7C87040A497C1383C00D46D3C00608420BABE7114AC2F6C2497C338200A208420BABE7106EE86BCBD20084AE0840EE6B2802FBCBD01E0C235C62008087E4055040DBE4404BCBD34C7E00A60840DCEAA7D04EE84BCBD34C034C7CC0078C3C412040DD78CA00C0D0E00130875D27D2A1BE95B0C60000C1039480AF00500161037410AF0050810575056001010244300F004ED540201201112004548E1E228020F4966FA520933023BB9131E2209835FA00D113A14013926C21E2B3E6308003502323287C5F287C572FFC4F2FFFD00007E80BD00007E80BD00326000431448A814C4E0083D039BE865BE803444E800A44C38B21400FE809004E0083D10C06002012015160015BDE9F780188242F847800C02012017180201481B1C002DB5187E006D88868A82609E00C6207E00C63F04EDE20B30020158191A0017ADCE76A268699F98EB85FFC00017AC78F6A268698F98EB858FC00011B325FB513435C2C7E00017B1D1BE08E0804230FB50F620002801D0D3030178B0925B7FE0FA4031FA403001F001A80EDAA4");
        super(provider, options);
        if (!this.options.walletId) this.options.walletId = WALLET_ID_BASE + this.options.wc;

        this.methods.getPublicKey = this.getPublicKey.bind(this);
        this.methods.getWalletId = this.getWalletId.bind(this);
        this.methods.getLiquidBalance = this.getLiquidBalance.bind(this);
        this.methods.getNominalRestrictedBalance = this.getNominalRestrictedBalance.bind(this);
        this.methods.getNominalLockedBalance = this.getNominalLockedBalance.bind(this);
    }

    getName() {
        return 'lockup-0.1';
    }

    /**
     * @override
     * @private
     * @param   seqno?   {number}
     * @param   expireAt?: {number}
     * @param   withoutOp? {boolean}
     * @return {Cell}
     */
    createSigningMessage(seqno, expireAt, withoutOp) {
        seqno = seqno || 0;
        expireAt = expireAt || (Math.floor(Date.now() / 1e3) + 60);
        const message = new Cell();
        message.bits.writeUint(this.options.walletId, 32);
        if (seqno === 0) {
            // message.bits.writeInt(-1, 32);// todo: dont work
            for (let i = 0; i < 32; i++) {
                message.bits.writeBit(1);
            }
        } else {
            message.bits.writeUint(expireAt, 32);
        }
        message.bits.writeUint(seqno, 32);
        return message;
    }

    /**
     * @override
     * @return {Cell} cell contains wallet data
     */
    createDataCell() {
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

        // TODO: write config.config_public_key (need to sort out encoding - the params come in base64),
        // TODO: write the dict of allowed destinations (address is a key to an empty value).
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

    /**
     * @return {Promise<number>}
     */
    async getWalletId() {
        const myAddress = await this.getAddress();
        const id = await this.provider.call2(myAddress.toString(), 'get_subwallet_id');
        return id.toNumber();
    }

    /**
     * @return {Promise<BN>}
     */
    async getPublicKey() {
        const myAddress = await this.getAddress();
        return this.provider.call2(myAddress.toString(), 'get_public_key');
    }


    /**
     * @return {Promise<BN>} Amount of nanotoncoins that can be spent immediately.
     */
    async getLiquidBalance() {
        const balances = await this.getBalances();
        return balances[0] - balances[1] - balances[2];
    }

    /**
     * @return {Promise<BN>} Amount of nanotoncoins that can be spent after the timelock OR to the whitelisted addresses.
     */
    async getNominalRestrictedBalance() {
        return await this.getBalances()[1];
    }

    /**
     * @return {Promise<BN>} Amount of nanotoncoins that can be spent after the timelock only (whitelisted addresses not used).
     */
    async getNominalLockedBalance() {
        return await this.getBalances()[2];
    }

    /**
     * @return {Promise<[BN,BN,BN]>} Total amount of nanotoncoins on the contract,
     * nominal restricted value
     * nominal locked value
     */
    async getBalances() {
        const myAddress = await this.getAddress();
        return this.provider.call2(myAddress.toString(), 'get_balances');
    }
}

LockupWalletV1.WALLET_ID_BASE = WALLET_ID_BASE;

module.exports = {LockupWalletV1};
