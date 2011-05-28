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
        text  = text + "&hellip;"
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
