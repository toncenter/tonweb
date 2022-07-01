const {Contract} = require("../index");
const {Cell} = require("../../boc");
const {nacl, hexToBytes, BN} = require("../../utils");
const {parseAddress} = require("../token/nft/NftUtils");
const {
    writePublicKey,
    writeSignature,
    createSignatureCell,
    tag_init,
    tag_cooperative_close,
    tag_cooperative_commit,
    tag_start_uncooperative_close,
    tag_challenge_state,
    tag_settle_conditionals,
    tag_state,
    op_top_up_balance,
    op_init_channel,
    op_cooperative_close,
    op_cooperative_commit,
    op_start_uncooperative_close,
    op_challenge_quarantined_state,
    op_settle_conditionals,
    op_finish_uncooperative_close,
    op_channel_closed,
    createTopUpBalance,
    createInitChannelBody,
    createCooperativeCloseChannelBody,
    createCooperativeCommitBody,
    createConditionalPayment,
    createSemiChannelBody,
    createSemiChannelState,
    createSignedSemiChannelState,
    createStartUncooperativeCloseBody,
    createChallengeQuarantinedStateBody,
    createSettleConditionalsBody,
    createFinishUncooperativeClose,
    createOneSignature,
    createTwoSignature
} = require("./PaymentUtils");

