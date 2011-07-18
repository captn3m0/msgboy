var Feed = Backbone.Model.extend({
    storeName: "feeds",
    database: msgboyDatabase,

    defaults: {
        "url":              "",
        "seen_at":          [],
        "last_skipped_at":  null,
        "last_subscribed_at":    null
    },
    
    // Marks the feed as seen and makes sure we delete all elements older than 1 week
    mark_as_seen: function(options) {
        this.attributes.seen_at.push(new Date().getTime());
        this.attributes.seen_at = (this.attributes.seen_at).splice(-10); // We only keep the last 10 visits.
        this.save({}, options);
    },
    
    mark_as_skipped: function(options) {
        this.save({
            last_skipped_at: new Date().getTime(),
            seen_at: []
        }, options);
    },

    mark_as_subscribed: function(options) {
        this.save({
            last_subscribed_at: new Date().getTime(),
            seen_at: []
        }, options);
    }
});
