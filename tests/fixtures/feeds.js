var FeedFixtures = function () {
}

FeedFixtures.prototype = {
    feeds: [{
        id: "1",
    }, {
        id: "2",
    }, {
        id: "3",
    }, {
        id: "4",
    }, {
        id: "5",
    }, {
        id: "6",
    }],

    add_all: function (done) {
        var feeds = _.clone(this.feeds);
        this.add_more(feeds, done);
    },
    
    add_more: function (feeds, done) {
        var f = feeds.shift();
        if (f) {
            var feed = new Feed();
            feed.save(f, {
                success: function (obj, err) {
                    this.add_more(feeds, done);
                }.bind(this),
                error: function (obj, err) {
                    this.add_more(feeds, done);
                }.bind(this)
            });
        } else {
            done();
        }
    },

    clean_all: function (done) {
        // We need to clean all the items.
        var ids = _.pluck(this.feeds, 'id'); 
        var deleted_all = _.after(ids.length, done)
        _.each(ids, function (_id) {
            var feed = new Feed({id: _id})
            feed.destroy({
                success: deleted_all,
                error: deleted_all
            });
        });
    },
    
    clean_add: function (done) {
        this.clean_all(function () {
            this.add_all(done);
        }.bind(this));
    }
}

var feedFixtures = new FeedFixtures();