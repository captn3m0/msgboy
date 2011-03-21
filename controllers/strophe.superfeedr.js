Strophe.addConnectionPlugin('superfeedr', {
  
  _connection: null,
  _firehoser: 'firehoser.superfeedr.com',

  //The plugin must have the init function.
  init: function(conn) {
    this._connection = conn;
    Strophe.addNamespace('PUBSUB', "http://jabber.org/protocol/pubsub");
  },

  // Subscribes to a feed
  subscribe: function(feed, callback) {
    var stanza_id = this._connection.getUniqueId("subscribenode");
    var sub = $iq({from:this._connection.jid, to:this._firehoser, type:'set', id:stanza_id});
    sub.c('pubsub', { xmlns:Strophe.NS.PUBSUB }).c('subscribe', {jid:Strophe.getBareJidFromJid(this._connection.jid), node: feed});    
    this._connection.addHandler(function(response) {  
        callback(response.getAttribute("type") == "result");
        return false;
      },
      null,
      'iq',
      null,
      stanza_id,
      null);
    this._connection.send(sub.tree());
  },

  // Unsubscribes from a feed
  unsubscribe: function(feed, callback) {
    var stanza_id = this._connection.getUniqueId("unsubscribenode");
    var sub = $iq({from:this._connection.jid, to:this._firehoser, type:'set', id:stanza_id});
    sub.c('pubsub', { xmlns:Strophe.NS.PUBSUB }).c('unsubscribe', {jid:Strophe.getBareJidFromJid(this._connection.jid), node: feed});    
    this._connection.addHandler(function(response) {  
        callback(response.getAttribute("type") == "result");
        return false;
      },
      null,
      'iq',
      null,
      stanza_id,
      null);
    this._connection.send(sub.tree());
  },

  // List subscribed feeds
  list: function(page, callback) {
    var stanza_id = this._connection.getUniqueId("listnode");
    var sub = $iq({from:this._connection.jid, to:this._firehoser, type:'get', id:stanza_id});
    sub.c('pubsub', { xmlns:Strophe.NS.PUBSUB }).c('subscriptions', {jid:Strophe.getBareJidFromJid(this._connection.jid), 'xmlns:superfeedr': "http://superfeedr.com/xmpp-pubsub-ext", 'superfeedr:page': page});    
    this._connection.addHandler(function(response) {  
        var subscriptions = response.getElementsByTagName("subscription");
        var result = []
        for(i=0; i<subscriptions.length; i++) {
          result.push(subscriptions[i].getAttribute("node"));
        }
        callback(result); 
        return false;// Unregisters
      },
      null,
      'iq',
      null,
      stanza_id,
      null);
    this._connection.send(sub.tree());
  },
  
  // Andd a notification handler
  addNotificationHandler: function(callback) {
    this._connection.addHandler(function (msg) {
      if(msg.getAttribute('from') ==  "firehoser.superfeedr.com") {
        var items = [];
        var entries = msg.getElementsByTagName("entry");
        var status = msg.getElementsByTagName("status")[0];
        var source = {
          title: Strophe.getText(status.getElementsByTagName("title")[0]),
          url: status.getAttribute("feed")
        }
        for( i=0; i<entries.length; i++) {
          var atom = entries[i];
          var links = {};
          var atom_links = atom.getElementsByTagName("link");
          for(j=0; j<atom_links.length; j++) {
            var link = atom_links[j];
            l = {
              href: link.getAttribute("href"),
              rel: link.getAttribute("rel"),
              title: link.getAttribute("title"),
              type: link.getAttribute("type")
            };
            links[link.getAttribute("rel")] = (links[link.getAttribute("rel")] ? links[link.getAttribute("rel")] : {});
            links[link.getAttribute("rel")][link.getAttribute("type")] = (links[link.getAttribute("rel")][link.getAttribute("type")] ? links[link.getAttribute("rel")][link.getAttribute("type")] : []);
            links[link.getAttribute("rel")][link.getAttribute("type")].push(l);
          }
          items.push({
            atom_id: Strophe.getText(atom.getElementsByTagName("id")[0]),
            published: Strophe.getText(atom.getElementsByTagName("published")[0]),
            updated: Strophe.getText(atom.getElementsByTagName("updated")[0]),
            title: Strophe.getText(atom.getElementsByTagName("title")[0]),
            summary: Strophe.getText(atom.getElementsByTagName("summary")[0]),
            links: links,
            source: source
          });
        }
        
        for( i=0; i<items.length; i++) {
          callback(items[i]);
        }
      }
      return true; // We must return true to keep the handler active!
    },
    null,
    'message',
    null,
    null,
    null);
  }
});
