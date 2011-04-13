// Show the bookmark

function listenToConnectionstatus() {
	console.log("Connected to background script.")
	port = chrome.extension.connect({name: "connection"})
	port.onMessage.addListener(function(msg) {
		$('#connectionStatus').text(msg);
    });
	port.onDisconnect.addListener(function() {
		console.log("Disconnected from background script.");
		listenToConnectionstatus(); // We reconnect.
	});
}


chrome.extension.sendRequest({"settings": {"get" : ["bookmarkPosition"]}}, function(response) {
  var actions = [ {
            name: "subscribe", 
            callback: function() {
              // Detect feed url(s)
              // If there are 0, leave the icon greyed.
              // If there is 1, just subscribe to it.
              // If there is more than 1, ask the user which one to subscribe to.
              extractFeedLinks(function(links) {
                switch (links.length) {
                  case 0 : 
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
                    $("#msgboy-bookmark-dialog").css('top', winH/2-$("#msgboy-bookmark-dialog").height()/4);
                    $("#msgboy-bookmark-dialog").css('left', winW/2-$("#msgboy-bookmark-dialog").width()/2);
                    $("<form>", {id: "msgboy-bookmark-form", submit: function() {
                      url = $("#msgboy-feed-url").val();
                      chrome.extension.sendRequest({subscribe: url}, function(response) {
                        $("#msgboy-bookmark-dialog").remove();
                      });
                      return false;
                    }}).appendTo($("#msgboy-bookmark-dialog"));
                    $("<input>", {type: "text", name: "feed-url", id: "msgboy-feed-url", size: "72"}).appendTo($("#msgboy-bookmark-form"));
                    $("<input>", {type: "submit"}).appendTo($("#msgboy-bookmark-form"));


                    $("<a>", {
                      text: "close",
                      click: function() {
                        $("#msgboy-bookmark-dialog").remove();
                      }
                    }).appendTo($("#msgboy-bookmark-dialog"));
                    break;
                  case 1 : 
                    chrome.extension.sendRequest({subscribe: links[0].href}, function(response) {
                    });
                    break;
                  default : 
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
                    $("#msgboy-bookmark-dialog").css('top', winH/2-$("#msgboy-bookmark-dialog").height()/2);
                    $("#msgboy-bookmark-dialog").css('left', winW/2-$("#msgboy-bookmark-dialog").width()/2);

                    $("<ul>", {
                      id: "link-list"
                    }).appendTo($("#msgboy-bookmark-dialog"));

                    $.each(links, function(count, link) {
                        $("#link-list").append(
                            $("<li>", {
                                text: link.title || link.href,
                                click: function() {
                                  this.style.color = "#E6E6E6";
                                  chrome.extension.sendRequest({subscribe: link.href}, function(response) {
                                  });
                                }
                            }
                            )
                        )
                    })

                    $("<a>", {
                      text: "close",
                      click: function() {
                        $("#msgboy-bookmark-dialog").remove();
                      }
                    }).appendTo($("#msgboy-bookmark-dialog"));


                    break;
                }                
              });
            }
        }, {
            name: "inbox",
            callback: function() {
              chrome.extension.sendRequest({"tab": {url: chrome.extension.getURL('/views/html/inbox.html'), selected: true}}, function(response) {
              });
            }
        },  {
          name: "",
          id: "connectionStatus",
          callback: function() {
	          chrome.extension.sendRequest({connect: true}, function(response) {
              });
            return false;
          }
        }
        ];

        $("<ul>", {
            id: "msgboy-bookmark"
        }).appendTo("body");
        var left = Math.min(Math.max(response.value, 0), $(window).width() - $("#msgboy-bookmark").width());
        $("#msgboy-bookmark").css("left", left);

        $.each(actions, function(count, action) {
            $("#msgboy-bookmark").append(
                $("<li>", {
                    id: action.id,
                    text: action.name,
                    class: 'action',
                    click: action.callback
                }
                )
            )
        });

		listenToConnectionstatus();


  // Called when the bookmark has been moved.
  $("#msgboy-bookmark" ).bind('drag', function(ev, dd){ 
    $( this ).css({
      left: dd.offsetX
    });      
  });

  $("#msgboy-bookmark" ).bind('dragend', function(ev, dd){ 
    chrome.extension.sendRequest({"settings": {"set" : ["bookmarkPosition", dd.offsetX]}}, function(response) {
    });
  });  

});

