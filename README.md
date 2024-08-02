## Browser Extension Starter

Quickly bootstrap a browser extension project with TypeScript and React, ready for Chrome and Firefox.

## Description

My goal with this template is to provide a starting point for creating React/Typescript based Browser Extensions that don't require the hassle of dealing with custom webpack configurations to get a new app working. I've included support for TypeScript, React, CSS modules, and Tailwind CSS out of the box. The project structure is designed to be easily extensible, with separate directories for background scripts, content scripts, injected scripts, components, and pages.

This Browser Extension Starter is designed with an opinionated but flexible architecture. I've made some specific choices in technology stack and project structure to provide a stable foundation upon which to build future versions. However, I've also left room for customization in areas where developer preferences often vary. Down the line, I plan to support a more diverse range of technologies and configurations to accommodate a wider range of use cases.

## Features

- TypeScript and React support
- CSS modules and Tailwind built in
- Support for both Chrome and Firefox extensions
- Extensible architecture designed to be easily customizable without the need to "eject" from the core setup
- Browser-specific manifest with support for MV2 and MV3
- Development server with automatic rebuilds

## Getting Started

Create your new repository using this template:
`gh repo create [your-cool-extension] --template=boeschj/browser-extension-starter`
`cd browser-extension-starter`

Install dependencies:
`yarn install`

Start the development server:
`yarn run dev:[browser]` where [browser] is either `chrome` or `firefox`

To build for production:
`yarn run build:[browser]`

### Project Structure

```
/src
├── Background/
│ └── index.ts
├── ContentScript/
│ └── index.ts
├── InjectedScript/
│ └── index.ts
├── Components/
│ └── index.ts
├── Pages/
│ ├── options/
│ │ └── index.tsx
│ ├── popup/
│ │ └── index.tsx
│ └── newTab/
│ └── index.tsx
public/
├── manifest.json
├── favicon.png
└── pageTemplates/
├── options.html
├── popup.html
└── newtab.html
```

## Supported File Types

TypeScript (.ts, .tsx)
JavaScript (.js, .jsx)
CSS (.css)
Images (.jpg, .jpeg, .png, .gif, .svg)
Fonts (.woff, .woff2, .eot, .ttf, .otf)

## Available Scripts

In the project directory, you can run the following scripts:

### Development

Start the development server for Chrome. It watches for file changes and rebuilds automatically.
`yarn dev:chrome`

Start the development server for Firefox. It watches for file changes and rebuilds automatically.
`yarn dev:firefox`

### Production Build

yarn build:chrome: Creates a production build for Chrome.
yarn build:chrome

yarn build:firefox: Creates a production build for Firefox.
yarn build:firefox

### Development Workflow

Start the development server for your target browser:
`yarn dev:chrome`
or
`yarn dev:firefox`

Load the extension in your browser:

For Chrome: Go to chrome://extensions/, enable "Developer mode", click "Load unpacked", and select the build directory.
For Firefox: Go to about:debugging#/runtime/this-firefox, click "Load Temporary Add-on", and select any file in the build directory.

The extension will automatically rebuild when you make changes to the source files. You'll need to refresh the extension in the browser to see the changes.

### Building for Production

When you're ready to create a production build:

Run the build script for your target browser:
`yarn build:chrome`
or
`yarn build:firefox`

The production-ready extension will be in the `distribution` directory, ready for submission to the respective extension store.

## "Ejecting" from the Starter

This template was designed to be customizable without needing to eject. However, if you need to make significant changes to the configuration, please take note of the following:

- Manifest file: The manifest.json file must be present in the public directory and named exactly manifest.json.
- Favicon: The favicon must be named favicon.png and placed in the public directory.
- HTML templates: The HTML templates for options, popup, and new tab pages must be present in the public/pageTemplates directory, even if you're not using all of these pages. The build will fail if a template is missing.
- Entry point naming: The entry point files (e.g., background script, content script) must be named index.ts (or index.tsx for React components) and placed in their respective directories.
- Browser-specific manifest keys: Use **chrome** and **firefox** prefixes in your manifest.json for browser-specific keys. The build process will include only the relevant keys for the target browser.
- Development mode: When running in development mode, you'll need to manually load the extension into your browser and reload it after making changes.

## Customizing the Configuration

While this configuration is designed to be flexible, you may need to customize it further for specific needs. The main webpack configuration file is webpack.common.js. Be cautious when modifying this file, as changes may affect the build process for all components.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.
