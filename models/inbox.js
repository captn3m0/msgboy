var Inbox = Backbone.Model.extend({
    storeName: "inbox",
    database: msgboyDatabase,

    initialize: function () {
        this.id = 1;
        this.fetch();
        this.messages = new Archive();
    },

    // Create credentials and saves them.
    // We may want to not run that again when we already have credentails.
    create_credentials: function (callback) {
        var base = "http://msgboy.com";

        var params = {
            'user[username]': (new Date()).getTime().toString() + Math.floor((Math.random() * Math.pow(10, 3))).toString(),
            'user[password]': Math.floor((Math.random() * Math.pow(10, 16))).toString(),
        };
        params['user[password_confirmation]'] = params['user[password]'];

        $.post(base + "/users.json", params, function (data) {
            var success = true;
            _.each(data.user.errors, function (error, field) {
                success = false
            });

            if (success) {
                this.save({
                    epoch: new Date().getTime(),
                    jid: data.user.username,
                    password: params["user[password]"]
                }, {
                    success: function () {
                        Msgboy.log("Inbox created for " + data.user.username);
                        callback();
                    },
                    error: function () {
                        // WTF? This is bad. 
                        Msgboy.log("Failed to create inbox for " + data.user.username);
                    }
                });
            } else {
                setTimeout(function () {
                    this.create_credentials(callback); // We retry. That may be dangerrous though.
                }, 5000);
            }
        }.bind(this));
    },

    // Fetches and prepares the inbox if needed.
    fetch_and_prepare: function () {
        this.fetch({
            success: function () {
                if (this.attributes.jid && this.attributes.jid != "" && this.attributes.password && this.attributes.password != "") {
                    Msgboy.log("Loading inbox for " + this.attributes.jid);
                    this.trigger("ready", this);
                } else {
                    Msgboy.log("Creating new inbox");
                    this.create_credentials(function () {
                        this.trigger("ready", this);
                        this.trigger("new", this);
                    });
                }
            }.bind(this),
            error: function () {
                // Looks like there is no such inbox.
                this.create_credentials(function () {
                    this.trigger("ready", this);
                    this.trigger("new", this);
                }.bind(this));
            }.bind(this)
        })

    },

    // Adds a message in the inbox
    add_message: function (msg, options) {
        // Adds the message if the message isn't yet present
        var message = new Message({
            'id': msg.id,
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
                                    this.trigger("messages:added", message)
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