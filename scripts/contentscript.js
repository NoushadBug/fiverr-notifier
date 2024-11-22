'use strict';

setInterval(function () {
    checkForNotification();
}, 5000);

var checkForNotification = function () {
    const blackFav = 'https://cdn0.iconfinder.com/data/icons/socicons-2/512/Fiverr-512.png';
    const oldFav = "https://www.fiverr.com/favicon.ico";
    const attentionTitles = ['⚡', '📬', '‼️', '🔔', '⭐', '*'];

    chrome.storage.local.get(['silenceUntil', 'lastNotification'], function (result) {
        let now = Date.now();
        let silenceUntil = result.silenceUntil || 0;
        let lastNotification = result.lastNotification || 0;
        let hasUnreadMessages = $(".unread-icon:not(.notifications-drawer-bell-unread)").length > 0;
        var unreadMessages = document.querySelectorAll('[id^="Realtime"] ul li .item-content-wrapper');

        // Only show notification if there are unread messages and it's been more than 1 minute since the last notification
        if (unreadMessages.length > 0 && (now - lastNotification > 60000)) {
            let bodyText;

            if (unreadMessages.length === 1) {
                let username = unreadMessages[0].querySelector('.username')?.textContent.trim() || 'Unknown';
                let messageText = unreadMessages[0].textContent.replace(unreadMessages[0].querySelector('.content-container')?.textContent || '', '').trim();
                bodyText = 'From: ' + username + '\n' + 'Message: ' + messageText;
            } else {
                let messageList = [];
                unreadMessages.forEach((message) => {
                    let username = message.querySelector('.username')?.textContent.trim() || 'Unknown';
                    messageList.push(`from - ${username}`);
                });
                bodyText = messageList.join('\n');
            }

            let firstUserName = unreadMessages[0].querySelector('.username')?.textContent.replace('@', '').trim();

            chrome.runtime.sendMessage({
                action: 'createUnreadNotification',
                data: {
                    unreadMessages: unreadMessages.length,
                    bodyText: bodyText,
                    firstUserName: firstUserName
                }
            });
        }


        // Only proceed if there are unread messages and notifications are not silenced
        if (hasUnreadMessages && now > silenceUntil) {
            // Start blinking the favicon and title
            let blinkInterval = setInterval(() => {
                // Toggle favicon
                $("link[rel*='icon']").attr("href", function (_, href) {
                    return href === blackFav ? oldFav : blackFav;
                });

                // Randomly select a title from the list for each blink
                document.title = attentionTitles[Math.floor(Math.random() * attentionTitles.length)];

                // Stop blinking if no unread notifications remain
                if ($(".unread-icon:not(.notifications-drawer-bell-unread)").length === 0) {
                    clearInterval(blinkInterval);
                    $("link[rel*='icon']").attr("href", oldFav); // Reset favicon
                    document.title = 'Seller Dashboard'; // Reset title
                }
            }, 500);

            // Play notification sound
            // var audio = new Audio('https://codeskulptor-demos.commondatastorage.googleapis.com/descent/gotitem.mp3');
            // audio.play();

            // Show desktop notification if at least 1 minute has passed since the last notification
            if (now - lastNotification > 60000) {
                chrome.runtime.sendMessage({
                    action: 'createClearAllUnreadNotification',
                    data: {
                        title: 'Fiverr Notifier :: Clear all unread messages',
                        body: 'Clear all unread messages on Fiverr, click to pause notifications for 1 minute'
                    }
                });

                // Update last notification time in Chrome storage
                chrome.storage.local.set({ lastNotification: now });
            }
        }
    });
};

// Function to interact with the DOM
function interactWithMessagesWrapper() {
    try {
        // Select the button elements
        const buttons = document.querySelectorAll('.messages-wrapper button');

        if (buttons.length > 1) {
            const button = buttons[1];

            // Scroll the button into view
            button.scrollIntoView({ behavior: 'smooth', block: 'center' });

            // Simulate mouse hover using mouse events
            const mouseEnterEvent = new MouseEvent('mouseenter', {
                bubbles: true,
                cancelable: true,
                view: window
            });

            const mouseOverEvent = new MouseEvent('mouseover', {
                bubbles: true,
                cancelable: true,
                view: window
            });

            // Dispatch the hover events
            button.dispatchEvent(mouseEnterEvent);
            button.dispatchEvent(mouseOverEvent);

            // Click the button
            button.click();

            console.log('Simulated mouse hover over the button');
        } else {
            console.warn("Button not found or less than 2 buttons exist in '.messages-wrapper'.");
        }

        // Use setInterval to check for the .toggle-read elements periodically
        const checkToggleRead = setInterval(() => {
            const toggleReadElements = document.querySelectorAll('.toggle-read[content="Mark as Read"]');
            if (toggleReadElements.length > 0) {
                // Once .toggle-read elements are found, click them
                toggleReadElements.forEach((element) => {
                    element.click();
                });

                console.log('Clicked all Mark as Read elements.');

                // Stop the interval once the elements are clicked
                clearInterval(checkToggleRead);
            } else {
                console.log('Waiting for .toggle-read elements...');
            }
        }, 500); // Check every 500ms

        // Click the second button in the '.messages-wrapper' container again
        if (buttons.length > 1) {
            buttons[1].scrollIntoView({ behavior: 'smooth', block: 'center' });

            // Simulate mouse movement to the button
            const buttonRect = buttons[1].getBoundingClientRect();
            const mouseMoveEvent = new MouseEvent('mousemove', {
                bubbles: true,
                cancelable: true,
                clientX: buttonRect.left + buttonRect.width / 2,
                clientY: buttonRect.top + buttonRect.height / 2,
            });
            document.dispatchEvent(mouseMoveEvent);

            // Click the button
            buttons[1].click();
        } else {
            console.warn("Button not found or less than 2 buttons exist in '.messages-wrapper'.");
        }
    } catch (error) {
        console.error("An error occurred while interacting with the messages wrapper:", error);
    }
}




// Listen for messages from background.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'interactWithMessagesWrapper') {
        interactWithMessagesWrapper();
        sendResponse({ status: 'success' });
    }
    if (message.action === 'callCheckForNotification') {
        // Call your function here
        checkForNotification();
        sendResponse({ status: 'success' });
    }
});