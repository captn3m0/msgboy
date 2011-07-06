(function(){

    // Colors the inbox bookmark based on the %age of unread stories compared to the max unread.
    function recolor(unread) {
        var r = 255;
        var g = 255;
        var b = 0;
        if(unread > 0.5) {
            r = 255;
            g = parseInt((255 - unread * 255)*2);
        }
        else {
            g = 255;
            r = parseInt(255 - ((1-unread) * 255)) + 128
        }
        b = parseInt(0);
        return([r,g,b]);
    };

    // hides the modal box
    function hideModalBox() {
        $('#msgboy-mask').fadeOut(400, function() {
            $("#msgboy-mask").remove();
        });    
        $('#msgboy-dialog').fadeOut(400, function() {
            $("#msgboy-dialog").remove();
        });
    }

	// shows the modal box for subscriptions
	function showModalBox(content) {
	    if($("#msgboy-dialog").length == 0) {
    	    // The mask
    	    $("<div>", {
    	        id: "msgboy-mask"
    	    }).appendTo("body");

    	    // The box
    	    $("<div>", {
                id: "msgboy-dialog",
            }).appendTo("body");

            // The close link
    	    $("<a>", {
                text: "close",
                id: "msgboy-dialog-close",
                click: function () {
                    hideModalBox();
                }
            }).appendTo($("#msgboy-dialog"));
            
            content.appendTo($("#msgboy-dialog"));
        } 
        $('#msgboy-mask').css({'width':$(window).width(),'height':$(document).height()});
        
        //transition effect     
        $('#msgboy-mask').fadeIn(400);    
     
        //Get the window height and width
        var winH = $(window).height();
        var winW = $(window).width();

        //Set the popup window to center
        $("#msgboy-dialog").css('top',  winH/3-$("#msgboy-dialog").height()/2);
        $("#msgboy-dialog").css('left', winW/2-$("#msgboy-dialog").width()/2);

        //transition effect
        $("#msgboy-dialog").fadeIn(400);
 
    }
	
    // Shows the full bookmark
	function showBookmark() {
		if($("#msgboy-bookmark").length == 0) {
			// Gets the bookmarkPosition
			chrome.extension.sendRequest({
				"settings": {
					"get": ["bookmarkPosition"]
				}
			}, function (response) {
				$(document).ready(function() {
				    MsgboyHelper.events.trigger("msgboy-bookmark-loaded");
					// Add the bookmark now.
					$("<div>", {
						id: "msgboy-bookmark"
					}).appendTo("body");
					var left = Math.min(Math.max(parseInt(response.value), 0), $(window).width() - 100); // 100 is the size of the bookmark!
					$("#msgboy-bookmark").css("left", left);

					// Add each of the actions in the bookmark
					for (var id in actions) {
						var action = actions[id];
						if(action.show) {
							$("#msgboy-bookmark").append(
							$("<span>", {
								id: id,
								text: action.name,
								class: 'action',
								click: action.callback
							}))							
						}
					}

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
				});
			});
		}
	}

    // shows the icon (usually if the bookmark is not displayed)
	function showIcon() {
		$(document).ready(function() {
			$("<img>", {
				id: "msgboy-icon",
				src: chrome.extension.getURL('/views/icons/icon16-grey.png'),
			}).appendTo("body");
			MsgboyHelper.events.trigger("msgboy-bookmark-loaded");
		});
	}
	
	// Subscribes to the feed url with the title. Callback on success.
	function followFeed(url, title, callback) {
	    chrome.extension.sendRequest({
            subscribe: {
                url: url,
                title: title
            }
        }, function (response) {
            MsgboyHelper.events.trigger("msgboy-subscribed", {url: url});
            callback()
        });
	}
	
	// Shows the bar
	function showBar(content, buttons) {
	    $("body").prepend($("<div>", {
            id: "msgboy-bar"
        }));
        var margin_top_offset = parseInt($("body").css("margin-top")) + 25 
        $("body").css("margin-top", margin_top_offset + "px");
        var margin_left_offset = -(parseInt($("body").css("margin-left")) + parseInt($("body").css("padding-left")));
        $("#msgboy-bar").css("margin-left", margin_left_offset + "px")
        var width = parseInt($("#msgboy-bar").css("width")); //+ margin_left_offset
        $("#msgboy-bar").css("width", width)
        $("<img>", {
            src: chrome.extension.getURL('/views/icons/icon48.png'),
        }).appendTo($("#msgboy-bar"));
        $("<span>", {
            id: "msgboy-bar-message",
            text: content
        }).appendTo($("#msgboy-bar"));
        
        $.each(buttons, function(index, button) {
            $("<span>", {
                id: button.id,
                class: "msgboy-button",
                text: button.text,
                click: function() {
                    // We just need to hide the message and restore the right body, as well as send that info to the background.
                    var margin_top_offset = parseInt($("body").css("margin-top")) - 25 
                    $("body").css("margin-top", margin_top_offset + "px");
                    $("#msgboy-bar").hide();
                    button.action();
                    // Action
                }
            }).appendTo($("#msgboy-bar"));
        });
        // Resizing the bar with the window.
        $(window).resize(function() {
            $("#msgboy-bar").css("width", "100%")
        });
	}
	
	// The actions.
	var actions = {
	    follow: {
	        name: "Follow",
			show: true,
	        callback: function () {
	            extractFeedLinks(function (links) {
	                switch (links.length) {
	                case 0:
	                    var form = $("<form>", {
	                        id: "msgboy-form",
	                        submit: function () {
	                            url = $("#msgboy-feed-url").val();
	                            followFeed(url, url, function() {
	                                hideModalBox();
	                            });
	                            return false;
	                        }
	                    })
	                    
	                    $("<p>", {
	                        text: "This page doesn't seem to contain anything to which you could subscribe."
	                    }).appendTo(form)
	                    
	                    var field = $("<div>", {});
	                    
	                    $("<label>", {
	                        for: "url",
	                        text: "Please type in a feed url, if you found one: "
	                    }).appendTo(field);
	                    
	                    $("<br>").appendTo(field);
                         
	                    $("<input>", {
	                        type: "text",
	                        name: "feed-url",
	                        id: "msgboy-feed-url",
	                        size: "64"
	                    }).appendTo(field);

	                    $("<input>", {
	                        type: "submit"
	                    }).appendTo(field);

	                    field.appendTo(form);
	                    
	                    
	                    showModalBox(form);
	                    break;
	                case 1:
	                    followFeed(links[0].href, links[0].title || document.title, function() {
	                        // Nothing.
                        });
	                    break;
	                default:
	                    var content = $("<div>", {});
	                    
	                    $("<p>", {
	                        text: "There are several topics to which you could subscribe; please, pick one : "
	                    }).appendTo(content);
	                    
	                    var link_list = $("<div>", {
	                        id: "link-list"
	                    });
	                    $.each(links, function (count, link) {
	                        link_list.append(
	                        $("<div>", {
	                            text: link.title || link.href,
	                            click: function () {
	                                followFeed(link.href, document.title, function() {
	                                    hideModalBox();
	                                });
	                            }
	                        }))
	                    })
	                    
	                    link_list.appendTo(content);
	                    showModalBox(content);
	                    break;
	                }
	            });
	        }
	    },
	    dashboard: {
	        name: "Dashboard",
			show: false,
	        callback: function () {
	            chrome.extension.sendRequest({
	                "tab": {
	                    url: chrome.extension.getURL('/views/html/dashboard.html'),
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
		}
	};
	
	// Shows the bookmark if needed
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
	
	// Keeps track of all feeds seen.
	$(document).ready(function() {
        extractFeedLinks(function (links) {
            $.each(links, function(index, link) {
                chrome.extension.sendRequest({
                    "feedSpotted": link.href
                }, function (response) {
                    if(response.value) {
                        chrome.extension.sendRequest({
                            "suggestedFeedSubscribed": link.href
                        }, function (response) {
                            // Cool.
                        });
                        followFeed(link.href, link.href, function() {
                            // Cool
                        });
                    }
                });
            });
        })
    });
    
    // Let's look up messages that may be new on this page!
	chrome.extension.sendRequest({
	    "alternateNew": window.location.toString()
	}, function (response) {
	    if(response.value.length > 1) {
	        showBar(response.value.length  + " new stories have been published here. Do you want to open them all?", [
	            {
	                id: "msgboy-bar-yes",
                    text: "Yes",
                    action: function() {
                        // So, we need to open many tabs!
                        $.each(response.value, function(index, story) {
                            // console.log(story.title);
                            chrome.extension.sendRequest({
                                "tab": {
                                    url: story.links.alternate["text/html"][0].href,
                                    selected: false
                                }
                            }, function (response) {});
                            chrome.extension.sendRequest({
                                "markAsRead": story.id
                            }, function (response) {});
                        });
                    }
                },
                {
                    id: "msgboy-bar-no",
                    text: "Mark all as read",
                    action: function() {
                        // Do nothing, except maybe mark them as read? We should actually do something that prevents from asking again for a couple days/hours.
                        $.each(response.value, function(index, story) {
                            chrome.extension.sendRequest({
                                "markAsRead": story.id
                            }, function (response) {});
                        });
                    }
                }
            ]);
        }
        else if(response.value.length == 1) {
            showBar("An article titled '" + truncate(strip(response.value[0].title), 100) + "' was published on this site. Do you want to read it?", [
            {
                id: "msgboy-bar-yes",
                text: "Yes",
                action: function() {
                    chrome.extension.sendRequest({
                        "tab": {
                            url: response.value[0].links.alternate["text/html"][0].href,
                            selected: false
                        }
                    }, function (response) {});
                    chrome.extension.sendRequest({
                        "markAsRead": response.value[0].id
                    }, function (response) {});
                }
            },
            {
                id: "msgboy-bar-no",
                text: "No",
                action: function() {
                    // Do nothing, except maybe mark them as read? We should actually do something that prevents from asking again for a couple days/hours.
                    chrome.extension.sendRequest({
                        "markAsRead": response.value[0].id
                    }, function (response) {});
                }
            }
            ]);
        }
    });
})();
