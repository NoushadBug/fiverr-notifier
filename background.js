// Function to show a notification when audio is detected
function showAudioNotification(tab) {
    alert("No unread messages");

    var unreadMessages = document.querySelectorAll('[id^="Realtime"] ul');
    if (unreadMessages.length > 0) {
        chrome.storage.local.get(['silenceUntil', 'lastNotification'], function (result) {
            let now = Date.now();
            let silenceUntil = result.silenceUntil || 0;
            let lastNotification = result.lastNotification || 0;
            let hasUnreadMessages = $(".unread-icon:not(.notifications-drawer-bell-unread)").length > 0;
            var unreadMessages = document.querySelectorAll('[id^="Realtime"] ul li');

            // Only show notification if there are unread messages and it's been more than 1 minute since the last notification
            if (unreadMessages.length > 0 && (now - lastNotification > 60000)) {
                let bodyText;

                if (unreadMessages.length === 1) {
                    bodyText = unreadMessages[0].textContent.trim();
                    bodyText = bodyText.substring(bodyText.indexOf('@') + 1).trim();
                } else {
                    let messageList = [];
                    unreadMessages.forEach((message) => {
                        let username = message.querySelector('.username')?.textContent.trim() || 'Unknown';
                        messageList.push(`from - ${username}`);
                    });
                    bodyText = messageList.join('\n');
                }

                let firstUserName = unreadMessages[0].querySelector('.username')?.textContent.replace('@', '').trim();

                let unreadNotification = new Notification(`Fiverr :: ${unreadMessages.length} new unread messages`, {
                    body: `𝗖𝗹𝗶𝗰𝗸 𝘁𝗼 𝗼𝗽𝗲𝗻 »
    ` + bodyText,
                    icon: 'https://cdn0.iconfinder.com/data/icons/socicons-2/512/Fiverr-512.png',
                    requireInteraction: true
                });

                unreadNotification.onclick = function (event) {
                    let now = Date.now();
                    chrome.storage.local.set({ lastNotification: now });
                    chrome.storage.local.set({ silenceUntil: now + 60000 });
                    if (firstUserName) {
                        window.open(`https://www.fiverr.com/inbox/${firstUserName}`);
                    }
                    unreadNotification.close();
                };

                unreadNotification.onclose = function () {
                    let now = Date.now();
                    chrome.storage.local.set({ lastNotification: now });
                    chrome.storage.local.set({ silenceUntil: now + 60000 });
                };
            }
        });
    } else {
        chrome.storage.local.get(['lastNotification'], function (result) {
            let lastNotification = result.lastNotification || 0;
            if (now - lastNotification > 60000) {
                new Notification('New Update on Fiverr!', {
                    body: `Check out this fiverr tab: ${tab.title || 'a tab'}`,
                    icon: 'https://cdn0.iconfinder.com/data/icons/socicons-2/512/Fiverr-512.png',
                    requireInteraction: true
                }).onclick = function () {
                    chrome.storage.local.set({ lastNotification: now }); // Update lastNotification
                    this.close(); // Close notification on click
                };
            }
        });
    }
}

// Track which tabs are currently playing audio
const audibleTabs = {};

// Listen for changes in any tab's audible state
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    // Check if the tab's audible state changed and if it's about fiverr
    if (changeInfo.audible !== undefined && tab.url.includes('fiverr')) {
        if (changeInfo.audible) {
            // If audio just started, show notification and store the tab ID
            if (!audibleTabs[tabId]) {
                showAudioNotification(tab);
                audibleTabs[tabId] = true;  // Mark the tab as audible
            }
        } else {
            // If audio stopped, remove the tab from audible list
            delete audibleTabs[tabId];
        }
    }
});

// Clear audible tab data when the tab is closed
chrome.tabs.onRemoved.addListener((tabId) => {
    delete audibleTabs[tabId];
});
