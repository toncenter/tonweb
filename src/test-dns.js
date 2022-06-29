const TonWeb = require("./index");
const {DnsCollection} = require("./contract/dns/DnsCollection");
const {DnsItem} = require("./contract/dns/DnsItem");
const {createOffchainUriCell} = require("./contract/token/nft/NftUtils");
const {BN} = require("./utils");
const {Cell} = require("./boc");
const {Contract} = require("./contract");

class DnsRoot extends Contract {
    constructor(provider) {
        const options = {};
        options.wc = -1;
        options.code = options.code || Cell.oneFromBoc('B5EE9C72410106010091000114FF00F4A413F4BCF2C80B0102016202030202CF040500ADA1C6186041AE92F152118001E5C08C41AE140F800043AE938010A4216126B6F0DBC0412A03A60E6203BC43E00225AE3061166E8DEDD041AE92B38E0B6726B6E0DBC10401752791961FDA89A19E2D920522F122E1C54003000517C0E000331C27C074C1C07000082CE500A98200B784B98C4830003CB43260840B855D');
        super(provider, options);
    }

    /**
     * @override
     * @private
     * @return {Cell}
     */
    createDataCell() {
        const cell = new Cell();
        cell.bits.writeAddress(new TonWeb.Address('EQACdaC5xNWn_Fe0x-SjoXdNnBqGfpuV8xxK40yZOyLujlrQ'));
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
        console.log(cell);

        const result = await tonweb.dns.getWalletAddress(s);
        console.log(result?.toString(true, true, true));
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
        payload.bits.writeUint(7, 32);
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
        console.log('addressByIndex=', (await dnsCollection.getNftItemAddressByIndex(new BN('6f0d5e27c981d01ba43aaf3d346a84beb1e8757b988465a325b3217ec3257af6', 16))).toString(true, true, true)); // "apple"
        // console.log((await nftCollection.getNftItemAddressByIndex(new BN(1))).toString(true, true, true));
        console.log((await dnsCollection.resolve('apple', TonWeb.dns.DNS_CATEGORY_NEXT_RESOLVER, true))?.toString(true, true, true));
        console.log((await dnsCollection.resolve('apple')));
    }

    const dnsItemAddress = new TonWeb.utils.Address('EQB8YJA10OhYUQ0BIooTdve_1VZ7NUytYLeljKziPUVOzEcf');
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

        console.log((await dnsItem.resolve('.')));
        console.log((await dnsItem.resolve('apple')));
        console.log((await dnsItem.resolve('.', TonWeb.dns.DNS_CATEGORY_WALLET))?.toString(true, true, true));
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

    // await deployRootDns();
    // await dnsResolve();
    // await deployDnsCollection();
    // await getDnsCollectionInfo();
    // await getDnsItemInfo();
    // await setWalletRecord();
}

init();