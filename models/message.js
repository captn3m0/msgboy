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
        "unread_at":    new Date().getTime(),
        "starred_at":   0,
        "created_at":   new Date().getTime(),
        "source":       {},
        "host":         "",
        "alternate":    "",
        "alternate_new":"",
        "state":        "new",
        "relevance":    0.3
    },
    
    /* Initializes the messages */
    initialize: function(attributes) {
        if(attributes.source && attributes.source.links && attributes.source.links.alternate && attributes.source.links.alternate["text/html"] && attributes.source.links.alternate["text/html"][0]) {
            attributes.alternate = attributes.source.links.alternate["text/html"][0].href;
            attributes.host = parseUri(attributes.source.links.alternate["text/html"][0].href).host;
            attributes.alternate_new = parseUri(attributes.alternate).toString();
        }
        this.attributes = attributes
    },
    
    /* 
    Returns the state of the message
    Valid states include : 
        - new 
        - up-ded 
        - down-ed 
        - skipped */
    state: function() {
        return this.attributes.state;
    },
    
    /* Votes the message up */
    vote_up: function(callback) {
        this.set_state("up-ed", callback);
    },

    /* Votes the message down */
    vote_down: function(callback) {
        this.set_state("down-ed", callback);
    },

    /* Skip the message */
    skip: function(callback) {
        this.set_state("skipped", callback);
    },
    
    /* Sets the state for the message */
    set_state: function(_state, callback) {
        this.save({
            relevance: this.calculate_relevance(),
            state: _state
        }, {
            success: function() {
                if(typeof(callback) != "undefined" && !callback) {
                    callback(true);
                }
            }.bind(this), 
            error: function() {
                if(typeof(callback) != "undefined" && !callback) {
                    callback(false);
                }
            }.bind(this)
        });
    },
        
    /* This calculates the relevance for this message and sets it. */
    /* It just calculates the relevance and does not save it. */
    calculate_relevance: function(done) {
        // See Section 6.3 in Product Requirement Document.
        // We need to get all the messages from this source.
        // Count how many have been voted up, how many have been voted down.
        return Math.random();
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

});

