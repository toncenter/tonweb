
import { Headers } from './fetch-api';
import { RequestHeaders } from './http-client';


export async function parseResponseBody<BodyType>(
    response: Response

): Promise<BodyType | undefined> {

    const contentType = (response.headers
        .get('content-type')
    );

    const isJson = (contentType
        .startsWith('application/json')
    );

    const isText = (contentType
        .startsWith('text/')
    );

    return (
        isJson ? await response.json() :
        isText ? await response.text() :
        undefined
    );

}

export function createHeaders(headers: RequestHeaders): Headers {

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
