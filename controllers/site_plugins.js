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
        // TODO : show message to the user indicating that we couldn't fetch from tumblr :(
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

// // Posterous
// Plugins.register(new function() {
//   
//   this.name = 'Posterous', // Name for this plugin. The user will be asked which plugins he wants to use.
//   
//   this.importSubscriptions = function() {
//     // This methods import subscription from the specific website for this plugin.
//     alert("Importing Posterous")
//   }
// });
// 
// // Flickr
// Plugins.register(new function() {
//   
//   this.name = 'Flickr', // Name for this plugin. The user will be asked which plugins he wants to use.
//   
//   this.importSubscriptions = function() {
//     // This methods import subscription from the specific website for this plugin.
//     alert("Importing Flickr")
//     
//   }
// });
// 
