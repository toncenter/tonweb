
import { HttpProvider } from './http-provider';


/**
 * A stub HTTP Provider that is used in tests.
 */
export class TestHttpProvider extends HttpProvider {

    constructor() {
        super('', {});
    }


    public async send(method: string, params: any): Promise<Response> {
        return new Response('{}', {
            status: 200,
            statusText: 'OK',
        });
    }

}
