// Tumblr
Plugins.register(new function() {

	this.name = 'Tumblr', // Name for this plugin. The user will be asked which plugins he wants to use.

	this.onSubscriptionPage = function() {
		return (window.location.host == "www.tumblr.com" && window.location.pathname == '/dashboard/iframe')
	},

	this.hijack = function(follow, unfollow) {
		$('form[action|="/follow"]').submit(function(event) {
		    follow({
				title: $('form[action|="/follow"] input[name="id"]').val() + " on Tumblr",
				url: "http://" + $('form[action|="/follow"] input[name="id"]').val() + ".tumblr.com/rss"
		    }, function() {
		        // Done
		    });
		});
	}

	
	this.listSubscriptions = function(callback) {
		this.listSubscriptionsPage(1, [], callback);
    },

	this.isUsing = function(callback) {
		var that = this;
		$.get("http://www.tumblr.com/", function(data) {
			menu = $(data).find("#logout_button")
			if(menu.length === 0) {
				callback(false);
			}
			else {
				callback(true);
			}
		});
	},
	
	this.listSubscriptionsPage = function(page, subscriptions, callback) {
	    var that = this;
		$.get("http://www.tumblr.com/following/page/" + page, function(data) {
			content = $(data);
		    
			if(content.find("h1")[0] && $(content.find("h1")[0]).text().match(/Following [0-9]* people/)) {
				links = content.find(".follower .name a")
				links.each(function(index, link) {
				    subscriptions.push({
				        url: $(link).attr("href") + "rss",
				        title:  $(link).html() + " on Tumblr"
				    })
				});
				if(links.length > 0) {
					that.listSubscriptionsPage(page+1, subscriptions, callback);
				}
				else {
				    callback(subscriptions);
				}
			} 
			else {
			    callback([]);
				console.log("We couldn't get your data out of Tumblr...");
			}
		})
		
	}
	
});