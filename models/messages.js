//
// This stores messages.
// It should store them in "pages". These pages are physical only, so their size can actually vary. Users won't see the pagination. 
var Messages = Backbone.Collection.extend({
  
  model: Message,
  localStorage: null,

  initialize: function(page) {
    this.page = page;
    this.localStorage = new Store("messages:"+page);
  },
  
  unread: function() {
    return this.filter(function(item){ return !item.get('read'); });
  },
  
  read: function() {
    return this.filter(function(item){ return item.get('read'); });
  },
  
  starred: function() {
    return this.filter(function(item){ return item.get('starred'); });
  },
  
  nextOrder: function() {
    if (!this.length) return 1;
    return this.last().get('order') + 1;
  },
  
  comparator: function(item) {
    return item.get('published');
  }

});