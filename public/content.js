// content.js
window.addEventListener('load', (event) => {
    chrome.runtime.sendMessage({ message: "loaded" });
});