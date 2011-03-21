// Runs all the plugins
$.each(Plugins.all, function(index, plugin) {
  chrome.extension.sendRequest({"settings": {"get" : ["plugins."+nameToId(plugin.name)]}}, function(response) {
    if(response.value) {
      // This plugin is installed!
      if(plugin.onSubscriptionPage()) { // Are we on the plugin's page?
        // Let's then hijack the "subscribe" button, if needed.
        plugin.hijack();
      }
    }
  });
});
