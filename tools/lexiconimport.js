var models = require('../models/models'),
	fs = require('fs');
var lexicon = JSON.parse(fs.readFileSync('lexicon.json', 'utf8'));
var LexiconModel = models.LexiconModel;


lexicon.forEach(function(w){
	var newWord = new LexiconModel({
		difficult:w.difficult,
		word:w.word,
		answer:w.answer,
		prompt:w.prompt,
		random:Math.random()
	});
	newWord.save(function(err){
		if(err) {
			console.log("ERR:Can't save lexicon");
		} else {
			console.log("Word:" + w.word + " saved");
		}
	})
})
