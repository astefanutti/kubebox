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
        // Keep only YAML from highlight.js languages
        new webpack.NormalModuleReplacementPlugin(
            /languages\/[^y]/,
            require.resolve('./webpack.hjs.language.js'),
        ),
        new webpack.NormalModuleReplacementPlugin(
            /widgets\/node/,
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
