var auth;
var UserModel;
var GameModel;




var GAME_ERR_DB 			= -1;
var GAME_ERR_DB_SAVE		= -2;
var GAME_ERR_USERNOTFOUND	= -3;
var GAME_ERR_GETOBJECTID	= -4;
var GAME_ERR_GAMENOTFOUND	= -5;
var GAME_ERR_SUCCESSED		= 0;

var GAME_CREATE				= 1;
var GAME_JOIN				= 2;

function getObjectId(aEmail,cb){
	UserModel.findOne({email: aEmail},function(err,res){
		if(err){
			console.log("ERROR:DB findOne");
			cb(GAME_ERR_DB,null);
		} else if(!res) {
			console.log("ERROR:User doesn't existed");
			cb(GAME_ERR_USERNOTFOUND,null);
		} else {
			console.log("SUCCESSED:User found. id is " + res._id);
			cb(GAME_ERR_SUCCESSED,res);
		}
	});
}

function jsonFromGame(aGame,cb){
	var json = {
		"gameid":aGame._id,
		"owner":aGame.owner,
		"opponent":aGame.opponent,
		"turn":aGame.turn,
		"draw":aGame.draw,
		"question": {
			"word":aGame.question.word,
			"pinyin":aGame.question.pinyin,
			"paintrecord":aGame.question.paintrecord,
			"answerrecord":aGame.question.answerrecord
		}
	};
	
	cb(json);
}

function join(aGame,aUser,cb){
	aGame.opponent = aUser._id;
	aGame.state = 1;
	aGame.save(function(err){
		if(err){
			console.log("ERROR:DB Save");
			cb(GAME_ERR_DB_SAVE,null,null);
		} else {
			aUser.games.push(aGame._id);
			aUser.save(function(err){
				if(err){
					console.log("ERROR:DB Save");
					cb(GAME_ERR_DB_SAVE,null,null);
				} else {
					console.log("SUCCESSED:random game joined");
					cb(GAME_ERR_SUCCESSED,GAME_JOIN,aGame._id);
				}
			})
		}
	});
}

function create(aUser,cb){
	var newGame = new GameModel({
		state: 0,
		owner: aUser._id
	});
	newGame.save(function(err){
		if(err){
			console.log("ERROR:DB Save");
			cb(GAME_ERR_DB_SAVE,null,null);
		} else {
			aUser.games.push(newGame._id);
			aUser.save(function(err){
				if(err){
					console.log("ERROR:DB Save");
					cb(GAME_ERR_DB_SAVE,null,null);
				} else {
					console.log("SUCCESSED:random game created, waiting for another player");
					cb(GAME_ERR_SUCCESSED,GAME_CREATE,newGame._id);
				}
			})
		}
	});
}


function createRandomGame(aEmail,cb) {
	getObjectId(aEmail,function(err,user){
		if(err){
			console.log("ERROR:Can't get object id for email:" + email);
			cb(GAME_ERR_GETOBJECTID,null,null);
		} else {
			GameModel.findOne( { state: 0, owner: {'$ne': user._id} },function(err,res){
				if(err){
					console.log("ERROR:DB findOne");
					cb(GAME_ERR_DB,null,null);
				} else {
					if(res){
						console.log("SUCCESSED:try join game " + res);
						join(res,user,cb);
					} else {
						console.log("SUCCESSED:try create game " + res);
						create(user,cb);
					}
				}
			});		
		}
	})
}


function query(aGameId,cb){
	GameModel.findOne({_id:aGameId},function(err,game){
		if(err){
			console.log("ERROR:DB findOne");
			cb(GAME_ERR_DB,null);
		} else {
			console.log("SUCCESSED:game queried:" + game);
			cb(GAME_ERR_SUCCESSED,game);
		}
	});
}

exports.init = function(aAuth,aModels)
{
	auth = aAuth;
	UserModel = aModels.UserModel;
	GameModel = aModels.GameModel;
}


exports.random = function(req,res) {
	createRandomGame(req.body.email,function(err,method,gameid){
		if(err){
			res.send( { "result":false,"reason":err } );
		} else {
			res.send( { "result":true,"gameid":gameid,"method":method } );
		}
	});
}

exports.queryGame = function(req,res){
	if(!req.params.gid){
		res.send({"result":false,"reason":GAME_ERR_GAMENOTFOUND});
	} else {
		query(req.params.gid,function(err,game){
			if(err){
				res.send({"result":false,"reason":err});
			} else {
				jsonFromGame(game,function(json){
					res.send({"result":true,"game":json});
				})
			}
		})
	}
}