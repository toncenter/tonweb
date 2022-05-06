
const { version } = require('../version');
const { fetch, Headers } = require('./fetch-api');


class FetchHttpClient {

    constructor(options) {

        this.options = {
            timeout: ((options === null || options === void 0 ? void 0 : options.timeout) || false),
        };
        if (typeof fetch === 'undefined' ||
            typeof Headers === 'undefined') {
            throw new Error(`Fetch API is not found, you will need to ` +
                `install a polyfill`);
        }
        if (this.options.timeout !== false &&
            typeof AbortController === 'undefined') {
            throw new Error(`AbortController is not found, ` +
                `please install the polyfill or ` +
                `disable the timeout option`);
        }
    }

    async sendRequest(request) {
        const headers = this.createHeaders(request.headers);
        headers.set('Content-Type', 'application/json');
        headers.set('User-Agent', `tonweb ${version}`);
        const requestOptions = {
            method: (request.method
                ? request.method.toUpperCase()
                : 'GET'
            ),
            headers: headers,
            body: JSON.stringify(request.body),
            redirect: 'error',
        };
        let abortController;
        let timeoutInterval;
        if (this.options.timeout !== false) {
            abortController = new AbortController();
            requestOptions.signal = abortController.signal;
            timeoutInterval = (setTimeout(() => abortController.abort(), this.options.timeout));
        }
        let response;
        try {
            response = await fetch(request.url, requestOptions);
        }
        catch (error) {
            if ((error === null || error === void 0 ? void 0 : error.type) === 'aborted' ||
                (error === null || error === void 0 ? void 0 : error.name) === 'AbortError') {
                throw new Error(`HTTP request timed-out (timeout setting)`);
            }
            else {
                throw error;
            }
        }
        finally {
            if (timeoutInterval) {
                clearTimeout(timeoutInterval);
            }
        }
        if (!response.ok) {
            throw new Error(`HTTP request failed: ` +
                `${response.status} ${response.statusText}`);
        }
        const contentType = response.headers.get('content-type');
        if (!contentType.startsWith('application/json')) {
            throw new Error(`Unexpected response content type, it must be JSON`);
        }
        return {
            status: response.status,
            payload: await response.json(),
        };
    }

    createHeaders(headers) {
        const $headers = new Headers();
        for (const entry of Object.entries(headers)) {
            const [name, valueOrValues] = entry;
            const values = (Array.isArray(valueOrValues)
                ? valueOrValues
                : [valueOrValues]);
            for (let value of values) {
                value = value.trim();
                if (value) {
                    $headers.append(name, value);
                }
            }
        }
        return $headers;
    }

}

module.exports = { FetchHttpClient };
