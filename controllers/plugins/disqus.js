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
	
	this.listSubscriptions = function(callback) {
        callback([]); // We're not able to list all subscriptions
    },
	
	this.isUsing = function(callback) {
		callback(false) // By default we won't show
	}
	
});
