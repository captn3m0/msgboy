var Subscription = Backbone.Model.extend({
    storeName: "subscriptions",
    database: msgboyDatabase,
    defaults: {
        subscribed_at: 0,
        unsubscribed_at: 0,
        state: "unsubscribed"
    },
    initialize: function (attributes) {
    },
    fetch_or_create: function (callback) {
        this.fetch({
            success: function () {
                // The subscription exists!
                callback();
            }.bind(this),
            error: function () {
                // There is no such subscription.
                // Let's save it, then!
                this.save(this.attributes, {
                    success: function () {
                        callback();
                    },
                    error: function () {
                        // We're screwed.
                    }
                });
            }.bind(this)
        });
    },
    needs_refresh: function () {
        if (this.attributes.subscribed_at < new Date().getTime() - 1000 * 60 * 60 * 24 * 7 &&
            this.attributes.unsubscribed_at < new Date().getTime() - 1000 * 60 * 60 * 24 * 31) {
            return true;
        }
        return false;
    },
    set_state: function (_state) {
        switch (_state) {
        case "subscribed":
            this.save({state: _state, subscribed_at: new Date().getTime()}, {
                success: function () {
                    this.trigger("subscribed");
                }.bind(this)
            });
            break;
        case "unsubscribed":
            this.save({state: _state, unsubscribed_at: new Date().getTime()}, {
                success: function () {
                    this.trigger("unsubscribed");
                }.bind(this)
            });
            break;
        default:
            this.save({state: _state}, {
                success: function () {
                    this.trigger(_state);
                }.bind(this),
                error: function (o, e) {
                    // Dang
                }
            });
        }
    }
});

var Subscriptions = Backbone.Collection.extend({
    storeName: "subscriptions",
    database: msgboyDatabase,
    model: Subscription,
    pending: function () {
        this.fetch({
            conditions: {state: "subscribing"},
            addIndividually: true,
            limit: 100
        });
    },
    clear: function () {
        this.fetch({
            clear: true
        });
    }
});
