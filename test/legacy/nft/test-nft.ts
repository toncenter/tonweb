
import TonWeb from '../../../src/index';

const NftCollection = TonWeb.token.nft.NftCollection;
const NftItem = TonWeb.token.nft.NftItem;
const NftSale = TonWeb.token.nft.NftSale;
const NftMarketplace = TonWeb.token.nft.NftMarketplace;


(async () => {

    const tonweb = new TonWeb(
        new TonWeb.HttpProvider('https://testnet.toncenter.com/api/v2/jsonRPC')
    );

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

    const nftCollection = new NftCollection(tonweb.provider, {
        ownerAddress: walletAddress,
        collectionContentUri: 'http://localhost:63342/nft-marketplace/my_collection.json',
        nftItemContentBaseUri: 'http://localhost:63342/nft-marketplace/',
        nftItemCodeHex: NftItem.codeHex,
        royalty: 0.13,
        royaltyAddress: walletAddress,

        // @todo set these params correctly
        royaltyFactor: 0,
        royaltyBase: 0,
    });
    const nftCollectionAddress = await nftCollection.getAddress();
    console.log('collection address=', nftCollectionAddress.toString(true, true, true));

    const deployNftCollection = async () => {
        const seqno = (await wallet.methods.seqno().call()) || 0;
        console.log({ seqno });

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
        console.log({
            ...data,
            ownerAddress: data.ownerAddress.toString(true, true, true),
        });
        const royaltyParams = await nftCollection.getRoyaltyParams();
        console.log({
            ...royaltyParams,
            royaltyAddress: royaltyParams.royaltyAddress.toString(true, true, true),
        });
        console.log((await nftCollection.getNftItemAddressByIndex(0)).toString(true, true, true));
        console.log((await nftCollection.getNftItemAddressByIndex(1)).toString(true, true, true));
    }

    const deployNftItem = async () => {
        const seqno = (await wallet.methods.seqno().call()) || 0;
        console.log({ seqno });

        const amount = TonWeb.utils.toNano('0.05');

        console.log(
            await wallet.methods.transfer({
                secretKey: keyPair.secretKey,
                toAddress: nftCollectionAddress.toString(true, true, true),
                amount: amount,
                seqno: seqno,
                payload: await nftCollection.createMintBody({
                    amount,
                    itemIndex: 0,
                    itemOwnerAddress: walletAddress,
                    itemContentUri: 'my_nft.json'
                }),
                sendMode: 3,
            }).send()
        );
    }

    const changeCollectionOwner = async () => {
        const seqno = (await wallet.methods.seqno().call()) || 0;
        console.log({ seqno });

        const amount = TonWeb.utils.toNano('0.05');

        console.log(
            await wallet.methods.transfer({
                secretKey: keyPair.secretKey,
                toAddress: nftCollectionAddress.toString(true, true, true),
                amount: amount,
                seqno: seqno,
                payload: await nftCollection.createChangeOwnerBody({
                    newOwnerAddress: new TonWeb.utils.Address(WALLET2_ADDRESS)
                }),
                sendMode: 3,
            }).send()
        );
    }

    const editCollectionContent = async () => {
        const seqno = (await wallet.methods.seqno().call()) || 0;
        console.log({seqno})

        const amount = TonWeb.utils.toNano('0.05');

        console.log(
            await wallet.methods.transfer({
                secretKey: keyPair.secretKey,
                toAddress: nftCollectionAddress.toString(true, true, true),
                amount: amount,
                seqno: seqno,
                payload: await nftCollection.createEditContentBody({
                    royalty: 0.16,
                    royaltyAddress: new TonWeb.Address('EQBvI0aFLnw2QbZgjMPCLRdtRHxhUyinQudg6sdiohIwg5jL'),
                    collectionContentUri: 'ton://my-nft/collection.json',
                    nftItemContentBaseUri: 'ton://my-nft/',
                }),
                sendMode: 3,
            }).send()
        );
    }

    const getRoyaltyParams = async () => {
        const seqno = (await wallet.methods.seqno().call()) || 0;
        console.log({seqno})

        const amount = TonWeb.utils.toNano('0.05');

        console.log(
            await wallet.methods.transfer({
                secretKey: keyPair.secretKey,
                toAddress: nftCollectionAddress.toString(true, true, true),
                amount: amount,
                seqno: seqno,
                payload: await nftCollection.createGetRoyaltyParamsBody({
                    queryId: 132
                }),
                sendMode: 3,
            }).send()
        );
    }

    const nftItemAddress = new TonWeb.utils.Address('EQDhZBNuiJoWgq-0xEc0A46-nIcEKAQbS-0MkWU_I2LEp3Ty');
    console.log('nft item address=', nftItemAddress.toString(true, true, true));
    const nftItem = new NftItem(tonweb.provider, {
        address: nftItemAddress,
    });

    const getNftItemInfo = async () => {
        const data = await nftCollection.methods.getNftItemContent(nftItem);
        console.log({
            ...data,
            collectionAddress: data.collectionAddress.toString(true, true, true),
            ownerAddress: data.ownerAddress?.toString(true, true, true),
        });
    }

    const getSingleNftItemInfo = async () => {
        const nftItem = new NftItem(tonweb.provider, {
            address: 'EQC4FOmjcQAw2U-e00I-7Fs-NLiEF7lNQUxVpqOJ-ZKh-dGt',
        });

        const data = await nftItem.methods.getData();
        console.log({
            ...data,
            ownerAddress: data.ownerAddress?.toString(true, true, true),
        });

        const royaltyParams = await nftItem.getRoyaltyParams();
        console.log('nft item royalty params', {
            ...royaltyParams,
            royaltyAddress: royaltyParams.royaltyAddress?.toString(true, true, true),
        });

    }


    const marketplace = new NftMarketplace(tonweb.provider, {ownerAddress: walletAddress});
    const marketplaceAddress = await marketplace.getAddress();
    console.log('marketplace address=', marketplaceAddress.toString(true, true, true));


    const deployMarketplace = async () => {
        const seqno = (await wallet.methods.seqno().call()) || 0;
        console.log({ seqno });

        console.log(
            await wallet.methods.transfer({
                secretKey: keyPair.secretKey,
                toAddress: marketplaceAddress.toString(true, true, false), // non-bounceable
                amount: TonWeb.utils.toNano('1'),
                seqno: seqno,
                payload: null, // body
                sendMode: 3,
                stateInit: (await marketplace.createStateInit()).stateInit
            }).send()
        );
    }

    const sale = new NftSale(tonweb.provider, {
        marketplaceAddress: marketplaceAddress,
        nftAddress: nftItemAddress,
        fullPrice: TonWeb.utils.toNano('1.1'),
        marketplaceFee: TonWeb.utils.toNano('0.2'),
        royaltyAddress: nftCollectionAddress,
        royaltyAmount: TonWeb.utils.toNano('0.1'),
    });
    const saleAddress =  await sale.getAddress();
    console.log('sale address', saleAddress.toString(true, true, true));

    const transferNftItem = async () => {
        const seqno = (await wallet.methods.seqno().call()) || 0;
        console.log({ seqno });

        const amount = TonWeb.utils.toNano('0.05');

        console.log(
            await wallet.methods.transfer({
                secretKey: keyPair.secretKey,
                toAddress: await nftItem.getAddress(),
                amount: amount,
                seqno: seqno,
                payload: await nftItem.createTransferBody({
                    newOwnerAddress: saleAddress,
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
                toAddress: await nftItem.getAddress(),
                amount: amount,
                seqno: seqno,
                payload: await nftItem.createGetStaticDataBody({
                    queryId: 661
                }),
                sendMode: 3,
            }).send()
        );
    }

    const deploySale = async () => {
        const seqno = (await wallet.methods.seqno().call()) || 0;
        console.log({ seqno });

        const amount = TonWeb.utils.toNano('0.05');

        const body = new TonWeb.boc.Cell();
        body.bits.writeUint(1, 32); // OP deploy new auction
        body.bits.writeCoins(amount);
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

    const cancelSale = async () => {
        const seqno = (await wallet.methods.seqno().call()) || 0;
        console.log({ seqno });

        const amount = TonWeb.utils.toNano('1');

        console.log(
            await wallet.methods.transfer({
                secretKey: keyPair.secretKey,
                toAddress: saleAddress,
                amount,
                seqno,
                payload: await sale.createCancelBody({}),
                sendMode: 3,
            }).send()
        );
    }

    const getSaleInfo = async () => {
        const data = await sale.methods.getData();
        data.fullPrice = data.fullPrice.toString();
        data.marketplaceFee = data.marketplaceFee.toString();
        data.royaltyAmount = data.royaltyAmount.toString();
        console.log({
            ...data,
            marketplaceAddress: data.marketplaceAddress.toString(true, true, true),
            nftAddress: data.nftAddress.toString(true, true, true),
            nftOwnerAddress: data.nftOwnerAddress?.toString(true, true, true),
            royaltyAddress: data.royaltyAddress.toString(true, true, true),
        });
    };

    // await deployNftCollection();
    // await getNftCollectionInfo();
    // await deployNftItem();
    // await getNftItemInfo();
    // await getSingleNftItemInfo();
    // await deployMarketplace();
    // await deploySale();
    // await getSaleInfo();
    // await getStaticData();
    // await transferNftItem();
    // await cancelSale();
    // await changeCollectionOwner();
    // await editCollectionContent();
    // await getRoyaltyParams();

})();
