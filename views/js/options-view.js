var OptionsView = Backbone.View.extend({
    events: {
        "change #relevance": "change",
        "click #reset_susbcriptions": "reset_susbcriptions"
    },
    el: "#options",

    initialize: function () {
        _.bindAll(this, "render", "change", "reset_susbcriptions");
        this.model = new Inbox();
        this.model.bind("change", function () {
            this.render();
            chrome.extension.sendRequest({
                signature: "reload",
                params: {}
            });
        }.bind(this));
        this.model.fetch();
    },

    render: function () {
        this.$("#relevance").val((1 - this.model.attributes.options.relevance) * 100);
    },

    change: function (event) {
        var attributes = {};
        attributes.options = {};
        attributes.options[event.target.id] = 1 - $(event.target).val() / 100;
        this.model.save(attributes);
    },

    reset_susbcriptions: function (event) {
        chrome.extension.sendRequest({
            signature: "reset_susbcriptions",
            params: {}
        }, function () {
            // Nothing to do.
        });
    }
});
