
import * as nodeFetch from 'node-fetch';


/**
 * Exporting either the built-in native fetch API or
 * the node-fetch polyfill for Node.js.
 *
 * When building artifacts for browser we should replace
 * the `node-fetch` with an empty module.
 */

const hasFetchApi = (globalThis.fetch && globalThis.Headers);

const fetch = (
    <typeof globalThis.fetch>
    (hasFetchApi ? globalThis.fetch : nodeFetch?.default)
);

const Headers = (
    <typeof globalThis.Headers>
    (hasFetchApi ? globalThis.Headers : nodeFetch?.Headers)
);

export { fetch, Headers };
