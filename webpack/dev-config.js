const path = require('path');
const webpack = require('webpack');
const AssetsPlugin = require('assets-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const vars = require('postcss-simple-vars');
const autoprefixer = require('autoprefixer');

const { conf } = require('../src/server/helpers/config');
const WEBPACK_DEV_URL = conf.get('WEBPACK_DEV_URL');
const sharedVars = require('../src/common/style/variables');

module.exports = {
  context: path.resolve(__dirname, '..'),
  entry: [
    'babel-polyfill',
    `webpack-hot-middleware/client?path=${WEBPACK_DEV_URL}/__webpack_hmr`,
    'webpack/hot/only-dev-server',
    'react-hot-loader/patch',
    './src/common',
  ],
  output: {
    path: path.join(__dirname, '../public/static'),
    filename: 'bundle.js',
    sourceMapFilename: '[file].map',
    publicPath: `${WEBPACK_DEV_URL}/static/`
  },
  plugins: [
    new webpack.LoaderOptionsPlugin({
         // test: /\.xxx$/, // may apply this only for some modules
      options: {
        postcss: function () {
          return [ vars({ variables: () => sharedVars }), autoprefixer ];
        }
      }
    }),
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new ExtractTextPlugin({ filename: 'style.css', allChunks: true }),
    new AssetsPlugin()
  ],
  module: {
    // https://github.com/localForage/localForage/issues/577
    noParse: /node_modules\/localforage\/dist\/localforage\.js$/,
    loaders: require('./loaders-config.js')
  },
  devtool: 'source-map',
  // postcss: function () {
  //   return [ vars({ variables: () => sharedVars }), autoprefixer ];
  // },
  //debug: true
};
