const TonWeb = require("./index");
const {NftItem} = require("./contract/token/nft/NftItem");
const {NftCollection} = require("./contract/token/nft/NftCollection");

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
    console.log('wallet address=', (await wallet.getAddress()).toString(true, true, true));

    const nftCollection = new NftCollection(tonweb.provider, {
        ownerAddress: walletAddress,
        royalty: 0.1,
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

    const nftItem = new NftItem(tonweb.provider, {address: new TonWeb.utils.Address('EQDrFoX1u0AMGfHlPcnieEQiRtctHIOmOTLQMYNTT_UY35WE')});

    const getNftItemInfo = async () => {
        // console.log(await nftItem.methods.getUri());
        const data = await nftItem.methods.getData();
        data.collectionAddress = data.collectionAddress.toString(true, true, true);
        data.ownerAddress = data.ownerAddress.toString(true, true, true);
        console.log(data);
    }

    const transferNftItem = async () => {
        const seqno = (await wallet.methods.seqno().call()) || 0;
        console.log({seqno})

        const amount = TonWeb.utils.toNano(1);

        console.log(
            await wallet.methods.transfer({
                secretKey: keyPair.secretKey,
                toAddress: await nftItem.getAddress(),
                amount: amount,
                seqno: seqno,
                payload: await nftItem.createTransferBody({
                    newOwnerAddress: new TonWeb.utils.Address('EQA0i8-CdGnF_DhUHHf92R1ONH6sIA9vLZ_WLcCIhfBBXwtG'),
                    payloadAmount: TonWeb.utils.toNano(0.05),
                    payload: new TextEncoder().encode('gift')
                }),
                sendMode: 3,
            }).send()
        );
    }

    // await deployNftCollection();
    // await getNftCollectionInfo();
    // await deployNftItem();
    await getNftItemInfo();
    // await transferNftItem();

}

init();
