// Google Reader
// Hopefully this should be part of the regular Msgboy
if (typeof Msgboy === "undefined") {
    var Msgboy = {};
}

// Let's define the helper module.
if (typeof Msgboy.plugins === "undefined") {
    Msgboy.plugins = {};
}

Msgboy.plugins.google_reader = function () {

    this.name = 'Google Reader'; // Name for this plugin. The user will be asked which plugins he wants to use.

    this.onSubscriptionPage = function () {
        // This method returns true if the plugin needs to be applied on this page.
        return (window.location.host === "www.google.com" && window.location.pathname === '/reader/view/');
    };

    this.hijack = function (follow, unfollow) {
        // This methods hijacks the susbcription action on the specific website for this plugin.
        var submitted = function () {
            follow({
                url: $("#quickadd").val(),
                title: $("#quickadd").val()
            }, function () {
                // Done
            });
        };
        $("#quick-add-form .goog-button-body").click(submitted);
        $("#quick-add-form").submit(submitted);
    };

    this.listSubscriptions = function (callback, done) {
        links = [];
        request = new XMLHttpRequest();
        $.get("http://www.google.com/reader/subscriptions/export", function (data) {
            var subscriptions = [];
            urls = $(data).find("outline").each(function () {
                subscriptions.push({
                    url:  $(this).attr("xmlUrl"),
                    title: $(this).attr("title")
                });
            });
            callback(subscriptions);
            done(subscriptions.length);
        });
    };

    this.isUsing = function (callback) {
        var that = this;
        $.get("http://www.google.com/reader/view/", function (data) {
            if ($(data).find(".loginBox").length === 0) {
                callback(true);
            }
            else {
                callback(false);
            }
        });
    };
};

Plugins.register(new Msgboy.plugins.google_reader());
