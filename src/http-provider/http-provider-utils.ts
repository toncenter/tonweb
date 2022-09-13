
import BN from 'bn.js';

import { TonLib } from '@ton.js/types';

import { Cell } from '../boc/cell/cell';
import { base64ToBytes } from '../utils/base64';
import { expectBoolean, expectNonNullObject, expectNumber, expectString } from '../utils/type-guards';
import { ApiResponse } from './http-provider';
import { RunGetMethodResult, RunGetMethodResultStackItem } from './types/responses/meta';


/* parseObject */
export type ParseObjectParam = (
    | TonLib.Combinators.Tvm.Cell
    | TonLib.Combinators.Tvm.List
    | TonLib.Combinators.Tvm.NumberDecimal
    | TonLib.Combinators.Tvm.StackEntryCell
    | TonLib.Combinators.Tvm.Tuple
    | TonLib.Types.Tvm.StackEntry
);

export type ParseObjectResult = (
    | BN
    | Cell
    | ParseObjectResult[]
);

/* parseResponseStack */
export type ParseResponseStackParam = RunGetMethodResultStackItem;

export type ParseResponseStackResult = (
    | BN
    | ParseObjectResult
    | Cell
);

/* parseResponse */
export type ParseResponseParam = RunGetMethodResult;

export type ParseResponseResult = (
    | ParseResponseStackResult
    | ParseResponseStackResult[]
);


/**
 * @todo extract all the static methods as individual functions
 *        there is no need to use class for this
 */
export class HttpProviderUtils {

    public static parseObject(
        obj: ParseObjectParam

    ): ParseObjectResult {

        const typeName = obj['@type'];

        // @todo handle additional types:
        //        - tvm.stackEntrySlice
        //        - tvm.stackEntryList
        //        - tvm.stackEntryUnsupported

        switch (typeName) {
            case 'tvm.list':
            case 'tvm.tuple':
                return obj.elements.map(HttpProviderUtils.parseObject);

            case 'tvm.cell':
                return Cell.oneFromBoc(base64ToBytes(obj.bytes));

            case 'tvm.stackEntryCell':
                return HttpProviderUtils.parseObject(obj.cell);

            case 'tvm.stackEntryTuple':
                return HttpProviderUtils.parseObject(obj.tuple);

            case 'tvm.stackEntryNumber':
                return HttpProviderUtils.parseObject(obj.number);

            case 'tvm.numberDecimal':
                return new BN(obj.number, 10);

            default:
                throw new Error(`Unknown type: ${typeName}`);
        }

    }

    public static parseResponseStack(
        pair: ParseResponseStackParam

    ): ParseResponseStackResult {

        const typeName = pair[0];

        switch (typeName) {
            case 'num': {
                const str = pair[1];
                return new BN(str.replace(/0x/, ''), 16);
            }
            case 'list':
            case 'tuple': {
                const tupleObj = pair[1];
                return HttpProviderUtils.parseObject(tupleObj);
            }
            case 'cell': {
                const cell = pair[1];
                const contentBytes = base64ToBytes(cell.bytes);
                return Cell.oneFromBoc(contentBytes);
            }
            default: {
                throw new Error(
                    `Failed to parse response stack, ` +
                    `unknown type: ${typeName}`
                );
            }
        }

    }

    public static parseResponse<
        ResultType = ParseResponseResult
    >(
        result: ParseResponseParam

    ): ResultType {

        if (result.exit_code !== 0) {
            // @todo use custom error class
            const error = new Error('Failed to parse response');
            (error as any).result = result;
            throw error;
        }

        const stackItems = (result.stack
            .map(HttpProviderUtils.parseResponseStack)
        );

        return <ResultType> <any> (
            (stackItems.length === 1 ? stackItems[0] : stackItems)
        );

    }

    /**
     * @deprecated: This function is not used by the library
     *              and will be removed in the future.
     */
    public static makeArg(arg: any): ['num', (BN | Number)] {
        if (BN.isBN(arg) || typeof arg === 'number') {
            return ['num', arg];
        } else {
            throw new Error(`Unknown argument type: ${arg}`);
        }
    }

    /**
     * @deprecated: This function is not used by the library
     *              and will be removed in the future.
     */
    public static makeArgs(args: any[]): Array<['num', (BN | Number)]> {
        return args.map(this.makeArg);
    }

}

export function expectApiResponse(response: any): ApiResponse {
    expectNonNullObject(response);
    expectBoolean(response.ok);
    if (response.ok === false) {
        expectNumber(response.code);
        expectString(response.error);
    }
    return response;
}
