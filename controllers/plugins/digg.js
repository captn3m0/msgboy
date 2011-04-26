// Digg
Plugins.register(new function() {

	this.name = 'Digg', // Name for this plugin. The user will be asked which plugins he wants to use.

	this.onSubscriptionPage = function() {
		// This method returns true if the plugin needs to be applied on this page.
		return (window.location.host == "digg.com")
	},

	this.hijack = function(callback) {
		// This methods hijacks the susbcription action on the specific website for this plugin.
		$(".btn-follow").live('click', function(event) {
			url = $(event.target).attr("href");
			login =  url.split("/")[1]
			action = url.split("/")[2]
			switch(action) {
				case "follow":
				chrome.extension.sendRequest({
					subscribe: {
						url: "http://digg.com/" + login + ".rss",
						title: login + " on Digg"
					}
				}, function(response) {
					//
				});
				break;
				case "unfollow":
				chrome.extension.sendRequest({unsubscribe:"http://digg.com/" + login + ".rss"}, function(response) {
				});
				break;
				default:
			}
		});  
	},

	this.importSubscriptions = function() {
		alert("Sorry, we cannot import your Digg subscriptions at the moment, but when you start following someone now, it will be added to Msgboy.")
	},
	
	
	this.isUsing = function(callback) {
		var that = this;
		$.get("http://digg.com/", function(data) {
			if($(data).find(".current-user").length === 0) {
				callback(false);
			}
			else {
				callback(true);
			}
		});
	}
});