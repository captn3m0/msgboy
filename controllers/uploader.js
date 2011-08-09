// Hopefully this should be part of the regular Msgboy
if (typeof Msgboy === "undefined") {
    var Msgboy = {};
}

// Let's define the helper module.
if (typeof Msgboy.helper === "undefined") {
    Msgboy.helper = {};
}

Msgboy.helper.uploader = {};
Msgboy.helper.uploader.upload = function (client, json) {
    var xhr = new XMLHttpRequest();
    var uri = "http://msgboy.com/upload/" + client;
    xhr.open("POST", uri, true);
    xhr.setRequestHeader("Content-Type", "text/plain");
    xhr.send(JSON.stringify(json));
    xhr.onreadystatechange = function () {
        // Done
    };
};

