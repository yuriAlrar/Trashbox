import path from 'path'

const PRODUCTION = process.env.NODE_ENV === 'production';
const webpack = require('webpack');

const src  = path.resolve(__dirname, 'available')
const dist = path.resolve(__dirname, 'build')

export default {
	mode: 'production',
	entry: src + '/rPanel.jsx',

	output: {
		path: dist,
		filename: 'rPanel.js'
	},
	module: {
		rules: [
			{
				test: /\.jsx$/,
				exclude: /node_modules/,
				loader: 'babel-loader'
			}
		]
	},
	resolve: {
		extensions: ['.js', '.jsx']
	},
	plugins: [
		new webpack.DefinePlugin({
			'process.env.NODE_ENV': JSON.stringify('production')
  		})
	]
}
