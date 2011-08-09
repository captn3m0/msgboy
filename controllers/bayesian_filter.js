var BayesianFilter = {};

BayesianFilter.bayes = new brain.BayesianClassifier({
    backend: {
        type: 'localStorage',
        options: {
            name: 'msgboy-bayes-filter'
        }
    }
});

// This loads all the recent messages and trains the filter
BayesianFilter.load = function () {
};

// Trains the filter with a message
BayesianFilter.train_with_message = function (message) {
    if (message.attributes.state === "up-ed" || message.attributes.state === "down-ed") {
        var txt = BayesianFilter._prepare_text(message.attributes.title + " " + message.text());
        BayesianFilter.bayes.train(txt, message.attributes.state, function () {
            // Hum, what?
        });
    }
};

// Rates a message
BayesianFilter.rate = function (message) {
    var txt = BayesianFilter._prepare_text(message.attributes.title + " " + message.text());
    return BayesianFilter.bayes.classify(txt);
};

// Prepares the string in argument for the Bayes filter.
BayesianFilter._prepare_text = function (string) {
    var words =  $("<div/>").html(string.replace(/(<([^>]+)>)/ig, ' ')).text().replace(/[^a-zA-Z]+/g, ' ').toLowerCase().split(' ');
    words = _.compact(_.map(words, function (word) {
        if (word.length > 3) {
            return stemmer(word);
        }
    }));
    return words.join(" ");
};