var OptionsView = Backbone.View.extend({
    events: {
        "change input": "change"
    },
    el: "#options",

    initialize: function () {
        _.bindAll(this, "render", "change");
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
    }
});
