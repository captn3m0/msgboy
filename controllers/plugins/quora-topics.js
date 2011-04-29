// Typepad
Plugins.register(new function() {

	this.name = 'Quora Topics', 

	this.onSubscriptionPage = function() {
		return (window.location.host == "www.quora.com")
	},

	this.hijack = function(callback) {
		$(".topic_follow.follow_button").not(".unfollow_button").click(function(event) {
			url = ""
			title = ""
			if($(event.target).parent().parent().find(".topic_name").length > 0) {
				link = $(event.target).parent().parent().find(".topic_name")[0];
				url = "http://www.quora.com" + ($(link).attr("href")) + "/rss";
				title = $($(link).children()[0]).html() + " on Quora";
			}
			else {
				title = document.title;
				url = window.location.href + "/rss";
			}
			chrome.extension.sendRequest({
				subscribe: {
					title: title,
					url : url
				}
			}, function(response) {
				// Done
			});	
		});
	},

	this.importSubscriptions = function() {
		alert("Sorry, we cannot import your Quora subscriptions at this point, but new subscriptions will be automatically added.")
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