const PAYMENT_CHANNEL_CODE_HEX = 'B5EE9C72410230010007FB000114FF00F4A413F4BCF2C80B0102012002030201480405000AF26C21F0190202CB06070201202E2F020120080902012016170201200A0B0201200C0D0009D3610F80CC001D6B5007434C7FE8034C7CC1BC0FE19E0201580E0F0201201011002D3E11DBC4BE11DBC43232C7FE11DBC47E80B2C7F2407320008B083E1B7B51343480007E187E80007E18BE80007E18F4FFC07E1934FFC07E1974DFC07E19BC01887080A7F4C7C07E1A34C7C07E1A7D01007E1AB7807080E535007E1AF7BE1B2002012012130201201415008D3E13723E11BE117E113E10540132803E10BE80BE10FE8084F2FFC4B2FFF2DFFC02887080A7FE12BE127E121400F2C7C4B2C7FD0037807080E53E12C073253E1333C5B8B27B5520004D1C3C02FE106CFCB8193E803E800C3E1096283E18BE10C0683E18FE10BE10E8006EFCB819BC032000CF1D3C02FE106CFCB819348020C235C6083E4040E4BE1124BE117890CC3E443CB81974C7C060841A5B9A5D2EBCB81A3E118074DFD66EBCB81CBE803E800C3E1094882FBE10D4882FAC3CB819807E18BE18FE12F43E800C3E10BE10E80068006E7CB8199FFE187C0320004120843777222E9C20043232C15401B3C594013E808532DA84B2C7F2DFF2407EC02002012018190201D42B2C0201201A1B0201201E1F0201201C1D00E5473F00BD401D001D401D021F90102D31F01821043436D74BAF2E068F84601D37F59BAF2E072F844544355F910F8454330F910B0F2E065D33FD33F30F84822B9F84922B9B0F2E06C21F86820F869F84A6E915B8E19F84AD0D33FFA003171D721D33F305033BC02BCB1936DF86ADEE2F800F00C8006F3E12F43E800C7E903E900C3E09DBC41CBE10D62F24CC20C1B7BE10FE11963C03FE10BE11A04020BC03DC3E185C3E189C3E18DB7E1ABC032000B51D3C02F5007400750074087E4040B4C7C0608410DB1BDCEEBCB81A3E118074DFD66EBCB81CBE111510D57E443E1150CC3E442C3CB8197E80007E18BE80007E18F4CFF4CFCC3E1208AE7E1248AE6C3CB81B007E1A3E1A7E003C042001C1573F00BF84A6EF2E06AD2008308D71820F9012392F84492F845E24130F910F2E065D31F018210556E436CBAF2E068F84601D37F59BAF2E072D401D08308D71820F901F8444130F910F2E06501D430D08308D71820F901F8454130F910F2E06501820020120222301FED31F01821043685374BAF2E068F84601D37F59BAF2E072D33FFA00F404552003D200019AD401D0D33FFA00F40430937F206DE2303205D31F01821043685374BAF2E068F84601D37F59BAF2E072D33FFA00F404552003D200019AD401D0D33FFA00F40430937F206DE23032F8485280BEF8495250BEB0524BBE1AB0527ABE19210064B05215BE14B05248BE17B0F2E06970F82305C8CB3F5004FA0215F40015CB3F5004FA0212F400CB1F12CA00CA00C9F86AF00C01C31CFC02FE129BACFCB81AF48020C235C6083E4048E4BE1124BE1178904C3E443CB81974C7C0608410DA19D46EBCB81A3E118074DFD66EBCB81CB5007420C235C6083E407E11104C3E443CB81940750C3420C235C6083E407E11504C3E443CB81940602403F71CFC02FE129BACFCB81AF48020C235C6083E4048E4BE1124BE1178904C3E443CB81974C7C0608410DB10DBAEBCB81A3E118074DFD66EBCB81CBD010C3E12B434CFFE803D0134CFFE803D0134C7FE11DBC4148828083E08EE7CB81BBE11DBC4A83E08EF3CB81C34800C151D5A64D6D4C8F7A2B98E82A49B08B8C3816028292A01FCD31F01821043685374BAF2E068F84601D37F59BAF2E072D33FFA00F404552003D200019AD401D0D33FFA00F40430937F206DE2303205D31F01821043685374BAF2E068F84601D37F59BAF2E072D33FFA00F404552003D200019AD401D0D33FFA00F40430937F206DE230325339BE5381BEB0F8495250BEB0F8485290BEB02502FE5237BE16B05262BEB0F2E06927C20097F84918BEF2E0699137E222C20097F84813BEF2E0699132E2F84AD0D33FFA00F404D33FFA00F404D31FF8476F105220A0F823BCF2E06FD200D20030B3F2E073209C3537373A5274BC5263BC12B18E11323939395250BC5299BC18B14650134440E25319BAB3F2E06D9130E30D7F05C82627002496F8476F1114A098F8476F1117A00603E203003ECB3F5004FA0215F40012CB3F5004FA0213F400CB1F12CA00CA00C9F86AF00C00620A8020F4966FA5208E213050038020F4666FA1208E1001FA00ED1E15DA119450C3A00B9133E2923430E202926C21E2B31B000C3535075063140038C8CB3F5004FA0212F400CB3F5003FA0213F400CB1FCA00C9F86AF00C00D51D3C02FE129BACFCB81AFE12B434CFFE803D010C74CFFE803D010C74C7CC3E11DBC4283E11DBC4A83E08EE7CB81C7E003E10886808E87E18BE10D400E816287E18FE10F04026BE10BE10E83E189C3E18F7BE10B04026BE10FE10A83E18DC3E18F780693E1A293E1A7C042001F53B7EF4C7C8608419F1F4A06EA4CC7C037808608403818830AEA54C7C03B6CC780C882084155DD61FAEA54C3C0476CC780820841E6849BBEEA54C3C04B6CC7808208407C546B3EEA54C3C0576CC780820840223AA8CAEA54C3C05B6CC7808208419BDBC1A6EA54C3C05F6CC780C60840950CAA46EA53C0636CC78202D0008840FF2F00075BC7FE3A7805FC25E87D007D207D20184100D0CAF6A1EC7C217C21B7817C227C22B7817C237C23FC247C24B7817C2524C3B7818823881B22A021984008DBD0CABA7805FC20C8B870FC253748B8F07C256840206B90FD0018C020EB90FD0018B8EB90E98F987C23B7882908507C11DE491839707C23B788507C23B789507C11DE48B9F03A4331C4966';

class PaymentChannel extends Contract {

