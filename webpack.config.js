const path = require("path");
module.exports = {
  mode: "production",
  entry: "./src/index.ts",
  target: "node",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "index.js"
  },
  devtool: "source-map",
  optimization: {
    minimize: true
  },
  module: {
    rules: [
      {
        test: /.ts/,
        include: [path.resolve(__dirname, "src")],
        loader: "ts-loader"
      }
    ]
  },
  resolve: {
    extensions: [".ts", ".js"]
  }
};
