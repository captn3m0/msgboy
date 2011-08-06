if(typeof Msgboy == "undefined") {
    var Msgboy = {};
}

// Extending Msgboy with the Backbone events
_.extend(Msgboy, Backbone.Events);

// Attributes
Msgboy.logEnabled = false;
Msgboy.autoReconnect = true;
Msgboy.currentNotification = null;
Msgboy.messageStack = [];
Msgboy.connectionTimeout = null;
Msgboy.reconnectDelay = 1;
Msgboy.connection = null;
Msgboy.infos = {};
Msgboy.inbox = null;
Msgboy.reconnectionTimeout = null;

// Logs messages to the console
Msgboy.log = function(msg) {
    if (Msgboy.logEnabled) {
        console.log("Msgboy : " + msg);
    }
};

// Returns the environment in which this msgboy is running
Msgboy.environment = function() {
    if(chrome.i18n.getMessage("@@extension_id") == "ligglcbjgpiljeoenbhnnfdipkealakb") {
        return "production";
    }
    else {
        return "development";
    }
};

// Runs the msgboy (when the document was loaded and when we were able to extract the msgboy's information)
Msgboy.run =  function() {
    $(document).ready(function () {
        chrome.management.get(chrome.i18n.getMessage("@@extension_id"), function (extension_infos) {
            Msgboy.infos = extension_infos;
            Msgboy.trigger("loaded");
        });
    });
};

// Handles XMPP Connections
Msgboy.on_connect = function(status) {
    var msg = '';
    if (status == Strophe.Status.CONNECTING) {
        msg = 'Msgboy is connecting.';
    } else if (status == Strophe.Status.CONNFAIL) {
        msg = 'Msgboy failed to connect.';
        Msgboy.reconnectDelay += 1;
        if (Msgboy.autoReconnect) Msgboy.auto_reconnect();
    } else if (status == Strophe.Status.AUTHFAIL) {
        msg = 'Msgboy couldn\'t authenticate. Please check your credentials';
        Msgboy.autoReconnect = false; // We need to open the settings tab
        chrome.tabs.create({
            url: chrome.extension.getURL('/views/html/options.html'),
            selected: true
        });
    } else if (status == Strophe.Status.DISCONNECTING) {
        msg = 'Msgboy is disconnecting.'; // We may want to time this out.
    } else if (status == Strophe.Status.DISCONNECTED) {
        if (Msgboy.autoReconnect) Msgboy.auto_reconnect();
        msg = 'Msgboy is disconnected. Reconnect in ' + Msgboy.helper.maths.number.fibonacci(Msgboy.reconnectDelay) + ' seconds.';
    } else if (status == Strophe.Status.CONNECTED) {
        Msgboy.autoReconnect = true; // Set autoReconnect to true only when we've been connected :)
        msg = 'Msgboy is connected.';
        Msgboy.connection.caps.sendPresenceWithCaps(); // Send presence! 
        // Makes sure there is no missing subscription.
        Msgboy.resume_subscriptions();
    }
    Msgboy.log(msg);
};

// Reconnects the Msgboy
Msgboy.auto_reconnect = function() {
    Msgboy.reconnectDelay += 1;
    if(!Msgboy.reconnectionTimeout) {
        Msgboy.reconnectionTimeout = setTimeout(function () {
            Msgboy.reconnectionTimeout = null;
            Msgboy.connect();
        }, Msgboy.helper.maths.number.fibonacci(Msgboy.reconnectDelay) * 1000);
    }
    else {
        // We already have a reconnection Timeout waiting to be fired.
    }
};

// Connects the XMPP Client
// It also includes a timeout that tries to reconnect when we could not connect in less than 1 minute.
Msgboy.connect = function() {
    var password = Msgboy.inbox.attributes.password;
    var jid = Msgboy.inbox.attributes.jid + "@msgboy.com/" + Msgboy.infos.version;
    Msgboy.connection.connect(jid, password, this.on_connect);
};

// Uploads the content of the database. this will be used for analysis of the dataset o determine a better algorithm.
// It is perfectly anonymous and currentl not used.
Msgboy.upload_data = function() {
    var archive = new Archive();
    archive.all({
        created_at: [new Date().getTime(), 0]
    }, function () {
        $("#log").text(JSON.stringify(archive.toJSON()));
        Msgboy.helper.uploader.upload(Msgboy.inbox.attributes.jid, archive.toJSON());
    });
};

// Shows a popup notification
Msgboy.notify = function(message) {
    // Open a notification window if needed!
    if (!Msgboy.currentNotification) {
        url = chrome.extension.getURL('/views/html/notification.html');
        Msgboy.currentNotification = window.webkitNotifications.createHTMLNotification(url);
        Msgboy.currentNotification.onclose = function () {
            Msgboy.currentNotification = null;
        };
        Msgboy.currentNotification.ready = false;
        Msgboy.currentNotification.show();
        Msgboy.messageStack.push(message);
    }
    else {
        chrome.extension.sendRequest({
            signature: "notify",
            params: message
        }, function (response) {
            // Nothing to do.
        });
    }
    return Msgboy.currentNotification;
};

// Subscribes to a feed.
Msgboy.subscribe = function(url, callback) {
    // First, let's check if we have a subscription for this.
    var subscription = new Subscription({id: url});
    subscription.fetch_or_create(function() {
        // Looks like there is a subscription.
        if(subscription.needs_refresh() && subscription.attributes.state == "unsubscribed") {
            subscription.set_state("subscribing");
            subscription.bind("subscribing", function() {
                Msgboy.log("subscribing to " + url);
                Msgboy.connection.superfeedr.subscribe(url, function (result, feed) {
                    Msgboy.log("subscribed to " + url);
                    subscription.set_state("subscribed");
                });
            });
            subscription.bind("subscribed", function() {
                callback(true);
            });
        }
        else {
            Msgboy.log("Nothing to do for " + url + " (" + subscription.attributes.state + ")");
            callback(false);
        }
    });
};

// Unsubscribes from a feed.
Msgboy.unsubscribe = function(url, callback) {
    var subscription = new Subscription({id: url});
    subscription.fetch_or_create(function() {
        subscription.set_state("unsubscribing");
        subscription.bind("unsubscribing", function() {
            Msgboy.log("unsubscribing from " + url);
            Msgboy.connection.superfeedr.unsubscribe(url, function (result) {
                Msgboy.log("Request : unsubscribed " + url);
                subscription.set_state("unsubscribed");
            });
        });
        subscription.bind("unsubscribed", function() {
            callback(true);
        });
    });
};

// Makes sure there is no 'pending' susbcriptions.
Msgboy.resume_subscriptions = function() {
    var subscriptions  = new Subscriptions();
    subscriptions.bind("add", function(subs) {
        Msgboy.log("subscribing to " + subs.id);
        Msgboy.connection.superfeedr.subscribe(subs.id, function (result, feed) {
            Msgboy.log("subscribed to " + subs.id);
            subs.set_state("subscribed");
        });
    });
    subscriptions.pending();
    setTimeout(function() {
        Msgboy.resume_subscriptions(); // Let's retry in 10 minutes.
    }, 1000 * 60 * 10); 
};
