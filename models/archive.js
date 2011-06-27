var Archive = Backbone.Collection.extend({
    storeName: "messages",
    database: msgboyDatabase,
    model: Message,

    comparator: function(message) {
      return -(message.attributes.created_at);
    },

    mark_all_as_read: function(opts) {
        opts = typeof(opts) != 'undefined' ? opts : {};
        opts.lower = opts.lower         || 0;
        opts.step = opts.step           || 60000;
        opts.callback = opts.callback   || function() {};
        opts.epoch = opts.epoch         || 1304200800000;

        if(new Date().getTime() - opts.lower > opts.epoch) {
            this.fetch_more("unread_at", function() {
                if(this.models.length > 0) {
                    this.models[0].mark_as_read(function() {
                        this.mark_all_as_read(opts);
                    }.bind(this));
                }
                else {
                    opts.lower = opts.lower + opts.step;
                    this.mark_all_as_read(opts);
                }
            }.bind(this), opts);
        } else {
            opts.callback();
        }
    },

    delete_all: function(condition, done) {
        this.fetch({
            conditions: condition,
            limit: 1, // We always delete 1 by 1 to make things faster!
            success: function() {
                if(this.length > 0) {
                    this.models[0].destroy( {
                        success: function() {
                            this.delete_all(condition, done);
                        }.bind(this),
                        error: function() {
                            this.delete_all(condition, done);
                        }.bind(this)
                    })
                } else {
                    // Since there is no more message, we need to update the epoch!
                    
                    done();
                }
            }.bind(this),
            error: function() {
                done();
            }
        });
    },
    
    fetch_all: function(condition, done) {
        this.fetch({
            conditions: condition,
            success: function() {
                if(typeof(done) != "undefined" && done) {
                    done();
                }
            }.bind(this),
            error: function() {
                if(typeof(done) != "undefined" && done) {
                    done();
                }
            }
        });
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
    }
});
