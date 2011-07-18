// Blogger
Plugins.register(new function () {

    this.name = 'Blogger', // Name for this plugin. The user will be asked which plugins he wants to use.
    this.onSubscriptionPage = function () {
        return (window.location.host == "www.blogger.com" && window.location.pathname == '/navbar.g')
    },

    this.hijack = function (follow, unfollow) {
        $('a#b-follow-this').click(function (event) {
            follow({
                title: "",
                url: $("#searchthis").attr("action").replace("search", "feeds/posts/default")
            }, function () {
                // Done
            });
        });
    }

    this.isUsing = function (callback) {
        var that = this;
        $.get("http://www.blogger.com/home", function (data) {
            menu = $(data).find("#global-info")
            if (menu.length === 0) {
                callback(false);
            } else {
                callback(true);
            }
        });
    },

    this.listSubscriptions = function (callback) {
        var subscriptions = [];
        $.get("http://www.blogger.com/manage-blogs-following.g", function (data) {
             var rex = /createSubscriptionInUi\(([\s\S]*?),[\s\S]*?,([\s\S]*?),[\s\S]*?,[\s\S]*?,[\s\S]*?,[\s\S]*?,[\s\S]*?\);/g;
             var match = rex.exec(data);
             while (match != null) {
                 subscriptions.push({
                     url: match[2].replace(/"/g,'').trim() + "feeds/posts/default",
                     title: match[1].replace(/"/g,'').trim()
                 })
                 var match = rex.exec(data);
             }
            callback(subscriptions);
        }.bind(this));
    }
});