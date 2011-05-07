var Archive = Backbone.Collection.extend({
    storeName: "messages",
	database: msgboyDatabase,
    model: Message,

	mark_all_as_read: function(opts) {
		opts = typeof(opts) != 'undefined' ? opts : {};
		s = opts.start || 0
		this.fetch({
			conditions: {unread_at: [s, s + 60000]},
			success: function() {
				console.log(this.length)
				_.each(this.models, function(item, index) {
					console.log(item)
					if(item) {
						item.save({
							read_at: new Date().getTime(),
							unread_at: 0
						});
					}
				}, this)
				this.mark_all_as_read({'start': s + 60000, 'done': opts.done})
				console.log("DONE")
			}.bind(this)
		})
		// 
		// _.each(this, function(item, index) {
		// 	model = this.at(index);
		// 	if(model) {
		// 		model.save({
		// 			read_at: new Date().getTime(),
		// 			unread_at: 0
		// 		});
		// 	}
		// }, this)
		// 
		
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
