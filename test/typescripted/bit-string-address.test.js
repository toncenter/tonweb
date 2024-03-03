
const TonWeb = require('../../src');
const utils = TonWeb.utils;

const testAddress = '0QAs9VlT6S776tq3unJcP5Ogsj-ELLunLXuOb1EKcOQi4-QO';


(async () => {

    const address = new utils.Address(testAddress);

    const bitString = new TonWeb.boc.BitString(1000);

    bitString.writeAddress(address);

    const bits = [];

    bitString.forEach(bit => bits.push(bit ? '1' : '0'));

    console.log(bits.join(''));

})();
