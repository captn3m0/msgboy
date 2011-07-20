$(document).bind('subscribe', function(element, object) {
    log("Request : subscribe " + object.request.params.url);
    subscribe(object.request.params, function(result) {
        object.sendResponse({
            value: result
        });
    });
});

$(document).bind('unsubscribe', function(element, object) {
    log("Request : unsubscribe " + object.request.params.url);
    var subscription = new Subscription({url: object.request.params.url});
    subscription.fetch_or_create(function() {
        subscription.set_state("unsubscribing", function() {
            connection.superfeedr.unsubscribe(object.request.params.url, function (result) {
                subscription.set_state("unsubscribed");
                log("Request : unsubscribed " + object.request.params.url);
                object.sendResponse({
                    value: result
                });
            });
        });
    });
});

$(document).bind('notify', function(element, object) {
    log("Request : notify", object.request.params);
    Msgboy.notify(object.request.params);
    object.sendResponse({
        value: true
    });
});

$(document).bind('tab', function(element, object) {
    log("Request : tab " + object.request.params.url)
    var active_window = null
    chrome.windows.getAll({}, function(windows) {
        windows = _.select(windows, function(win) {
            return win.type == "normal" && win.focused
        }, this);
        // If no window is focused and "normal"
        if(windows.length == 0) {
            window.open(object.request.params.url); // Can't use Chrome's API as it's buggy :(
        }
        else {
            // Just open an extra tab.
            options = object.request.params
            options.windowId = windows[0].id
            chrome.tabs.create(options, function() {
                object.sendResponse({
                    value: true
                });
            });
        }
    });
});

$(document).bind('close', function(element, object) {
    log("Request : close ");
    currentNotification = null;
    object.sendResponse({
        value: true
    });
});

$(document).bind('up', function(element, object) {
    console.log('up');
    console.log(object);
});

$(document).bind('down', function(element, object) {
    console.log('down');
    console.log(object);
});

$(document).bind('skip', function(element, object) {
    console.log('skip');
    console.log(object);
});

$(document).bind('settings', function(element, object) {
    console.log('settings');
    console.log(object);
});


// chrome.extension.onRequest.addListener(function (request, sender, sendResponse) {
//     if (request.settings) { // Options
//         if (request.settings.get) { // get them
//             log("Request : settings.get " + JSON.stringify(request.settings.get));
//             sendResponse({
//                 value: inbox.get(request.settings.get[0])
//             });
//         } else if (request.settings.set) { // Set them
//             log("Request : settings.set " + JSON.stringify(request.settings.set));
//             attrs = {};
//             attrs[request.settings.set[0]] = request.settings.set[1];
//          inbox.save(attrs, {
//              success: function() {
//                  sendResponse({
//                      value: true
//                  });
//              }
//          });
//         }
//     } else if (request.notify) {
//         log("Request : notify", request.notify);
//         notify(request.notify);
//         sendResponse({
//          value: true
//      });
//     } else if (request.tab) { // Open tab
//         log("Request : tab " + request.tab.url)
// 
//      var active_window = null
//      
//      chrome.windows.getAll({}, function(windows) {
//          windows = _.select(windows, function(win) {
//              return win.type == "normal" && win.focused
//          }, this)
//          // If no window is focused and "normal"
//          if(windows.length == 0) {
//              window.open(request.tab.url); // Can't use Chrome's API as it's buggy :(
//          }
//          else {
//              // Just open an extra tab.
//              options = request.tab
//              options.windowId = windows[0].id
//              chrome.tabs.create(options, function() {
//                  sendResponse({
//                      value: true
//                  });
//              });
//          }
//      })
//     } else if (request.subscribe) { // Subscribes to more feeds
//     } else if (request.unsubscribe) { // Unsubscribes from feeds
//     } else if (request.close) {
//     } else if(request.alternateNew) {
//     } else if(request.markAsRead) {
//         log("Request : markAsRead " + request.markAsRead);
//         var message = new Message({id: request.markAsRead});
//         message.fetch({
//             success: function() {
//                 message.mark_as_read(function(result) {
//                     sendResponse({
//                         value: result
//                     });
//                 });
//             },
//             error: function() {
//                 message.mark_as_read(function(result) {
//                     sendResponse({
//                         value: false
//                     });
//                 });
//             }
//         })
//     } else if(request.message) {
//         log("Request : message " + request.message);
//         var message = new Message({id: request.message});
//         message.fetch({
//             success: function() {
//                 sendResponse({
//                     value: message.toJSON()
//                 });
//             },
//             error: function() {
//                 // Dang. We could not retrieve that message :(
//             }
//         });
//     } else if(request.up) {
//         log("Request : up " + request.up);
//         var message = new Message({id: request.up});
//         message.fetch({
//             success: function() {
//                 message.vote_up(function() {
//                     sendResponse({
//                         value: true
//                     });
//                 });
//             },
//             error: function() {
//                 sendResponse({
//                     value: false
//                 });
//             }
//         });
//     } else if(request.down) {
//         log("Request : down " + request.down);
//         var message = new Message({id: request.down});
//         message.fetch({
//             success: function() {
//                 message.vote_down(function(result) {
//                     sendResponse({
//                         value: true
//                     });
//                 });
//             },
//             error: function() {
//                 sendResponse({
//                     value: false
//                 });
//             }
//         });
//     } else if(request.skip) {
//         log("Request : skip " + request.skip);
//         var message = new Message({id: request.skip});
//         message.fetch({
//             success: function() {
//                 message.skip(function(result) {
//                     sendResponse({
//                         value: true
//                     });
//                 });
//             },
//             error: function() {
//                 sendResponse({
//                     value: false
//                 });
//             }
//         });
//     } 
//     else {
//         log("Could not handle message : " +  JSON.stringify(request))
//     }
// });
// 
// 
