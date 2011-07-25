Plugins.register(new function () {

    this.name = 'Browser Bookmarks', 

    this.onSubscriptionPage = function () {
        // This method returns true if the plugin needs to be applied on this page.
        return true;
    },

    this.hijack = function (follow, unfollow) {
        // Hum. What?
    },

    this.listSubscriptions = function (callback) {
        var seen = [];
        chrome.bookmarks.getRecent(1000, 
        function (bookmarks) {
            _.each(bookmarks, function (bookmark) {
                MsgboyHelper.links_to_feeds_at_url(bookmark.url, function (links) {
                    var feeds = [];
                    _.each(links, function (link) {
                        if(seen.indexOf(link.href) == -1) {
                            feeds.push({title: link.title, url: link.href});
                            seen.push(link.href);
                        }
                    });
                    if(feeds.length > 0) {
                        callback(feeds);
                    }
                });
            });
        }.bind(this));
    },

    this.isUsing = function (callback) {
        callback(true) // By default we will show.
    }
    
    this.subscribeInBackground = function(callback) {
        chrome.bookmarks.onCreated.addListener(function(id, bookmark) {
            MsgboyHelper.links_to_feeds_at_url(bookmark.url, function (links) {
                _.each(links, function (link) {
                    callback(link);
                });
            });
        }.bind(this));
    }

});