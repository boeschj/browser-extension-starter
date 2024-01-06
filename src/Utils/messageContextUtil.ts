export enum ExecutionContext {
  Background,
  Content,
  Injected,
}

export function detectExecutionContext(): ExecutionContext {
  // Checking if the script is running as a background script
  if (window.location.href.includes("_generated_background_page.html")) {
    return ExecutionContext.Background;
  }
  // Content scripts have access to chrome.tabs API but not to chrome.extension.getViews
  else if (chrome.tabs && !chrome.extension.getViews) {
    return ExecutionContext.Content;
  } else if (window.location.protocol.startsWith("http"))
    return ExecutionContext.Injected;
  else {
    throw new Error("Unknown execution context");
  }
}
