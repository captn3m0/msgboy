// Runs all the plugins
if(typeof($) !== "undefined") {
    $.each(Plugins.all, function (index, plugin) {
        if (plugin.onSubscriptionPage()) { // Are we on the plugin's page?
            // Let's then hijack the "subscribe" button, if needed.
            plugin.hijack(function (feed, done) {
                // Follow:
                chrome.extension.sendRequest({
                    signature: "subscribe",
                    params: feed
                }, function (response) {
                    done();
                });
            }, function (feed, done) {
                // Unfollow?
                // We should first check whether the user is subscribed, and if he is, then, ask whether he wants to unsubscribe from here as well.
                done();
            });
        }
    });
}
