var BayesianFilter = new function () {
    this.bayes = new brain.BayesianClassifier({
        backend: {
            type: 'localStorage',
            options: {
                name: 'msgboy-bayes-filter'
            } 
        }
    }),
    
    // This loads all the recent messages and trains the filter
    this.load = function() {
        // Nothing to do.
    },
    
    this.train_with_message = function(message) {
        if(message.attributes.state == "up-ed" || message.attributes.state == "down-ed") {
            var txt = this.prepare_text(message.attributes.title + " " + message.text());
            this.bayes.train(txt, message.attributes.state, function() {
                // Hum, what?
            });
        }
    },
    
    this.rate = function(message) {
        var txt = this.prepare_text(message.attributes.title + " " + message.text());
        return BayesianFilter.bayes.classify(txt);
    },
    
    this.prepare_text = function(string) {
        var words =  $("<div/>").html(string.replace(/(<([^>]+)>)/ig,' ')).text().replace(/[^a-zA-Z]+/g,' ').toLowerCase().split(' ');
        words = _.compact(_.map(words, function(word) {
            if(word.length > 3) {
                return stemmer(word);
            }
        }));
        return words.join(" ");
    }
}