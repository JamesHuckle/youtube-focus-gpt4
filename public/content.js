// content.js
window.addEventListener('load', (event) => {
    console.log('page is fully loaded content.js');
    chrome.runtime.sendMessage({ message: "loaded" });
});

window.addEventListener('popstate', (event) => {
    console.log('url changed loaded content.js');
  chrome.runtime.sendMessage({ message: "urlChanged" });
})

let lastUrl = location.href; 
new MutationObserver(() => {
  if (location.href !== lastUrl) {
    lastUrl = location.href;
    console.log('url changed mutation loaded content.js');
    chrome.runtime.sendMessage({ message: "urlChanged" });
  }
}).observe(document, {subtree: true, childList: true});