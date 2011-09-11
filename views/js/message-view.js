var MessageView = Backbone.View.extend({
    tagName: "div",
    className: "message text",
    events: {
        "click .up": "handleUpClick",
        "click .down": "handleDownClick",
        "click .expand": "handleExpandClick",
        "click": "handleClick"
    },
    // TODO: i'd prefer is we didn't set style attributes. Also, the favicon can be an img tag, just for cleanliness when writing to the template.
    template: _.template([
        '<span class="controls">',
            '<button class="vote down">',
                '<img class="vote down" src="../images/minus.png" />',
            '</button>',
            '<button class="vote up">',
                '<img class="vote up" src="../images/plus.png" />',
            '</button>',
        '</span>',
        '<div class="full-content" style="display:none;"><%= Msgboy.helper.cleaner.html(model.text()) %></div>',
        '<p><%= Msgboy.helper.cleaner.html(model.attributes.title) %></p>',
        '<h1 style="background-image: url(<%= model.faviconUrl() %>)"><%= Msgboy.helper.cleaner.html(model.attributes.source.title) %></h1>'
    ].join('')),
    // TODO: get actual group styling html, (this is just a placeholder)
    groupTemplate: _.template([
        '<h1 style="background-image: url(<%= model.faviconUrl() %>)">GROUP: <%= Msgboy.helper.cleaner.html(model.attributes.source.title) %></h1>',
        '<button class="expand"><br><br>EXPAND!<br><br><br></button>',
        '<div>Contains: <%= model.messages.length %></div>'
    ].join('')),
    initialize: function () {
        this.model.view = this; // store reference to view on model
        this.model.bind("change", this.render.bind(this));
        this.model.messages.bind('add', this.render.bind(this));
        this.render();
    },
    render: function () {
        var el = $(this.el),
            isGroup = this.model.messages.length > 1;
        
        // set some attributes on the container div
        $(this.el).attr({
            'data-msgboy-relevance': this.model.get('relevance'),
            'id': isGroup ? 'group_' + this.model.id : this.model.id,
            'data-msgboy-state': this.model.get('state')
        });
        
        // remove all the brick classes, add new one
        el.removeClass("brick-1 brick-2 brick-3 brick-4");
        el.addClass(this.getBrickClass());
        el.addClass(this.getBoxColor());
        
        // render our compiled template
        if (isGroup) {
            el.html(this.groupTemplate({model: this.model}));
        } else {
            el.html(this.template({model: this.model}));
        }
        
        $(this.el).find('.full-content img').load(this.handleImageLoad.bind(this));



        // adding for initial load attention-getting shimmer. not sure if this is the right spot for this. -eric
        $('.controls').fadeIn();
        $('.message:nth-child(3n+1) .controls button').addClass('shimmer');

        $('.shimmer').bind('webkitAnimationEnd', function(){
            $('.controls').fadeOut('slow');
            //$(this).removeClass('shimmer');
        });

    },
    
    
    // Browser event handlers
    
    handleClick: function (evt) {
        if (!$(evt.target).hasClass("vote")) {
            if (evt.shiftKey) {
                chrome.extension.sendRequest({
                    signature: "notify",
                    params: this.model.toJSON()
                });
            } else {
                chrome.extension.sendRequest({
                    signature: "tab",
                    params: {url: this.model.main_link(), selected: false}
                });
                this.trigger("clicked");
            }
        }
    },
    handleUpClick: function () {
        this.model.vote_up();


        // added by eric. self-reminder.
        $('#container').isotope('reLayout');

        $('.controls').fadeIn();
        $('.message:nth-child(3n+1) .controls button').addClass('shimmer');

        $('.shimmer').bind('webkitAnimationEnd', function(){
            $('.controls').fadeOut('slow');
            //$(this).removeClass('shimmer');
        });
    },
    handleDownClick: function () {
        this.model.vote_down(function (result) {
            if (result.unsubscribe) {
                var request = {
                    signature: "unsubscribe",
                    params: this.model.attributes.feed
                };
                chrome.extension.sendRequest(request);
                Msgboy.delete_from_feed(this.model.attributes.feed);
            }
        }.bind(this));


        // added by eric. self-reminder.
        $('#container').isotope('reLayout');

        $('.controls').fadeIn();
        $('.message:nth-child(3n+1) .controls button').addClass('shimmer');

        $('.shimmer').bind('webkitAnimationEnd', function(){
            $('.controls').fadeOut('slow');
            //$(this).removeClass('shimmer');
        });
    },
    handleExpandClick: function (e) {
        e.stopImmediatePropagation();
        
        // TODO: this is where we want to figure out how to insert items without pissing off isotope. It started stacking items when I tried using the insert method. Also tried inserting manually and doing reLayout.
        
        var self = this,
            newViews = $();
        
        this.model.messages.each(function (message) {
            var view = new MessageView({
                    model: message
                });
            if (message !== self.model) {
                newViews = newViews.after(view.el);
                view.render();
            }
        });
        
        // append them at the right spot
        $(self.el).after(newViews);
        
        // empty all the contained models
        this.model.messages.reset();
        
        // re-draw self
        this.render();
        
        // reload existing items, relayout, 
        $('#container').isotope('reloadItems').isotope('reLayout').isotope({sortBy:'originalOrder'});
        
        // $('#container').isotope({
        //     masonry: {
        //         columnWidth: 10
        //     }
        // })


        return false;
    },
    handleImageLoad: function (e) {
        var img = e.target,
            img_size = Msgboy.helper.element.original_size($(img));

        // eliminate the tracking pixels and ensure min of at least 50x50
        if (img.width > 50 && img.height > 50) {
            this.$("p").addClass("darkened");
            $(this.el).append('<img class="main" src="' + $(img).attr("src") + '"/>');
            // Resize the image.
            if (img_size.width / img_size.height > $(self.el).width() / $(self.el).height()) {
                this.$(".message > img.main").css("min-height", "150%");
            } else {
                this.$(".message > img.main").css("min-width", "100%");
            }
        }
    },
    
    
    // Util methods
    
    getBoxColor: function () {
        var sum = 0;
        _.each(this.model.attributes.source.title.split(""), function (c) {
            sum += c.charCodeAt(0);
        });
        return "color" + sum % 7;
    },
    getBrickClass: function () {
        var res,
            state = this.model.get('state');
        
        if (state === 'down-ed') {
            res = 1;
        } else if (state === 'up-ed') {
            res = 4;
        } else {
            res = Math.ceil(this.model.attributes.relevance * 4); 
        }
        return 'brick-' + res;
    }
});