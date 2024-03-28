const {HighloadWalletContractV3} = require("./HighloadWalletContractV3");
const {HighloadQueryId} = require("./HighloadQueryId");

module.exports.default = {
    HighloadQueryId,
    HighloadWalletContractV3,
    all: {
        'highload-3': HighloadWalletContractV3,
    },
    list: [HighloadWalletContractV3]
};
