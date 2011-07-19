var MessageView = Backbone.View.extend({
    tagName: "div",
    className: "message",
    
    events: {
        "click" : "click",
        "click .up": "up",
        "click .down": "down",
    },

    initialize: function() {
        _.bindAll(this, "render", "up", "down", "format");
        
        this.model.view = this;
        
        var controls = $("<span>", {
            class:"controls"
        }).appendTo($(this.el));
        $("<button>", {
            class:"vote up",
            text:"+"
        }).appendTo(controls);
        $("<button>", {
            class:"vote down",
            text:"-"
        }).appendTo(controls);
        
        $(this.el).attr("data-msgboy-relevance", this.model.attributes.relevance);
        $(this.el).attr("data-msgboy-state", this.model.attributes.state);
        
        if(Math.ceil(this.model.attributes.relevance * 4) == 1 || this.model.attributes.state == "down-ed") {
            $(this.el).addClass("brick-1");
        } else if(this.model.attributes.state == "up-ed"){
            $(this.el).addClass("brick-4");
        } else {
            $(this.el).addClass("brick-" +Math.ceil( this.model.attributes.relevance * 4));
        }
        
        $(this.el).attr("id", this.model.id);
        this.model.bind("change", this.render);
    },
    
    click: function(evt) {
        if(!$(evt.target).hasClass("vote")) {
            if(evt.shiftKey) {
                chrome.extension.sendRequest({notify: this.model.id});
            } else {
                chrome.extension.sendRequest({"tab": {url: this.model.main_link(), selected: false}});
                this.trigger("clicked");
            }
        }
    },
    
    format: function() {
        $(this.el).addClass("text");
        $("<div>", {
            "class": "full-content",
            "style": "display:none"
        }).html(MsgboyHelper.cleaner.html(this.model.text())).appendTo($(this.el));
        
        // Let's allow for the images to be loaded... but how long should we wait?
        setTimeout(function() {
            this.$(".full-content img").each(function(idx, img) {
                var img_size = MsgboyHelper.get_original_element_size(img);
                if(img_size.width > $(this.el).width() && img_size.height > $(this.el).height()) {
                    this.$("p").remove();
                    var img = $("<img/>").attr("src", $(img).attr("src"));
                    img.appendTo($(this.el));
                    // Resize the image.
                    if(img_size.width/img_size.height > $(this.el).width()/$(this.el).height()) {
                        this.$("img").css("max-height", "100%");
                    } else {
                        this.$("img").css("max-width", "100%");
                    }
                    this.$("h1").text(this.model.attributes.title).appendTo($(this.el));
                    $(this.el).bind("mouseover", function() {
                        this.$("h1").text(this.model.attributes.source.title).appendTo($(this.el));
                    }.bind(this));
                    $(this.el).bind("mouseout", function() {
                        this.$("h1").text(this.model.attributes.title).appendTo($(this.el));
                    }.bind(this));
                }
            }.bind(this));
        }.bind(this), 3000); // For now, let's wait for 2 seconds. It would be much much better if we had a callback that works when images have been loaded.
        
        // Adding the rest of the content.
        $("<p>").html(MsgboyHelper.cleaner.html(this.model.attributes.title)).appendTo($(this.el));
        $("<h1/>").text(this.model.attributes.source.title).appendTo($(this.el));
        this.$("h1").css("background-image", "url('http://g.etfv.co/" + this.model.source_link() + "?defaulticon=lightpng')");
        this.$("h1").css("width", "100%");
        
        // Chose a color for the box.
        var sum = 0
        _.each(this.model.attributes.source.title.split(""), function(c) {
            sum += c.charCodeAt(0);
        });
        $(this.el).addClass("color" + sum%7);
        this.trigger("rendered");
    },
    
    // Message was voted up
    up: function() {
        $(this.el).removeClass("brick-1");
        $(this.el).removeClass("brick-2");
        $(this.el).removeClass("brick-3");
        $(this.el).addClass("brick-4");
        this.trigger("change");
        this.model.vote_up();
    },
    
    // Message was voted down
    down: function() {
        $(this.el).removeClass("brick-2");
        $(this.el).removeClass("brick-3");
        $(this.el).removeClass("brick-4");
        $(this.el).addClass("brick-1");
        // this.trigger("change");
        this.model.vote_down(function(result) {
            if(result.unsubscribe) {
                var request = {
                    unsubscribe: this.model.attributes.feed
                };
                chrome.extension.sendRequest(request);
                this.trigger("delete-from-feed", this.model.attributes.feed);
            }
        }.bind(this));
    },
    
    render: function() {
        this.format();
    },
});

