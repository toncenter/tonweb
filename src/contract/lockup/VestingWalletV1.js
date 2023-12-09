const {Cell} = require("../../boc");
const {
    Address,
    BN, bytesToHex,
} = require("../../utils");
const {WalletContract} = require("../wallet/WalletContract");
const {parseAddress} = require("../token/nft/NftUtils");
const {Contract} = require("../index");

const WALLET_ID_BASE = 0x10C; // ATTENTION: need to be different with standard wallet id
const CODE_HEX = 'b5ee9c7241021c010003fb000114ff00f4a413f4bcf2c80b01020120030203b8f28308d71820d31fd31fd31f02f823bbf264ed44d0d31fd31fd3ff305abaf2a15033baf2a202f9014033f910f2a3f800db3c20d74ac0018e99ed44ed45ed47915bed67ed65ed648e82db3ced41edf101f2ff9130e2f841a4f861db3c1b1413020148110402012008050201200706020db9846db3cdb3c81b1a0129ba462db3cf845f846f847f848f849f84af84bf84481b0201200e090201620d0a02016a0c0b012fa2c76cf3e9100723281f2fff2743e112040423d029be84c61b000fa25fb513435c2c7e014bad346d9e36fc22470d4080847a4937d29910ce6903e9ff9837812801b7810148987159f318401b02016e100f0019af1df6a26840106b90eb858fc00019adce76a26840206b90eb85ffc003acd06c2220d749c160915be001d0d3030171b0915be0fa4030db3c01d31fd33ff84b5240c705238210a7733acdbab08ea46c12db3c8210f7733acd01708018c8cb055004cf1623fa0213cb6acb1fcb3fc98040fb00e30e1b141201cef84a5240c7050382107258a69bba13b08ed18e2c01fa407fc8ca0002fa4401c8ca07cbffc9d0f8441023810108f441f86420d74ac200209501d430d001deb312e68210f258a69b32708018c8cb055004cf1623fa0213cb6acb1fcb3fc98040fb00db3c925f03e2130066f848f847f846f845c8cb3fcb1fcb1fcb1ff849fa02f84acf16f84bcf16c9f844f843f842f841c8cb1fcb1fcbfff400ccc9ed54025cd307d4d1f823db3c20c2008e9b22c003f2e06421d0d303fa4031fa40f84a5220c705b3925f04e30d9130e201fb001a1503fa21fa4401c8ca07cbffc9d0f844810108f40a6fa1318f5f330172b0c002f2e06501fa003171d721fa0031fa0031d33f31d31f31d30001c000f2e066d3000193d430d0de2171db3c8e2a31d31f302082104e73744bba21821047657424bab121821056744370bab1018210566f7465bab1f2e067e30e70925f03e220c200191716000e9372fb029130e202ea0170db3c8e6d20d749c2008e63d31f21c00022830bbab122811001bab122821047d54391bab1228210595f07bcbab122821069fb306cbab1228210566f7465bab122821056744370bab1f2e06701c00021d749c200b08e15d3073020c06421c077b121c044b101c057b1f2e0689130e29130e2e30d1918001ad31f308210566f7465baf2e067004401fa4401c3ff925b70e001f833206e925b70e0d020d7498307b9925b70e0d70bffba0060f845f846a05210bc923070e0f845f848a05210b99330f849e0f849f849f84513a1f847a904f846f847a9041023a984a1007eed44d0d31f01f861d31f01f862d3ff01f863f40401f864d401d0d33f01f865d31f01f866d31f01f867d31f01f868fa0001f869fa4001f86afa4001f86bd1d10a20c6a7';

class VestingWalletV1 extends WalletContract {

