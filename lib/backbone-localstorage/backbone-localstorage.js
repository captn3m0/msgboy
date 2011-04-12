// A simple module to replace `Backbone.sync` with *localStorage*-based
// persistence. Models are given GUIDS, and saved into a JSON object. Simple
// as that.

// Generate four random hex digits.
function S4() {
   return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
};

// Generate a pseudo-GUID by concatenating random hexadecimal.
function guid() {
   return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
};

// Our Store is represented by a single JS object in *localStorage*. Create it
// with a meaningful name, like the name you'd give a table.
var Store = function(name) {
  this.name = name;
  collectionStore = localStorage.getItem(this.name);
  this.members = (collectionStore && JSON.parse(collectionStore)) || [];
};

_.extend(Store.prototype, {

  // Save the current state of the **Store** to *localStorage*.
  save: function() {
    localStorage.setItem(this.name, JSON.stringify(this.members));
  },

  // Add a model, giving it a (hopefully)-unique GUID, if it doesn't already
  // have an id of it's own.
  create: function(model) {
	if(this.members.length > 1000) {
		// We currently limit the number of messages to 1000, to avoid issues with the size of localStorage.
		toPop = this.members.pop();
		localStorage.removeItem(this.name + ":" + toPop);
		logger.error("We deleted item " + toPop + " to make room for more!");
	}
    if (!model.id) model.id = model.attributes.id = guid();
    this.members.unshift(model.id); // We add in front, as it facilitates querying. Also, we may want to define indices in our data.
    this.save();
    localStorage.setItem(this.name + ":" + model.id, JSON.stringify(model.toJSON()));
    return model;
  },

  // Update a model by replacing its copy in `this.data`.
  update: function(model) {
    localStorage.setItem(this.name + ":" + model.id, JSON.stringify(model.toJSON()));
    return model;
  },

  // Retrieve a model from `this.data` by id.
  find: function(model) {
    return JSON.parse(localStorage.getItem(this.name + ":" + model.id));
  },

  // Return the array of all models currently in storage.
  findAll: function() {
    //return this.members;
    return _.map(this.members, function(num) {
      return {id: num}
    })
  },

  // Delete a model from `this.data`, returning it.
  destroy: function(model) {
    idx = this.members.indexOf(model.id);
    if(idx!=-1) {
      this.members.splice(idx, 1);
      this.save();
      localStorage.removeItem(this.name + ":" + model.id);
    }
	console.log(this.members.length)
    return model;
  }

});

// Override `Backbone.sync` to use delegate to the model or collection's
// *localStorage* property, which should be an instance of `Store`.
Backbone.sync = function(method, model, success, error) {
    
    var store =  null
    if(model.collection) {
      store = new Store(model.collection.storeName);
    }
    else {
      store = new Store(model.storeName);
    }
    //console.log(store.name + "(" + model.id + ")" + "::" + method)
    
    // If we have a store for that model. We just need to store it.
    // However, the Store has 2 components : 1 for the object itself, and one for all the ids to all objects.
    switch (method) {
      case "read"  :  resp = model.id ? store.find(model) : store.findAll(); break;
      case "create":  resp = store.create(model);                            break;
      case "update":  resp = store.update(model);                            break;
      case "delete":  resp = store.destroy(model);                           break;
    }
    if (resp) {
      success(resp);
    } else {
      error("Record not found");
    }

};