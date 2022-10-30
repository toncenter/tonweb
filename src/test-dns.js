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
        options.code = options.code || Cell.oneFromBoc('B5EE9C7241020801000164000114FF00F4A413F4BCF2C80B0102016202030202CD040502FBA1C619DBF66041AE92F152118001E5C08C41AE140F800043AE92418010A4416128BE06F0DBC0432A05A60E6205BDDA89A1F481F481F48060E04191166E8DEDD19E2D960F166EEEEEF19E2D960F93A049847F1C484DAE3A7E038E0B1C326ABE070401752791961EB19E2D920322F122E1C54C7003B663C06122B7C4E1911306070005D2F81C00936483001258C2040FA201938083001658C20407D200CB8083001A58C204064200A38083001E58C20404B2007B8083002258C204032200538083002650C20191EB83002A4E00C9D781E9C60006746F6E00E6CF16CB07C9D023C21F8E2425D71D1F01C7058E193031328200BA93C8CB0F58CF16C90191789170E2A61801DB31E031923031E27020C88B26D658CF16CB078B1748CF16CB07C9D002C2278E2103D71D2701C7058E168200BA93C8CB0F58CF16C90191789170E2A62001DB31E05B925F04E2706DD3153191');
        super(provider, options);
    }

    /**
     * @override
     * @private
     * @return {Cell}
     */
    createDataCell() {
        const cell = new Cell();
        cell.bits.writeAddress(new TonWeb.Address('EQC3dNlesgVD8YbAazcauIrXBPfiVhMMr5YYk2in0Mtsz0Bz'));
        cell.bits.writeAddress(new TonWeb.Address('EQCA14o1-VWhS2efqoh_9M1b_A9DtKTuoqfmkn83AbJzwnPi'));
        cell.bits.writeAddress(new TonWeb.Address('EQB43-VCmf17O7YMd51fAvOjcMkCw46N_3JMCoegH_ZDo40e'));
        return cell;
    }
}

