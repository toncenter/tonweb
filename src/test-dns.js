const TonWeb = require("./index");
const {DnsCollection} = require("./contract/dns/DnsCollection");
const {DnsItem} = require("./contract/dns/DnsItem");
const {createOffchainUriCell} = require("./contract/token/nft/NftUtils");
const {BN, sha256, bytesToHex} = require("./utils");
const {Cell} = require("./boc");
const {Contract} = require("./contract");

class DnsRoot extends Contract {
    constructor(provider) {
        const options = {};
        options.wc = -1;
        options.code = options.code || Cell.oneFromBoc('B5EE9C724101080100E2000114FF00F4A413F4BCF2C80B0102016202030202CD040500ADA1C6186041AE92F152118001E5C08C41AE140F800043AE938010A4216126B6F0DBC0412A03A60E6203BC43E00425AE3061166E8DEDD041AE92B38E0B6726B6E0DBC10401752791961FDA89A19E2D920522F122E1C54003020120060700936483001258C2040FA201938083001658C20407D200CB8083001A58C204064200A38083001E58C20404B2007B8083002258C204032200538083002650C20191EB83002A4E00C9D781E9C6000545F03800334709F01D30701C00020B39402A60802DE12E63120C000F2D0C98DD88C2AC');
        super(provider, options);
    }

    /**
     * @override
     * @private
     * @return {Cell}
     */
    createDataCell() {
        const cell = new Cell();
        cell.bits.writeAddress(new TonWeb.Address('EQDzgi9SYoLRR255ABSpsceO09TNkL-kitDM3F6hmBgkfLlI'));
        return cell;
    }
}

