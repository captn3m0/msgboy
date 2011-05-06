var Archive = Backbone.Collection.extend({
    storeName: "messages",
	database: msgboyDatabase,
    model: Message,

	mark_all_as_read: function() {
		_.each(this, function(item, index) {
			model = this.at(index);
			if(model) {
				model.save({
					read_at: new Date().getTime(),
					unread_at: 0
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
