var Message = Backbone.Model.extend({
    storeName: "messages",
    database: msgboyDatabase,
    defaults: {
        "title":        null,
        "atom_id":      null,
        "summary":      null,
        "content":      null,
        "links":        {},
        "read_at":      0,
        "unread_at":    0,
        "starred_at":   0,
        "created_at":   0,
        "source":       {},
        "host":         "",
        "alternate":    "",
        "alternate_new": "",
        "state":        "new",
        "feed":         "",
        "relevance":    0.3
    },
    /* Initializes the messages */
    initialize: function (attributes) {
        if (attributes.source && attributes.source.links && attributes.source.links.alternate && attributes.source.links.alternate["text/html"] && attributes.source.links.alternate["text/html"][0]) {
            attributes.alternate = attributes.source.links.alternate["text/html"][0].href;
            attributes.host = parseUri(attributes.source.links.alternate["text/html"][0].href).host;
            attributes.alternate_new = parseUri(attributes.alternate).toString();
        }
        this.attributes = attributes;
        if (this.attributes.unread_at === 0) {
            this.attributes.unread_at = new Date().getTime();
        }
        if (this.attributes.created_at === 0) {
            this.attributes.created_at = new Date().getTime();
        }
        // create container for messages
        this.messages = new Backbone.Collection();
        this.messages.add(this); // add ourselves
        return this;
    },
    /* Returns the state of the message
    Valid states include :
    - new
    - up-ed
    - down-ed
    - skipped */
    state: function () {
        return this.attributes.state;
    },
    /* Votes the message up */
    vote_up: function (callback) {
        this.set_state("up-ed", callback);
    },
    /* Votes the message down */
    vote_down: function (callback) {
        this.set_state("down-ed", function (result) {
            // We need to unsubscribe the feed if possible, but only if there is enough negative votes.
            var brothers = new Archive();
            brothers.for_feed(this.attributes.feed, function () {
                var states = relevanceMath.percentages(brothers.pluck("state"), ["new", "up-ed", "down-ed", "skipped"], function (member, index) {
                    return 1;
                });
                var counts = relevanceMath.counts(brothers.pluck("state"));
                if (brothers.length > 3 && (!states["up-ed"] || states["up-ed"] < 0.05) && (states["down-ed"] > 0.5 || counts["down-ed"] > 10)) {
                    callback({unsubscribe: true});
                }
                else {
                    callback({unsubscribe: false});
                }
            });
        }.bind(this));
    },
    /* Skip the message */
    skip: function (callback) {
        this.set_state("skipped", callback);
    },
    /* Sets the state for the message */
    set_state: function (_state, callback) {
        this.save({
            state: _state
        }, {
            success: function () {
                if (typeof(callback) !== "undefined" && callback) {
                    callback(true);
                }
                this.trigger(_state, this);
            }.bind(this),
            error: function () {
                console.log("We couldn't save " + this.id);
                if (typeof(callback) !== "undefined" && callback) {
                    callback(false);
                }
            }.bind(this)
        });
    },
    /* This calculates the relevance for this message and sets it. */
    /* It just calculates the relevance and does not save it. */
    calculate_relevance: function (callback) {
        // See Section 6.3 in Product Requirement Document.
        // We need to get all the messages from this source.
        // Count how many have been voted up, how many have been voted down.
        // First, let's pull all the messages from the same source.
        var brothers = new Archive();
        brothers.comparator = function (brother) {
            return brother.attributes.created_at;
        };
        brothers.for_feed(this.attributes.feed, function () {
            var relevance = 0.7; // This is the default relevance
            if (brothers.length > 0) {
                // So, now, we need to check the ratio of up-ed and down-ed. [TODO : limit the subset?].
                relevance =  this.relevance_based_on_brothers(brothers.pluck("state"));
            }
            // Keywords [TODO]
            // Check when the feed was susbcribed. Add bonus if it's recent! [TODO].
            if (typeof(callback) !== "undefined" && callback) {
                callback(relevance);
            }
        }.bind(this));
    },
    relevance_based_on_brothers: function (states) {
        if (states.length === 0) {
            return 1;
        }
        else {
            var percentages = relevanceMath.percentages(states, ["new", "up-ed", "down-ed", "skipped"]);

            return relevanceMath.average(percentages, {
                "new" : 0.6,
                "up-ed": 1.0,
                "down-ed": 0.0,
                "skipped": 0.4
            });
        }
    },
    /* Returns the number of links*/
    number_of_links: function () {
        return 5;
    },
    /*return the links to the media included in this doc*/
    media_included: function () {
        return [];
    },
    main_link: function () {
        if (this.attributes.links.alternate) {
            if (this.attributes.links.alternate["text/html"]) {
                return this.attributes.links.alternate["text/html"][0].href;
            }
            else {
                // Hum, let's see what other types we have!
                return "";
            }
        }
        else {
            return "";
        }
    },
    source_link: function () {
        if (this.attributes.source && this.attributes.source.links && this.attributes.source.links.alternate && this.attributes.source.links.alternate["text/html"] && this.attributes.source.links.alternate["text/html"][0]) {
            return this.attributes.source.links.alternate["text/html"][0].href;
        }
        else {
            return "";
        }
    },
    // This returns the longest text!
    text: function () {
        if (this.attributes.content) {
            if (this.attributes.summary && this.attributes.summary.length > this.attributes.content.length) {
                return this.attributes.summary;
            }
            else {
                return this.attributes.content;
            }
        }
        else if (this.attributes.summary) {
            return this.attributes.summary;
        }
        else {
            return "...";
        }
    },
    faviconUrl: function () {
        return "http://g.etfv.co/" + this.source_link() + "?defaulticon=lightpng";
    }
});

