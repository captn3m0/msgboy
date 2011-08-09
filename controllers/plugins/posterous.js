// Hopefully this should be part of the regular Msgboy
if (typeof Msgboy === "undefined") {
    var Msgboy = {};
}

// Let's define the helper module.
if (typeof Msgboy.plugins === "undefined") {
    Msgboy.plugins = {};
}

Msgboy.plugins.posterous = function () {

    this.name = 'Posterous';
    this.hijacked = false;

    this.onSubscriptionPage = function () {
        return ($('meta[name=generator]').attr("content") === "Posterous" || window.location.host.match(/posterous.com$/));
    };

    this.hijack = function (follow, unfollow) {
        $('#posterous_required_header').hover(function (event) {
            if (!this.hijacked) {
                this.hijacked = true;
                $('#posterous_bar_subscribe').click(function () {
                    follow({
                        title: document.title,
                        url: window.location.href + "/rss.xml"
                    }, function () {
                        // done
                    });
                });
            }
        }, function () {});

        $('#posterous_bar').hover(function (event) {
            if (!this.hijacked) {
                this.hijacked = true;
                $('#posterous_bar_subscribe').click(function () {
                    follow({
                        title: document.title,
                        url: window.location.href + "/rss.xml"
                    }, function () {
                        // Done
                    });
                });
            }
        }, function () {});

        $("#subscribe_link").click(function () {
            follow({
                title: document.title,
                url: window.location.href + "/rss.xml"
            }, function () {
                // Done
            });
        });

        $("#psub_unsubscribed_link").click(function () {
            unfollow({
                title: document.title,
                url: window.location.href + "/rss.xml"
            }, function () {
                // Done
            });
        });

        $(".subscribe_ajax a.unsubscribed").click(function (event) {
            var parent = $($($($(event.target).parent()).parent()).parent().find(".profile_sub_site a")[0]);
            unfollow({
                title: $.trim(parent.html()),
                url: parent.attr("href") + "/rss.xml"
            }, function () {
                // Done
            });
        });
    };

    this.isUsing = function (callback) {
        var that = this;
        $.get("http://www.posterous.com/", function (data) {
            menu = $(data).find("#topnav");
            if (menu.length === 0) {
                callback(false);
            } else {
                callback(true);
            }
        });
    };

    this.listSubscriptions = function (callback) {
        this.listSubscriptionsPage(1, [], callback);
    };

    this.listSubscriptionsPage = function (page, subscriptions, callback) {
        var that = this;
        $.get("http://posterous.com/users/me/subscriptions?page=" + page, function (data) {
            content = $(data);
            links = content.find("#subscriptions td.image a");
            links.each(function (index, link) {
                subscriptions.push({
                    url: $(link).attr("href") + "/rss.xml",
                    title: $(link).attr("title")
                });
            });
            if (links.empty > 0) {
                listSubscriptionsPage(page + 1, subscriptions, callback);
            } else {
                callback(subscriptions);
            }
        });
    };
};

Plugins.register(new Msgboy.plugins.posterous());