var Inbox = Backbone.Model.extend({
  storeName: "inbox",
	database: msgboyDatabase,
  
  initialize: function() {
    this.id = 1;
    this.fetch();
    this.messages = new Archive()
    this.messages.fetch();
  },
  
  addMessage: function(msg, options) {
	// Adds the message if the message isn't yet present
	var message = new Message({
		'id': msg.id,
		'created_at': new Date().getTime(),
		'read_at': 0,
		'unread_at':  new Date().getTime(),
		'starred_at': 0
	});
	var that = this;
	
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
					console.log("Could not save message")
					console.log(error)
				}
			});
		},
		success: function() {
			// Success, we should return null, as this message was not added, because it already existed!
		}
	});
  }
  
});