var Inbox = Backbone.Model.extend({
  storeName: "inbox",
  
  initialize: function() {
    this.id = 1;
    this.fetch();
    this.messages = new Archive()
    this.messages.fetch();
  },
  
  addMessage: function(msg) {
    var message = this.messages.create(msg);
    return message;
  }
  
});