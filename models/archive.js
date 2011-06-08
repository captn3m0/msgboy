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

    delete_all: function(opts) {
        opts = typeof(opts) != 'undefined' ? opts : {};
        opts.lower = opts.lower || 1;
        opts.step = opts.step || 60000;
        opts.callback = opts.callback || function() {};
        opts.epoch = opts.epoch || 1304200800000;

        if(new Date().getTime() - opts.lower > opts.epoch) {
            this.fetch_more("created_at", function() {
                if(this.models.length > 0) {
                    this.models[0].destroy({
                        success: function() {
                            this.delete_all(opts);
                        }.bind(this), 
                        error: function() {
                            // Couldn't delete. Let's continue. It will retry.
                            this.delete_all(opts);
                        }.bind(this)
                    });
                }
                else {
                    opts.lower = opts.lower + opts.step;
                    this.delete_all(opts);
                }
            }.bind(this), opts);
        } else {
            opts.callback();
        }
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
