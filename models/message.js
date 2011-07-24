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
        "alternate_new":"",
        "state":        "new",
        "feed":         "",
        "relevance":    0.3
    },
    
    /* Initializes the messages */
    initialize: function(attributes) {
        if(attributes.source && attributes.source.links && attributes.source.links.alternate && attributes.source.links.alternate["text/html"] && attributes.source.links.alternate["text/html"][0]) {
            attributes.alternate = attributes.source.links.alternate["text/html"][0].href;
            attributes.host = parseUri(attributes.source.links.alternate["text/html"][0].href).host;
            attributes.alternate_new = parseUri(attributes.alternate).toString();
        }
        this.attributes = attributes;
        if(this.attributes.unread_at == 0) {
            this.attributes.unread_at = new Date().getTime();
        }
        if(this.attributes.created_at == 0) {
            this.attributes.created_at = new Date().getTime();
        }
        return this;
    },
    
    /* 
    Returns the state of the message
    Valid states include : 
        - new 
        - up-ed 
        - down-ed 
        - skipped */
    state: function() {
        return this.attributes.state;
    },
    
    /* Votes the message up */
    vote_up: function(callback) {
        this.set_state("up-ed", callback);
        this.trigger("up-ed");
    },

    /* Votes the message down */
    /* TODO : we may want to unsubscribe from this source if it has too many downvotes, but we don't want to do it here. The question is : how? where? */
    vote_down: function(callback) {
        this.set_state("down-ed", function(result) {
            // We need to unsubscribe the feed if possible, but only if there is enough negative votes.
            var brothers = new Archive();
            brothers.for_feed(this.attributes.feed, function() {
                var states = relevanceMath.percentages(brothers.pluck("state"), ["new", "up-ed", "down-ed", "skipped"], function(member, index) {
                    return 1;
                });
                var counts = relevanceMath.counts(brothers.pluck("state"));
                
                if(brothers.length > 3 && (!states["up-ed"] || states["up-ed"] < 0.05) && (states["down-ed"] > 0.5 || counts["down-ed"] > 10)) {
                    callback({unsubscribe: true});
                }
                else {
                    callback({unsubscribe: false});
                }
            });
            this.trigger("down-ed");
        }.bind(this));
    },

    /* Skip the message */
    skip: function(callback) {
        this.set_state("skipped", callback);
    },
    
    /* Sets the state for the message */
    set_state: function(_state, callback) {
        this.save({
            state: _state
        }, {
            success: function() {
                if(typeof(callback) != "undefined" && callback) {
                    callback(true);
                }
            }.bind(this), 
            error: function() {
                console.log("We couldn't save " + this.id)
                if(typeof(callback) != "undefined" && callback) {
                    callback(false);
                }
            }.bind(this)
        });
    },
        
    /* This calculates the relevance for this message and sets it. */
    /* It just calculates the relevance and does not save it. */
    calculate_relevance: function(callback) {
        // See Section 6.3 in Product Requirement Document.
        // We need to get all the messages from this source.
        // Count how many have been voted up, how many have been voted down.
        // First, let's pull all the messages from the same source.
        var brothers = new Archive();
        brothers.comparator = function(brother) {
            return brother.attributes.created_at;
        }
        brothers.for_feed(this.attributes.feed, function() {
            var relevance = 0.7; // This is the default relevance
            if(brothers.length == 0) {
                // We can't compute relevance
            } else {
                // So, now, we need to check the ratio of up-ed and down-ed. [TODO : limit the subset?].
                relevance =  this.relevance_based_on_brothers(brothers.pluck("state"))
            }

            // Keywords [TODO]
            
            // Check when the feed was susbcribed. Add bonus if it's recent! [TODO].
            
            if(typeof(callback) != "undefined" && callback) {
                callback(relevance);
            } 
        }.bind(this));
    },
    
    relevance_based_on_brothers: function(states) {
        if(states.length == 0) {
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
    
    /* this returns all the keywords in this message. */
    keywords: function() {
        return [];
    },
    
    /* Returns the number of links*/
    number_of_links: function() {
        return 5;
    },
    
    /*return the links to the media included in this doc*/
    media_included: function() {
        return [];
    },

    /* this returns all the keywords in the title of this message. */
    title_keywords: function() {
        return [];
    },
    
    /* Returns true of the message is relevant! */
    is_relevant: function() {
        return this.attributes.relevance >= 0.5;
    },
    
    main_link: function() {
        if(this.attributes.links["alternate"]) {
            if(this.attributes.links["alternate"]["text/html"]) {
                return this.attributes.links["alternate"]["text/html"][0].href;
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
    
    source_link: function() {
        if(this.attributes.source && this.attributes.source.links && this.attributes.source.links["alternate"] && this.attributes.source.links["alternate"]["text/html"] && this.attributes.source.links["alternate"]["text/html"][0]) {
            return this.attributes.source.links["alternate"]["text/html"][0].href;
        }
        else {
            return "";
        }
    },
     
    /* Deprecated methods */
    toggle_read: function(callback) {
        callback = typeof(callback) != 'undefined' ? callback : function() {};
        var _read_at = 0
        var _unread_at = 0
        var _alternate_new = this.attributes.alternate_new;

        if(this.attributes.unread_at || !this.attributes.read_at) {
            _read_at = new Date().getTime();
            _alternate_new = ""; // Not new anymore for that alternate!
        }
        else {
            _unread_at = new Date().getTime();
        }

        this.save({
            alternate_new: _alternate_new,
            read_at: _read_at,
            unread_at: _unread_at
        }, {
            success: function() {
                callback(true)
            },
            error: function() {
                callback(false)
            }
        });

    },

    mark_as_read: function(callback) {
        callback = typeof(callback) != 'undefined' ? callback : function() {};
        this.save({
            alternate_new: "",
            read_at: new Date().getTime(),
            unread_at: 0
        }, {
            success: function() {
                callback(true)
            },
            error: function(object, error) {
                callback(false)
            }
        });
    },

    toggle_starred: function(callback) {
        callback = typeof(callback) != 'undefined' ? callback : function() {};
        var _starred_at = 0;
        if(!this.attributes.starred_at) {
            _starred_at = new Date().getTime();
        }

        this.save({
            starred_at: _starred_at
        }, {
            success: function() {
                callback(true)
            },
            error: function() {
                callback(false)
            }
        });
    },

    
    layout: function() {
        if(this.image() != "") {
            return 'image';
        }
        return "text";
    },
    
    // This function must return the image for this message. It's extracted from the links.
    image: function() {
        if(this.attributes.links.enclosure && this.attributes.links.enclosure["image/jpeg"]) {
            return this.attributes.links.enclosure["image/jpeg"][0].href;
        }
        return "";
    },
    
    // This retruns the longest text!
    text: function() {
        if(this.attributes.content) {
            if(this.attributes.summary && this.attributes.summary.length > this.attributes.content.length) {
                return this.attributes.summary;
            }
            else {
                return this.attributes.content;
            }
        } 
        else if(this.attributes.summary) {
            return this.attributes.summary;
        }
        else {
            return "..."
        }
    }
    

});


var relevanceMath = {

    counts: function(array, defaults, weight) {
        var counts = {}, sum = 0;
        _.each(array, function(element, index, list) {
            if(!counts[element]) {
                counts[element] = 0;
            }
            if(typeof(weight) != "undefined") {
                counts[element] += weight(element, index);
            }
            else {
                counts[element] += 1;
            }
        })
        sum = _.reduce(counts, function(memo, num){ return memo + num; }, 0);
        return counts;
    },

    // Returns the percentages of each element in an array.
    percentages: function(array) {
        var counts = {}, percentages = {}, sum = 0;
        _.each(array, function(element, index, list) {
            if(!counts[element]) {
                counts[element] = 0;
            }
            counts[element] += 1;
        })
        sum = _.reduce(counts, function(memo, num){ return memo + num; }, 0);
        
        _.each(_.keys(counts), function(key) {
            percentages[key] = counts[key]/sum;
        });
        
        return percentages;
    },
    
    // Returns the average based on the weights and the percentages.
    average: function(percentages, weights) {
        var sum = 0, norm = 0;
        _.each(_.keys(percentages), function(key) {
            sum += percentages[key] * weights[key];
            norm+= percentages[key];
        });
        if(norm == 0) {
            return sum;
        } else {
            return sum/norm;
        }
        return sum;
    },
}

