MsgboyBookmark = function() {
};

MsgboyBookmark.add_actions = function(actions) {
    for (var id in actions) {
        var action = actions[id];
        if(action.show) {
            $("#msgboy-bookmark").append(
                $("<span>", {
                    id: id,
                    text: action.name,
                    class: 'action',
                    click: action.callback
                })
            );
        }
    }
};

MsgboyBookmark.show = function(actions) {
    $(document).ready(function() {
        // Gets the bookmarkPosition
        chrome.extension.sendRequest({
            "settings": {
                "get": ["bookmarkPosition"]
            }
        }, function (response) {
            if($("#msgboy-bookmark").length == 0) {
                MsgboyHelper.events.trigger("msgboy-bookmark-loaded");
                // Add the bookmark now.
                $("<div>", {
                    id: "msgboy-bookmark"
                }).appendTo("body");

                var left = Math.min(Math.max(parseInt(response.value), 0), $(window).width() - 100); // 100 is the size of the bookmark!
                $("#msgboy-bookmark").css("left", left);

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
                MsgboyBookmark.add_actions(actions);
            }
            else {
                MsgboyBookmark.add_actions(actions);
            }
        });
    });
};