var relevanceMath = {
    counts: function (array, defaults, weight) {
        var counts = {}, sum = 0;
        _.each(array, function (element, index, list) {
            if (!counts[element]) {
                counts[element] = 0;
            }
            if (typeof(weight) !== "undefined") {
                counts[element] += weight(element, index);
            }
            else {
                counts[element] += 1;
            }
        });
        sum = _.reduce(counts, function (memo, num) {
            return memo + num;
        }, 0);
        return counts;
    },
    // Returns the percentages of each element in an array.
    percentages: function (array) {
        var counts = {}, percentages = {}, sum = 0;
        _.each(array, function (element, index, list) {
            if (!counts[element]) {
                counts[element] = 0;
            }
            counts[element] += 1;
        });
        sum = _.reduce(counts, function (memo, num) {
            return memo + num;
        }, 0);
        _.each(_.keys(counts), function (key) {
            percentages[key] = counts[key] / sum;
        });
        return percentages;
    },
    // Returns the average based on the weights and the percentages.
    average: function (percentages, weights) {
        var sum = 0, norm = 0;
        _.each(_.keys(percentages), function (key) {
            sum += percentages[key] * weights[key];
            norm += percentages[key];
        });
        if (norm === 0) {
            return sum;
        } else {
            return sum / norm;
        }
        return sum;
    }
};

