
import BN from 'bn.js';
import nacl from 'tweetnacl';

import { expectBN } from '../../utils/type-guards';
import { Contract, ContractMethods, ContractOptions, Method, Query } from '../contract';
import { Cell } from '../../boc/cell/cell';
import { HttpProvider } from '../../http-provider/http-provider';
import { Address, AddressType } from '../../utils/address';


export interface WalletContractOptions extends ContractOptions {
    publicKey?: Uint8Array;
}

export interface TransferMethodParams {
    secretKey: Uint8Array;
    toAddress: AddressType;
    amount: (BN | number);
    seqno: number;
    payload?: (string | Uint8Array | Cell);
    sendMode?: number;
    stateInit?: Cell;
}

export interface WalletContractMethods extends ContractMethods {
    transfer: TransferMethod;
    seqno: SeqnoMethod;
}

export type TransferMethod = (
    (params: TransferMethodParams) => Method
);

export type SeqnoMethod = (
    () => SeqnoMethodResult
);

export interface SeqnoMethodResult {
    call: () => Promise<number | undefined>;
}

export interface ExternalMessage {
    address: Address;
    signature: Uint8Array;
    message: Cell;
    body: Cell;
    signingMessage: Cell;
    stateInit?: Cell;
    code?: Cell;
    data?: Cell;
}


/**
 * Abstract standard wallet class.
 */
export class WalletContract<
    OptionsType extends WalletContractOptions = WalletContractOptions,
    MethodsType extends WalletContractMethods = WalletContractMethods

> extends Contract<OptionsType, MethodsType> {

    constructor(
        provider: HttpProvider,
        options: WalletContractOptions
    ) {

        if (!options.publicKey && !options.address) {
            throw new Error(`Missing "publicKey" or "address" options`);
        }

        super(provider, options as any);

        this.methods = <MethodsType> {

            transfer: (params: TransferMethodParams) => Contract.createMethod(
                provider,
                this.createTransferMessage(
                    params.secretKey,
                    params.toAddress,
                    params.amount,
                    params.seqno,
                    params.payload,
                    params.sendMode,
                    !Boolean(params.secretKey),
                    params.stateInit
                )
            ),

            seqno: () => ({
                // @todo why do we have sub-method here?
                //        should we rename `seqno` to `getSeqno`
                //        and return the result directly?
                call: async () => {
                    const address = await this.getAddress();
                    try {
                        const result = await provider.call2(
                            address.toString(),
                            'seqno'
                        );
                        return expectBN(result).toNumber();

                    } catch (error) {
                        // Ignoring the error
                        // @todo it doesn't look like a
                        //        good idea to silently ignore
                        //        the errors
                    }
                }
            }),

        }

    }


    /**
     * Returns name of the contract.
     */
    public getName(): string {
        // This method should be implemented in the subclasses
        throw new Error('Not implemented');
    }

    /**
     * Creates external message for contract initialization.
     */
    public async createInitExternalMessage(
        secretKey: Uint8Array

    ): Promise<Query> {

        // @todo we should return ExternalMessage instead of Query
        //        but we will need to add `signature` to the result

        if (!this.options.publicKey) {
            const keyPair = nacl.sign.keyPair.fromSecretKey(secretKey)
            this.options.publicKey = keyPair.publicKey;
        }

        const {
            stateInit,
            address,
            code,
            data,

        } = await this.createStateInit();

        const signingMessage = this.createSigningMessage();

        const signature = nacl.sign.detached(
            await signingMessage.hash(),
            secretKey
        );

        const body = new Cell();
        body.bits.writeBytes(signature);
        body.writeCell(signingMessage);

        const header = Contract.createExternalMessageHeader(address);

        const externalMessage = Contract.createCommonMsgInfo(
            header,
            stateInit,
            body
        );

        return {
            address,
            message: externalMessage,
            body,
            signingMessage,
            stateInit,
            code,
            data,
        };

    }

    public async createTransferMessage(
        /**
         * `nacl.KeyPair.secretKey`
         * @todo improve the description
         */
        secretKey: Uint8Array,
        address: AddressType,
        nanograms: (BN | number),
        seqno: number,
        payload?: (string | Uint8Array | Cell),
        sendMode = 3,
        dummySignature = false,
        stateInit?: Cell

    ): Promise<ExternalMessage> {

        const payloadCell = this.serializePayload(payload);

        const orderHeader = Contract.createInternalMessageHeader(
            new Address(address),
            new BN(nanograms)
        );

        const order = Contract.createCommonMsgInfo(
            orderHeader,
            stateInit,
            payloadCell
        );

        const signingMessage = this.createSigningMessage(seqno);
        signingMessage.bits.writeUint8(sendMode);
        signingMessage.refs.push(order);

        return this.createExternalMessage(
            signingMessage,
            secretKey,
            seqno,
            dummySignature
        );

    }

    public deploy(secretKey: Uint8Array): Method {
        return Contract.createMethod(
            this.provider,
            this.createInitExternalMessage(secretKey)
        );
    }


    /**
     * Returns cell that contains wallet data.
     */
    protected createDataCell(): Cell {
        // 4 byte seqno, 32 byte publicKey
        const cell = new Cell();
        cell.bits.writeUint(0, 32); // seqno
        cell.bits.writeBytes(this.options.publicKey);
        return cell;
    }

    protected createSigningMessage(seqno?: number): Cell {
        seqno = (seqno || 0);
        const cell = new Cell();
        cell.bits.writeUint(seqno, 32);
        return cell;
    }

    protected async createExternalMessage(
        signingMessage: Cell,
        /**
         * `nacl.KeyPair.secretKey`
         * @todo improve the description
         */
        secretKey: Uint8Array,
        seqno: number,
        dummySignature = false

    ): Promise<ExternalMessage> {

        const signature = (dummySignature
            ? new Uint8Array(64)
            : nacl.sign.detached(
                await signingMessage.hash(),
                secretKey
            )
        );

        const body = new Cell();
        body.bits.writeBytes(signature);
        body.writeCell(signingMessage);

        let stateInit: (Cell | undefined);
        let code: (Cell | undefined);
        let data: (Cell | undefined);

        if (seqno === 0) {
            if (!this.options.publicKey) {
                const keyPair = (nacl.sign.keyPair
                    .fromSecretKey(secretKey)
                );
                this.options.publicKey = keyPair.publicKey;
            }
            const deploy = await this.createStateInit();
            stateInit = deploy.stateInit;
            code = deploy.code;
            data = deploy.data;
        }

        const selfAddress = await this.getAddress();
        const header = Contract.createExternalMessageHeader(selfAddress);

        const resultMessage = Contract.createCommonMsgInfo(
            header,
            stateInit,
            body
        );

        return {
            address: selfAddress,
            signature,

            // old wallet_send_generate_external_message
            message: resultMessage,

            body,
            signingMessage,
            stateInit,
            code,
            data,
        };
    }


    private serializePayload(
        payload?: (string | Uint8Array | Cell)

    ): Cell {

        if (!payload) {
            return new Cell();
        }

        if (payload instanceof Cell) {
            return payload;
        }

        let payloadCell = new Cell();

        // @todo throw more meaningful error
        //        on cell bytes overflow

        if (typeof payload === 'string') {
            payloadCell.bits.writeUint(0, 32);
            payloadCell.bits.writeString(payload);

        } else {
            payloadCell.bits.writeBytes(payload)

        }

        return payloadCell;

    }

}
