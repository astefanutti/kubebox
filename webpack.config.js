const webpack = require('webpack');
const path = require('path');

module.exports = {
    target: 'node',
    mode: 'production',
    stats: {
        logging: 'info',
    },
    entry: "./index.js",
    output: {
        path: path.resolve(__dirname),
        filename: 'bundle.js',
    },
    optimization: {
        minimize: false,
    },
    plugins: [
        new webpack.IgnorePlugin({
            resourceRegExp: /spawn-sync/,
        }),
        // Ignore Moment locales
        new webpack.IgnorePlugin({
            resourceRegExp: /^\.\/locale$/,
            contextRegExp: /moment$/,
        }),
        // Keep only YAML from highlight.js languages
        new webpack.NormalModuleReplacementPlugin(
            /highlight\.js\/lib\/languages\/[^y]/,
            require.resolve('./webpack.hjs.language.js'),
        ),
        // Replace Node widget constructor for options theming
        new webpack.NormalModuleReplacementPlugin(
            /blessed\/lib\/widgets\/node/,
            require.resolve('./webpack.node.js'),
        ),
        new webpack.DefinePlugin({
            WEBPACK: true,
        }),
    ],
    module: {
        rules: [
            {
                test: /ansiimage|filemanager|overlayimage|pty|terminal|tng|video/,
                use: 'null-loader',
            },
            {
                test: /index\.js$/,
                loader: 'string-replace-loader',
                options: {
                    search: '#!/usr/bin/env node',
                    replace: '',
                }
            },
        ],
    },
};
