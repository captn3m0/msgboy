var Archive = Backbone.Collection.extend({
    storeName: "messages",
    model: Message,

	mark_all_as_read: function() {
		_.each(this, function(item, index) {
			model = this.at(index);
			if(model) {
				model.set({"read": false});
				model.save();
			}
		}, this)
	},
	
	delete_all: function() {
		_.each(this, function(item, index) {
			model = this.at(index);
			if(model) {
				model.destroy();
			}
		}, this);
	},
	
})
