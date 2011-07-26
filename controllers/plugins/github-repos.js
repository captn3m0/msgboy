// Plugins.register(new function() {
// 
//  this.name = 'Github Repositories',
// 
//  this.onSubscriptionPage = function() {
//      // This method returns true if the plugin needs to be applied on this page.
//      return (window.location.host == "github.com")
//  },
// 
//  this.hijack = function(follow, unfollow) {
//      // This methods hijacks the susbcription action on the specific website for this plugin.
//      // TOFIX : if the elements as an onclick element, we need to remove it, so that it's not executed, but also we need to 'remember' it so that it's executed _after_
//      $.each($(".btn-watch"), function(index, button) {
//             var onclick_cb = $(button).attr("onclick").bind(button); // Keep track of onclick.
//             $(button).attr("onclick", ""); // Delete the onclick.
//          $(button).click(function(event) {
//              event.preventDefault();
//              var url = 'https://github.com/' + $(event.currentTarget).attr("href").replace("toggle_watch", "/commits/master.atom");
//              var action = $(event.currentTarget).text();
//              switch(action) {
//                  case "Watch":
//                  follow({
//                      url: url,
//                      title: document.title
//                  }, function() {
//                         onclick_cb();
//                  });
//                  break;
//                  case "Unwatch":
//                  unfollow({
//                      url: url,
//                      title: document.title
//                  }, function() {
//                         onclick_cb();
//                  });
//                  break;
//                  default:
//              }
//              return false;
//          });
//      }.bind(this));
//  },
//  
//  this.listSubscriptions = function(callback) {
//         $.get("http://github.com/", function(data) {
//          content = $(data);
//          avatarname = content.find(".avatarname")
//          if (avatarname.length == 0) {
//                 callback([]); // We're not able to list all subscriptions as the user is not logged in :(
//          }
//          else {
//              // There should be just one anyway.
//              $.get(avatarname[0].children[0].href + "/following", function(data) {
//                  content = $(data);
//                  // Let's now import them all.
//                  var subscriptions = [];
//                  content.find(".repo_list .source a").each(function(){
//                      subscriptions.push({url: "http://github.com" + $(this).attr("href") + "/commits/master.atom" , title: $(this).text()});
//                  });
//                  callback(subscriptions);
//              })
//          }
//      }); 
//      
//     },
//  
//  this.isUsing = function(callback) {
//      var that = this;
//      $.get("https://github.com/", function(data) {
//          if($(data).find(".userbox").length === 0) {
//              callback(false);
//          }
//          else {
//              callback(true);
//          }
//      });
//  }
//  
// });