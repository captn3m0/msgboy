Plugins.register(new function() {

	this.name = 'Github Repositories',

	this.onSubscriptionPage = function() {
		// This method returns true if the plugin needs to be applied on this page.
		return (window.location.host == "github.com")
	},

	this.hijack = function(callback) {
		// This methods hijacks the susbcription action on the specific website for this plugin.
		$(".btn-watch").live('click', function(event) {
			url = 'https://github.com/' + $(event.target).parent().attr("href").replace("toggle_watch", "/commits/master.atom");
			action = $(event.target).text();
			switch(action) {
				case "Watch":
				chrome.extension.sendRequest({
					subscribe:{
						url: url,
						title: document.title
					}
				}, function(response) {
					// Done
				});
				break;
				case "Unwatch":
				chrome.extension.sendRequest({unsubscribe:action}, function(response) {
				});
				break;
				default:
			}
		});  
	},

	this.importSubscriptions = function() {
		$.get("http://github.com/", function(data) {
			content = $(data);
			avatarname = content.find(".avatarname")
			if (avatarname.length == 0) {
				alert("Make sure you're logged in to Github to import all existing susbcriptions...")
			}
			else {
				// There should be just one anyway.
				$.get(avatarname[0].children[0].href + "/following", function(data) {
					content = $(data);
					// Let's now import them all.
					content.find(".repo_list .source a").each(function(){
						chrome.extension.sendRequest({
							subscribe: {
								url: this.href+"/commits/master.atom",
								title: this.title
							}
						}, function(response) {
							// Done
						});
					});
				})
			}
		});	
	},
	
	this.isUsing = function(callback) {
		var that = this;
		$.get("https://github.com/", function(data) {
			if($(data).find(".userbox").length === 0) {
				callback(false);
			}
			else {
				callback(true);
			}
		});
	}
	
});