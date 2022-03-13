
import { bytesToBase64 } from '../../../utils/common';
import { testKeyPair, testProvider } from '../../../test/common';
import { TransferMethodParams } from '../wallet-contract';
import { WalletV4ContractR2 } from './wallet-v4-contract-r2';


describe('WalletV4ContractR2', () => {

    it(`getAddress()`, async () => {

        const address = await (createWallet().getAddress());

        expect(address.toString(true, true, false)).toEqual(
            'UQAXQH-lFETZ9KncaE4qs0XVTAYMMC2AGSKPNKhvt_Do45ym'
        );

    });

    it(`transfer, seqno = 0`, async () => {

        const queryBocString = await getTransferQueryBocString({
            seqno: 0,
        });

        expect(queryBocString).toEqual(
            'te6ccsECFwEAA6oAAAAAdwCEAIkAjgEFAUMBigGPAZQBmQG6Ab8BzgHdAegCFwKZAtIDDANEA0sDdgPjiAAugP9KKImz6VO40JxVZouqmAwYYFsAMkUeaVDfb+HRxhGHtrzrS2R2fNNbuKUoimb9x2dOMxHF9vk/SYDZJg8jYq6ltY/eCK7TLeOhz6s//hy812FDCr/GuOW0ddp/QH2hRTU0Yv/////gAAAAAABwARUWART/APSkE/S88sgLAgIBIAMQAgFIBAcC5tAB0NMDIXGwkl8E4CLXScEgkl8E4ALTHyGCEHBsdWe9IoIQZHN0cr2wkl8F4AP6QDAg+kQByMoHy//J0O1E0IEBQNch9AQwXIEBCPQKb6Exs5JfB+AF0z/IJYIQcGx1Z7qSODDjDQOCEGRzdHK6kl8G4w0FBgB4AfoA9AQw+CdvIjBQCqEhvvLgUIIQcGx1Z4MesXCAGFAEywUmzxZY+gIZ9ADLaRfLH1Jgyz8gyYBA+wAGAIpQBIEBCPRZMO1E0IEBQNcgyAHPFvQAye1UAXKwjiOCEGRzdHKDHrFwgBhQBcsFUAPPFiP6AhPLassfyz/JgED7AJJfA+ICASAIDwIBIAkOAgFYCgsAPbKd+1E0IEBQNch9AQwAsjKB8v/ydABgQEI9ApvoTGACASAMDQAZrc52omhAIGuQ64X/wAAZrx32omhAEGuQ64WPwAARuMl+1E0NcLH4AFm9JCtvaiaECAoGuQ+gIYRw1AgIR6STfSmRDOaQPp/5g3gSgBt4EBSJhxWfMYQE+PKDCNcYINMf0x/THwL4I7vyZO1E0NMf0x/T//QE0VFDuvKhUVG68qIF+QFUEGT5EPKj+AAkpMjLH1JAyx9SMMv/UhD0AMntVPgPAdMHIcAAn2xRkyDXSpbTB9QC+wDoMOAhwAHjACHAAuMAAcADkTDjDQOkyMsfEssfy/8REhMUAG7SB/oA1NQi+QAFyMoHFcv/ydB3dIAYyMsFywIizxZQBfoCFMtrEszMyXP7AMhAFIEBCPRR8qcCAHCBAQjXGPoA0z/IVCBHgQEI9FHyp4IQbm90ZXB0gBjIywXLAlAGzxZQBPoCFMtqEssfyz/Jc/sAAgBsgQEI1xj6ANM/MFIkgQEI9Fnyp4IQZHN0cnB0gBjIywXLAlAFzxZQA/oCE8tqyx8Syz/Jc/sAAAr0AMntVABRAAAAACmpoxduQF78ZRrkYMK5zVVoPMIvGF406BFBmle88IcBHu6YB0AAZEIAC6A/0ooibPpU7jQnFVmi6qYDBhgWwAyRR5pUN9v4dHGQINAAAAAAAAAAAAAAAAAAxAP1fA=='
        );

    });

    it(`transfer, seqno > 0`, async () => {

        const queryBocString = await getTransferQueryBocString({
            seqno: 1,
        });

        expect(queryBocString).toEqual(
            'te6ccsEBAgEAqAAAdAHhiAAugP9KKImz6VO40JxVZouqmAwYYFsAMkUeaVDfb+HRxgc22c9DZ1PZU1oVrkiBYj6UqcTU6NvkxZLHt3JjPvia1lfzrY+AyIa7kWQYMfoGJyz1M2fVEycw6JUbK7lqQDhBTU0YuAAAAeAAAAAIABwBAGRCAAugP9KKImz6VO40JxVZouqmAwYYFsAMkUeaVDfb+HRxkCDQAAAAAAAAAAAAAAAAALdiIC4='
        );

    });

});


function createWallet() {
    return new WalletV4ContractR2(
        testProvider, {
            publicKey: testKeyPair.publicKey,
        }
    );
}

async function getTransferQueryBocString(
    params: Partial<TransferMethodParams>
) {

    const wallet = createWallet();

    const transfer = wallet.methods.transfer({
        secretKey: testKeyPair.secretKey,
        toAddress: 'UQAXQH-lFETZ9KncaE4qs0XVTAYMMC2AGSKPNKhvt_Do45ym',
        amount: 1050,
        ...params,

    } as TransferMethodParams);

    const queryCell = await transfer.getQuery();
    const queryBoc = await queryCell.toBoc();

    return bytesToBase64(queryBoc);

}
