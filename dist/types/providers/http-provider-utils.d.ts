import BN from 'bn.js';
import { Cell } from '../boc/index';
/**
 * @todo: extract all the static methods as individual functions
 *        there is no need to use class for this
 */
export declare class HttpProviderUtils {
    /**
     * @todo: improve typing
     */
    static parseObject(obj: any): (BN | any);
    /**
     * @todo: improve typing
     */
    static parseResponseStack(pair: [string, any]): (BN | Cell | any);
    /**
     * @todo: improve typing
     */
    static parseResponse(result: any): any;
    static makeArg(arg: any): ['num', (BN | Number)];
    static makeArgs(args: any[]): Array<['num', (BN | Number)]>;
}
