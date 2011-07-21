var Msgboy = new function () {
    this.logEnabled = false,
    this.autoReconnect = true,
    this.currentNotification = null,
    this.connectionTimeout = null,
    this.reconnectDelay = 0,
    
    // Logs messages to the console
    this.log = function(msg) {
        if (this.logEnabled) {
            console.log("Msgboy : " + msg);
        }
    },

    // Handles XMPP Connections
    this.onConnect = function(status) {
        if (status == Strophe.Status.CONNECTING) {
            msg = 'Msgboy is connecting.';
        } else if (status == Strophe.Status.CONNFAIL) {
            msg = 'Msgboy failed to connect.';
            setTimeout(function () {
                if (Msgboy.autoReconnect) {
                    Msgboy.reconnectDelay += 1;
                    Msgboy.connect();
                }
            }, fibonacci(Msgboy.reconnectDelay) * 1000);
            if (Msgboy.connectionTimeout) clearTimeout(Msgboy.connectionTimeout);
        } else if (status == Strophe.Status.AUTHFAIL) {
            msg = 'Msgboy couldn\'t authenticate. Please check your credentials';
            Msgboy.autoReconnect = false // We need to open the settings tab
            chrome.tabs.create({
                url: chrome.extension.getURL('/views/html/options.html'),
                selected: true
            });
            if (Msgboy.connectionTimeout) clearTimeout(Msgboy.connectionTimeout);
        } else if (status == Strophe.Status.DISCONNECTING) {
            msg = 'Msgboy is disconnecting.'; // We may want to time this out.
        } else if (status == Strophe.Status.DISCONNECTED) {
            msg = 'Msgboy is disconnected. ';
            setTimeout(function () {
                if (Msgboy.autoReconnect) {
                    Msgboy.reconnectDelay += 1;
                    Msgboy.connect();
                }
            }, fibonacci(Msgboy.reconnectDelay) * 1000);
            if (Msgboy.connectionTimeout) clearTimeout(Msgboy.connectionTimeout);
        } else if (status == Strophe.Status.CONNECTED) {
            Msgboy.reconnectDelay = 0
            Msgboy.autoReconnect = true; // Set autoReconnect to true only when we've been connected :)
            msg = 'Msgboy is connected.';
            connection.caps.sendPresenceWithCaps(); // Send presence! 
            if (Msgboy.connectionTimeout) clearTimeout(Msgboy.connectionTimeout);
            // Makes sure there is no missing subscription.
            Msgboy.resume_subscriptions();
        }
        Msgboy.log(msg);
    },
    
    // Connects the XMPP Client
    // It also includes a timeout that tries to reconnect when we could not connect in less than 1 minute.
    this.connect = function() {
        Msgboy.connectionTimeout = setTimeout(function () {
            // We add a 60 secinds reconnect when trying to connect.
            // If connection failed. We just try again.
            Msgboy.connect();
        }, 60 * 1000)
        var password = inbox.attributes.password;
        var jid = inbox.attributes.jid + "@msgboy.com/extension";

        connection.connect(jid, password, this.onConnect);
    },

    // Uploads the content of the database. this will be used for analysis of the dataset o determine a better algorithm.
    this.uploadData = function() {
        var archive = new Archive();
        archive.all({
            created_at: [new Date().getTime(), 0]
        }, function () {
            $("#log").text(JSON.stringify(archive.toJSON()));
            MsgboyHelper.uploader.upload(inbox.attributes.jid, archive.toJSON());
        });
    },

    // Shows a popup notification
    this.notify = function(id) {
        // Open a notification window if needed!
        if (!Msgboy.currentNotification) {
            url = chrome.extension.getURL('/views/html/notification.html');
            webkitNotification = window.webkitNotifications.createHTMLNotification(url);
            webkitNotification.onclose = function () {
                Msgboy.currentNotification = null;
            };
            webkitNotification.show();
            Msgboy.currentNotification = webkitNotification;
        }
        chrome.extension.sendRequest({
            signature: "notify",
            params: {
                "message": id
            }
        }, function (response) {
            // Let's notify the people who may care about this, includingthe notification popup, hopefully :)
        });
        return Msgboy.currentNotification;
    },

    // Subscribes to a feed.
    this.subscribe = function(subs, callback) {
        // First, let's check if we have a subscription for this.
        var subscription = new Subscription({url: subs.url});
        subscription.fetch_or_create(function() {
            // Looks like there is a subscription.
            if(subscription.needs_refresh()) {
                subscription.set_state("subscribing", function() {
                    Msgboy.log("subscribing to " + subs.url);
                    connection.superfeedr.subscribe(subs.url, function (result, feed) {
                        Msgboy.log("subscribed to " + subs.url);
                        subscription.set_state("subscribed", function() {
                            callback(true);
                        });
                    });
                });
            }
            else {
                Msgboy.log("Nothing to do for " + JSON.stringify(subscription.attributes))
                callback(false);
            }
        });
    },
    
    // Unsubscribes from a feed.
    this.unsubscribe = function(url, callback) {
        var subscription = new Subscription({url: url});
        subscription.fetch_or_create(function() {
            subscription.set_state("unsubscribing", function() {
                connection.superfeedr.unsubscribe(url, function (result) {
                    subscription.set_state("unsubscribed");
                    Msgboy.log("Request : unsubscribed " + object.request.params);
                    callback(true);
                });
            });
        });
    },
    
    // Makes sure there is no 'pending' susbcriptions.
    this.resume_subscriptions = function() {
        var pending  = new Subscriptions();
        pending.fetch({
            conditions: {state: "subscribing"},
            success: function() {
                if(pending.length > 0) {
                    _.each(pending.models, function(subs) {
                        Msgboy.subscribe({url: subs.attributes.url}, function() {
                            // Not much.
                        });
                    });
                    setTimeout(function() {
                        Msgboy.resume_subscriptions(); // Let's retry in 10 minutes.
                    }, 1000 * 60 * 10); 
                }
                else {
                    // All cool.
                }
            }, 
            error: function() {
                setTimeout(function() {
                    Msgboy.resume_subscriptions(); // Let's retry in 10 minutes.
                }, 1000 * 60 * 10); 
            }
        });
    }
}