async function init() {
    const tonweb = new TonWeb(new TonWeb.HttpProvider('https://testnet.toncenter.com/api/v2/jsonRPC', {apiKey: ''}));

    const dnsResolve = async () => {
        // const testnetRootDnsAddress = 'Ef_v5x0Thgr6pq6ur2NvkWhIf4DxAxsL-Nk5rknT6n99oPKX';
        // const mainnetRootDnsAddress = 'Ef-OJd0IF0yc0xkhgaAirq12WawqnUoSuE9RYO3S7McG6lDh';

        const rootAddress = await tonweb.dns.getRootDnsAddress();
        console.log('rootAddress=', rootAddress.toString(true, true, true));

        const s = 'apple.ton';

        // const cell = await tonweb.dns.resolve(s, TonWeb.dns.DNS_CATEGORY_NEXT_RESOLVER, true);
        // console.log(cell.toString(true, true, true));

        const result = await tonweb.dns.getWalletAddress('foundation.ton');
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

    const dnsItemCodeHex = 'B5EE9C7241022801000698000114FF00F4A413F4BCF2C80B0102016202030202CC04050201201E1F02012006070201481819020120080902015816170201200A0B000D470C8CB01C9D0801F73E09DBC400B434C0C05C6C2497C1383E903E900C7E800C5C75C87E800C7E800C3C0289ECE39397C15B088D148CB1C17CB865407E90350C1B5C3232C1FD00327E08E08418B9101A68608209E3402A4108308324CC200337A0404B20403C162A20032A41287E08C0683C00911DFC02440D7E08FC02F814D671C1462C200C00113E910C1C2EBCB8536003F88E34109B5F0BFA40307020F8256D8040708010C8CB055007CF165005FA0215CB6A12CB1FCB3F226EB39458CF17019132E201C901FB00E029C70091709509D31F50AAE221F008F82321BC24C0008E9E343A3A3B8E1636363737375135C705F2E196102510241023F823F00BE30EE0310DD33F256EB31FB0926C21E30D0D0E0F00FE302680698064A98452B0BEF2E19782103B9ACA0052A0A15270BC993682103B9ACA0019A193390805E220C2008E328210557CEA20F82510396D71708010C8CB055007CF165005FA0215CB6A12CB1FCB3F226EB39458CF17019132E201C901FB00923036E2803C23F823A1A120C2009313A0029130E24474F0091024F823F00B00D2343653CDA182103B9ACA005210A15270BC993682103B9ACA0016A1923005E220C2008E378210370FEC516D72295134544743708010C8CB055007CF165005FA0215CB6A12CB1FCB3F226EB39458CF17019132E201C901FB001CA10B9130E26D5477655477632EF00B0204C882105FCC3D145220BA8E9531373B5372C705F2E191109A104910384706401504E082101A0B9D515220BA8E195B32353537375135C705F2E19A03D4304015045033F823F00BE02182104EB1F0F9BAE3023B20821044BEAE41BAE302382782104ED14B65BA1310111200885B363638385147C705F2E19B04D3FF20D74AC20007D0D30701C000F2E19CF404300798D43040168307F417983050058307F45B30E270C8CB07F400C910354014F823F00B01FE30363A246EF2E19D8050F833D0F4043052408307F40E6FA1F2E19FD30721C00022C001B1F2E1A021C0008E9124109B1068517A10571046105C43144CDD9630103A395F07E201C0018E32708210370FEC51586D8100A0708010C8CB055007CF165005FA0215CB6A12CB1FCB3F226EB39458CF17019132E201C901FB00915BE21301FE8E7A37F8235006A1810258BC066E16B0F2E19E23D0D749F823F0075290BEF2E1975178A182103B9ACA00A120C2008E32102782104ED14B6558076D72708010C8CB055007CF165005FA0215CB6A12CB1FCB3F226EB39458CF17019132E201C901FB0093303535E2F82381012CA0F0024477F0091045103412F823F00BE05F041501F03502FA4021F001FA40D20031FA0082103B9ACA001DA121945314A0A1DE22D70B01C300209205A19135E220C2FFF2E192218E3E821005138D91C8500BCF16500DCF1671244B145448C0708010C8CB055007CF165005FA0215CB6A12CB1FCB3F226EB39458CF17019132E201C901FB00106994102C395BE20114008A8E3528F0018210D53276DB103946096D71708010C8CB055007CF165005FA0215CB6A12CB1FCB3F226EB39458CF17019132E201C901FB0093383430E21045103412F823F00B009A32353582102FCB26A2BA8E3A7082108B77173504C8CBFF5005CF161443308040708010C8CB055007CF165005FA0215CB6A12CB1FCB3F226EB39458CF17019132E201C901FB00E05F04840FF2F00093083001258C2040FA201938083001658C20407D200CB8083001A58C204064200A38083001E58C20404B2007B8083002258C204032200538083002650C20191EB83002A4E00C9D781E9C600069006AC0BC018060840EE6B2802A0060840EE6B2802A00A08418B9101A68608209E3402A410830856456F81B04A5A9D6A0192A4139200201201A1B0201201C1D0021081BA50C1B5C0838343E903E8034CFCC200017321400F3C5807E80B2CFF26000513B513434FFFE900835D2708027DFC07E9035353D0134CFCC0415C415B80C1C1B5B5B5B490415C415A0002B01B232FFD40173C59400F3C5B3333D0032CFF27B5520020120202102012024250013BBB39F00A175F07F008802027422230010A874F00A10475F07000CA959F00A6C71000DB8FCFF00A5F03802012026270013B64A5E014204EBE0FA1000C7B461843AE9240F152118001E5C08DE014206EBE0FA1A60E038001E5C339E8086007AE140F8001E5C33B84111C466105E033E04883DCB11FB64DDC4964AD1BA06B879240DC23572F37CC5CAAAB143A2FFFBC4180012660F003C003060FE81EDF4260F00306EB1583C';

    const dnsCollection = new DnsCollection(tonweb.provider, {
        collectionContent: createOffchainUriCell('https://dns.ton.org/collection.json'),
        dnsItemCodeHex: dnsItemCodeHex,
        code: Cell.oneFromBoc('B5EE9C7241021D010002C7000114FF00F4A413F4BCF2C80B0102016202030202CC040502012017180201200607020120131402012008090201200D0E016D420C70094840FF2F0DE01D0D3030171B0925F03E0FA403001D31FED44D0D4D4303122C000E30210245F048210370FEC51BADC840FF2F080A0201200B0C00D032F82320821062E44069BCF2E0C701F00420D74920C218F2E0C8208103F0BBF2E0C92078A908C000F2E0CA21F005F2E0CB58F00714BEF2E0CC22F9018050F833206EB38E10D0F4043052108307F40E6FA131F2D0CD9130E2C85004CF16C9C85003CF1612CCC9F00C000D1C3232C072742000331C27C074C1C07000082CE500A98200B784B98C4830003CB432600201200F100201201112004F3223880875D244B5C61673C58875D2883000082CE6C070007CB83280B50C3400A44C78B98C727420007F1C0875D2638D572E882CE38B8C00B4C1C8700B48F0802C0929BE14902E6C08B08BC8F04EAC2C48B09800F05EC4EC04AC6CC82CE500A98200B784F7B99B04AEA00093083001258C2040FA201938083001658C20407D200CB8083001A58C204064200A38083001E58C20404B2007B8083002258C204032200538083002650C20191EB83002A4E00C9D781E9C600069006AC0BC018060840EE6B2802A0060840EE6B2802A00A08418B9101A68608209E3402A410830856456F81B04A5A9D6A0192A41392002015815160039D2CF8053810F805BBC00C646582AC678B387D0165B5E66664C0207D804002D007232FFFE0A33C5B25C083232C044FD003D0032C03260001B3E401D3232C084B281F2FFF27420020120191A0201201B1C0007B8B5D318001FBA7A3ED44D0D4D43031F00A7001F00B8001BB905BED44D0D4D430307FF002128009DBA30C3020D74978A908C000F2E04620D70A07C00021D749C0085210B0935B786DE0209501D3073101DE21F0035122D71830F9018200BA93C8CB0F01820167A3ED43D8CF16C90191789170E212A0018F83DF327')
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