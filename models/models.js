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
	paintingid: ObjectId,	// Id of painting record
	answeringid: ObjectId,	// paint turun if existed
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


var PaintingRecordSchema = new Schema({
	gameid: ObjectId,
	record: String,			// base64 encoded 
});

mongoose.model('PaintingRecords',PaintingRecordSchema)


exports.UserModel = mongoose.model('Users');
exports.GameModel = mongoose.model('Games');
exports.LexiconModel = mongoose.model('Lexicon')
exports.PaintingRecordModel = mongoose.model('PaintingRecords')

