var Archive = Backbone.Collection.extend({
    storeName: "messages",
	database: msgboyDatabase,
    model: Message,

	mark_all_as_read: function() {
		_.each(this, function(item, index) {
			model = this.at(index);
			if(model) {
				model.save({
					read_at: new Date().getTime()
				});
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
