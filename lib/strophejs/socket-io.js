/*
	We need a a server that supports Socket-io :)
*/

Strophe.SocketIO = function(service)
{
	// Connection
	this.connection = null;
	// Requests stack.
	this._requests = [];    
	this.connected = false
};

Strophe.SocketIO.prototype = {
	
	/** Function connect 
	 *  Connects to the server using websockets.
	 *  It also assigns the connection to this proto
	 */
	connect: function(connection) {
		
	},
	
	/** Function disconnect 
	 *  Disconnects from the server
	 */
	disconnect: function() {
		
	},

	/** Function finish 
	 *  Finishes the connection
	 */
	finish: function() {
		
	},
	
	/** Function send 
	 *  Sends messages
	 */
	send: function(stanza) {
		
	},
	
	/** Function: restart
     *  Send an xmpp:restart stanza.
     */
	restart: function() {
		
	}
}
	
