// Typepad
// Hopefully this should be part of the regular Msgboy
if (typeof Msgboy === "undefined") {
    var Msgboy = {};
}

// Let's define the helper module.
if (typeof Msgboy.plugins === "undefined") {
    Msgboy.plugins = {};
}

Msgboy.plugins.typepad = function () {

    this.name = 'Typepad'; // Name for this plugin. The user will be asked which plugins he wants to use.

    this.onSubscriptionPage = function () {
        return (window.location.host === "www.typepad.com" && window.location.pathname === '/services/toolbar');
    };

    this.hijack = function (follow, unfollow) {
        $("#follow-display").click(function () {
            follow({
                title: $.trim($($("#unfollow-display a")[0]).html()) + " on Typepad",
                href : $($("#unfollow-display a")[0]).attr("href") + "/activity/atom.xml"
            }, function () {
                // Done
            });
            return false;
        });
    };

    this.listSubscriptions = function (callback, done) {
        callback([]); // We're not able to list all subscriptions
        done(0);
    };

    this.isUsing = function (callback) {
        var that = this;
        $.get("http://www.typepad.com/dashboard", function (data) {
            menu = $(data).find(".logged-in-msg");
            if (menu.length === 0) {
                callback(false);
            }
            else {
                callback(true);
            }
        });
    };
};

Plugins.register(new Msgboy.plugins.typepad());