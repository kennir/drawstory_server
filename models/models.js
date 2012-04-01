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
 *  1 = waiting draw-side get question
 *  2 = question got, waiting for playerA drawing
 *  3 = playerA uploaded painting,waiting for playerB get painting
 *  4 = painting got, waiting for playerB answering
 *  5 = playerB uploaded answering, 		// one turn over, go to 1
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


exports.UserModel = mongoose.model('Users');
exports.GameModel = mongoose.model('Games');
