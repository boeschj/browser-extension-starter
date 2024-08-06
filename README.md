## Browser Extension Starter

Quickly bootstrap a browser extension project with TypeScript and React, compatible for Chromium MV3 and Firefox MV2.

## Description

This template provides a simple starting point for creating React/Typescript based Browser Extensions that comes out of the box with support for modern web technologies and cross-browser support, but doesn't require learning a new framework to build with or messing with your own webpack/babel configuration.

The project structure is designed to be easily extensible, with separate directories for background scripts, content scripts, injected scripts, components, and pages. The goal is for this template to be unopinionated, but I have made some specific choices in technology stack and project structure to provide a stable foundation upon which to build future versions. However, I've also left room for customization in areas where developer preferences or needs often vary. Down the line, I plan to support a more diverse range of technologies and configurations to accommodate a wider range of use cases.

## Features

- TypeScript and React support
- CSS modules and Tailwind built in
- Support for both Chrome and Firefox extensions
- Browser-specific manifest with support for MV2 and MV3
- Development server with automatic rebuilds

## Getting Started

### Step 1:
Step one is to install the GitHub CLI. If you already have it or don't wish to install it, please skip down to the next step.

#### MacOS

If you have Homebrew installed, running: `brew install gh` will install the CLI. 

#### Windows

For Windows 10 or 11, you should be able to install using winget: `winget install --id GitHub.cli`

#### Other CLI installation options

On a different OS or wanting to use a different tool? Check out the GitHub CLI README [here](https://github.com/cli/cli?tab=readme-ov-file#installation) for all available installation options!

### Step 2:
Next, simply run this command to create your new repository using this template:
```
gh repo create [your-cool-extension] --template=boeschj/browser-extension-starter --private
```
Note: This will automatically create a new private repository. To create a public one, simply change the flag at the end of the above command!

If you aren't using the GitHub CLI, you can follow this [guide](https://docs.github.com/en/repositories/creating-and-managing-repositories/creating-a-repository-from-a-template) on creating a repository from a template to get started manually.

### Step 3:
Install dependencies:

`cd browser-extension-starter`

`yarn install`

### Step 4:
Start the development server

To start the development server:
`yarn run dev:[browser]` where [browser] is either `chrome` or `firefox`

To build for production:
`yarn run build:[browser]`

### Step 5:
Load your extension into the browser and start building! 🚀

For Chrome: Go to `chrome://extensions/`, enable "Developer mode", click "Load unpacked", and select the build directory.
For Firefox: Go to `about:debugging#/runtime/this-firefox`, click "Load Temporary Add-on", and select any file in the build directory.

## Project Structure

Out of the box, this template supports Background Service workers, Content Scripts, Inpage (injected) scripts, Options page, Popup page, New Tab page, and Manifest.json (Chromium MV3 and Firefox MV2 by default). It doesn't currently support DevTools or SidePanel Pages, but these are coming in the future.

To add a new script file or page, please ensure your entry file follows this naming convention (e.g. to add a background service worker, you'd need to create `Background/index.ts`), or the build script won't be able to find it. For pages or scripts you won't need, you can safely delete any directories you aren't actively using to cut down on unnecessary boilerplate. 
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

### File Extensions
| TypeScript | JavaScript |
|------------|------------|
| .ts, .tsx  | .js, .jsx  |

### CSS
| CSS  |
|----- |
| .css |

### Images
| Images                        |
|-------------------------------|
| .jpg, .jpeg, .png, .gif, .svg |

### Fonts
| Fonts                           |
|---------------------------------|
| .woff, .woff2, .eot, .ttf, .otf |

## Available Scripts

In the project directory, you can run the following scripts:

### Development

Start the development server for a given browser. It watches for file changes and rebuilds automatically.

Chrome:
`yarn dev:chrome`

Firefox:
`yarn dev:firefox`

### Production Build

Create an optimized production build to ship to an extension store:

Chrome:
`yarn build:chrome`

Firefox:
`yarn build:firefox`

### Development Workflow

Start the development server for your target browser:
`yarn dev:chrome`
or
`yarn dev:firefox`

Load the extension in your browser:

For Chrome: Go to `chrome://extensions/`, enable "Developer mode", click "Load unpacked", and select the build directory.
For Firefox: Go to `about:debugging#/runtime/this-firefox`, click "Load Temporary Add-on", and select any file in the build directory.

The extension will automatically rebuild when you make changes to the source files. You'll need to refresh the extension in the browser to see the changes.

### Building for Production

When you're ready to create a production build:

Run the build script for your target browser:
`yarn build:chrome`
or
`yarn build:firefox`

The production-ready extension will be in the `distribution` directory, ready for submission to the respective extension store.

## Gotchas and Limitations

- Manifest file: The manifest.json file must be present in the public directory and named exactly manifest.json.
- Default icon: The "favicon" must be named favicon.png and placed in the public directory, otherwise it will get tree-shaken during the build process.
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
