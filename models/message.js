var Message = Backbone.Model.extend({
	storeName: "messages",
	database: msgboyDatabase,

	defaults: {
		"title":        null,
		"atom_id":      null,
		"summary":      null,
		"content":      null,
		"links":        {},
		"read_at":      0,
		"unread_at":    0,
		"starred_at":   0,
		"created_at": 	null
	},

	toggle_read: function(callback) {
		callback = typeof(callback) != 'undefined' ? callback : function() {};
		var _read_at = 0
		var _unread_at = 0
		
		if(this.attributes.unread_at || !this.attributes.read_at) {
			_read_at = new Date().getTime();
		}
		else {
			_unread_at = new Date().getTime();
		}

		this.save({
			read_at: _read_at,
			unread_at: _unread_at
		}, {
			success: function() {
				callback(true)
			},
			error: function() {
				callback(false)
			}
		});

	},
	
	mark_as_read: function(callback) {
		callback = typeof(callback) != 'undefined' ? callback : function() {};
		this.save({
			read_at: new Date().getTime(),
			unread_at: 0
		}, {
			success: function() {
				callback(true)
			},
			error: function() {
				callback(false)
			}
		});
	},


	toggle_starred: function(callback) {
		callback = typeof(callback) != 'undefined' ? callback : function() {};
		var _starred_at = 0
		if(this.attributes.starred_at) {
			_starred_at = new Date().getTime();
		}

		this.save({
			starred_at: _starred_at
		}, {
			success: function() {
				callback(true)
			},
			error: function() {
				callback(false)
			}
		});
	},

});

