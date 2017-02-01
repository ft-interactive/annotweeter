/**
 * Webpack config via SearchKit boilerplate
 * (JSON loading added for Markdown support)
 */

const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  devtool: 'eval',
  context: path.join(__dirname),
  entry: [
    'webpack-hot-middleware/client?reload=true',
    './src/index.jsx',
  ],
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'bundle.js',
    publicPath: '/static',
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin(),
  ],
  resolve: {
    alias: {
      react: path.resolve('./node_modules/react'),
      'react-twitter-widgets': path.resolve('/Users/andrew.rininsland/Projects/FORKS/react-twitter-widgets'),
    },
    extensions: ['.js', '.jsx', '.webpack.js', '.web.js', ''],
  },
  resolveLoader: {
    root: path.join(__dirname, 'node_modules'),
  },
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        exclude: /(node_modules)/,
        loader: 'babel',
        query: {
          presets: [
            require.resolve('babel-preset-es2015'),
            require.resolve('babel-preset-react'),
          ],
          plugins: ['transform-class-properties'],
        },
      },
      {
        test: /\.scss$/,
        loaders: ['style', 'css', 'sass'],
      },
      {
        test: /\.(jpg|png|svg|json)$/,
        loaders: [
          'file-loader?name=[path][name].[ext]',
        ],
      },
    ],
  },
};
