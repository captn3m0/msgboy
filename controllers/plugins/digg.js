// Digg
Plugins.register(function () {

    this.name = 'Digg'; // Name for this plugin. The user will be asked which plugins he wants to use.

    this.onSubscriptionPage = function () {
        // This method returns true if the plugin needs to be applied on this page.
        return (window.location.host === "digg.com");
    };

    this.hijack = function (follow, unfollow) {
        // This methods hijacks the susbcription action on the specific website for this plugin.
        $(".btn-follow").live('click', function (event) {
            url = $(event.target).attr("href");
            login =  url.split("/")[1];
            action = url.split("/")[2];
            switch (action) {
            case "follow":
                follow({
                    url: "http://digg.com/" + login + ".rss",
                    title: login + " on Digg"
                }, function () {
                    // Done
                });
                break;
            case "unfollow":
                unfollow({
                    url: "http://digg.com/" + login + ".rss",
                    title: login + " on Digg"
                }, function () {
                    // Done
                });
                break;
            default:
            }
        });
    };

    this.listSubscriptions = function (callback) {
        callback([]); // We're not able to list all subscriptions
    };

    this.isUsing = function (callback) {
        var that = this;
        $.get("http://digg.com/", function (data) {
            if ($(data).find(".current-user").length === 0) {
                callback(false);
            }
            else {
                callback(true);
            }
        });
    };
});