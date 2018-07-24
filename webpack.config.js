const path = require('path');

module.exports = {
    entry: './src/index.ts',

    output: {
        path: path.resolve('./dist'),
		filename: 'marco.js',
		library: 'marco',
		libraryExport: 'default',
		libraryTarget: 'commonjs2'
	},

	externals: {
		chalk: 'chalk',
		commander: 'commander',
		inversify: 'inversify',
		reflectMetadata: 'reflect-metadata',
		rimraf: 'rimraf',
		simpleGit: 'simple-git'
	},

    target: 'node',

    mode: 'development',

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
