const path = require("path");
const webpack = require("webpack")

module.exports = {
    entry: [
        'webpack-dev-server/client?http://localhost:8080',
        'webpack/hot/only-dev-server',
        "./public/assets/js/index.js",
    ],
    output: {
        path: path.join(__dirname, "/public/dist"),
        filename: "bundle.js"
    },
    module: {
        loaders: [
            { test: /\.js?$/, exclude: /node_modules/, loader: 'babel' },
            { test: /\.css$/, loader: 'style-loader!css-loader' }
        ]
    },
    resolve: {
        extensions: ['', '.js', '.jsx']
    },
    plugins: [
        new webpack.HotModuleReplacementPlugin(),
        new webpack.DefinePlugin({
            __ENV__: process.env.NODE_ENV,
        }),
    ]
}
