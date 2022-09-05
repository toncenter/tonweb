
import TonWeb from '__tonweb__';

import {
    Cell as CellType,
    HttpProvider as HttpProviderType,
    TransferMethodParams,
    WalletContractOptions,

} from '__tonweb__';

import { TestHttpProvider } from '../../http-provider/test-http-provider';
import { WalletContract } from './wallet-contract';

import {
    testAddress,
    testAddressStr,
    testKeyPair,
    testProvider,

} from '../../test/common';

const { Cell } = TonWeb.boc;
const { bytesToBase64 } = TonWeb.utils;

const LockupWalletV1 = TonWeb.LockupWallets.LockupWalletV1;
const SimpleWalletContractR1 = TonWeb.Wallets.all.simpleR1;
const SimpleWalletContractR2 = TonWeb.Wallets.all.simpleR2;
const SimpleWalletContractR3 = TonWeb.Wallets.all.simpleR3;
const WalletV2ContractR1 = TonWeb.Wallets.all.v2R1;
const WalletV2ContractR2 = TonWeb.Wallets.all.v2R2;
const WalletV3ContractR1 = TonWeb.Wallets.all.v3R1;
const WalletV3ContractR2 = TonWeb.Wallets.all.v3R2;
const WalletV4ContractR1 = TonWeb.Wallets.all.v4R1;
const WalletV4ContractR2 = TonWeb.Wallets.all.v4R2;


interface WalletTestDescriptor {
    constructor: typeof WalletContract;
    name: string;
    address: string;
    addressMC: string;
    transferQueryBoc64: {
        seqno0: string;
        seqno1: string;
        seqno1SendMode: string;
        seqno1PayloadStr: string;
        seqno1PayloadMBStr: string;
        seqno1PayloadBytes: string;
        seqno1PayloadCell: string;
    };
    getSeqNo: {
        publicKey: {
            address: string,
        },
    },
    deployQueryBoc64: string;
}


/**
 * All reference values are taken from the
 * vanilla version of the library.
 *
 * @todo "addressMC" values are now taken from the output
 *        of the library directly. We need another source
 *        of truth to validate these tests.
 */
