// @remove-on-eject-begin
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
// @remove-on-eject-end
"use strict";

const fs = require("fs");
const path = require("path");
const webpack = require("webpack");
const resolve = require("resolve");
const HtmlWebpackPlugin = require("html-webpack-plugin");
// const CaseSensitivePathsPlugin = require("case-sensitive-paths-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
// const { WebpackManifestPlugin } = require("webpack-manifest-plugin");
// const WorkboxWebpackPlugin = require("workbox-webpack-plugin");
// const ModuleScopePlugin = require("react-dev-utils/ModuleScopePlugin");
// const getCSSModuleLocalIdent = require("react-dev-utils/getCSSModuleLocalIdent");
// const ESLintPlugin = require("eslint-webpack-plugin");
const paths = require("./paths");
const { moduleFileExtensions } = paths;
delete paths.moduleFileExtensions;
console.log("LOGGING MODULE FILE EXTENSIONS ", moduleFileExtensions);
const createEnvironmentHash = require("./webpack/persistentCache/createEnvironmentHash");
const FilemanagerPlugin = require("filemanager-webpack-plugin");
const WextManifestWebpackPlugin = require("wext-manifest-webpack-plugin");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const webpackFileExtensions = moduleFileExtensions.map((ext) => "." + ext);
console.log("logging file extensions here", webpackFileExtensions);
const sourcePath = path.join(__dirname, "..", "src");
const appPackageJson = require(paths.appPackageJson);
console.log("LOGGING OATHS ", paths);
console.log("LOGGING PATH JOIN PATH ", sourcePath);
// const modules = require("./modules");
// const getClientEnvironment = require("./env");
// const ModuleNotFoundPlugin = require("react-dev-utils/ModuleNotFoundPlugin");
// const { entry } = require("./webpack.config copy");
// const ForkTsCheckerWebpackPlugin =
//   process.env.TSC_COMPILE_ON_ERROR === "true"
//     ? require("react-dev-utils/ForkTsCheckerWarningWebpackPlugin")
//     : require("react-dev-utils/ForkTsCheckerWebpackPlugin");

// Source maps are resource heavy and can cause out of memory issue for large source files.
const shouldUseSourceMap = process.env.GENERATE_SOURCEMAP !== "false";

// const emitErrorsAsWarnings = process.env.ESLINT_NO_DEV_ERRORS === "true";
// const disableESLintPlugin = process.env.DISABLE_ESLINT_PLUGIN === "true";

// const imageInlineSizeLimit = parseInt(
//   process.env.IMAGE_INLINE_SIZE_LIMIT || "10000"
// );

// Check if TypeScript is setup
const useTypeScript = fs.existsSync(paths.appTsConfig);

console.log("Are we able to log the package.json??", paths.appPackageJson);

const zipName = `${appPackageJson.name}-${appPackageJson.version}`;

// // Check if Tailwind config exists
// const useTailwind = fs.existsSync(
//   path.join(paths.appPath, "tailwind.config.js")
// );

// // Get the path to the uncompiled service worker (if it exists).
// const swSrc = paths.swSrc;

// // style files regexes
// const cssRegex = /\.css$/;
// const cssModuleRegex = /\.module\.css$/;
// const sassRegex = /\.(scss|sass)$/;
// const sassModuleRegex = /\.module\.(scss|sass)$/; //!!!!!! ensure we support modules

// const hasJsxRuntime = (() => {
//   if (process.env.DISABLE_NEW_JSX_TRANSFORM === "true") {
//     return false;
//   }

//   try {
//     require.resolve("react/jsx-runtime");
//     return true;
//   } catch (e) {
//     return false;
//   }
// })();

