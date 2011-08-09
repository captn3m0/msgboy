Strophe.addConnectionPlugin('caps', {
    _connection: null,
    _disco_categories: [],
    _disco_features: [],
    _form_types: [],
    _node: null,

    // called by the Strophe.Connection constructor
    init: function (conn) {
        this._connection = conn;
        Strophe.addNamespace('CAPS', "http://jabber.org/protocol/caps");
        Strophe.addNamespace('X_DATA', "jabber:x:data")
    },

    // Called when the connection status changes
    statusChanged: function (status) {
        if (status === Strophe.Status.CONNECTED) {
            this._connection.addHandler(this.respondToDiscoInfo.bind(this), Strophe.NS.DISCO_INFO, 'iq', "get", null, null, null);
            this._connection.addHandler(this.respondToDiscoItems.bind(this), Strophe.NS.DISCO_ITEMS, 'iq', "get", null, null, null);
        }
    },

	respondToDiscoItems: function (stanza) {
		var iq = $iq({
			type: "result",
			id: $(stanza).attr('id'),
			to: $(stanza).attr('from')
		}).c("query", {
			xmlns: Strophe.NS.DISCO_ITEMS
		});
		
		this._connection.send(iq);
	},

	respondToDiscoInfo: function (stanza) {
        var that = this;
        $(stanza).find("query").each(function () {
            if ($(this).attr('node')) {
                if ($(this).attr('node') == that._node + "#" + that.generateVerificationString()) {
                    that.sendDiscoInfo(stanza);
                } else {
                    // Error Looks like the user didn't ask for the right version! TODO
                    console.log("----------- SEND ERROR MESSAGE / SPEC DOESNT SAY --------------")
                }
            }
			else {
                that.sendDiscoInfo(stanza);
			}
        });
        return true;
    },

	sendDiscoInfo: function (stanza) {
		var iq = $iq({
            type: "result",
            id: $(stanza).attr('id'),
            to: $(stanza).attr('from')
        }).c("query", {
            xmlns: Strophe.NS.DISCO_INFO,
            node: this._node + "#" + this.generateVerificationString()
        });
        $.each(this._disco_categories, function (index, cat) {
            iq.c("identity", {
                category: cat.category,
                name: cat.name,
                type: cat.type,
                'xml:lang': cat.lang
            }).up();
        });

        $.each(this._disco_features, function (index, feat) {
            iq.c("feature", {
                var: feat
            }).up();
        });

        $.each(this._form_types, function (index, form) {
            iq.c("x", {
                xmlns: Strophe.NS.X_DATA,
                type: "result",
            }).c("field", {
                "var": "FORM_TYPE",
                "type": "hidden"
            }).c("value").t(form.form_type).up().up();
            $.each(form.fields, function (index, field) {
                iq.c("field", {
                    "var": field.
                    var
                });
                $.each(field.values, function (index, value) {
                    iq.c("value").t(value).up();
                });
                iq.up();
            });
        });

        this._connection.send(iq);
	},

    addDiscoCategory: function (name, category, type, lang) {
        this._disco_categories.push({
            "name": name,
            "category": category,
            "type": type,
            "lang": lang
        })
        this._disco_categories = this._disco_categories.sort(function (cat1, cat2) {
            return cat1.category > cat2.category || cat1.type > cat2.type || cat1.lang > cat2.lang
        });
    },

    addDiscoFeature: function (feature) {
        this._disco_features.push(feature)
        this._disco_features = this._disco_features.sort();
    },

    setNode: function (node) {
        this._node = node;
    },

    //
    // form_type : urn:xmpp:dataforms:softwareinfo
    // fields : [{var: var, values: values}, {var: values}]
    addFormType: function (form_type, fields) {
        // First let's sort the vars in the fileds
        $.each(fields, function (index, fie) {
            fie.values = fie.values.sort();
        })
        // Then let's sort the fields
        fields = fields.sort(function (fie1, fie2) {
            return fie1.
            var > fie2.
            var
        });
        this._form_types.push({
            "form_type": form_type,
            "fields": fields
        });
        this._form_types = this._form_types.sort(function (for1, for2) {
            return for1.form_type > for2.form_type
        });
    },

    // Sends a presence that exposes capabilities of this client.
    sendPresenceWithCaps: function () {
        var pres = $pres({from:  this._connection.jid}).c("c", {
            xmlns: Strophe.NS.CAPS,
            hash: "sha-1",
            node: this._node,
            ver: this.generateVerificationString()
        });

        this._connection.send(pres);
        return true;
    },


    //
    // Generates the Verification string as specified in http://xmpp.org/extensions/xep-0115.html
    generateVerificationString: function () {
        s = "";
        $.each(this._disco_categories, function (index, disco_category) {
            s += disco_category.category + "/" + disco_category.type + "/" + disco_category.lang + "/" + disco_category.name + "<"
        });
        $.each(this._disco_features, function (index, disco_feature) {
            s += disco_feature + "<"
        });
        $.each(this._form_types, function (index, form_type) {
            s += form_type.form_type + "<"
            $.each(form_type.fields, function (index, field) {
                s += field.
                var +"<"
                $.each(field.values, function (index, value) {
                    s += value + "<"
                });
            });
        });

        return Base64.encode(Crypto.SHA1(s, {
            asString: true
        }));
    },




});