const path = require("path");


module.exports = {
    entry: "./public/assets/js/index.js",
    output: {
        path: path.join(__dirname, "/public/dist"),
        filename: "bundle.js"
    },
    module: {
        loaders: [
            { test: /\.js?$/, exclude: /node_modules/, loader: 'babel' },
            { test: /\.css$/, loader: 'style-loader!css-loader' }
        ]
    }
}
