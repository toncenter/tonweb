
import TonWeb from '__tonweb__';

const {
    base64ToBytes,
    base64toString,
    bytesToBase64,
    stringToBase64,

} = TonWeb.utils;


const CASES = {
    GENERAL: {
        NO_PADDING: {
            bytes: (
                new Uint8Array([
                    0xec, 0x6b, 0x56, 0x9c, 0xc2, 0x48, 0x12, 0x10,
                    0x0d, 0x4d, 0x04, 0x18, 0x66, 0x1a, 0x26,
                ])
            ),
            string: '7GtWnMJIEhANTQQYZhom',
        },
        PADDING_1: {
            bytes: (
                new Uint8Array([
                    0x68, 0x93, 0x70, 0xa0, 0x7f, 0xd4, 0x7a, 0xa4,
                    0x72, 0xf5, 0x74, 0x3f, 0xc8, 0x66,
                ])
            ),
            string: 'aJNwoH/UeqRy9XQ/yGY=',
        },
        PADDING_2: {
            bytes: (
                new Uint8Array([
                    0x25, 0xf0, 0x35, 0x87, 0x4e, 0xfb, 0x97, 0x47,
                    0x02, 0x9f, 0x8c, 0x35, 0x83, 0x2c, 0x6f, 0xbf,
                ])
            ),
            string: 'JfA1h077l0cCn4w1gyxvvw==',
        }
    },

    /**
     * Test vectors from RFC 4648 specification.
     * @link: https://datatracker.ietf.org/doc/html/rfc4648#section-10
     */
    RFC: [
        {
            string: '',
            base64: '',
        },
        {
            string: 'f',
            base64: 'Zg==',
        },
        {
            string: 'fo',
            base64: 'Zm8=',
        },
        {
            string: 'foo',
            base64: 'Zm9v',
        },
        {
            string: 'foob',
            base64: 'Zm9vYg==',
        },
        {
            string: 'fooba',
            base64: 'Zm9vYmE=',
        },
        {
            string: 'foobar',
            base64: 'Zm9vYmFy',
        },
    ],
};

const PADDING_CASES = {
    PADDING_1: CASES.GENERAL.PADDING_1,
    PADDING_2: CASES.GENERAL.PADDING_2,
};

const MULTIBYTE_CASE = {
    string: '1B: A, 2B: Ω, 3B: ಄, 4B: 𓅱',
    base64: 'MUI6IEEsIDJCOiDOqSwgM0I6IOCyhCwgNEI6IPCThbE=',
};


describe('bytesToBase64()', () => {

    for (const [key, data] of Object.entries(CASES.GENERAL)) {
        it(`encodes [${key}] bytes to string`, () => {
            expect(bytesToBase64(data.bytes)).toEqual(data.string);
        });
    }

    for (const { string, base64 } of CASES.RFC) {
        it(`should encode RFC test vector "${string}"`, () => {
            const bytes = new TextEncoder().encode(string);
            expect(bytesToBase64(bytes)).toEqual(base64);
        });
    }

});

describe('base64ToBytes()', () => {

    for (const [key, data] of Object.entries(CASES.GENERAL)) {
        it(`decodes [${key}] string to bytes`, () => {
            expect(base64ToBytes(data.string)).toEqual(data.bytes);
        });
    }

    for (const { string, base64 } of CASES.RFC) {
        it(`decodes RFC test vector "${string}"`, () => {
            const bytes = base64ToBytes(base64);
            const bytesStr = new TextDecoder().decode(bytes);
            expect(bytesStr).toEqual(string);
        });
    }

    for (const [key, test] of Object.entries(PADDING_CASES)) {
        const { bytes, string } = test;
        const noPaddingString = string.replace(/=+$/, '');
        it(
            `decodes Base64 string "${key}" with truncated padding`,
            () => expect(base64ToBytes(noPaddingString)).toEqual(bytes)
        );
    }

    it(
        'should throw error on Base64 string with ' +
        'extra characters',
        () => {
            // TON = "VE9O"
            (expect(() => base64ToBytes('VE9OA'))
                .toThrow('Incorrect Base64 string')
            );
        }
    );

    it(
        'should throw error on Base64 string with ' +
        'incorrect characters (regex test)',
        () => {
            // TON = "V𓅱O"
            (expect(() => base64ToBytes('V𓅱O'))
                .toThrow('Incorrect Base64 string')
            );
        }
    );

});

describe('base64toString()', () => {

    for (const { string, base64 } of CASES.RFC) {
        it(`decodes string "${string}"`, () => {
            expect(base64toString(base64)).toEqual(string);
        });
    }

    it('decodes multibyte string', () => {
        const { string, base64 } = MULTIBYTE_CASE;
        expect(base64toString(base64)).toEqual(string);
    });

});

describe('stringToBase64()', () => {

    for (const { string, base64 } of CASES.RFC) {
        it(`encodes string "${string}"`, () => {
            expect(stringToBase64(string)).toEqual(base64);
        });
    }

    it('encodes multibyte string', () => {
        const { string, base64 } = MULTIBYTE_CASE;
        expect(stringToBase64(string)).toEqual(base64);
    });

});
