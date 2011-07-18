Plugins.register(new function () {

    this.name = 'Browsing History', this.visits_to_be_popular = 3,

    this.onSubscriptionPage = function () {
        // This method returns true if the plugin needs to be applied on this page.
        return true;
    },

    this.hijack = function (follow, unfollow) {
        // Hum. Nothing to do as we can't use the chrome.* apis from content scripts
    },

    this.listSubscriptions = function (callback) {
        var seen = [];
        var feeds = [];
        var pending = 0;
        chrome.history.search({
            'text': '',
            // Return every history item....
            'startTime': ((new Date).getTime() - 1000 * 60 * 60 * 24 * 31),
            // that was accessed less than one week ago.
            'maxResults': 10000
        }, function (historyItems) {
            _.each(historyItems, function (item) {
                if (item.visitCount > this.visits_to_be_popular) {
                    if (seen.indexOf(item.url)) {
                        seen.push(item.url);
                    }
                }
            }.bind(this));
            _.each(seen.sort(), function (item) {
                pending += 1;
                MsgboyHelper.links_to_feeds_at_url(item, function (links) {
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
        chrome.history.onVisited.addListener(function(historyItem) {
            if(historyItem.visitCount > this.visits_to_be_popular) {
                chrome.history.getVisits({url: historyItem.url}, function(visits) {
                    times = $.map(visits, function(visit) {
                        return visit.visitTime;
                    }).slice(-10);
                    
                    var diffs = [];
                    for(var i=0; i < times.length - 1; i++) {
                        diffs[i] =  times[i+1] - times[i];
                    }
                    if( MsgboyHelper.maths.array.normalized_deviation(diffs) < 1) && (times.slice(-1)[0] -  times[0] > 1000 * 60 * 60 * 3)) {
                        // This url was visited quite often. We need to check the feeds and subscribe
                        MsgboyHelper.links_to_feeds_at_url(historyItem.url, function (links) {
                            _.each(links, function (link) {
                                callback(link);
                            });
                        });
                    }
                    else {
                        // No need to subscribe.
                    }
                })
            }
        }.bind(this));
    }
    

});