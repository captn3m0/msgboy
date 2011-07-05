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
        });
        
        message.fetch({
            error: function() {
                // The message was not found, so we just have to create one!
                message.save(msg, {
                    success: function() {
                        message.calculate_relevance(function(_relevance) {
                            message.save({
                                relevance: _relevance
                            }, {
                                success: function() {
                                    this.trigger("messages:added", message)
                                    options.success(message);
                                }.bind(this)
                            });
                        }.bind(this));
                    }.bind(this),
                    error: function(object, error) {
                        options.error(object, error);
                    }
                });
            }.bind(this),
            success: function() {
                options.error();
                // Success, we should yield null, as this message was not added, because it already existed!
            }.bind(this)
        });
    },
    
    delete_all_messages: function() {
        var archive = new Archive();
        archive.all({
            created_at: [new Date().getTime(), 0]
        },
        function() {
            _.each(archive.models, function(message) {
                message.destroy();
            });
        });
    }

});