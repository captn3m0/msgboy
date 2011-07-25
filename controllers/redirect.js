if(window.location.host.match(/msgboy.com/)) {
    window.location = "chrome-extension://" + chrome.i18n.getMessage("@@extension_id") + "/views/html/dashboard.html"    
}
