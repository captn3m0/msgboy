// Tumblr
Plugins.register(new function() {

	this.name = 'Tumblr', // Name for this plugin. The user will be asked which plugins he wants to use.

	this.onSubscriptionPage = function() {
		return (window.location.host == "www.tumblr.com" && window.location.pathname == '/dashboard/iframe')
	},

	this.hijack = function(callback) {
		$('form[action|="/follow"]').submit(function() {
			chrome.extension.sendRequest({
				subscribe: {
					title: $('form[action|="/follow"] input[name="id"]').val() + " on Tumblr",
					url : "http://" + $('form[action|="/follow"] input[name="id"]').val() + ".tumblr.com/rss"
				}
			}, function(response) {
				// Done
			});
		});
	}

	this.importSubscriptions = function() {
		// This methods import subscription from the specific website for this plugin.
		this.importSubscriptionsPage(1, 0)
	}

	this.isUsing = function(callback) {
		var that = this;
		$.get("http://www.tumblr.com/", function(data) {
			menu = $(data).find("#account_menu")
			if(menu.length === 0) {
				callback(false);
			}
			else {
				callback(true);
			}
		});
	},

	// Custom methods :
	this.importSubscriptionsPage = function(page, retries) {
		var that = this;
		$.get("http://www.tumblr.com/following/page/" + page, function(data) {
			content = $(data);
			if(content.find("h1")[0] && $(content.find("h1")[0]).text().match(/Following [0-9]* people/)) {
				links = content.find(".follower .name a")
				links.each(function(index, link) {
					chrome.extension.sendRequest({
						subscribe: {
							url: $(link).attr("href") + "rss",
							title: $(link).html() + " on Tumblr"
						}
					}, function(response) {
						// Done
					});
				});
				if(links.length > 0) {
					that.importSubscriptionsPage(page+1, 0);
				}
			} 
			else if(retries < 3) {
				// Retry!
				that.importSubscriptionsPage(page, retries+1)
			}
			else {
				alert("We couldn't get your data out of Tumblr...")
			}
		})
	}
});