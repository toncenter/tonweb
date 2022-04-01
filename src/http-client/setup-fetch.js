
const {
    default: fetch,
    Headers,
    Request,
    Response,

} = require('node-fetch');


if (!globalThis.fetch) {
    globalThis.fetch = fetch
    globalThis.Headers = Headers
    globalThis.Request = Request
    globalThis.Response = Response
}
