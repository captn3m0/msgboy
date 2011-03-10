var Inbox = Backbone.Model.extend({
  current_page_number: null,
  localStorage: new Store("inbox"),
  
  defaults: {
    current_page_number: 1,
  },
  
  initialize: function() {
    this.fetch();
  },
  
  addMessage: function(msg) {
    if(!this.current_page) {
      this.fetch();
      if(!this.current_page_number) {
        this.current_page_number = this.defaults.current_page_number;
        this.set({"current_page_number": this.current_page_number});
        this.save();
      }
    }
    current_page = new Messages(this.get("current_page_number"));
    current_page.fetch();
    message = current_page.create(msg);
    if(current_page.length >= 20) {
        // Arbitrary limit size to 20 elements in a page.
        this.current_page_number++;
        this.set({"current_page_number": this.current_page_number});
        this.save();
        current_page = new Messages(this.get("current_page_number"));
        current_page.fetch();
    }
  }
  
});