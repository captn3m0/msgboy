Strophe.Socket = function (service)
{
	// Connection
	this.connection = null;
	// Requests stack.
	this._requests = [];    
	this.connected = false
};

Strophe.Socket.prototype = {
	
	/** Function connect 
	 *  Connects to the server using websockets.
	 *  It also assigns the connection to this proto
	 */
	connect: function (connection) {
		
	},
	
	/** Function disconnect 
	 *  Disconnects from the server
	 */
	disconnect: function () {
		
	},

	/** Function finish 
	 *  Finishes the connection
	 */
	finish: function () {
		
	},
	
	/** Function send 
	 *  Sends messages
	 */
	send: function (stanza) {
		return true;
	},
	
	/** Function: restart
     *  Send an xmpp:restart stanza.
     */
	restart: function () {
		
	}
}
	
