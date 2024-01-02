import browser from "webextension-polyfill";

//TODO: perform some action when the extension installs
browser.runtime.onInstalled.addListener((): void => {
  console.log("Extension installed");
});
