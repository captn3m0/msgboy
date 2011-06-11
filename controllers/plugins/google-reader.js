// Google Reader
Plugins.register(new function() {

	this.name = 'Google Reader', // Name for this plugin. The user will be asked which plugins he wants to use.

	this.onSubscriptionPage = function() {
		// This method returns true if the plugin needs to be applied on this page.
		return (window.location.host == "www.google.com" && window.location.pathname == '/reader/view/')
	},

	this.hijack = function(callback) {
		// This methods hijacks the susbcription action on the specific website for this plugin.
		var submitted = function() {
			chrome.extension.sendRequest({
				subscribe: {
					url: $("#quickadd").val(),
					title: $("#quickadd").val()
				}
			}, function(response) {
			});
		}
		$("#quick-add-form .goog-button-body").click(submitted)
		$("#quick-add-form").submit(submitted);
	},
		
	this.listSubscriptions = function(callback) {
	    links = [];
		request = new XMLHttpRequest();
		request.open("GET", "http://www.google.com/reader/subscriptions/export", true);
		request.onreadystatechange = function() {
		    var subscriptions = [];
			if (request.readyState == 4) {
				urls = $(request.responseXML).find("outline").each(function() {
					subscriptions.push({
					    href:  $(this).attr("xmlUrl"),
					    title:$(this).attr("title")
					})
				});
			}
			callback(subscriptions);
		};
		request.send();
    },
	
	this.isUsing = function(callback) {
		var that = this;
		$.get("http://www.google.com/reader/view/", function(data) {
			if($(data).find(".loginBox").length === 0) {
				callback(true);
			}
			else {
				callback(false);
			}
		});
	}
	
});
