const path = require("path");
const webpack = require("webpack");

const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const WextManifestWebpackPlugin = require("wext-manifest-webpack-plugin");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
const fs = require("fs");

const FilemanagerPlugin = require("filemanager-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const CompressionPlugin = require("compression-webpack-plugin");
const zlib = require("zlib");

// Make sure any symlinks in the project folder are resolved:
// https://github.com/facebook/create-react-app/issues/637
const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = (relativePath) => path.resolve(appDirectory, relativePath);

// style files regexes
const cssRegex = /\.css$/;
const cssModuleRegex = /\.module\.css$/;
const sassRegex = /\.(scss|sass)$/;
const sassModuleRegex = /\.module\.(scss|sass)$/;

const ownPackageJson = require("../package.json");

const distPath = path.join(__dirname, ".dist");
const buildPath = path.join(__dirname, "build");

const zipName = `${ownPackageJson.name}-${ownPackageJson.version}`;

const sourcePath = path.join(__dirname, "..", "src");
const MANIFEST_FILEPATH = path.join(__dirname, "..", "public", "manifest.json");
const PAGES_FILEPATH = path.join(sourcePath, "Pages");
const destPath = path.join(__dirname, "..", "build");
const templatePath = path.join(__dirname, "..", "public", "pageTemplates");
const nodeEnv = process.env.NODE_ENV || "development";

const fileExtensions = [".ts", ".tsx", ".js", ".jsx", ".json"];

const moduleFileExtensions = [
  "web.mjs",
  "mjs",
  "web.js",
  "js",
  "web.ts",
  "ts",
  "web.tsx",
  "tsx",
  "json",
  "web.jsx",
  "jsx",
];

function getEntryPoints() {
  const entryPoints = {};
  const potentialEntries = {
    background: path.join(sourcePath, "Background", "index.ts"),
    contentScript: path.join(sourcePath, "ContentScript", "index.ts"),
    inject: path.join(sourcePath, "InjectedScript", "index.ts"),
    options: path.join(PAGES_FILEPATH, "options", "index.tsx"),
    popup: path.join(PAGES_FILEPATH, "popup", "index.tsx"),
  };

  for (const [key, filePath] of Object.entries(potentialEntries)) {
    if (fs.existsSync(filePath) && fs.statSync(filePath).size > 0) {
      entryPoints[key] = filePath;
    }
  }

  return entryPoints;
}

module.exports = {
  mode: "production",
  entry: getEntryPoints(),
  output: {
    path: destPath,
    filename: "js/[name].bundle.js",
    publicPath: "/",
  },
  resolve: {
    extensions: fileExtensions,
  },
  module: {
    rules: [
      //Fonts
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: "asset",
        parser: {
          dataUrlCondition: {
            maxSize: 10 * 1024, // 10 KB
          },
        },
        generator: {
          filename: "assets/fonts/[name][ext]",
        },
        exclude: /node_modules/,
      },
      //Manifest.JSON
      {
        type: "javascript/auto", // prevent webpack handling json with its own loaders,
        test: /manifest\.json$/,
        use: {
          loader: "wext-manifest-loader",
          options: {
            usePackageJSONVersion: true, // set to false to not use package.json version for manifest
          },
        },
        exclude: /node_modules/,
      },
      {
        test: /\.(mjs|ts|tsx|js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "swc-loader",
          options: {
            jsc: {
              parser: {
                syntax: "typescript", // Use 'ecmascript' for .js and .jsx files
                tsx: true, // Enable TSX parsing
              },
              target: "es5", // Target lower ECMAScript version for broader compatibility
              minify: {
                // Enable minification (consider only for production)
                compress: true,
                mangle: true,
              },
              transform: {
                react: {
                  pragma: "React.createElement",
                  pragmaFrag: "React.Fragment",
                  throwIfNamespace: true,
                  development: process.env.NODE_ENV !== "production",
                  useBuiltins: true,
                },
              },
            },
            module: {
              type: "es6", // Use ES6 modules, crucial for tree shaking
            },
          },
        },
      },
      // CSS files
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          "css-loader",
          {
            loader: "postcss-loader",
            options: {
              postcssOptions: {
                config: path.resolve(__dirname, "postcss.config.js"),
              },
            },
          },
        ],
      },
      // SASS/SCSS files
      {
        test: /\.(sass|scss)$/,
        use: [
          MiniCssExtractPlugin.loader,
          "css-loader",
          {
            loader: "postcss-loader",
            options: {
              postcssOptions: {
                config: path.resolve(__dirname, "postcss.config.js"),
              },
            },
          },
          "sass-loader", // Compiles SASS to CSS
        ],
      },

      // LESS files
      {
        test: /\.less$/,
        use: [
          MiniCssExtractPlugin.loader,
          "css-loader",
          {
            loader: "postcss-loader",
            options: {
              postcssOptions: {
                config: path.resolve(__dirname, "postcss.config.js"),
              },
            },
          },
          "less-loader", // Compiles LESS to CSS
        ],
      },
      // SVGs
      {
        test: /\.svg$/,
        oneOf: [
          {
            resourceQuery: /react/,
            use: "@svgr/webpack",
          },
          {
            resourceQuery: /data-text/,
            use: "raw-loader",
          },
          {
            use: {
              loader: "url-loader",
              options: { limit: 10240 }, // Inline files smaller than 10 KB
            },
          },
        ],
      },
      // Images: PNG, JPG, JPEG, WebP, GIF, TIFF, AVIF, HEIC, HEIF
      {
        test: /\.(png|jpe?g|webp|gif|tiff|avif|heic|heif)$/,
        use: [
          {
            loader: "url-loader",
            options: {
              limit: 10240, // Inline images smaller than 10 KB
              name: "assets/images/[name].[ext]",
              fallback: "file-loader", // Use file-loader for larger images
            },
          },
          {
            loader: "image-webpack-loader",
            options: {
              mozjpeg: {
                progressive: true,
                quality: 65,
              },
              optipng: {
                enabled: false,
              },
              pngquant: {
                quality: [0.65, 0.9],
                speed: 4,
              },
              gifsicle: {
                interlaced: false,
              },
              webp: {
                quality: 75,
              },
            },
          },
        ],
      },
      // JSON and JSON5
      {
        test: /\.json5?$/,
        type: "javascript/auto", // Required for .json5 files
        use: "json5-loader",
      },
      // GraphQL
      {
        test: /\.(graphql|gql)$/,
        exclude: /node_modules/,
        use: "@graphql-tools/webpack-loader",
      },
      // TODO: add any other rules here
    ],
  },
  plugins: [
    // write css file(s) to build folder
    new MiniCssExtractPlugin({ filename: "css/[name].css" }),
    // Plugin to not generate js bundle for manifest entry
    new WextManifestWebpackPlugin({
      source: MANIFEST_FILEPATH,
      output: destPath,
    }),
    new ForkTsCheckerWebpackPlugin(),
    // environmental variables
    new webpack.EnvironmentPlugin(["NODE_ENV"]),
    // delete previous build files
    new CleanWebpackPlugin({
      cleanOnceBeforeBuildPatterns: [
        path.join(process.cwd(), `build`),
        path.join(process.cwd(), `build.zip`),
      ],
      cleanStaleWebpackAssets: false,
      verbose: true,
    }),

    //Using our public index.html as a template, generate a new one w/ react deps and css
    new HtmlWebpackPlugin({
      template: path.join(templatePath, "options.html"),
      inject: "body",
      chunks: ["options", "vendors"],
      hash: true,
      filename: "options.html",
    }),

    //Using our public index.html as a template, generate a new one w/ react deps and css
    new HtmlWebpackPlugin({
      template: path.join(templatePath, "popup.html"),
      inject: "body",
      chunks: ["popup", "vendors"],
      hash: true,
      filename: "popup.html",
    }),

    //TODO
    // copy the favicon manually as webpack thinks it is unused and removes it during tree shaking
    // new CopyWebpackPlugin({
    //   patterns: [
    //     { from: "src/assets/images/Fire.png", to: "assets/images" },
    //     {
    //       from: "src/assets/images/fire-injected-wallet-ui.png",
    //       to: "assets/images",
    //     },
    //   ],
    // }),

    //uncomment to analyze webpack build
    // new BundleAnalyzerPlugin(),
  ],
  optimization: {
    sideEffects: false,
    mergeDuplicateChunks: true,
    removeEmptyChunks: true,
    providedExports: true,
    minimize: true,
    minimizer: [
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
                destination: `${path.join(distPath, zipName)}.zip`,
                options: { zlib: { level: 6 } },
              },
            ],
          },
        },
      }),
    ],

    runtimeChunk: {
      name: (entrypoint) => {
        if (
          entrypoint.name.startsWith("background") ||
          entrypoint.name.startsWith("contentScript") ||
          entrypoint.name.startsWith("inject")
        ) {
          return null;
        }

        return `runtime-${entrypoint.name}`;
      },
    },
    splitChunks: {
      chunks: (chunk) => {
        // Exclude specific chunks from being split
        return !["background", "contentScript", "inject"].includes(chunk.name);
      },
      name: false,
      cacheGroups: {
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          name: "vendors",
          chunks: "all",
        },
        common: {
          name: "common",
          minChunks: 2,
          priority: -10,
          reuseExistingChunk: true,
        },
      },
    },
  },
};
