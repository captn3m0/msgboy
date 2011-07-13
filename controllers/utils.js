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

function arrayAverage(array){
    var count = array.length;
    var i = count - 1;
    var sum = 0;
    while(i >= 0){
        sum += array[i];
        i = i - 1;
    }
    return sum/count;
}

function arrayDeviation(array){
    var avg = arrayAverage(array); 
    var count = array.length;
    var i = count - 1;
    var v = 0;

    while(i >= 0) {
        v += Math.pow((array[ i ] - avg),2);
        i = i - 1;
    }
    return Math.sqrt(v/count);
}

function normalizedDeviation(array) {
    return arrayDeviation(array)/arrayAverage(array);
}

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

MsgboyHelper.events = function() {
    
}

MsgboyHelper.events.trigger = function(ev, object) {
    object = typeof(object) != 'undefined' ? object : {};
    var customEvent = document.createEvent('Event');
    customEvent.initEvent(ev, true, false);
    document.body.dispatchEvent(customEvent);
    return customEvent;
}

MsgboyHelper.links_to_feeds_at_url = function(_url, callback) {
    $.ajax({url: "http://feediscovery.appspot.com/",
      data: {url: _url},
      success: function(data) {
          callback(JSON.parse(data));
      }
    });
}


// This function, which requires JQUERY cleans up the HTML that it includes
MsgboyHelper.cleaner = {};
MsgboyHelper.cleaner.html = function(string) {
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
            if($(child).attr("width") < 2 && $(child).attr("height") < 2) {
                MsgboyHelper.cleaner.remove(child);
            }
            else {
            }
        }
        else if(child.nodeName == "P") {
            if(child.childNodes.length == 0) {
                MsgboyHelper.cleaner.remove(child);
            }
            else {
                if(child.innerHTML.replace(/(<([^>]+)>)/ig,"").replace(/[^a-zA-Z 0-9 ]+/g,"").replace(/^\s+|\s+$/g,"") == "") {
                    MsgboyHelper.cleaner.remove(child);
                }
            }
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
            // We should remove that element, but keep its children...
            MsgboyHelper.cleaner.remove(child);
        }
        else if(child.nodeName == "BR") {
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
        
        MsgboyHelper.cleaner.dom(child);
    })
    return element
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

MsgboyHelper.get_original_img_size = function(img) {
    var clone = $(img).clone();
    clone.css("display", "none");
    clone.removeAttr('height');
    clone.removeAttr('width');
    clone.appendTo($("body"));
    return {width: clone.width(), height:clone.height()};
}