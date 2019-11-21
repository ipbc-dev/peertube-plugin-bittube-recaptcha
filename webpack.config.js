const path = require("path")

const EsmWebpackPlugin = require("@purtuga/esm-webpack-plugin")

let config = {
  entry: "./client/signup-client-plugin.js",
  output: {
    path: path.resolve(__dirname, "./dist"),
    filename: "./signup-client-plugin.js",
    library: "script",
    libraryTarget: "var"
  },
  plugins: [new EsmWebpackPlugin()]
}

module.exports = config