    /**
     * @param provider  {HttpProvider}
     * @param options   {{isA: boolean, channelId: BN, myKeyPair: nacl.SignKeyPair, hisPublicKey: Uint8Array, initBalanceA: BN, initBalanceB: BN, addressA: Address, addressB: Address, closingConfig?: {quarantineDuration: number, misbehaviorFine: BN, conditionalCloseDuration: number}, excessFee?: BN}}
     */
    constructor(provider, options) {
        options.publicKeyA = options.isA ? options.myKeyPair.publicKey : options.hisPublicKey;
        options.publicKeyB = !options.isA ? options.myKeyPair.publicKey : options.hisPublicKey;

        options.wc = options.wc || 0;
        options.code = options.code || Cell.oneFromBoc(PAYMENT_CHANNEL_CODE_HEX);
        super(provider, options);
    }

    /**
     * @override
     * @private
     * @return {Cell} cell contains payment channel data
     */
    createDataCell() {
        const cell = new Cell();
        cell.bits.writeBit(0); // inited
        cell.bits.writeCoins(0); // balance_A
        cell.bits.writeCoins(0); // balance_B
        writePublicKey(cell, this.options.publicKeyA); // key_A
        writePublicKey(cell, this.options.publicKeyB); // key_B
        cell.bits.writeUint(this.options.channelId, 128); // channel_id

        const closingConfig = new Cell();
        closingConfig.bits.writeUint(this.options.closingConfig?.quarantineDuration || 0, 32); // quarantin_duration
        closingConfig.bits.writeCoins(this.options.closingConfig?.misbehaviorFine || new BN(0)); // misbehavior_fine
        closingConfig.bits.writeUint(this.options.closingConfig?.conditionalCloseDuration || 0, 32); // conditional_close_duration
        cell.refs[0] = closingConfig;

        cell.bits.writeUint(0, 32); // commited_seqno_A
        cell.bits.writeUint(0, 32); // commited_seqno_B
        cell.bits.writeBit(false); // quarantin ref

        const paymentConfig = new Cell();
        paymentConfig.bits.writeCoins(this.options.excessFee || new BN(0)); // excess_fee
        paymentConfig.bits.writeAddress(this.options.addressA); // addr_A
        paymentConfig.bits.writeAddress(this.options.addressB); // addr_B
        cell.refs[1] = paymentConfig;

        return cell;
    }

    /**
     * @private
     * @param op    {number}
     * @param cellForSigning    {Cell}
     * @returns {Promise<{cell: Cell, signature: Uint8Array}>}
     */
    async createOneSignature(op, cellForSigning) {
        const signature = nacl.sign.detached(await cellForSigning.hash(), this.options.myKeyPair.secretKey);

        const cell = createOneSignature({
            op,
            isA: this.options.isA,
            signature,
            cell: cellForSigning
        });

        return {cell, signature};
    }

    /**
     * @private
     * @param op    {number}
     * @param hisSignature {Uint8Array}
     * @param cellForSigning    {Cell}
     * @returns {Promise<{cell: Cell, signature: Uint8Array}>}
     */
    async createTwoSignature(op, hisSignature, cellForSigning) {
        const signature = nacl.sign.detached(await cellForSigning.hash(), this.options.myKeyPair.secretKey);

        const signatureA = this.options.isA ? signature : hisSignature;
        const signatureB = !this.options.isA ? signature : hisSignature;

        const cell = createTwoSignature({
            op,
            signatureA,
            signatureB,
            cell: cellForSigning
        });

        return {cell, signature};
    }

    /**
     * @param params    {{coinsA: BN, coinsB: BN}}
     * @returns {Promise<Cell>}
     */
    async createTopUpBalance(params) {
        return createTopUpBalance(params);
    }

    /**
     * @param params    {{balanceA: BN, balanceB: BN}}
     * @returns {Promise<{cell: Cell, signature: Uint8Array}>}
     */
    async createInitChannel(params) {
        return this.createOneSignature(
            op_init_channel,
            createInitChannelBody({...params, channelId: this.options.channelId})
        );
    }

