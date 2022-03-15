
const { default: HttpProvider } = require('../../src/providers/index');


/**
 * A stub HTTP Provider that is used in tests.
 */
class TestHttpProvider extends HttpProvider {

    calls = [];


    constructor() {
        super('', {});
    }


    async send(method, params) {

        this.calls.push({ method, params });

        return new Response('{}', {
            status: 200,
            statusText: 'OK',
        });

    }

}

module.exports = {
    TestHttpProvider,
};
