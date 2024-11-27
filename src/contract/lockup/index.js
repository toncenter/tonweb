const {LockupWalletV1} = require("./LockupWalletV1");
const {VestingWalletV1} = require("./VestingWalletV1");

module.exports.default = {
    LockupWalletV1,
    VestingWalletV1,
    all: {
        'lockup-0.1': LockupWalletV1,
        'vesting-1': VestingWalletV1,
    },
    list: [LockupWalletV1, VestingWalletV1]
};
