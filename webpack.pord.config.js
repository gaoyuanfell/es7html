const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const baseWebpackConfig = require('./webpack.base.config');
const merge = require('webpack-merge');

module.exports = function (config) {
    return merge(baseWebpackConfig(config), {
        output: {
            path: __dirname + `/dist/${config.output}`, //打包后的文件存放的地方
            filename: "[name].js", //打包后输出文件的文件名
            publicPath:`${config.publicPath}`,
        },
        plugins: [
            new ExtractTextPlugin({
                filename: '[name].css',
                disable: false,
                allChunks: true,
            }),
            new HtmlWebpackPlugin({
                template: `./app/${config.path}/template.html`,
                // chunks: ['vendor','manifest'],
                title:config.title,
                inject: true,
                hash: true,
                minify: {
                    removeComments: true,
                    collapseWhitespace: true,
                    removeAttributeQuotes: true,
                    minifyJS: true,
                    minifyCSS: true,
                },
                chunksSortMode: 'dependency'
            }),
            new webpack.optimize.UglifyJsPlugin({
                compress: {
                    warnings: false
                },
                sourceMap: false
            }),
            new webpack.optimize.CommonsChunkPlugin({
                name: 'manifest',
                chunks: ['vendor']
            }),
            new CopyWebpackPlugin([{
                from: path.resolve(__dirname, `./app/${config.path}/static`),
                to: 'static',
                ignore: ['.*']
            }]),
        ],
    })
}
