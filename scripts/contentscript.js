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
                        body: 'Clear all unread messages on Fiverr, click to pause notifications for 1 minute',
                        icon: blackFav
                    }
                });

                // Update last notification time in Chrome storage
                chrome.storage.local.set({ lastNotification: now });
            }
        }
    });
};
