var Feed = Backbone.Model.extend({
    storeName: "feeds",
    database: msgboyDatabase,

    defaults: {
        "url":              "",
        "seen_at":          [],
        "last_skipped_at":  null,
        "subscribed_at":    null
    },
    
    // Marks the feed as seen and makes sure we delete all elements older than 1 week
    mark_as_seen: function(options) {
        this.attributes.seen_at.push(new Date().getTime())
        this.attributes.seen_at = (this.attributes.seen_at).splice(-10) // We only keep the last 10 visits.
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
            subscribed_at: new Date().getTime(),
            seen_at: []
        }, options);
    },
    
    needs_suggestion: function() {
        if(this.attributes.subscribed_at) {
            // If the feed was already subscribed... no need to ask for a re-subscribe
            return false;
        }
        else if(this.attributes.last_skipped_at > (new Date().getTime() - 1000 * 60 * 60 * 24 * 30)){
            // Let's just ask once a month.
            return false;
        }
        else {
            // We should look at the seen_at array to determine if we should ask the user.
            // We want to offer the ability to subscribe of the user has seen the feed "regularly"
            // To do that we compute the variance
            diffs = []
            for(var i=0; i < this.attributes.seen_at.length - 2; i++) {
                diffs[i] =  this.attributes.seen_at[i+1] - this.attributes.seen_at[i];
            }
            console.log(diffs)
            console.log(normalizedDeviation(diffs))
            console.log(diffs.length)
            if(normalizedDeviation(diffs) < 1 && diffs.length >= 3) {
                return true
            }
            else {
                return false
            }
        }
    }

});
