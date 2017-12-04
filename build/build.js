const path = require('path');
const webpack = require('webpack');
const webpackConfig = require('../webpack.pord.config');
const merge = require('webpack-merge');
const rm = require('rimraf')

const config = require('./config');

async function buildAsync() {
    let i = 0;
    console.info('\n\n------------------------------build start-----------------------------\n\n');
    while (config[i]) {
        await build(config[i]).catch( (e)=> {console.info(e)} );
        ++i;
    }
}

function build(config) {
    return new Promise((resolve, reject) => {
        let wc = merge({}, webpackConfig(config));
        rm(path.join(path.resolve(__dirname, '../dist'),config.output),err => {
            if (err) throw err
            webpack(wc, function (err, stats) {
                if (err) throw err;
                process.stdout.write(stats.toString({
                    colors: true,
                    modules: false,
                    children: false,
                    chunks: false,
                    chunkModules: false
                }) + '\n\n')
                resolve()
            });
        })
    })
}

buildAsync().then(() => {
    console.info('\n\n------------------------------build success-----------------------------\n\n')
}).catch((e) => {
    console.info(JSON.stringify(e))
})
