const TonWeb = require("./index");
const {DnsCollection} = require("./contract/dns/DnsCollection");
const {DnsItem} = require("./contract/dns/DnsItem");
const {createOffchainUriCell} = require("./contract/token/nft/NftUtils");
const {BN} = require("./utils");

async function init() {
    const tonweb = new TonWeb(new TonWeb.HttpProvider('https://testnet.toncenter.com/api/v2/jsonRPC', {apiKey: ''}));

    const dnsResolve = async () => {
        console.log(TonWeb.dns.DNS_CATEGORY_ALL);
        console.log(TonWeb.dns.DNS_CATEGORY_ADNL_ADDRESS);
        console.log(TonWeb.dns.DNS_CATEGORY_WALLET_ADDRESS);

        const rootAddress = await tonweb.dns.getRootDnsAddress();
        console.log(rootAddress.toString(true, true, true));

        const address = await tonweb.dns.resolve('alice.temp.ton', TonWeb.dns.DNS_CATEGORY_ALL);
        console.log(address);
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

    const nftCollection = new DnsCollection(tonweb.provider, {
        collectionContent: createOffchainUriCell('http://localhost:63342/nft-marketplace/my_collection.json'),
        dnsItemCodeHex: DnsItem.codeHex
    });
    const nftCollectionAddress = await nftCollection.getAddress();
    console.log('collection address=', nftCollectionAddress.toString(true, true, true));

    const deployNftCollection = async () => {
        const seqno = (await wallet.methods.seqno().call()) || 0;
        console.log({seqno})

        console.log(
            await wallet.methods.transfer({
                secretKey: keyPair.secretKey,
                toAddress: nftCollectionAddress.toString(true, true, true),
                amount: TonWeb.utils.toNano('1'),
                seqno: seqno,
                payload: null, // body
                sendMode: 3,
                stateInit: (await nftCollection.createStateInit()).stateInit
            }).send()
        );
    }

    const getNftCollectionInfo = async () => {
        const data = await nftCollection.getCollectionData();
        console.log(data);
        console.log('addressByIndex=', (await nftCollection.getNftItemAddressByIndex(new BN('6f0d5e27c981d01ba43aaf3d346a84beb1e8757b988465a325b3217ec3257af6', 16))).toString(true, true, true));
        // console.log((await nftCollection.getNftItemAddressByIndex(new BN(1))).toString(true, true, true));
        console.log((await nftCollection.dnsResolve('apple', -1)).toString(true, true, true));
    }

    const nftItemAddress = new TonWeb.utils.Address('EQAQ3qitiEcX4UC3WTCqnC0GRBS-BdWi8sssbrrumdGh4yrz');
    console.log('nft item address=', nftItemAddress.toString(true, true, true));
    const nftItem = new DnsItem(tonweb.provider, {address: nftItemAddress});

    const getNftItemInfo = async () => {
        const data = await nftCollection.methods.getNftItemContent(nftItem);
        data.collectionAddress = data.collectionAddress.toString(true, true, true);
        data.ownerAddress = data.ownerAddress?.toString(true, true, true);
        console.log(data);

        const auctionInfo = await nftItem.methods.getAuctionInfo();
        auctionInfo.maxBidAddress = auctionInfo.maxBidAddress.toString(true, true, true);
        auctionInfo.maxBidAmount = auctionInfo.maxBidAmount.toString();
        console.log(auctionInfo);

        const domain = await nftItem.methods.getDomain();
        console.log({domain});

        const lastFillUpTime = await nftItem.methods.getLastFillUpTime();
        console.log({lastFillUpTime});
    }

    // await deployNftCollection();
    // await getNftCollectionInfo();
    // await getNftItemInfo();
}

init();