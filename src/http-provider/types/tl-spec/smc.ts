
import { Int32, Int53, Vector, WithType } from './shared';
import { Tvm } from './tvm';


export namespace Smc {

    type WithNSType<T extends string> = WithType<`smc.${T}`>;

    /**
     * @link https://github.com/newton-blockchain/ton/blob/ae5c0720143e231c32c3d2034cfe4e533a16d969/tl/generate/scheme/tonlib_api.tl#L178
     */
    export interface RunResult extends WithNSType<'runResult'> {
        gas_used: Int53;
        stack: Vector<Tvm.StackEntry>;
        exit_code: Int32;
    }

}
