var ArchiveView = Backbone.View.extend({
    now: new Date().getTime(),
    days: 1,
    loaded: 20,
    to_load: 20,
    latest: null,
    events: {
    },
    initialize: function () {
        _.bindAll(this, 'render', 'delete_from_feed', 'show_new', 'complete_page', 'load_next');
        $(document).scroll(this.complete_page);
        this.collection.comparator = function (message) {
            return -message.attributes.created_at;
        };
        this.collection.bind("add", this.show_new);
        this.load_next();
    },
    complete_page: function () {
        if ($("#container").height() < $(window).height()) {
            // We should also pre-emptively load more pages if the document is shorter than the page.
            this.load_next();
        } else if ($(window).scrollTop() > $(document).height() - $(window).height() - 300) {
            // We're close to the bottom. Let's load an additional page!
            this.load_next();
        }
    },
    load_next: function () {
        if (this.loaded === this.to_load) {
            this.loaded = 0;
            this.collection.next(this.to_load, {
                created_at: [this.now, this.now - this.days * (1000 * 60 * 60 * 24)]
            });
        }
    },
    render: function () {
        $(".message").remove(); // Cleanup
    },
    show_new: function (message) {
        this.loaded++;
        var view = new MessageView({
            model: message
        });
        view.bind("change", function () {
            $('#container').isotope('reLayout');
        });
        view.bind("rendered", function () {
            this.complete_page();
            $('#container').isotope('appended', $(view.el), function () {
                $(view.el).show();
            }.bind(this));
        }.bind(this));
        $(view.el).hide();
        $("#container").append(view.el); // Adds the view in the document.
        view.bind("delete-from-feed", function (url) {
            this.delete_from_feed(url);
            $('#container').isotope('reLayout');
        }.bind(this));
        view.render(); // builds the HTML
        if(this.latest && this.latest.attributes.alternate === message.attributes.alternate) {
            view.group_with(this.latest.view);
        }
        this.latest = message;
    },
    delete_from_feed: function (feed) {
        _.each(this.collection.models, function (model) {
            if (model.attributes.feed === feed) {
                model.view.remove();
                model.destroy({
                    success: function () {
                    }
                });
            }
        });
    }
});

