const TonWeb = require("./index");
const {NftItem} = require("./contract/token/nft/NftItem");
const {NftCollection} = require("./contract/token/nft/NftCollection");
const {NftMarketplace} = require("./contract/token/nft/NftMarketplace");
const {NftSale} = require("./contract/token/nft/NftSale");

async function init() {
    const tonweb = new TonWeb(new TonWeb.HttpProvider('https://testnet.toncenter.com/api/v2/jsonRPC'));

    const seed = TonWeb.utils.base64ToBytes('vt58J2v6FaSuXFGcyGtqT5elpVxcZ+I1zgu/GUfA5uY=');
    const keyPair = TonWeb.utils.nacl.sign.keyPair.fromSeed(seed);
    const WalletClass = tonweb.wallet.all['v3R1'];
    const wallet = new WalletClass(tonweb.provider, {
        publicKey: keyPair.publicKey,
        wc: 0
    });
    const walletAddress = await wallet.getAddress();
    console.log('wallet address=', walletAddress.toString(true, true, true));

    const nftCollection = new NftCollection(tonweb.provider, {
        ownerAddress: walletAddress,
        royalty: 0.11,
        royaltyAddress: walletAddress,
        uri: 'http://localhost:63342/nft-marketplace/my_collection.json',
        nftItemCodeHex: NftItem.codeHex
    });
    const nftCollectionAddress = await nftCollection.getAddress();
    console.log('collection address=', nftCollectionAddress.toString(true, true, true));

    const deployNftCollection = async () => {
        const seqno = (await wallet.methods.seqno().call()) || 0;
        console.log({seqno})

        console.log(
            await wallet.methods.transfer({
                secretKey: keyPair.secretKey,
                toAddress: nftCollectionAddress.toString(true, true, false), // non-bounceable
                amount: TonWeb.utils.toNano(1),
                seqno: seqno,
                payload: null, // body
                sendMode: 3,
                stateInit: (await nftCollection.createStateInit()).stateInit
            }).send()
        );
    }

    const getNftCollectionInfo = async () => {
        const data = await nftCollection.getCollectionData();
        data.ownerAddress = data.ownerAddress.toString(true, true, true);
        console.log(data);
        const royaltyParams = await nftCollection.getRoyaltyParams();
        royaltyParams.royaltyAddress = royaltyParams.royaltyAddress.toString(true, true, true);
        console.log(royaltyParams);
        console.log((await nftCollection.getNftItemAddressByIndex(0)).toString(true, true, true));
        console.log((await nftCollection.getNftItemAddressByIndex(1)).toString(true, true, true));
    }

    const deployNftItem = async () => {
        const seqno = (await wallet.methods.seqno().call()) || 0;
        console.log({seqno})

        const amount = TonWeb.utils.toNano(0.5);

        console.log(
            await wallet.methods.transfer({
                secretKey: keyPair.secretKey,
                toAddress: nftCollectionAddress,
                amount: amount,
                seqno: seqno,
                payload: await nftCollection.createMintBody({
                    amount,
                    ownerAddress: walletAddress,
                    uri: 'http://localhost:63342/nft-marketplace/my_nft.json'
                }),
                sendMode: 3,
            }).send()
        );
    }

    const nftItemAddress = new TonWeb.utils.Address('EQCQACxqUHHASnvijZzBxE-aJldjMWniXGmE5jUnRfUE_zVX');
    console.log('nft item address=', nftItemAddress.toString(true, true, true));
    const nftItem = new NftItem(tonweb.provider, {address: nftItemAddress});

    const getNftItemInfo = async () => {
        // console.log(await nftItem.methods.getUri());
        const data = await nftItem.methods.getData();
        data.collectionAddress = data.collectionAddress.toString(true, true, true);
        data.ownerAddress = data.ownerAddress.toString(true, true, true);
        console.log(data);
    }

    const marketplace = new NftMarketplace(tonweb.provider, {ownerAddress: walletAddress});
    const marketplaceAddress = await marketplace.getAddress();
    console.log('matketplace address=', marketplaceAddress.toString(true, true, true));


    const deployMarketplace = async () => {
        const seqno = (await wallet.methods.seqno().call()) || 0;
        console.log({seqno})

        console.log(
            await wallet.methods.transfer({
                secretKey: keyPair.secretKey,
                toAddress: marketplaceAddress.toString(true, true, false), // non-bounceable
                amount: TonWeb.utils.toNano(1),
                seqno: seqno,
                payload: null, // body
                sendMode: 3,
                stateInit: (await marketplace.createStateInit()).stateInit
            }).send()
        );
    }

    const sale = new NftSale(tonweb.provider, {nftAddress: nftItemAddress, price: TonWeb.utils.toNano('1.25')});
    const saleAddress =  await sale.getAddress();
    console.log('sale address', saleAddress.toString(true, true, true));

    const transferNftItem = async () => {
        const seqno = (await wallet.methods.seqno().call()) || 0;
        console.log({seqno})

        const amount = TonWeb.utils.toNano(0.4);

        console.log(
            await wallet.methods.transfer({
                secretKey: keyPair.secretKey,
                toAddress: await nftItem.getAddress(),
                amount: amount,
                seqno: seqno,
                payload: await nftItem.createTransferBody({
                    newOwnerAddress: saleAddress,
                    payloadAmount: TonWeb.utils.toNano(0.1),
                    payload: new TextEncoder().encode('gift')
                }),
                sendMode: 3,
            }).send()
        );
    }
    const deploySale = async () => {
        const seqno = (await wallet.methods.seqno().call()) || 0;
        console.log({seqno})

        const amount = TonWeb.utils.toNano(0.5);

        const body = new TonWeb.boc.Cell();
        body.bits.writeUint(1, 32); // OP deploy new auction
        body.bits.writeGrams(amount);
        body.refs.push((await sale.createStateInit()).stateInit);
        body.refs.push(new TonWeb.boc.Cell());

        console.log(
            await wallet.methods.transfer({
                secretKey: keyPair.secretKey,
                toAddress: marketplaceAddress,
                amount: amount,
                seqno: seqno,
                payload: body,
                sendMode: 3,
            }).send()
        );
    }

    const getSaleInfo = async () => {
        const data = await sale.methods.getData();
        data.nftAddress = data.nftAddress.toString(true, true, true);
        data.nftOwnerAddress = data.nftOwnerAddress?.toString(true, true, true);
        data.price = data.price.toString();
        console.log(data);
    };


    // await deployNftCollection();
    // await getNftCollectionInfo();
    // await deployNftItem();
    // await getNftItemInfo();
    // await deployMarketplace();
    // await deploySale();
    // await getSaleInfo();
    // await transferNftItem();
}


init();