    /**
     * @param provider    {HttpProvider}
     * @param options {{walletId?: number, publicKey?: Uint8Array, vestingStartTime?: number, vestingTotalDuration?:number, unlockPeriod?:number, cliffDuration?: number, vestingTotalAmount?: BN, vestingSenderAddress?: Address, ownerAddress?:Address, address?: Address | string, wc?: number}}
     */
    constructor(provider, options) {
        options.code = Cell.oneFromBoc(CODE_HEX);
        super(provider, options);
        if (!this.options.walletId) this.options.walletId = WALLET_ID_BASE + this.options.wc;

        this.methods.getPublicKey = this.getPublicKey.bind(this);
        this.methods.getWalletId = this.getWalletId.bind(this);
        this.methods.getLockedAmount = this.getLockedAmount.bind(this);
        this.methods.getVestingData = this.getVestingData.bind(this);
        this.methods.getWhitelist = this.getWhitelist.bind(this);
    }

    getName() {
        return 'vesting-1';
    }

    /**
     * @override
     * @private
     * @param   seqno?   {number}
     * @param   expireAt? {number}
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
        if (this.options.walletId !== 0 && !this.options.walletId) throw new Error('no walletId');
        if (!this.options.publicKey) throw new Error('no publicKey');
        if (!(this.options.publicKey instanceof Uint8Array)) throw new Error('publicKey not Uint8Array');
        if (this.options.vestingStartTime !== 0 && !this.options.vestingStartTime) throw new Error('no vestingStartTime');
        if (this.options.vestingTotalDuration <= 0) throw new Error('vestingTotalDuration cant be zero or negative');
        if (!this.options.vestingTotalDuration) throw new Error('no vestingTotalDuration');
        if (this.options.vestingTotalDuration > 2 ** 32 - 1) throw new Error('vestingTotalDuration > 2^32 - 1');
        if (this.options.unlockPeriod <= 0) throw new Error('unlockPeriod cant be zero or negative');
        if (!this.options.unlockPeriod) throw new Error('no unlockPeriod');
        if (this.options.unlockPeriod > this.options.vestingTotalDuration) throw new Error('unlockPeriod > vestingTotalDuration');
        if (this.options.cliffDuration !== 0 && (!this.options.cliffDuration)) throw new Error('no cliffDuration');
        if (this.options.cliffDuration < 0) throw new Error('cliffDuration cant be negative');
        if (this.options.cliffDuration >= this.options.vestingTotalDuration) throw new Error('cliffDuration >= vestingTotalDuration');
        const durationMod = new BN(this.options.vestingTotalDuration).div(new BN(this.options.unlockPeriod)).mul(new BN(this.options.unlockPeriod));
        if (!durationMod.eq(new BN(this.options.vestingTotalDuration))) throw new Error('vestingTotalDuration mod unlockPeriod != 0');
        const cliffMod = new BN(this.options.cliffDuration).div(new BN(this.options.unlockPeriod)).mul(new BN(this.options.unlockPeriod));
        if (!cliffMod.eq(new BN(this.options.cliffDuration))) throw new Error('cliffDuration mod unlockPeriod != 0');
        if (!this.options.vestingTotalAmount) throw new Error('no vestingTotalAmount');
        if (!this.options.vestingTotalAmount.gt(new BN(0))) throw new Error('vestingTotalAmount cant be zero');
        if (!this.options.vestingSenderAddress) throw new Error('no vestingSenderAddress');
        if (!(this.options.vestingSenderAddress instanceof Address)) throw new Error('vestingSenderAddress not Address');
        if (!this.options.ownerAddress) throw new Error('no ownerAddress');
        if (!(this.options.ownerAddress instanceof Address)) throw new Error('ownerAddress not Address');

        const cell = new Cell();
        cell.bits.writeUint(0, 32); // seqno
        cell.bits.writeUint(this.options.walletId, 32); // subwallet_id
        cell.bits.writeUint(new BN(bytesToHex(this.options.publicKey), 16), 256); // public_key
        cell.bits.writeBit(false); // empty whitelist

        const vestingCell = new Cell();
        vestingCell.bits.writeUint(this.options.vestingStartTime, 64);
        vestingCell.bits.writeUint(this.options.vestingTotalDuration, 32);
        vestingCell.bits.writeUint(this.options.unlockPeriod, 32);
        vestingCell.bits.writeUint(this.options.cliffDuration, 32);
        vestingCell.bits.writeCoins(this.options.vestingTotalAmount);
        vestingCell.bits.writeAddress(new Address(this.options.vestingSenderAddress));
        vestingCell.bits.writeAddress(new Address(this.options.ownerAddress));

        cell.refs[0] = vestingCell;

        return cell;
    }

    /**
     * @param params {{ addresses: Address[], queryId?: number }}
     * @return {Cell}
     */
    createAddWhitelistBody(params) {
        const {addresses, queryId} = params;
        const root = new Cell();
        root.bits.writeUint(0x7258a69b, 32) // op
        root.bits.writeUint(queryId || 0, 64) // query_id;
        root.bits.writeAddress(addresses[0]);

        let cell = null;

        for (let i = addresses.length - 1; i >= 1; i--) {
            const newCell = new Cell();
            newCell.bits.writeAddress(addresses[i]);

            if (cell) {
                newCell.refs[0] = cell;
            }

            cell = newCell;
        }

        if (cell) {
            root.refs[0] = cell;
        }

        return root;
    }

