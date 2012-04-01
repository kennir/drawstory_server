require ('./db.js')



var UserSchema = new Schema({          
  email: {type: String, unique: true, lowercase: true, trim: true},
  username: String,
  password: String,
  joinedDate: {type: Date, default: Date.now},
  games: [ObjectId]
});

mongoose.model('Users', UserSchema);



var Question = { 
	word: String,
	pinyin: String,
	
	paintrecord: String,
	answerrecord: String,
}


/*
 *  state:
 *  0 = waiting for another player
 *  1 = waiting for owner paint 
 *  2 = painting uploaded,waiting for opponent answer
 *  3 = opponent answered 								== calculate result
 *  4 = waiting for opponent paint
 *  5 = painting uploaded,waiting for owner answer
 *  6 = owner answered									==  round over, goto state 1
 */
var GameSchema = new Schema({
	state: Number,	
	owner : ObjectId,
	opponent: ObjectId,
	createdate: { type: Date, default: Date.now },
	turn: { type: Number, default: 0 },		
	draw: { type: Number, min: 0, max: 1 },
	question: Question,
});


mongoose.model('Games', GameSchema);


var LexiconSchema = new Schema({
	word: String,
	pinyin: String,
	difficult: Number
});

mongoose.model('Lexicon',LexiconSchema);



exports.UserModel = mongoose.model('Users');
exports.GameModel = mongoose.model('Games');
