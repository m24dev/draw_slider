const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = env => {
    let mode = env.mode;
    const isDev = mode === 'development' ? true : false;
    return {
        entry: {
            main: './src/js/index.js'
        },
        output: {
            filename: 'js/[name].[contenthash].js'
        },
        devtool: isDev ? 'cheap-module-source-map' : 'none',
        mode,
        module: {
            rules: [
                {
                    test: /\.js$/,
                    exclude: /(node_modules)/,
                    use: {
						loader: 'babel-loader'
					}
				},
                {
                    test: /\.(css|scss)$/,
                    use: [
                        {
							loader: MiniCssExtractPlugin.loader,
							options: {
								hmr: isDev,
								publicPath: '../'
							},
						},
                        'css-loader',
                        'sass-loader'
                    ]
                },
                {
					test: /\.(png|svg|jpg|gif)$/,
					use: {
						loader: 'file-loader',
						options: {
							outputPath: 'images',
							name: '[name].[ext]',
							esModule: false
						}
					},
				}
            ]
        },
        plugins: [
            new CleanWebpackPlugin(),
            new HtmlWebpackPlugin({
                template: './src/index.ejs',
                filename: 'index.html',
                isDev: isDev
            }),
            new MiniCssExtractPlugin({
				filename: 'css/[name].[contenthash].css'
			})
        ]
    }
}