const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const ManifestPlugin = require('webpack-manifest-plugin');
const { ReactLoadablePlugin } = require('react-loadable/webpack');
// eslint-disable-next-line
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
// eslint-disable-next-line
const CompressionPlugin = require('compression-webpack-plugin');

// todo: css minimizing for porduction

module.exports = {
  entry: './src/client/index.js',
  output: {
    filename: '[name].[hash].js',
    chunkFilename: '[name].[hash].js',
    path: path.resolve(__dirname, 'dist/client'),
    publicPath: '/client/',
  },
  mode: 'development',
  target: 'web',
  resolve: {
    alias: {
      SSR: path.resolve(__dirname, 'core/'),
    },
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        options: {
          babelrc: false,
          presets: [
            ['@babel/preset-env', {
              debug: false,
              modules: false, // https://babeljs.io/docs/en/babel-plugin-syntax-dynamic-import
            }],
            '@babel/preset-react',
          ],
          plugins: [
            '@babel/plugin-syntax-dynamic-import',
            'transform-es2015-spread',
            '@babel/plugin-transform-runtime',
            '@babel/plugin-syntax-object-rest-spread',
            '@babel/plugin-proposal-object-rest-spread',
            'react-loadable/babel',
          ],
        },
      },
      {
        test: /\.css/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              modules: true,
            },
          },
        ],
      },
      {
        test: /\.(png|jpg|gif)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              outputPath: 'images',
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new ReactLoadablePlugin({ // export file map for lodable
      filename: path.resolve(__dirname, 'dist/client', 'react-loadable.json'),
    }),
    // 暂时注释，稍候恢复
    // new BundleAnalyzerPlugin(),
    new ManifestPlugin(),
    // 暂时注释，稍候恢复
    // new CompressionPlugin({
    //   test: /\.js(\?.*)?$/i,
    //   algorithm: 'gzip',
    //   filename: '[path].gz[query]',
    // }),
    new CleanWebpackPlugin(['dist/client']),
    new MiniCssExtractPlugin({
      filename: '[name].[hash].css',
      chunkFilename: '[id].[hash].css',
    }),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('development'),
      },
    }),
  ],
};
