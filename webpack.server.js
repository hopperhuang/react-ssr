const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const webpack = require('webpack');
const nodeExternals = require('webpack-node-externals');
const ManifestPlugin = require('webpack-manifest-plugin');

// todo: css minimizing for porduction

module.exports = {
  entry: './server.js',
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'dist/server'),
  },
  mode: 'development',
  target: 'node',
  externals: [nodeExternals()],
  resolve: {
    alias: {
      SSR: path.resolve(__dirname, 'core/'),
      Client: path.resolve(__dirname, 'dist/client/'),
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
              targets: {
                node: true,
              },
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
          {
            // just use css-loader, or bug occur like this: https://github.com/webpack-contrib/mini-css-extract-plugin/issues/48
            // https://github.com/webpack-contrib/mini-css-extract-plugin/issues/90
            loader: 'css-loader',
            options: {
              modules: true,
              // this config fix warninig: prop classname did not match between server and client,
              // which cause first render lose classnames in html
              // https://github.com/webpack-contrib/css-loader#exportonlylocals
              exportOnlyLocals: true,
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
              publicPath: '/client/images/',
              emitFile: false,
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new ManifestPlugin(),
    new CleanWebpackPlugin(['dist/server']),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production'),
      },
    }),
  ],
};
