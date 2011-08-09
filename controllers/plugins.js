var Plugins = {
    all: [],

    register: function (plugin) {
        this.all.push(plugin);
    },
    import_subscriptions: function (callback) {
        _.each(Plugins.all, function (plugin) {
            plugin.isUsing(function (using) {
                if (using) {
                    plugin.listSubscriptions(function (subscriptions) {
                        _.each(subscriptions, function (subscription) {
                            callback({
                                url: subscription.url,
                                title: subscription.title
                            });
                        });
                    });
                }
            });
        });
    }
};

// This is the skeleton for the Plugins
var Plugin = function () {
    this.name = ''; // Name for this plugin. The user will be asked which plugins he wants to use.
    this.onSubscriptionPage = function () {
        // This method needs to returns true if the plugin needs to be applied on this page.
    };

    this.listSubscriptions = function (callback) {
        // This methods will callback with all the subscriptions in this service. It can call the callback several times with more feeds.
        // Feeds have the following form {url: _, title: _}.
        callback([]);
    };

    this.hijack = function (follow, unfollow) {
        // This method will add a callback that hijack a website subscription (or follow, or equivalent) so that msgboy also mirrors this subscription.
        // So actually, we should ask the user if it's fine to subscribe to the feed, and if so, well, that's good, then we will subscribe.
    };

    this.isUsing = function (callback) {
        // This method calls back with true if the user is a logged-in user of the service for this plugin. It callsback with false otherwise.
        // callback(true)
    };

    this.subscribeInBackground = function (callback) {
        // The callback needs to be called with a feed object {url: _, title: _}
        // this function is called from the background and used to define a "chrome-wide" callback. It should probably not be used by any plugin specific to a 3rd pary site, but for plugins like History and/or Bookmarks
    };
};