    /**
     * @param params {{address: Address | string, amount: BN, payload: string | Uint8Array | Cell, sendMode?: number, queryId?: number}}
     * @return {Cell}
     */
    createInternalTransfer(params) {
        const message = new Cell();
        message.bits.writeUint(0xa7733acd, 32);
        message.bits.writeUint(params.queryId || 0, 64) // query_id;
        message.bits.writeUint8(params.sendMode || 3); // send_mode
        message.refs.push(Contract.createOutMsg(params.address, params.amount, params.payload));
        return message;
    }

    /**
     * @return {Promise<BN>}
     */
    async getPublicKey() {
        const myAddress = await this.getAddress();
        return this.provider.call2(myAddress.toString(), 'get_public_key');
    }

    /**
     * @return {Promise<number>}
     */
    async getWalletId() {
        const myAddress = await this.getAddress();
        return this.provider.call2(myAddress.toString(), 'get_subwallet_id');
    }

    /**
     * @param time  {number} unixtime
     * @return {Promise<BN>}
     */
    async getLockedAmount(time) {
        const myAddress = await this.getAddress();
        return this.provider.call2(myAddress.toString(), 'get_locked_amount', [['num', time]]);
    }

    /**
     * @return {Promise<{vestingStartTime: number, vestingTotalDuration: number, unlockPeriod: number, cliffDuration: number, vestingTotalAmount: BN, vestingSenderAddress: Address, ownerAddress: Address, whitelistCell: Cell}>}
     */
    async getVestingData() {
        const myAddress = await this.getAddress();
        const result = await this.provider.call2(myAddress.toString(), 'get_vesting_data');
        const vestingStartTime = result[0].toNumber();
        const vestingTotalDuration = result[1].toNumber();
        const unlockPeriod = result[2].toNumber();
        const cliffDuration = result[3].toNumber();
        const vestingTotalAmount = result[4];
        const vestingSenderAddress = parseAddress(result[5]);
        const ownerAddress = parseAddress(result[6]);
        const whitelistCell = result[7];

        return {
            vestingStartTime,
            vestingTotalDuration,
            unlockPeriod,
            cliffDuration,
            vestingTotalAmount,
            vestingSenderAddress,
            ownerAddress,
            whitelistCell,
        };
    }

    /**
     * @return {Promise<Address[]>}
     */
    async getWhitelist() {
        const myAddress = await this.getAddress();
        const list = await this.provider.call2(myAddress.toString(), 'get_whitelist');
        const addresses = [];
        for (const tuple of list) {
            if (tuple.length !== 2) throw new Error('invalid whitelist result');
            const wc = tuple[0];
            const hash = tuple[1];
            const address = new Address(wc.toString(10) + ':' + hash.toString(16).padStart(64, '0'));
            addresses.push(address);
        }
        return addresses;
    }
}

VestingWalletV1.WALLET_ID_BASE = WALLET_ID_BASE;
VestingWalletV1.codeHex = CODE_HEX;

module.exports = {VestingWalletV1: VestingWalletV1};
