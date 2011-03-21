// Plugins
$.each(Plugins.all, function(index, plugin) {
  chrome.extension.sendRequest({"settings": {"get" : ["plugins."+nameToId(plugin.name)]}}, function(response) {
    if(response.value) {
      // This plugin is installed!
      // Are we on the plugin's page
      if(plugin.onSubscriptionPage()) {
        // Let's then hijack the "subscribe" button, if needed.
        plugin.hijack(function(url) {
          chrome.extension.sendRequest({subscribe: url}, function(response) {
          });
        });
      }
    }
  });
});
