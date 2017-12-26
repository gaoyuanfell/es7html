const webpack = require('webpack');
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = function (config) {
    let entry = {};
    if(config instanceof Array){
        config.forEach( c => {
            entry[c.name] = `./app/${c.path}/${c.name}${c.type || '.js'}`
        } )
    }else{
        entry = {
            [config.name]:`./app/${config.path}/${config.name}${config.type || '.js'}`
        }
    }
    return {
        //已多次提及的唯一入口文件
        entry: entry,
        resolve: {
            // Add '.ts' and '.tsx' as resolvable extensions.
            extensions: [".ts", ".js"]
        },
        module: {
            rules: [
                {
                    test: /(\.ts)$/,
                    exclude: /node_modules/,
                    use: [
                        {
                            loader: 'ts-loader',
                        }
                    ]
                },
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
                        use: ['css-loader?minimize', 'less-loader', 'postcss-loader'],
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
                                name: 'static/images/[name].[ext]?[hash]',
                            }
                        }
                    ],
                },
            ]
        },
    }
}
