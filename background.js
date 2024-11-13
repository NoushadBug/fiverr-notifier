// Function to show a notification when audio is detected
function showAudioNotification(tab) {
    chrome.notifications.create({
        type: 'basic',
        iconUrl: 'https://cdn0.iconfinder.com/data/icons/socicons-2/512/Fiverr-512.png',
        title: 'New Update on Fiverr!',
        message: `Check out this fiverr tab: ${tab.title || 'a tab'}`,
        priority: 1
    });
}

// Track which tabs are currently playing audio
const audibleTabs = {};

// Listen for changes in any tab's audible state
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    // Check if the tab's audible state changed
    if (changeInfo.audible !== undefined) {
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
