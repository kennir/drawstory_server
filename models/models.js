require ('./db.js')



var UserSchema = new Schema({          
  email: {type: String, unique: true, lowercase: true, trim: true},
  username: String,
  password: String,
  joinedDate: {type: Date, default: Date.now},
  games: [ObjectId]
});

mongoose.model('Users', UserSchema);

var Word = {
	difficult: Number,
	word: String,
	answer: String,
	prompt: String,
}

var Question = { 
	words: [Word],
	difficult:Number,	// difficult used
	replayid: ObjectId,	// Id of painting record
}


/*
 *  state:
 *  0 = waiting for another player
 *  1 = owner turn
 *  2 = opponent turn
 */
var GameSchema = new Schema({
	state: Number,	
	question: Question,
	turn: { type: Number, default: 0 },	
	owner : ObjectId,
	opponent: ObjectId,
	createdate: { type: Date, default: Date.now },
});


mongoose.model('Games', GameSchema);


var LexiconSchema = new Schema({
	difficult: Number,
	word: String,
	answer: String,
	prompt: String,
	random: { type: Number, default: Math.random() }
});

mongoose.model('Lexicon',LexiconSchema);


var ReplaySchema = new Schema({
	gameid: ObjectId,
	paintreplayoriginsize: Number,	// uncompressed size
	paintreplay: String,			// base64 encoded 
	solvereplayoriginsize: Number,
	solvereplay: String				// base64 encoded 
});

mongoose.model('Replays',ReplaySchema)


exports.UserModel = mongoose.model('Users');
exports.GameModel = mongoose.model('Games');
exports.LexiconModel = mongoose.model('Lexicon')
exports.ReplayModel = mongoose.model('Replays')

