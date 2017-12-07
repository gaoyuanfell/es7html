const webpackDevServer = require('webpack-dev-server');
const webpack = require('webpack');

const config = require('../webpack.dev.config.js');
webpackDevServer.addDevServerEntrypoints(config,config.devServer);

const compiler = webpack(config);
const server = new webpackDevServer(compiler, config.devServer);

server.listen(config.devServer.port, () => {
    console.log('dev server listening on port 5000');
});
