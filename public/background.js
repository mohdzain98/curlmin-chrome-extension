chrome.runtime.onInstalled.addListener(() => {
  console.log("Curlmin extension installed!");
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "loading") {
    chrome.tabs.sendMessage(tabId, { type: "CLEANUP" }).catch(() => {
      // Ignore errors from closed tabs
    });
  }
});
