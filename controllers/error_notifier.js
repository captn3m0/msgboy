/* This was shamelessly stolen from the regular Airbrake JS notifier. We have to do this because there is an issue with the scheme used to build the URL to which errors are sent. */
var AirbrakeNotifier = {
    KEY               : '47bdc2ad25b662cee947d0a1c353e974',
    HOST              : 'hoptoadapp.com',
    NOTICE_XML        : '<?xml version="1.0" encoding="UTF-8"?><notice version="2.1"><api-key></api-key><notifier><name>msgboy_airbrake_notifier</name><version>0.1.0</version><url>http://msgboy.com</url></notifier><error><class>EXCEPTION_CLASS</class><message>EXCEPTION_MESSAGE</message><backtrace>BACKTRACE_LINES</backtrace></error><request><url>REQUEST_URL</url><component>REQUEST_COMPONENT</component><action>REQUEST_ACTION</action></request><server-environment><project-root>PROJECT_ROOT</project-root><environment-name></environment-name><app-version>APP_VERSION</app-version></server-environment></notice>',
    ROOT              : window.location.protocol + '//' + window.location.host,
    BACKTRACE_MATCHER : /^(.*) \((.*):(.*):(.*)\)$/,
    backtrace_filters : [/notifier\.js/],


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
        var matcher = /<environment-name>.*<\/environment-name>/;
        AirbrakeNotifier.NOTICE_XML  = AirbrakeNotifier.NOTICE_XML.replace(matcher, '<environment-name>' + value + '</environment-name>');
    },

    // Sets the host
    setHost: function (value) {
        AirbrakeNotifier.host = value;
    },

    // Sets the API Key
    setKey: function (value) {
        var matcher = /<api-key>.*<\/api-key>/;
        AirbrakeNotifier.NOTICE_XML = AirbrakeNotifier.NOTICE_XML.replace(matcher, '<api-key>' + value + '</api-key>');
    },

    // Sets the defaults for the error
    setErrorDefaults: function (value) {
        AirbrakeNotifier.errorDefaults = value;
    },

    // Generates XML
    generateXML: function (errorWithoutDefaults) {
        AirbrakeNotifier.setEnvironment(Msgboy.environment());
        errorWithoutDefaults.url = window.location.href;
        var error = AirbrakeNotifier.mergeDefault(AirbrakeNotifier.errorDefaults, errorWithoutDefaults);
        if (Msgboy.inbox && Msgboy.inbox.attributes && Msgboy.inbox.attributes.jid) {
            error.session = AirbrakeNotifier.mergeDefault({jid: Msgboy.inbox.attributes.jid}, error.session);
        }

        var xml       = AirbrakeNotifier.NOTICE_XML;
        var baseUrl   = error.url     || '';
        var hash      = location.hash || '';
        var url       = AirbrakeNotifier.escapeText((baseUrl + hash) || '');
        var component = AirbrakeNotifier.escapeText(error.component  || '');
        var action    = AirbrakeNotifier.escapeText(error.action     || '');
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
            var methods = ['params', 'session'];
            for (var i = 0; i < 2; i++) {
                var mtype = methods[i];

                if (error[mtype]) {
                    data += '<' + mtype + '>';
                    data += AirbrakeNotifier.generateVariables(error[mtype]);
                    data += '</' + mtype + '>';
                }
            }
            xml = xml.replace('</request>', data + '</request>').replace('REQUEST_URL', url).replace('REQUEST_ACTION', action).replace('REQUEST_COMPONENT', component);
        }
        return xml.replace('PROJECT_ROOT', AirbrakeNotifier.ROOT).replace('EXCEPTION_CLASS', type).replace('APP_VERSION', Msgboy.infos.version).replace('EXCEPTION_MESSAGE', message).replace('BACKTRACE_LINES', backtrace.join(''));
    },

    // Generates the XML backtrace to be sent.
    generateBacktrace: function (error) {
        error = error || {};
        var backtrace  = [];
        var stacktrace = error.stack;

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
    }
};

window.onerror = function (message, file, line) {
    setTimeout(function () {
        AirbrakeNotifier.notify({
            message : message,
            stack   : [] // We need a better way to extract the stack. The problem with this method is that the context changes with onerror and there is no way to retrieve te actual error/exception object.
        });
    }, 100);
    return true;
};


