// This is the plugin for status.net.
// Hopefully this should be part of the regular Msgboy
if (typeof Msgboy === "undefined") {
    var Msgboy = {};
}

// Let's define the helper module.
if (typeof Msgboy.plugins === "undefined") {
    Msgboy.plugins = {};
}

Msgboy.plugins.statusnet = function () {

    this.name = 'Status.net'; // Name for this plugin. The user will be asked which plugins he wants to use.

    this.onSubscriptionPage = function () {
        // This method needs to returns true if the plugin needs to be applied on this page.
        return (window.location.host.match(/status\.net/));
    };

    this.listSubscriptions = function (callback, done) {
        callback([]); // We're not able to list all subscriptions
        done(0);
    };

    this.hijack = function (follow, unfollow) {
        // This method will add a callback that hijack a website subscription (or follow, or equivalent) so that msgboy also mirrors this subscription.
        $('#form_ostatus_connect').live("submit", function () {
            user = $($(this).find("#nickname")[0]).attr("value");
            url = "http://" + parseUri(window.location).host + "/api/statuses/user_timeline/1.atom";
            follow({
                title:  user + " on Status.net",
                url: url
            }, function () {
                // Done
            });
        });
    };
};

Plugins.register(new Msgboy.plugins.statusnet());