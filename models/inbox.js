var Inbox = Backbone.Model.extend({
  storeName: "inbox",
  
  initialize: function() {
    this.id = 1;
    this.fetch();
    this.messages = new Archive()
    this.messages.fetch();
  },
  
  addMessage: function(msg) {
	// Adds the message if the message isn't yet present
	var message = new Message({'id': msg.id})
	var that = this;
	message.fetch({
		error: function() {
			// The message was not found, so we just have to create one!
			message.set(msg) // And now set the attributes.
			message.collection = this.messages;
			message.save();
			that.trigger("messages:added", message.id)
		},
		success: function() {
			// Success, we should return null, as this message was not added, because it already existed!
		}
	});
	return message;
  }
  
});