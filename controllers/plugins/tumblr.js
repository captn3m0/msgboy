// Tumblr
// Hopefully this should be part of the regular Msgboy
if (typeof Msgboy === "undefined") {
    var Msgboy = {};
}

// Let's define the helper module.
if (typeof Msgboy.plugins === "undefined") {
    Msgboy.plugins = {};
}

Msgboy.plugins.tumblr = function () {

    this.name = 'Tumblr'; // Name for this plugin. The user will be asked which plugins he wants to use.
    this.onSubscriptionPage = function () {
        return (window.location.host === "www.tumblr.com" && window.location.pathname === '/dashboard/iframe');
    };

    this.hijack = function (follow, unfollow) {
        $('form[action|="/follow"]').submit(function (event) {
            follow({
                title: $('form[action|="/follow"] input[name="id"]').val() + " on Tumblr",
                url: "http://" + $('form[action|="/follow"] input[name="id"]').val() + ".tumblr.com/rss"
            }, function () {
                // Done
            });
        });
    };


    this.listSubscriptions = function (callback, done) {
        this.listSubscriptionsPage(1, [], callback, done);
    };

    this.listSubscriptionsPage = function (page, subscriptions, callback, done) {
        $.get("http://www.tumblr.com/following/page/" + page, function (data) {
            content = $(data);
            links = content.find(".follower .name a");
            links.each(function (index, link) {
                subscriptions.push({
                    url: $(link).attr("href") + "rss",
                    title: $(link).html() + " on Tumblr"
                });
            });
            if (links.length > 0) {
                this.listSubscriptionsPage(page + 1, subscriptions, callback, done);
            } else {
                callback(subscriptions);
                done(subscriptions.length)
            }
        }.bind(this));
    };
};

Plugins.register(new Msgboy.plugins.tumblr());