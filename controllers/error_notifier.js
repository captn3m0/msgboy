/** 
    CONFIGURATION:
    // Set your Airbrake API key here [REQ]
    AirbrakeNotifier.setKey("XXXX");
    
    // Set the environment. [OPT]
    AirbrakeNotifier.setEnvironment("development");
    
    // Set the app version [OPT]
    AirbrakeNotifier.setAppVersion("1.3.3.7");

    // Set the session variables [OPT]
    AirbrakeNotifier.setSessionVars({hello: "world"});

    // Set the Params [OPT]
    AirbrakeNotifier.setParams({page: 1});
    
    
    USAGE
    1. You can just catch errors and then do :
    try {
        ... die ...
    } catch(e) {
        AirbrakeNotifier.notify(e));
    }

    2. You can also use the window.onerror call, however, this call 'lost' the error object, so you have to create a new one (feel free to customize it)
    window.onerror = function (message, file, line) {
        var error = {
            arguments: [],
            message  : message.match(/Uncaught (.*): (.*)/)[2],
            stack    : ["-" + " (" + file + ":" + line + ":0)"],
            type     : message.match(/Uncaught (.*): (.*)/)[1]
        }
        AirbrakeNotifier.notify(e));
    };
*/

var AirbrakeNotifier = {
    AIRBRAKE_KEY      : '',
    APP_VERSION       : '1.0',
    SESSION_VARS      : [],
    PARAMS_VARS       : [],
    REQUEST_COMPONENT : "",
    APP_ENVIRONMENT   : 'development',
    HOST              : 'hoptoadapp.com',
    NOTICE_XML        : '<?xml version="1.0" encoding="UTF-8"?><notice version="2.1"><api-key>AIRBRAKE_KEY</api-key><notifier><name>chrome_app_airbrake_notifier</name><version>0.1.0</version><url></url></notifier><error><class>EXCEPTION_CLASS</class><message>EXCEPTION_MESSAGE</message><backtrace>BACKTRACE_LINES</backtrace></error><request><url>REQUEST_URL</url><component>REQUEST_COMPONENT</component><action>REQUEST_ACTION</action></request><server-environment><project-root>PROJECT_ROOT</project-root><environment-name>APP_ENVIRONMENT</environment-name><app-version>APP_VERSION</app-version></server-environment></notice>',
    ROOT              : window.location.protocol + '//' + window.location.host,
    BACKTRACE_MATCHER : /^(.*) \((.*):(.*):(.*)\)$/,
    
    // Generates the error XML and sends it to Airbrake's servers thru the inclusion of an iframe element.
    notify: function (error) {
        var xml     = escape(AirbrakeNotifier.generateXML(error));
        var host    = AirbrakeNotifier.host;
        var url     = '//' + host + '/notifier_api/v2/notices?data=' + xml;
        var request = document.createElement('iframe');
        request.style.width   = '1px';
        request.style.height  = '1px';
        request.style.display = 'none';
        request.src = "http:" + url; /* Adding http: to avoid using the default scheme. */
        document.getElementsByTagName('head')[0].appendChild(request);
    },

    // Sets the environment
    setEnvironment: function (value) {
        AirbrakeNotifier.APP_ENVIRONMENT = value;
    },

    // Sets the host
    setHost: function (value) {
        AirbrakeNotifier.HOST = value;
    },

    // Sets the session variables
    setSessionVars: function (value) {
        AirbrakeNotifier.SESSION_VARS = value;
    },

    // Sets the params
    setParams: function (value) {
        AirbrakeNotifier.PARAMS_VARS = value;
    },

    // Sets the API Key
    setKey: function (value) {
        AirbrakeNotifier.AIRBRAKE_KEY = value;
    },

    // Sets the defaults for the error
    setErrorDefaults: function (value) {
        AirbrakeNotifier.errorDefaults = value;
    },

    // Sets the app version
    setAppVersion: function(value) {
        AirbrakeNotifier.APP_VERSION = value;
    },

    // Generates XML
    generateXML: function (errorWithoutDefaults) {
        errorWithoutDefaults.url = window.location.href;
        var error = AirbrakeNotifier.mergeDefault(AirbrakeNotifier.errorDefaults, errorWithoutDefaults);

        var xml       = AirbrakeNotifier.NOTICE_XML;
        var baseUrl   = error.url     || '';
        var hash      = location.hash || '';
        var url       = AirbrakeNotifier.escapeText((baseUrl + hash) || '');
        var component = AirbrakeNotifier.escapeText(error.component  || '');
        var type      = AirbrakeNotifier.escapeText(error.type       || 'Error');
        var message   = AirbrakeNotifier.escapeText(error.message    || 'Unknown error.');

        var backtrace = AirbrakeNotifier.generateBacktrace(error);

        if (AirbrakeNotifier.trim(url) === '' && AirbrakeNotifier.trim(component) === '') {
            xml = xml.replace(/<request>.*<\/request>/, '');
        } else {
            var data    = '';
            var cgi_data = error['cgi-data'] || {};
            cgi_data.HTTP_USER_AGENT = navigator.userAgent;
            data += '<cgi-data>';
            data += AirbrakeNotifier.generateVariables(cgi_data);
            data += '</cgi-data>';

            data += '<session>';
            data += AirbrakeNotifier.generateVariables(AirbrakeNotifier.SESSION_VARS);
            data += '</session>';

            data += '<params>';
            data += AirbrakeNotifier.generateVariables(AirbrakeNotifier.PARAMS_VARS);
            data += '</params>';
            
            xml = xml.replace('</request>', data + '</request>');
            xml = xml.replace('REQUEST_URL', url);
            xml = xml.replace('REQUEST_COMPONENT', component);
            xml = xml.replace('REQUEST_ACTION', ""); // Not applicable to Chrome Applications
        }
        
        xml = xml.replace('PROJECT_ROOT', AirbrakeNotifier.escapeText(AirbrakeNotifier.ROOT));
        xml = xml.replace('EXCEPTION_CLASS', type);
        xml = xml.replace('APP_VERSION', AirbrakeNotifier.APP_VERSION);
        xml = xml.replace('EXCEPTION_MESSAGE', message);
        xml = xml.replace('BACKTRACE_LINES', backtrace.join(''));
        xml = xml.replace('AIRBRAKE_KEY', AirbrakeNotifier.escapeText(AirbrakeNotifier.AIRBRAKE_KEY));
        xml = xml.replace('APP_ENVIRONMENT', AirbrakeNotifier.escapeText(AirbrakeNotifier.APP_ENVIRONMENT));
        return xml;
    },

    // Generates the XML backtrace to be sent.
    generateBacktrace: function (error) {
        error = error || {};
        var backtrace  = [];
        var stacktrace = error.stack;

        if(error.stack.length === 0) {
            stacktrace = AirbrakeNotifier.getStackTrace();
        }

        for (var i = 0, l = stacktrace.length; i < l; i++) {
            var line    = stacktrace[i];
            var matches = line.match(AirbrakeNotifier.BACKTRACE_MATCHER);
            if (matches) {
                var file = matches[2].replace(AirbrakeNotifier.ROOT, '[PROJECT_ROOT]');
                backtrace.push('<line method="' + AirbrakeNotifier.escapeText(matches[1]) + '" file="' + AirbrakeNotifier.escapeText(file) + '" number="' + matches[3] + '" />');
            }
        }
        return backtrace;
    },


    // Generate the XML variables
    generateVariables: function (parameters) {
        var key;
        var result = '';

        for (key in parameters) {
            result += '<var key="' + AirbrakeNotifier.escapeText(key) + '">' +
            AirbrakeNotifier.escapeText(parameters[key]) +
            '</var>';
        }
        return result;
    },

    // Escape Text for XML
    escapeText: function (text) {
        return text.replace(/&/g, '&#38;').replace(/</g, '&#60;').replace(/>/g, '&#62;').replace(/'/g, '&#39;').replace(/"/g, '&#34;');
    },

    // Deletes trainling whitespaces
    trim: function (text) {
        return text.toString().replace(/^\s+/, '').replace(/\s+$/, '');
    },

    // Mergeing defaults.
    mergeDefault: function (defaults, hash) {
        var cloned = {};
        var key;
        for (key in hash) {
            cloned[key] = hash[key];
        }
        for (key in defaults) {
            if (!cloned.hasOwnProperty(key)) {
                cloned[key] = defaults[key];
            }
        }
        return cloned;
    },

    // Returns a stack Trace
    getStackTrace: function() {
        var obj = {};
        Error.captureStackTrace(obj, AirbrakeNotifier.getStackTrace);
        var lines = obj.stack.split("\n");
        var stack = [];
        lines.forEach(function(line) {
            stack.push(line.trim().replace("at", "").trim());
        });
        return stack;
    }
};



window.onerror = function (message, file, line) {
    // Set your Airbrake API key here [REQ]
    AirbrakeNotifier.setKey("47bdc2ad25b662cee947d0a1c353e974");
    
    // Set the environment. [OPT]
    AirbrakeNotifier.setEnvironment(Msgboy.environment());
    
    // Set the app version [OPT]
    AirbrakeNotifier.setAppVersion(Msgboy.infos.version);

    // Set the session variables [OPT]
    AirbrakeNotifier.setSessionVars({jid: "1337"});

    // Set the Params [OPT]
    AirbrakeNotifier.setParams([]);
    
    setTimeout(function () {
        AirbrakeNotifier.notify({
            arguments: [],
            message  : message.match(/Uncaught (.*): (.*)/)[2],
            stack    : ["-" + " (" + file + ":" + line + ":0)"],
            type     : message.match(/Uncaught (.*): (.*)/)[1]
        });
    }, 100);
    return true;
};