    /**
     * @param params    {{hisSignature?: Uint8Array, balanceA: BN, balanceB: BN, seqnoA: BN, seqnoB: BN}}
     * @returns {Promise<{cell: Cell, signature: Uint8Array}>}
     */
    async createCooperativeCloseChannel(params) {
        if (!params.hisSignature) {
            params.hisSignature = new Uint8Array(512 / 8);
        }
        return this.createTwoSignature(
            op_cooperative_close,
            params.hisSignature,
            createCooperativeCloseChannelBody({...params, channelId: this.options.channelId})
        )
    }

    /**
     * @param params    {{hisSignature?: Uint8Array, seqnoA: BN, seqnoB: BN}}
     * @returns {Promise<{cell: Cell, signature: Uint8Array}>}
     */
    async createCooperativeCommit(params) {
        if (!params.hisSignature) {
            params.hisSignature = new Uint8Array(512 / 8);
        }
        return this.createTwoSignature(
            op_cooperative_commit,
            params.hisSignature,
            createCooperativeCommitBody({...params, channelId: this.options.channelId})
        )
    }

    /**
     * @private
     * @param params    {{mySeqno: BN, mySentCoins: BN, hisSeqno?: BN, hisSentCoins?: BN}}
     * @returns {Promise<{cell: Cell, signature: Uint8Array}>}
     */
    async createSignedSemiChannelState(params) {
        const state = createSemiChannelState({
            channelId: this.options.channelId,
            semiChannelBody: createSemiChannelBody({
                seqno: params.mySeqno,
                sentCoins: params.mySentCoins,
                conditionals: null
            }),
            counterpartySemiChannelBody: params.hisSeqno === undefined ? null : createSemiChannelBody({
                seqno: params.hisSeqno,
                sentCoins: params.hisSentCoins,
                conditionals: null
            }),
        });
        const signature = nacl.sign.detached(await state.hash(), this.options.myKeyPair.secretKey);
        const cell = createSignedSemiChannelState({signature, state});
        return {cell, signature};
    }

    /**
     * @param params    {{balanceA: BN, balanceB: BN, seqnoA: BN, seqnoB: BN}}
     * @returns {Promise<Uint8Array>} signature
     */
    async signState(params) {
        const mySeqno = this.options.isA ? params.seqnoA : params.seqnoB;
        const hisSeqno = !this.options.isA ? params.seqnoA : params.seqnoB;

        const sentCoinsA = this.options.initBalanceA.gt(params.balanceA) ? this.options.initBalanceA.sub(params.balanceA) : new BN(0);
        const sentCoinsB = this.options.initBalanceB.gt(params.balanceB) ? this.options.initBalanceB.sub(params.balanceB) : new BN(0);

        const mySentCoins = this.options.isA ? sentCoinsA : sentCoinsB;
        const hisSentCoins = !this.options.isA ? sentCoinsA : sentCoinsB;

        const {cell, signature} = await this.createSignedSemiChannelState({
            mySeqno,
            mySentCoins,
            hisSeqno,
            hisSentCoins
        });

        return signature;
    }

    /**
     * @param params    {{balanceA: BN, balanceB: BN, seqnoA: BN, seqnoB: BN}}
     * @param hisSignature  {Uint8Array}
     * @returns {Promise<boolean>}
     */
    async verifyState(params, hisSignature) {
        const mySeqno = !this.options.isA ? params.seqnoA : params.seqnoB;
        const hisSeqno = this.options.isA ? params.seqnoA : params.seqnoB;

        const sentCoinsA = this.options.initBalanceA.gt(params.balanceA) ? this.options.initBalanceA.sub(params.balanceA) : new BN(0);
        const sentCoinsB = this.options.initBalanceB.gt(params.balanceB) ? this.options.initBalanceB.sub(params.balanceB) : new BN(0);

        const mySentCoins = !this.options.isA ? sentCoinsA : sentCoinsB;
        const hisSentCoins = this.options.isA ? sentCoinsA : sentCoinsB;

        const state = createSemiChannelState({
            channelId: this.options.channelId,
            semiChannelBody: createSemiChannelBody({
                seqno: mySeqno,
                sentCoins: mySentCoins,
                conditionals: null
            }),
            counterpartySemiChannelBody: hisSeqno === undefined ? null : createSemiChannelBody({
                seqno: hisSeqno,
                sentCoins: hisSentCoins,
                conditionals: null
            }),
        });
        const hash = await state.hash();
        return nacl.sign.detached.verify(hash, hisSignature, this.options.isA ? this.options.publicKeyB : this.options.publicKeyA);
    }

