
import { Bytes, WithType } from './shared';


export namespace Msg {

    type WithNSType<Type extends string> = WithType<`msg.${Type}`>;

    /**
     * @link https://github.com/newton-blockchain/ton/blob/ae5c0720143e231c32c3d2034cfe4e533a16d969/tl/generate/scheme/tonlib_api.tl#L97
     */
    export interface DataRaw extends WithNSType<'dataRaw'> {
        body: Bytes;
        init_state: Bytes;
    }

    /**
     * @link https://github.com/newton-blockchain/ton/blob/ae5c0720143e231c32c3d2034cfe4e533a16d969/tl/generate/scheme/tonlib_api.tl#L98
     */
    export interface DataText extends WithNSType<'dataText'> {
        text: Bytes;
    }

    /**
     * @link https://github.com/newton-blockchain/ton/blob/ae5c0720143e231c32c3d2034cfe4e533a16d969/tl/generate/scheme/tonlib_api.tl#L99
     */
    export interface DataDecryptedText extends WithNSType<'dataDecryptedText'> {
        text: Bytes;
    }

    /**
     * @link https://github.com/newton-blockchain/ton/blob/ae5c0720143e231c32c3d2034cfe4e533a16d969/tl/generate/scheme/tonlib_api.tl#L100
     */
    export interface DataEncryptedText extends WithNSType<'dataEncryptedText'> {
        text: Bytes;
    }

    export type Data = (
        | DataRaw
        | DataText
        | DataDecryptedText
        | DataEncryptedText
    );

}