const wallets: WalletTestDescriptor[] = [
    {
        constructor: SimpleWalletContractR1 as typeof WalletContract,
        name: 'simpleR1',
        address: 'UQCf-xXXVDL87MAmMNFmxVUuohYIaXfLRjQXZ8Czp_Wo4KGM',
        addressMC: '-1:9ffb15d75432fcecc02630d166c5552ea216086977cb46341767c0b3a7f5a8e0',
        transferQueryBoc64: {
            seqno0: 'te6ccsECBAEAAQwAAAAAbgCyANgD0YgBP/Yrrqhl+dmATGGizYqqXUQsENLvloxoLs+BZ0/rUcARmHC0GF4v7v2ia5PQYlR3yUiENZSC+Jqz/m55HhKG7LIjuA6izVQ8bbmbRDuqks+xfX8e5Y0NZoY+FF2C6nGiAGAAAAAAcAECAwCE/wAg3aTyYIECANcYINcLH+1E0NMf0//RURK68qEi+QFUEET5EPKi+AAB0x8xINdKltMH1AL7AN7RpMjLH8v/ye1UAEgAAAAAbkBe/GUa5GDCuc1VaDzCLxheNOgRQZpXvPCHAR7umAcAZEIAMJXnhwXmE22prcyW4kuNJNWTaSA7Jvgrq6xCSp/iSz0QINAAAAAAAAAAAAAAAAAAyMokRQ==',
            seqno1: 'te6ccsEBAgEAnwAAawHPiAE/9iuuqGX52YBMYaLNiqpdRCwQ0u+WjGguz4FnT+tRwAcpNOW9OSOmxgtOakct2YtWaqz8Hhox9KDokvHeQ5EfAs82Jp5rdwyH0CLQV16mUJtBTsTdQz9NrMh13SjKFcAAAAAACBwBAGRCADCV54cF5hNtqa3MluJLjSTVk2kgOyb4K6usQkqf4ks9ECDQAAAAAAAAAAAAAAAAAA+T8YM=',
            seqno1SendMode: 'te6ccsEBAgEAnwAAawHPiAE/9iuuqGX52YBMYaLNiqpdRCwQ0u+WjGguz4FnT+tRwARjzmxLXfwG3cfHpxrZ8JFvCfAP43Qq2CxsPCxj+gZk3TB3ZNPqPgsrHB331cKyeyTTTUyr8OXMPNle3+BwXxg4AAAADRQBAGRCADCV54cF5hNtqa3MluJLjSTVk2kgOyb4K6usQkqf4ks9ECDQAAAAAAAAAAAAAAAAAP/DoFI=',
            seqno1PayloadMBStr: 'te6ccsEBAgEAwwAAawHPiAE/9iuuqGX52YBMYaLNiqpdRCwQ0u+WjGguz4FnT+tRwAfc+ybb1wncooL/K9NWwyHJSflepNgNKraXL/u/SUu2suZavI/qgzWIbCy8GsP+ndDFZzyLQHzva4LJN9pTuEhYAAAACBwBAKxCADCV54cF5hNtqa3MluJLjSTVk2kgOyb4K6usQkqf4ks9ECDQAAAAAAAAAAAAAAAAAAAAAAAxQjogQSwgMkI6IM6pLCAzQjog4LKELCA0Qjog8JOFsSIsVtY=',
            seqno1PayloadStr: 'te6ccsEBAgEAqAAAawHPiAE/9iuuqGX52YBMYaLNiqpdRCwQ0u+WjGguz4FnT+tRwASWxuj3KhuIvhzXrtZWJydQoOSqL8HU+RqR6ZAQ0++osenv78fO/ZWEotlFG5SjIRgQ4zq2FSp1bmIctfdQ41BgAAAACBwBAHZCADCV54cF5hNtqa3MluJLjSTVk2kgOyb4K6usQkqf4ks9ECDQAAAAAAAAAAAAAAAAAAAAAABNQVJDT/C2ebE=',
            seqno1PayloadBytes: 'te6ccsEBAgEAowAAawHPiAE/9iuuqGX52YBMYaLNiqpdRCwQ0u+WjGguz4FnT+tRwAe1pePsM1qPRWcNbKECq4BB4PDOXFg2CNILWtuCxmhhgtdF5eypYH09+VyhVcZsLGhpzaKQ2VBBzB1bGSD7Q4hwAAAACBwBAGxCADCV54cF5hNtqa3MluJLjSTVk2kgOyb4K6usQkqf4ks9ECDQAAAAAAAAAAAAAAAAAAEDAwdCBJHL',
            seqno1PayloadCell: 'te6ccsEBAgEAygAAawHPiAE/9iuuqGX52YBMYaLNiqpdRCwQ0u+WjGguz4FnT+tRwAYp92d5WX+dyw8faVifV5B+cY4Pxthsoy7o40vvTsdERWws7A6wIv4dFDgzaotsmMkguZ8qSHmbLjUGb0U/v7gYAAAACBwBALlCADCV54cF5hNtqa3MluJLjSTVk2kgOyb4K6usQkqf4ks9ECDQAAAAAAAAAAAAAAAAAKYDESiagqSGnwAYSvPDgvMJttTW5ktxJcaSasm0kB2TfBXV1iElT/ElnqBxK7JW',
        },
        getSeqNo: {
            publicKey: {
                address: '0:9ffb15d75432fcecc02630d166c5552ea216086977cb46341767c0b3a7f5a8e0',
            },
        },
        deployQueryBoc64: 'te6ccsEBAwEA1gAAbLACz4gBP/Yrrqhl+dmATGGizYqqXUQsENLvloxoLs+BZ0/rUcARn3bNU4Q/mhrTKnSqnFxIWZsURohA3ihIWz+G6v1uKsO89GIQyRkZIy+4CkcnDRDa22n46i4hap6cAOLvYk1yQaAAAAAQAQIAhP8AIN2k8mCBAgDXGCDXCx/tRNDTH9P/0VESuvKhIvkBVBBE+RDyovgAAdMfMSDXSpbTB9QC+wDe0aTIyx/L/8ntVABIAAAAAG5AXvxlGuRgwrnNVWg8wi8YXjToEUGaV7zwhwEe7pgH3yMd+g==',
    },
    {
        constructor: SimpleWalletContractR2 as typeof WalletContract,
        name: 'simpleR2',
        address: 'UQBDKdqxQ7GfG1Od7Hwlsb0b9SdkcOjr9fIu4sPJjfriMbDn',
        addressMC: '-1:4329dab143b19f1b539dec7c25b1bd1bf5276470e8ebf5f22ee2c3c98dfae231',
        transferQueryBoc64: {
            seqno0: 'te6ccsECBAEAARsAAAAAbgDBAOcD0YgAhlO1YodjPjanO9j4S2N6N+pOyOHR1+vkXcWHkxv1xGIRmHC0GF4v7v2ia5PQYlR3yUiENZSC+Jqz/m55HhKG7LIjuA6izVQ8bbmbRDuqks+xfX8e5Y0NZoY+FF2C6nGiAGAAAAAAcAECAwCi/wAg3SCCAUyXupcw7UTQ1wsf4KTyYIECANcYINcLH+1E0NMf0//RURK68qEi+QFUEET5EPKi+AAB0x8xINdKltMH1AL7AN7RpMjLH8v/ye1UAEgAAAAAbkBe/GUa5GDCuc1VaDzCLxheNOgRQZpXvPCHAR7umAcAZEIAMJXnhwXmE22prcyW4kuNJNWTaSA7Jvgrq6xCSp/iSz0QINAAAAAAAAAAAAAAAAAAgdDRPw==',
            seqno1: 'te6ccsEBAgEAnwAAawHPiACGU7Vih2M+Nqc72PhLY3o36k7I4dHX6+RdxYeTG/XEYgcpNOW9OSOmxgtOakct2YtWaqz8Hhox9KDokvHeQ5EfAs82Jp5rdwyH0CLQV16mUJtBTsTdQz9NrMh13SjKFcAAAAAACBwBAGRCADCV54cF5hNtqa3MluJLjSTVk2kgOyb4K6usQkqf4ks9ECDQAAAAAAAAAAAAAAAAAOvAhIY=',
            seqno1SendMode: 'te6ccsEBAgEAnwAAawHPiACGU7Vih2M+Nqc72PhLY3o36k7I4dHX6+RdxYeTG/XEYgRjzmxLXfwG3cfHpxrZ8JFvCfAP43Qq2CxsPCxj+gZk3TB3ZNPqPgsrHB331cKyeyTTTUyr8OXMPNle3+BwXxg4AAAADRQBAGRCADCV54cF5hNtqa3MluJLjSTVk2kgOyb4K6usQkqf4ks9ECDQAAAAAAAAAAAAAAAAABuQ1Vc=',
            seqno1PayloadStr: 'te6ccsEBAgEAqAAAawHPiACGU7Vih2M+Nqc72PhLY3o36k7I4dHX6+RdxYeTG/XEYgSWxuj3KhuIvhzXrtZWJydQoOSqL8HU+RqR6ZAQ0++osenv78fO/ZWEotlFG5SjIRgQ4zq2FSp1bmIctfdQ41BgAAAACBwBAHZCADCV54cF5hNtqa3MluJLjSTVk2kgOyb4K6usQkqf4ks9ECDQAAAAAAAAAAAAAAAAAAAAAABNQVJDT+LhqPw=',
            seqno1PayloadMBStr: 'te6ccsEBAgEAwwAAawHPiACGU7Vih2M+Nqc72PhLY3o36k7I4dHX6+RdxYeTG/XEYgfc+ybb1wncooL/K9NWwyHJSflepNgNKraXL/u/SUu2suZavI/qgzWIbCy8GsP+ndDFZzyLQHzva4LJN9pTuEhYAAAACBwBAKxCADCV54cF5hNtqa3MluJLjSTVk2kgOyb4K6usQkqf4ks9ECDQAAAAAAAAAAAAAAAAAAAAAAAxQjogQSwgMkI6IM6pLCAzQjog4LKELCA0Qjog8JOFsR9FDXI=',
            seqno1PayloadBytes: 'te6ccsEBAgEAowAAawHPiACGU7Vih2M+Nqc72PhLY3o36k7I4dHX6+RdxYeTG/XEYge1pePsM1qPRWcNbKECq4BB4PDOXFg2CNILWtuCxmhhgtdF5eypYH09+VyhVcZsLGhpzaKQ2VBBzB1bGSD7Q4hwAAAACBwBAGxCADCV54cF5hNtqa3MluJLjSTVk2kgOyb4K6usQkqf4ks9ECDQAAAAAAAAAAAAAAAAAAEDAwfys/kU',
            seqno1PayloadCell: 'te6ccsEBAgEAygAAawHPiACGU7Vih2M+Nqc72PhLY3o36k7I4dHX6+RdxYeTG/XEYgYp92d5WX+dyw8faVifV5B+cY4Pxthsoy7o40vvTsdERWws7A6wIv4dFDgzaotsmMkguZ8qSHmbLjUGb0U/v7gYAAAACBwBALlCADCV54cF5hNtqa3MluJLjSTVk2kgOyb4K6usQkqf4ks9ECDQAAAAAAAAAAAAAAAAAKYDESiagqSGnwAYSvPDgvMJttTW5ktxJcaSasm0kB2TfBXV1iElT/ElnqAfJDq7',
        },
        getSeqNo: {
            publicKey: {
                address: '0:4329dab143b19f1b539dec7c25b1bd1bf5276470e8ebf5f22ee2c3c98dfae231',
            },
        },
        deployQueryBoc64: 'te6ccsEBAwEA5QAAbL8Cz4gAhlO1YodjPjanO9j4S2N6N+pOyOHR1+vkXcWHkxv1xGIRn3bNU4Q/mhrTKnSqnFxIWZsURohA3ihIWz+G6v1uKsO89GIQyRkZIy+4CkcnDRDa22n46i4hap6cAOLvYk1yQaAAAAAQAQIAov8AIN0gggFMl7qXMO1E0NcLH+Ck8mCBAgDXGCDXCx/tRNDTH9P/0VESuvKhIvkBVBBE+RDyovgAAdMfMSDXSpbTB9QC+wDe0aTIyx/L/8ntVABIAAAAAG5AXvxlGuRgwrnNVWg8wi8YXjToEUGaV7zwhwEe7pgHWVq5hg==',
    },
    {
        constructor: SimpleWalletContractR3 as typeof WalletContract,
        name: 'simpleR3',
        address: 'UQDBDSLkInEXo_76hVZ0_zj09_rAinsXvDysWTGUX4UnWuc9',
        addressMC: '-1:c10d22e4227117a3fefa855674ff38f4f7fac08a7b17bc3cac5931945f85275a',
        transferQueryBoc64: {
            seqno0: 'te6ccsECBAEAAScAAAAAbgDNAPMD0YgBghpFyETiL0f99Qqs6f5x6e/1gRT2L3h5WLJjKL8KTrQRmHC0GF4v7v2ia5PQYlR3yUiENZSC+Jqz/m55HhKG7LIjuA6izVQ8bbmbRDuqks+xfX8e5Y0NZoY+FF2C6nGiAGAAAAAAcAECAwC6/wAg3SCCAUyXuiGCATOcurGccbDtRNDTH9cL/+ME4KTyYIECANcYINcLH+1E0NMf0//RURK68qEi+QFUEET5EPKi+AAB0x8xINdKltMH1AL7AN7RpMjLH8v/ye1UAEgAAAAAbkBe/GUa5GDCuc1VaDzCLxheNOgRQZpXvPCHAR7umAcAZEIAMJXnhwXmE22prcyW4kuNJNWTaSA7Jvgrq6xCSp/iSz0QINAAAAAAAAAAAAAAAAAA0YZWQw==',
            seqno1: 'te6ccsEBAgEAnwAAawHPiAGCGkXIROIvR/31Cqzp/nHp7/WBFPYveHlYsmMovwpOtAcpNOW9OSOmxgtOakct2YtWaqz8Hhox9KDokvHeQ5EfAs82Jp5rdwyH0CLQV16mUJtBTsTdQz9NrMh13SjKFcAAAAAACBwBAGRCADCV54cF5hNtqa3MluJLjSTVk2kgOyb4K6usQkqf4ks9ECDQAAAAAAAAAAAAAAAAAJRH3nI=',
            seqno1SendMode: 'te6ccsEBAgEAnwAAawHPiAGCGkXIROIvR/31Cqzp/nHp7/WBFPYveHlYsmMovwpOtARjzmxLXfwG3cfHpxrZ8JFvCfAP43Qq2CxsPCxj+gZk3TB3ZNPqPgsrHB331cKyeyTTTUyr8OXMPNle3+BwXxg4AAAADRQBAGRCADCV54cF5hNtqa3MluJLjSTVk2kgOyb4K6usQkqf4ks9ECDQAAAAAAAAAAAAAAAAAGQXj6M=',
            seqno1PayloadStr: 'te6ccsEBAgEAqAAAawHPiAGCGkXIROIvR/31Cqzp/nHp7/WBFPYveHlYsmMovwpOtASWxuj3KhuIvhzXrtZWJydQoOSqL8HU+RqR6ZAQ0++osenv78fO/ZWEotlFG5SjIRgQ4zq2FSp1bmIctfdQ41BgAAAACBwBAHZCADCV54cF5hNtqa3MluJLjSTVk2kgOyb4K6usQkqf4ks9ECDQAAAAAAAAAAAAAAAAAAAAAABNQVJDTwVn+54=',
            seqno1PayloadMBStr: 'te6ccsEBAgEAwwAAawHPiAGCGkXIROIvR/31Cqzp/nHp7/WBFPYveHlYsmMovwpOtAfc+ybb1wncooL/K9NWwyHJSflepNgNKraXL/u/SUu2suZavI/qgzWIbCy8GsP+ndDFZzyLQHzva4LJN9pTuEhYAAAACBwBAKxCADCV54cF5hNtqa3MluJLjSTVk2kgOyb4K6usQkqf4ks9ECDQAAAAAAAAAAAAAAAAAAAAAAAxQjogQSwgMkI6IM6pLCAzQjog4LKELCA0Qjog8JOFsZO8AHs=',
            seqno1PayloadBytes: 'te6ccsEBAgEAowAAawHPiAGCGkXIROIvR/31Cqzp/nHp7/WBFPYveHlYsmMovwpOtAe1pePsM1qPRWcNbKECq4BB4PDOXFg2CNILWtuCxmhhgtdF5eypYH09+VyhVcZsLGhpzaKQ2VBBzB1bGSD7Q4hwAAAACBwBAGxCADCV54cF5hNtqa3MluJLjSTVk2kgOyb4K6usQkqf4ks9ECDQAAAAAAAAAAAAAAAAAAEDAwccvfrf',
            seqno1PayloadCell: 'te6ccsEBAgEAygAAawHPiAGCGkXIROIvR/31Cqzp/nHp7/WBFPYveHlYsmMovwpOtAYp92d5WX+dyw8faVifV5B+cY4Pxthsoy7o40vvTsdERWws7A6wIv4dFDgzaotsmMkguZ8qSHmbLjUGb0U/v7gYAAAACBwBALlCADCV54cF5hNtqa3MluJLjSTVk2kgOyb4K6usQkqf4ks9ECDQAAAAAAAAAAAAAAAAAKYDESiagqSGnwAYSvPDgvMJttTW5ktxJcaSasm0kB2TfBXV1iElT/ElnqAyuGlL',
        },
        getSeqNo: {
            publicKey: {
                address: '0:c10d22e4227117a3fefa855674ff38f4f7fac08a7b17bc3cac5931945f85275a',
            },
        },
        deployQueryBoc64: 'te6ccsEBAwEA8QAAbMsCz4gBghpFyETiL0f99Qqs6f5x6e/1gRT2L3h5WLJjKL8KTrQRn3bNU4Q/mhrTKnSqnFxIWZsURohA3ihIWz+G6v1uKsO89GIQyRkZIy+4CkcnDRDa22n46i4hap6cAOLvYk1yQaAAAAAQAQIAuv8AIN0gggFMl7ohggEznLqxnHGw7UTQ0x/XC//jBOCk8mCBAgDXGCDXCx/tRNDTH9P/0VESuvKhIvkBVBBE+RDyovgAAdMfMSDXSpbTB9QC+wDe0aTIyx/L/8ntVABIAAAAAG5AXvxlGuRgwrnNVWg8wi8YXjToEUGaV7zwhwEe7pgHk59Yow==',
    },
    {
        constructor: WalletV2ContractR1 as typeof WalletContract,
        name: 'v2R1',
        address: 'UQBqaW_l01UTgXodOeJXEDHBBw0GfgCO_imXDn3Oo8EmiUOV',
        addressMC: '-1:6a696fe5d35513817a1d39e2571031c1070d067e008efe29970e7dcea3c12689',
        transferQueryBoc64: {
            seqno0: 'te6ccsECBAEAASMAAAAAcgDJAO8D2YgA1NLfy6aqJwL0OnPEriBjgg4aDPwBHfxTLhz7nUeCTRIRiGMlQ7IhKLIq+ILAAxQnNEehl7PETZ+1epQfI8i3/xNkFRZp3lstMXfKyNMgylvldZzQeE1Tmpw9HAfscd52YQAAAAAf////4HABAgMAqv8AIN0gggFMl7qXMO1E0NcLH+Ck8mCDCNcYINMf0x8B+CO78mPtRNDTH9P/0VExuvKhA/kBVBBC+RDyovgAApMg10qW0wfUAvsA6NGkyMsfy//J7VQASAAAAABuQF78ZRrkYMK5zVVoPMIvGF406BFBmle88IcBHu6YBwBkQgAwleeHBeYTbamtzJbiS40k1ZNpIDsm+CurrEJKn+JLPRAg0AAAAAAAAAAAAAAAAABTZd8j',
            seqno1: 'te6ccsEBAgEAowAAbwHXiADU0t/LpqonAvQ6c8SuIGOCDhoM/AEd/FMuHPudR4JNEgEhboCknddPXymgNr4EPkBupX46W/zobYWixxjrvuEIU7ZN9nuLsLFB/jX5ZPKsAMUBiXxua1MBZZOpIjs/mWgYAAAACAAAAeAcAQBkQgAwleeHBeYTbamtzJbiS40k1ZNpIDsm+CurrEJKn+JLPRAg0AAAAAAAAAAAAAAAAAAvHENq',
            seqno1SendMode: 'te6ccsEBAgEAowAAbwHXiADU0t/LpqonAvQ6c8SuIGOCDhoM/AEd/FMuHPudR4JNEgfHMUrci+4FnLrOWcFrSQddQ7Y/rESsAxE2o2kkYKovZ/Df8sFR1rTjyz3QpeztVdyyQSOtJTzjRWKkem2n48BwAAAACAAAAeUUAQBkQgAwleeHBeYTbamtzJbiS40k1ZNpIDsm+CurrEJKn+JLPRAg0AAAAAAAAAAAAAAAAAAjwU/e',
            seqno1PayloadStr: 'te6ccsEBAgEArAAAbwHXiADU0t/LpqonAvQ6c8SuIGOCDhoM/AEd/FMuHPudR4JNEgSijhIW1xy0tNp/56JjCAvGt55pgpsOpdThpE4YJ/ysKA7jAW/4QZQznHVtspb2wy3b36Eny2cdslbKfL2B6zhYAAAACAAAAeAcAQB2QgAwleeHBeYTbamtzJbiS40k1ZNpIDsm+CurrEJKn+JLPRAg0AAAAAAAAAAAAAAAAAAAAAAATUFSQ08pwFzu',
            seqno1PayloadMBStr: 'te6ccsEBAgEAxwAAbwHXiADU0t/LpqonAvQ6c8SuIGOCDhoM/AEd/FMuHPudR4JNEgCI2CCGS4Hz7h8/jUz/Mfb9yeRjVbdOvvRmrRZDb8nf/8EBIr6z5hUC/t8nd59DIJkBBvJuybWarnr57fVoVhhwAAAACAAAAeAcAQCsQgAwleeHBeYTbamtzJbiS40k1ZNpIDsm+CurrEJKn+JLPRAg0AAAAAAAAAAAAAAAAAAAAAAAMUI6IEEsIDJCOiDOqSwgM0I6IOCyhCwgNEI6IPCThbEv44ck',
            seqno1PayloadBytes: 'te6ccsEBAgEApwAAbwHXiADU0t/LpqonAvQ6c8SuIGOCDhoM/AEd/FMuHPudR4JNEgXNUPLk6TjMQ4FT9R7bIT3Dye74axQxb1o+eJeflj2Zn+yIPrwQlA4j8AS2u46H6qBuyyLnKFDAnYy8kSHBT6gwAAAACAAAAeAcAQBsQgAwleeHBeYTbamtzJbiS40k1ZNpIDsm+CurrEJKn+JLPRAg0AAAAAAAAAAAAAAAAAABAwMHipIsFg==',
            seqno1PayloadCell: 'te6ccsEBAgEAzgAAbwHXiADU0t/LpqonAvQ6c8SuIGOCDhoM/AEd/FMuHPudR4JNEgBfAW+furxHpPBy/TDkoE1MEQCwzqKGQr77rROZ6CtF8YlAsLNc0OZprW1N0CxiKJBa+UM29lUr5fNmDpVozlAoAAAACAAAAeAcAQC5QgAwleeHBeYTbamtzJbiS40k1ZNpIDsm+CurrEJKn+JLPRAg0AAAAAAAAAAAAAAAAACmAxEomoKkhp8AGErzw4LzCbbU1uZLcSXGkmrJtJAdk3wV1dYhJU/xJZ6geTY0Lg==',
        },
        getSeqNo: {
            publicKey: {
                address: '0:6a696fe5d35513817a1d39e2571031c1070d067e008efe29970e7dcea3c12689',
            },
        },
        deployQueryBoc64: 'te6ccsEBAwEA7QAAcMcC14gA1NLfy6aqJwL0OnPEriBjgg4aDPwBHfxTLhz7nUeCTRIRlCLVnP1vxGP/tFM4/X4DDtZT2WnAaAK2WRNOQOo1ibBvRz26QsqRg9w/R9B3tS387aizOfda8Q+1ofo1c2q5wCAAAAAf////8AECAKr/ACDdIIIBTJe6lzDtRNDXCx/gpPJggwjXGCDTH9MfAfgju/Jj7UTQ0x/T/9FRMbryoQP5AVQQQvkQ8qL4AAKTINdKltMH1AL7AOjRpMjLH8v/ye1UAEgAAAAAbkBe/GUa5GDCuc1VaDzCLxheNOgRQZpXvPCHAR7umAc+ytgd',
    },
    {
        constructor: WalletV2ContractR2 as typeof WalletContract,
        name: 'v2R2',
        address: 'UQCcSX5DqU2kmjtzsprXaKVfYhFTpUnzLvaZAeQT_f_fHI_s',
        addressMC: '-1:9c497e43a94da49a3b73b29ad768a55f621153a549f32ef69901e413fdffdf1c',
        transferQueryBoc64: {
            seqno0: 'te6ccsECBAEAAS8AAAAAcgDVAPsD2YgBOJL8h1KbSTR252U1rtFKvsQip0qT5l3tMgPIJ/v/vjgRiGMlQ7IhKLIq+ILAAxQnNEehl7PETZ+1epQfI8i3/xNkFRZp3lstMXfKyNMgylvldZzQeE1Tmpw9HAfscd52YQAAAAAf////4HABAgMAwv8AIN0gggFMl7ohggEznLqxnHGw7UTQ0x/XC//jBOCk8mCDCNcYINMf0x8B+CO78mPtRNDTH9P/0VExuvKhA/kBVBBC+RDyovgAApMg10qW0wfUAvsA6NGkyMsfy//J7VQASAAAAABuQF78ZRrkYMK5zVVoPMIvGF406BFBmle88IcBHu6YBwBkQgAwleeHBeYTbamtzJbiS40k1ZNpIDsm+CurrEJKn+JLPRAg0AAAAAAAAAAAAAAAAACRGNmc',
            seqno1: 'te6ccsEBAgEAowAAbwHXiAE4kvyHUptJNHbnZTWu0Uq+xCKnSpPmXe0yA8gn+/++OAEhboCknddPXymgNr4EPkBupX46W/zobYWixxjrvuEIU7ZN9nuLsLFB/jX5ZPKsAMUBiXxua1MBZZOpIjs/mWgYAAAACAAAAeAcAQBkQgAwleeHBeYTbamtzJbiS40k1ZNpIDsm+CurrEJKn+JLPRAg0AAAAAAAAAAAAAAAAACkoGjz',
            seqno1SendMode: 'te6ccsEBAgEAowAAbwHXiAE4kvyHUptJNHbnZTWu0Uq+xCKnSpPmXe0yA8gn+/++OAfHMUrci+4FnLrOWcFrSQddQ7Y/rESsAxE2o2kkYKovZ/Df8sFR1rTjyz3QpeztVdyyQSOtJTzjRWKkem2n48BwAAAACAAAAeUUAQBkQgAwleeHBeYTbamtzJbiS40k1ZNpIDsm+CurrEJKn+JLPRAg0AAAAAAAAAAAAAAAAACofWRH',
            seqno1PayloadStr: 'te6ccsEBAgEArAAAbwHXiAE4kvyHUptJNHbnZTWu0Uq+xCKnSpPmXe0yA8gn+/++OASijhIW1xy0tNp/56JjCAvGt55pgpsOpdThpE4YJ/ysKA7jAW/4QZQznHVtspb2wy3b36Eny2cdslbKfL2B6zhYAAAACAAAAeAcAQB2QgAwleeHBeYTbamtzJbiS40k1ZNpIDsm+CurrEJKn+JLPRAg0AAAAAAAAAAAAAAAAAAAAAAATUFSQ0/auPiv',
            seqno1PayloadMBStr: 'te6ccsEBAgEAxwAAbwHXiAE4kvyHUptJNHbnZTWu0Uq+xCKnSpPmXe0yA8gn+/++OACI2CCGS4Hz7h8/jUz/Mfb9yeRjVbdOvvRmrRZDb8nf/8EBIr6z5hUC/t8nd59DIJkBBvJuybWarnr57fVoVhhwAAAACAAAAeAcAQCsQgAwleeHBeYTbamtzJbiS40k1ZNpIDsm+CurrEJKn+JLPRAg0AAAAAAAAAAAAAAAAAAAAAAAMUI6IEEsIDJCOiDOqSwgM0I6IOCyhCwgNEI6IPCThbHqgupP',
            seqno1PayloadBytes: 'te6ccsEBAgEApwAAbwHXiAE4kvyHUptJNHbnZTWu0Uq+xCKnSpPmXe0yA8gn+/++OAXNUPLk6TjMQ4FT9R7bIT3Dye74axQxb1o+eJeflj2Zn+yIPrwQlA4j8AS2u46H6qBuyyLnKFDAnYy8kSHBT6gwAAAACAAAAeAcAQBsQgAwleeHBeYTbamtzJbiS40k1ZNpIDsm+CurrEJKn+JLPRAg0AAAAAAAAAAAAAAAAAABAwMHkHXGUA==',
            seqno1PayloadCell: 'te6ccsEBAgEAzgAAbwHXiAE4kvyHUptJNHbnZTWu0Uq+xCKnSpPmXe0yA8gn+/++OABfAW+furxHpPBy/TDkoE1MEQCwzqKGQr77rROZ6CtF8YlAsLNc0OZprW1N0CxiKJBa+UM29lUr5fNmDpVozlAoAAAACAAAAeAcAQC5QgAwleeHBeYTbamtzJbiS40k1ZNpIDsm+CurrEJKn+JLPRAg0AAAAAAAAAAAAAAAAACmAxEomoKkhp8AGErzw4LzCbbU1uZLcSXGkmrJtJAdk3wV1dYhJU/xJZ6gVlTh0Q==',
        },
        getSeqNo: {
            publicKey: {
                address: '0:9c497e43a94da49a3b73b29ad768a55f621153a549f32ef69901e413fdffdf1c',
            },
        },
        deployQueryBoc64: 'te6ccsEBAwEA+QAAcNMC14gBOJL8h1KbSTR252U1rtFKvsQip0qT5l3tMgPIJ/v/vjgRlCLVnP1vxGP/tFM4/X4DDtZT2WnAaAK2WRNOQOo1ibBvRz26QsqRg9w/R9B3tS387aizOfda8Q+1ofo1c2q5wCAAAAAf////8AECAML/ACDdIIIBTJe6IYIBM5y6sZxxsO1E0NMf1wv/4wTgpPJggwjXGCDTH9MfAfgju/Jj7UTQ0x/T/9FRMbryoQP5AVQQQvkQ8qL4AAKTINdKltMH1AL7AOjRpMjLH8v/ye1UAEgAAAAAbkBe/GUa5GDCuc1VaDzCLxheNOgRQZpXvPCHAR7umAebvxrB',
    },
    {
        constructor: WalletV3ContractR1 as typeof WalletContract,
        name: 'v3R1',
        address: 'UQDBk9eyBPS8hRgkiia-_fcI7RvTFeaSJe-kU3Uu9Vk0iMRt',
        addressMC: '-1:81b37761c0022922fae092502ce0a53b6513b2b5e8edbf45f1318c59ab9c352b',
        transferQueryBoc64: {
            seqno0: 'te6ccsECBAEAATYAAAAAdgDYAQID4YgBgyevZAnpeQowSRRNffvuEdo3pivNJEvfSKbqXeqyaRARgAPLAYDSdGohsRZBI7DkyHYR9iHffT7Uf9Qg9IZ7E4iEFbvonQF/vizRbAWqdCpM02X5tPG5cEOBcypTz3JxoOU1NGL/////4AAAAABwAQIDAMD/ACDdIIIBTJe6lzDtRNDXCx/gpPJggwjXGCDTH9Mf0x/4IxO78mPtRNDTH9Mf0//RUTK68qFRRLryogT5AVQQVfkQ8qP4AJMg10qW0wfUAvsA6NEBpMjLH8sfy//J7VQAUAAAAAApqaMXbkBe/GUa5GDCuc1VaDzCLxheNOgRQZpXvPCHAR7umAcAZEIAMJXnhwXmE22prcyW4kuNJNWTaSA7Jvgrq6xCSp/iSz0QINAAAAAAAAAAAAAAAAAA/tvrZA==',
            seqno1: 'te6ccsEBAgEApwAAcwHfiAGDJ69kCel5CjBJFE19++4R2jemK80kS99Ipupd6rJpEAO40I7yAP5KBVYZSEPBElrAQLJMDwKmFqvotV86hRMVEpP2O7TB2ohSh6+PHfmTmJbguZmozI7OBZQLmjHUswhZTU0YuAAAAeAAAAAIHAEAZEIAMJXnhwXmE22prcyW4kuNJNWTaSA7Jvgrq6xCSp/iSz0QINAAAAAAAAAAAAAAAAAA12MdCg==',
            seqno1SendMode: 'te6ccsEBAgEApwAAcwHfiAGDJ69kCel5CjBJFE19++4R2jemK80kS99Ipupd6rJpEANkQrxZtZruCZHO5W8SWcaMGcTI2974586W5Vhbp7jw/yNLZpKmWQJZIPk065/tnoJwnGa/UxWArvigOkoSpeBJTU0YuAAAAeAAAAANFAEAZEIAMJXnhwXmE22prcyW4kuNJNWTaSA7Jvgrq6xCSp/iSz0QINAAAAAAAAAAAAAAAAAAMbAHUA==',
            seqno1PayloadStr: 'te6ccsEBAgEAsAAAcwHfiAGDJ69kCel5CjBJFE19++4R2jemK80kS99Ipupd6rJpEAK2kz8EDEhYeCtXyD8t4mYDhABBvfPUrpqndnU2kJ4T5xtANurtooUvPOh+gitsSoDgQfGV5WRhMhLLyNU7+7ARTU0YuAAAAeAAAAAIHAEAdkIAMJXnhwXmE22prcyW4kuNJNWTaSA7Jvgrq6xCSp/iSz0QINAAAAAAAAAAAAAAAAAAAAAAAE1BUkNPDprh7Q==',
            seqno1PayloadMBStr: 'te6ccsEBAgEAywAAcwHfiAGDJ69kCel5CjBJFE19++4R2jemK80kS99Ipupd6rJpEAKPBFK6zQY5wRmlXkFF39n7jUyMOrBBqOVneLnDMEENE6pXX/2VHSCZtJ6WlQnN4cMMHnMEd8M8LeyWDIwQRhhZTU0YuAAAAeAAAAAIHAEArEIAMJXnhwXmE22prcyW4kuNJNWTaSA7Jvgrq6xCSp/iSz0QINAAAAAAAAAAAAAAAAAAAAAAADFCOiBBLCAyQjogzqksIDNCOiDgsoQsIDRCOiDwk4WxP1OlAQ==',
            seqno1PayloadBytes: 'te6ccsEBAgEAqwAAcwHfiAGDJ69kCel5CjBJFE19++4R2jemK80kS99Ipupd6rJpEAYcXYUgqGh8CuIV0VMtLfZBmiXKd2J8eHmPnbMW7dsFfQeK7f3vlF+qMdKTSjMZEN9g/8upvwxLYWXr97T/S8gpTU0YuAAAAeAAAAAIHAEAbEIAMJXnhwXmE22prcyW4kuNJNWTaSA7Jvgrq6xCSp/iSz0QINAAAAAAAAAAAAAAAAAAAQMDB0O5GpE=',
            seqno1PayloadCell: 'te6ccsEBAgEA0gAAcwHfiAGDJ69kCel5CjBJFE19++4R2jemK80kS99Ipupd6rJpEAcnxHrY9AiFYGJ8aribUAvVbOxkpHjufcXiZ2rYthizHL8JwWwFmhcdXs7evMgBhuZrrYR/idsnI1dkxgtfHzBxTU0YuAAAAeAAAAAIHAEAuUIAMJXnhwXmE22prcyW4kuNJNWTaSA7Jvgrq6xCSp/iSz0QINAAAAAAAAAAAAAAAAAApgMRKJqCpIafABhK88OC8wm21NbmS3ElxpJqybSQHZN8FdXWISVP8SWeoDJz9PM=',
        },
        getSeqNo: {
            publicKey: {
                address: '0:c193d7b204f4bc8518248a26befdf708ed1bd315e69225efa453752ef5593488',
            },
        },
        deployQueryBoc64: 'te6ccsECAwEAAQAAAAAAdADWAt+IAYMnr2QJ6XkKMEkUTX377hHaN6YrzSRL30im6l3qsmkQEYZk9wGjw3psrSHrCMnc8zLv3yrzv5mIWSqMGTgPzUVSqzoCKDBWxE5SBRsu/cab67velH6HXBzIzQkrxBlya2EFNTRi/////+AAAAAQAQIAwP8AIN0gggFMl7qXMO1E0NcLH+Ck8mCDCNcYINMf0x/TH/gjE7vyY+1E0NMf0x/T/9FRMrryoVFEuvKiBPkBVBBV+RDyo/gAkyDXSpbTB9QC+wDo0QGkyMsfyx/L/8ntVABQAAAAACmpoxduQF78ZRrkYMK5zVVoPMIvGF406BFBmle88IcBHu6YByUCCpY=',
    },
    {
        constructor: WalletV3ContractR2 as typeof WalletContract,
        name: 'v3R2',
        address: 'UQCU89Iml8w3kH99CfW6C0cN78h3AqGuOYs3CK-5fdfagR6C',
        addressMC: '-1:46b1c9d585f8daffe65ad4c40eb6ff4b4edddf6e793ff881920259678d9b4129',
        transferQueryBoc64: {
            seqno0: 'te6ccsECBAEAAUUAAAAAdgDnARED4YgBKeekTS+YbyD++hPrdBaOG9+Q7gVDXHMWbhFfcvuvtQIRgAPLAYDSdGohsRZBI7DkyHYR9iHffT7Uf9Qg9IZ7E4iEFbvonQF/vizRbAWqdCpM02X5tPG5cEOBcypTz3JxoOU1NGL/////4AAAAABwAQIDAN7/ACDdIIIBTJe6IYIBM5y6sZ9xsO1E0NMf0x8x1wv/4wTgpPJggwjXGCDTH9Mf0x/4IxO78mPtRNDTH9Mf0//RUTK68qFRRLryogT5AVQQVfkQ8qP4AJMg10qW0wfUAvsA6NEBpMjLH8sfy//J7VQAUAAAAAApqaMXbkBe/GUa5GDCuc1VaDzCLxheNOgRQZpXvPCHAR7umAcAZEIAMJXnhwXmE22prcyW4kuNJNWTaSA7Jvgrq6xCSp/iSz0QINAAAAAAAAAAAAAAAAAAuUEbxA==',
            seqno1: 'te6ccsEBAgEApwAAcwHfiAEp56RNL5hvIP76E+t0Fo4b35DuBUNccxZuEV9y+6+1AgO40I7yAP5KBVYZSEPBElrAQLJMDwKmFqvotV86hRMVEpP2O7TB2ohSh6+PHfmTmJbguZmozI7OBZQLmjHUswhZTU0YuAAAAeAAAAAIHAEAZEIAMJXnhwXmE22prcyW4kuNJNWTaSA7Jvgrq6xCSp/iSz0QINAAAAAAAAAAAAAAAAAAIIlHhw==',
            seqno1SendMode: 'te6ccsEBAgEApwAAcwHfiAEp56RNL5hvIP76E+t0Fo4b35DuBUNccxZuEV9y+6+1AgNkQrxZtZruCZHO5W8SWcaMGcTI2974586W5Vhbp7jw/yNLZpKmWQJZIPk065/tnoJwnGa/UxWArvigOkoSpeBJTU0YuAAAAeAAAAANFAEAZEIAMJXnhwXmE22prcyW4kuNJNWTaSA7Jvgrq6xCSp/iSz0QINAAAAAAAAAAAAAAAAAAxlpd3Q==',
            seqno1PayloadStr: 'te6ccsEBAgEAsAAAcwHfiAEp56RNL5hvIP76E+t0Fo4b35DuBUNccxZuEV9y+6+1AgK2kz8EDEhYeCtXyD8t4mYDhABBvfPUrpqndnU2kJ4T5xtANurtooUvPOh+gitsSoDgQfGV5WRhMhLLyNU7+7ARTU0YuAAAAeAAAAAIHAEAdkIAMJXnhwXmE22prcyW4kuNJNWTaSA7Jvgrq6xCSp/iSz0QINAAAAAAAAAAAAAAAAAAAAAAAE1BUkNP8LB5aA==',
            seqno1PayloadMBStr: 'te6ccsEBAgEAywAAcwHfiAEp56RNL5hvIP76E+t0Fo4b35DuBUNccxZuEV9y+6+1AgKPBFK6zQY5wRmlXkFF39n7jUyMOrBBqOVneLnDMEENE6pXX/2VHSCZtJ6WlQnN4cMMHnMEd8M8LeyWDIwQRhhZTU0YuAAAAeAAAAAIHAEArEIAMJXnhwXmE22prcyW4kuNJNWTaSA7Jvgrq6xCSp/iSz0QINAAAAAAAAAAAAAAAAAAAAAAADFCOiBBLCAyQjogzqksIDNCOiDgsoQsIDRCOiDwk4WxnAPkRg==',
            seqno1PayloadBytes: 'te6ccsEBAgEAqwAAcwHfiAEp56RNL5hvIP76E+t0Fo4b35DuBUNccxZuEV9y+6+1AgYcXYUgqGh8CuIV0VMtLfZBmiXKd2J8eHmPnbMW7dsFfQeK7f3vlF+qMdKTSjMZEN9g/8upvwxLYWXr97T/S8gpTU0YuAAAAeAAAAAIHAEAbEIAMJXnhwXmE22prcyW4kuNJNWTaSA7Jvgrq6xCSp/iSz0QINAAAAAAAAAAAAAAAAAAAQMDB9nhONI=',
            seqno1PayloadCell: 'te6ccsEBAgEA0gAAcwHfiAEp56RNL5hvIP76E+t0Fo4b35DuBUNccxZuEV9y+6+1AgcnxHrY9AiFYGJ8aribUAvVbOxkpHjufcXiZ2rYthizHL8JwWwFmhcdXs7evMgBhuZrrYR/idsnI1dkxgtfHzBxTU0YuAAAAeAAAAAIHAEAuUIAMJXnhwXmE22prcyW4kuNJNWTaSA7Jvgrq6xCSp/iSz0QINAAAAAAAAAAAAAAAAAApgMRKJqCpIafABhK88OC8wm21NbmS3ElxpJqybSQHZN8FdXWISVP8SWeoNkCKvA=',
        },
        getSeqNo: {
            publicKey: {
                address: '0:94f3d22697cc37907f7d09f5ba0b470defc87702a1ae398b3708afb97dd7da81',
            },
        },
        deployQueryBoc64: 'te6ccsECAwEAAQ8AAAAAdADlAt+IASnnpE0vmG8g/voT63QWjhvfkO4FQ1xzFm4RX3L7r7UCEYZk9wGjw3psrSHrCMnc8zLv3yrzv5mIWSqMGTgPzUVSqzoCKDBWxE5SBRsu/cab67velH6HXBzIzQkrxBlya2EFNTRi/////+AAAAAQAQIA3v8AIN0gggFMl7ohggEznLqxn3Gw7UTQ0x/THzHXC//jBOCk8mCDCNcYINMf0x/TH/gjE7vyY+1E0NMf0x/T/9FRMrryoVFEuvKiBPkBVBBV+RDyo/gAkyDXSpbTB9QC+wDo0QGkyMsfyx/L/8ntVABQAAAAACmpoxduQF78ZRrkYMK5zVVoPMIvGF406BFBmle88IcBHu6YB+QHkFg=',
    },
    {
        constructor: WalletV4ContractR1 as typeof WalletContract,
        name: 'v4R1',
        address: 'UQBvyw32ljifmyOUweifrTOlL6-nxrvsevTDzK0gCj4vd4Ir',
        addressMC: '-1:eb77e95198ab4d4ff5f02ff0dddb3294005cc823129cf94e0f11043418ab95d5',
        transferQueryBoc64: {
            seqno0: 'te6ccsECGAEAA8sAAAAAdwCEAIkAjgEKATQBXwGqAa8BtAG5AdoB3wHuAf0CCAI3ArkC8gMqA2UDbAOXA+OIAN+WG+0scT82RymD0T9aZ0pfX0+Nd9j16YeZWkAUfF7uEZ72DzocWaLbNDfF4HXijOGLe5ydJ3vYddZXFwCTCQecHNjauZoxBAunU0gCybotb7gRhNWVu/y/QHKx05xsGgFFNTRi/////+AAAAAAAHABFhcBFP8A9KQT9LzyyAsCAgEgAxECAUgECAPu0AHQ0wMBcbCRW+Ah10nBIJFb4AHTHyGCEHBsdWe9IoIQYmxuY72wIoIQZHN0cr2wkl8D4AL6QDAg+kQByMoHy//J0O1E0IEBQNch9AQwXIEBCPQKb6Exs5JfBeAE0z/IJYIQcGx1Z7qRMeMNJIIQYmxuY7rjAAQFBgcAUAH6APQEMIIQcGx1Z4MesXCAGFAFywUnzxZQA/oC9AASy2nLH1IQyz8AUvgnbyKCEGJsbmODHrFwgBhQBcsFJ88WJPoCFMtqE8sfUjDLPwH6AvQAAJKCEGRzdHK6jjUEgQEI9Fkw7UTQgQFA1yDIAc8W9ADJ7VSCEGRzdHKDHrFwgBhQBMsFWM8WIvoCEstqyx/LP5QQNF8E4smAQPsAAgEgCRACASAKDwIBWAsMAD2ynftRNCBAUDXIfQEMALIygfL/8nQAYEBCPQKb6ExgAgEgDQ4AGa3OdqJoQCBrkOuF/8AAGa8d9qJoQBBrkOuFj8AAEbjJftRNDXCx+ABZvSQrb2omhAgKBrkPoCGEcNQICEekk30pkQzmkD6f+YN4EoAbeBAUiYcVnzGEBPjygwjXGCDTH9Mf0x8C+CO78mPtRNDTH9Mf0//0BNFRQ7ryoVFRuvKiBfkBVBBk+RDyo/gAJKTIyx9SQMsfUjDL/1IQ9ADJ7VT4DwHTByHAAJ9sUZMg10qW0wfUAvsA6DDgIcAB4wAhwALjAAHAA5Ew4w0DpMjLHxLLH8v/EhMUFQBu0gf6ANTUIvkABcjKBxXL/8nQd3SAGMjLBcsCIs8WUAX6AhTLaxLMzMlx+wDIQBSBAQj0UfKnAgBsgQEI1xjIVCAlgQEI9FHyp4IQbm90ZXB0gBjIywXLAlAEzxaCEAX14QD6AhPLahLLH8lx+wACAHKBAQjXGDBSAoEBCPRZ8qf4JYIQZHN0cnB0gBjIywXLAlAFzxaCEAX14QD6AhTLahPLHxLLP8lz+wAACvQAye1UAFEAAAAAKamjF25AXvxlGuRgwrnNVWg8wi8YXjToEUGaV7zwhwEe7pgHQABkQgAwleeHBeYTbamtzJbiS40k1ZNpIDsm+CurrEJKn+JLPRAg0AAAAAAAAAAAAAAAAAC+hTbf',
            seqno1: 'te6ccsEBAgEAqAAAdAHhiADflhvtLHE/Nkcpg9E/WmdKX19PjXfY9emHmVpAFHxe7gXP0W/9tn/isLJHocZm+X+rkUKUaHcayZHnkXBxatUcOZVTw2Eh1n8al8OUhOTEg23d1SWkpws9C9ymkVPlZeghTU0YuAAAAeAAAAAIABwBAGRCADCV54cF5hNtqa3MluJLjSTVk2kgOyb4K6usQkqf4ks9ECDQAAAAAAAAAAAAAAAAAGJC4fI=',
            seqno1SendMode: 'te6ccsEBAgEAqAAAdAHhiADflhvtLHE/Nkcpg9E/WmdKX19PjXfY9emHmVpAFHxe7gVxb6uEci8zG/ytVSIksPVS0EM3SdNGMsKWVD8tn7ehHYFN5r+yGM6zpsMUHmMIsd0bdQyS+zzpE4rI7TrrdLABTU0YuAAAAeAAAAAIBRQBAGRCADCV54cF5hNtqa3MluJLjSTVk2kgOyb4K6usQkqf4ks9ECDQAAAAAAAAAAAAAAAAADRAvgE=',
            seqno1PayloadStr: 'te6ccsEBAgEAsQAAdAHhiADflhvtLHE/Nkcpg9E/WmdKX19PjXfY9emHmVpAFHxe7gQcXZAHlMckwaT5WnUj6ZcfB6NlwbtMomNMOqqPmT7caEzSH1Dpn78mXrHIwhr2zCNmHIy3z3cIhe2+NiIwSRgpTU0YuAAAAeAAAAAIABwBAHZCADCV54cF5hNtqa3MluJLjSTVk2kgOyb4K6usQkqf4ks9ECDQAAAAAAAAAAAAAAAAAAAAAABNQVJDT5WYXro=',
            seqno1PayloadMBStr: 'te6ccsEBAgEAzAAAdAHhiADflhvtLHE/Nkcpg9E/WmdKX19PjXfY9emHmVpAFHxe7gVU5BqVDrole1inQ7y96vDzWdCi5+XFfKwWFtNaW8Eb/YYFV41TXyMzh3vLSKFAoFNvdozZQ2tATnjGC525BmBZTU0YuAAAAeAAAAAIABwBAKxCADCV54cF5hNtqa3MluJLjSTVk2kgOyb4K6usQkqf4ks9ECDQAAAAAAAAAAAAAAAAAAAAAAAxQjogQSwgMkI6IM6pLCAzQjog4LKELCA0Qjog8JOFscrV82E=',
            seqno1PayloadBytes: 'te6ccsEBAgEArAAAdAHhiADflhvtLHE/Nkcpg9E/WmdKX19PjXfY9emHmVpAFHxe7gaF6Ph/OpjRrFHcNaGOsEkKIA8aGLcS3KguvScBHeHyu2iWnNOVgARHzpruHZCkd2FPbV++kVWJmWF1SirIXNgZTU0YuAAAAeAAAAAIABwBAGxCADCV54cF5hNtqa3MluJLjSTVk2kgOyb4K6usQkqf4ks9ECDQAAAAAAAAAAAAAAAAAAEDAwfwOGQ4',
            seqno1PayloadCell: 'te6ccsEBAgEA0wAAdAHhiADflhvtLHE/Nkcpg9E/WmdKX19PjXfY9emHmVpAFHxe7gR3ZZkl7X9G+mJpDtJxcu/i1YkHrjVVpSHbeOxkqwx5h7XKDXRyULX5fTdt6efNKHDe1OeWEGyiG8h3l8rTAbAZTU0YuAAAAeAAAAAIABwBALlCADCV54cF5hNtqa3MluJLjSTVk2kgOyb4K6usQkqf4ks9ECDQAAAAAAAAAAAAAAAAAKYDESiagqSGnwAYSvPDgvMJttTW5ktxJcaSasm0kB2TfBXV1iElT/ElnqAKSldR',
        },
        getSeqNo: {
            publicKey: {
                address: '0:6fcb0df696389f9b2394c1e89fad33a52fafa7c6bbec7af4c3ccad200a3e2f77',
            },
        },
        deployQueryBoc64: 'te6ccsECFwEAA5UAAAAAdQCCAIcAjAEIATIBXQGoAa0BsgG3AdgB3QHsAfsCBgI1ArcC8AMoA2MDagLhiADflhvtLHE/Nkcpg9E/WmdKX19PjXfY9emHmVpAFHxe7hGdELfgS18wYXq1l3EqyYZG+cfRagM7vUvbt+uBRdC4SIReKGqnE5B6WcZcnQfFhOJAeWy8ZlRNIPjzTS4CcILA5TU0Yv/////gAAAAABABFgEU/wD0pBP0vPLICwICASADEQIBSAQIA+7QAdDTAwFxsJFb4CHXScEgkVvgAdMfIYIQcGx1Z70ighBibG5jvbAighBkc3RyvbCSXwPgAvpAMCD6RAHIygfL/8nQ7UTQgQFA1yH0BDBcgQEI9ApvoTGzkl8F4ATTP8glghBwbHVnupEx4w0kghBibG5juuMABAUGBwBQAfoA9AQwghBwbHVngx6xcIAYUAXLBSfPFlAD+gL0ABLLacsfUhDLPwBS+CdvIoIQYmxuY4MesXCAGFAFywUnzxYk+gIUy2oTyx9SMMs/AfoC9AAAkoIQZHN0crqONQSBAQj0WTDtRNCBAUDXIMgBzxb0AMntVIIQZHN0coMesXCAGFAEywVYzxYi+gISy2rLH8s/lBA0XwTiyYBA+wACASAJEAIBIAoPAgFYCwwAPbKd+1E0IEBQNch9AQwAsjKB8v/ydABgQEI9ApvoTGACASANDgAZrc52omhAIGuQ64X/wAAZrx32omhAEGuQ64WPwAARuMl+1E0NcLH4AFm9JCtvaiaECAoGuQ+gIYRw1AgIR6STfSmRDOaQPp/5g3gSgBt4EBSJhxWfMYQE+PKDCNcYINMf0x/THwL4I7vyY+1E0NMf0x/T//QE0VFDuvKhUVG68qIF+QFUEGT5EPKj+AAkpMjLH1JAyx9SMMv/UhD0AMntVPgPAdMHIcAAn2xRkyDXSpbTB9QC+wDoMOAhwAHjACHAAuMAAcADkTDjDQOkyMsfEssfy/8SExQVAG7SB/oA1NQi+QAFyMoHFcv/ydB3dIAYyMsFywIizxZQBfoCFMtrEszMyXH7AMhAFIEBCPRR8qcCAGyBAQjXGMhUICWBAQj0UfKnghBub3RlcHSAGMjLBcsCUATPFoIQBfXhAPoCE8tqEssfyXH7AAIAcoEBCNcYMFICgQEI9Fnyp/glghBkc3RycHSAGMjLBcsCUAXPFoIQBfXhAPoCFMtqE8sfEss/yXP7AAAK9ADJ7VQAUQAAAAApqaMXbkBe/GUa5GDCuc1VaDzCLxheNOgRQZpXvPCHAR7umAdA/LYskw==',
    },
    {
        constructor: WalletV4ContractR2 as typeof WalletContract,
        name: 'v4R2',
        address: 'UQAXQH-lFETZ9KncaE4qs0XVTAYMMC2AGSKPNKhvt_Do45ym',
        addressMC: '-1:3674ec71a2854a6bc36335c39eb9cc9c0a69d23cdc52c870181b4ae703bcca83',
        transferQueryBoc64: {
            seqno0: 'te6ccsECFwEAA6oAAAAAdwCEAIkAjgEFAUMBigGPAZQBmQG6Ab8BzgHdAegCFwKZAtIDDANEA0sDdgPjiAAugP9KKImz6VO40JxVZouqmAwYYFsAMkUeaVDfb+HRxhGe9g86HFmi2zQ3xeB14ozhi3ucnSd72HXWVxcAkwkHnBzY2rmaMQQLp1NIAsm6LW+4EYTVlbv8v0BysdOcbBoBRTU0Yv/////gAAAAAABwARUWART/APSkE/S88sgLAgIBIAMQAgFIBAcC5tAB0NMDIXGwkl8E4CLXScEgkl8E4ALTHyGCEHBsdWe9IoIQZHN0cr2wkl8F4AP6QDAg+kQByMoHy//J0O1E0IEBQNch9AQwXIEBCPQKb6Exs5JfB+AF0z/IJYIQcGx1Z7qSODDjDQOCEGRzdHK6kl8G4w0FBgB4AfoA9AQw+CdvIjBQCqEhvvLgUIIQcGx1Z4MesXCAGFAEywUmzxZY+gIZ9ADLaRfLH1Jgyz8gyYBA+wAGAIpQBIEBCPRZMO1E0IEBQNcgyAHPFvQAye1UAXKwjiOCEGRzdHKDHrFwgBhQBcsFUAPPFiP6AhPLassfyz/JgED7AJJfA+ICASAIDwIBIAkOAgFYCgsAPbKd+1E0IEBQNch9AQwAsjKB8v/ydABgQEI9ApvoTGACASAMDQAZrc52omhAIGuQ64X/wAAZrx32omhAEGuQ64WPwAARuMl+1E0NcLH4AFm9JCtvaiaECAoGuQ+gIYRw1AgIR6STfSmRDOaQPp/5g3gSgBt4EBSJhxWfMYQE+PKDCNcYINMf0x/THwL4I7vyZO1E0NMf0x/T//QE0VFDuvKhUVG68qIF+QFUEGT5EPKj+AAkpMjLH1JAyx9SMMv/UhD0AMntVPgPAdMHIcAAn2xRkyDXSpbTB9QC+wDoMOAhwAHjACHAAuMAAcADkTDjDQOkyMsfEssfy/8REhMUAG7SB/oA1NQi+QAFyMoHFcv/ydB3dIAYyMsFywIizxZQBfoCFMtrEszMyXP7AMhAFIEBCPRR8qcCAHCBAQjXGPoA0z/IVCBHgQEI9FHyp4IQbm90ZXB0gBjIywXLAlAGzxZQBPoCFMtqEssfyz/Jc/sAAgBsgQEI1xj6ANM/MFIkgQEI9Fnyp4IQZHN0cnB0gBjIywXLAlAFzxZQA/oCE8tqyx8Syz/Jc/sAAAr0AMntVABRAAAAACmpoxduQF78ZRrkYMK5zVVoPMIvGF406BFBmle88IcBHu6YB0AAZEIAMJXnhwXmE22prcyW4kuNJNWTaSA7Jvgrq6xCSp/iSz0QINAAAAAAAAAAAAAAAAAAz41++w==',
            seqno1: 'te6ccsEBAgEAqAAAdAHhiAAugP9KKImz6VO40JxVZouqmAwYYFsAMkUeaVDfb+HRxgXP0W/9tn/isLJHocZm+X+rkUKUaHcayZHnkXBxatUcOZVTw2Eh1n8al8OUhOTEg23d1SWkpws9C9ymkVPlZeghTU0YuAAAAeAAAAAIABwBAGRCADCV54cF5hNtqa3MluJLjSTVk2kgOyb4K6usQkqf4ks9ECDQAAAAAAAAAAAAAAAAAPjRRL8=',
            seqno1SendMode: 'te6ccsEBAgEAqAAAdAHhiAAugP9KKImz6VO40JxVZouqmAwYYFsAMkUeaVDfb+HRxgVxb6uEci8zG/ytVSIksPVS0EM3SdNGMsKWVD8tn7ehHYFN5r+yGM6zpsMUHmMIsd0bdQyS+zzpE4rI7TrrdLABTU0YuAAAAeAAAAAIBRQBAGRCADCV54cF5hNtqa3MluJLjSTVk2kgOyb4K6usQkqf4ks9ECDQAAAAAAAAAAAAAAAAAK7TG0w=',
            seqno1PayloadStr: 'te6ccsEBAgEAsQAAdAHhiAAugP9KKImz6VO40JxVZouqmAwYYFsAMkUeaVDfb+HRxgQcXZAHlMckwaT5WnUj6ZcfB6NlwbtMomNMOqqPmT7caEzSH1Dpn78mXrHIwhr2zCNmHIy3z3cIhe2+NiIwSRgpTU0YuAAAAeAAAAAIABwBAHZCADCV54cF5hNtqa3MluJLjSTVk2kgOyb4K6usQkqf4ks9ECDQAAAAAAAAAAAAAAAAAAAAAABNQVJDTyRF/WE=',
            seqno1PayloadMBStr: 'te6ccsEBAgEAzAAAdAHhiAAugP9KKImz6VO40JxVZouqmAwYYFsAMkUeaVDfb+HRxgVU5BqVDrole1inQ7y96vDzWdCi5+XFfKwWFtNaW8Eb/YYFV41TXyMzh3vLSKFAoFNvdozZQ2tATnjGC525BmBZTU0YuAAAAeAAAAAIABwBAKxCADCV54cF5hNtqa3MluJLjSTVk2kgOyb4K6usQkqf4ks9ECDQAAAAAAAAAAAAAAAAAAAAAAAxQjogQSwgMkI6IM6pLCAzQjog4LKELCA0Qjog8JOFscQ07BM=',
            seqno1PayloadBytes: 'te6ccsEBAgEArAAAdAHhiAAugP9KKImz6VO40JxVZouqmAwYYFsAMkUeaVDfb+HRxgaF6Ph/OpjRrFHcNaGOsEkKIA8aGLcS3KguvScBHeHyu2iWnNOVgARHzpruHZCkd2FPbV++kVWJmWF1SirIXNgZTU0YuAAAAeAAAAAIABwBAGxCADCV54cF5hNtqa3MluJLjSTVk2kgOyb4K6usQkqf4ks9ECDQAAAAAAAAAAAAAAAAAAEDAwcQexv8',
            seqno1PayloadCell: 'te6ccsEBAgEA0wAAdAHhiAAugP9KKImz6VO40JxVZouqmAwYYFsAMkUeaVDfb+HRxgR3ZZkl7X9G+mJpDtJxcu/i1YkHrjVVpSHbeOxkqwx5h7XKDXRyULX5fTdt6efNKHDe1OeWEGyiG8h3l8rTAbAZTU0YuAAAAeAAAAAIABwBALlCADCV54cF5hNtqa3MluJLjSTVk2kgOyb4K6usQkqf4ks9ECDQAAAAAAAAAAAAAAAAAKYDESiagqSGnwAYSvPDgvMJttTW5ktxJcaSasm0kB2TfBXV1iElT/ElnqBnB+fa',
        },
        getSeqNo: {
            publicKey: {
                address: '0:17407fa51444d9f4a9dc684e2ab345d54c060c302d8019228f34a86fb7f0e8e3',
            },
        },
        deployQueryBoc64: 'te6ccsECFgEAA3QAAAAAdQCCAIcAjAEDAUEBiAGNAZIBlwG4Ab0BzAHbAeYCFQKXAtADCgNCA0kC4YgALoD/SiiJs+lTuNCcVWaLqpgMGGBbADJFHmlQ32/h0cYRnRC34EtfMGF6tZdxKsmGRvnH0WoDO71L27frgUXQuEiEXihqpxOQelnGXJ0HxYTiQHlsvGZUTSD4800uAnCCwOU1NGL/////4AAAAAAQARUBFP8A9KQT9LzyyAsCAgEgAxACAUgEBwLm0AHQ0wMhcbCSXwTgItdJwSCSXwTgAtMfIYIQcGx1Z70ighBkc3RyvbCSXwXgA/pAMCD6RAHIygfL/8nQ7UTQgQFA1yH0BDBcgQEI9ApvoTGzkl8H4AXTP8glghBwbHVnupI4MOMNA4IQZHN0crqSXwbjDQUGAHgB+gD0BDD4J28iMFAKoSG+8uBQghBwbHVngx6xcIAYUATLBSbPFlj6Ahn0AMtpF8sfUmDLPyDJgED7AAYAilAEgQEI9Fkw7UTQgQFA1yDIAc8W9ADJ7VQBcrCOI4IQZHN0coMesXCAGFAFywVQA88WI/oCE8tqyx/LP8mAQPsAkl8D4gIBIAgPAgEgCQ4CAVgKCwA9sp37UTQgQFA1yH0BDACyMoHy//J0AGBAQj0Cm+hMYAIBIAwNABmtznaiaEAga5Drhf/AABmvHfaiaEAQa5DrhY/AABG4yX7UTQ1wsfgAWb0kK29qJoQICga5D6AhhHDUCAhHpJN9KZEM5pA+n/mDeBKAG3gQFImHFZ8xhAT48oMI1xgg0x/TH9MfAvgju/Jk7UTQ0x/TH9P/9ATRUUO68qFRUbryogX5AVQQZPkQ8qP4ACSkyMsfUkDLH1Iwy/9SEPQAye1U+A8B0wchwACfbFGTINdKltMH1AL7AOgw4CHAAeMAIcAC4wABwAORMOMNA6TIyx8Syx/L/xESExQAbtIH+gDU1CL5AAXIygcVy//J0Hd0gBjIywXLAiLPFlAF+gIUy2sSzMzJc/sAyEAUgQEI9FHypwIAcIEBCNcY+gDTP8hUIEeBAQj0UfKnghBub3RlcHSAGMjLBcsCUAbPFlAE+gIUy2oSyx/LP8lz+wACAGyBAQjXGPoA0z8wUiSBAQj0WfKnghBkc3RycHSAGMjLBcsCUAXPFlAD+gITy2rLHxLLP8lz+wAACvQAye1UAFEAAAAAKamjF25AXvxlGuRgwrnNVWg8wi8YXjToEUGaV7zwhwEe7pgHQNwk0lM=',
    },
    {
        constructor: LockupWalletV1 as typeof WalletContract,
        name: 'lockup-0.1',
        address: 'UQDcBQLPldzl_TvBatQUDICmH3YfhURWLk1qKQ2PwBNOSfpT',
        addressMC: '-1:07c52c2417cea727ae74977337fafddf164264affdd0d3df93b937687ec3e5a5',
        transferQueryBoc64: {
            seqno0: 'te6ccsECIQEAA1cAAAAAdgCDAIgAjQCSAJcAnAEdASUBMgE8AUgBYQFmAWsBiAGsAdEB1gHbAeAB+QH+AgwCGgIfAioCOAJFAsEC1wMjA+GIAbgKBZ8rucv6d4LVqCgZAUw+7D8KiKxcmtRSGx+AJpySEYADywGA0nRqIbEWQSOw5Mh2EfYh330+1H/UIPSGexOIhBW76J0Bf74s0WwFqnQqTNNl+bTxuXBDgXMqU89ycaDlNTRi/////+AAAAAAcAEfIAEU/wD0pBP0vPLICwICASADHQIBSAQSAgLNBQ0CASAGDAIBIAcLA/cAdDTAwFxsJJfA+D6QDAhxwCSXwPgAdMfIcECkl8E4PADUbTwAYIQgur5xFKwvbCSXwzggCiCEILq+cQbuhry9IAhK4IQO5rKAL7y9AeDCNcYgCAh+QFUEDb5EBLy9NMfgCmCEDc6qfQTuhLy9NMA0x8wAeMPEEgQN14ygCAkKAAwQOUgK8AUAFhA3QQrwBQgQV1BWABAQJEMA8ATtVAATCHXSfSob6VsMYAAtXtRNDTH9Mf0//T//QE+gD0BPoA9ATRgCASAOEQIBIA8QADUCMjKHxfKHxXL/xPL//QAAfoC9AAB+gL0AMmAAQxRIqBTE4Ag9A5voZb6ANEToAKRMOLIUAP6AkATgCD0QwGAARUjh4igCD0lm+lIJMwI7uRMeIgmDX6ANEToUATkmwh4rPmMIAgEgExwCASAUGQIBIBUWAC21GH4AbYiGioJgngDGIH4Axj8E7eILMAIBWBcYABetznaiaGmfmOuF/8AAF6x49qJoaY+Y64WPwAIBSBobABGzJftRNDXCx+AAF7HRvgjggEIw+1D2IAAVven3gBiCQvhHgAwB8vKDCNcYINMf0x/TH4AkA/gjuxPy8vADgCJRqboa8vSAI1G3uhvy9IAfC/kBVBDF+RAa8vT4AFBX+CPwBlCY+CPwBiBxKJMg10qOi9MHMdRRG9s8ErAB6DCSKaDfcvsCBpMg10qW0wfUAvsA6NEDpEdoFBVDMPAE7VQeACgB0NMDAXiwklt/4PpAMfpAMAHwAQCTAAAAACmpoxduQF78ZRrkYMK5zVVoPMIvGF406BFBmle88IcBHu6YB25AXvxlGuRgwrnNVWg8wi8YXjToEUGaV7zwhwEe7pgHABAAZEIAMJXnhwXmE22prcyW4kuNJNWTaSA7Jvgrq6xCSp/iSz0QINAAAAAAAAAAAAAAAAAApIBX0A==',
            seqno1: 'te6ccsEBAgEApwAAcwHfiAG4CgWfK7nL+neC1agoGQFMPuw/CoisXJrUUhsfgCackgO40I7yAP5KBVYZSEPBElrAQLJMDwKmFqvotV86hRMVEpP2O7TB2ohSh6+PHfmTmJbguZmozI7OBZQLmjHUswhZTU0YuAAAAeAAAAAIHAEAZEIAMJXnhwXmE22prcyW4kuNJNWTaSA7Jvgrq6xCSp/iSz0QINAAAAAAAAAAAAAAAAAAwYmmlQ==',
            seqno1SendMode: 'te6ccsEBAgEApwAAcwHfiAG4CgWfK7nL+neC1agoGQFMPuw/CoisXJrUUhsfgCackgNkQrxZtZruCZHO5W8SWcaMGcTI2974586W5Vhbp7jw/yNLZpKmWQJZIPk065/tnoJwnGa/UxWArvigOkoSpeBJTU0YuAAAAeAAAAANFAEAZEIAMJXnhwXmE22prcyW4kuNJNWTaSA7Jvgrq6xCSp/iSz0QINAAAAAAAAAAAAAAAAAAJ1q8zw==',
            seqno1PayloadStr: 'te6ccsEBAgEAsAAAcwHfiAG4CgWfK7nL+neC1agoGQFMPuw/CoisXJrUUhsfgCackgK2kz8EDEhYeCtXyD8t4mYDhABBvfPUrpqndnU2kJ4T5xtANurtooUvPOh+gitsSoDgQfGV5WRhMhLLyNU7+7ARTU0YuAAAAeAAAAAIHAEAdkIAMJXnhwXmE22prcyW4kuNJNWTaSA7Jvgrq6xCSp/iSz0QINAAAAAAAAAAAAAAAAAAAAAAAE1BUkNPZkv7wA==',
            seqno1PayloadMBStr: 'te6ccsEBAgEAywAAcwHfiAG4CgWfK7nL+neC1agoGQFMPuw/CoisXJrUUhsfgCackgKPBFK6zQY5wRmlXkFF39n7jUyMOrBBqOVneLnDMEENE6pXX/2VHSCZtJ6WlQnN4cMMHnMEd8M8LeyWDIwQRhhZTU0YuAAAAeAAAAAIHAEArEIAMJXnhwXmE22prcyW4kuNJNWTaSA7Jvgrq6xCSp/iSz0QINAAAAAAAAAAAAAAAAAAAAAAADFCOiBBLCAyQjogzqksIDNCOiDgsoQsIDRCOiDwk4WxdofooA==',
            seqno1PayloadBytes: 'te6ccsEBAgEAqwAAcwHfiAG4CgWfK7nL+neC1agoGQFMPuw/CoisXJrUUhsfgCackgYcXYUgqGh8CuIV0VMtLfZBmiXKd2J8eHmPnbMW7dsFfQeK7f3vlF+qMdKTSjMZEN9g/8upvwxLYWXr97T/S8gpTU0YuAAAAeAAAAAIHAEAbEIAMJXnhwXmE22prcyW4kuNJNWTaSA7Jvgrq6xCSp/iSz0QINAAAAAAAAAAAAAAAAAAAQMDByI5xrg=',
            seqno1PayloadCell: 'te6ccsEBAgEA0gAAcwHfiAG4CgWfK7nL+neC1agoGQFMPuw/CoisXJrUUhsfgCackgcnxHrY9AiFYGJ8aribUAvVbOxkpHjufcXiZ2rYthizHL8JwWwFmhcdXs7evMgBhuZrrYR/idsnI1dkxgtfHzBxTU0YuAAAAeAAAAAIHAEAuUIAMJXnhwXmE22prcyW4kuNJNWTaSA7Jvgrq6xCSp/iSz0QINAAAAAAAAAAAAAAAAAApgMRKJqCpIafABhK88OC8wm21NbmS3ElxpJqybSQHZN8FdXWISVP8SWeoIiJOr0=',
        },
        getSeqNo: {
            publicKey: {
                address: '0:dc0502cf95dce5fd3bc16ad4140c80a61f761f8544562e4d6a290d8fc0134e49',
            },
        },
        deployQueryBoc64: 'te6ccsECIAEAAyEAAAAAdACBAIYAiwCQAJUAmgEbASMBMAE6AUYBXwFkAWkBhgGqAc8B1AHZAd4B9wH8AgoCGAIdAigCNgJDAr8C1QLfiAG4CgWfK7nL+neC1agoGQFMPuw/CoisXJrUUhsfgCackhGGZPcBo8N6bK0h6wjJ3PMy798q87+ZiFkqjBk4D81FUqs6AigwVsROUgUbLv3Gm+u73pR+h1wcyM0JK8QZcmthBTU0Yv/////gAAAAEAEfART/APSkE/S88sgLAgIBIAMdAgFIBBICAs0FDQIBIAYMAgEgBwsD9wB0NMDAXGwkl8D4PpAMCHHAJJfA+AB0x8hwQKSXwTg8ANRtPABghCC6vnEUrC9sJJfDOCAKIIQgur5xBu6GvL0gCErghA7msoAvvL0B4MI1xiAICH5AVQQNvkQEvL00x+AKYIQNzqp9BO6EvL00wDTHzAB4w8QSBA3XjKAICQoADBA5SArwBQAWEDdBCvAFCBBXUFYAEBAkQwDwBO1UABMIddJ9KhvpWwxgAC1e1E0NMf0x/T/9P/9AT6APQE+gD0BNGAIBIA4RAgEgDxAANQIyMofF8ofFcv/E8v/9AAB+gL0AAH6AvQAyYABDFEioFMTgCD0Dm+hlvoA0ROgApEw4shQA/oCQBOAIPRDAYABFSOHiKAIPSWb6UgkzAju5Ex4iCYNfoA0ROhQBOSbCHis+YwgCASATHAIBIBQZAgEgFRYALbUYfgBtiIaKgmCeAMYgfgDGPwTt4gswAgFYFxgAF63OdqJoaZ+Y64X/wAAXrHj2omhpj5jrhY/AAgFIGhsAEbMl+1E0NcLH4AAXsdG+COCAQjD7UPYgABW96feAGIJC+EeADAHy8oMI1xgg0x/TH9MfgCQD+CO7E/Ly8AOAIlGpuhry9IAjUbe6G/L0gB8L+QFUEMX5EBry9PgAUFf4I/AGUJj4I/AGIHEokyDXSo6L0wcx1FEb2zwSsAHoMJIpoN9y+wIGkyDXSpbTB9QC+wDo0QOkR2gUFUMw8ATtVB4AKAHQ0wMBeLCSW3/g+kAx+kAwAfABAJMAAAAAKamjF25AXvxlGuRgwrnNVWg8wi8YXjToEUGaV7zwhwEe7pgHbkBe/GUa5GDCuc1VaDzCLxheNOgRQZpXvPCHAR7umAcAEGIMa4E=',
    },
];


