content.js
window.addEventListener('load', (event) => {
    console.log('page is fully loaded content.js', location.href, '<<');
    chrome.runtime.sendMessage({ message: "loaded", url: location.href });
});

window.addEventListener('popstate', (event) => {
    console.log('url changed loaded content.js', location.href, '<<');
    chrome.runtime.sendMessage({ message: "urlChanged", url: location.href });
});

let lastUrl = location.href; 
console.log('content.js lastUrl', lastUrl);
new MutationObserver(() => {
  if (location.href !== lastUrl) {
    lastUrl = location.href;
    console.log('url changed mutation loaded content.js', lastUrl, '<<');
    chrome.runtime.sendMessage({ message: "urlChanged", url: location.href });
  }
}).observe(document, {subtree: true, childList: true});