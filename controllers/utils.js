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


// Hopefully this should be part of the regular Msgboy
if(typeof Msgboy == "undefined") {
    var Msgboy = new function () {}
}

// Let's define the helper module.
if(typeof Msgboy.helper == "undefined") {
    Msgboy.helper = {};
}

// Feediscovery module. The only API that needs to be used is the Msgboy.helper.feediscovery.get
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


// The DOM cleaner
Msgboy.helper.cleaner = {};
// This function, which requires JQUERY cleans up the HTML that it includes
Msgboy.helper.cleaner.html = function(string) {
    // We must remove the <script> tags from the string first.
    string = string.replace(/(<script([^>]+)>.*<\/script>)/ig, ' ');
    var div = $("<div/>").html(string);
    var cleaned = $(Msgboy.helper.cleaner.dom(div.get()));
    return cleaned.html();
}
Msgboy.helper.cleaner.dom = function(element) {
    // Do stuff here :)
    // console.log($(element));
    // console.log(element.nodeName);
    $.each($(element).children(), function(index, child) {
        if(child.nodeName == "IMG") {
            if(Msgboy.helper.element.original_size.width < 2 || Msgboy.helper.element.original_size.height < 2) {
                Msgboy.helper.cleaner.remove(child);
            }
            else {
                var src = $(child).attr("src");
                if(!src) {
                    Msgboy.helper.cleaner.remove(child);
                }
                else if(src.match("http://rss.feedsportal.com/.*/*.gif")) {
                    Msgboy.helper.cleaner.remove(child);
                }
                else if(src.match("http://da.feedsportal.com/.*/*.img")) {
                    Msgboy.helper.cleaner.remove(child);
                }
                else if(src.match("http://ads.pheedo.com/img.phdo?.*")) {
                    Msgboy.helper.cleaner.remove(child);
                }
                else if(src.match("http://feedads.g.doubleclick.net/~at/.*")) {
                    Msgboy.helper.cleaner.remove(child);
                }
            }
        }
        else if(child.nodeName == "P") {
            if(child.childNodes.length == 0) {
                Msgboy.helper.cleaner.remove(child);
            }
            else {
                if(child.innerHTML.replace(/(<([^>]+)>)/ig,"").replace(/[^a-zA-Z 0-9 ]+/g,"").replace(/^\s+|\s+$/g,"") == "") {
                    // Msgboy.helper.cleaner.remove(child);
                }
            }
        }
        else if(child.nodeName == "NOSCRIPT") {
            Msgboy.helper.cleaner.remove(child);
        }
        else if(child.nodeName == "IFRAME") {
            Msgboy.helper.cleaner.remove(child);
        }
        else if(child.nodeName == "DIV") {
            if(child.childNodes.length == 0) {
                Msgboy.helper.cleaner.remove(child);
            }
            else {
                if(child.innerHTML.replace(/(<([^>]+)>)/ig,"").replace(/[^a-zA-Z 0-9 ]+/g,"").replace(/^\s+|\s+$/g,"") == "") {
                    Msgboy.helper.cleaner.remove(child);
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
            Msgboy.helper.cleaner.remove(child);
        }
        else if(child.nodeName == "OBJECT") {
            Msgboy.helper.cleaner.remove(child);
        }
        else if(child.nodeName == "SCRIPT") {
            Msgboy.helper.cleaner.remove(child);
        }
        else if($(child).hasClass("mf-viral") || $(child).hasClass("feedflare")) {
            Msgboy.helper.cleaner.remove(child);
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
        
        Msgboy.helper.cleaner.dom(child);
    })
    return element;
}
Msgboy.helper.cleaner.remove = function(element) {
    var parent = element.parentNode;
    if(parent) {
        parent.removeChild(element);
        if(parent.childNodes.length == 0) {
            Msgboy.helper.cleaner.remove(parent);
        }
    }
}

// Helper for the DOM elements
Msgboy.helper.element = {};
// Returns the original size of the element.
Msgboy.helper.element.original_size = function(el) {
    var clone = $(el).clone();
    clone.css("display", "none");
    clone.removeAttr('height');
    clone.removeAttr('width');
    clone.appendTo($("body"));
    var sizes = {width: clone.width(), height:clone.height()}
    clone.remove();
    return sizes;
}

// Helpers for maths
Msgboy.helper.maths = {};
// Helpers for arrays of elements
Msgboy.helper.maths.array = {};
Msgboy.helper.maths.array.normalized_deviation = function(array) {
    return Msgboy.helper.maths.array.deviation(array)/Msgboy.helper.maths.array.average(array);
};
Msgboy.helper.maths.array.deviation = function(array) {
    var avg = Msgboy.helper.maths.array.average(array); 
    var count = array.length;
    var i = count - 1;
    var v = 0;

    while(i >= 0) {
        v += Math.pow((array[ i ] - avg),2);
        i = i - 1;
    }
    return Math.sqrt(v/count);
};
Msgboy.helper.maths.array.average = function(array) {
    var count = array.length;
    var i = count - 1;
    var sum = 0;
    while(i >= 0){
        sum += array[i];
        i = i - 1;
    }
    return sum/count;
};
// Helpers for numbers
Msgboy.helper.maths.number = {};
Msgboy.helper.maths.number.fibonacci = function(n){
    var o;
    return n < 2 ? n : n % 2 ? (o = Msgboy.helper.maths.number.fibonacci(n = -(-n >> 1))) * o + (o = Msgboy.helper.maths.number.fibonacci(n - 1)) * o : (Msgboy.helper.maths.number.fibonacci(n >>= 1) + 2 * Msgboy.helper.maths.number.fibonacci(n - 1)) * Msgboy.helper.maths.number.fibonacci(n);
};



