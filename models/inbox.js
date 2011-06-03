var Inbox = Backbone.Model.extend({
    storeName: "inbox",
    database: msgboyDatabase,

    initialize: function() {
        this.id = 1;
        this.fetch();
        this.messages = new Archive();
    },

    addMessage: function(msg, options) {
        // Adds the message if the message isn't yet present
        var message = new Message({
            'id': msg.id,
            'created_at': new Date().getTime(),
            'unread_at':  new Date().getTime()
        });
        var that = this;

        if(msg.source && msg.source.links && msg.source.links.alternate && msg.source.links.alternate["text/html"] && msg.source.links.alternate["text/html"][0]) {
            msg.alternate = msg.source.links.alternate["text/html"][0].href;
            msg.host = parseUri(msg.source.links.alternate["text/html"][0].href).host;
            msg.alternate_new = parseUri(msg.alternate).toString();
        }

        message.fetch({
            error: function() {
                // The message was not found, so we just have to create one!
                message.collection = this.messages;
                message.save(msg, {
                    success: function() {
                        that.trigger("messages:added", message.id)
                        options.success(message);
                    },
                    error: function(object, error) {
                        options.error(object, error);
                    }
                });
            },
            success: function() {
                options.error();
                // Success, we should yield null, as this message was not added, because it already existed!
            }
        });
    }

});