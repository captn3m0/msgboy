// Typepad
Plugins.register(new function() {

	this.name = 'Quora People', 

	this.onSubscriptionPage = function() {
		return (window.location.host == "www.quora.com")
	},

	this.hijack = function(callback) {
		$(".follow_button").not(".unfollow_button").not(".topic_follow").click(function(event) {
			if($.trim($(event.target).html()) == "Follow Question") {
				// Looks like Questions don't have RSS feeds just yet.
			}
			else {
				// This is must a button on a user's page. Which we want to follow
				chrome.extension.sendRequest({
					subscribe: {
						title: document.title,
						url : window.location.href + "/rss"
					}
				}, function(response) {
					// Done
				});
			}
		});
	},

	this.listSubscriptions = function(callback) {
        callback([]); // We're not able to list all subscriptions
    },

	this.isUsing = function(callback) {
		var that = this;
		req = $.get("http://www.quora.com/inbox", function(data) {
			menu = $(data).find(".signup")
			if(menu.length === 0) {
				callback(true);
			}
			else {
				callback(false);
			}
		});
	}

});