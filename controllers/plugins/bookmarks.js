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
        var feeds = [];
        var pending = 0;
        chrome.bookmarks.getRecent(1000, 
        function (bookmarks) {
            _.each(bookmarks, function (bookmark) {
                pending += 1;
                MsgboyHelper.links_to_feeds_at_url(bookmark.url, function (links) {
                    pending -= 1;
                    _.each(links, function (link) {
                        feeds.push({
                            title: link.title,
                            url: link.href,
                        });
                    });
                    if(pending == 0) {
                        callback(_.uniq(feeds));
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