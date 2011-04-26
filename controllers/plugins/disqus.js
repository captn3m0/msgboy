Plugins.register(new function() {

	this.name = 'Disqus Comments',

	this.onSubscriptionPage = function() {
		// This method returns true if the plugin needs to be applied on this page.
		return (document.getElementById("disqus_thread") != null)
	},

	this.hijack = function(callback) {
		$("#dsq-post-button").live('click', function(event) {
			chrome.extension.sendRequest({
				subscribe: {
					url: $(".dsq-subscribe-rss a").attr("href"),
					title: document.title
				}
			}, function(response) {
				// Done
			});
		});
	},
	
	this.importSubscriptions = function() {
		alert("Sorry, we cannot import your current disqus threads, but when you will post answers to new threads, you will be subscribed to those.")
	},
	
	this.isUsing = function(callback) {
		callback(true)
	}
	
});
