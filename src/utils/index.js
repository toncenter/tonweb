const {
    BN,
    nacl,
    sha256,
    fromNano,
    toNano,
    bytesToHex,
    hexToBytes,
    stringToBytes,
    crc32c,
    crc16,
    concatBytes,
    bytesToBase64,
    base64ToBytes,
    base64toString,
    stringToBase64,
    compareBytes,
    readNBytesUIntFromArray,
    keyPairFromSeed,
    newKeyPair,
    newSeed
} = require("./Utils");

const Address = require("./Address").default;
const AdnlAddress = require("./AdnlAddress").default;
const StorageBagId = require("./StorageBagId").default;

// ton://transfer/EQA0i8-CdGnF_DhUHHf92R1ONH6sIA9vLZ_WLcCIhfBBXwtG
// ton://transfer/EQA0i8-CdGnF_DhUHHf92R1ONH6sIA9vLZ_WLcCIhfBBXwtG?amount=1000000000
// ton://transfer/EQA0i8-CdGnF_DhUHHf92R1ONH6sIA9vLZ_WLcCIhfBBXwtG?amount=1000000000&text=data
// ton://transfer/EQA0i8-CdGnF_DhUHHf92R1ONH6sIA9vLZ_WLcCIhfBBXwtG?amount=1000000000&text=foo%3A%2F%2Fbar%2C%2Fbaz%3Famount%3D1%26text%3D%D1%80%D1%83
/**
 * @param url {string}
 * @return {{address: string, amount?: string, text?: string}}
 * @throws if invalid url
 */
function parseTransferUrl(url) {
    const PREFIX = 'ton://transfer/';

    if (!url.startsWith(PREFIX)) {
        throw new Error('must starts with ' + PREFIX);
    }

    const arr = url.substring(PREFIX.length).split('?');
    if (arr.length > 2) {
        throw new Error('multiple "?"');
    }

    const address = arr[0];
    if (!Address.isValid(address)) {
        throw new Error('invalid address format ' + address);
    }
    const result = {
        address: address
    };

    const rest = arr[1];
    if (rest && rest.length) {
        const pairs = rest.split('&').map(s => s.split('='));

        for (const pair of pairs) {
            if (pair.length !== 2) throw new Error('invalid url pair');
            const key = pair[0];
            const value = pair[1];

            if (key === 'amount') {
                if (result.amount) {
                    throw new Error('amount already set');
                }
                const bn = new BN(value);
                if (bn.isNeg()) {
                    throw new Error('negative amount');
                }
                result.amount = value;
            } else if (key === 'text') {
                if (result.text) {
                    throw new Error('text already set');
                }
                result.text = decodeURIComponent(value);
            } else {
                throw new Error('unknown url var ' + key);
            }
        }
    }
    return result;
}

/**
 * @param address   {string}
 * @param amount?    {string} in nano
 * @param text?   {string}
 * @return {string}
 */
function formatTransferUrl(address, amount, text) {
    let url = 'ton://transfer/' + address;

    const params = [];

    if (amount) {
        params.push('amount=' + amount);
    }
    if (text) {
        params.push('text=' + encodeURIComponent(text));
    }

    if (params.length === 0) return url;

    return url + '?' + params.join('&');
}

module.exports = {
    Address,
    AdnlAddress,
    StorageBagId,
    BN,
    nacl,
    sha256,
    fromNano,
    toNano,
    bytesToHex,
    hexToBytes,
    stringToBytes,
    crc32c,
    crc16,
    concatBytes,
    bytesToBase64,
    base64ToBytes,
    base64toString,
    stringToBase64,
    compareBytes,
    readNBytesUIntFromArray,
    parseTransferUrl,
    formatTransferUrl,
    keyPairFromSeed,
    newKeyPair,
    newSeed
};