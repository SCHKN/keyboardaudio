const HtmlWebPackPlugin = require("html-webpack-plugin");
var webpack = require("webpack");

const htmlPlugin = new HtmlWebPackPlugin({
  template: "./public/index.html",
  filename: "index.html"
});

module.exports = {
  entry: ["babel-polyfill", "./src/index.js"],
  module: {
    rules: [
      {
        test: /node_modules/,
        loader: "shebang-loader"
      },
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: ["babel-loader"]
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"]
      },
      {
        test: /\.(ttf|eot|woff|woff2|ico)$/,
        use: [
          {
            loader: "file-loader",
            options: {
              name: "./[name].[ext]"
            }
          }
        ]
      },
      {
        test: /\.(png|jp(e*)g|svg)$/,
        use: [
          {
            loader: "file-loader",
            options: {
              name: "images/[name].[ext]"
            }
          }
        ]
      }
    ]
  },
  plugins: [
    htmlPlugin,
    new webpack.DefinePlugin({
      "process.env.FLUENTFFMPEG_COV": false
    })
  ],
  resolve: {
    extensions: ["*", ".js", ".jsx"]
  },
  output: {
    path: __dirname + "/dist",
    publicPath: "/",
    filename: "bundle.js"
  },
  devServer: {
    contentBase: "./dist"
  },
  node: { fs: "empty", child_process: "empty" }
};
