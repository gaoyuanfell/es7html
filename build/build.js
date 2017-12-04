const path = require('path');
const webpack = require('webpack');
const webpackConfig = require('../webpack.pord.config');
const merge = require('webpack-merge');

const ora = require('ora');

const config = require('./config');

async function buildAsync() {
    let i = 0;
    console.info('build start')
    while (config[i]) {
        await build(config[i]).catch( (e)=> {console.info(e)} );
        ++i;
    }
}

function build(config) {
    return new Promise((resolve, reject) => {
        const spinner = ora('building for production...');
        spinner.start();
        let wc = merge({}, webpackConfig(config));
        webpack(wc, function (err, stats) {
            spinner.stop();
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
}

buildAsync().then(() => {
    console.info('build success')
}).catch((e) => {
    console.info(JSON.stringify(e))
})
