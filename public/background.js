chrome.runtime.onInstalled.addListener(() => {
  // Ensure the extension is available in the side panel for all tabs.
  chrome.sidePanel.setOptions({
    path: "src/sidepanel/index.html",
    enabled: true
  });
});

chrome.action.onClicked.addListener((tab) => {
  if (!tab || tab.id === undefined || tab.windowId === undefined) return;

  // Use callback-style APIs to preserve the user gesture for sidePanel.open().
  chrome.sidePanel.setOptions(
    {
      tabId: tab.id,
      path: "src/sidepanel/index.html",
      enabled: true
    },
    () => {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError);
        return;
      }
      chrome.sidePanel.open({ windowId: tab.windowId });
    }
  );
});

