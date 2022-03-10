
import nacl from 'tweetnacl';

import { TestHttpProvider } from '../../../providers/test-http-provider';
import { bytesToBase64 } from '../../../utils/common';
import { TransferMethodParams } from '../wallet-contract';
import { WalletV4ContractR2 } from './wallet-v4-contract-r2';


(jest.useFakeTimers()
    .setSystemTime(0)
);

const testProvider = new TestHttpProvider();

const keyPair = nacl.sign.keyPair.fromSeed(
    new Uint8Array(32) // all zeroes
);


describe('WalletV4ContractR2', () => {

    it(`getAddress()`, async () => {

        const address = await (createWallet().getAddress());

        expect(address.toString(true, true, false)).toEqual(
            'UQC63Lo54ZfLTGo12UECZc8Ba3g-dEVhvzy7Vroe43-AQzAe'
        );

    });

    it(`transfer, seqno = 0`, async () => {

        const queryBocString = await getTransferQueryBocString({
            seqno: 0,
        });

        expect(queryBocString).toEqual(
            'te6ccsECFwEAA6oAAAAAdwCEAIkAjgEFAUMBigGPAZQBmQG6Ab8BzgHdAegCFwKZAtIDDANEA0sDdgPjiAF1uXRzwy+WmNRrsoIEy54C1vB86IrDfnl2rXQ9xv8AhhGPHIT1G2M+doYEDwdKiWazym34pFiNOz3avB7FM1IncA8B25THGSqrJgWFdgB8z0J3SWTyCtSa1jDqECo5VojAhTU0Yv/////gAAAAAABwARUWART/APSkE/S88sgLAgIBIAMQAgFIBAcC5tAB0NMDIXGwkl8E4CLXScEgkl8E4ALTHyGCEHBsdWe9IoIQZHN0cr2wkl8F4AP6QDAg+kQByMoHy//J0O1E0IEBQNch9AQwXIEBCPQKb6Exs5JfB+AF0z/IJYIQcGx1Z7qSODDjDQOCEGRzdHK6kl8G4w0FBgB4AfoA9AQw+CdvIjBQCqEhvvLgUIIQcGx1Z4MesXCAGFAEywUmzxZY+gIZ9ADLaRfLH1Jgyz8gyYBA+wAGAIpQBIEBCPRZMO1E0IEBQNcgyAHPFvQAye1UAXKwjiOCEGRzdHKDHrFwgBhQBcsFUAPPFiP6AhPLassfyz/JgED7AJJfA+ICASAIDwIBIAkOAgFYCgsAPbKd+1E0IEBQNch9AQwAsjKB8v/ydABgQEI9ApvoTGACASAMDQAZrc52omhAIGuQ64X/wAAZrx32omhAEGuQ64WPwAARuMl+1E0NcLH4AFm9JCtvaiaECAoGuQ+gIYRw1AgIR6STfSmRDOaQPp/5g3gSgBt4EBSJhxWfMYQE+PKDCNcYINMf0x/THwL4I7vyZO1E0NMf0x/T//QE0VFDuvKhUVG68qIF+QFUEGT5EPKj+AAkpMjLH1JAyx9SMMv/UhD0AMntVPgPAdMHIcAAn2xRkyDXSpbTB9QC+wDoMOAhwAHjACHAAuMAAcADkTDjDQOkyMsfEssfy/8REhMUAG7SB/oA1NQi+QAFyMoHFcv/ydB3dIAYyMsFywIizxZQBfoCFMtrEszMyXP7AMhAFIEBCPRR8qcCAHCBAQjXGPoA0z/IVCBHgQEI9FHyp4IQbm90ZXB0gBjIywXLAlAGzxZQBPoCFMtqEssfyz/Jc/sAAgBsgQEI1xj6ANM/MFIkgQEI9Fnyp4IQZHN0cnB0gBjIywXLAlAFzxZQA/oCE8tqyx8Syz/Jc/sAAAr0AMntVABRAAAAACmpoxc7aie8zrakLWKjqNAqbw1zZTIVdx3iQ6Y6wEihi1naKUAAZEIAXW5dHPDL5aY1GuyggTLngLW8HzoisN+eXatdD3G/wCGQINAAAAAAAAAAAAAAAAAAFYH4BA=='
        );

    });

    it(`transfer, seqno > 0`, async () => {

        const queryBocString = await getTransferQueryBocString({
            seqno: 1,
        });

        expect(queryBocString).toEqual(
            'te6ccsEBAgEAqAAAdAHhiAF1uXRzwy+WmNRrsoIEy54C1vB86IrDfnl2rXQ9xv8AhgPXm1xBCdgzWfFz1IuWwSKhKRyNMaGzX4CkUtKwQMcQoFdXEIycrtbsRVjnZQ8eKHJ5DBiq1ndGPlaVGQ928ggJTU0YuAAAAeAAAAAIABwBAGRCAF1uXRzwy+WmNRrsoIEy54C1vB86IrDfnl2rXQ9xv8AhkCDQAAAAAAAAAAAAAAAAAK9NooA='
        );

    });

});


function createWallet() {
    return new WalletV4ContractR2(
        testProvider, {
            publicKey: keyPair.publicKey,
        }
    );
}

async function getTransferQueryBocString(
    params: Partial<TransferMethodParams>
) {

    const wallet = createWallet();

    const transfer = wallet.methods.transfer({
        secretKey: keyPair.secretKey,
        toAddress: 'UQC63Lo54ZfLTGo12UECZc8Ba3g-dEVhvzy7Vroe43-AQzAe',
        amount: 1050,
        ...params,

    } as TransferMethodParams);

    const queryCell = await transfer.getQuery();
    const queryBoc = await queryCell.toBoc();

    return bytesToBase64(queryBoc);

}
