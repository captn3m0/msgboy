var Inbox = Backbone.Model.extend({
    storeName: "inbox",
    database: msgboyDatabase,
    defaults: {
        id: "1",
        options: {
            relevance: 0.5
        }
    },
    initialize: function () {
    },

    // Create credentials and saves them.
    // We may want to not run that again when we already have credentails.
    create_credentials: function (callback) {
        window.open("http://msgboy.com/session/new?ext=" + chrome.i18n.getMessage("@@extension_id"));
    },
    
    setup: function(username, token, callback) {
        this.save({
            epoch: new Date().getTime(),
            jid: username,
            password: token
        }, {
            success: function () {
                Msgboy.log("Inbox created for " + username);
                callback();
                this.trigger("ready", this);
                this.trigger("new", this);
            }.bind(this),
            error: function () {
                Msgboy.log("Failed to create inbox for " + username);
            }.bind(this)
        });
    },

    // Fetches and prepares the inbox if needed.
    fetch_and_prepare: function () {
        this.fetch({
            success: function () {
                if (this.attributes.jid && this.attributes.jid !== "" && this.attributes.password && this.attributes.password !== "") {
                    Msgboy.log("Loaded inbox for " + this.attributes.jid);
                    this.trigger("ready", this);
                } else {
                    Msgboy.log("Refreshing new inbox ");
                    this.create_credentials();
                }
            }.bind(this),
            error: function (e,o) {
                // Looks like there is no such inbox.
                Msgboy.log("Creating new inbox");
                this.create_credentials();
            }.bind(this)
        });
    },

    // Adds a message in the inbox
    add_message: function (msg, options) {
        // Adds the message if the message isn't yet present
        var message = new Message({
            'id': msg.id
        });

        message.fetch({
            error: function () {
                // The message was not found, so we just have to create one!
                var message = new Message(msg);
                message.save({}, {
                    success: function () {
                        message.calculate_relevance(function (_relevance) {
                            message.save({
                                relevance: _relevance
                            }, {
                                success: function () {
                                    this.trigger("messages:added", message);
                                    options.success(message);
                                }.bind(this)
                            });
                        }.bind(this));
                    }.bind(this),
                    error: function (object, error) {
                        options.error(object, error);
                    }
                });
            }.bind(this),
            success: function () {
                options.success(null);
            }.bind(this)
        });
    },

    // Deletes all the messages in that inbox.
    delete_all_messages: function () {
        var archive = new Archive();
        archive.all({
            created_at: [new Date().getTime(), 0]
        }, function () {
            _.each(archive.models, function (message) {
                message.destroy();
            });
        });
    }
});