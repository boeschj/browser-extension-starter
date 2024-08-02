const path = require("path");
const webpack = require("webpack");

const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const WextManifestWebpackPlugin = require("wext-manifest-webpack-plugin");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");

//Webpack entry points
const sourcePath = path.join(__dirname, "src");
const MANIFEST_FILEPATH = path.join(__dirname, "public", "manifest.json");
const PAGES_FILEPATH = path.join(sourcePath, "Pages");
const destPath = path.join(__dirname, "build");
const templatePath = path.join(__dirname, "public", "pageTemplates");
const nodeEnv = process.env.NODE_ENV || "development";

//Tooling paths
const postcssPath = path.resolve(__dirname, "./postcss.config.js");

var assetFileExtensions = ["jpg", "jpeg", "png", "gif", "svg"];
const fileExtensions = [".ts", ".tsx", ".js", ".jsx", ".json"];

const entryPoints = {
  manifest: MANIFEST_FILEPATH,
  background: path.join(sourcePath, "Background", "index.ts"),
  contentScript: path.join(sourcePath, "ContentScript", "index.ts"),
  inject: path.join(sourcePath, "InjectedScript", "index.ts"),
  options: path.join(PAGES_FILEPATH, "options", "index.tsx"),
  newTab: path.join(PAGES_FILEPATH, "newTab", "index.tsx"),
  popup: path.join(PAGES_FILEPATH, "popup", "index.tsx"),
};

// Filter out non-existent entry points
const entry = Object.entries(entryPoints).reduce((acc, [key, value]) => {
  if (fileExists(value)) {
    acc[key] = value;
  }
  return acc;
}, {});

module.exports = {
  devtool: nodeEnv === "development" ? "inline-source-map" : false,
  mode: nodeEnv,
  entry,
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
        type: "asset/resource",
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
      //Javascript
      {
        test: /\.js$/,
        use: {
          loader: "babel-loader",
          options: {
            //ensure backwards compatibility with older browsers
            plugins: [
              "@babel/plugin-proposal-optional-chaining",
              "@babel/plugin-proposal-nullish-coalescing-operator",
            ],
          },
        },
        exclude: /node_modules/,
      },
      //Typescript
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: {
          loader: "swc-loader",
          options: {
            jsc: {
              parser: {
                syntax: "typescript",
                tsx: true,
              },
              target: "es5",
              transform: {
                react: {
                  runtime: "automatic",
                },
              },
            },
          },
        },
      },
      //CSS
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: "css-loader",
            options: { importLoaders: 1 },
          },
          {
            loader: "postcss-loader",
            options: {
              postcssOptions: {
                config: postcssPath,
              },
            },
          },
        ],
      },
      //Images
      {
        test: new RegExp(".(" + assetFileExtensions.join("|") + ")$"),
        type: "asset/resource",
        generator: {
          filename: "assets/images/[name][ext]",
        },
        exclude: /node_modules/,
      },
      // TODO: add any other rules here
    ],
  },
  plugins: [
    new CleanWebpackPlugin(),
    // write css file(s) to build folder
    new MiniCssExtractPlugin({
      filename: "css/[name].css",
    }),
    // Plugin to not generate js bundle for manifest entry
    new WextManifestWebpackPlugin(),
    new ForkTsCheckerWebpackPlugin(),
    // environmental variables
    new webpack.EnvironmentPlugin(["NODE_ENV", "TARGET_BROWSER"]),
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
      chunks: ["options"],
      hash: true,
      filename: "options.html",
    }),

    //Using our public index.html as a template, generate a new one w/ react deps and css
    new HtmlWebpackPlugin({
      template: path.join(templatePath, "newtab.html"),
      inject: "body",
      chunks: ["newtab"],
      hash: true,
      filename: "newtab.html",
    }),

    //Using our public index.html as a template, generate a new one w/ react deps and css
    new HtmlWebpackPlugin({
      template: path.join(templatePath, "popup.html"),
      inject: "body",
      chunks: ["popup"],
      hash: true,
      filename: "popup.html",
    }),

    // copy the favicon manually as webpack thinks it is unused and removes it during tree shaking
    new CopyPlugin({
      patterns: [{ from: "public/favicon.png", to: "assets/images" }],
    }),

    // Extract common dependencies into a separate vendor bundle
    new webpack.optimize.SplitChunksPlugin(),

    //uncomment to analyze webpack build
    // new BundleAnalyzerPlugin(),
  ],
  optimization: {
    sideEffects: true,
    mergeDuplicateChunks: true,
    removeEmptyChunks: true,
    providedExports: true,
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
      chunks(chunk) {
        return !["background", "contentScript", "inject"].includes(chunk.name);
      },
    },
  },
};
