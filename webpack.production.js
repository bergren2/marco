const config = require('./webpack.config');

config.devtool = undefined;
config.mode = 'production';

module.exports = config;
