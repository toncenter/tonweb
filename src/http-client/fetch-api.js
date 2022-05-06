
if (
    globalThis.fetch &&
    globalThis.Headers
) {
    module.exports = {
        fetch,
        Headers,
    };

} else {
    const nodeFetch = require('node-fetch');

    module.exports = {
        fetch: nodeFetch?.default,
        Headers: nodeFetch?.Headers,
    };

}
