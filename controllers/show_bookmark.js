(function(){
	
	// The actions.
	var actions = {
	    follow: {
	        name: "Follow",
			show: true,
	        callback: function () {
	            extractFeedLinks(function (links) {
	                switch (links.length) {
	                case 0:
	                    $("<div>", {
	                        id: "msgboy-bookmark-dialog"
	                    }).appendTo("body");
	                    $("<h4>", {
	                        text: "Sorry, there is nothing to subscribe to on this page, but you can type a feed url below :"
	                    }).appendTo($("#msgboy-bookmark-dialog"));
	                    var maskHeight = $(document).height();
	                    var maskWidth = $(window).width();
	                    //Get the window height and width
	                    var winH = $(window).height();
	                    var winW = $(window).width();
	                    //Set the popup window to center
	                    $("#msgboy-bookmark-dialog").height(winH);
	                    $("#msgboy-bookmark-dialog").css('top', winH / 2 - $("#msgboy-bookmark-dialog").height() / 4);
	                    $("#msgboy-bookmark-dialog").css('left', winW / 2 - $("#msgboy-bookmark-dialog").width() / 2);
	                    $("<form>", {
	                        id: "msgboy-bookmark-form",
	                        submit: function () {
	                            url = $("#msgboy-feed-url").val();
	                            chrome.extension.sendRequest({
	                                subscribe: {
	                                    url: url,
	                                    title: url
	                                }
	                            }, function (response) {
	                                $("#msgboy-bookmark-dialog").remove();
	                            });
	                            return false;
	                        }
	                    }).appendTo($("#msgboy-bookmark-dialog"));
	                    $("<input>", {
	                        type: "text",
	                        name: "feed-url",
	                        id: "msgboy-feed-url",
	                        size: "72"
	                    }).appendTo($("#msgboy-bookmark-form"));
	                    $("<input>", {
	                        type: "submit"
	                    }).appendTo($("#msgboy-bookmark-form"));
	                    $("<a>", {
	                        text: "close",
	                        click: function () {
	                            $("#msgboy-bookmark-dialog").remove();
	                        }
	                    }).appendTo($("#msgboy-bookmark-dialog"));
	                    break;
	                case 1:
	                    chrome.extension.sendRequest({
	                        subscribe: {
	                            url: links[0].href,
	                            title: links[0].title || document.title
	                        }
	                    }, function (response) {});
	                    break;
	                default:
	                    $("<div>", {
	                        id: "msgboy-bookmark-dialog"
	                    }).appendTo("body");
	                    $("<h4>", {
	                        text: "Please chose which resource you want to subscribe to"
	                    }).appendTo($("#msgboy-bookmark-dialog"));
	                    var maskHeight = $(document).height();
	                    var maskWidth = $(window).width();
	                    //Get the window height and width
	                    var winH = $(window).height();
	                    var winW = $(window).width();
	                    //Set the popup window to center
	                    $("#msgboy-bookmark-dialog").css('top', winH / 2 - $("#msgboy-bookmark-dialog").height() / 2);
	                    $("#msgboy-bookmark-dialog").css('left', winW / 2 - $("#msgboy-bookmark-dialog").width() / 2);
	                    $("<ul>", {
	                        id: "link-list"
	                    }).appendTo($("#msgboy-bookmark-dialog"));
	                    $.each(links, function (count, link) {
	                        $("#link-list").append(
	                        $("<li>", {
	                            text: link.title || link.href,
	                            click: function () {
	                                this.style.color = "#E6E6E6";
	                                chrome.extension.sendRequest({
	                                    subscribe: {
	                                        url: link.href,
	                                        title: document.title
	                                    }
	                                }, function (response) {});
	                            }
	                        }))
	                    })
	                    $("<a>", {
	                        text: "close",
	                        click: function () {
	                            $("#msgboy-bookmark-dialog").remove();
	                        }
	                    }).appendTo($("#msgboy-bookmark-dialog"));
	                    break;
	                }
	            });
	        }
	    },
	    inbox: {
	        name: "Inbox",
			show: true,
	        callback: function () {
	            chrome.extension.sendRequest({
	                "tab": {
	                    url: chrome.extension.getURL('/views/html/inbox.html'),
	                    selected: true
	                }
	            }, function (response) {});
	        }
	    },
		options: {
			name: "Options",
			show: false,
			callback: function() {
	            chrome.extension.sendRequest({
	                "tab": {
	                    url: chrome.extension.getURL('/views/html/options.html'),
	                    selected: true
	                }
	            }, function (response) {});
			}
		},
		open: {
			name: "Open",
			show: false,
			callback: function() {
	            chrome.extension.sendRequest({
	                "open": {
	                    selected: true
	                }
	            }, function (response) {});
			}
		},
	    connectionStatus: {
	        name: "",
			show: true,
	        callback: function () {
	            chrome.extension.sendRequest({
	                connect: true
	            }, function (response) {});
	            return false;
	        }
	    }
	};
	
	function listenToConnectionStatus() {
		port = chrome.extension.connect({
			name: "connection"
		})
		port.onMessage.addListener(function (msg) {
			$('#connectionStatus').text(msg);
		});
		port.onDisconnect.addListener(function () {
			setTimeout(function () {
				listenToConnectionStatus(); // We reconnect.
	        }, 3000);

		});
	}

	function showBookmark() {
		if($("#msgboy-bookmark").length == 0) {
			// Gets the bookmarkPosition
			chrome.extension.sendRequest({
				"settings": {
					"get": ["bookmarkPosition"]
				}
			}, function (response) {
				$(document).ready(function() {
					// Add the bookmark now.
					$("<ul>", {
						id: "msgboy-bookmark"
					}).appendTo("body");
					var left = Math.min(Math.max(parseInt(response.value), 0), $(window).width() - 100); // 100 is the size of the bookmark!
					$("#msgboy-bookmark").css("left", left);

					// Add each of the actions in the bookmark
					for (var id in actions) {
						var action = actions[id];
						if(action.show) {
							$("#msgboy-bookmark").append(
							$("<li>", {
								id: id,
								text: action.name,
								class: 'action',
								click: action.callback
							}))							
						}
					}

					// Makes sure we will listen to connection updates
					listenToConnectionStatus();

					// Called when the bookmark has been moved.
					$("#msgboy-bookmark").bind('drag', function (ev, dd) {
						$(this).css({
							left: dd.offsetX
						});
					});

					// Dragging is over.
					$("#msgboy-bookmark").bind('dragend', function (ev, dd) {
						chrome.extension.sendRequest({
							"settings": {
								"set": ["bookmarkPosition", parseInt(dd.offsetX)]
							}
						}, function (response) {});
					});

					var unread = 0;
					// Show unread count
					chrome.extension.sendRequest({
						"unreadCount": true
					}, function (response) {
						unread = parseInt(response.value)
						$("#msgboy-bookmark #inbox").text("Inbox (" + unread + ")")
					});
				})
			});
		}
	}

	function showIcon() {
		$(document).ready(function() {
			$("<img>", {
				id: "msgboy-icon",
				src: chrome.extension.getURL('/views/icons/icon16-grey.png'),
			}).appendTo("body");
		});
	}
	
	chrome.extension.sendRequest({
		"settings": {
			"get": ["hide-bookmark"]
		}
	}, function (response) {
		if(!response.value) {
			showBookmark();
		} else {
			showIcon();
		}
	});
	
	
	// Listen to Keyboard events...
	var string = ""
	var keystrokeTimeout = null
	$(document).keypress(function(event) {
		string +=  String.fromCharCode(event.keyCode);
		switch(string) {
		case "$$f" :
			// follow
			actions["follow"].callback()
			$("#msgboy-icon").css("opacity", "0.50");
			$("#msgboy-icon").attr("src", chrome.extension.getURL('/views/icons/icon16-grey.png'));
			string = ""
		break;
		case "$$i":
			// inbox
			actions["inbox"].callback()
			$("#msgboy-icon").css("opacity", "0.50");
			$("#msgboy-icon").attr("src", chrome.extension.getURL('/views/icons/icon16-grey.png'));
			string = ""
		break;
		case "$$u":
			// inbox (like gmail)
			actions["inbox"].callback()
			$("#msgboy-icon").css("opacity", "0.50");
			$("#msgboy-icon").attr("src", chrome.extension.getURL('/views/icons/icon16-grey.png'));
			string = ""
		break;
		case "$$x":
			// settings 
			actions["options"].callback()
			$("#msgboy-icon").css("opacity", "0.50");
			$("#msgboy-icon").attr("src", chrome.extension.getURL('/views/icons/icon16-grey.png'));
			string = ""
		break;
		case "$$o":
			// Opens the current notification
			actions["open"].callback()
			$("#msgboy-icon").css("opacity", "0.50");
			$("#msgboy-icon").attr("src", chrome.extension.getURL('/views/icons/icon16-grey.png'));
			string = ""
		break;
		case "$$b":
			// show bookmark
			showBookmark();
			$("#msgboy-icon").css("opacity", "0.50");
			$("#msgboy-icon").attr("src", chrome.extension.getURL('/views/icons/icon16-grey.png'));
			string = ""
		break;
		default:
			if(string != "$" && string != "$$") {
				$("#msgboy-icon").css("opacity", "0.50");
				$("#msgboy-icon").attr("src", chrome.extension.getURL('/views/icons/icon16-grey.png'));
				string = ""
			}
			else if(string == "$") {
				// Light up the icon a bit
				$("#msgboy-icon").css("opacity", "1.00")
			}
			else if(string == "$$") {
				// Light up the icon a lot!
				$("#msgboy-icon").attr("src", chrome.extension.getURL('/views/icons/icon16.png'))
			}
		}
		if(keystrokeTimeout) {
			clearTimeout(keystrokeTimeout);
		}
		keystrokeTimeout = setTimeout(function() {
			$("#msgboy-icon").css("opacity", "0.50");
			$("#msgboy-icon").attr("src", chrome.extension.getURL('/views/icons/icon16-grey.png'));
			string = ""
		}, 3000)
	})
	
})();
