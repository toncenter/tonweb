
const { default: HttpProvider } = require('../../src/providers/index');


/**
 * A stub HTTP Provider that is used in tests.
 */
class TestHttpProvider extends HttpProvider {

    constructor() {
        super('', {});
    }


    async send(method, params) {
        return new Response('{}', {
            status: 200,
            statusText: 'OK',
        });
    }

}

module.exports = {
    TestHttpProvider,
};
