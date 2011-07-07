(function () {
    
    function next() {
        chrome.extension.sendRequest({
            "train": {}
        }, function(response) {
            window.location = response.value.url + "#msgboy-training=" + response.value.id;
        });
    }
    
    var matches = window.location.hash.match(/msgboy-training=(.*)/);

    var actions = {
        up: {
            name: "More",
            show: true,
            callback: function () {
                chrome.extension.sendRequest({
                    "up": matches[1]
                }, function(response) {
                    next();
                });
            }
        },
        down: {
            name: "Less",
            show: true,
            callback: function () {
                chrome.extension.sendRequest({
                    "down": matches[1]
                }, function(response) {
                    next();
                });
            }
        },
        skip: {
            name: "Skip",
            show: true,
            callback: function () {
                chrome.extension.sendRequest({
                    "skip": matches[1]
                }, function(response) {
                    next();
                });
            }
        },
    };

    if (matches[1]) {
        chrome.extension.sendRequest({
            "message": matches[1]
        }, function(response) {
            MsgboyBookmark.show(actions);
        });
    }
}).call(this);