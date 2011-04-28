// Typepad
Plugins.register(new function() {

	this.name = 'Typepad', // Name for this plugin. The user will be asked which plugins he wants to use.

	this.onSubscriptionPage = function() {
		return (window.location.host == "www.typepad.com" && window.location.pathname == '/services/toolbar')
	},

	this.hijack = function(callback) {
		$("#follow-display").click(function() {
			chrome.extension.sendRequest({
				subscribe: {
					title: $.trim($($("#unfollow-display a")[0]).html()) + " on Typepad",
					url : $($("#unfollow-display a")[0]).attr("href") + "/activity/atom.xml"
				}
			}, function(response) {
				// Done
			});
			return false;
		})
	}

	this.importSubscriptions = function() {
		// This methods import subscription from the specific website for this plugin.
		alert("Sorry we cannot import subscriptions from Typepad at this moment.")
	}

	this.isUsing = function(callback) {
		var that = this;
		$.get("http://www.typepad.com/dashboard", function(data) {
			menu = $(data).find(".logged-in-msg")
			if(menu.length === 0) {
				callback(false);
			}
			else {
				callback(true);
			}
		});
	},

});