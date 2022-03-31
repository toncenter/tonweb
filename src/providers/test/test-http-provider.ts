
import { HttpProvider } from '../../http-provider/http-provider';


export interface Call {
    method: string;
    params: any;
}


/**
 * A stub HTTP Provider that is used in tests.
 */
export class TestHttpProvider extends HttpProvider {

    private calls: Call[] = [];


    public get callsCount(): number {
        return this.calls.length;
    }


    constructor() {
        super('', {});
    }


    public async send(method: string, params: any = {}): Promise<Response> {

        this.calls.push({ method, params });

        return new Response('{}', {
            status: 200,
            statusText: 'OK',
        });

    }

    public getLastCall(): (Call | undefined) {
        return (this.calls.length > 0
            ? this.calls[this.calls.length - 1]
            : undefined
        );
    }

    public getCalls(): Call[] {
        return this.calls;
    }

    public clearCalls() {
        this.calls = [];
    }

}
