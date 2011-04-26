// This is the plugin for status.net.
Plugins.register(new function() {

	this.name = 'Status.net', // Name for this plugin. The user will be asked which plugins he wants to use.

	this.onSubscriptionPage = function() {
		// This method needs to returns true if the plugin needs to be applied on this page.
		return (window.location.host.match(/status\.net/));
	},

	this.importSubscriptions = function() {
		// This methods will implements how all the subscriptions from the specific website for this plugin can be imported
		url = prompt("Please enter the URL of your Status.net, make sure you're logged in.")
		var that = this;
		if(!url.match(/^http:\/\//)) {
			url = "http://" + url 
		}
		$.get(url + "/subscriptions", function(data) {
			$.each($(data).find('.entity_profile a.url[rel="contact"]'), function(index, element) {
				chrome.extension.sendRequest({
					subscribe: {
						title: $.trim($(element).text()) + " on Status.net",
						url : $(element).attr("href") + "/api/statuses/user_timeline/1.atom"
					}
				}, function(response) {
					// Done
				});
				
			});
		});
		
	},
	
	this.hijack = function() {
		// This method will add a callback that hijack a website subscription (or follow, or equivalent) so that msgboy also mirrors this subscription.
		$('#form_ostatus_connect').live("submit", function() {
			user = $($(this).find("#nickname")[0]).attr("value")
			url = "http://" + parseUri(window.location).host + "/api/statuses/user_timeline/1.atom"
			chrome.extension.sendRequest({
				subscribe: {
					title: user + " on Status.net",
					url : url
				}
			}, function(response) {
				// Done
			});
		});
	},
	
	this.isUsing = function(callback) {
		// This method calls back if the user is a logged-in user of the service for this plugin.
		callback(true);
	}
});