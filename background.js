var blackIcon = 'https://cdn0.iconfinder.com/data/icons/socicons-2/512/Fiverr-512.png';

function createNotification({ title, message, onclick, onclose }) {
    chrome.notifications.create({
        type: 'basic',
        iconUrl: 'https://cdn0.iconfinder.com/data/icons/socicons-2/512/Fiverr-512.png',
        title: `Fiverr Notifier :: ${title}`,
        message,
        requireInteraction: true,
    }, (notificationId) => {
        // Ensure the onclick listener is attached only once
        if (onclick) {
            chrome.notifications.onClicked.addListener(function onClickListener(id) {
                if (id === notificationId) {
                    onclick();
                }
            });
        }

        // Ensure the onclose listener is attached only once
        if (onclose) {
            chrome.notifications.onClosed.addListener(function onCloseListener(id) {
                if (id === notificationId) {
                    onclose();
                }
            });
        }
    });
}
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'createUnreadNotification') {
        const { unreadMessages, bodyText, firstUserName } = message.data;

        // Create the notification
        chrome.notifications.create({
            type: 'basic',
            iconUrl: blackIcon,
            title: `Fiverr Notifier :: ${unreadMessages} new unread messages`,
            message: `𝗖𝗹𝗶𝗰𝗸 𝘁𝗼 𝗼𝗽𝗲𝗻 »\n` + bodyText,
            requireInteraction: true
        }, (notificationId) => {

            // Handle the click event
            chrome.notifications.onClicked.addListener(function onClickListener(id) {
                let now = Date.now();
                // chrome.storage.local.set({ lastNotification: now });
                // chrome.storage.local.set({ silenceUntil: now + 60000 });
                if (firstUserName) {
                    chrome.tabs.query({}, function(tabs) {
                        let existingTab = tabs.find(tab => tab.url === `https://www.fiverr.com/inbox/${firstUserName}`);
                        if (existingTab) {
                            chrome.tabs.update(existingTab.id, { active: true, url: existingTab.url });
                        } else {
                            chrome.tabs.create({ url: `https://www.fiverr.com/inbox/${firstUserName}` });
                        }
                    });
                }
                chrome.notifications.clear(notificationId);
            });

            // Handle the close event
            chrome.notifications.onClosed.addListener(function onCloseListener(id) {
                let now = Date.now();
                chrome.storage.local.set({ lastNotification: now });
                chrome.storage.local.set({ silenceUntil: now + 60000 });
            });
        });
    }
    if (message.action === 'createClearAllUnreadNotification') {
        const { title, body } = message.data;

        // Create the "clear all unread messages" notification
        chrome.notifications.create({
            type: 'basic',
            iconUrl: blackIcon,
            title: title,
            message: body,
            requireInteraction: true // Keeps the notification visible until user action
        }, (notificationId) => {

            // Handle the click or close event
            chrome.notifications.onClicked.addListener(function onClickListener(id) {
                if (id === notificationId) {
                    let now = Date.now();
                    chrome.storage.local.set({ silenceUntil: now + 60000, lastNotification: now });
                    chrome.notifications.clear(notificationId); // Close the notification
                }
            });

            chrome.notifications.onClosed.addListener(function onCloseListener(id) {
                if (id === notificationId) {
                    let now = Date.now();
                    chrome.storage.local.set({ silenceUntil: now + 60000, lastNotification: now });
                }
            });
        });
    }
});


// Function to show a notification when audio is detected
function showAudioNotification(tab) {
    console.log("No unread messages");

    chrome.storage.local.get(['lastNotification'], function (result) {
        let now = Date.now();
        let lastNotification = result.lastNotification || 0;

        // Check if enough time has passed to show a new notification
        if ((now - lastNotification > 60000) || lastNotification == 0) {
            chrome.notifications.create({
                type: 'basic',
                iconUrl: 'https://cdn0.iconfinder.com/data/icons/socicons-2/512/Fiverr-512.png',
                title: 'Fiverr Notifier :: an update arrived',
                message: `Check this tab: ${tab.title || 'a Fiverr tab'}`,
                requireInteraction: true
            }, (notificationId) => {
                // Listen for notification close event
                chrome.notifications.onClosed.addListener((id, byUser) => {
                    // Update last notification time in storage
                    chrome.storage.local.set({ lastNotification: Date.now() });
                });
            });
        }
    });
}

// Track which tabs are currently playing audio
const audibleTabs = {};

// Function to check and notify for tabs with audio
function checkAudibleTabs() {
    chrome.tabs.query({ audible: true }, (tabs) => {
        tabs.forEach((tab) => {
            if (!audibleTabs[tab.id] && tab.url.includes('fiverr.com')) {
                // Mark the tab as audible
                audibleTabs[tab.id] = true;
                showAudioNotification(tab);
            }
        });

        // Identify and remove tabs that have stopped playing audio
        for (let tabId in audibleTabs) {
            if (!tabs.some((tab) => tab.id == tabId)) {
                delete audibleTabs[tabId]; // Remove the tab from the audible list
            }
        }
    });
}

// Run the audio check every 100ms
setInterval(checkAudibleTabs, 100);
