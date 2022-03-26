
import BN from 'bn.js';

import { Cell } from '../boc/cell';
import { base64ToBytes } from '../utils/base64';


/**
 * @todo: extract all the static methods as individual functions
 *        there is no need to use class for this
 */
export class HttpProviderUtils {

    /**
     * @todo: improve typing
     */
    public static parseObject(obj: any): (BN | any) {
        const typeName = obj['@type'];
        switch (typeName) {
            case 'tvm.list':
            case 'tvm.tuple':
                return obj.elements.map(HttpProviderUtils.parseObject);
            case 'tvm.stackEntryTuple':
                return HttpProviderUtils.parseObject(obj.tuple);
            case 'tvm.stackEntryNumber':
                return HttpProviderUtils.parseObject(obj.number);
            case 'tvm.numberDecimal':
                return new BN(obj.number, 10);
            default:
                throw new Error('unknown type ' + typeName);
        }
    }

    /**
     * @todo: improve typing
     */
    public static parseResponseStack(
        pair: [string, any]

    ): (BN | Cell | any) {

        const typeName = pair[0];
        const value = pair[1];

        switch (typeName) {
            case 'num':
                return new BN(value.replace(/0x/, ''), 16);
            case 'list':
            case 'tuple':
                return HttpProviderUtils.parseObject(value);
            case 'cell':
                const contentBytes = base64ToBytes(value.bytes);
                return Cell.oneFromBoc(contentBytes);
            default:
                throw new Error(
                    `Failed to parse response stack, ` +
                    `unknown type: ${typeName}`
                );
        }

    }

    /**
     * @todo: improve typing
     */
    public static parseResponse(result) {
        if (result.exit_code !== 0) {
            // @todo: use custom error class
            const error = new Error('Failed to parse response');
            (error as any).result = result;
            throw error;
        }
        const arr = (result.stack
            .map(HttpProviderUtils.parseResponseStack)
        );
        return (arr.length === 1 ? arr[0] : arr);
    }

    /**
     * @todo: function is unused: use or remove it
     */
    public static makeArg(arg: any): ['num', (BN | Number)] {
        if (BN.isBN(arg) || typeof arg === 'number') {
            return ['num', arg];
        } else {
            throw new Error(`Unknown argument type: ${arg}`);
        }
    }

    /**
     * @todo: function is unused: use or remove it
     */
    public static makeArgs(args: any[]): Array<['num', (BN | Number)]> {
        return args.map(this.makeArg);
    }

}