async function init() {
    const tonweb = new TonWeb(new TonWeb.HttpProvider('https://testnet.toncenter.com/api/v2/jsonRPC', {apiKey: ''}));

    const dnsResolve = async () => {
        const rootAddress = await tonweb.dns.getRootDnsAddress();
        console.log('rootAddress=', rootAddress.toString(true, true, true));

        const s = 'apple.ton';

        const cell = await tonweb.dns.resolve(s, TonWeb.dns.DNS_CATEGORY_NEXT_RESOLVER, true);
        console.log(cell.toString(true, true, true));

        // const result = await tonweb.dns.getWalletAddress('alice-alice-alice.ton');
        // console.log(result?.toString(true, true, true));
    }

    const seed = TonWeb.utils.base64ToBytes('vt58J2v6FaSuXFGcyGtqT5elpVxcZ+I1zgu/GUfA5uY=');
// const seed = TonWeb.utils.base64ToBytes('at58J2v6FaSuXFGcyGtqT5elpVxcZ+I1zgu/GUfA5uY=');
    const WALLET2_ADDRESS = 'EQB6-6po0yspb68p7RRetC-hONAz-JwxG9514IEOKw_llXd5';
    const keyPair = TonWeb.utils.nacl.sign.keyPair.fromSeed(seed);
    const WalletClass = tonweb.wallet.all['v3R1'];
    const wallet = new WalletClass(tonweb.provider, {
        publicKey: keyPair.publicKey,
        wc: 0
    });
    const walletAddress = await wallet.getAddress();
    console.log('wallet address=', walletAddress.toString(true, true, true));

    const dnsRoot = new DnsRoot(tonweb.provider, {});
    const dnsRootAddress = await dnsRoot.getAddress();
    console.log('root address=', dnsRootAddress.toString(true, true, true));


    const dnsCollection = new DnsCollection(tonweb.provider, {
        collectionContent: createOffchainUriCell('https://dns.ton.org/collection.json'),
        dnsItemCodeHex: DnsItem.codeHex
    });
    const dnsCollectionAddress = await dnsCollection.getAddress();
    console.log('collection address=', dnsCollectionAddress.toString(true, true, true));

    const deployRootDns = async () => {
        const seqno = (await wallet.methods.seqno().call()) || 0;
        console.log({seqno})

        console.log(
            await wallet.methods.transfer({
                secretKey: keyPair.secretKey,
                toAddress: dnsRootAddress.toString(true, true, true),
                amount: TonWeb.utils.toNano('0.1'),
                seqno: seqno,
                payload: null, // body
                sendMode: 3,
                stateInit: (await dnsRoot.createStateInit()).stateInit
            }).send()
        );
    }

    const deployDnsCollection = async () => {
        const seqno = (await wallet.methods.seqno().call()) || 0;
        console.log({seqno})

        const payload = new Cell();
        payload.bits.writeUint(0x370fec51, 32);
        payload.bits.writeUint(0, 64);

        console.log(
            await wallet.methods.transfer({
                secretKey: keyPair.secretKey,
                toAddress: dnsCollectionAddress.toString(true, true, true),
                amount: TonWeb.utils.toNano('0.5'),
                seqno: seqno,
                payload: payload, // body
                sendMode: 3,
                stateInit: (await dnsCollection.createStateInit()).stateInit
            }).send()
        );
    }

    const getDnsCollectionInfo = async () => {
        const data = await dnsCollection.getCollectionData();
        console.log(data);

        const cell = new Cell();
        cell.bits.writeString('alicealicealicealicealicealicealicealicealicealicealicealicealicealicealicealicealicealicealicealicealicealicealicealicealicea');
        const hash = await cell.hash();
        const bn = new BN(bytesToHex(hash), 16);
        console.log(bn.toString(16));

        console.log('addressByIndex=', (await dnsCollection.getNftItemAddressByIndex(new BN('6f0d5e27c981d01ba43aaf3d346a84beb1e8757b988465a325b3217ec3257af6', 16))).toString(true, true, true)); // "apple"
        console.log('addressByIndex=', (await dnsCollection.getNftItemAddressByIndex(new BN('b413c774757e648677382bd685a02242640b846f9dc92455a2a044b9c3279d5a', 16))).toString(true, true, true)); // "alice-alice-alice"
        console.log('addressByIndex=', (await dnsCollection.getNftItemAddressByIndex(new BN('8b98cad1bf9de7e1bd830ba3fba9608e6190825dddcf7edac7851ee16a692e81', 16))).toString(true, true, true)); // "alicealicealicealicealicealicealicealicealicealicealicealicealicealicealicealicealicealicealicealicealicealicealicealicealicea"
        // console.log((await nftCollection.getNftItemAddressByIndex(new BN(1))).toString(true, true, true));
        console.log((await dnsCollection.resolve('alice-alice-alice', TonWeb.dns.DNS_CATEGORY_NEXT_RESOLVER, true))?.toString(true, true, true));
        console.log((await dnsCollection.resolve('alicealicealicealicealicealicealicealicealicealicealicealicealicealicealicealicealicealicealicealicealicealicealicealicealicea', TonWeb.dns.DNS_CATEGORY_NEXT_RESOLVER, true))?.toString(true, true, true));
        // console.log((await dnsCollection.resolve('apple')));
    }

    const dnsItemAddress = new TonWeb.utils.Address('EQDEwJoXDBqBFI-0pvYJOuI5MEuvYthhwkl56qi5oclHMyGC');
    console.log('dns item address=', dnsItemAddress.toString(true, true, true));
    const dnsItem = new DnsItem(tonweb.provider, {address: dnsItemAddress});

    const getDnsItemInfo = async () => {
        const data = await dnsCollection.methods.getNftItemContent(dnsItem);
        data.collectionAddress = data.collectionAddress.toString(true, true, true);
        data.ownerAddress = data.ownerAddress?.toString(true, true, true);
        console.log(data);

        if (!data.ownerAddress) {
            const auctionInfo = await dnsItem.methods.getAuctionInfo();
            auctionInfo.maxBidAddress = auctionInfo.maxBidAddress.toString(true, true, true);
            auctionInfo.maxBidAmount = auctionInfo.maxBidAmount.toString();
            console.log(auctionInfo);
        }

        const domain = await dnsItem.methods.getDomain();
        console.log({domain});

        const lastFillUpTime = await dnsItem.methods.getLastFillUpTime();
        console.log({lastFillUpTime});

        // console.log((await dnsItem.resolve('.')));
        // console.log((await dnsItem.resolve('.', TonWeb.dns.DNS_CATEGORY_NEXT_RESOLVER, true))?.toString(true, true, true));
        // console.log((await dnsItem.resolve('.', TonWeb.dns.DNS_CATEGORY_WALLET, true))?.toString(true, true, true));
        // console.log((await dnsItem.resolve('.', TonWeb.dns.DNS_CATEGORY_WALLET, true))?.toString(true, true, true));
    }


    const setWalletRecord = async () => {
        const seqno = (await wallet.methods.seqno().call()) || 0;
        console.log({seqno})

        console.log(
            await wallet.methods.transfer({
                secretKey: keyPair.secretKey,
                toAddress: dnsItemAddress.toString(true, true, true),
                amount: TonWeb.utils.toNano('0.1'),
                seqno: seqno,
                payload: await TonWeb.dns.DnsItem.createChangeContentEntryBody({category: TonWeb.dns.DNS_CATEGORY_WALLET, value: TonWeb.dns.createSmartContractAddressRecord(new TonWeb.Address('EQA0i8-CdGnF_DhUHHf92R1ONH6sIA9vLZ_WLcCIhfBBXwtG'))}), // body
                sendMode: 3,
            }).send()
        );
    }

    const releaseDnsItem = async () => {
        const seqno = (await wallet.methods.seqno().call()) || 0;
        console.log({seqno})

        const body = new Cell();
        body.bits.writeUint(0x4ed14b65, 32);
        body.bits.writeUint(123, 64);

        console.log(
            await wallet.methods.transfer({
                secretKey: keyPair.secretKey,
                toAddress: dnsItemAddress.toString(true, true, true),
                amount: TonWeb.utils.toNano('10'),
                seqno: seqno,
                payload: body, // body
                sendMode: 3,
            }).send()
        );
    }

    const govDnsItem = async () => {
        const seqno = (await wallet.methods.seqno().call()) || 0;
        console.log({seqno})

        const body = new Cell();
        body.bits.writeUint(0x44beae41, 32);
        body.bits.writeUint(123, 64);

        console.log(
            await wallet.methods.transfer({
                secretKey: keyPair.secretKey,
                toAddress: dnsItemAddress.toString(true, true, true),
                amount: TonWeb.utils.toNano('1'),
                seqno: seqno,
                payload: body, // body
                sendMode: 3,
            }).send()
        );
    }

    const transferDnsItem = async () => {
        const seqno = (await wallet.methods.seqno().call()) || 0;
        console.log({seqno})

        const amount = TonWeb.utils.toNano('0.05');

        console.log(
            await wallet.methods.transfer({
                secretKey: keyPair.secretKey,
                toAddress: await dnsItem.getAddress(),
                amount: amount,
                seqno: seqno,
                payload: await dnsItem.createTransferBody({
                    newOwnerAddress: new TonWeb.Address('EQBs7JfxnH2jNAlo0ytfKc77sSHQsUBzofngOkcLZyJlmm3j'),
                    forwardAmount: TonWeb.utils.toNano('0.02'),
                    forwardPayload: new TextEncoder().encode('gift'),
                    responseAddress: walletAddress
                }),
                sendMode: 3,
            }).send()
        );
    }


    const getStaticData = async () => {
        const seqno = (await wallet.methods.seqno().call()) || 0;
        console.log({seqno})

        const amount = TonWeb.utils.toNano('0.05');

        console.log(
            await wallet.methods.transfer({
                secretKey: keyPair.secretKey,
                toAddress: await dnsItem.getAddress(),
                amount: amount,
                seqno: seqno,
                payload: await dnsItem.createGetStaticDataBody({
                    queryId: 661
                }),
                sendMode: 3,
            }).send()
        );
    }

    // await deployRootDns();
    // await dnsResolve();
    // await deployDnsCollection();
    // await getDnsCollectionInfo();
    // await getDnsItemInfo();
    // await setWalletRecord();
    // await transferDnsItem();
    // await releaseDnsItem();
    // await govDnsItem();
    // await getStaticData();
}

init();