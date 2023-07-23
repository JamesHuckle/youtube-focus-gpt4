//background.js
chrome.runtime.onMessage.addListener((request, sender) => {
    console.log('>>> sender', sender)
    if(request.message === "loaded" || request.message === "urlChanged" && sender.tab.url.includes("youtube.com")) {
        fetch("https://youtube-focus-gpt4.vercel.app/api/findKeyInsight", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ url: sender.tab.url })
        })
        .then(res => res.json())
        .then(data => {
            if(data === false) {
                chrome.tabs.update(sender.tab.id, { url: 'https://www.codecademy.com/' });
            }
        });
    }
});

// Listen for tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.status === 'complete' && tab.url != null) {
    if(request.message === "loaded" & tab.url.includes("youtube.com")) {
      fetch("https://youtube-focus-gpt4.vercel.app/api/findKeyInsight", {
          method: "POST",
          headers: {
              "Content-Type": "application/json"
          },
          body: JSON.stringify({ url: tab.url })
      })
      .then(res => res.json())
      .then(data => {
          if(data === false) {
              chrome.tabs.update(tab.id, { url: 'https://www.codecademy.com/' });
          }
      });
  }
  }
});