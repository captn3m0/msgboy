/** PrivateConstructor: Strophe.Request
 *  Create and initialize a new Strophe.Request object.
 *
 *  Parameters:
 *    (XMLElement) elem - The XML data to be sent in the request.
 *    (Function) func - The function that will be called when the
 *      XMLHttpRequest readyState changes.
 *    (Integer) rid - The BOSH rid attribute associated with this request.
 *    (Integer) sends - The number of times this same request has been
 *      sent.
 */
Strophe.Request = function (elem, func, rid, sends)
{
    this.id = ++Strophe._requestId;
    this.xmlData = elem;
    this.data = Strophe.serialize(elem);
    // save original function in case we need to make a new request
    // from this one.
    this.origFunc = func;
    this.func = func;
    this.rid = rid;
    this.date = NaN;
    this.sends = sends || 0;
    this.abort = false;
    this.dead = null;
    this.age = function () {
        if (!this.date) { return 0; }
        var now = new Date();
        return (now - this.date) / 1000;
    };
    this.timeDead = function () {
        if (!this.dead) { return 0; }
        var now = new Date();
        return (now - this.dead) / 1000;
    };
    this.xhr = this._newXHR();
};

/** Strophe Namespaces for BOSH
 *  NS.HTTPBIND - HTTP BIND namespace from XEP 124.
 *  NS.BOSH - BOSH namespace from XEP 206.
 */
Strophe.NS['HTTPBIND'] = "http://jabber.org/protocol/httpbind",
Strophe.NS['BOSH'] = "urn:xmpp:xbosh",


Strophe.Request.prototype = {
    /** PrivateFunction: getResponse
     *  Get a response from the underlying XMLHttpRequest.
     *
     *  This function attempts to get a response from the request and checks
     *  for errors.
     *
     *  Throws:
     *    "parsererror" - A parser error occured.
     *
     *  Returns:
     *    The DOM element tree of the response.
     */
    getResponse: function () {
        var node = null;
        if (this.xhr.responseXML && this.xhr.responseXML.documentElement) {
            node = this.xhr.responseXML.documentElement;
            if (node.tagName == "parsererror") {
                Strophe.error("invalid response received");
                Strophe.error("responseText: " + this.xhr.responseText);
                Strophe.error("responseXML: " +
                              Strophe.serialize(this.xhr.responseXML));
                throw "parsererror";
            }
        } else if (this.xhr.responseText) {
            Strophe.error("invalid response received");
            Strophe.error("responseText: " + this.xhr.responseText);
            Strophe.error("responseXML: " +
                          Strophe.serialize(this.xhr.responseXML));
        }

        return node;
    },

    /** PrivateFunction: _newXHR
     *  _Private_ helper function to create XMLHttpRequests.
     *
     *  This function creates XMLHttpRequests across all implementations.
     *
     *  Returns:
     *    A new XMLHttpRequest.
     */
    _newXHR: function ()
    {
        var xhr = null;
        if (window.XMLHttpRequest) {
            xhr = new XMLHttpRequest();
            if (xhr.overrideMimeType) {
                xhr.overrideMimeType("text/xml");
            }
        } else if (window.ActiveXObject) {
            xhr = new ActiveXObject("Microsoft.XMLHTTP");
        }

        // use Function.bind() to prepend ourselves as an argument
        xhr.onreadystatechange = this.func.bind(null, this);

        return xhr;
    }
};

/** Class: Strophe.Bosh
 *  BOSH protocol for underlying XMPP connection.
 * 
 *  This class is the lower level protocol to communicate with the XMPP server, using BOSH.
 *  It's a simple refactor of the legacy StropheJS code, which used BOSH as well.
 * 
 *  It can also serve as a 'template' for other underlying protocols, such as XMPP socket (core protocol)
 *  or Websockets.
 */

/** Constructor Strophe.Bosh
 * Create and initialize a Strophe.Bosh object
 *  Parameters:
 *    (String) service - The BOSH service URL.
 *
 *  Returns:
 *    A new Strophe.Bosh object.
 */
Strophe.Bosh = function (service)
{
    /* The path to the httpbind service. */
    this.service = service;
    /* The connected JID. */
    /* request id for body tags */
    this.rid = Math.floor(Math.random() * 4294967295);
    /* The current session ID. */
    this.sid = null;
    this.streamId = null;

    // default BOSH values
    this.hold = 1;
    this.wait = 3;
    this.window = 5;

	// Connection
	this.connection = null;
	
	// Requests stack.
	this._requests = [];    
	
    this._sendNextRequestTimeout = null;
	this.connected = false
	this.disconnecting = false
};

