const { merge } = require("webpack-merge");
const path = require("path");
const FilemanagerPlugin = require("filemanager-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const CompressionPlugin = require("compression-webpack-plugin");
const zlib = require("zlib");
const { version } = require("./package.json");
const common = require("./webpack.common.js");

const destPath = path.join(__dirname, "distribution");
const buildPath = path.join(__dirname, "build");
const nodeEnv = process.env.NODE_ENV || "development";
const browserEnv = process.env.TARGET_BROWSER;

if (!browserEnv) {
  throw new Error(
    `TARGET_BROWSER env variable: ${process.env.TARGET_BROWSER} is not set to a supported option.`
  );
}

const zipName = `browser-extension-${browserEnv}-${nodeEnv}-${version}`;

module.exports = merge(common, {
  optimization: {
    minimize: true,
    minimizer: [
      new CompressionPlugin({
        filename: "[path][base].gz",
        algorithm: "gzip",
        test: /\.js$|\.css$|\.html$/,
        threshold: 10240,
        minRatio: 0.8,
      }),
      new CompressionPlugin({
        filename: "[path][base].br",
        algorithm: "brotliCompress",
        test: /\.(js|css|html|png|svg)$/,
        compressionOptions: {
          params: {
            [zlib.constants.BROTLI_PARAM_QUALITY]: 11,
          },
        },
        threshold: 10240,
        minRatio: 0.8,
      }),
      //Minify JS files
      new TerserPlugin({
        parallel: true,
        terserOptions: {
          format: {
            comments: false,
          },
        },
        extractComments: false,
      }),
      new CssMinimizerPlugin({
        parallel: true,
      }),
      new FilemanagerPlugin({
        events: {
          onEnd: {
            archive: [
              {
                format: "zip",
                source: buildPath,
                destination: `${path.join(destPath, zipName)}.zip`,
                options: { zlib: { level: 6 } },
              },
            ],
          },
        },
      }),
    ],
  },
});
