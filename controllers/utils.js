Uri = function() {
    // and URI object
};

Uri.prototype = {
    toString: function() {
        str = ''
        if(this.protocol) {
            str += this.protocol + "://"
        }
        if(this.authority) {
            str += this.authority
        }
        if(this.relative) {
            str += this.relative
        }
        if(this.relative == "") {
            str += "/"
        }
        return str;
    }
}

function parseUri (str) {
  var	o   = parseUri.options,
  m   = o.parser[o.strictMode ? "strict" : "loose"].exec(str),
  uri = new Uri(),
  i   = 14;

  while (i--) uri[o.key[i]] = m[i] || "";

  uri[o.q.name] = {};
  uri[o.key[12]].replace(o.q.parser, function ($0, $1, $2) {
    if ($1) uri[o.q.name][$1] = $2;
  });

  return uri;
};

parseUri.options = {
  strictMode: false,
  key: ["source","protocol","authority","userInfo","user","password","host","port","relative","path","directory","file","query","anchor"],
  q:   {
    name:   "queryKey",
    parser: /(?:^|&)([^&=]*)=?([^&]*)/g
  },
  parser: {
    strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
    loose:  /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/
  }
};

function getIconUrl(url, done) {
    
    // return "http://www.blogsmithmedia.com/www.engadget.com/media/apple-touch-icon.png";
    done(parseUri(url).source + "/favicon.ico");
}

function truncate(text, len) {
    if (text.length > len) {
        text = text.substring(0, len);
        text = text.replace(/\w+$/, '');
        text  = text + "..."
    }
    return text;
};

function strip(html) {
    var tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent||tmp.innerText;
};

function main_link(links) {
    if(links["alternate"]) {
        if(links["alternate"]["text/html"]) {
            return links["alternate"]["text/html"][0].href;
        }
        else {
            // Hum, let's see what other types we have!
            return "";
        }
    }
    else {
        return "";
    }
};

function nameToId(name) {
    return name.toLowerCase().replace(/\s+/g, '-').replace(/\./g, '-')
};

function fibonacci(n){
    var o;
    return n < 2 ? n : n % 2 ? (o = fibonacci(n = -(-n >> 1))) * o + (o = fibonacci(n - 1)) * o : (fibonacci(n >>= 1) + 2 * fibonacci(n - 1)) * fibonacci(n);
};

Log = function(level) {
	this.level = level;
};

Log.levels 			= {};
Log.levels.debug 	= 100;
Log.levels.info 	= 200;
Log.levels.warning 	= 300;
Log.levels.error 	= 400;
Log.levels.fatal	= 500;

Log.prototype = {
	print: function(level, message) {
		if (this.level <= level) {
			console.log(message);
		}
	},
	debug: function(message) {
		this.print(Log.levels.debug, message)
	},
	info: function(message) {
		this.print(Log.levels.info, message)
	},
	warning: function(message) {
		this.print(Log.levels.warning, message)
	},
	error: function(message) {
		this.print(Log.levels.error, message)
	},
	fatal: function(message) {
		this.print(Log.levels.fatal, message)
	}
};

logger = new Log(Log.levels.error);

MsgboyHelper = function() {
    
}

MsgboyHelper.maths = function() {
    // Maths functions
}

MsgboyHelper.maths.array = function() {
    // Maths functions on arrays
}

MsgboyHelper.maths.array.normalized_deviation = function(array) {
    return MsgboyHelper.maths.array.deviation(array)/MsgboyHelper.maths.array.average(array);
}

MsgboyHelper.maths.array.deviation = function(array) {
    var avg = MsgboyHelper.maths.array.average(array); 
    var count = array.length;
    var i = count - 1;
    var v = 0;

    while(i >= 0) {
        v += Math.pow((array[ i ] - avg),2);
        i = i - 1;
    }
    return Math.sqrt(v/count);
}

MsgboyHelper.maths.array.average = function(array) {
    var count = array.length;
    var i = count - 1;
    var sum = 0;
    while(i >= 0){
        sum += array[i];
        i = i - 1;
    }
    return sum/count;
}

MsgboyHelper.events = function() {
    
}

MsgboyHelper.events.trigger = function(ev, object) {
    object = typeof(object) != 'undefined' ? object : {};
    var customEvent = document.createEvent('Event');
    customEvent.initEvent(ev, true, false);
    document.body.dispatchEvent(customEvent);
    return customEvent;
}

// This function, which requires JQUERY cleans up the HTML that it includes
MsgboyHelper.cleaner = {};
MsgboyHelper.cleaner.html = function(string) {
    // We must remove the <script> tags from the string first.
    string = string.replace(/(<script([^>]+)>.*<\/script>)/ig, ' ');
    var div = $("<div/>").html(string);
    var cleaned = $(MsgboyHelper.cleaner.dom(div.get()));
    return cleaned.html();
}

