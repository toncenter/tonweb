const TonWeb = require("./index");

async function init() {
    const tonweb = new TonWeb(new TonWeb.HttpProvider('https://testnet.toncenter.com/api/v2/jsonRPC'));
    const storage = new TonWeb.InMemoryBlockStorage(console.log);

    const onBlock = async (blockHeader) => {
        const workchain = blockHeader.id.workchain;
        const shardId = blockHeader.id.shard;
        const blockNumber = blockHeader.id.seqno;
        console.log('BLOCK ', blockHeader);

        const blockTransactions = await tonweb.provider.getBlockTransactions(workchain, shardId, blockNumber); // todo: (tolya-yanot) `incomplete` is not handled in response
        const shortTransactions = blockTransactions.transactions;
        for (const shortTx of shortTransactions) {
            console.log('TX at ' + shortTx.account);
        }
    }

    const blockSubscribe = new TonWeb.BlockSubscription(tonweb.provider, storage, onBlock);
    await blockSubscribe.start();
}

init();
