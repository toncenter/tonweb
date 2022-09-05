
import { version } from '../version';
import { fetch, Headers } from './fetch-api';
import { createHeaders, parseResponseBody } from './http-utils';

import {
    HttpClient,
    HttpRequest,
    HttpResponse,

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

        const headers = createHeaders(request.headers);

        headers.set('Content-Type', 'application/json');
        headers.set('User-Agent', `tonweb ${version}`);

        const requestOptions: RequestInit = {
            method: (request.method?.toUpperCase() || 'GET'),
            headers,
            body: JSON.stringify(request.body),
            redirect: 'error',
        };

        let abortController: AbortController;
        let timeoutInterval: any;
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

        return {
            status: response.status,
            payload: await parseResponseBody(response),
        };

    }

}
