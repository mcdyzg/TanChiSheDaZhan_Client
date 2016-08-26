var path = require('path');
var webpack = require('webpack');
var nodeModulesPath = path.resolve(__dirname, 'node_modules');

module.exports = {
  // devtool: 'cheap-module-eval-source-map',
  entry: [
    // 'eventsource-polyfill', // necessary for hot reloading with IE
    'webpack-hot-middleware/client',
    './src/main'
    // 或者path.join(__dirname, '/src/app/app.jsx')
  ],
  resolve: {
    extensions: ["", ".js", ".jsx"]
    //node_modules: ["web_modules", "node_modules"]  (Default Settings)
  },
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'app.js'
    // publicPath: '/dist/'
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin()
  ],
  module: {
    // preLoaders: [
    //   {
    //     //Eslint loader
    //     test: /\.(js|jsx)$/,
    //     loader: 'eslint-loader',
    //     include: [path.resolve(__dirname, "src/app")],
    //     exclude: [nodeModulesPath]
    //   },
    // ],
    loaders: [
      {
        test: /\.(js|jsx)$/,
        loaders: ['jsx-loader?harmony'],
        exclude: [nodeModulesPath]
      }
    ]
  }
};
