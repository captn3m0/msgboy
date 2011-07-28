var Archive = Backbone.Collection.extend({
    storeName: "messages",
    database: msgboyDatabase,
    model: Message,

    initialize: function() {
        this.bind("add", function(message, collection) {
            this.current = message;
        }.bind(this));
    },

    comparator: function(message) {
      return -(message.attributes.created_at);
    },
    
    all: function(condition, done) {
        this.fetch({
            conditions: condition,
            success: function() {
                if(typeof(done) != "undefined" && done) {
                    done();
                }
            }.bind(this),
            error: function(object, error) {
                if(typeof(done) != "undefined" && done) {
                    done(error);
                }
            }
        });
    },
    
    each: function(condition) {
        this.fetch({
            conditions: condition,
            addIndividually: true
        });
    },
    
    next: function(number, condition) {
        options = {
            conditions: condition,
            limit: number,
            addIndividually: true
        }
        if(this.current) {
            options.from = this.current;
        }
        this.fetch(options);
    },

    fetch_more: function(conds, done, opts) {
        opts = typeof(opts) != 'undefined' ? opts : {};
        opts.lower = opts.lower         || 0;
        opts.step = opts.step           || 60000;
        
        var conditions = null;
        
        if(typeof(conds) == "string") {
            conditions = {};
            conditions[conds] = [new Date().getTime() - opts.lower, new Date().getTime() - opts.lower - opts.step];
        }
        else {
            conditions = conds
        }
        
        this.fetch({
            conditions: conditions,
            success: function() {
                done();
            }.bind(this),
            error: function() {
                done();
            }
        });
    },

    for_source: function(source, done) {
        this.all({alternate: source}, done);
    },

    for_feed: function(_feed, done) {
        this.all({feed: _feed}, done);
    }


});
