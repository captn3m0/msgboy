MsgboyModal = function(_onclose) {
    // Msgboy modal.
    if(typeof(_onclose) == "undefined") {
        this.onclose = function() {
            // Nothing.
        };
    } else {
        this.onclose = _onclose;
    }
};

MsgboyModal.prototype = {
    // hides the modal box
    hide: function() {
        $('#msgboy-mask').fadeOut(400, function() {
            $("#msgboy-mask").remove();
        });    
        $('#msgboy-dialog').fadeOut(400, function() {
            $("#msgboy-dialog").remove();
        });
   },

   // shows the modal box for subscriptions
   show: function(content) {
       var that = this;
       if($("#msgboy-dialog").length == 0) {
           // The mask
           $("<div>", {
               id: "msgboy-mask"
            }).appendTo("body");

       // The box
       $("<div>", {
           id: "msgboy-dialog",
       }).appendTo("body");

       // The close link
       $("<a>", {
           text: "close",
           id: "msgboy-dialog-close",
           click: function () {
               that.hide();
               this.onclose();
           }.bind(this)
       }).appendTo($("#msgboy-dialog"));
       content.appendTo($("#msgboy-dialog"));
   }
   $('#msgboy-mask').css({'width':$(window).width(),'height':$(document).height()});

   //transition effect     
   $('#msgboy-mask').fadeIn(400);

   //Get the window height and width
   var winH = $(window).height();
   var winW = $(window).width();

   //Set the popup window to center
   $("#msgboy-dialog").css('top',  winH/3-$("#msgboy-dialog").height()/2);
   $("#msgboy-dialog").css('left', winW/2-$("#msgboy-dialog").width()/2);

   //transition effect
   $("#msgboy-dialog").fadeIn(400);
}
};
