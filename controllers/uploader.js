MsgboyHelper.uploader = {
    
}

MsgboyHelper.uploader.upload = function(client, json) {
    var xhr = new XMLHttpRequest();
    var uri = "http://msgboy.com/upload/" + client;
    xhr.open("POST", uri, true);
    xhr.setRequestHeader("Content-Type", "text/plain");
    xhr.send(JSON.stringify(json));
    xhr.onreadystatechange = function() {
        // Done
    };
    
}

