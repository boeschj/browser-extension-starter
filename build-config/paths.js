"use strict";

const path = require("path");
const fs = require("fs");

const buildPath = process.env.BUILD_PATH || "build";

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

// Make sure any symlinks in the project folder are resolved:
// https://github.com/facebook/create-react-app/issues/637
const appDirectory = fs.realpathSync(process.cwd());

const resolveApp = (relativePath) => path.resolve(appDirectory, relativePath);

const resolveOwn = (relativePath) => path.resolve(__dirname, relativePath);

// Resolve file paths in the same order as webpack
const resolveModule = (resolveFn, filePath) => {
  const extension = moduleFileExtensions.find((extension) =>
    fs.existsSync(resolveFn(`${filePath}.${extension}`))
  );

  if (extension) {
    return resolveFn(`${filePath}.${extension}`);
  }

  return resolveFn(`${filePath}.js`);
};

const getPageModules = (pagesPath) => {
  const pagesDirectory = resolveApp(pagesPath);
  const pageModules = {};

  if (fs.existsSync(pagesDirectory)) {
    fs.readdirSync(pagesDirectory).forEach((dir) => {
      const fullPath = path.join(pagesDirectory, dir, "index");
      const resolvedPath = resolveModule(
        resolveApp,
        `${pagesPath}/${dir}/index`
      );
      if (resolvedPath) {
        pageModules[`${dir}IndexJs`] = resolvedPath;
      }
    });
  }

  return pageModules;
};

// Example usage
const pageModules = getPageModules("src/Pages");

console.log("HELLLOOO LOGGGING HERE!!!", pageModules);

module.exports = {
  appPageModules: pageModules,
  background: resolveModule(resolveApp, "src/Background/index"),
  contentScript: resolveModule(resolveApp, "src/ContentScript/index"),
  inject: resolveModule(resolveApp, "src/InjectedScript/index"),
  dotenv: resolveApp(".env"),
  appPath: resolveApp("."),
  appBuild: resolveApp(buildPath),
  appDist: resolveApp("dist"),
  appPublic: resolveApp("public"),
  optionsHtml: resolveApp("public/pageTemplates/options.html"),
  popupHtml: resolveApp("public/pageTemplates/popup.html"),
  appManifestJson: resolveApp("public/manifest.json"),
  appPackageJson: resolveApp("package.json"),
  appSrc: resolveApp("src"),
  publicUrlOrPath: "/",
  appWebpackCache: resolveApp("build-config/.cache"),
  appTsConfig: resolveApp("tsconfig.json"),
  appJsConfig: resolveApp("jsconfig.json"),
};

module.exports.moduleFileExtensions = moduleFileExtensions;
