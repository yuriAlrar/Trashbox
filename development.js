import path from 'path'

const src  = path.resolve(__dirname, 'available')
const dist = path.resolve(__dirname, 'build')

export default {
	mode: 'development',
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
	plugins: []
}
