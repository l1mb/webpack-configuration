const webpack = require('webpack')
const path = require('path')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MinifyCssNames = require('mini-css-class-name/css-loader')

const production = process.env.NODE_ENV === 'production'

module.exports = {
    entry: {
        myAppName: path.resolve(__dirname, './src/index.tsx'),
    },
    output: {
        path: path.resolve(__dirname, './dist'),
        filename: production ? '[name].[contenthash].js' : '[name].js',
    },
    module: {
        rules: [
            {
                test: /\.jsx$/,
                exclude: /node_modules/,
                use: ['babel-loader'],
            },
            {
                test: /\.css$|\.scss$/,
                use: [
                    !production
                        ? 'style-loader' // it extracts style directly into html (MiniCssExtractPlugin works incorrect with hmr and modules architecture)
                        : MiniCssExtractPlugin.loader, // it extracts styles into file *.css
                    {
                        loader: 'css-loader', // it interprets @import and url() like import/require() and it resolves them (you can use [import *.css] into *.js).
                        options: {
                            modules: {
                                auto: /\.module\.\w+$/, // enable css-modules option for files *.module*.
                                getLocalIdent: !production
                                    ? (() => {
                                          // it simplifies classNames fo debug purpose
                                          const getHash = MinifyCssNames()
                                          return (
                                              context,
                                              localIdentName,
                                              localName,
                                              options
                                          ) =>
                                              `${localName}_${getHash(
                                                  context,
                                                  localIdentName,
                                                  localName,
                                                  options
                                              )}`
                                      })()
                                    : MinifyCssNames(
                                          // minify classNames for prod-build
                                          { excludePattern: /[_dD]/gi } // exclude '_','d','D' because Adblock blocks '%ad%' classNames
                                      ),
                            },
                        },
                    },
                    'css-unicode-loader', // fixes weird issue when browser sometimes doesn't render font-icons (https://stackoverflow.com/questions/69466120/troubles-with-webpack-sass-and-fontawesome/73363510#73363510)
                    {
                        loader: 'sass-loader', // it compiles Sass to CSS, using Node Sass by default
                        options: {
                            additionalData: '@import "variables";', // inject this import by default in each scss-file
                            sassOptions: {
                                includePaths: [
                                    path.resolve(__dirname, 'src/styles'),
                                ], // using pathes as root
                            },
                        },
                    },
                    'postcss-loader', // it provides adding vendor prefixes to CSS rules using values from Can I Use (see postcss.config.js in the project)
                ],
            },

            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: ['*', '.js', '.jsx', '.scss', '.ts', '.tsx'],
    },
    plugins: [
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            title: 'prikol',
            template: './src/index.html',
        }),
        new MiniCssExtractPlugin({
            filename: production ? '[name].[contenthash].css' : '[name].css',
        }),
    ],
    stats: 'errors-only',
    devServer: {
        port: 3001,
        hot: true,
    },
    mode: production ? 'production' : 'development',
}