/**
 * Iterating over all possible wallet contracts
 * to test basic functions of all of them
 * (each contract implement `WalletContract`).
 */
for (const test of wallets) {

    const className = test.constructor.name;

    describe(className, () => {

        it(`getName()`, async () => {

            expect(
                createWallet().getName()

            ).toEqual(test.name);

        });

        it(`getAddress()`, async () => {

            const address = await (
                createWallet().getAddress()
            );

            (expect(address.toString(true, true))
                .toEqual(test.address)
            );

        });

        it(`getAddress(), masterchain`, async () => {

            const address = await (
                createWallet({
                    options: {
                        publicKey: testKeyPair.publicKey,
                        wc: -1,
                    }
                }).getAddress()
            );

            (expect(address.toString(false))
                .toEqual(test.addressMC)
            );

        });

        it(`transfer, seqno = 0`, async () => {

            const queryBocString = await getTransferQueryBocString({
                seqno: 0,
            });

            (expect(queryBocString)
                .toEqual(test.transferQueryBoc64.seqno0)
            );

        });

        it(`transfer, seqno > 0`, async () => {

            const queryBocString = await getTransferQueryBocString({
                seqno: 1,
            });

            (expect(queryBocString)
                .toEqual(test.transferQueryBoc64.seqno1)
            );

        });

        it(`transfer, seqno > 0, SendMode`, async () => {

            const queryBocString = await getTransferQueryBocString({
                seqno: 1,
                sendMode: (128 + 32 + 2),
            });

            (expect(queryBocString)
                .toEqual(test.transferQueryBoc64.seqno1SendMode)
            );

        });

        it(`transfer, seqno > 0, payload (string)`, async () => {

            const queryBocString = await getTransferQueryBocString({
                seqno: 1,
                payload: 'MARCO',
            });

            (expect(queryBocString)
                .toEqual(test.transferQueryBoc64.seqno1PayloadStr)
            );

        });

        it(`transfer, seqno > 0, payload (multibyte string)`, async () => {

            const queryBocString = await getTransferQueryBocString({
                seqno: 1,
                payload: '1B: A, 2B: Ω, 3B: ಄, 4B: 𓅱',
            });

            (expect(queryBocString)
                .toEqual(test.transferQueryBoc64.seqno1PayloadMBStr)
            );

        });

        it(`transfer, seqno > 0, payload (bytes)`, async () => {

            const queryBocString = await getTransferQueryBocString({
                seqno: 1,
                payload: Uint8Array.from([1, 3, 3, 7]),
            });

            (expect(queryBocString)
                .toEqual(test.transferQueryBoc64.seqno1PayloadBytes)
            );

        });

        it(`transfer, seqno > 0, payload (cell)`, async () => {

            const payload = new Cell();

            payload.bits.writeBit(true);
            payload.bits.writeBit(false);
            payload.bits.writeBit(true);
            payload.bits.writeCoins(100500);
            payload.bits.writeString('MARCO');
            payload.bits.writeAddress(testAddress);

            const queryBocString = await getTransferQueryBocString({
                seqno: 1,
                payload,
            });

            (expect(queryBocString)
                .toEqual(test.transferQueryBoc64.seqno1PayloadCell)
            );

        });

        it(`seqno (public-key)`, async () => {

            await testSeqno({
                walletOptions: {
                    publicKey: testKeyPair.publicKey,
                },
                expectedAddress: test.getSeqNo.publicKey.address,
            });

        });

        it(`seqno (address)`, async () => {

            await testSeqno({
                walletOptions: {
                    address: testAddressStr,
                },
                expectedAddress: testAddressStr,
            });

        });

        it(`deploy`, async () => {

            const wallet = createWallet();

            const queryCell = (await wallet
                .deploy(testKeyPair.secretKey)
                .getQuery()
            );

            const queryBoc = await queryCell.toBoc();
            const queryBocB64 = bytesToBase64(queryBoc);

            expect(queryBocB64).toEqual(test.deployQueryBoc64);

        });

        it(`createInitExternalMessage()`, async () => {

            const wallet = createWallet();

            const initMessage = (await wallet
                .createInitExternalMessage(testKeyPair.secretKey)
            );

            // Address
            (expect(initMessage.address.toString(true, true))
                .toEqual(test.address)
            );

            // Message
            const messageBoc = await initMessage.message.toBoc();
            const messageBocB64 = bytesToBase64(messageBoc);
            expect(messageBocB64).toEqual(test.deployQueryBoc64);

            // @todo test other properties of the external message

        });

        it(`createTransferMessage(), seqno = 0`, async () => {
            await testTransferMessage({
                seqno: 0,
                expectedMessageBocB64: test.transferQueryBoc64.seqno0,
            });
        });

        it(`createTransferMessage(), seqno = 1`, async () => {
            await testTransferMessage({
                seqno: 1,
                expectedMessageBocB64: test.transferQueryBoc64.seqno1,
            });
        });

        it(`createTransferMessage(), seqno = 1, SendMode`, async () => {
            await testTransferMessage({
                seqno: 1,
                expectedMessageBocB64: test.transferQueryBoc64.seqno1SendMode,
                sendMode: (128 + 32 + 2),
            });
        });

    });


    function createWallet(args?: {
        provider?: HttpProviderType;
        options?: Partial<WalletContractOptions>;

    }): WalletContract {

        const defaultOptions: WalletContractOptions = {
            publicKey: testKeyPair.publicKey,
        };

        const {
            provider = testProvider,
            options = defaultOptions,

        } = (args || {});

        switch (test.constructor.name) {
            case 'LockupWalletV1':
                Object.assign(options, {
                    config: {
                        config_public_key: bytesToBase64(testKeyPair.publicKey),
                    },
                });
                break;
        }

        return new test.constructor(provider, options);

    }

    async function getTransferQueryBocString(
        params: Partial<TransferMethodParams>
    ) {

        const wallet = createWallet();

        const transfer = wallet.methods.transfer({
            secretKey: testKeyPair.secretKey,
            toAddress: testAddressStr,
            amount: 1050,
            ...params,

        } as TransferMethodParams);

        const queryCell = await transfer.getQuery();
        const queryBoc = await queryCell.toBoc();

        return bytesToBase64(queryBoc);

    }

    async function testSeqno(options: {
        walletOptions: WalletContractOptions;
        expectedAddress: string;

    }) {

        const {
            walletOptions,
            expectedAddress,

        } = options;

        const provider = new TestHttpProvider();

        const wallet = createWallet({
            provider,
            options: walletOptions,
        });

        await wallet.methods.seqno().call();

        expect(provider.callsCount).toEqual(1);

        expect(provider.getCalls()).toEqual([
            {
                method: 'runGetMethod',
                params: {
                    address: expectedAddress,
                    method: 'seqno',
                    stack: [],
                },
            },
        ]);

    }

    async function testTransferMessage(options: {
        seqno: number;
        payload?: (string | Uint8Array | CellType);
        sendMode?: number;
        expectedMessageBocB64: string;
    }) {

        const {
            seqno,
            payload,
            sendMode,
            expectedMessageBocB64,

        } = options;

        const wallet = createWallet();

        const transferMessage = (await wallet
            .createTransferMessage(
                testKeyPair.secretKey,
                testAddressStr,
                1050,
                seqno,
                payload,
                sendMode
            )
        );

        // Address
        (expect(transferMessage.address.toString(true, true))
            .toEqual(test.address)
        );

        // Message
        const messageBoc = await transferMessage.message.toBoc();
        const messageBocB64 = bytesToBase64(messageBoc);
        expect(messageBocB64).toEqual(expectedMessageBocB64);

        // @todo test other properties of the external message

    }

}
