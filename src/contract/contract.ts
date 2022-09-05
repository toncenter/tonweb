
import BN from 'bn.js';

import { Cell } from '../boc/cell/cell';
import { HttpProvider } from '../http-provider/http-provider';
import { bytesToBase64 } from '../utils/base64';
import { Address, AddressType } from '../utils/address';
import { bytesToHex } from '../utils/hex';


export interface ContractOptions {
    code?: Cell;
    address?: AddressType;
    wc?: number;
}

export interface ContractMethods {
}

export interface Method {
    getQuery(): Promise<Cell>;
    send(): Promise<any>;
    estimateFee(): Promise<any>;
}

export interface StateInit {
    stateInit: Cell;
    address: Address;
    code: Cell;
    data: Cell;
}

/**
 * @todo this type is created on indirect data
 *        and needs proper revision
 */
export interface Query {
    address: Address;
    message: Cell;
    code?: Cell;
    body: Cell;
    data?: Cell;
    signature?: Uint8Array;
    signingMessage?: Cell;
    stateInit?: Cell;
}


export class Contract<
    OptionsType extends ContractOptions = ContractOptions,
    MethodsType extends ContractMethods = ContractMethods
> {

    public static createStateInit(
        code: Cell,
        data: Cell,
        library?: undefined,
        splitDepth?: undefined,
        ticktock?: undefined

    ): Cell {

        // _ split_depth:(Maybe (## 5)) special:(Maybe TickTock)
        // code:(Maybe ^Cell) data:(Maybe ^Cell)
        // library:(Maybe ^Cell) = StateInit;

        if (library) {
            throw new Error('Library in state init is not implemented');
        }

        if (splitDepth) {
            throw new Error('Split depth in state init is not implemented');
        }

        if (ticktock) {
            throw new Error('Ticktock in state init is not implemented');
        }

        const stateInit = new Cell();

        stateInit.bits.writeBitArray([
            Boolean(splitDepth),
            Boolean(ticktock),
            Boolean(code),
            Boolean(data),
            Boolean(library),
        ]);

        if (code) {
            stateInit.refs.push(code);
        }

        if (data) {
            stateInit.refs.push(data);
        }

        if (library) {
            stateInit.refs.push(library);
        }

        return stateInit;

    }

    public static createInternalMessageHeader(
        dest: AddressType,
        nanograms: (number | BN) = 0,
        ihrDisabled = true,
        bounce?: boolean,
        bounced = false,
        src?: AddressType,
        currencyCollection?: undefined,
        ihrFees: (number | BN) = 0,
        fwdFees: (number | BN) = 0,

        // @todo do we really need BN for timestamps?
        createdLt: (number | BN) = 0,
        createdAt: (number | BN) = 0

    ): Cell {

        // extra_currencies$_ dict:(HashmapE 32 (VarUInteger 32))
        // = ExtraCurrencyCollection;
        // currencies$_ grams:Grams other:ExtraCurrencyCollection
        // = CurrencyCollection;

        //int_msg_info$0 ihr_disabled:Bool bounce:Bool
        //src:MsgAddressInt dest:MsgAddressInt
        //value:CurrencyCollection ihr_fee:Grams fwd_fee:Grams
        //created_lt:uint64 created_at:uint32 = CommonMsgInfo;

        const destAddress = new Address(dest);

        const message = new Cell();
        message.bits.writeBit(false);
        message.bits.writeBit(ihrDisabled);

        message.bits.writeBit(
            (bounce ?? destAddress.isBounceable)
        );

        message.bits.writeBit(bounced);
        message.bits.writeAddress(src ? new Address(src) : undefined);
        message.bits.writeAddress(destAddress);
        message.bits.writeCoins(nanograms);
        if (currencyCollection) {
            throw new Error('Currency collections are not implemented yet');
        }
        message.bits.writeBit(Boolean(currencyCollection));
        message.bits.writeCoins(ihrFees);
        message.bits.writeCoins(fwdFees);
        message.bits.writeUint(createdLt, 64);
        message.bits.writeUint(createdAt, 32);
        return message;
    }

    public static createExternalMessageHeader(
        dest: AddressType,
        src?: AddressType,
        importFee: (number | BN) = 0

    ): Cell {
        //ext_in_msg_info$10 src:MsgAddressExt dest:MsgAddressInt
        //import_fee:Grams = CommonMsgInfo;

        const message = new Cell();
        message.bits.writeUint(2, 2);
        message.bits.writeAddress(src ? new Address(src) : undefined);
        message.bits.writeAddress(new Address(dest));
        message.bits.writeCoins(importFee);
        return message;
    }


    /**
     * Creates CommonMsgInfo cell that contains specified
     * header, stateInit and body.
     */
    public static createCommonMsgInfo(
        header: Cell,
        stateInit?: Cell,
        body?: Cell

    ): Cell {

        // tblkch.pdf, page 57

        const commonMsgInfo = new Cell();
        commonMsgInfo.writeCell(header);

        if (stateInit) {
            commonMsgInfo.bits.writeBit(true);
            // -1: need at least one bit for body
            // @todo we also should check for free refs here
            if (commonMsgInfo.bits.getFreeBits() - 1 >= stateInit.bits.getUsedBits()) {
                commonMsgInfo.bits.writeBit(false);
                commonMsgInfo.writeCell(stateInit);
            } else {
                commonMsgInfo.bits.writeBit(true);
                commonMsgInfo.refs.push(stateInit);
            }
        } else {
            commonMsgInfo.bits.writeBit(false);
        }

        // @todo we also should check for free refs here
        if (body) {
            if (commonMsgInfo.bits.getFreeBits() >= body.bits.getUsedBits()) {
                commonMsgInfo.bits.writeBit(false);
                commonMsgInfo.writeCell(body);
            } else {
                commonMsgInfo.bits.writeBit(true);
                commonMsgInfo.refs.push(body);
            }
        } else {
            commonMsgInfo.bits.writeBit(false);
        }

        return commonMsgInfo;
    }

    public static createMethod(
        provider: HttpProvider,
        queryPromise: Promise<Query>

    ): Method {

        return {
            getQuery: async () => {
                return (await queryPromise).message;
            },
            send: async () => {
                const query = await queryPromise;
                const boc = bytesToBase64(await query.message.toBoc(false));
                return provider.sendBoc(boc);
            },
            estimateFee: async () => {
                const query = await queryPromise;
                const serialized = (
                    query.code ? // deploy
                        {
                            address: query.address.toString(true, true, false),
                            body: bytesToBase64(await query.body.toBoc(false)),
                            init_code: bytesToBase64(await query.code.toBoc(false)),
                            init_data: bytesToBase64(await query.data.toBoc(false)),
                        } : {
                            address: query.address.toString(true, true, true),
                            body: bytesToBase64(await query.body.toBoc(false)),
                        }
                );

                return provider.getEstimateFee(serialized);
            }
        };

    }


    public address?: Address;

    public methods: MethodsType = {} as any;


    constructor(
        public readonly provider: HttpProvider,
        public readonly options: OptionsType = (<any> {})
    ) {
        if (options.address) {
            this.address = new Address(options.address);
        }

        if (!options.wc) {
            options.wc = (this.address?.wc || 0);
        }

    }


    public async getAddress(): Promise<Address> {
        if (!this.address) {
            this.address = (await this.createStateInit()).address;
        }
        return this.address;
    }

    public async createStateInit(): Promise<StateInit> {
        const code = this.createCodeCell();
        const data = this.createDataCell();
        const stateInit = Contract.createStateInit(code, data);
        const stateInitHash = await stateInit.hash();
        const address = new Address(
            this.options.wc + ':' + bytesToHex(stateInitHash)
        );
        return {
            stateInit,
            address,
            code,
            data,
        };
    }


    /**
     * Return cell that contains contract data.
     */
    protected createDataCell(): Cell {
        // Should be overridden by child classes
        return new Cell();
    }


    /**
     * Returns cell that contains contact code.
     */
    private createCodeCell(): Cell {
        if (!this.options.code) {
            throw new Error(
                `Can't create code cell, code option ` +
                `must be specified when creating a contract`
            );
        }
        return this.options.code;
    }

}
