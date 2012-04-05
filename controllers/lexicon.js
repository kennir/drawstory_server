var LexiconModel;

var LEX_SUCCESSED = 0;
var LEX_NULL 		= -1;

var DIFF_EASY = 0;
var DIFF_NORMAL = 1;
var DIFF_HARD = 2;

function generateOneForDifficult(diff,cb) {
	var rand = Math.random();
	LexiconModel.findOne({ difficult:diff, random:{ $gte: rand } }, function(err,word) {
		if(err) {
			console.log("ERROR:generateOneForDifficult Find One");
			cb(null);
		} else if (!word) {
			LexiconModel.findOne({ difficult:diff, random:{ $lte: rand } }, function(err2,word2) {
				if(err2) {
					console.log("ERROR:generateOneForDifficult Find One");
					cb(null);
				} else if(!word2) {
					console.log("ERROR:generateOneForDifficult can't find any word, can you import lexicon to mongo?");
					cb(null);
				} else {
					cb(word2);
				}
			})
		} else {
			cb(word);
		}
	})
}


exports.init = function(aModels) {
	LexiconModel = aModels.LexiconModel;
}

exports.generate = function(cb) {
	var words = new Array();
	generateOneForDifficult(DIFF_EASY,function(easyWord){
		if(!easyWord) {
			cb(LEX_NULL,null);
		} else {
			easyWord.random = null;
			words[DIFF_EASY] = easyWord;
			generateOneForDifficult(DIFF_NORMAL,function(normalWord){
				if(!normalWord) {
					 cb(LEX_NULL,null);
				} else {
					normalWord.random = null;
					words[DIFF_NORMAL] = normalWord;
					generateOneForDifficult(DIFF_HARD,function(hardWord){
						if(!hardWord) {
							cb(LEX_NULL,null);
						} else {
							hardWord.random = null;
							words[DIFF_HARD] = hardWord;
							cb(LEX_SUCCESSED,words);
						}
					})
				}
			})
		}
	})
}

