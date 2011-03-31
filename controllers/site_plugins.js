var Plugins = new function() {
	this.all = [],

	this.register = function(plugin) {
		this.all.push(plugin);
	}
}

var Plugin = new function() {

	this.name = '', // Name for this plugin. The user will be asked which plugins he wants to use.

	this.onSubscriptionPage = function() {
		// This method returns true if the plugin needs to be applied on this page.
	},

	this.importSubscriptions = function() {
		// This methods import subscription from the specific website for this plugin.
		alert("Importing")
	}
}

// Tumblr
Plugins.register(new function() {

	this.name = 'Tumblr', // Name for this plugin. The user will be asked which plugins he wants to use.

	this.onSubscriptionPage = function() {
		return (window.location.host == "www.tumblr.com" && window.location.pathname == '/dashboard/iframe')
	},

	this.hijack = function(callback) {
		$('form[action|="/follow"]').submit(function() {
			chrome.extension.sendRequest({subscribe: "http://" + $('form[action|="/follow"] input[name="id"]').val() + ".tumblr.com/rss"}, function(response) {
			});
		});
	}

	this.importSubscriptionsPage = function(page, retries) {
		var that = this;
		$.get("http://www.tumblr.com/following/page/" + page, function(data) {
			content = $(data);
			if(content.find("h1")[0] && $(content.find("h1")[0]).text().match(/Following [0-9]* people/)) {
				links = content.find(".follower .name a")
				links.each(function(index, link) {
					chrome.extension.sendRequest({subscribe: $(link).attr("href") + "rss"}, function(response) {
					});
				});
				if(links.length > 0) {
					that.importSubscriptionsPage(page+1, 0);
				}
			} 
			else if(retries < 3) {
				// Retry!
				that.importSubscriptionsPage(page, retries+1)
			}
			else {
				alert("We couldn't get your data out of Tumblr...")
			}
		})
	}

	this.importSubscriptions = function() {
		// This methods import subscription from the specific website for this plugin.
		this.importSubscriptionsPage(1, 0)
	}
});

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
			chrome.extension.sendRequest({subscribe: $("#quickadd").val()}, function(response) {
			});
		}
		$("#quick-add-form .goog-button-body").click(submitted)
		$("#quick-add-form").submit(submitted);
	},

	this.importSubscriptions = function() {
		links = [];
		request = new XMLHttpRequest();
		request.open("GET", "http://www.google.com/reader/subscriptions/export", true);
		request.onreadystatechange = function() {
			if (request.readyState == 4) {
				urls = $(request.responseXML).find("outline").each(function() {
					chrome.extension.sendRequest({subscribe: $(this).attr("xmlUrl")}, function(response) {
					});
				});
			}
		};
		request.send();
	}
});


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
				chrome.extension.sendRequest({subscribe:"http://digg.com/" + login + ".rss"}, function(response) {
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
		alert("Sorry, we cannot import your digg subscriptions at the moment, but new subscriptions will be added.")
	}
});

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
				chrome.extension.sendRequest({subscribe:url}, function(response) {
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
						chrome.extension.sendRequest({subscribe:this.href+"/commits/master.atom"}, function(response) {
						});
					});
				})
			}
		});	
	}
});

Plugins.register(new function() {

	this.name = 'Github Users',

	this.onSubscriptionPage = function() {
		// This method returns true if the plugin needs to be applied on this page.
		return (window.location.host == "github.com")
	},

	this.hijack = function(callback) {
		// This methods hijacks the susbcription action on the specific website for this plugin.
		$("a.btn-follow").live('click', function(event) {
			url = 'https://github.com/' + $(event.target).attr("data-user") + ".atom";
			chrome.extension.sendRequest({subscribe:url}, function(response) {
			});
		});
		$("a.btn-unfollow").live('click', function(event) {
			url = 'https://github.com/' + $(event.target).attr("data-user") + ".atom";
			chrome.extension.sendRequest({unsubscribe:url}, function(response) {
			});
		});
		
	},
	
	this.importSubscriptionsPage = function(page) {
		var that = this;
		$.get(avatarname[0].children[0].href + "/following?page=" + page, function(data) {
			content = $(data);
			links = content.find("#watchers li a.follow")
			links.each(function() {
				url = 'https://github.com/' + $(this).attr("data-user") + ".atom";
				chrome.extension.sendRequest({subscribe:url}, function(response) {
				});
			});
			if(links.length > 0) {
				that.importSubscriptionsPage(page+1);
			}	
		});
	},

	this.importSubscriptions = function() {
		var that = this;
		$.get("http://github.com/", function(data) {
			content = $(data);
			avatarname = content.find(".avatarname")
			if (avatarname.length == 0) {
				alert("Make sure you're logged in to Github to import all existing susbcriptions...")
			}
			else {
				// There should be just one anyway.
				that.importSubscriptionsPage(1);
			}
		});	
	}
	
});
