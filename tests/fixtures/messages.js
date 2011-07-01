var MessageFixtures = function () {}

MessageFixtures.prototype = {
    messages: [{
        id: "123",
        alternate: "http://blog.superfeedr.com",
        host: "blog.superfeedr.com",
        alternate_new: "http://blog.superfeedr.com",
        state: "up-ed",
        created_at: new Date().getTime() - 1000 * 60 * 60 * 24 * 7
    }, {
        id: "124",
        alternate: "http://blog.superfeedr.com",
        host: "blog.superfeedr.com",
        alternate_new: "http://blog.superfeedr.com",
        state: "down-ed",
        created_at: new Date().getTime() - 1000 * 60 * 60 * 24 * 6.3
    }, {
        id: "125",
        alternate: "http://blog.superfeedr.com",
        host: "blog.superfeedr.com",
        alternate_new: "http://blog.superfeedr.com",
        state: "new",
        created_at: new Date().getTime() - 1000 * 60 * 60 * 24 * 2.1
    }, {
        id: "126",
        alternate: "https://github.com/superfeedr.atom",
        host: "github.com",
        alternate_new: "https://github.com/superfeedr.atom",
        state: "skipped",
        created_at: new Date().getTime() - 1000 * 60 * 60 * 19.3
    }, {
        id: "127",
        alternate: "http://www.nytimes.com/",
        host: "nytimes.com",
        alternate_new: "http://www.nytimes.com/",
        state: "up-ed",
        created_at: new Date().getTime() - 1000 * 60 * 60 * 19.1
    }, {
        id: "128",
        alternate: "http://www.nytimes.com/",
        host: "nytimes.com",
        alternate_new: "http://www.nytimes.com/",
        state: "up-ed",
        created_at: new Date().getTime() - 1000 * 60 * 60 * 14
    }, {
        id: "129",
        alternate: "http://www.nytimes.com/",
        host: "nytimes.com",
        alternate_new: "http://www.nytimes.com/",
        state: "skipped",
        created_at: new Date().getTime() - 1000 * 60 * 60 * 8
    }, {
        id: "130",
        alternate: "http://www.nytimes.com/",
        host: "nytimes.com",
        alternate_new: "http://www.nytimes.com/",
        state: "skipped",
        created_at: new Date().getTime() - 1000 * 60 * 60 * 7.9
    }, {
        id: "131",
        alternate: "http://blog.superfeedr.com",
        host: "blog.superfeedr.com",
        alternate_new: "http://blog.superfeedr.com",
        state: "down-ed",
        created_at: new Date().getTime() - 1000 * 60 * 60 * 7.7
    }, {
        id: "132",
        alternate: "http://blog.superfeedr.com",
        host: "blog.superfeedr.com",
        alternate_new: "http://blog.superfeedr.com",
        state: "new",
        created_at: new Date().getTime() - 1000 * 60 * 60 * 7.5
    }],

    add_all: function (done) {
        var messages = _.clone(this.messages);
        this.add_more(messages, done);
    },

    add_more: function (messages, done) {
        var message = messages.shift();
        if (message) {
            var msg = new Message();
            msg.save(message, {
                success: function (obj, err) {
                    this.add_more(messages, done);
                }.bind(this),
                error: function (obj, err) {
                    this.add_more(messages, done);
                }.bind(this)
            });
        } else {
            done();
        }
    },

    clean_all: function (done) {
        // We need to clean all the items.
        var ids = _.pluck(this.messages, 'id');
        var deleted_all = _.after(ids.length, done)
        _.each(ids, function (_id) {
            var message = new Message({
                id: _id
            })
            message.destroy({
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

var messageFixtures = new MessageFixtures();