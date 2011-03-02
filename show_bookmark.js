// This file is the one that is loaded with each page. It does several things, including identifying feeds in pages or page feeds.
chrome.extension.sendRequest({localstorage: "bookmark_left"}, function(response) {
  left = response.value;
  $('body').append('<div id="bookmark" style="position:absolute;top:0px;left:' + left + 'px;z-index:999999;cursor:pointer;background-color:#ccc"><img id="subscribe" src="' + chrome.extension.getURL('/icons/24-grey.png') + '" title= "Subscribe to this page" style="margin:20px 3px 3px 3px" /> </div> ')

  $("#bookmark" ).draggable({ 
    axis: "x",
    stop: function(event, ui) { 
      chrome.extension.sendRequest({localstorage: "bookmark_left", set:ui.position.left}, function(response) {
        // Do nothing.
      })
    } 
  });
});
