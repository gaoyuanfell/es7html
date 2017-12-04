const webpack = require('webpack');
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = function (config) {
    let entry = {};
    if(config instanceof Array){
        config.forEach( c => {
            entry[c.name] = `./app/${c.path}/${c.name}.js`
        } )
    }else{
        entry = {
            [config.name]:`./app/${config.path}/${config.name}.js`
        }
    }
    return {
        //已多次提及的唯一入口文件
        entry: entry,
        module: {
            rules: [
                {
                    test: /(\.js)$/,
                    exclude: /node_modules/,
                    use: [
                        {
                            loader: 'babel-loader',
                        }
                    ]
                },
                {
                    test: /\.(less|css)$/,
                    use: ExtractTextPlugin.extract({
                        use: ['css-loader', 'less-loader', 'postcss-loader'],
                        fallback: 'style-loader',
                    }),
                },
                {
                    test: /\.(png|jpe?g|gif)(\?.*)?$/,
                    exclude: /node_modules/,
                    use: [
                        {
                            loader: 'file-loader',
                            options: {
                                name: 'static/img/[name].[ext]?[hash]',
                            }
                        }
                    ],
                },
            ]
        },
    }
}
