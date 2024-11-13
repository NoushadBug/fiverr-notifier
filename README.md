# Fiverr Notification Enhancer

A Chrome extension to enhance Fiverr notifications.

## Features

* Change the Fiverr icon and title when a notification is received
* Blink the favicon and title to grab your attention
* Play a notification sound (disabled by default)
* Show a desktop notification when a new message is received (disabled by default)

## Before Installing

Ensure that you allow the following site settings for Fiverr: sound, notifications, and pop-ups.

## Installation

1. Download the [latest release](https://github.com/noushadbhuiyan7/fiverr-notification-enhancer/releases/latest) of the extension
2. Go to `chrome://extensions/` in Google Chrome
3. Enable Developer mode
4. Click "Load unpacked"
5. Select the folder containing the extension

## How it works

1. The extension listens for changes in the audible state of the Fiverr tab. When audio is detected, it blinks the favicon and title of the tab with random unicodes and icons.
2. Also, If you have unread messages (it will look after the unread green dot near the inbox icon on the navbar), the favicon and title will continue to blink until you clear all the unread messages.

## How to stop the banner notification?

When you click on close, the banner notification will be in sleep for 1 minute, giving you a time to read all messages and clean all unread messages.

