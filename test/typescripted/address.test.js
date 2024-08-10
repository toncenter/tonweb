
const TonWeb = require('../../src');
const utils = TonWeb.utils;

const testAddress = '0QAs9VlT6S776tq3uUQDO5GaJbGEfqIuQcrmhw-1rnB0Om8JOAx8KQjD_y5ImUQDO5GaJbGEfqIuQcrmhw-1rnB0Om8JOAx8KQjD_y5ImKyk3Kyk3nJcP5Ogsj-ELLunLXuOb1EKcOQi4-QO';


(async () => {

    const address = new utils.Address(testAddress);

    console.log(JSON.stringify({
        NF: address.toString(false),
        F_NS_NB_NT: address.toString(true, false, false, false),
        F_S_NB_NT: address.toString(true, true, false, false),
        F_NS_NB_T: address.toString(true, false, false, true),
        F_S_NB_T: address.toString(true, true, false, true),
        F_NS_B_NT: address.toString(true, false, true, false),
        F_S_B_NT: address.toString(true, true, true, false),
        F_NS_B_T: address.toString(true, false, true, true),
        F_S_B_T: address.toString(true, true, true, true),

    }, null, 4));

})();
