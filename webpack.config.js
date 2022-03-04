const path = require('path');
const { ProvidePlugin } = require('webpack');

module.exports = {
    entry: './src/index.js',
    optimization: {
        minimize: true,
    },
    output: {
        filename: 'tonweb.js',
        path: path.resolve(__dirname, 'dist'),
        library: {
            type: 'umd',
            name: {
                root: 'TonWeb',
                amd: 'tonweb',
                commonjs: 'tonweb',
            },
        },
    },
    resolve: {
        fallback: {
            buffer: require.resolve('buffer/'),
        },
    },
    plugins: [
        new ProvidePlugin({
            Buffer: ['buffer', 'Buffer'],
        }),
    ],
};