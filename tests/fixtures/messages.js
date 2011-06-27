var MessageFixtures = function () {
}

MessageFixtures.prototype = {
    messages: [{
        created_at: new Date().getTime(),
        unread_at: new Date().getTime(),
        read_at: 0,
        starred_at: 0,
        alternate: "http://blog.superfeedr.com",
        host: "blog.superfeedr.com",
        alternate_new: "http://blog.superfeedr.com"
    }, {
        created_at: new Date().getTime(),
        unread_at: new Date().getTime(),
        read_at: 0,
        starred_at: 0,
        alternate: "http://blog.superfeedr.com",
        host: "blog.superfeedr.com",
        alternate_new: "http://blog.superfeedr.com"
    }, {
        created_at: new Date().getTime(),
        unread_at: new Date().getTime(),
        read_at: 0,
        starred_at: 0,
        alternate: "http://blog.superfeedr.com",
        host: "blog.superfeedr.com",
        alternate_new: "http://blog.superfeedr.com"
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

    clean_all: function(done) {
        done();
    },
    
    clean_add: function(done) {
        this.clean_all(function() {
            this.add_all(done);
        }.bind(this));
    }
}

messageFixtures = new MessageFixtures();