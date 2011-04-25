/**
 * File: strophe.pep.js
 * Strophe plugin for PEP.
 */

Strophe.addConnectionPlugin('pep', {
    _connection: null,
    _handler: null,

    init: function (conn) {
        this._connection = conn;
        Strophe.addNamespace('PUBSUB', "http://jabber.org/protocol/pubsub");
        Strophe.addNamespace('PUBSUB_EVENT', "http://jabber.org/protocol/pubsub#event");
    },

    // called when connection status is changed
    statusChanged: function (status) {
        if (status === Strophe.Status.CONNECTED && !this._handler) {
            this._handler = this._connection.addHandler(this.pepNotificationReceived.bind(this), null, 'message', null, null, null);
        }
	},

    pepNotificationReceived: function (msg) {
		// Check if the sender is in the roster of this user.
		if(this._connection.roster.contacts[$(msg).attr('from')]) {
			var entries = msg.getElementsByTagName("entry");
            for (i = 0; i < entries.length; i++) {
                var atom = entries[i];
				$(document).trigger('notification_received', {via: $(msg).attr('from'), payload: atom});
			}
		}
        return true; // We must return true to keep the handler active!
    },

    defaults: {
        matchBare: true
    },

    /**
     * Function: publish
     * 
     * Parameters:
     * (String) node -	The node.
     * (Object) content	- The DOM Object(s)
     * (Function) success - The callback function on success.
     * (Function) error - The callback function on error.
     */
    publish: function (node, content, success, error) {
        this._connection.sendIQ(
        this.createPublishIQ(node, content), success, error);
    },

    /**
     * PrivateFunction: _addPepHandler
     * 
     * Parameters:
     * (Function) handler	- Callback function
     * (String) jid	- JID
     * (String) node 	- The node
     * (Boolean) matchBare	-
     * 
     * Returns:
     * A reference to the handler.
     */
    _addPepHandler: function (handler, jid, node, matchBare) {

        var that = this;

        if (matchBare === true) {
            jid = Strophe.getBareJidFromJid(jid);
        }

        if (matchBare !== false && matchBare !== true) {
            matchBare = this.defaults.matchBare;
        }

        return this._connection.addHandler(

        function (msg) {
            if (that.isCorrectNode(msg, node)) {
                return handler(msg);
            }
            return true;
        }, null, 'message', null, null, jid, {
            matchBare: matchBare
        });
    },

    /**
     * PrivateFunction: isCorrectNode
     * 
     * Parameters: 
     * (Object) msg	- The message
     * (String) node	- The name of the node that should match
     * 
     * Returns:
     * True if the node mathes.
     */
    isCorrectNode: function (msg, node) {

        if (msg.childNodes.length > 0) {

            var event = msg.childNodes[0];
            var items = event.childNodes[0];

            if (event.tagName === "event" && event.getAttribute('xmlns') === Strophe.NS.PUBSUB_EVENT && items.getAttribute('node') === node) {
                return true;
            }
        }
        return false;
    },

    /**
     * PrivateFunction: createPublishIQ
     * 
     * Parameters:
     * (String) node	- The node
     * (Object) content	- The content as an DOM object or an array of DOM objets
     */
    createPublishIQ: function (node, content) {

        var pubid = this._connection.getUniqueId("peppublishiq");

        if (!this.isArray(content)) {
            content = [content];
        }

        var iq = $iq({
            type: 'set'
        }).c("pubsub", {
            xmlns: Strophe.NS.PUBSUB
        }).c("publish", {
            node: node
        });

        for (var i in content) {

            if (content[i]) {

                var c = content[i];

                if (this.isNode(c) || this.isElement) {
                    iq.c("item").cnode(c).up().up();
                }
            }
        }
        return iq;
    },

    /**
     * PrivateFunction: getJid
     * 
     * Parameters: 
     * (Boolean) matchBare
     *
     * Returns:
     * (Boolean) jid	- The Jabber ID of the current connection. 
     * If global option matchBare is set to TRUE the bare JID will be returned.
     */
    getJid: function (matchBare) {
        if (matchBare === false) {
            return this._connection.jid;
        } else if (matchBare === true) {
            return Strophe.getBareJidFromJid(this._connection.jid);
        } else {
            if (this.defaults.matchBare === true) {
                return Strophe.getBareJidFromJid(this._connection.jid);
            } else {
                return this._connection.jid;
            }
        }
    },

    /**
     * PrivateFunction: isNode
     * 
     * Parameters:
     * ( Object ) obj	- The object to test
     * 
     * Returns:
     * True if it is a DOM node
     */

    isNode: function (obj) {

        if (typeof (Node) === "object") {
            return (obj instanceof Node);
        } else {
            return (typeof (obj) === "object" && typeof (obj.nodeType) === "number" && typeof (obj.nodeName) === "string");
        }
    },

    /**
     * PrivateFunction: isElement
     * 
     * Parameters:
     * ( Object ) obj	- The object to test
     * 
     * Returns:
     * True if it is a DOM element.
     */

    isElement: function (obj) {

        if (typeof (HTMLElement) === "object") {
            return (obj instanceof HTMLElement); //DOM2      
        } else {
            return (typeof (obj) === "object" && obj.nodeType === 1 && typeof (obj.nodeName) === "string");
        }
    },

    /** 
     * PrivateFunction: isArray
     * Checks if an given object is an array.
     * 
     * Parameters: 
     * (Object) obj	- The object to test
     * 
     * Returns:
     * True if it is an array.
     */

    isArray: function (obj) {
        try {
            return obj && obj.constructor.toString().match(/array/i) !== null;
        } catch (e) {
            return false;
        }
    }
});