const path = require('path');

module.exports = {
    entry: './src/index.ts',

    output: {
        path: path.resolve('./dist'),
        filename: 'marco.js'
    },

    target: 'node',

    mode: 'production',

    devtool: 'source-map',

    module: {
        rules: [
            {
                test: /\.ts$/,
                use: {
                    loader: 'awesome-typescript-loader',
                    options: {
                        silent: true
                    }
                }
            }
        ]
    },

    resolve: {
        extensions: ['.js', '.ts']
    }
};
