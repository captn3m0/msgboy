/*
	Fucntion to make sure we can ue a DomParser... even in IE
*/
if (typeof(DOMParser) == 'undefined') {
 DOMParser = function () {}
 DOMParser.prototype.parseFromString = function (str, contentType) {
  if (typeof(ActiveXObject) != 'undefined') {
   var xmldata = new ActiveXObject('MSXML.DomDocument');
   xmldata.async = false;
   xmldata.loadXML(str);
   return xmldata;
  } else if (typeof(XMLHttpRequest) != 'undefined') {
   var xmldata = new XMLHttpRequest;
   if (!contentType) {
    contentType = 'application/xml';
   }
   xmldata.open('GET', 'data:' + contentType + ';charset=utf-8,' + encodeURIComponent(str), false);
   if (xmldata.overrideMimeType) {
    xmldata.overrideMimeType(contentType);
   }
   xmldata.send(null);
   return xmldata.responseXML;
  }
 }
}

Strophe.Websocket = function (service)
{
	// Connection
	this._connection = null;
	this._service	= service;
	this._socket	= null;

	// Requests stack.
	this._requests = [];    
	this.connected = false
};

Strophe.Websocket.prototype = {
	
	/** Function connect 
	 *  Connects to the server using websockets.
	 *  It also assigns the connection to this proto
	 */
	connect: function (connection) {
		if (!this._socket) {
    	    Strophe.log("info", "Websocket connecting to " + this._service);
			this._connection 		= connection;
	        this._socket 			= new WebSocket(this._service);
		    this._socket.onopen     = this._onOpen.bind(this);
			this._socket.onerror 	= this._onError.bind(this);
		    this._socket.onclose 	= this._onClose.bind(this);
		    this._socket.onmessage 	= this._onMessage.bind(this);
		}
	},
	
	/** Function disconnect 
	 *  Disconnects from the server
	 */
	disconnect: function () {
		this._connection.xmlOutput(this._endStream());
		this._sendText(this._endStream());
		this._socket.close(); // Close the socket
	},

	/** Function finish 
	 *  Finishes the connection. It's the last step in the cleanup process.
	 */
	finish: function () {
	    this.connected = false;
		this._socket = null; // Makes sure we delete the socket.
	},
	
	/** Function send 
	 *  Sends messages
	 */
	send: function (msg) {
	    if (this._sendText(Strophe.serialize(msg))) {
    		this._connection.xmlOutput(msg);
	        return true;
	    }
	    else {
	        return false;
	    }
	},
	
	/** Function: restart
     *  Send an xmpp:restart stanza.
     */
	restart: function () {
		this._connection.xmlOutput(this._startStream());
		this._sendText(this._startStream());
	},
	
	/** PrivateFunction: _onError
     *  _Private_ function to handle websockets errors.
     *
     *  Parameters:
     *    () error - The websocket error.
     */
	_onError: function (error) {
		Strophe.log("error", "Websocket error " + error);
	},

	/** PrivateFunction: _onOpen
     *  _Private_ function to handle websockets connections.
     *
     */
	_onOpen: function () {
		Strophe.log("info", "Websocket open");
		this.connected = true;
		this._connection.xmlOutput(this._startStream());
		this._sendText(this._startStream());
		this._keepalive();
	},
	
	/** PrivateFunction: _onClose
     *  _Private_ function to handle websockets closing.
     *
	 */
	_onClose: function (event) {
		Strophe.log("info", "Websocket disconnected");
	    this.connected = false;
		this._connection._doDisconnect();
	},
	
	/** PrivateFunction: _onError
     *  _Private_ function to handle websockets messages.
     *
	 *  This function parses each of the messages as if they are full documents. [TODO : We may actually want to use a SAX Push parser].
	 *  
	 *  Since all XMPP traffic starts with "<stream:stream version='1.0' xml:lang='en' xmlns='jabber:client' xmlns:stream='http://etherx.jabber.org/streams' id='3697395463' from='SERVER'>"
	 *  The first stanza will always fail to be parsed...
	 *  Addtionnaly, the seconds stanza will always be a <stream:features> with the stream NS defined in the previous stanza... so we need to 'force' the inclusion of the NS in this stanza!
     * 
	 *  Parameters:
     *    (string) message - The websocket message.
     */
	_onMessage: function (message) {
		this._connection.rawInput(message.data);
		
		string = message.data.replace("<stream:features>", "<stream:features xmlns:stream='http://etherx.jabber.org/streams'>"); // Ugly hack todeal with the problem of stream ns undefined.
		
		parser = new DOMParser();
		elem = parser.parseFromString(string, "text/xml").documentElement;
		
		this._connection.xmlInput(elem);

		if (elem.nodeName == "stream:stream") {
			// Let's just skip this.
		}
		else {
			this._connection.receiveData(elem);
		}
	},
	
	_startStream: function () {
		return "<stream:stream to='" + this._connection.domain + "' xmlns='jabber:client' xmlns:stream='http://etherx.jabber.org/streams' version='1.0' />";
	},
	
	_endStream:function () {
		return "</stream:stream>";
	},
	
	_sendText: function (text) {
	    if (this.connected) {
    	    if (this._socket && this._socket.readyState == 1) {
        		this._socket.send(text);
        		this._connection.rawOutput(text);
        		return true;
    	    }
    	    else if (!this.socket || this.socket.readyState == 3) {
    	        // We're either not connected, or the connection is not there.
    	        this._connection._doDisconnect();
    	        return false;
    	    }
    	    else {
    	        // What do we do. It means we're either disconnecting, or connecting. 
    	        return false;
    	    }
	    } else {
	        // We're not connected, so we can't send anything.
	        return false;
	    }
	},
	
	_keepalive: function () {
        if (this.connected) {
    	    setTimeout(function () {
    	        if (this._sendText("")) {
        	        this._keepalive();
    	        }
    	    }.bind(this), 30000);
        }
	}
	
}
	