    /**
     * @param params    {{balanceA: BN, balanceB: BN, seqnoA: BN, seqnoB: BN}}
     * @return {Uint8Array} signature
     */
    async signClose(params) {
        const {cell, signature} = await this.createCooperativeCloseChannel(params);
        return signature;
    }

    /**
     * @param params    {{balanceA: BN, balanceB: BN, seqnoA: BN, seqnoB: BN}}
     * @param hisSignature {Uint8Array}
     * @return {boolean}
     */
    async verifyClose(params, hisSignature) {
        const cell = await createCooperativeCloseChannelBody({...params, channelId: this.options.channelId});
        const hash = await cell.hash();
        return nacl.sign.detached.verify(hash, hisSignature, this.options.isA ? this.options.publicKeyB : this.options.publicKeyA);
    }

    /**
     * @param params    {{signedSemiChannelStateA: Cell, signedSemiChannelStateB: Cell}} `signedSemiChannelState` created by `createSignedSemiChannelState`
     * @returns {Promise<{cell: Cell, signature: Uint8Array}>}
     */
    async createStartUncooperativeClose(params) {
        return this.createOneSignature(
            op_start_uncooperative_close,
            createStartUncooperativeCloseBody({...params, channelId: this.options.channelId})
        );
    }

    /**
     * @param params   {{signedSemiChannelStateA: Cell, signedSemiChannelStateB: Cell}} `signedSemiChannelState` created by `createSignedSemiChannelState`
     * @returns {Promise<{cell: Cell, signature: Uint8Array}>}
     */
    async createChallengeQuarantinedState(params) {
        return this.createOneSignature(
            op_challenge_quarantined_state,
            createChallengeQuarantinedStateBody({...params, channelId: this.options.channelId})
        );
    }

    /**
     * @param params    {{conditionalsToSettle: Cell | null}} dictionary with uint32 keys and values created by `createConditionalPayment`
     * @returns {Promise<{cell: Cell, signature: Uint8Array}>}
     */
    async createSettleConditionals(params) {
        return this.createOneSignature(
            op_settle_conditionals,
            createSettleConditionalsBody({...params, channelId: this.options.channelId})
        );
    }

    /**
     * @returns {Promise<Cell>}
     */
    async createFinishUncooperativeClose() {
        return createFinishUncooperativeClose();
    }

    static STATE_UNINITED = 0;
    static STATE_OPEN = 1;
    static STATE_CLOSURE_STARTED = 2;
    static STATE_SETTLING_CONDITIONALS = 3;
    static STATE_AWAITING_FINALIZATION = 4;

    /**
     * @returns {Promise<number>}
     */
    async getChannelState() {
        const myAddress = await this.getAddress();
        const result = await this.provider.call2(myAddress.toString(), 'get_channel_state', []);
        return result.toNumber();
    }

    /**
     * @returns {Promise<{state: number, balanceA: BN, balanceB: BN, publicKeyA: Uint8Array, publicKeyB: Uint8Array, channelId: BN, quarantineDuration: number, misbehaviorFine: BN, conditionalCloseDuration: number, seqnoA: BN, seqnoB: BN, quarantine: Cell, excessFee: BN, addressA: Address, addressB: Address}>}
     */
    async getData() {
        /**
         * @param bn    {BN}
         * @return  {Uint8Array}
         */
        const bnToBytes = (bn) => {
            let hex = bn.toString(16);
            if (hex.length % 2 !== 0) hex = '0' + hex;
            return hexToBytes(hex);
        }

        const myAddress = await this.getAddress();
        const result = await this.provider.call2(myAddress.toString(), 'get_channel_data', []);

        const state = result[0].toNumber();
        const balanceA = result[1][0];
        const balanceB = result[1][1];
        const publicKeyA = bnToBytes(result[2][0]);
        const publicKeyB = bnToBytes(result[2][1]);
        const channelId = result[3];
        const quarantineDuration = result[4][0].toNumber();
        const misbehaviorFine = result[4][1];
        const conditionalCloseDuration = result[4][2].toNumber();
        const seqnoA = result[5][0];
        const seqnoB = result[5][1];
        const quarantine = result[6]; // Cell
        const excessFee = result[7][0];
        const addressA = parseAddress(result[7][1]);
        const addressB = parseAddress(result[7][2]);
        return {
            state,
            balanceA,
            balanceB,
            publicKeyA,
            publicKeyB,
            channelId,
            quarantineDuration,
            misbehaviorFine,
            conditionalCloseDuration,
            seqnoA,
            seqnoB,
            quarantine,
            excessFee,
            addressA,
            addressB
        }
    }

