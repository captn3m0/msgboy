// Typepad
// Hopefully this should be part of the regular Msgboy
if (typeof Msgboy === "undefined") {
    var Msgboy = {};
}

// Let's define the helper module.
if (typeof Msgboy.plugins === "undefined") {
    Msgboy.plugins = {};
}

Msgboy.plugins.quora_people = function () {

    this.name = 'Quora People';

    this.onSubscriptionPage = function () {
        return (window.location.host === "www.quora.com");
    };

    this.hijack = function (follow, unfollow) {
        $(".follow_button").not(".unfollow_button").not(".topic_follow").click(function (event) {
            if ($.trim($(event.target).html()) !== "Follow Question") {
                // This is must a button on a user's page. Which we want to follow
                follow({
                    title: document.title,
                    url: window.location.href + "/rss"
                });
            }
        });
    };

    this.listSubscriptions = function (callback) {
        callback([]); // We're not able to list all subscriptions
    };

    this.isUsing = function (callback) {
        var that = this;
        req = $.get("http://www.quora.com/inbox", function (data) {
            menu = $(data).find(".signup");
            if (menu.length === 0) {
                callback(true);
            }
            else {
                callback(false);
            }
        });
    };
};

Plugins.register(new Msgboy.plugins.quora_people());