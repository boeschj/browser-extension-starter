const { merge } = require("webpack-merge");
const webpack = require("webpack");
const common = require("./webpack.common.js");

const plugins = common.plugins;
plugins.push(
  // Generate sourcemaps
  new webpack.SourceMapDevToolPlugin({ filename: false })
);

module.exports = merge(common, {
  plugins,
});
