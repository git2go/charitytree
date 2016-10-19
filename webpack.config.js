var path = require("path");
module.exports = {
  entry: {
    main: "./client/js/index.js"
  },
  output: {
    path: path.join(__dirname, "client/js/dist"),
    filename: "[name].dist.js"
  },
  module: {
    loaders: [
      {test: /\.jsx?$/, exclude: /node_modules/, loaders: ['babel?presets[]=react,presets[]=es2015']},
      { test: /\.css$/, loader: 'style-loader!css-loader' }
    ]
  }
};

//var path = require("path");
//var webpack = require('webpack');
//module.exports = {
//  devtool: 'eval',
//  entry: [
//    'webpack-dev-server/client?http://0.0.0.0:4000', // WebpackDevServer host and port
//    'webpack/hot/only-dev-server', // "only" prevents reload on syntax errors
//    "./client/js/index.js"
//  ],
//  output: {
//    path: path.join(__dirname, "js/dist"),
//    filename: "[name].dist.js",
//    publicPath: '/'
//  },
//  module: {
//    loaders: [{
//      test: /\.jsx?$/,
//      loaders: ['react-hot', 'babel-loader?presets[]=react,presets[]=es2015'],
//      include: path.join(__dirname, 'client'),
//      exclude: /node_modules/
//    },
//      {
//        test: /\.css$/,
//        loader: 'style!css'
//      }]
//  },
//  plugins: [
//    new webpack.HotModuleReplacementPlugin()
//  ]
//};