// Welcome messages
var welcomeMessages = [{
    "title": "Welcome to Msgboy",
    "atom_id": "welcome-" + new Date().getTime(),
    "summary": "",
    "content": null,
    "links": {
        "alternate": {
            "text/html": [{
                "href": chrome.extension.getURL('/views/html/help.html'),
                "rel": "alternate",
                "title": "Welcome to Msgboy",
                "type": "text/html"
            }]
        }
    },
    "read_at": 0,
    "unread_at": new Date().getTime(),
    "starred_at": 0,
    "created_at": new Date().getTime(),
    "source": {
        "title": "Msgboy",
        "url": "http://blog.msgboy.com/",
        "links": {
            "alternate": {
                "text/html": [{
                    "href": "http://blog.msgboy.com/",
                    "rel": "alternate",
                    "title": "",
                    "type": "text/html"
                }]
            }
        }
    },
    "host": "msgboy.com",
    "alternate": "http://msgboy.com/",
    "alternate_new": "http://msgboy.com/",
    "state": "new",
    "feed": "http://blog.msgboy.com/rss",
    "relevance": 1.0,
    "published": new Date().toISOString(),
    "updated": new Date().toISOString()
}, {
    "title": "Click on + to see more similar messages",
    "atom_id": "vote-plus" + new Date().getTime(),
    "summary": "",
    "content": null,
    "links": {
        "alternate": {
            "text/html": [{
                "href": chrome.extension.getURL('/views/html/help.html'),
                "rel": "alternate",
                "title": "Welcome to Msgboy",
                "type": "text/html"
            }]
        }
    },
    "read_at": 0,
    "unread_at": new Date().getTime(),
    "starred_at": 0,
    "created_at": new Date().getTime(),
    "source": {
        "title": "Msgboy",
        "url": "http://blog.msgboy.com/",
        "links": {
            "alternate": {
                "text/html": [{
                    "href": "http://blog.msgboy.com/",
                    "rel": "alternate",
                    "title": "",
                    "type": "text/html"
                }]
            }
        }
    },
    "host": "msgboy.com",
    "alternate": "http://msgboy.com/",
    "alternate_new": "http://msgboy.com/",
    "state": "new",
    "feed": "http://blog.msgboy.com/rss",
    "relevance": 0.3,
    "published": new Date().toISOString(),
    "updated": new Date().toISOString()
}, {
    "title": "Click on - to see less similar messages",
    "atom_id": "vote-minus-" + new Date().getTime(),
    "summary": "",
    "content": null,
    "links": {
        "alternate": {
            "text/html": [{
                "href": chrome.extension.getURL('/views/html/help.html'),
                "rel": "alternate",
                "title": "Welcome to Msgboy",
                "type": "text/html"
            }]
        }
    },
    "read_at": 0,
    "unread_at": new Date().getTime(),
    "starred_at": 0,
    "created_at": new Date().getTime(),
    "source": {
        "title": "Msgboy",
        "url": "http://blog.msgboy.com/",
        "links": {
            "alternate": {
                "text/html": [{
                    "href": "http://blog.msgboy.com/",
                    "rel": "alternate",
                    "title": "",
                    "type": "text/html"
                }]
            }
        }
    },
    "host": "msgboy.com",
    "alternate": "http://msgboy.com/",
    "alternate_new": "http://msgboy.com/",
    "state": "new",
    "feed": "http://blog.msgboy.com/rss",
    "relevance": 0.6,
    "published": new Date().toISOString(),
    "updated": new Date().toISOString()
}, {
    "title": "Bookmark sites you really love to get the msgboy to send more stories from these",
    "atom_id": "bookmark-" + new Date().getTime(),
    "summary": "",
    "content": null,
    "links": {
        "alternate": {
            "text/html": [{
                "href": chrome.extension.getURL('/views/html/help.html'),
                "rel": "alternate",
                "title": "Welcome to Msgboy",
                "type": "text/html"
            }]
        }
    },
    "read_at": 0,
    "unread_at": new Date().getTime(),
    "starred_at": 0,
    "created_at": new Date().getTime(),
    "source": {
        "title": "Msgboy",
        "url": "http://blog.msgboy.com/",
        "links": {
            "alternate": {
                "text/html": [{
                    "href": "http://blog.msgboy.com/",
                    "rel": "alternate",
                    "title": "",
                    "type": "text/html"
                }]
            }
        }
    },
    "host": "msgboy.com",
    "alternate": "http://msgboy.com/",
    "alternate_new": "http://msgboy.com/",
    "state": "new",
    "feed": "http://blog.msgboy.com/rss",
    "relevance": 0.6,
    "published": new Date().toISOString(),
    "updated": new Date().toISOString()
}];