Strophe.Bosh.prototype = {
	
    /** PrivateConstants: Timeout Values
     *  Timeout values for error states.  These values are in seconds.
     *  These should not be changed unless you know exactly what you are
     *  doing.
     *
     *  TIMEOUT - Timeout multiplier. A waiting request will be considered
     *      failed after Math.floor(TIMEOUT * wait) seconds have elapsed.
     *      This defaults to 1.1, and with default wait, 66 seconds.
     *  SECONDARY_TIMEOUT - Secondary timeout multiplier. In cases where
     *      Strophe can detect early failure, it will consider the request
     *      failed if it doesn't return after
     *      Math.floor(SECONDARY_TIMEOUT * wait) seconds have elapsed.
     *      This defaults to 0.1, and with default wait, 6 seconds.
     */
    TIMEOUT: 1.1,
    SECONDARY_TIMEOUT: 0.1,

	/** Function connect 
	 *  Connects to the server using Bosh
	 */
	connect: function (connection) {
		this.connection = connection;
		this.connected = true
		this.disconnecting = false
		
		body = this._buildBody();
		body.attrs({
			to: this.connection.domain, 
			wait: this.wait, 
			hold: this.hold, 
			content: 'text/xml; charset=utf-8',
			'xml:lang': 'en',
			'ver': '1.6',
			'xmpp:version': '1.0',
			'xmlns:xmpp': 'urn:xmpp:xbosh'
		});
		
		this._requests.push(body);
		
		// setup _sendNextRequest callback every 1/10th of a second
		this._sendNextRequestTimeout = setTimeout(this._sendNextRequest.bind(this), 100);
	},
	
	/** Function: disconnect
	 *  Disconnects from the Bosh server
	 *
	 */ 
	disconnect: function () {
		this.disconnecting = true
		body = this._buildBody();
		body.attrs({type: "terminate"});
		this._requests.push(body);
	},
	
	/** Function: send 
	 *  Sends the stanza to the wrapper
	 *
	 *  This wraps the stanza into a body element for Bosh.
	 */
	send: function (stanza) {
		body = this._buildBody();
		body.cnode(stanza);
		while (body.nodeTree != body.node) {
			body.up()
		}
		this._requests.push(body);
		return true;
	},
	
	/** Function: attach
     *  Attach to an already created and authenticated BOSH session.
     *
     *  This function is provided to allow Strophe to attach to BOSH
     *  sessions which have been created externally, perhaps by a Web
     *  application.  This is often used to support auto-login type features
     *  without putting user credentials into the page.
     *
     *  Parameters:
     *    (String) jid - The full JID that is bound by the session.
     *    (String) sid - The SID of the BOSH session.
     *    (String) rid - The current RID of the BOSH session.  This RID
     *      will be used by the next request.
     *    (Function) callback The connect callback function.
     *    (Integer) wait - The optional HTTPBIND wait value.  This is the
     *      time the server will wait before returning an empty result for
     *      a request.  The default setting of 60 seconds is recommended.
     *      Other settings will require tweaks to the Strophe.TIMEOUT value.
     *    (Integer) hold - The optional HTTPBIND hold value.  This is the
     *      number of connections the server will hold at one time.  This
     *      should almost always be set to 1 (the default).
     *    (Integer) wind - The optional HTTBIND window value.  This is the
     *      allowed range of request ids that are valid.  The default is 5.
     */
    attach: function (jid, sid, rid, callback, wait, hold, wind)
    {
        this.jid = jid;
        this.sid = sid;
        this.rid = rid;
        this.connect_callback = callback;

        this.domain = Strophe.getDomainFromJid(this.jid);

        this.authenticated = true;
        this.connected = true;

        this.wait = wait || this.wait;
        this.hold = hold || this.hold;
        this.window = wind || this.window;

        this.changeConnectStatus(Strophe.Status.ATTACHED, null);
    },
	
	/** PrivateFunction: _buildBody
     *  _Private_ helper function to generate the <body/> wrapper for BOSH.
     *
     *  Returns:
     *    A Strophe.Builder with a <body/> element.
     */
    _buildBody: function () {
        var bodyWrap = $build('body', {
            xmlns: Strophe.NS.HTTPBIND
        });

        return bodyWrap;
    },
	
    /** PrivateFunction: _sendNextRequest
     *  _Private_ handler to process events during idle cycle.
     *
     *  This handler is called every 100ms to fire timed handlers that
     *  are ready and keep poll requests going.
     */
    _sendNextRequest: function () {
		body = this._requests.shift();
		if (!body) {
			// We don't have a body. So we need to build one!
			body = this._buildBody()
		}

		body.attrs({rid: this.rid++}); // Put the rid
		
		if (this.sid !== null) {
            body.attrs({sid: this.sid});
        }

		// And now send the request.
		request = new Strophe.Request(
			body.tree(),
			this._onRequestStateChange.bind(this, this._dataRecv.bind(this)),
			body.tree().getAttribute("rid")
		);

		if (this.connected) {
			this._processRequest(request);
		}
    },

    _processRequest: function (req) {
        var reqStatus = -1;

        try {
            if (req.xhr.readyState == 4) {
                reqStatus = req.xhr.status;
            }
        } catch (e) {
            Strophe.error("caught an error in _requests[" + i +
                          "], reqStatus: " + reqStatus);
        }

        if (typeof(reqStatus) == "undefined") {
            reqStatus = -1;
        }

        // make sure we limit the number of retries
        if (req.sends > 5) {
            this._onDisconnectTimeout();
            return;
        }

        var time_elapsed = req.age();
        var primaryTimeout = (!isNaN(time_elapsed) &&
                              time_elapsed > Math.floor(Strophe.Bosh.TIMEOUT * this.wait));
        var secondaryTimeout = (req.dead !== null &&
                                req.timeDead() > Math.floor(Strophe.Bosh.SECONDARY_TIMEOUT * this.wait));
        var requestCompletedWithServerError = (req.xhr.readyState == 4 &&
                                               (reqStatus < 1 ||
                                                reqStatus >= 500));
        if (primaryTimeout || secondaryTimeout ||
            requestCompletedWithServerError) {
            if (secondaryTimeout) {
                Strophe.error("Request " +
                              this._requests[i].id +
                              " timed out (secondary), restarting");
            }
            req.abort = true;
            req.xhr.abort();
            // setting to null fails on IE6, so set to empty function
            req.xhr.onreadystatechange = function () {};
            this._requests[i] = new Strophe.Request(req.xmlData,
                                                    req.origFunc,
                                                    req.rid,
                                                    req.sends);
            req = this._requests[i];
        }

        if (req.xhr.readyState === 0) {
            Strophe.debug("request id " + req.id + "." + req.sends + " posting");

            req.date = new Date();
            try {
                req.xhr.open("POST", this.service, true);
            } catch (e2) {
                Strophe.error("XHR open failed.");
                if (!this.connected) {
                    this.connection.changeConnectStatus(Strophe.Status.CONNFAIL, "bad-service");
                }
                this.connection._doDisconnect();
                return;
            }

            // Fires the XHR request -- may be invoked immediately
            // or on a gradually expanding retry window for reconnects
            var sendFunc = function () {
                req.xhr.send(req.data);
            };

            // Implement progressive backoff for reconnects --
            // First retry (send == 1) should also be instantaneous
            if (req.sends > 1) {
                // Using a cube of the retry number creats a nicely
                // expanding retry window
                var backoff = Math.pow(req.sends, 3) * 1000;
                setTimeout(sendFunc, backoff);
            } else {
                sendFunc();
            }

            req.sends++;

            this.connection.xmlOutput(req.xmlData);
            this.connection.rawOutput(req.data);
        } else {
            Strophe.debug("_processRequest: " +
                          (i === 0 ? "first" : "second") +
                          " request has readyState of " +
                          req.xhr.readyState);
        }
    },

	
    /** PrivateFunction: _dataRecv
     *  _Private_ handler to processes incoming data from the the connection.
     *
     *  Except for _connect_cb handling the initial connection request,
     *  this function handles the incoming data for all requests.  This
     *  function also fires stanza handlers that match each incoming
     *  stanza.
     *
     *  Parameters:
     *    (Strophe.Request) req - The request that has data ready.
     */
    _dataRecv: function (req)
    {
	    // reactivate the timer to send the next Request
        clearTimeout(this._sendNextRequestTimeout);
        this._sendNextRequestTimeout = setTimeout(this._sendNextRequest.bind(this), 100);
    
        try {
            var elem = req.getResponse();
        } catch (e) {
            if (e != "parsererror") { throw e; }
            this.disconnect("strophe-parsererror");
        }
        if (elem === null) { return; }

        this.connection.xmlInput(elem);
        this.connection.rawInput(Strophe.serialize(elem));


        var typ = elem.getAttribute("type");
        var cond, conflict;
        if (this.disconnecting || (typ !== null && typ == "terminate")) {
            // Don't process stanzas that come in after disconnect
            if (this.connection.disconnecting) {
				this.connection._doDisconnect()
                return;
            }

			this.sid = null;

            // an error occurred
            cond = elem.getAttribute("condition");
            conflict = elem.getElementsByTagName("conflict");
            if (cond !== null) {
                if (cond == "remote-stream-error" && conflict.length > 0) {
                    cond = "conflict";
                }
                this.connection.changeConnectStatus(Strophe.Status.CONNFAIL, cond);
            } else {
                this.connection.changeConnectStatus(Strophe.Status.CONNFAIL, "unknown");
            }
            return;
        }
		
		// check to make sure we don't overwrite these.
	    if (!this.sid) {
			this.sid = elem.getAttribute("sid");
		}
		if (!this.stream_id) {
			this.stream_id = elem.getAttribute("authid");
		}
	
		var wind = elem.getAttribute('requests');
		if (wind) { this.window = parseInt(wind, 10); }
		var hold = elem.getAttribute('hold');
		if (hold) { this.hold = parseInt(hold, 10); }
		var wait = elem.getAttribute('wait');
		if (wait) { this.wait = parseInt(wait, 10); }

        // send each incoming stanza back to the connection
        var that = this;
        Strophe.forEachChild(elem, null, function (child) {
			that.connection.receiveData(child);
        });
   
 	},

	
	/** PrivateFunction: _onRequestStateChange
     *  _Private_ handler for Strophe.Request state changes.
     *
     *  This function is called when the XMLHttpRequest readyState changes.
     *  It contains a lot of error handling logic for the many ways that
     *  requests can fail, and calls the request callback when requests
     *  succeed.
     *
     *  Parameters:
     *    (Function) func - The handler for the request.
     *    (Strophe.Request) req - The request that is changing readyState.
     */
    _onRequestStateChange: function (func, req) {
        Strophe.debug("request id " + req.id + "." + req.sends + " state changed to " + req.xhr.readyState);

        if (req.abort) {
            req.abort = false;
            return;
        }

        // request complete
        var reqStatus;
        if (req.xhr.readyState == 4) {
            reqStatus = 0;
            try {
                reqStatus = req.xhr.status;
            } catch (e) {
                // ignore errors from undefined status attribute.  works
                // around a browser bug
            }

            if (typeof(reqStatus) == "undefined") {
                reqStatus = 0;
            }

            if (this.disconnecting) {
                if (reqStatus >= 400) {
                    this._hitError(reqStatus);
                    return;
                }
            }

            var reqIs0 = (this._requests[0] == req);
            var reqIs1 = (this._requests[1] == req);

            // request succeeded
            if (reqStatus == 200) {
                // if request 1 finished, or request 0 finished and request
                // 1 is over Strophe.SECONDARY_TIMEOUT seconds old, we need to
                // restart the other - both will be in the first spot, as the
                // completed request has been removed from the queue already
                if (reqIs1 ||
                    (reqIs0 && this._requests.length > 0 &&
                     this._requests[0].age() > Math.floor(Strophe.Bosh.SECONDARY_TIMEOUT * this.wait))) {
                    this._restartRequest(0);
                }
                // call handler
                Strophe.debug("request id " +
                              req.id + "." +
                              req.sends + " got 200");
                func(req);
                this.errors = 0;
            } else {
                Strophe.error("request id " +
                              req.id + "." +
                              req.sends + " error " + reqStatus +
                              " happened");
                if (reqStatus === 0 ||
                    (reqStatus >= 400 && reqStatus < 600) ||
                    reqStatus >= 12000) {
                    this._hitError(reqStatus);
                    if (reqStatus >= 400 && reqStatus < 500) {
                        this.connection.disconnect();
                    }
                }
            }

            if (!((reqStatus > 0 && reqStatus < 500) || req.sends > 5)) {
				/* TODO Handle Errors when trying to connect*/
            }
        }
    },
	
	
	/** Function: restart
     *  Send an xmpp:restart stanza.
     */
    restart: function () {
		body = this._buildBody();
		body.attrs({
			to: this.connection.domain, 
			'xml:lang': 'en',
			'ver': '1.6',
			'xmpp:version': '1.0',
			'xmlns:xmpp': 'urn:xmpp:xbosh',
			'xmpp:restart': true
		});
		
		this._requests.push(body);
    },


    /** PrivateFunction: _hitError
     *  _Private_ function to handle the error count.
     *
     *  Requests are resent automatically until their error count reaches
     *  5.  Each time an error is encountered, this function is called to
     *  increment the count and disconnect if the count is too high.
     *
     *  Parameters:
     *    (Integer) reqStatus - The request status.
     */
    _hitError: function (reqStatus)
    {
        this.errors++;
        Strophe.warn("request errored, status: " + reqStatus + ", number of errors: " + this.errors);
        if (this.errors > 4) {
            this._onDisconnectTimeout();
        }
	},

	/** Function: finish
	*   function to finish.
	*
	*  This is the last piece of the disconnection logic.  This resets the
	*  connection and alerts the user's connection callback.
	*/
	finish: function ()
	{
		Strophe.info("bosh::finish was called");
		this.connected = false;
		this.sid = null;
		this.streamId = null;
		this.rid = Math.floor(Math.random() * 4294967295);
	},	
};
