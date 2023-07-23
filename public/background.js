//background.js
chrome.runtime.onMessage.addListener((request, sender) => {
    console.log('>>> sender', sender);
    
    // Retrieve values from storage.local
    chrome.storage.local.get(['allowedVideos', 'blockedVideos', 'redirectUrl'], function(items) {
      let allowedVideos = items.allowedVideos;
      let blockedVideos = items.blockedVideos;
      let redirectUrl = items.redirectUrl;
  
      if ((request.message === "loaded" || request.message === "urlChanged") && sender.tab.url.includes("youtube.com")) {
        fetch("https://youtube-focus-gpt4.vercel.app/api/findKeyInsight", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ 
              url: sender.tab.url,
              allowedVideos: allowedVideos,
              blockedVideos: blockedVideos,
          })
        })
        .then(res => res.json())
        .then(data => {
            if(data === false) {
                chrome.tabs.update(sender.tab.id, { url: redirectUrl });
            }
        });
      }
    });
  });

  
// chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
//     if (changeInfo.status === 'complete' && tab.status === 'complete' && tab.url !== null) {
//         chrome.storage.local.get(['allowedVideos', 'blockedVideos', 'redirectUrl'], function(result) {
//             if(tab.url.includes("youtube.com")) {
//                 fetch("https://youtube-focus-gpt4.vercel.app/api/findKeyInsight", {
//                     method: "POST",
//                     headers: {
//                         "Content-Type": "application/json"
//                     },
//                     body: JSON.stringify({ 
//                         url: tab.url,
//                         allowedVideos: result.allowedVideos,
//                         blockedVideos: result.blockedVideos
//                     })
//                 })
//                 .then(res => res.json())
//                 .then(data => {
//                     if(data === false) {
//                         chrome.tabs.update(tab.id, { url: result.redirectUrl});
//                     }
//                 });
//             }
//         });
//     }
// });
