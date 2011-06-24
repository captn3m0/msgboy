MsgboyHelper.uploader = {
    
}

MsgboyHelper.uploader.upload = function(string) {
    var xhr = new XMLHttpRequest();
    var boundary = "xxxxxxxxx";
    var uri = "http://data.msgboy.com.s3.amazonaws.com/";
    xhr.open("POST", uri, true);
    xhr.setRequestHeader("Content-Type", "multipart/form-data, boundary="+boundary); // simulate a file MIME POST request.

    var post = 
    xhr.send(string);
    
}
