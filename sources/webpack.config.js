const webpack = require('webpack');
const path = require('path');


module.exports = {

    target: 'electron',
    entry: {
        'index': './index.ts',
        'app/HomePage': './app/render/page/HomePage.tsx',
        'app/AboutPage': './app/render/page/AboutPage.tsx'
    },

    output: {
        path: path.resolve(__dirname, './dist/build'),
        filename: '[name].js'
    },

    node: {
        __filename: false,
        __dirname: false
    },

    devtool: 'source-map',

    resolve: {
        extensions: ['.webpack.js', '.web.js', '.ts', '.tsx', '.js']
    },

    module: {
        rules: [
            {
                test: /\.css?$/,
                exclude: /(node_modules|dist)/,
                loader: 'style!css?module&localIdentName=[name]__[local]-[hash:base64:5]'
            },
            {
                test: /\.tsx?$/,
                exclude: /(node_modules|dist)/,
                use: [
                    {
                        loader: 'ts-loader'
                    }
                ]
            },
            {
                test: /\.js$/,
                enforce: 'pre',
                loader: 'source-map-loader'
            }
        ]
    },

    plugins: [
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: '\"debug\"'
            }
        })
    ],

    externals: {
        'jquery': 'window.$'
    }
};
