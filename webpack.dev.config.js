const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const baseWebpackConfig = require('./webpack.base.config');
const merge = require('webpack-merge');

const config = require('./build/config');

module.exports = merge(baseWebpackConfig(config), {
    output: {
        path: __dirname + `/dist`, //打包后的文件存放的地方
        filename: "[name].js", //打包后输出文件的文件名
        publicPath:`/`,
    },
    devtool: 'source-map',
    devServer: {
        contentBase:'static',
        historyApiFallback: false, //不跳转
        inline: true, //实时刷新
        hot:false,
        compress: true,
        port:8082,
        host: '0.0.0.0',
        disableHostCheck: true,
    },
    plugins: [
        new ExtractTextPlugin({
            filename: '[name].css',
            disable: false,
            allChunks: true,
        }),
        new webpack.NamedModulesPlugin(),
        new webpack.HotModuleReplacementPlugin(),
        ...config.map( a => {
            return new HtmlWebpackPlugin({
                filename: `${a.name}.html`,
                title:a.title,
                template: `./app/${a.path}/template.html`,
                chunks: ['vendor',a.name],
                inject: true
            })
        }),
        ...config.map( a => {
            return new CopyWebpackPlugin([{
                from: path.resolve(__dirname, `./app/${a.path}/static`),
                to: `static`,
                ignore: ['.*']
            }])
        }),
    ],
})
