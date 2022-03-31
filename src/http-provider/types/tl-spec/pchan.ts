
import { Bool, Int32, Int53, Int64, WithType } from './shared';
import { AccountAddress } from './no-namespace';


export namespace Pchan {

    type WithNSType<Type extends string> = WithType<`pchan.${Type}`>;

    /**
     * @link https://github.com/newton-blockchain/ton/blob/ae5c0720143e231c32c3d2034cfe4e533a16d969/tl/generate/scheme/tonlib_api.tl#L78
     */
    export interface StateInit extends WithNSType<'stateInit'> {
        signed_A: Bool;
        signed_B: Bool;
        min_A: Int64;
        min_b: Int64;
        expire_at: Int53;
        A: Int64;
        B: Int64;
    }

    /**
     * @link https://github.com/newton-blockchain/ton/blob/ae5c0720143e231c32c3d2034cfe4e533a16d969/tl/generate/scheme/tonlib_api.tl#L79
     */
    export interface StateClose extends WithNSType<'stateClose'> {
        signed_A: Bool;
        signed_B: Bool;
        min_A: Int64;
        min_b: Int64;
        expire_at: Int53;
        A: Int64;
        B: Int64;
    }

    /**
     * @link https://github.com/newton-blockchain/ton/blob/ae5c0720143e231c32c3d2034cfe4e533a16d969/tl/generate/scheme/tonlib_api.tl#L80
     */
    export interface StatePayout extends WithNSType<'statePayout'> {
        A: Int64;
        B: Int64;
    }

    export type State = (
        | Pchan.StateInit
        | Pchan.StateClose
        | Pchan.StatePayout
    );

    /**
     * @link https://github.com/newton-blockchain/ton/blob/ae5c0720143e231c32c3d2034cfe4e533a16d969/tl/generate/scheme/tonlib_api.tl#L57
     */
    export interface Config extends WithNSType<'config'> {
        alice_public_key: string;
        alice_address: AccountAddress;
        bob_public_key: string;
        bob_address: AccountAddress
        init_timeout: Int32;
        close_timeout: Int32;
        channel_id: Int64;
    }

    /**
     * @link https://github.com/newton-blockchain/ton/blob/ae5c0720143e231c32c3d2034cfe4e533a16d969/tl/generate/scheme/tonlib_api.tl#L82
     */
    export interface AccountState extends WithNSType<'accountState'> {
        config: Pchan.Config;
        state: Pchan.State;
        description: string;
    }

}
