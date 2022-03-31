
import { version } from '../version';

import {
    HttpClient,
    HttpRequest,
    HttpResponse,
    RequestHeaders,

} from './http-client';


export interface FetchHttpClientOptions {

    /**
     * Request timeout in milliseconds.
     */
    timeout?: number;

}


export class FetchHttpClient implements HttpClient {

    private readonly options: {
        timeout: (number | false);
    };


    constructor(options?: FetchHttpClientOptions) {

        this.options = {
            timeout: (options?.timeout || false),
        };

        if (
            typeof fetch === 'undefined' ||
            typeof Headers === 'undefined'
        ) {
            throw new Error(
                `Fetch API is not found, you will need to ` +
                `install a polyfill`
            );
        }

        if (
            this.options.timeout !== false &&
            typeof AbortController === 'undefined'
        ) {
            throw new Error(
                `AbortController is not found, ` +
                `please install the polyfill or ` +
                `disable the timeout option`
            );

        }

    }


    public async sendRequest<ResponsePayloadType>(
        request: HttpRequest

    ): Promise<HttpResponse<ResponsePayloadType>> {

        const headers = this.createHeaders(request.headers);

        headers.set('Content-Type', 'application/json');
        headers.set('User-Agent', `tonweb ${version}`);

        const requestOptions: RequestInit = {
            method: request.method.toUpperCase(),
            headers: headers,
            body: JSON.stringify(request.body),
            redirect: 'error',
        };

        let abortController: AbortController;
        let timeoutInterval: (number | undefined);
        if (this.options.timeout !== false) {
            abortController = new AbortController();
            requestOptions.signal = abortController.signal;
            timeoutInterval = (
                setTimeout(
                    () => abortController.abort(),
                    this.options.timeout
                )
            );
        }

        let response: Response;
        try {
            response = await fetch(
                request.url,
                requestOptions
            );

        } catch (error: any) {
            if (
                error?.type === 'aborted' ||
                error?.name === 'AbortError'
            ) {
                throw new Error(
                    `HTTP request timed-out (timeout setting)`
                );
            } else {
                throw error;
            }

        } finally {
            if (timeoutInterval) {
                clearTimeout(timeoutInterval);
            }

        }

        if (!response.ok) {
            throw new Error(
                `HTTP request failed: ` +
                `${response.status} ${response.statusText}`
            );
        }

        const contentType = response.headers.get('content-type');
        if (contentType !== 'application/json') {
            throw new Error(
                `Unexpected response content type, it must be JSON`
            );
        }

        return {
            status: response.status,
            payload: await response.json(),
        };

    }


    private createHeaders(headers: RequestHeaders): Headers {
        const $headers = new Headers();
        for (const entry of Object.entries(headers)) {
            const [name, valueOrValues] = entry;
            const values = (Array.isArray(valueOrValues)
                ? valueOrValues
                : [valueOrValues]
            );
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