    /**
     * @param params {{wallet: WalletContract, secretKey: Uint8Array}}
     * @return {{deploy: Function, init: Function, topUp: Function, close: Function, commit: Function, startUncooperativeClose: Function, challengeQuarantinedState: Function, settleConditionals: Function, finishUncooperativeClose: Function}}
     */
    fromWallet(params) {
        const {wallet, secretKey} = params;

        const transfer = (payloadPromise, needStateInit) => {

            const createPromise = async (amount) => {
                const stateInit = needStateInit ? (await this.createStateInit()).stateInit : null
                const myAddress = await this.getAddress();
                const seqno = (await wallet.methods.seqno().call()) || 0;
                const payload = await payloadPromise;

                return wallet.methods.transfer({
                    secretKey: secretKey,
                    toAddress: myAddress.toString(true, true, true),
                    amount: amount,
                    seqno: seqno,
                    payload, // body
                    stateInit,
                    sendMode: 3
                });
            }

            return {
                /**
                 * @param amount    {BN}    in Toncoins
                 */
                send: (amount) => {
                    return createPromise(amount).then(x => x.send());
                },
                /**
                 * @param amount    {BN}    in Toncoins
                 */
                estimateFee: (amount) => {
                    return createPromise(amount).then(x => x.estimateFee());
                }
            }
        }

        return {
            deploy: () => {
                return transfer(null, true);
            },
            /**
             * @param params    {{balanceA: BN, balanceB: BN}}
             */
            init: (params) => {
                return transfer(this.createInitChannel(params).then(x => x.cell));
            },
            /**
             * @param params    {{coinsA: BN, coinsB: BN}}
             */
            topUp: (params) => {
                return transfer(this.createTopUpBalance(params));
            },
            /**
             * @param params    {{hisSignature: Uint8Array, balanceA: BN, balanceB: BN, seqnoA: BN, seqnoB: BN}}
             */
            close: (params) => {
                return transfer(this.createCooperativeCloseChannel(params).then(x => x.cell));
            },
            /**
             * @param params    {{hisSignature: Uint8Array, seqnoA: BN, seqnoB: BN}}
             */
            commit: (params) => {
                return transfer(this.createCooperativeCommit(params).then(x => x.cell));
            },
            /**
             * @param params    {{signedSemiChannelStateA: Cell, signedSemiChannelStateB: Cell}}
             */
            startUncooperativeClose: (params) => {
                return transfer(this.createStartUncooperativeClose(params).then(x => x.cell));
            },
            /**
             * @param params    {{signedSemiChannelStateA: Cell, signedSemiChannelStateB: Cell}}
             */
            challengeQuarantinedState: (params) => {
                return transfer(this.createChallengeQuarantinedState(params).then(x => x.cell));
            },
            /**
             * @param params    {{conditionalsToSettle: Cell | null}}
             */
            settleConditionals: (params) => {
                return transfer(this.createSettleConditionals(params).then(x => x.cell));
            },
            /**
             */
            finishUncooperativeClose: () => {
                return transfer(this.createFinishUncooperativeClose());
            }
        }
    }

}

PaymentChannel.codeHex = PAYMENT_CHANNEL_CODE_HEX;

module.exports = {PaymentChannel};