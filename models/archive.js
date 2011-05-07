var Archive = Backbone.Collection.extend({
    storeName: "messages",
	database: msgboyDatabase,
    model: Message,

	mark_all_as_read: function(opts) {
		opts = typeof(opts) != 'undefined' ? opts : {};
		opts.lower = opts.lower || 1
		opts.step = opts.step || 60000
		opts.callback = opts.callback || function() {}
		opts.epoch = opts.epoch || 1304200800000
		
		if(new Date().getTime() - opts.lower > opts.epoch) {
			this.fetch_more("unread_at", opts.lower, opts.step, function() {
				if(this.models.length > 0) {
					this.models[0].mark_as_read(function() {
						this.mark_all_as_read(opts)
					}.bind(this));
				}
				else {
					opts.lower = opts.lower + opts.step
					this.mark_all_as_read(opts);
				}
			}.bind(this))
		} else {
			opts.callback()
		}
	},
	
	delete_all: function(opts) {
		opts = typeof(opts) != 'undefined' ? opts : {};
		opts.lower = opts.lower || 1
		opts.step = opts.step || 60000
		opts.callback = opts.callback || function() {}
		opts.epoch = opts.epoch || 1304200800000
		
		if(new Date().getTime() - opts.lower > opts.epoch) {
			this.fetch_more("created_at", opts.lower, opts.step, function() {
				if(this.models.length > 0) {
					this.models[0].destroy({
						success: function() {
							this.delete_all(opts)
						}.bind(this), 
						error: function() {
							// Couldn't delete. Let's continue. It will retry.
							this.delete_all(opts)
						}.bind(this)
					});
				}
				else {
					opts.lower = opts.lower + opts.step
					this.delete_all(opts);
				}
			}.bind(this))
		} else {
			opts.callback()
		}
	},
	
	fetch_more: function(filter, lower, step, done) {
		var conds = {}
		conds[filter] = [new Date().getTime() - lower, new Date().getTime() - lower - step]
		this.fetch({
			conditions: conds,
			success: function() {
				done();
			}.bind(this),
			error: function() {
				done();
			}
		});	
	}
	
	
})
