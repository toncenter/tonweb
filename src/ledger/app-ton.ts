
import Transport from '@ledgerhq/hw-transport';
import BN from 'bn.js';

import { Cell } from '../boc/cell/cell';
import { Contract, Method, Query } from '../contract/contract';
import { WalletContract } from '../contract/wallet/wallet-contract';
import TonWeb from '../index';
import { Address, AddressType } from '../utils/address';
import { bytesToHex } from '../utils/hex';


export interface AppConfiguration {
    version: string;
}

export interface GetPublicKeyResult {
    publicKey: Uint8Array;
}

export interface GetAddressResult {
    address: Address;
}

export interface SignResult {
    signature: Buffer;
}


export class AppTon {

    // @todo use enum for this
    // @todo these should be static
    public readonly ADDRESS_FORMAT_HEX = 0;
    public readonly ADDRESS_FORMAT_USER_FRIENDLY = 1;
    public readonly ADDRESS_FORMAT_URL_SAFE = 2;
    public readonly ADDRESS_FORMAT_BOUNCEABLE = 4;
    public readonly ADDRESS_FORMAT_TEST_ONLY = 8;


    constructor(
      /**
       * @ledgerhq compatible transport.
       */
      public readonly transport: Transport,
      public readonly ton: TonWeb
    ) {

        // @todo find out why decorateAppAPIMethods is called
        // const scrambleKey = "w0w";
        // transport.decorateAppAPIMethods(
        //     this,
        //     [
        //         "getAppConfiguration",
        //         "getAddress",
        //         "sign",
        //         "signTransfer",
        //     ],
        //     scrambleKey
        // );

    }


    /***
     * Returns application configuration that includes version.
     */
    public async getAppConfiguration(): Promise<AppConfiguration> {
        const [major, minor, patch] = (
          await this.transport.send(0xe0, 0x01, 0x00, 0x00)
        );
        return {
            version: [major, minor, patch].join('.'),
        };
    }

    /**
     * Returns public key for the specified account number.
     * If `isDisplay` is set then it displays the public key
     * and confirms before returning.
     */
    public async getPublicKey(
      accountNumber: number,
      isDisplay: boolean

    ): Promise<GetPublicKeyResult> {

        const buffer = Buffer.alloc(4);
        buffer.writeInt32BE(accountNumber);

        const response = await this.transport
            .send(
                0xe0,
                0x02,
                (isDisplay ? 0x01 : 0x00),
                0x00,
                buffer
            );
        const len = response[0];
        const publicKey = new Uint8Array(response.slice(1, 1 + len));
        return { publicKey };
    }

    /**
     * Returns wallet v3R1 address for the specified account number.
     * If `isDisplay` is set, then it displays address and
     * confirms before returning. `addressFormat` is a sum
     * of `ADDRESS_FORMAT_*` instance property constants.
     */
    public async getAddress(
      accountNumber: number,
      isDisplay: boolean,
      addressFormat: number

    ): Promise<GetAddressResult> {

        const buffer = Buffer.alloc(4);
        buffer.writeInt32BE(accountNumber);

        const response = await this.transport
            .send(
                0xe0,
                0x05,
                (isDisplay ? 0x01 : 0x00),
                addressFormat,
                buffer
            );
        const len = response[0];
        const addressHex = new Uint8Array(
            response.slice(1, 1 + len)
        );
        const address = new Address(
            '0:' + bytesToHex(addressHex)
        );
        return { address };
    }

    /**
     * Signs the specified buffer of bytes using the
     * specified account number.
     */
    public async sign(
      accountNumber: number,
      buffer: Buffer

    ): Promise<SignResult> {

        const accountNumberBuffer = Buffer.alloc(4);
        accountNumberBuffer.writeInt32BE(accountNumber);
        const signBuffer = Buffer.concat([
            accountNumberBuffer,
            Buffer.from(buffer),
        ]);

        const response = await this.transport
            .send(
                0xe0,
                0x03,
                0x00,
                0x00,
                signBuffer
            );

        const len = response[0];
        const signature = response.slice(1, 1 + len);
        return { signature };
    }

    /**
     * Signs the transfer coins message
     * (same with TonWeb.WalletContract.createTransferMessage).
     * If `seqno` is zero, then it will be "deploy wallet + transfer coins" message.
     * `addressFormat` is a sum of `ADDRESS_FORMAT_*` instance property constants.
     */
    public async transfer(
      accountNumber: number,
      wallet: WalletContract,
      toAddress: AddressType,
      nanograms: (BN | number),
      seqno: number,
      addressFormat: number

    ): Promise<Method> {

        // @todo don't use magic numbers
        const sendMode = 3;

        const query = await wallet.createTransferMessage(
          null,
          toAddress,
          nanograms,
          seqno,
          null,
          sendMode,
          true
        );

        const accountNumberBuffer = Buffer.alloc(4);
        accountNumberBuffer.writeInt32BE(accountNumber);
        const msgBuffer = Buffer.concat([
            accountNumberBuffer,
            Buffer.from(await query.signingMessage.toBoc())
        ]);

        const response = (await this.transport
          .send(
            0xe0,
            0x04,
            addressFormat,
            0x00,
            msgBuffer
          )
        );

        const len = response[0];
        const signatureBuffer = response.slice(1, 1 + len);
        const signature = new Uint8Array(signatureBuffer);

        const body = new Cell();
        body.bits.writeBytes(signature);
        body.writeCell(query.signingMessage);

        let stateInit = null, code = null, data = null;

        if (seqno === 0) {
            const deploy = await wallet.createStateInit();
            stateInit = deploy.stateInit;
            code = deploy.code;
            data = deploy.data;
        }

        const selfAddress = await wallet.getAddress();
        const header = Contract.createExternalMessageHeader(selfAddress);
        const resultMessage = Contract.createCommonMsgInfo(header, stateInit, body);

        const resultPromise = new Promise<Query>(resolve => {
            resolve({
                address: selfAddress,
                message: resultMessage, // old wallet_send_generate_external_message
                body,
                signature,
                signingMessage: query.signingMessage,
                stateInit,
                code,
                data,
            });
        });

        return Contract.createMethod(
            this.ton.provider,
            resultPromise
        );

    }

}
