var BayesianFilter = new function () {
    this.bayes = new brain.BayesianClassifier({
        backend: {
            type: 'localStorage',
            options: {
                name: 'emailspam'
            } 
        }
    }),
    
    // This loads all the recent messages and trains the filter
    this.load = function() {
        var archive = new Archive();
        archive.fetch({
            addIndividually: true,
            limit: 100
        })
        archive.bind("add", function(e) {
            
        }.bind(this));
        archive.bind("reset", function() {
            // This means that we're done loading all elements.
        })
    },
    
    this.train_with_message = function(message) {
        if(message.attributes.state == "up-ed" || message.attributes == "down-ed") {
            var txt = this.prepare_text(message.attributes.title + message.text());
            this.bayes.train(txt, message.attributes.state, function() {
                // Hum, what?
            });
        }
    },
    
    this.rate = function(message) {
        var txt = this.prepare_text(message.attributes.title + message.text());
        return BayesianFilter.bayes.classify(txt);
    },
    
    this.prepare_text = function(string) {
        var words = string.replace(/(<([^>]+)>)/ig,"").replace(/[^a-zA-Z]+/g,' ').toLowerCase().split(" ");
        words = _.compact(_.map(words, function(word) {
            if(word.length > 3) {
                return stemmer(word);
            }
        }));
        return words.join(" ");
    }
}