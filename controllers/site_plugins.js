var Plugins = new function() {
	this.all = [],

	this.register = function(plugin) {
		this.all.push(plugin);
	}
}

// This is the skeleton for the Plugins
var Plugin = new function() {

	this.name = '', // Name for this plugin. The user will be asked which plugins he wants to use.

	this.onSubscriptionPage = function() {
		// This method needs to returns true if the plugin needs to be applied on this page.
	},
	
	this.listSubscriptions = function(callback) {
	    // This methods will callback with all the subscriptions in this service. It can call the callback several times with more feeds.
	    // Feeds have the following form {href: _, title: _}.
        callback([]); 
    },
	
	this.hijack = function() {
		// This method will add a callback that hijack a website subscription (or follow, or equivalent) so that msgboy also mirrors this subscription.
	},
	
	this.isUsing = function(callback) {
		// This method calls back with true if the user is a logged-in user of the service for this plugin. It callsback with false otherwise.
		// callback(true)
	}
}