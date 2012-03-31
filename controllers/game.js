var auth;
var UserModel;
var GameModel;

var GAME_ERR_DB 			= -1;
var GAME_ERR_DB_SAVE		= -2;
var GAME_ERR_USERNOTFOUND	= -3;
var GAME_ERR_GETOBJECTID	= -4;
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
	
}