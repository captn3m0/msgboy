function parseUri (str) {
  var	o   = parseUri.options,
  m   = o.parser[o.strictMode ? "strict" : "loose"].exec(str),
  uri = {},
  i   = 14;

  while (i--) uri[o.key[i]] = m[i] || "";

  uri[o.q.name] = {};
  uri[o.key[12]].replace(o.q.parser, function ($0, $1, $2) {
    if ($1) uri[o.q.name][$1] = $2;
  });

  return uri;
};

parseUri.options = {
  strictMode: false,
  key: ["source","protocol","authority","userInfo","user","password","host","port","relative","path","directory","file","query","anchor"],
  q:   {
    name:   "queryKey",
    parser: /(?:^|&)([^&=]*)=?([^&]*)/g
  },
  parser: {
    strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
    loose:  /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/
  }
};

// Background subscriptions!
// Tumblr
if(window.location.host == "www.tumblr.com" && window.location.pathname == '/following') {
  // So now, the JS!
  alert("tumblr!");
}
else if(window.location.host == "www.google.com" && window.location.pathname == '/reader/view/') {
  // If we're on Google Reader
  links = [];
  request = new XMLHttpRequest();
  request.open("GET", "http://www.google.com/reader/subscriptions/export", true);
  request.onreadystatechange = function() {
    if (request.readyState == 4) {
      $(request.responseXML).find("outline").each(function() {
        chrome.extension.sendRequest({subscribe: $(this).attr("xmlUrl")}, function(response) {
          // Subscribed!
        });
      });
    }
  };
  request.send();
  // Now we have the links!
}
else {
  // Show the bookmark
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
                        id: "superfeedr-bookmark-dialog"
                      }).appendTo("body");
                      $("<h4>", {
                        text: "Sorry, there is nothing to subscribe to on this page, but you can type a feed url below :"
                        }).appendTo($("#superfeedr-bookmark-dialog"));
                      var maskHeight = $(document).height();
                      var maskWidth = $(window).width();

                      //Get the window height and width
                      var winH = $(window).height();
                      var winW = $(window).width();

                      //Set the popup window to center
                      $("#superfeedr-bookmark-dialog").height(winH);
                      $("#superfeedr-bookmark-dialog").css('top', winH/2-$("#superfeedr-bookmark-dialog").height()/4);
                      $("#superfeedr-bookmark-dialog").css('left', winW/2-$("#superfeedr-bookmark-dialog").width()/2);
                      $("<form>", {id: "superfeedr-bookmark-form", submit: function() {
                        url = $("#superfeedr-feed-url").val();
                        chrome.extension.sendRequest({subscribe: url}, function(response) {
                          $("#superfeedr-bookmark-dialog").remove();
                          alert("Subscribed to " + url);
                        });
                        return false;
                      }}).appendTo($("#superfeedr-bookmark-dialog"));
                      $("<input>", {type: "text", name: "feed-url", id: "superfeedr-feed-url", size: "72"}).appendTo($("#superfeedr-bookmark-form"));
                      $("<input>", {type: "submit"}).appendTo($("#superfeedr-bookmark-form"));


                      $("<a>", {
                        text: "close",
                        click: function() {
                          $("#superfeedr-bookmark-dialog").remove();
                        }
                      }).appendTo($("#superfeedr-bookmark-dialog"));
                      break;
                    case 1 : 
                      chrome.extension.sendRequest({subscribe: links[0].href}, function(response) {
                        alert("Subscribed to " + links[0].href);
                      });
                      break;
                    default : 
                      $("<div>", {
                        id: "superfeedr-bookmark-dialog"
                      }).appendTo("body");
                      $("<h4>", {
                        text: "Please chose which resource you want to subscribe to"
                        }).appendTo($("#superfeedr-bookmark-dialog"));
                      var maskHeight = $(document).height();
                      var maskWidth = $(window).width();

                      //Get the window height and width
                      var winH = $(window).height();
                      var winW = $(window).width();

                      //Set the popup window to center
                      $("#superfeedr-bookmark-dialog").css('top', winH/2-$("#superfeedr-bookmark-dialog").height()/2);
                      $("#superfeedr-bookmark-dialog").css('left', winW/2-$("#superfeedr-bookmark-dialog").width()/2);

                      $("<ul>", {
                        id: "link-list"
                      }).appendTo($("#superfeedr-bookmark-dialog"));

                      $.each(links, function(count, link) {
                          $("#link-list").append(
                              $("<li>", {
                                  text: link.title || link.href,
                                  click: function() {
                                    this.style.color = "#E6E6E6";
                                    chrome.extension.sendRequest({subscribe: link.href}, function(response) {
                                      alert("Subscribed to " + links[0].href);
                                    });
                                  }
                              }
                              )
                          )
                      })

                      $("<a>", {
                        text: "close",
                        click: function() {
                          $("#superfeedr-bookmark-dialog").remove();
                        }
                      }).appendTo($("#superfeedr-bookmark-dialog"));


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
          }, {
              name: "like",
              callback: function() {
                var parsedLocation = parseUri(document.location);
                var atom_id = "tag:"+parsedLocation.host + (parsedLocation.port ? ":" + parsedLocation.port : "") + "," + (new Date()).format("yyyy-mm-dd") + parsedLocation.path + (parsedLocation.anchor ? "/" + parsedLocation.anchor : "");

                // We want to add to inbox this specific page.
                selected = document.getSelection().toString();
                if(selected == "") {
                  selected = document.title || "";
                }
                var source = {
                  title: document.title,
                  url: window.location.toString(),
                }
                var links = {};
                links["alternate"] = {}
                links["alternate"]["text/html"] = [
                    {
                      "href": window.location.toString(),
                      "rel": "alternate",
                      "title": document.title,
                      "type": "text/html"
                    }
                ];
                chrome.extension.sendRequest({"add": {
                  atom_id: atom_id,
                  title: selected.substring(0, 80),
                  summary: selected,
                  content : null,
                  links: links,
                  source: source
                }}, function(response) {
                  chrome.extension.sendRequest({notify: response.value}, function(response) {
                  });
                  return false;
                });
              }
          }, {
            name: "",
            id: "connectionStatus",
            callback: function() {
              return false;
            }
          }
          ];

          $("<ul>", {
              id: "superfeedr-bookmark"
          }).appendTo("body");
          var left = Math.min(Math.max(response.value,0), $(window).width() - $("#superfeedr-bookmark").width());
          $("#superfeedr-bookmark").css("left", left);

          $.each(actions, function(count, action) {
              $("#superfeedr-bookmark").append(
                  $("<li>", {
                      id: action.id,
                      text: action.name,
                      class: 'action',
                      click: action.callback
                  }
                  )
              )
          });

          chrome.extension.connect({name: "connection"}).onMessage.addListener(function(msg) {
            $('#connectionStatus').text(msg);
          });


    // Called when the bookmark has been moved.
    $("#superfeedr-bookmark" ).bind('drag', function(ev, dd){ 
      $( this ).css({
        left: dd.offsetX
      });      
    });

    $("#superfeedr-bookmark" ).bind('dragend', function(ev, dd){ 
      chrome.extension.sendRequest({"settings": {"set" : ["bookmarkPosition", dd.offsetX]}}, function(response) {
      });
    });  

  });
}

// Google Reader
