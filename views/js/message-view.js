var MessageView = Backbone.View.extend({
    tagName: "div",
    className: "message",
    
    events: {
        "click" : "click",
        "click .up": "up",
        "click .down": "down",
    },

    initialize: function() {
        _.bindAll(this, "render", "up", "down", "format", "image_layout", "text_layout", "adjust_title");
        
        this.model.view = this;
        
        var controls = $("<span>", {
            class:"controls"
        }).appendTo($(this.el));
        $("<button>", {
            class:"up",
            text:"+"
        }).appendTo(controls);
        $("<button>", {
            class:"down",
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
        if(evt.shiftKey) {
            chrome.extension.sendRequest({notify: this.model.id});
        } else {
            chrome.extension.sendRequest({"tab": {url: this.model.main_link(), selected: false}});
        }
    },
    
    format: function() {
        if(this.model.layout() == "image") {
            this.image_layout();
        }
        else {
            this.text_layout();
        }
    },
    
    image_layout: function() {
        // Let's check that the img is not too small! If it is, we may want to switch to a text view...
        var img_size = MsgboyHelper.get_original_element_size(this.$("img").get());
        if(img_size.width < $(this.el).width()) {
            this.text_layout();
        }
        else {
            $(this.el).addClass("image");
            $("<h1/>").text(this.model.attributes.title).appendTo($(this.el));
            this.$("h1").css("background-image", "url('http://g.etfv.co/" + this.model.source_link() + "?defaulticon=lightpng')");

            var img = $("<img/>").attr("src", this.model.image());
            img.appendTo($(this.el));

            if(img_size.width/img_size.height > $(this.el).width()/$(this.el).height()) {
                this.$("img").css("max-height", "100%");
            } else {
                this.$("img").css("max-width", "100%");
            }


            this.adjust_title();
            this.trigger("rendered");
        }
    },
    
    text_layout: function() {
        $(this.el).addClass("text");
        $("<p>").html(MsgboyHelper.cleaner.html(this.model.attributes.title)).appendTo($(this.el));
        $("<h1/>").text(this.model.attributes.source.title).appendTo($(this.el));
        this.$("h1").css("background-image", "url('http://g.etfv.co/" + this.model.source_link() + "?defaulticon=lightpng')");
        this.adjust_title();
        var sum = 0
        _.each(this.model.attributes.source.title.split(""), function(c) {
            // console.log(c);
            sum += c.charCodeAt(0);
        });
        $(this.el).addClass("color" + sum%7);
        this.trigger("rendered");
    },
    
    adjust_title: function() {
        // this.$("h1").css("font-size", "20px");
        // var i = parseInt(this.$("h1").css("font-size"));
        // while((MsgboyHelper.get_original_element_size(this.$("h1")).width + 40) > $(this.el).width() && i > 6) {
        //     this.$("h1").css("font-size", --i+"px");
        // }
        this.$("h1").css("width", "100%");
    },
    
    // Message was voted up
    up: function() {
        $(this.el).removeClass("brick-1");
        $(this.el).removeClass("brick-2");
        $(this.el).removeClass("brick-3");
        $(this.el).addClass("brick-4");
        this.trigger("change");
        this.model.vote_up();
        this.adjust_title(function() {
        });
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
                archiveView.delete_from_feed(this.model.attributes.feed);
            }
        }.bind(this));
    },
    
    render: function() {
        this.format();
    },
});

