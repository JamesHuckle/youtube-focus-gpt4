chrome.runtime.onMessage.addListener((request, sender) => {
    console.log('sender tab url', sender)
    if(request.message === "loaded") {
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