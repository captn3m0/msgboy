var Settings = Backbone.Collection.extend({
  
  model: Setting,
  localStorage: new Store("settings"),
    
});