// This is the production and development configuration.
// It is focused on developer experience, fast rebuilds, and a minimal bundle.
module.exports = function (webpackEnv) {
  // const isEnvDevelopment = webpackEnv === "development";
  // const isEnvProduction = webpackEnv === "production";
  const isEnvDevelopment = process.env.NODE_ENV === "development";
  const isEnvProduction = process.env.NODE_ENV === "production";

  // // Variable used for enabling profiling in Production
  // // passed into alias object. Uses a flag if passed into the build command
  // const isEnvProductionProfile =
  //   isEnvProduction && process.argv.includes("--profile");

  //It's possible that some of the entry point paths have been deleted or changed by the user, resulting in empty or nonexistent files
  //This isn't foolproof, but in most cases should prevent empty or nonexistent files from being included in the build
  function getEntryPoints() {
    const entryPoints = {};
    const potentialEntries = {
      ...paths.appPageModules,
      background: paths.background,
      contentScript: paths.contentScript,
      inject: paths.inject,
      manifest: paths.appManifestJson,
    };

    for (const [key, filePath] of Object.entries(potentialEntries)) {
      if (fs.existsSync(filePath) && fs.statSync(filePath).size > 0) {
        entryPoints[key] = filePath;
      }
    }

    //If not a single entry point was found, either we ran into an issue or the user has no entry points, or has deviated from the required file structure
    if (Object.keys(entryPoints).length === 0) {
      throw new Error(
        "Error: No extension files found. Please ensure that you have at least one entry point file in your src folder."
      );
    }

    console.log("Logging actual webapck entry points", entryPoints);
    return entryPoints;
  }

  const fileExtensions = [".ts", ".tsx", ".js", ".jsx", ".json"];

  return {
    //TODO: Disabling temporarily because no browserslist config exists yet in package json
    // target: ["browserslist"],
    // Webpack noise constrained to errors and warnings
    stats: "errors-warnings",
    mode: isEnvProduction ? "production" : isEnvDevelopment && "development",
    // Stop compilation early in production
    bail: isEnvProduction,
    devtool: isEnvDevelopment && "cheap-module-source-map",
    // These are the "entry points" to our application.
    // This means they will be the "root" imports that are included in JS bundle.
    entry: getEntryPoints(),
    output: {
      // The build folder.
      path: paths.appBuild,
      filename: "js/[name].bundle.js",
      // Add /* filename */ comments to generated require()s in the output.
      pathinfo: isEnvDevelopment,
      // There will be one main bundle, and one file per asynchronous chunk.
      // In development, it does not produce real files.
      // filename: isEnvProduction
      //   ? "static/js/[name].[contenthash:8].js"
      //   : isEnvDevelopment && "static/js/bundle.js",
      // There are also additional JS chunk files if you use code splitting.
      // chunkFilename: isEnvProduction
      //   ? "static/js/[name].[contenthash:8].chunk.js"
      //   : isEnvDevelopment && "static/js/[name].chunk.js",
      // assetModuleFilename: "static/media/[name].[hash][ext]",
      // webpack uses `publicPath` to determine where the app is being served from.
      // It requires a trailing slash, or the file assets will get an incorrect path.
      // We inferred the "public path" (such as / or /my-project) from homepage.
      publicPath: paths.publicUrlOrPath,
      // Point sourcemap entries to original disk location (format as URL on Windows)
      //   devtoolModuleFilenameTemplate: isEnvProduction
      //     ? (info) =>
      //         path
      //           .relative(paths.appSrc, info.absoluteResourcePath)
      //           .replace(/\\/g, "/")
      //     : isEnvDevelopment &&
      //       ((info) =>
      //         path.resolve(info.absoluteResourcePath).replace(/\\/g, "/")),
    },
    resolve: {
      extensions: webpackFileExtensions,
    },
    //TODO: get caching back up and running
    // cache: {
    //   type: "filesystem",
    //   // version: createEnvironmentHash(env.raw),
    //   version: createEnvironmentHash(process.env),
    //   cacheDirectory: paths.appWebpackCache,
    //   store: "pack",
    //   buildDependencies: {
    //     defaultWebpack: ["webpack/lib/"],
    //     config: [__filename],
    //     tsconfig: [paths.appTsConfig, paths.appJsConfig].filter((f) =>
    //       fs.existsSync(f)
    //     ),
    //   },
    // },
    //todo: return to this later. This silences the logging from our build process, which is needed to debug rn
    // infrastructureLogging: {
    //   level: "none",
    // },
    module: {
      strictExportPresence: true,
      rules: [
        // Handle node_modules packages that contain sourcemaps
        // shouldUseSourceMap && {
        //   enforce: "pre",
        //   exclude: /@babel(?:\/|\\{1,2})runtime/,
        //   test: /\.(js|mjs|jsx|ts|tsx|css)$/,
        //   loader: require.resolve("source-map-loader"),
        // },
        {
          // "oneOf" will traverse all following loaders until one will
          // match the requirements. When no loader matches it will fall
          // back to the "file" loader at the end of the loader list.
          oneOf: [
            {
              test: /\.svg$/,
              use: [
                {
                  loader: require.resolve("@svgr/webpack"),
                  options: {
                    prettier: false,
                    svgo: false,
                    svgoConfig: {
                      plugins: [{ removeViewBox: false }],
                    },
                    titleProp: true,
                    ref: true,
                  },
                },
                {
                  loader: require.resolve("file-loader"),
                  // options: {
                  //   name: "static/media/[name].[hash].[ext]",
                  // },
                },
              ],
              issuer: {
                and: [/\.(ts|tsx|js|jsx|md|mdx)$/],
              },
            },
            // Images: PNG, JPG, JPEG, WebP, GIF, TIFF, AVIF, HEIC, HEIF
            {
              test: /\.(png|jpe?g|webp|gif|tiff|avif|heic|heif)$/,
              use: [
                {
                  loader: "url-loader",
                  options: {
                    limit: 10240, // Inline images smaller than 10 KB
                    // name: "assets/images/[name].[ext]",
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
            //Manifest.JSON
            {
              test: /manifest\.json$/,
              type: "javascript/auto", // prevent webpack handling json with its own loaders,
              use: {
                loader: "wext-manifest-loader",
                options: {
                  usePackageJSONVersion: true, // set to false to not use package.json version for manifest
                },
              },
              exclude: /node_modules/,
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
            // //Javascript
            // {
            //   test: /\.js$/,
            //   use: {
            //     loader: "babel-loader",
            //     options: {
            //       //ensure backwards compatibility with older browsers
            //       plugins: [
            //         "@babel/plugin-proposal-optional-chaining",
            //         "@babel/plugin-proposal-nullish-coalescing-operator",
            //       ],
            //     },
            //   },
            //   exclude: /node_modules/,
            // },
            // //Typescript
            // {
            //   test: /\.tsx?$/,
            //   exclude: /node_modules/,
            //   use: {
            //     loader: "swc-loader",
            //     options: {
            //       jsc: {
            //         parser: {
            //           syntax: "typescript",
            //           tsx: true,
            //         },
            //         target: "es5",
            //         transform: {
            //           react: {
            //             runtime: "automatic",
            //           },
            //         },
            //       },
            //     },
            //   },
            // },
            // Process application JS with SWC.
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
                    // minify: {
                    //   // Enable minification (consider only for production)
                    //   compress: true,
                    //   mangle: true,
                    // },
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
            // "file" loader makes sure those assets get served by WebpackDevServer.
            // When you `import` an asset, you get its (virtual) filename.
            // In production, they would get copied to the `build` folder.
            // This loader doesn't use a "test" so it will catch all modules
            // that fall through the other loaders.
            {
              // Exclude `js` files to keep "css" loader working as it injects
              // its runtime that would otherwise be processed through "file" loader.
              // Also exclude `html` and `json` extensions so they get processed
              // by webpacks internal loaders.
              exclude: [/^$/, /\.(js|mjs|jsx|ts|tsx)$/, /\.html$/, /\.json$/],
              type: "asset/resource",
            },
            // ** STOP ** Are you adding a new loader?
            // Make sure to add the new loader(s) before the "file" loader.
          ],
        },
      ].filter(Boolean),
    },

    plugins: [
      isEnvProduction &&
        new MiniCssExtractPlugin({
          filename: "css/[name].css",
          // Options similar to the same options in webpackOptions.output
          // both options are optional
          // filename: "static/css/[name].[contenthash:8].css",
          // chunkFilename: "static/css/[name].[contenthash:8].chunk.css",
        }),

      // Plugin to not generate js bundle for manifest entry
      //DEV disabling due to issues with the plugin
      new WextManifestWebpackPlugin({
        source: path.join(__dirname, "..", "public", "manifest.json"),
        output: paths.appSrc,
      }),

      new ForkTsCheckerWebpackPlugin(),
      // environmental variables
      new webpack.EnvironmentPlugin(["NODE_ENV"]),
      //TODO: the path to our build folder needs to be updated here
      // delete previous build files
      // new CleanWebpackPlugin({
      //   cleanOnceBeforeBuildPatterns: [
      //     path.join(process.cwd(), `build`),
      //     path.join(process.cwd(), `build.zip`),
      //   ],
      //   cleanStaleWebpackAssets: false,
      //   verbose: true,
      // }),
      //TODO: this needs to work for us to allow dynamic page creation
      // ...Object.keys(paths.appPageModules).map((pageModule) => {
      //   return new HtmlWebpackPlugin(
      //     Object.assign(
      //       {},
      //       {
      //         inject: true,
      //         template: paths.appHtml,
      //       },
      //       isEnvProduction
      //         ? {
      //             minify: {
      //               removeComments: true,
      //               collapseWhitespace: true,
      //               removeRedundantAttributes: true,
      //               useShortDoctype: true,
      //               removeEmptyAttributes: true,
      //               removeStyleLinkTypeAttributes: true,
      //               keepClosingSlash: true,
      //               minifyJS: true,
      //               minifyCSS: true,
      //               minifyURLs: true,
      //             },
      //           }
      //         : undefined
      //     )
      //   );
      // }),
      new HtmlWebpackPlugin({
        template: paths.optionsHtml,
        inject: "body",
        chunks: ["optionsIndexJs", "vendors"],
        hash: true,
        filename: "options.html",
      }),

      //Using our public index.html as a template, generate a new one w/ react deps and css
      new HtmlWebpackPlugin({
        template: paths.popupHtml,
        inject: "body",
        chunks: ["popupIndexJs", "vendors"],
        hash: true,
        filename: "popup.html",
      }),
      // Generates an `index.html` file with the <script> injected.
      // new HtmlWebpackPlugin(
      //   Object.assign(
      //     {},
      //     {
      //       inject: true,
      //       template: paths.appHtml,
      //     },
      //     isEnvProduction
      //       ? {
      //           minify: {
      //             removeComments: true,
      //             collapseWhitespace: true,
      //             removeRedundantAttributes: true,
      //             useShortDoctype: true,
      //             removeEmptyAttributes: true,
      //             removeStyleLinkTypeAttributes: true,
      //             keepClosingSlash: true,
      //             minifyJS: true,
      //             minifyCSS: true,
      //             minifyURLs: true,
      //           },
      //         }
      //       : undefined
      //   )
      // ),
      // Inlines the webpack runtime script. This script is too small to warrant
      // a network request.
      // https://github.com/facebook/create-react-app/issues/5358

      // Moment.js is an extremely popular library that bundles large locale files
      // by default due to how webpack interprets its code. This is a practical
      // solution that requires the user to opt into importing specific locales.
      // https://github.com/jmblog/how-to-optimize-momentjs-with-webpack
      // You can remove this if you don't use Moment.js:
      new webpack.IgnorePlugin({
        resourceRegExp: /^\.\/locale$/,
        contextRegExp: /moment$/,
      }),

      // TypeScript type checking
      // useTypeScript &&
      //   new ForkTsCheckerWebpackPlugin({
      //     async: isEnvDevelopment,
      //     typescript: {
      //       typescriptPath: resolve.sync("typescript", {
      //         basedir: paths.appNodeModules,
      //       }),
      //       configOverwrite: {
      //         compilerOptions: {
      //           sourceMap: isEnvProduction
      //             ? shouldUseSourceMap
      //             : isEnvDevelopment,
      //           skipLibCheck: true,
      //           inlineSourceMap: false,
      //           declarationMap: false,
      //           noEmit: true,
      //           incremental: true,
      //           tsBuildInfoFile: paths.appTsBuildInfoFile,
      //         },
      //       },
      //       context: paths.appPath,
      //       diagnosticOptions: {
      //         syntactic: true,
      //       },
      //       mode: "write-references",
      //       // profile: true,
      //     },
      //     issue: {
      //       // This one is specifically to match during CI tests,
      //       // as micromatch doesn't match
      //       // '../cra-template-typescript/template/src/App.tsx'
      //       // otherwise.
      //       include: [
      //         { file: "../**/src/**/*.{ts,tsx}" },
      //         { file: "**/src/**/*.{ts,tsx}" },
      //       ],
      //       exclude: [
      //         { file: "**/src/**/__tests__/**" },
      //         { file: "**/src/**/?(*.){spec|test}.*" },
      //         { file: "**/src/setupProxy.*" },
      //         { file: "**/src/setupTests.*" },
      //       ],
      //     },
      //     logger: {
      //       infrastructure: "silent",
      //     },
      //   }),

      new ForkTsCheckerWebpackPlugin(),
      // environmental variables
      new webpack.EnvironmentPlugin(["NODE_ENV"]),
      //TODO: the path to our build folder needs to be updated here
      // delete previous build files
      // new CleanWebpackPlugin({
      //   cleanOnceBeforeBuildPatterns: [
      //     path.join(process.cwd(), `build`),
      //     path.join(process.cwd(), `build.zip`),
      //   ],
      //   cleanStaleWebpackAssets: false,
      //   verbose: true,
      // }),
    ].filter(Boolean),
    optimization: {
      sideEffects: false,
      mergeDuplicateChunks: true,
      removeEmptyChunks: true,
      providedExports: true,
      minimize: isEnvProduction,
      minimizer: [
        // This is only used in production mode
        // new TerserPlugin({
        //   parallel: true,
        //   terserOptions: {
        //     format: {
        //       comments: false,
        //       ecma: 5,
        //       comments: false,
        //       // Turned on because emoji and regex is not minified properly using default
        //       // https://github.com/facebook/create-react-app/issues/2488
        //       ascii_only: true,
        //     },
        //     parse: {
        //       // We want terser to parse ecma 8 code. However, we don't want it
        //       // to apply any minification steps that turns valid ecma 5 code
        //       // into invalid ecma 5 code. This is why the 'compress' and 'output'
        //       // sections only apply transformations that are ecma 5 safe
        //       // https://github.com/facebook/create-react-app/pull/4234
        //       ecma: 8,
        //     },
        //     compress: {
        //       ecma: 5,
        //       warnings: false,
        //       // Disabled because of an issue with Uglify breaking seemingly valid code:
        //       // https://github.com/facebook/create-react-app/issues/2376
        //       // Pending further investigation:
        //       // https://github.com/mishoo/UglifyJS2/issues/2011
        //       comparisons: false,
        //       // Disabled because of an issue with Terser breaking valid code:
        //       // https://github.com/facebook/create-react-app/issues/5250
        //       // Pending further investigation:
        //       // https://github.com/terser-js/terser/issues/120
        //       inline: 2,
        //     },
        //     mangle: {
        //       safari10: true,
        //     },
        //   },
        //   extractComments: false,
        // }),
        // This is only used in production mode
        new CssMinimizerPlugin({
          parallel: true,
        }),
        new FilemanagerPlugin({
          events: {
            onEnd: {
              archive: [
                {
                  format: "zip",
                  source: paths.appBuild,
                  destination: `${path.join(paths.appDist, zipName)}.zip`,
                  options: { zlib: { level: 6 } },
                },
              ],
            },
          },
        }),
      ],
      // runtimeChunk: {
      //   name: (entrypoint) => {
      //     if (
      //       entrypoint.name.startsWith("background") ||
      //       entrypoint.name.startsWith("contentScript") ||
      //       entrypoint.name.startsWith("inject")
      //     ) {
      //       return null;
      //     }

      //     return `runtime-${entrypoint.name}`;
      //   },
      // },
      // splitChunks: {
      //   chunks: (chunk) => {
      //     // Exclude specific chunks from being split
      //     return !["background", "contentScript", "inject"].includes(
      //       chunk.name
      //     );
      //   },
      //   name: false,
      //   cacheGroups: {
      //     vendors: {
      //       test: /[\\/]node_modules[\\/]/,
      //       name: "vendors",
      //       chunks: "all",
      //     },
      //     common: {
      //       name: "common",
      //       minChunks: 2,
      //       priority: -10,
      //       reuseExistingChunk: true,
      //     },
      //   },
      // },
    },
    // Turn off performance processing because we utilize
    // our own hints via the FileSizeReporter
    performance: false,
  };
};
