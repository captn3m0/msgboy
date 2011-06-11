// Tumblr
Plugins.register(new function() {

	this.name = 'Posterous', // Name for this plugin. The user will be asked which plugins he wants to use.
	this.hijacked = false;

	this.onSubscriptionPage = function() {
		return ($('meta[name=generator]').attr("content") === "Posterous" || window.location.host.match(/posterous.com$/));
	},

	this.hijack = function(callback) {
		$('#posterous_required_header').hover(function(event) {
			if(!this.hijacked) {
				this.hijacked = true;
				$('#posterous_bar_subscribe').click(function() {
					chrome.extension.sendRequest({
						subscribe: {
							title: document.title,
							url : window.location.href + "/rss.xml"
						}
					}, function(response) {
						// Done
					});
				})
			}
		}, function() {
		});
		
		$('#posterous_bar').hover(function(event) {
			if(!this.hijacked) {
				this.hijacked = true;
				$('#posterous_bar_subscribe').click(function() {
					chrome.extension.sendRequest({
						subscribe: {
							title: document.title,
							url : window.location.href + "/rss.xml"
						}
					}, function(response) {
						// Done
					});
				})
			}
		}, function() {
		});

		$("#subscribe_link").click(function() {
			chrome.extension.sendRequest({
				subscribe: {
					title: document.title,
					url : window.location.href + "/rss.xml"
				}
			}, function(response) {
				// Done
			});
		});
		
		$("#psub_unsubscribed_link").click(function() {
			chrome.extension.sendRequest({
				subscribe: {
					title: document.title,
					url : window.location.href + "/rss.xml"
				}
			}, function(response) {
				// Done
			});
		});
		
		$(".subscribe_ajax a.unsubscribed").click(function(event) {
			parent = $($($($(event.target).parent()).parent()).parent().find(".profile_sub_site a")[0]);
			chrome.extension.sendRequest({
				subscribe: {
					title: $.trim(parent.html()),
					url : parent.attr("href") + "/rss.xml"
				}
			}, function(response) {
				// Done
			});
		});
	},

	this.isUsing = function(callback) {
		var that = this;
		$.get("http://www.posterous.com/", function(data) {
			menu = $(data).find("#topnav")
			if(menu.length === 0) {
				callback(false);
			}
			else {
				callback(true);
			}
		});
	},
	
	this.listSubscriptions = function(callback) {
        callback([]); // We're not able to list all subscriptions
        this.listSubscriptionsPage(1, [], callback);
    },
	
	this.listSubscriptionsPage = function(page, subscriptions, callback) {
		var that = this;
		$.get("http://posterous.com/users/me/subscriptions?page=" + page, function(data) {
			content = $(data);
			links = content.find("#subscriptions td.image a")
			links.each(function(index, link) {
			    subscriptions.push({
			        href: $(link).attr("href") + "/rss.xml",
			        title: $(link).attr("title")
			    });
			});
			if(links.empty > 0) {
				listSubscriptionsPage(page + 1, subscriptions, callback);
			}
			else {
			    callback(subscriptions);
			}
		})
	}
	
});