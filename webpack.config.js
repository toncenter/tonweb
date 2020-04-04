const path = require('path');

module.exports = {
    entry: './src/index.js',
    optimization: {
        minimize: true,
    },
    output: {
        filename: 'tonweb.js',
        path: path.resolve(__dirname, 'dist'),
    },
};