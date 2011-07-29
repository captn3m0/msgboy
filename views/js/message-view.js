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
            class:"vote down",
            html:"<img src='../images/minus.png' />"
        }).appendTo(controls);
        $("<button>", {
            class:"vote up",
            html:"<img src='../images/plus.png' />"
        }).appendTo(controls);
        
        $(this.el).attr("data-msgboy-relevance", this.model.attributes.relevance);
        $(this.el).attr("data-msgboy-state", this.model.attributes.state);
        
        if(this.model.attributes.state == "down-ed") {
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
                    //this.$("p").remove();
                    this.$("p").addClass("darkened");
                    var img = $("<img/>").attr("src", $(img).attr("src"));
                    img.appendTo($(this.el));
                    // Resize the image.
                    if(img_size.width/img_size.height > $(this.el).width()/$(this.el).height()) {
                        this.$(".message > img").css("min-height", "100%");
                        //this.$("img").css("height", "100%");
                    } else {
                        this.$(".message > img").css("min-width", "100%");
                        //this.$("img").css("width", "100%");
                    }
                    
                    // show the source title.
                    this.$("h1").text(this.model.attributes.source.title).appendTo($(this.el));
                }
            }.bind(this));
        }.bind(this), 2000); // For now, let's wait for 2 seconds. It would be much much better if we had a callback that works when images have been loaded.
        
        // Adding the rest of the content.
        $("<p>").html(MsgboyHelper.cleaner.html(this.model.attributes.title)).appendTo($(this.el));
        $("<h1/>").text(this.model.attributes.source.title).appendTo($(this.el));
        this.$("h1").css("background-image", "url('http://g.etfv.co/" + this.model.source_link() + "?defaulticon=lightpng')");
        //this.$("h1").css("width", "100%");
        
        // Chose a color for the box.
        var sum = 0
        _.each(this.model.attributes.source.title.split(""), function(c) {
            sum += c.charCodeAt(0);
        });
        $(this.el).addClass("color" + sum%7);
        // using grayscale for the time being. pending new color palette. -&yet:eric
        //$(this.el).css("background-color", "hsl(240,0%," + (sum%7)*10 + "%)");
        //$("<p>").html(MsgboyHelper.cleaner.html(sum%7)).appendTo($(this.el));
        this.trigger("rendered");
    },
    
    // Message was voted up
    up: function() {
        if ($(this.el).hasClass("brick-1")) {
            $(this.el).removeClass("brick-1");
            $(this.el).addClass("brick-2");
        }
        else if ($(this.el).hasClass("brick-2")) {
            $(this.el).removeClass("brick-2");
            $(this.el).addClass("brick-3");   
        }
        else if ($(this.el).hasClass("brick-3")) {
            $(this.el).removeClass("brick-3");
            $(this.el).addClass("brick-4");
        }
        this.trigger("change");
        this.model.vote_up();
    },
    
    // Message was voted down
    down: function() {
        if ($(this.el).hasClass("brick-2")) {
            $(this.el).removeClass("brick-2");
            $(this.el).addClass("brick-1");
        } else if ($(this.el).hasClass("brick-3")) {
            $(this.el).removeClass("brick-3");
            $(this.el).addClass("brick-2");
        } else if ($(this.el).hasClass("brick-4")) {
            $(this.el).removeClass("brick-4");
            $(this.el).addClass("brick-3");
        }
        // this.trigger("change");
        this.model.vote_down(function(result) {
            if(result.unsubscribe) {
                var request = {
                    signature: "unsubscribe",
                    params: this.model.attributes.feed
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

