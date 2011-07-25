$(document).bind('subscribe', function(element, object) {
    Msgboy.log("Request : subscribe " + object.request.params.url);
    Msgboy.subscribe(object.request.params, function(result) {
        object.sendResponse({
            value: result
        });
    });
});

$(document).bind('unsubscribe', function(element, object) {
    Msgboy.log("Request : unsubscribe " + object.request.params);
    Msgboy.unsubscribe(object.request.params, function(result) {
        object.sendResponse({
            value: result
        });
    });
});

$(document).bind('notify', function(element, object) {
    Msgboy.log("Request : notify", object.request.params);
    Msgboy.notify(object.request.params);
    object.sendResponse({
        value: true
    });
});

$(document).bind('notification_ready', function(element, object) {
    Msgboy.log("Request : notification_ready", {});
    Msgboy.currentNotification.ready = true;
    // We should then start sending all notifications.
    while(Msgboy.messageStack.length > 0) {
        chrome.extension.sendRequest({
            signature: "notify",
            params: Msgboy.messageStack.pop()
        }, function (response) {
            // Let's notify the people who may care about this, includingthe notification popup, hopefully :)
        });
    }
    object.sendResponse({
        value: true
    });
});

$(document).bind('tab', function(element, object) {
    Msgboy.log("Request : tab " + object.request.params.url)
    var active_window = null
    chrome.windows.getAll({}, function(windows) {
        windows = _.select(windows, function(win) {
            return win.type == "normal" && win.focused
        }, this);
        // If no window is focused and "normal"
        if(windows.length == 0) {
            window.open(object.request.params.url); // Can't use Chrome's API as it's buggy :(
        }
        else {
            // Just open an extra tab.
            options = object.request.params
            options.windowId = windows[0].id
            chrome.tabs.create(options, function() {
                object.sendResponse({
                    value: true
                });
            });
        }
    });
});

$(document).bind('close', function(element, object) {
    Msgboy.log("Request : close ");
    Msgboy.currentNotification = null;
    object.sendResponse({
        value: true
    });
});