MsgboyHelper.cleaner.dom = function(element) {
    // Do stuff here :)
    // console.log($(element));
    // console.log(element.nodeName);
    $.each($(element).children(), function(index, child) {
        if(child.nodeName == "IMG") {
            if(MsgboyHelper.get_original_element_size.width < 2 || MsgboyHelper.get_original_element_size.height < 2) {
                MsgboyHelper.cleaner.remove(child);
            }
            else {
                var src = $(child).attr("src");
                if(!src) {
                    MsgboyHelper.cleaner.remove(child);
                }
                else if(src.match("http://rss.feedsportal.com/.*/*.gif")) {
                    MsgboyHelper.cleaner.remove(child);
                }
                else if(src.match("http://da.feedsportal.com/.*/*.img")) {
                    MsgboyHelper.cleaner.remove(child);
                }
                else if(src.match("http://ads.pheedo.com/img.phdo?.*")) {
                    MsgboyHelper.cleaner.remove(child);
                }
                else if(src.match("http://feedads.g.doubleclick.net/~at/.*")) {
                    MsgboyHelper.cleaner.remove(child);
                }
            }
        }
        else if(child.nodeName == "P") {
            if(child.childNodes.length == 0) {
                MsgboyHelper.cleaner.remove(child);
            }
            else {
                if(child.innerHTML.replace(/(<([^>]+)>)/ig,"").replace(/[^a-zA-Z 0-9 ]+/g,"").replace(/^\s+|\s+$/g,"") == "") {
                    // MsgboyHelper.cleaner.remove(child);
                }
            }
        }
        else if(child.nodeName == "NOSCRIPT") {
            MsgboyHelper.cleaner.remove(child);
        }
        else if(child.nodeName == "IFRAME") {
            MsgboyHelper.cleaner.remove(child);
        }
        else if(child.nodeName == "DIV") {
            if(child.childNodes.length == 0) {
                MsgboyHelper.cleaner.remove(child);
            }
            else {
                if(child.innerHTML.replace(/(<([^>]+)>)/ig,"").replace(/[^a-zA-Z 0-9 ]+/g,"").replace(/^\s+|\s+$/g,"") == "") {
                    MsgboyHelper.cleaner.remove(child);
                }
            }
        }
        else if(child.nodeName == "CENTER") {
            // We need to replace this with a p. We don't want specific formats...
            var p = document.createElement("P");
            p.innerHTML = child.innerHTML;
            child.parentNode.replaceChild(p,child);
            child = p;
        }
        else if(child.nodeName == "FONT") {
            // Let's replace with a span. We don't want specific formats!
            var span = document.createElement("SPAN");
            span.innerHTML = child.innerHTML;
            child.parentNode.replaceChild(span,child);
            child = span;
        }
        else if(child.nodeName == "BR") {
            MsgboyHelper.cleaner.remove(child);
        }
        else if(child.nodeName == "OBJECT") {
            MsgboyHelper.cleaner.remove(child);
        }
        else if(child.nodeName == "SCRIPT") {
            MsgboyHelper.cleaner.remove(child);
        }
        else if($(child).hasClass("mf-viral") || $(child).hasClass("feedflare")) {
            MsgboyHelper.cleaner.remove(child);
        }
        else {
            // Not much
        }
        
        // Remove style attributes
        $(child).removeAttr("style");
        $(child).removeAttr("align");
        $(child).removeAttr("width");
        $(child).removeAttr("height");
        $(child).removeAttr("class");
        $(child).removeAttr("border");
        $(child).removeAttr("cellpadding");
        $(child).removeAttr("cellspacing");
        $(child).removeAttr("valign");
        $(child).removeAttr("border");
        $(child).removeAttr("hspace");
        $(child).removeAttr("vspace");
        
        MsgboyHelper.cleaner.dom(child);
    })
    return element;
}

MsgboyHelper.cleaner.remove = function(element) {
    var parent = element.parentNode;
    if(parent) {
        parent.removeChild(element);
        if(parent.childNodes.length == 0) {
            MsgboyHelper.cleaner.remove(parent);
        }
    }
}

MsgboyHelper.get_original_element_size = function(el) {
    var clone = $(el).clone();
    clone.css("display", "none");
    clone.removeAttr('height');
    clone.removeAttr('width');
    clone.appendTo($("body"));
    var sizes = {width: clone.width(), height:clone.height()}
    clone.remove();
    return sizes;
}


if(typeof Msgboy == "undefined") {
    // Hopefully this should be part of the regular Msgboy
    var Msgboy = new function () {}
}

Msgboy.helper = {
};

Msgboy.helper.feediscovery = {};
Msgboy.helper.feediscovery.stack = [];
Msgboy.helper.feediscovery.get = function(_url, _callback) {
    Msgboy.helper.feediscovery.stack.push([_url, _callback]);
};
Msgboy.helper.feediscovery.run = function() {
    var next = Msgboy.helper.feediscovery.stack.shift();
    if(next) {
        $.ajax({url: "http://feediscovery.appspot.com/",
          data: {url: next[0]},
          success: function(data) {
              next[1](JSON.parse(data));
              Msgboy.helper.feediscovery.run();
          },
          error: function() {
              // Let's restack, in the back.
              Msgboy.helper.feediscovery.get(next[0], next[1]);
          }
        });
    } else {
        setTimeout(function() {
            Msgboy.helper.feediscovery.run();
        }, 1000);
    }
};
Msgboy.helper.feediscovery.run();





