
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "open-in-site-favorites",
    title: "Aegis Favorites Trigger",
    contexts: ["selection"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "open-in-site-favorites" && info.selectionText) {
    const query = encodeURIComponent(info.selectionText.trim());
    const site = `https://aegisboard.dev/index.html?q=${query}`;

    chrome.tabs.create({ url: site });
  }
});

// Omnibox support
chrome.omnibox.onInputEntered.addListener((text) => {
  const query = encodeURIComponent(text.trim());
  const site = `https://aegisboard.dev/index.html?q=${query}`;
  chrome.tabs.create({ url: site });
});
