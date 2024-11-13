'use strict';

setInterval(function () {
    checkForNotification();
}, 5000);

var checkForNotification = function () {
    const blackFav = 'https://cdn0.iconfinder.com/data/icons/socicons-2/512/Fiverr-512.png';
    const oldFav = "https://www.fiverr.com/favicon.ico";
    const attentionTitles = ['⚡', '📬', '‼️', '🔔', '⭐', '*'];
    let hasUnreadMessages = $(".unread-icon:not(.notifications-drawer-bell-unread)").length > 0;

    var unreadMessages = document.querySelectorAll('[id^="Realtime"] ul');
    if (unreadMessages.length > 0) {
        new Notification('New Fiverr Inbox Message', {
            body: 'You have ' + unreadMessages.length + ' unread messages',
            icon: 'https://cdn0.iconfinder.com/data/icons/socicons-2/512/Fiverr-512.png'
        })
    }

    chrome.storage.local.get(['silenceUntil', 'lastNotification'], function (result) {
        let now = Date.now();
        let silenceUntil = result.silenceUntil || 0;
        let lastNotification = result.lastNotification || 0;

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
                let notification = new Notification('New Fiverr Inbox Message', {
                    body: 'Click to pause notifications for 1 minute.',
                    icon: blackFav,
                    requireInteraction: true // Keeps the notification visible until user action
                });

                // Handle click to silence notifications for 1 minute
                notification.onclick = function () {
                    chrome.storage.local.set({ silenceUntil: now + 60000 }); // Silence for 1 minute
                    notification.close(); // Close notification on click
                };

                // Update last notification time in Chrome storage
                chrome.storage.local.set({ lastNotification: now });
            }
        }
    });
};
