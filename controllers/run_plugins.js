// Runs all the plugins
$.each(Plugins.all, function(index, plugin) {
    if(plugin.onSubscriptionPage()) { // Are we on the plugin's page?
        // Let's then hijack the "subscribe" button, if needed.
        plugin.hijack(function(feed, done) {
            // Follow:
            if(typeof(window.parent) == "undefined") {
                // We've been iframed! a bug in chrome prevents us from checking with Location TOFIX
                if(confirm("Do you want to follow '" + feed.title + "' with msgboy?")) {
                     chrome.extension.sendRequest({
                            subscribe: feed
                        }, function (response) {
                            done();
                        });
                } else {
                    done();
                }
            }
            else {
                // Now show a modal box, asking the user whether he wants to subscribe. If so, then, we're good.
                // If not, just move on.
                var box = new MsgboyModal(function () {
                    // Called when the box is closed.
                    done();
                });
                var content = $("<div>");
                var message = $("<p>", {
                    text: "Do you want to follow '" + feed.title + "'?"
                });
                message.appendTo(content);

                var yes = $("<input>", {
                    type: "button",
                    value: "Yes",
                    style:"float:right; margin:5px",
                    onclick: function() {
                        chrome.extension.sendRequest({
                            subscribe: feed
                        }, function (response) {
                            box.hide();
                            done();
                        });
                    }.bind(this)
                });
                yes.appendTo(content);

                var no = $("<input>", {
                    type: "button",
                    value: "No",
                    style:"float:right; margin:5px",
                    onclick: function() {
                        box.hide();
                        done();
                    }.bind(this)
                });
                no.appendTo(content);
                box.show(content);
                return false;
            }
        }, function(feed, done) {
            // Unfollow?
            // We should first check whether the user is subscribed, and if he is, then, ask whether he wants to unsubscribe from here as well.
            done();
        });
    }
});
